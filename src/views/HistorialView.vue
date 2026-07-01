<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCasosStore } from '../stores/casosStore'
import { useAlertStore } from '../stores/alertStore'
import { emergencias } from '../data/emergencias'
import { preguntasTerrenoCarabineros } from '../data/preguntasTerrenoCarabineros'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const casosStore = useCasosStore()
const alertStore = useAlertStore()

const mapContainer = ref(null)
let mapInstance = null
let victimMarker = null
let policeMarker = null
let routeLine = null
let policeInterval = null
let routeCoords = []
let refreshInterval = null

const pasoActual = ref(0)
const tiempoLlegada = ref('')
const mostrarPopup = ref(false)
const indiceActual = ref(0)

const pasos = [
  { label: 'Alerta Recibida', icon: '!' },
  { label: 'Policía en Camino', icon: '→' },
  { label: 'Destino', icon: '✓' },
]

const casoActivo = computed(() => {
  const rut = alertStore.perfil.rut
  if (!rut) return null
  const casos = casosStore.getCasosPorRut(rut)
    .filter(c => c.estado !== 'completada')
    .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
  return casos[0] || null
})

const preguntasPendientes = computed(() => {
  if (!casoActivo.value) return 0
  return (casoActivo.value.preguntasTerrenoPendientes || []).length
})

const contextoEnviado = computed(() => {
  if (!casoActivo.value) return false
  const resp = casoActivo.value.contexto?.respuestas || {}
  return Object.keys(resp).length > 0
})

const emergenciaInfo = computed(() => {
  if (!casoActivo.value?.emergencia) return null
  return casoActivo.value.emergencia
})

const mostrarContexto = ref(false)
const mostrarPreguntas = ref(false)
const respuestaPregunta = ref({})

const contextoRespuestas = computed(() => {
  if (!casoActivo.value) return []
  const respuestas = casoActivo.value.contexto?.respuestas || {}
  const preguntasMap = casoActivo.value.contexto?.preguntas || {}
  const respuestasTerreno = casoActivo.value.respuestasTerreno || {}

  const fullEmergencia = emergencias.find(e => e.titulo === casoActivo.value.emergencia?.titulo) || emergencias[0]

  const resultado = []
  for (const [key, valor] of Object.entries(respuestas)) {
    const texto = preguntasMap[key] || key
    const preguntaData = fullEmergencia?.preguntas?.find(p => p.id === key)
    const gif = preguntaData?.gif_lsch || fullEmergencia?.gif_lsch || null
    resultado.push({ texto, respuesta: valor, gif })
  }
  for (const [key, valor] of Object.entries(respuestasTerreno)) {
    const preguntaData = preguntasTerrenoCarabineros.find(p => p.id === Number(key))
    const texto = preguntaData?.pregunta_texto || key
    const gif = preguntaData?.gif_lsch || null
    resultado.push({ texto, respuesta: valor, gif })
  }
  return resultado
})

function clickPreguntas() {
  respuestaPregunta.value = {}
  mostrarPreguntas.value = true
}

function enviarRespuestasPreguntas() {
  const caso = casoActivo.value
  if (!caso) return
  const respuestas = {}
  for (const id of caso.preguntasTerrenoPendientes) {
    if (respuestaPregunta.value[id]) {
      respuestas[id] = respuestaPregunta.value[id]
    }
  }
  if (Object.keys(respuestas).length > 0) {
    casosStore.responderPreguntasTerreno(caso.id, respuestas)
  }
  mostrarPreguntas.value = false
}

watch(casoActivo, (nuevo) => {
  if (!nuevo && casosStore.casos.length > 0) {
    router.push({ name: 'home' })
  }
})

function getStorageKey(casoId) {
  return `police_idx_${casoId}`
}

function guardarIndice(casoId, idx) {
  try { localStorage.setItem(getStorageKey(casoId), String(idx)) } catch {}
}

function cargarIndice(casoId) {
  try { return parseInt(localStorage.getItem(getStorageKey(casoId)) || '0', 10) } catch { return 0 }
}

onMounted(() => {
  if (!alertStore.perfil.rut) {
    try {
      const data = JSON.parse(localStorage.getItem('perfil') || '{}')
      if (data.rut) alertStore.actualizarPerfil(data)
    } catch {}
  }
  casosStore.cargarCasos().then(() => {
    const caso = casoActivo.value
    if (!caso) {
      mostrarPopup.value = true
      return
    }

    const creado = new Date(caso.creadoEn).getTime()
    const elapsed = Date.now() - creado

    if (elapsed > 60000) {
      pasoActual.value = 2
      tiempoLlegada.value = 'Llegó'
      guardarIndice(caso.id, 999999)
      nextTick(() => initMap())
      return
    }

    pasoActual.value = 1
    nextTick(() => initMap())
  })

  refreshInterval = setInterval(() => {
    casosStore.cargarCasos()
  }, 5000)
})

onUnmounted(() => {
  if (policeInterval) clearInterval(policeInterval)
  if (refreshInterval) clearInterval(refreshInterval)
  if (mapInstance) { mapInstance.remove(); mapInstance = null }
})

function irAExplicar() {
  const caso = casoActivo.value
  if (caso?.emergencia) alertStore.setEmergencia(caso.emergencia)
  router.push({ name: 'triage' })
}

function cerrarPopup() {
  mostrarPopup.value = false
  router.push({ name: 'home' })
}

async function fetchRoute(fromLat, fromLng, toLat, toLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.routes?.length > 0) {
      return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]])
    }
  } catch {}
  return null
}

async function initMap() {
  if (!mapContainer.value || mapInstance) return
  const caso = casoActivo.value
  if (!caso) return

  const victimLat = caso.lat || -33.4489
  const victimLng = caso.lng || -70.6693
  const policeLat = victimLat + 0.015
  const policeLng = victimLng + 0.01

  mapInstance = L.map(mapContainer.value, {
    zoomControl: false, attributionControl: false,
    dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance)

  const victimIcon = L.divIcon({
    className: 'victim-icon',
    html: `<div style="width:26px;height:26px;background:#10b981;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.35);position:relative">
      <div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(16,185,129,0.3);animation:pulse-victim 2s infinite"></div>
    </div>`,
    iconSize: [26, 26], iconAnchor: [13, 13],
  })

  const policeIcon = L.divIcon({
    className: 'police-icon',
    html: `<div style="width:30px;height:30px;background:#f59e0b;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.3l.7.7L12 18l6.8 3 .7-.7L12 2z"/></svg>
    </div>`,
    iconSize: [30, 30], iconAnchor: [15, 15],
  })

  victimMarker = L.marker([victimLat, victimLng], { icon: victimIcon }).addTo(mapInstance)
  policeMarker = L.marker([policeLat, policeLng], { icon: policeIcon }).addTo(mapInstance)

  const route = await fetchRoute(policeLat, policeLng, victimLat, victimLng)

  if (route && route.length > 1) {
    routeCoords = route
    routeLine = L.polyline(route, {
      color: '#f59e0b', weight: 4, opacity: 0.7, dashArray: '8, 12', lineCap: 'round',
    }).addTo(mapInstance)
    mapInstance.fitBounds(L.latLngBounds(route), { padding: [50, 50] })
  } else {
    routeCoords = [[policeLat, policeLng], [victimLat, victimLng]]
    mapInstance.fitBounds(L.latLngBounds([[victimLat, victimLng], [policeLat, policeLng]]), { padding: [60, 60] })
  }

  startPoliceMovement()
}

function startPoliceMovement() {
  if (policeInterval) clearInterval(policeInterval)
  if (routeCoords.length < 2) return

  const caso = casoActivo.value
  const totalPoints = routeCoords.length - 1
  const duracionTotal = 60000
  const stepMs = duracionTotal / totalPoints

  let idx = cargarIndice(caso.id)
  if (idx >= totalPoints) {
    idx = totalPoints
    pasoActual.value = 2
    tiempoLlegada.value = 'Llegó'
    policeMarker.setLatLng(routeCoords[idx])
    return
  }

  indiceActual.value = idx
  policeMarker.setLatLng(routeCoords[idx])

  const remaining = totalPoints - idx
  const mins = Math.max(1, Math.round(remaining * stepMs / 60000))
  tiempoLlegada.value = `~${mins} min`

  if (idx >= totalPoints * 0.6) pasoActual.value = 2

  policeInterval = setInterval(() => {
    if (!policeMarker || !mapInstance) return

    idx++
    indiceActual.value = idx
    guardarIndice(caso.id, idx)

    if (idx >= routeCoords.length) {
      clearInterval(policeInterval)
      pasoActual.value = 2
      tiempoLlegada.value = 'Llegó'
      return
    }

    policeMarker.setLatLng(routeCoords[idx])

    const rem = routeCoords.length - 1 - idx
    const m = Math.max(1, Math.round(rem * stepMs / 60000))
    tiempoLlegada.value = `~${m} min`

    if (idx >= totalPoints * 0.6) pasoActual.value = 2
  }, stepMs)
}
</script>

<template>
  <div class="mobile-phone-frame page estado-view">
    <header class="estado-header">
      <button class="back-btn" @click="router.push('/victim')" aria-label="Volver">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
      </button>
      <div class="header-center">
        <span class="brand-tag">Carabineros de Chile</span>
        <h1>ESTADO</h1>
      </div>
      <div class="header-right">
        <div v-if="preguntasPendientes > 0" class="preguntas-badge">
          <span>!</span>
        </div>
        <img
          class="escudo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Roundel_of_Carabineros_de_Chile.svg/250px-Roundel_of_Carabineros_de_Chile.svg.png"
          alt="Carabineros"
        />
      </div>
    </header>

    <div v-if="contextoEnviado && casoActivo && !mostrarPopup" class="fab-group">
      <div class="contexto-fab" @click="mostrarContexto = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="20" height="20">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="15" y2="17"/>
        </svg>
      </div>
      <div v-if="preguntasPendientes > 0" class="preguntas-fab" @click="clickPreguntas">
        <span class="preguntas-fab-icon">!</span>
      </div>
    </div>

    <div v-if="mostrarPreguntas && casoActivo" class="contexto-modal-mask" @click="mostrarPreguntas = false">
      <div class="contexto-modal" @click.stop>
        <div class="contexto-modal-head">
          <h2>Preguntas de Policía</h2>
          <button @click="mostrarPreguntas = false">×</button>
        </div>
        <div class="contexto-modal-body">
          <div v-for="pid in casoActivo.preguntasTerrenoPendientes" :key="pid" class="pregunta-item">
            <img
              v-if="preguntasTerrenoCarabineros.find(p => p.id === pid)?.gif_lsch"
              :src="preguntasTerrenoCarabineros.find(p => p.id === pid).gif_lsch"
              class="pregunta-gif"
              :alt="preguntasTerrenoCarabineros.find(p => p.id === pid)?.pregunta_texto"
            />
            <span class="pregunta-texto">{{ preguntasTerrenoCarabineros.find(p => p.id === pid)?.pregunta_texto || pid }}</span>
            <div class="pregunta-opciones">
              <button
                v-for="op in (preguntasTerrenoCarabineros.find(p => p.id === pid)?.opciones || [])"
                :key="op"
                class="pregunta-opcion"
                :class="{ selected: respuestaPregunta[pid] === op }"
                @click="respuestaPregunta[pid] = op"
              >
                {{ op }}
              </button>
            </div>
          </div>
          <button class="pregunta-enviar" :disabled="Object.keys(respuestaPregunta).length === 0" @click="enviarRespuestasPreguntas">
            Enviar respuestas
          </button>
        </div>
      </div>
    </div>

    <div v-if="mostrarContexto && casoActivo" class="contexto-modal-mask" @click="mostrarContexto = false">
      <div class="contexto-modal" @click.stop>
        <div class="contexto-modal-head">
          <h2>Tus respuestas</h2>
          <button @click="mostrarContexto = false">×</button>
        </div>
        <div class="contexto-modal-body">
          <div v-for="(item, i) in contextoRespuestas" :key="i" class="contexto-rta-row">
            <div class="contexto-rta-col">
              <span class="contexto-rta-k">{{ item.texto }}</span>
              <img v-if="item.gif" class="contexto-rta-gif" :src="item.gif" :alt="item.texto" />
            </div>
            <div class="contexto-rta-col">
              <span class="contexto-rta-v">{{ item.respuesta }}</span>
              <img v-if="item.gif" class="contexto-rta-gif" :src="item.gif" :alt="item.respuesta" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="casoActivo && !mostrarPopup" class="caso-detalle">
      <div class="steps-bar">
        <div
          v-for="(paso, i) in pasos"
          :key="i"
          class="step-item"
          :class="{ active: i <= pasoActual, current: i === pasoActual }"
        >
          <div class="step-circle">{{ paso.icon }}</div>
          <span class="step-label">{{ paso.label }}</span>
          <div v-if="i < pasos.length - 1" class="step-line" :class="{ filled: i < pasoActual }"></div>
        </div>
      </div>

      <div class="tiempo-bar" v-if="pasoActual > 0 && pasoActual < 2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>Llegada estimada: <strong>{{ tiempoLlegada }}</strong></span>
      </div>
      <div class="tiempo-bar arrived" v-if="pasoActual === 2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span><strong>Policía en el destino</strong></span>
      </div>

      <div ref="mapContainer" class="map-container"></div>

      <div class="detalle-acciones">
        <button class="btn-explicar" @click="irAExplicar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          EXPLICAR
        </button>
      </div>
    </div>

    <div v-else-if="!mostrarPopup" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      <p>No hay emergencia en proceso</p>
    </div>

    <div v-if="mostrarPopup" class="popup-mask" @click="cerrarPopup">
      <div class="popup-card" @click.stop>
        <div class="popup-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2>No hay emergencia activa</h2>
        <p>No hay ninguna emergencia en proceso.</p>
        <button class="popup-btn" @click="cerrarPopup">INICIO</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-victim {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0; }
}

.mobile-phone-frame {
  width: 100%;
  max-width: 450px;
  height: 100vh;
  max-height: 850px;
  position: relative;
  overflow: hidden;
  background: #f8faf9;
  border: 4px solid #1a1a2e;
  border-radius: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.estado-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8faf9;
}

.estado-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0;
  background: linear-gradient(160deg, #0a4a2e 0%, #006F3E 100%);
  color: #fff;
  flex-shrink: 0;
}

.back-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  backdrop-filter: blur(8px);
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.92);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-tag {
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.estado-header h1 {
  margin: 2px 0 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 1px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preguntas-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f59e0b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.5);
  animation: badge-pulse 1.5s infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.escudo {
  height: 44px;
  width: auto;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
}

.contexto-fab {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(16,185,129,0.4);
  cursor: pointer;
  transition: transform .2s;
}

.contexto-fab:hover {
  transform: scale(1.1);
}

.preguntas-fab {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(239,68,68,0.4);
  cursor: pointer;
  transition: transform .2s;
}

.preguntas-fab:hover {
  transform: scale(1.1);
}

.preguntas-fab-icon {
  color: white;
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  animation: pulse-badge 2s infinite;
}

.fab-group {
  position: absolute;
  top: 170px;
  right: 12px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@keyframes pulse-badge {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.contexto-modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.contexto-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 320px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.contexto-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.contexto-modal-head h2 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
  color: #111827;
}

.contexto-modal-head button {
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contexto-modal-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
}

.contexto-rta-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f3f4f6;
}

.contexto-rta-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.contexto-rta-gif {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.contexto-rta-k {
  font-weight: 700;
  color: #6b7280;
  font-size: 11px;
  text-align: center;
}

.contexto-rta-v {
  font-weight: 800;
  color: #111827;
  font-size: 13px;
  text-align: center;
}

.contexto-modal-gif-chico {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  align-self: center;
  margin-top: 4px;
}

.pregunta-gif {
  width: 100%;
  max-height: 160px;
  object-fit: contain;
  border-radius: 10px;
  background: #f3f4f6;
}

.pregunta-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.pregunta-texto {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.pregunta-opciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pregunta-opcion {
  padding: 8px 16px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

.pregunta-opcion.selected {
  border-color: #006F3E;
  background: #ecfdf5;
  color: #065f46;
}

.pregunta-enviar {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #006F3E;
  color: white;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 8px;
}

.pregunta-enviar:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.caso-detalle {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.steps-bar {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 16px 16px 8px;
  background: #fff;
  gap: 0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  transition: all 0.4s ease;
  z-index: 1;
}

.step-item.active .step-circle {
  background: #006F3E;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 111, 62, 0.3);
}

.step-item.current .step-circle {
  animation: step-pulse 1.5s infinite;
}

@keyframes step-pulse {
  0%, 100% { box-shadow: 0 2px 8px rgba(0, 111, 62, 0.3); }
  50% { box-shadow: 0 2px 16px rgba(0, 111, 62, 0.6); }
}

.step-label {
  font-size: 9px;
  font-weight: 700;
  color: #9ca3af;
  text-align: center;
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.step-item.active .step-label {
  color: #006F3E;
}

.step-line {
  position: absolute;
  top: 16px;
  left: calc(50% + 20px);
  width: calc(100% - 40px);
  height: 2px;
  background: #e5e7eb;
  z-index: 0;
}

.step-line.filled {
  background: #006F3E;
}

.tiempo-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fffbeb;
  border-bottom: 1px solid #fde68a;
  font-size: 13px;
  color: #92400e;
  font-weight: 600;
}

.tiempo-bar.arrived {
  background: #ecfdf5;
  border-bottom-color: #a7f3d0;
  color: #065f46;
}

.tiempo-bar svg {
  flex-shrink: 0;
}

.map-container {
  flex: 1;
  width: 100%;
  min-height: 250px;
}

.detalle-acciones {
  padding: 12px 20px 28px;
  background: #fff;
}

.btn-explicar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  background: #006F3E;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-explicar:active {
  transform: scale(0.98);
}

.btn-explicar svg {
  width: 22px;
  height: 22px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  gap: 12px;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.popup-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 32px;
}

.popup-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  max-width: 300px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: popup-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popup-in {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.popup-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fef3c7;
  color: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.popup-icon svg {
  width: 32px;
  height: 32px;
}

.popup-card h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
}

.popup-card p {
  margin: 0 0 24px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.popup-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #006F3E;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.popup-btn:active {
  transform: scale(0.98);
}
</style>
