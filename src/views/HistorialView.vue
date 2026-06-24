<script setup>
import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCasosStore } from '../stores/casosStore'
import { useAlertStore } from '../stores/alertStore'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const casosStore = useCasosStore()
const alertStore = useAlertStore()

const selectedCasoId = ref(null)
const mapContainer = ref(null)
let mapInstance = null
let victimMarker = null
let policeMarker = null
let policeInterval = null

onMounted(() => {
  if (!alertStore.perfil.rut) {
    try {
      const data = JSON.parse(localStorage.getItem('perfil') || '{}')
      if (data.rut) alertStore.actualizarPerfil(data)
    } catch {}
  }
  casosStore.cargarCasos()
})

onUnmounted(() => {
  if (policeInterval) clearInterval(policeInterval)
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

const misCasos = computed(() => {
  const rut = alertStore.perfil.rut
  if (!rut) return []
  return casosStore.getCasosPorRut(rut).sort(
    (a, b) => new Date(b.creadoEn) - new Date(a.creadoEn)
  )
})

const casoSeleccionado = computed(() => {
  if (!selectedCasoId.value) return null
  return casosStore.getCasoPorId(selectedCasoId.value)
})

function seleccionarCaso(id) {
  selectedCasoId.value = id
  nextTick(() => {
    initMap()
    startPoliceMovement()
  })
}

function volverALista() {
  selectedCasoId.value = null
  if (policeInterval) clearInterval(policeInterval)
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
}

function irAExplicar() {
  const caso = casoSeleccionado.value
  if (caso?.emergencia) {
    alertStore.setEmergencia(caso.emergencia)
  }
  router.push({ name: 'triage' })
}

function initMap() {
  if (!mapContainer.value || mapInstance) return

  const caso = casoSeleccionado.value
  if (!caso) return

  const victimLat = caso.lat || -33.4489
  const victimLng = caso.lng || -70.6693
  const policeLat = victimLat + 0.015
  const policeLng = victimLng + 0.01

  mapInstance = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(mapInstance)

  const victimIcon = L.divIcon({
    className: 'victim-icon',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: #10b981;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  const policeIcon = L.divIcon({
    className: 'police-icon',
    html: `<div style="
      width: 28px;
      height: 28px;
      background: #f59e0b;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L4.5 20.3l.7.7L12 18l6.8 3 .7-.7L12 2z"/>
      </svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

  victimMarker = L.marker([victimLat, victimLng], { icon: victimIcon }).addTo(mapInstance)
  policeMarker = L.marker([policeLat, policeLng], { icon: policeIcon }).addTo(mapInstance)

  const bounds = L.latLngBounds([
    [victimLat, victimLng],
    [policeLat, policeLng],
  ])
  mapInstance.fitBounds(bounds, { padding: [60, 60] })
}

function startPoliceMovement() {
  if (policeInterval) clearInterval(policeInterval)

  const caso = casoSeleccionado.value
  if (!caso) return

  const victimLat = caso.lat || -33.4489
  const victimLng = caso.lng || -70.6693

  let currentPoliceLat = victimLat + 0.015
  let currentPoliceLng = victimLng + 0.01
  let steps = 0
  const totalSteps = 10

  policeInterval = setInterval(() => {
    if (!policeMarker || !mapInstance) return

    steps++
    const progress = steps / totalSteps
    currentPoliceLat = victimLat + 0.015 * (1 - progress)
    currentPoliceLng = victimLng + 0.01 * (1 - progress)

    policeMarker.setLatLng([currentPoliceLat, currentPoliceLng])

    if (steps >= totalSteps) {
      clearInterval(policeInterval)
    }
  }, 3000)
}

const estadoColor = (estado) => {
  switch (estado) {
    case 'recibida': return '#f59e0b'
    case 'aceptada': return '#3b82f6'
    case 'asignada': return '#8b5cf6'
    case 'en_terreno': return '#10b981'
    case 'completada': return '#6b7280'
    default: return '#6b7280'
  }
}
</script>

<template>
  <div class="page historial">
    <header class="historial-header">
      <button class="back-btn" @click="router.push('/victim')" aria-label="Volver">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
      </button>
      <h1>MI CASO</h1>
      <div class="header-spacer"></div>
    </header>

    <div v-if="!selectedCasoId" class="casos-lista">
      <div v-if="misCasos.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <p>Sin alertas</p>
      </div>

      <div
        v-for="caso in misCasos"
        :key="caso.id"
        class="caso-card"
        @click="seleccionarCaso(caso.id)"
      >
        <div class="caso-color" :style="{ background: estadoColor(caso.estado) }"></div>
        <div class="caso-content">
          <div class="caso-estado">
            <span class="caso-dot" :style="{ background: estadoColor(caso.estado) }"></span>
          </div>
          <div class="caso-hora">
            {{ new Date(caso.creadoEn).toLocaleString('es-CL', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) }}
          </div>
        </div>
        <svg class="caso-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>

    <div v-else class="caso-detalle">
      <div class="detalle-header">
        <button class="volver-btn" @click="volverALista">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div class="estado-dot" :style="{ background: estadoColor(casoSeleccionado.estado) }"></div>
        <span class="estado-texto">en camino</span>
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
  </div>
</template>

<style scoped>
.historial {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8faf9;
}

.historial-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(160deg, #0a4a2e 0%, #006F3E 100%);
  color: #fff;
  flex-shrink: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.back-btn svg, .volver-btn svg {
  width: 20px;
  height: 20px;
}

.historial-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
}

.header-spacer {
  width: 40px;
}

.casos-lista {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.caso-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
}

.caso-card:active {
  transform: scale(0.98);
}

.caso-color {
  width: 4px;
  height: 40px;
  border-radius: 2px;
}

.caso-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.caso-estado {
  display: flex;
  align-items: center;
  gap: 8px;
}

.caso-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.caso-hora {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  margin-left: 18px;
}

.caso-arrow {
  width: 20px;
  height: 20px;
  color: #d1d5db;
}

.caso-detalle {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detalle-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.volver-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.estado-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.estado-texto {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  text-transform: lowercase;
}

.map-container {
  flex: 1;
  width: 100%;
  min-height: 300px;
}

.detalle-acciones {
  padding: 16px 20px 32px;
}

.btn-explicar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 18px;
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
</style>
