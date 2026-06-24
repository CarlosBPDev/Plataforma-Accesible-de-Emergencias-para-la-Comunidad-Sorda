<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'

const router = useRouter()
const store = useAlertStore()

const ubicacionGPS = ref('')
const ubicacionNombre = ref('')
const gpsActivo = ref(false)
const gpsError = ref('')
let watchId = null

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
      { headers: { 'User-Agent': 'EmergenciaApp/1.0' } }
    )
    const data = await res.json()
    if (data.display_name) {
      const parts = data.display_name.split(', ')
      const zona = parts.slice(0, 3).join(', ')
      return zona
    }
  } catch {}
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

onMounted(() => {
  if (store.perfil.rut) {
    store.cargarPerfil()
  }
  iniciarGPS()
})

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
  }
})

function iniciarGPS() {
  if (!navigator.geolocation) {
    gpsError.value = 'GPS no disponible'
    return
  }

  let ultimaLat = null
  let ultimaLng = null

  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords
      ultimaLat = latitude
      ultimaLng = longitude
      ubicacionGPS.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      gpsActivo.value = true
      gpsError.value = ''

      const nombre = await reverseGeocode(latitude, longitude)
      ubicacionNombre.value = nombre
    },
    (err) => {
      gpsError.value = 'Activa el GPS en tu dispositivo'
      gpsActivo.value = false
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}
</script>

<template>
  <div class="page perfil-view">
    <header class="perfil-header">
      <button class="back-btn" @click="router.push('/victim')" aria-label="Volver">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
      </button>
      <h1>Mi Perfil</h1>
      <img
        class="escudo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Roundel_of_Carabineros_de_Chile.svg/250px-Roundel_of_Carabineros_de_Chile.svg.png"
        alt="Carabineros"
      />
    </header>

    <main class="perfil-content">
      <div class="gps-section">
        <div class="gps-status" :class="{ activo: gpsActivo, error: gpsError }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <div>
            <span class="gps-label">Ubicación en tiempo real</span>
            <span class="gps-value">{{ gpsActivo ? (ubicacionNombre || ubicacionGPS) : (gpsError || 'Buscando GPS...') }}</span>
          </div>
          <span class="gps-dot" :class="{ activo: gpsActivo }"></span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">RUT</span>
          <span class="info-value">{{ store.perfil.rut || '—' }}</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Nombre</span>
          <span class="info-value">{{ store.perfil.nombre || '—' }}</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Teléfono</span>
          <span class="info-value">{{ store.perfil.telefono || '—' }}</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Dirección</span>
          <span class="info-value">{{ store.perfil.direccion || '—' }}</span>
        </div>
      </div>

      <div class="separator">
        <span>Contacto de emergencia</span>
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Nombre</span>
          <span class="info-value">{{ store.perfil.contacto_nombre || '—' }}</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Teléfono</span>
          <span class="info-value">{{ store.perfil.contacto_telefono || '—' }}</span>
        </div>
      </div>

      <div class="locked-notice">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p>Los datos personales no se pueden editar por seguridad. La ubicación se actualiza automáticamente en tiempo real.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.perfil-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8faf9;
}

.perfil-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
}

.back-btn {
  background: none;
  border: none;
  color: #006F3E;
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.back-btn svg {
  width: 24px;
  height: 24px;
}

.perfil-header h1 {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.escudo {
  height: 32px;
}

.perfil-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.gps-section {
  margin-bottom: 20px;
}

.gps-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
}

.gps-status.activo {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.gps-status.error {
  background: #fefce8;
  border-color: #fde68a;
}

.gps-status svg {
  width: 22px;
  height: 22px;
  color: #0369a1;
  flex-shrink: 0;
}

.gps-status.activo svg {
  color: #047857;
}

.gps-status.error svg {
  color: #a16207;
}

.gps-status div {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.gps-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #6b7280;
}

.gps-value {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin-top: 2px;
}

.gps-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #d1d5db;
  flex-shrink: 0;
}

.gps-dot.activo {
  background: #22c55e;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.info-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.separator {
  display: flex;
  align-items: center;
  margin: 20px 0 14px;
  gap: 12px;
}

.separator::before,
.separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #d1d5db;
}

.separator span {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.locked-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 20px;
  padding: 14px;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 10px;
}

.locked-notice svg {
  width: 20px;
  height: 20px;
  color: #a16207;
  flex-shrink: 0;
  margin-top: 2px;
}

.locked-notice p {
  margin: 0;
  font-size: 12px;
  color: #78350f;
  line-height: 1.5;
}
</style>
