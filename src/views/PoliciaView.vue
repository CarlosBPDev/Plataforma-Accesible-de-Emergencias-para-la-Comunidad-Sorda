<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCasosStore } from '../stores/casosStore'
import { preguntasTerrenoCarabineros } from '../data/preguntasTerrenoCarabineros'

const router = useRouter()
const store = useCasosStore()

const casoSeleccionado = ref(null)

const selectorAbierto = ref(false)
const casoParaSelector = ref(null)
const preguntasSeleccionadas = ref([])

function abrirSelectorPreguntas(caso) {
  casoParaSelector.value = caso
  preguntasSeleccionadas.value = []
  selectorAbierto.value = true
}

function cerrarSelector() {
  selectorAbierto.value = false
  casoParaSelector.value = null
}

function togglePreguntaSel(id) {
  const idx = preguntasSeleccionadas.value.indexOf(id)
  if (idx === -1) {
    preguntasSeleccionadas.value.push(id)
  } else {
    preguntasSeleccionadas.value.splice(idx, 1)
  }
}

function abrirCaso(caso) {
  casoSeleccionado.value = caso
}

function cerrarCaso() {
  casoSeleccionado.value = null
}

function marcarComoLista() {
  if (casoSeleccionado.value) {
    store.completarCaso(casoSeleccionado.value.id, { nota: 'Cerrado en terreno por carabinero.' })
    cerrarCaso()
  }
}

function enviarPreguntas() {
  if (!casoParaSelector.value || preguntasSeleccionadas.value.length === 0) return
  store.enviarPreguntasTerreno(casoParaSelector.value.id, preguntasSeleccionadas.value)
  cerrarSelector()
}

const preguntasFiltradas = computed(() => {
  if (!casoParaSelector.value) return []
  const cat = casoParaSelector.value.emergencia?.titulo
  return preguntasTerrenoCarabineros.filter(p => p.categoria === 'todas' || p.categoria === cat)
})

function badgeColor(estado) {
  if (estado === 'asignada') return '#1565c0'
  if (estado === 'en_terreno') return '#f57c00'
  return '#2e7d32'
}
function badgeBg(estado) {
  if (estado === 'asignada') return '#e3f2fd'
  if (estado === 'en_terreno') return '#fff3e0'
  return '#e8f5e9'
}
function badgeLabel(estado) {
  if (estado === 'asignada') return 'Asignado'
  if (estado === 'en_terreno') return 'En terreno'
  return 'Completado'
}
</script>

<template>
  <div class="policia">
    <header class="policia-header">
      <div class="policia-top">
        <h1>Carabinero</h1>
        <span class="policia-badge">{{ store.casosAsignados.length + store.casosCompletados.length }} casos</span>
      </div>
      <p class="policia-sub">Órdenes y detalles para terreno</p>
    </header>

    <!-- Casos activos -->
    <div v-if="store.casosAsignados.length" class="p-s">
      <h2 class="p-s-tit">Activos</h2>
      <div v-for="c in store.casosAsignados" :key="c.id" class="caso-card">
        <div class="caso-top">
          <span class="caso-emerg" :style="{ color: c.emergencia?.color }">
            {{ c.emergencia?.titulo || 'Emergencia' }}
          </span>
          <span
            class="caso-estado"
            :style="{ background: badgeBg(c.estado), color: badgeColor(c.estado) }"
          >
            {{ badgeLabel(c.estado) }}
          </span>
        </div>

        <div class="caso-body">
          <div class="caso-info">
            <span class="caso-label">Víctima</span>
            <span class="caso-valor">{{ c.victimNombre || '—' }}</span>
          </div>
          <div class="caso-info" v-if="c.contexto?.ubicacion">
            <span class="caso-label">Ubicación</span>
            <span class="caso-valor">{{ c.contexto.ubicacion }}</span>
          </div>
          <div class="caso-info" v-if="c.asignados?.length">
            <span class="caso-label">Asignados</span>
            <span class="caso-valor">{{ c.asignados.join(', ') }}</span>
          </div>
        </div>

        <div class="caso-ctx" v-if="Object.keys(c.contexto?.respuestas || {}).length">
          <span class="caso-label">Antecedentes:</span>
          <div v-for="(v, k) in c.contexto.respuestas" :key="k" class="caso-rta">
            <span class="caso-rta-k">{{ c.contexto.preguntas?.[k] || k }}</span>
            <span class="caso-rta-v">{{ v }}</span>
          </div>
        </div>

        <div class="caso-actions">
          <button class="btn-detalles" @click="abrirCaso(c)">Ver detalles</button>
          <button class="btn-terreno" @click="abrirSelectorPreguntas(c)">
            Preguntar a distancia
          </button>
          <button
            v-if="c.estado === 'asignada'"
            class="btn-terreno btn-llegada"
            @click="store.marcarEnTerreno(c.id)"
          >
            Marcar "He llegado"
          </button>
        </div>
      </div>
    </div>

    <div v-else class="p-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3z" />
      </svg>
      <p>No tienes casos asignados</p>
    </div>

    <!-- Casos completados -->
    <div v-if="store.casosCompletados.length" class="p-s">
      <h2 class="p-s-tit">Completados</h2>
      <div v-for="c in store.casosCompletados" :key="c.id" class="caso-card completado">
        <div class="caso-top">
          <span class="caso-emerg" :style="{ color: c.emergencia?.color }">
            {{ c.emergencia?.titulo || 'Emergencia' }}
          </span>
          <span class="caso-estado" :style="{ background: badgeBg(c.estado), color: badgeColor(c.estado) }">
            {{ badgeLabel(c.estado) }}
          </span>
        </div>
        <div class="caso-body">
          <div class="caso-info">
            <span class="caso-label">Víctima</span>
            <span class="caso-valor">{{ c.victimNombre || '—' }}</span>
          </div>
          <div class="caso-info">
            <span class="caso-label">Fecha</span>
            <span class="caso-valor">{{ new Date(c.actualizadoEn).toLocaleString('es-CL', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Selector de Preguntas -->
    <div v-if="selectorAbierto && casoParaSelector" class="selector-mask" @click.self="cerrarSelector">
      <div class="selector-modal">
        <div class="selector-head">
          <h2>Seleccionar preguntas</h2>
          <button class="selector-cerrar" @click="cerrarSelector">×</button>
        </div>

        <p class="selector-sub">Elige las preguntas que quieres enviar a la víctima:</p>

        <div class="selector-lista">
          <label
            v-for="p in preguntasFiltradas"
            :key="p.id"
            class="selector-item"
            :class="{ active: preguntasSeleccionadas.includes(p.id) }"
          >
            <input
              type="checkbox"
              :checked="preguntasSeleccionadas.includes(p.id)"
              @change="togglePreguntaSel(p.id)"
            />
            <span class="selector-txt">{{ p.pregunta_texto }}</span>
          </label>
        </div>

        <div class="selector-footer">
          <button class="selector-enviar" :disabled="preguntasSeleccionadas.length === 0" @click="enviarPreguntas">
            Enviar ({{ preguntasSeleccionadas.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detalle del Caso -->
    <div v-if="casoSeleccionado" class="detalle-mask" @click.self="cerrarCaso">
      <div class="detalle">
        <div class="detalle-head-sticky">
          <div class="detalle-head">
            <h2>Detalle del caso</h2>
            <button class="detalle-cerrar" @click="cerrarCaso">×</button>
          </div>
        </div>
        <div class="detalle-body">
          <div>
            <span class="d-label">Víctima</span>
            <div class="d-value">{{ casoSeleccionado.victimNombre || '—' }}</div>
            <div class="d-sub">RUT: {{ casoSeleccionado.victimRut || '—' }}</div>
          </div>
          <div>
            <span class="d-label">Teléfono</span>
            <div class="d-value">{{ casoSeleccionado.victimTelefono || '—' }}</div>
          </div>
          <div>
            <span class="d-label">Ubicación</span>
            <div class="d-value">{{ casoSeleccionado.contexto?.ubicacion || '—' }}</div>
          </div>
          <div>
            <span class="d-label">Contacto de emergencia</span>
            <div class="d-value">{{ casoSeleccionado.victimContactoNombre || '—' }}</div>
            <div class="d-sub">{{ casoSeleccionado.victimContactoTelefono || '—' }}</div>
          </div>
          <div>
            <span class="d-label">Contacto vía central</span>
            <div class="d-value">{{ casoSeleccionado.contactoEstado === 'contactado' ? 'Contactado' : casoSeleccionado.contactoEstado === 'sin_respuesta' ? 'Sin respuesta' : '—' }}</div>
            <div class="d-sub" v-if="casoSeleccionado.contactoNotas">{{ casoSeleccionado.contactoNotas }}</div>
          </div>
          <div>
            <span class="d-label">Comisaría cercana</span>
            <div class="d-value d-small">{{ casoSeleccionado.comisariaCercana || '—' }}</div>
          </div>
          <div v-if="casoSeleccionado.serviciosExternos?.length">
            <span class="d-label">Servicios contactados</span>
            <div v-for="s in casoSeleccionado.serviciosExternos.filter(s => s.contactado)" :key="s.servicio" class="d-value d-small">
              {{ s.servicio }}
            </div>
            <div v-if="!casoSeleccionado.serviciosExternos.some(s => s.contactado)" class="d-sub">
              Ninguno
            </div>
          </div>

          <!-- Nota del operador -->
          <div v-if="casoSeleccionado.notaOperador" class="detalle-nota-op">
            <span class="d-label">Nota de central</span>
            <div class="d-value d-small nota-texto">{{ casoSeleccionado.notaOperador }}</div>
          </div>

          <div class="detalle-ctx">
          <span class="d-label">Contexto</span>
          <div v-for="(v, k) in casoSeleccionado.contexto?.respuestas || {}" :key="k" class="d-row">
            <span class="d-key">{{ casoSeleccionado.contexto?.preguntas?.[k] || k }}</span>
            <span class="d-val">{{ v }}</span>
          </div>
        </div>

        <div v-if="Object.keys(casoSeleccionado.respuestasTerreno || {}).length" class="detalle-terreno">
          <span class="d-label">Respuestas recibidas en terreno</span>
          <div v-for="(v, k) in casoSeleccionado.respuestasTerreno" :key="k" class="d-row">
            <span class="d-key">{{ preguntasTerrenoCarabineros.find(p => p.id === Number(k))?.pregunta_texto || k }}</span>
            <span class="d-val">{{ v }}</span>
          </div>
        </div>
        </div>

        <!-- Footer -->
        <div class="detalle-footer">
          <button class="btn-cerrar-caso" @click="marcarComoLista">
            Marcar como listo / cerrar caso
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.policia {
  min-height: 100dvh;
  background: #f5f7fa;
  padding: 16px;
}

.policia-header {
  margin-bottom: 16px;
}

.policia-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.policia-top h1 {
  flex: 1;
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  color: #222;
}

.policia-badge {
  font-size: 12px;
  font-weight: 700;
  color: #888;
  background: #eee;
  padding: 4px 10px;
  border-radius: 12px;
}

.policia-sub {
  font-size: 14px;
  color: #999;
  font-weight: 600;
  margin: 4px 0 0;
}

.p-s {
  margin-bottom: 20px;
}

.p-s-tit {
  font-size: 12px;
  font-weight: 800;
  color: #bbb;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 10px;
}

.p-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  color: #bbb;
  font-size: 15px;
  font-weight: 600;
}

.p-empty svg { width: 48px; height: 48px; }

.caso-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.completado {
  opacity: 0.75;
}

.caso-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.caso-emerg {
  font-size: 15px;
  font-weight: 800;
}

.caso-estado {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 10px;
}

.caso-body {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 8px;
}

.caso-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.caso-label {
  font-size: 10px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.caso-valor {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.caso-ctx {
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.caso-rta {
  display: flex;
  gap: 6px;
  font-size: 13px;
}

.caso-rta-k {
  font-weight: 700;
  color: #888;
  min-width: 36px;
}

.caso-rta-v {
  font-weight: 600;
  color: #333;
}

.caso-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.btn-detalles {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  font-size: 14px;
  font-weight: 700;
  color: #333;
  cursor: pointer;
}

.btn-terreno {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  background: #1b5e20;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.btn-terreno:active { transform: scale(0.97); }

.detalle-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.detalle {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -10px 24px rgba(0,0,0,0.15);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.detalle-head-sticky {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
  border-radius: 16px 16px 0 0;
}

.detalle-body {
  padding: 0 16px 16px;
  overflow-y: auto;
  flex: 1;
}

.detalle-footer {
  position: sticky;
  bottom: 0;
  background: #fff;
  padding: 12px 16px;
  border-top: 1px solid #eee;
}

.btn-cerrar-caso {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #1565c0;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.btn-cerrar-caso:active {
  transform: scale(0.98);
}

.detalle-nota-op {
  margin-top: 16px;
  padding: 12px;
  background: #fff8e1;
  border-radius: 12px;
  border: 1px solid #ffe082;
}

.nota-texto {
  font-size: 13px !important;
  color: #6d4c00 !important;
  font-weight: 700 !important;
  margin-top: 4px;
  white-space: pre-wrap;
}

.detalle-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 10px;
}

.detalle-head h2 {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}

.detalle-cerrar {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f1f1f1;
  font-size: 20px;
  cursor: pointer;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.d-label {
  font-size: 10px;
  font-weight: 800;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.d-value {
  font-size: 14px;
  font-weight: 800;
  color: #222;
}

.d-sub {
  font-size: 12px;
  color: #777;
  font-weight: 600;
}

.d-small {
  font-size: 12px;
  font-weight: 700;
}

.detalle-ctx,
.detalle-terreno {
  margin-top: 16px;
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.d-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.d-key {
  font-size: 12px;
  font-weight: 700;
  color: #555;
}

.d-val {
  font-size: 12px;
  font-weight: 700;
  color: #222;
}

/* Modal selector preguntas */
.selector-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.selector-modal {
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.selector-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
  flex-shrink: 0;
}

.selector-head h2 {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  color: #222;
}

.selector-cerrar {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f1f1f1;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selector-sub {
  font-size: 14px;
  color: #666;
  margin: 8px 20px 12px;
  padding: 0;
}

.selector-lista {
  padding: 0 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selector-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1.5px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.selector-item.active {
  border-color: #1565c0;
  background: rgba(21, 101, 192, 0.05);
}

.selector-item input {
  accent-color: #1565c0;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.selector-txt {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  line-height: 1.3;
}

.selector-footer {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.selector-enviar {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #1565c0;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.selector-enviar:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.selector-enviar:active:not(:disabled) {
  transform: scale(0.97);
}
</style>
