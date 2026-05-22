<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { useAlertStore } from '../stores/alertStore'

const store = useAlertStore()

const perfil = reactive({
  rut: '',
  nombre: '',
  telefono: '',
  direccion: '',
  contacto_nombre: '',
  contacto_telefono: '',
})

onMounted(() => {
  perfil.rut = store.perfil.rut
  perfil.nombre = store.perfil.nombre
  perfil.telefono = store.perfil.telefono
  perfil.direccion = store.perfil.direccion
  perfil.contacto_nombre = store.perfil.contacto_nombre
  perfil.contacto_telefono = store.perfil.contacto_telefono
  if (!perfil.rut && localStorage.getItem('perfil')) {
    try {
      const data = JSON.parse(localStorage.getItem('perfil'))
      perfil.rut = data.rut || ''
      perfil.nombre = data.nombre || ''
      perfil.telefono = data.telefono || ''
      perfil.contacto_nombre = data.contacto_nombre || ''
      perfil.contacto_telefono = data.contacto_telefono || ''
      perfil.direccion = data.direccion || ''
    } catch {}
  }
})

const rutBlurred = ref(false)
const nombreBlurred = ref(false)

const esFormularioValido = computed(() => {
  return perfil.rut.length >= 9 && perfil.nombre.length >= 2
})

function formatearRut(raw) {
  const limpio = raw.replace(/[^0-9kK]/g, '')
  if (limpio.length <= 1) return limpio.toUpperCase()
  const digito = limpio.slice(-1).toUpperCase()
  const cuerpo = limpio.slice(0, -1)
  const formateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formateado}-${digito}`
}

function onRutInput(e) {
  const cursor = e.target.selectionStart
  const antes = perfil.rut
  perfil.rut = formatearRut(e.target.value)
  const despues = perfil.rut
  if (cursor && despues.length > antes.length) {
    requestAnimationFrame(() => {
      e.target.setSelectionRange(cursor + (despues.length - antes.length), cursor + (despues.length - antes.length))
    })
  }
}

function formatearTelefono(raw) {
  const limpio = raw.replace(/[^0-9+]/g, '')
  if (limpio.startsWith('+56')) {
    const nums = limpio.replace(/[^0-9]/g, '').slice(2)
    const a = nums.slice(0, 1)
    const b = nums.slice(1, 5)
    const c = nums.slice(5, 9)
    return `+56 ${a}${b ? ' ' + b : ''}${c ? ' ' + c : ''}`.trim()
  }
  const nums = limpio.replace(/[^0-9]/g, '')
  const a = nums.slice(0, 1)
  const b = nums.slice(1, 5)
  const c = nums.slice(5, 9)
  return `${a}${b ? ' ' + b : ''}${c ? ' ' + c : ''}`.trim()
}

function onTelefonoInput(e) {
  perfil.telefono = formatearTelefono(e.target.value)
}

function onContactoTelefonoInput(e) {
  perfil.contacto_telefono = formatearTelefono(e.target.value)
}

function guardar() {
  store.actualizarPerfil({ ...perfil })
}

function onRutBlur() {
  rutBlurred.value = true
}

function onNombreBlur() {
  nombreBlurred.value = true
}
</script>

<template>
  <div class="page perfil">
    <header class="perfil-header">
      <router-link to="/victim" class="back-btn" aria-label="Volver al inicio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </router-link>
      <h1>Perfil</h1>
    </header>

    <p class="perfil-desc">Tus datos personales se usarán al enviar una alerta.</p>

    <form class="perfil-form" @submit.prevent="guardar">
      <label class="form-group gps-group">
        <span class="form-label">
          <svg class="gps-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 8V2" />
            <path d="M2 12h6" />
            <circle cx="12" cy="12" r="10" fill="none" />
          </svg>
          Ubicación actual
        </span>
        <input
          name="direccion"
          v-model="perfil.direccion"
          type="text"
          placeholder="Av. Principal #123, Santiago"
          autocomplete="street-address"
        />
        <span class="gps-hint">
          <span class="gps-dot"></span>
          GPS activo — seleccionando ubicación actual
        </span>
      </label>

      <label class="form-group">
        <span class="form-label">RUT</span>
        <input
          name="rut"
          :value="perfil.rut"
          @input="onRutInput"
          @blur="onRutBlur"
          type="text"
          inputmode="numeric"
          placeholder="12.345.678-9"
          autocomplete="off"
        />
        <span v-if="rutBlurred && perfil.rut.length < 9" class="form-error">RUT inválido. Debe tener al menos 8 dígitos + dígito verificador.</span>
      </label>

      <label class="form-group">
        <span class="form-label">Nombre completo</span>
        <input
          name="nombre"
          v-model="perfil.nombre"
          @blur="onNombreBlur"
          type="text"
          autocapitalize="words"
          placeholder="Ej: María Pérez"
          autocomplete="name"
        />
        <span v-if="nombreBlurred && perfil.nombre.length < 2" class="form-error">El nombre debe tener al menos 2 caracteres.</span>
      </label>

      <label class="form-group">
        <span class="form-label">Teléfono</span>
        <input
          name="telefono"
          :value="perfil.telefono"
          @input="onTelefonoInput"
          type="tel"
          inputmode="numeric"
          placeholder="+56 9 1234 5678"
          autocomplete="tel"
        />
      </label>

      <label class="form-group">
        <span class="form-label">Contacto de emergencia</span>
        <input
          name="contacto_nombre"
          v-model="perfil.contacto_nombre"
          type="text"
          autocapitalize="words"
          placeholder="Nombre del familiar o amigo"
          autocomplete="off"
        />
      </label>

      <label class="form-group">
        <span class="form-label">Teléfono del contacto</span>
        <input
          name="contacto_telefono"
          :value="perfil.contacto_telefono"
          @input="onContactoTelefonoInput"
          type="tel"
          inputmode="numeric"
          placeholder="+56 9 1234 5678"
          autocomplete="off"
        />
      </label>

      <button type="submit" class="save-btn" :disabled="!esFormularioValido">Guardar datos</button>
    </form>
  </div>
</template>

<style scoped>
.perfil-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--on-surface);
  cursor: pointer;
  text-decoration: none;
}

.back-btn svg {
  width: 22px;
  height: 22px;
}

.perfil-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.perfil-desc {
  margin-bottom: 24px;
  color: var(--on-surface-muted);
  font-size: 15px;
}

.perfil-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--on-surface);
}

.form-group input {
  padding: 14px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 16px;
  font-family: inherit;
  color: var(--on-surface);
  background: var(--surface);
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-error {
  font-size: 13px;
  font-weight: 600;
  color: var(--danger);
  line-height: 1.4;
}

.save-btn {
  width: 100%;
  padding: 16px;
  margin-top: 8px;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.save-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.gps-group .form-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gps-icon {
  width: 18px;
  height: 18px;
  color: #1565c0;
}

.gps-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  margin-top: 2px;
}

.gps-hint svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  opacity: 0.6;
}

.gps-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  animation: gps-pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes gps-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.75); }
}
</style>
