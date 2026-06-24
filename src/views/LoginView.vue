<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'
import { api } from '../services/api.js'

const router = useRouter()
const alertStore = useAlertStore()

const isLoading = ref(false)
const errorMsg = ref('')

const registroData = reactive({
  rut: '',
  num_documento: '',
  nombre: '',
  telefono: '',
  contacto_nombre: '',
  contacto_telefono: '',
})

const ubicacionGPS = ref('')
const ubicacionNombre = ref('')
const gpsActivo = ref(false)
let watchId = null

onMounted(() => {
  if (localStorage.getItem('perfil')) {
    router.replace({ name: 'home' })
    return
  }
  iniciarGPS()
})

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
  }
})

function iniciarGPS() {
  if (!navigator.geolocation) return
  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      ubicacionGPS.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      gpsActivo.value = true
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
          { headers: { 'User-Agent': 'EmergenciaApp/1.0' } }
        )
        const data = await res.json()
        if (data.display_name) {
          const parts = data.display_name.split(', ')
          ubicacionNombre.value = parts.length >= 2 ? `${parts[0]}, ${parts[1]}` : parts[0]
        }
      } catch {}
    },
    () => { gpsActivo.value = false },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

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
  const antes = registroData.rut
  const formateado = formatearRut(e.target.value)
  registroData.rut = formateado
  if (cursor && formateado.length > antes.length) {
    requestAnimationFrame(() => {
      e.target.setSelectionRange(cursor + (formateado.length - antes.length), cursor + (formateado.length - antes.length))
    })
  }
}

function soloNumeros(e) {
  if (!/[0-9]/.test(e.key)) e.preventDefault()
}

function formatearDocumento(raw) {
  const limpio = raw.replace(/[^0-9]/g, '').slice(0, 9)
  if (limpio.length <= 3) return limpio
  if (limpio.length <= 6) return limpio.slice(0, 3) + '.' + limpio.slice(3)
  return limpio.slice(0, 3) + '.' + limpio.slice(3, 6) + '.' + limpio.slice(6)
}

function onDocInput(e) {
  const cursor = e.target.selectionStart
  const antes = registroData.num_documento
  const formateado = formatearDocumento(e.target.value)
  registroData.num_documento = formateado
  if (cursor && formateado.length > antes.length) {
    requestAnimationFrame(() => {
      e.target.setSelectionRange(cursor + (formateado.length - antes.length), cursor + (formateado.length - antes.length))
    })
  }
}

function formatearTelefono(nums) {
  const limpio = nums.replace(/[^0-9]/g, '').slice(0, 8)
  if (limpio.length <= 4) return limpio
  return `${limpio.slice(0, 4)} ${limpio.slice(4)}`
}

function onTelefonoInput(e, campo) {
  const solo = e.target.value.replace(/[^0-9]/g, '').slice(0, 8)
  if (campo === 'telefono') registroData.telefono = solo
  else registroData.contacto_telefono = solo
  e.target.value = formatearTelefono(solo)
}

async function handleRegistro() {
  if (!registroData.rut || !registroData.num_documento || !registroData.nombre) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await api.auth.register({
      rut: registroData.rut,
      num_documento: registroData.num_documento,
      nombre: registroData.nombre,
      telefono: registroData.telefono,
      direccion: ubicacionNombre.value || ubicacionGPS.value || '',
      contacto_nombre: registroData.contacto_nombre,
      contacto_telefono: registroData.contacto_telefono,
    })
    alertStore.actualizarPerfil({ ...res.perfil })
    router.push({ name: 'home' })
  } catch (e) {
    if (e.message.includes('400')) {
      errorMsg.value = 'YA REGISTRADO'
    } else {
      errorMsg.value = 'ERROR'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="mobile-phone-frame page registro-page">
    <header class="registro-header">
      <img
        class="escudo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Roundel_of_Carabineros_de_Chile.svg/250px-Roundel_of_Carabineros_de_Chile.svg.png"
        alt="Carabineros"
      />
      <h1>EMERGENCIA</h1>
    </header>

    <main class="registro-form">
      <div class="gps-dot" :class="{ active: gpsActivo }"></div>

      <div class="field">
        <label>RUT</label>
        <input
          type="text"
          placeholder="12.345.678-9"
          :value="registroData.rut"
          @input="onRutInput"
        />
      </div>

      <div class="field">
        <label>NUM. DOCUMENTO</label>
        <input
          type="text"
          inputmode="numeric"
          placeholder="XXX.XXX.XXX"
          maxlength="11"
          :value="registroData.num_documento"
          @input="onDocInput"
        />
      </div>

      <div class="field">
        <label>NOMBRE</label>
        <input
          type="text"
          placeholder="Tu nombre completo"
          v-model="registroData.nombre"
        />
      </div>

      <div class="field">
        <label>TELEFONO</label>
        <div class="phone-wrap">
          <span class="prefix">+569</span>
          <input
            type="tel"
            inputmode="numeric"
            placeholder="5497 1044"
            :value="formatearTelefono(registroData.telefono)"
            @keypress="soloNumeros"
            @input="e => onTelefonoInput(e, 'telefono')"
            maxlength="9"
          />
        </div>
      </div>

      <div class="separator">CONTACTO EMERGENCIA</div>

      <div class="field">
        <label>NOMBRE CONTACTO</label>
        <input
          type="text"
          placeholder="Familiar o amigo"
          v-model="registroData.contacto_nombre"
        />
      </div>

      <div class="field">
        <label>TELEFONO CONTACTO</label>
        <div class="phone-wrap">
          <span class="prefix">+569</span>
          <input
            type="tel"
            inputmode="numeric"
            placeholder="5497 1044"
            :value="formatearTelefono(registroData.contacto_telefono)"
            @keypress="soloNumeros"
            @input="e => onTelefonoInput(e, 'contacto')"
            maxlength="9"
          />
        </div>
      </div>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button
        class="submit-btn"
        :disabled="isLoading || !registroData.rut || !registroData.num_documento || !registroData.nombre"
        @click="handleRegistro"
      >
        {{ isLoading ? '...' : 'REGISTRAR' }}
      </button>
    </main>
  </div>
</template>

<style scoped>
.mobile-phone-frame {
  width: 100%;
  max-width: 450px;
  height: 100vh;
  max-height: 850px;
  position: relative;
  overflow: hidden;
  background: #f8faf9;
  border: 4px solid #334155;
  border-radius: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.registro-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8faf9;
  overflow-y: auto;
}

.registro-header {
  background: #006F3E;
  padding: 32px 20px 24px;
  text-align: center;
  color: #fff;
  flex-shrink: 0;
}

.escudo {
  height: 56px;
  margin-bottom: 12px;
}

.registro-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 2px;
}

.registro-form {
  flex: 1;
  padding: 20px 16px 40px;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.gps-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f59e0b;
  margin: 0 auto;
}

.gps-dot.active {
  background: #10b981;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field label {
  font-size: 11px;
  font-weight: 800;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field input {
  padding: 14px;
  font-size: 16px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: #006F3E;
}

.phone-wrap {
  display: flex;
  align-items: center;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}

.phone-wrap:focus-within {
  border-color: #006F3E;
}

.phone-wrap .prefix {
  padding: 14px 10px 14px 14px;
  font-weight: 700;
  color: #374151;
  background: #f3f4f6;
  border-right: 1px solid #d1d5db;
}

.phone-wrap input {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

.separator {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  margin: 8px 0;
}

.error-msg {
  color: #dc2626;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  margin: 4px 0;
}

.submit-btn {
  padding: 16px;
  background: #006F3E;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
