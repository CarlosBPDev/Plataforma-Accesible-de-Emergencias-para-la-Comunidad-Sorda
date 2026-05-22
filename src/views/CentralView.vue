<script setup>
import { computed, ref } from 'vue'
import { useCasosStore } from '../stores/casosStore'

const store = useCasosStore()

const filtro = ref('pendientes')
const casoSeleccionado = ref(null)
const contactoNotas = ref('')
const carabinerosSeleccionados = ref([])

const lista = computed(() => {
  if (filtro.value === 'pendientes') return store.casosDisponibles
  if (filtro.value === 'asignados') return store.casosAsignados
  if (filtro.value === 'completados') return store.casosCompletados
  return store.casos
})

function seleccionarCaso(caso) {
  casoSeleccionado.value = caso
  contactoNotas.value = caso.contactoNotas || ''
  carabinerosSeleccionados.value = []
}

function aceptar() {
  if (!casoSeleccionado.value) return
  store.aceptarCaso(casoSeleccionado.value.id)
}

function asignarSeleccionados() {
  if (!casoSeleccionado.value) return
  carabinerosSeleccionados.value.forEach(nombre => {
    store.asignarCarabinero(casoSeleccionado.value.id, nombre)
  })
  carabinerosSeleccionados.value = []
}

function quitar(nombre) {
  if (!casoSeleccionado.value) return
  store.quitarCarabinero(casoSeleccionado.value.id, nombre)
}

function toggleCarabineroSel(nombre) {
  const idx = carabinerosSeleccionados.value.indexOf(nombre)
  if (idx === -1) {
    carabinerosSeleccionados.value.push(nombre)
  } else {
    carabinerosSeleccionados.value.splice(idx, 1)
  }
}

function toggleServicio(index) {
  if (!casoSeleccionado.value) return
  store.toggleServicioContactado(casoSeleccionado.value.id, index)
}

function guardarNota(ev) {
  if (!casoSeleccionado.value) return
  store.setNotaOperador(casoSeleccionado.value.id, ev.target.value)
}

function setContacto(estado) {
  if (!casoSeleccionado.value) return
  store.setContactoEstado(casoSeleccionado.value.id, estado)
  casoSeleccionado.value.contactoEstado = estado
}

function guardarContactoNotas() {
  if (!casoSeleccionado.value) return
  store.setContactoNotas(casoSeleccionado.value.id, contactoNotas.value)
}

function badgeEstado(estado) {
  if (estado === 'recibida') return 'Nueva'
  if (estado === 'aceptada') return 'Aceptada'
  if (estado === 'asignada') return 'Asignada'
  if (estado === 'en_terreno') return 'En terreno'
  return 'Completada'
}

function contactoLabel(estado) {
  if (estado === 'contactado') return 'Contactado'
  if (estado === 'sin_respuesta') return 'Sin respuesta'
  return 'Pendiente'
}

function yaAsignado(nombre) {
  return casoSeleccionado.value?.asignados?.includes(nombre)
}

const carabinerosFiltrados = computed(() => {
  if (!casoSeleccionado.value) return []
  const com = casoSeleccionado.value.comisariaCercana || ''
  return store.carabineros.filter(cb =>
    com.toLowerCase().includes(cb.unidad.toLowerCase().replace('° comisaría', '').trim())
  )
})
</script>

<template>
  <div class="central">
    <header class="central-header">
      <div class="brand">
        <span class="dot"></span>
        Central Operativa
      </div>
      <div class="meta">
        <span class="pill">{{ store.casos.length }} casos</span>
      </div>
    </header>

    <div class="layout">
      <aside class="list">
        <div class="list-head">
          <h1>Denuncias</h1>
          <div class="tabs">
            <button :class="{ active: filtro === 'pendientes' }" @click="filtro = 'pendientes'">Pendientes</button>
            <button :class="{ active: filtro === 'asignados' }" @click="filtro = 'asignados'">Asignadas</button>
            <button :class="{ active: filtro === 'completados' }" @click="filtro = 'completados'">Cerradas</button>
          </div>
        </div>

        <div v-if="lista.length === 0" class="empty">
          No hay casos en esta categoría
        </div>

        <button
          v-for="c in lista"
          :key="c.id"
          class="case-row"
          :class="{ active: casoSeleccionado?.id === c.id }"
          @click="seleccionarCaso(c)"
        >
          <div class="case-top">
            <span class="case-emerg" :style="{ color: c.emergencia?.color || '#666' }">{{ c.emergencia?.titulo || 'Emergencia' }}</span>
            <span class="case-state">{{ badgeEstado(c.estado) }}</span>
          </div>
          <div class="case-sub">
            <span>{{ c.victimNombre || '—' }}</span>
            <span>RUT {{ c.victimRut || '—' }}</span>
          </div>
          <div class="case-meta">
            {{ new Date(c.creadoEn).toLocaleString('es-CL', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) }}
          </div>
        </button>
      </aside>

      <section class="detail">
        <div v-if="!casoSeleccionado" class="detail-empty">
          Selecciona una denuncia para ver el detalle
        </div>

        <div v-else class="detail-wrap">
          <div class="detail-head">
            <div>
              <h2>{{ casoSeleccionado.emergencia?.titulo || 'Emergencia' }}</h2>
              <p>ID {{ casoSeleccionado.id }} · {{ badgeEstado(casoSeleccionado.estado) }}</p>
            </div>
            <div class="detail-actions" v-if="casoSeleccionado.estado !== 'completada'">
              <button
                class="btn btn-accept"
                @click="aceptar"
                :disabled="casoSeleccionado.estado !== 'recibida' || !casoSeleccionado.contactoEstado"
              >
                Aceptar
              </button>
            </div>
          </div>

          <div v-if="casoSeleccionado.estado === 'recibida' && !casoSeleccionado.contactoEstado" class="contact-alert">
            Llama al contacto de emergencia antes de aceptar la denuncia
          </div>

          <div class="contact-section">
            <h3>
              Contacto de emergencia
              <span class="contact-badge" :class="casoSeleccionado.contactoEstado || 'pendiente'">
                {{ contactoLabel(casoSeleccionado.contactoEstado) }}
              </span>
            </h3>
            <div class="contact-info">
              <div class="contact-name">{{ casoSeleccionado.victimContactoNombre || '—' }}</div>
              <div class="contact-phone">{{ casoSeleccionado.victimContactoTelefono || '—' }}</div>
            </div>

            <div class="contact-actions" v-if="casoSeleccionado.estado !== 'completada'">
              <textarea
                class="input-note"
                v-model="contactoNotas"
                @input="guardarContactoNotas"
                placeholder="Anota lo conversado con el contacto (opcional)"
              ></textarea>
              <div class="contact-btns">
                <button
                  class="btn btn-ok"
                  :class="{ active: casoSeleccionado.contactoEstado === 'contactado' }"
                  @click="setContacto('contactado')"
                >
                  Contactado
                </button>
                <button
                  class="btn btn-no"
                  :class="{ active: casoSeleccionado.contactoEstado === 'sin_respuesta' }"
                  @click="setContacto('sin_respuesta')"
                >
                  Sin respuesta
                </button>
              </div>
            </div>

            <div v-else class="contact-notas-leidas">
              <strong>Notas del operador:</strong>
              {{ casoSeleccionado.contactoNotas || '(sin notas)' }}
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <h3>Víctima</h3>
              <div class="row"><span>Nombre</span><strong>{{ casoSeleccionado.victimNombre || '—' }}</strong></div>
              <div class="row"><span>RUT</span><strong>{{ casoSeleccionado.victimRut || '—' }}</strong></div>
              <div class="row"><span>Teléfono</span><strong>{{ casoSeleccionado.victimTelefono || '—' }}</strong></div>
            </div>

            <div class="card">
              <h3>Ubicación</h3>
              <div class="row"><span>Dirección</span><strong>{{ casoSeleccionado.contexto?.ubicacion || '—' }}</strong></div>
              <div class="row">
                <span>Comisaría cercana</span>
                <strong class="comisaria">{{ casoSeleccionado.comisariaCercana || '—' }}</strong>
              </div>
              <div class="row" v-if="casoSeleccionado.asignados?.length">
                <span>Carabineros asignados</span>
              </div>
              <div v-for="a in casoSeleccionado.asignados" :key="a" class="asignado-item">
                {{ a }}
                <button
                  v-if="casoSeleccionado.estado !== 'completada' && casoSeleccionado.estado !== 'en_terreno'"
                  class="btn-remove-xs"
                  @click="quitar(a)"
                >✕</button>
              </div>
            </div>
          </div>

          <div class="card wide">
            <h3>Contexto recibido</h3>
            <div v-if="Object.keys(casoSeleccionado.contexto?.respuestas || {}).length === 0" class="row">
              <span>Sin respuestas</span>
            </div>
            <div v-for="(v, k) in casoSeleccionado.contexto?.respuestas || {}" :key="k" class="row">
              <span>{{ casoSeleccionado.contexto?.preguntas?.[k] || k }}</span>
              <strong>{{ v }}</strong>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <h3>Servicios externos</h3>
              <div v-for="(s, i) in casoSeleccionado.serviciosExternos" :key="i" class="servicio-row">
                <div class="servicio-info">
                  <span class="servicio-nombre">{{ s.servicio }}</span>
                  <span class="servicio-estado" :class="{ ok: s.contactado }">
                    {{ s.contactado ? 'Contactado' : 'Pendiente' }}
                  </span>
                </div>
                <button
                  v-if="casoSeleccionado.estado !== 'completada'"
                  class="btn btn-servicio"
                  :class="{ active: s.contactado }"
                  @click="toggleServicio(i)"
                >
                  {{ s.contactado ? 'He contactado ✓' : 'He contactado' }}
                </button>
              </div>
              <div class="servicio-ayuda">
                <span>Ambulancia: 131</span>
                <span>Bomberos: 132</span>
              </div>
            </div>
            <div class="card">
              <h3>Nota al carabinero</h3>
              <textarea
                class="input-note"
                :value="casoSeleccionado.notaOperador"
                @input="guardarNota"
                placeholder="Ej: posible agresor armado, riesgo alto, etc."
              ></textarea>
            </div>
          </div>

          <div class="card wide assign-card" v-if="casoSeleccionado.estado !== 'completada'">
            <h3>Asignar carabineros ({{ casoSeleccionado.comisariaCercana || '48° Comisaría' }})</h3>
            <div v-if="carabinerosFiltrados.length === 0" class="assign-empty">
              No hay carabineros disponibles para esta comisaría
            </div>
            <div class="assign-grid">
              <label
                v-for="cb in carabinerosFiltrados"
                :key="cb.nombre"
                class="assign-option"
                :class="{ disabled: yaAsignado(cb.nombre) }"
              >
                <input
                  type="checkbox"
                  :value="cb.nombre"
                  :checked="carabinerosSeleccionados.includes(cb.nombre)"
                  :disabled="yaAsignado(cb.nombre)"
                  @change="toggleCarabineroSel(cb.nombre)"
                />
                <div class="assign-info">
                  <span class="assign-nombre">{{ cb.nombre }}</span>
                  <span class="assign-unidad">{{ cb.unidad }}</span>
                </div>
                <span v-if="yaAsignado(cb.nombre)" class="assign-badge">Asignado</span>
              </label>
            </div>
            <button
              class="btn btn-assign"
              @click="asignarSeleccionados"
              :disabled="carabinerosSeleccionados.length === 0"
            >
              Asignar {{ carabinerosSeleccionados.length > 0 ? `(${carabinerosSeleccionados.length})` : '' }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.central {
  min-height: 100dvh;
  background: #fff;
  color: #222;
  padding: 24px 32px;
  font-family: system-ui, -apple-system, sans-serif;
}

.central-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #888;
  font-weight: 800;
}

.dot {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
}

.meta {
  display: flex;
  gap: 8px;
}

.pill {
  font-size: 11px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eee;
  color: #666;
}

.layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
  min-height: calc(100dvh - 120px);
}

.list {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-head h1 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 800;
  color: #222;
}

.tabs {
  display: flex;
  gap: 6px;
}

.tabs button {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  color: #666;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.tabs button.active {
  background: #222;
  border-color: #222;
  color: #fff;
}

.empty {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
}

.case-row {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.case-row.active {
  border-color: #222;
  background: #fafafa;
}

.case-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-emerg {
  font-weight: 800;
  font-size: 13px;
}

.case-state {
  font-size: 10px;
  color: #999;
  font-weight: 700;
}

.case-sub {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #555;
}

.case-meta {
  font-size: 11px;
  color: #999;
}

.detail {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100dvh - 120px);
}

.detail-empty {
  color: #999;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.detail-head h2 {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 800;
  color: #222;
}

.detail-head p {
  margin: 0;
  color: #777;
  font-size: 12px;
  font-weight: 600;
}

.detail-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.contact-alert {
  background: #fff3cd;
  color: #856404;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 12px;
}

.contact-section {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
}

.contact-section h3 {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 800;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.contact-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.contact-badge.pendiente {
  background: #fff3cd;
  color: #856404;
}

.contact-badge.contactado {
  background: #d4edda;
  color: #155724;
}

.contact-badge.sin_respuesta {
  background: #f8d7da;
  color: #721c24;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
}

.contact-name {
  font-size: 16px;
  font-weight: 800;
  color: #222;
}

.contact-phone {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.contact-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-btns {
  display: flex;
  gap: 8px;
}

.contact-notas-leidas {
  font-size: 13px;
  color: #555;
  padding: 8px 0 0;
  border-top: 1px solid #eee;
}

.contact-notas-leidas strong {
  color: #222;
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  color: #222;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-accept {
  background: #1b5e20;
  color: #fff;
  border-color: #1b5e20;
}

.btn-assign {
  background: #1565c0;
  color: #fff;
  border-color: #1565c0;
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  font-size: 13px;
}

.btn-ok {
  flex: 1;
  border-color: #28a745;
  color: #28a745;
}

.btn-ok.active {
  background: #28a745;
  color: #fff;
}

.btn-no {
  flex: 1;
  border-color: #dc3545;
  color: #dc3545;
}

.btn-no.active {
  background: #dc3545;
  color: #fff;
}

.btn-servicio {
  font-size: 11px;
  padding: 4px 10px;
}

.btn-servicio.active {
  background: #28a745;
  border-color: #28a745;
  color: #fff;
}

.btn-remove-xs {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  padding: 0 2px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 12px 0;
}

.card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #e0e0e0;
}

.card h3 {
  margin: 0 0 8px;
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
}

.row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
}

.row span { color: #777; font-weight: 600; }
.row strong { color: #222; }

.wide {
  grid-column: span 2;
}

.comisaria {
  font-size: 12px;
  text-align: right;
  max-width: 180px;
}

.asignado-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #1565c0;
  padding: 2px 0 2px 12px;
}

.servicio-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.servicio-row:last-child {
  border-bottom: none;
}

.servicio-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.servicio-nombre {
  font-size: 13px;
  font-weight: 700;
  color: #222;
}

.servicio-estado {
  font-size: 10px;
  font-weight: 700;
  color: #999;
}

.servicio-estado.ok {
  color: #28a745;
}

.servicio-ayuda {
  display: flex;
  gap: 16px;
  margin-top: 6px;
  font-size: 11px;
  color: #999;
  font-weight: 600;
}

.input-note {
  width: 100%;
  min-height: 70px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  color: #222;
  font-size: 13px;
  font-weight: 600;
  padding: 10px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
}

.input-note::placeholder {
  color: #bbb;
}

.assign-card {
  margin-top: 12px;
}

.assign-empty {
  font-size: 13px;
  color: #999;
  font-weight: 600;
  padding: 12px 0;
  text-align: center;
}

.assign-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.assign-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
}

.assign-option.disabled {
  opacity: 0.5;
  cursor: default;
}

.assign-option input {
  accent-color: #1565c0;
  width: 18px;
  height: 18px;
}

.assign-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}

.assign-nombre {
  font-size: 13px;
  font-weight: 700;
  color: #222;
}

.assign-unidad {
  font-size: 11px;
  color: #888;
  font-weight: 600;
}

.assign-badge {
  font-size: 10px;
  font-weight: 800;
  background: #e3f2fd;
  color: #1565c0;
  padding: 2px 8px;
  border-radius: 6px;
}
</style>
