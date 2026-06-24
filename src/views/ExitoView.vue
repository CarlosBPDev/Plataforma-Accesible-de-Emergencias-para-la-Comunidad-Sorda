<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'
import { useCasosStore } from '../stores/casosStore'
import { connectGPSSocket, sendGPSUpdate, closeGPSSocket } from '../services/api.js'

const router = useRouter()
const alertStore = useAlertStore()
const casosStore = useCasosStore()

const isOnline = ref(navigator.onLine)
const casoId = ref(null)
const gpsActivo = ref(false)
let watchId = null
let gpsSocket = null

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  casoId.value = router.currentRoute.value.query.casoId

  if (casoId.value) {
    gpsSocket = connectGPSSocket(casoId.value, {
      onConnect: () => { gpsActivo.value = true },
      onMessage: (data) => { if (data.lat && data.lng) gpsActivo.value = true },
      onClose: () => { gpsActivo.value = false },
    })
  }

  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        alertStore.setUbicacion(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng)
        if (gpsSocket && casoId.value) sendGPSUpdate(lat, lng)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  closeGPSSocket()
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
})

function updateOnlineStatus() { isOnline.value = navigator.onLine }
function irAExplicar() { router.push({ name: 'triage' }) }
function irAHistorial() { router.push({ name: 'historial' }) }
function volverHome() { router.push({ name: 'home' }) }
</script>

<template>
  <div class="page exito" :class="{ offline: !isOnline }">
    <div class="exito-bg-1"></div>
    <div class="exito-bg-2"></div>

    <div v-if="isOnline" class="exito-content">
      <div class="success-ring">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      <h1 class="exito-title">ENVIADA!</h1>

      <div class="status-bar">
        <svg class="status-icon" :class="{ ok: alertStore.ubicacion }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>{{ alertStore.ubicacionNombre || alertStore.ubicacion || 'UBICACION COMPARTIDA' }}</span>
      </div>

      <p class="exito-direccion">{{ alertStore.ubicacionNombre || alertStore.ubicacion || '' }}</p>

      <div class="btn-group">
        <button class="btn-explicar" @click="irAExplicar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          EXPLICAR
        </button>

        <div class="btn-row">
          <button class="btn-secondary" @click="irAHistorial">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            ESTADO
          </button>
          <button class="btn-secondary" @click="volverHome">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            INICIO
          </button>
        </div>
      </div>
    </div>

    <div v-else class="exito-content offline-content">
      <div class="offline-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h1 class="offline-title">OFFLINE</h1>
      <p class="offline-text">Tu alerta se enviara cuando haya senal.</p>
      <button class="btn-ghost-dark" @click="volverHome">INICIO</button>
    </div>
  </div>
</template>

<style scoped>
.exito {
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #0a4a2e 0%, #006F3E 50%, #0a5a35 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exito.offline {
  background: #f8faf9;
}

.exito-bg-1 {
  position: absolute;
  top: -200px;
  right: -150px;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.exito-bg-2 {
  position: absolute;
  bottom: -150px;
  left: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0,0,0,0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.exito-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 32px;
  gap: 24px;
  width: 100%;
}

.success-ring {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #006F3E;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.success-icon svg {
  width: 36px;
  height: 36px;
}

.exito-title {
  margin: 0;
  font-size: 36px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 4px;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  backdrop-filter: blur(8px);
}

.status-icon {
  width: 18px;
  height: 18px;
  color: #f59e0b;
  flex-shrink: 0;
  transition: color 0.3s;
}

.status-icon.ok {
  color: #10b981;
}

.status-bar span {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1px;
}

.exito-direccion {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  text-align: center;
  max-width: 260px;
  line-height: 1.4;
}

.btn-group {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.btn-explicar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 18px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.btn-explicar:active {
  background: rgba(255, 255, 255, 0.22);
  transform: scale(0.98);
}

.btn-explicar svg {
  width: 24px;
  height: 24px;
}

.btn-row {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.97);
}

.btn-secondary svg {
  width: 22px;
  height: 22px;
  opacity: 0.8;
}

.offline-content {
  text-align: center;
}

.offline-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
}

.offline-icon svg {
  width: 48px;
  height: 48px;
}

.offline-title {
  margin: 0;
  font-size: 28px;
  font-weight: 900;
  color: #111827;
  letter-spacing: 3px;
}

.offline-text {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.btn-ghost-dark {
  margin-top: 24px;
  padding: 14px 32px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
</style>
