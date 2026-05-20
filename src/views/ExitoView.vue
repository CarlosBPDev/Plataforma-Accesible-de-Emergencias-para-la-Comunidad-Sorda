<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'

const router = useRouter()
const store = useAlertStore()

// Variable reactiva para el estado de la conexión
const isOnline = ref(navigator.onLine)

// Funciones para actualizar el estado
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// Lógica de "autodestrucción" al salir de la pantalla de éxito
// Esto borra todo rastro de la emergencia actual para proteger al usuario
const autodestruccion = () => {
  store.resetAlerta()
  localStorage.clear()
  sessionStorage.clear()
}

// Configuración de listeners de eventos de red
onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

// Hook de Vue Router para ejecutar la limpieza antes de cambiar de ruta
onBeforeRouteLeave((to, from) => {
  autodestruccion()
  return true
})

// Limpieza de listeners al desmontar el componente
onUnmounted(() => {
  autodestruccion()
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})

function volverHome() {
  router.push({ name: 'home' })
}
</script>

<template>
  <div class="page exito" :class="{ 'is-offline': !isOnline }">
    <!-- UI para estado ONLINE (Verde) -->
    <div v-if="isOnline" class="status-container online">
      <div class="icon-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1>¡Alerta Enviada!</h1>
      <p>Tu solicitud de auxilio ha sido recibida por el centro de mando. La ayuda está en camino.</p>
    </div>

    <!-- UI para estado OFFLINE (Amarillo/Alerta) -->
    <div v-else class="status-container offline">
      <div class="icon-circle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      </div>
      <h1>Modo Offline</h1>
      <p>Hemos detectado que perdiste la conexión. Tu alerta se enviará automáticamente vía SMS en segundo plano.</p>
      <div class="sms-badge">Enviando SMS...</div>
    </div>

    <button class="footer-btn" @click="volverHome">
      Volver al inicio
    </button>
  </div>
</template>

<style scoped>
.exito {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: background-color 0.5s ease;
  background-color: var(--surface);
}

.exito.is-offline {
  background-color: #fffde7; /* Amarillo muy suave para modo offline */
}

.status-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.online .icon-circle {
  background-color: rgba(46, 125, 50, 0.1);
  color: var(--success);
}

.offline .icon-circle {
  background-color: rgba(245, 124, 0, 0.1);
  color: var(--warning);
}

.icon-circle svg {
  width: 40px;
  height: 40px;
}

h1 {
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 12px;
}

.online h1 {
  color: var(--success);
}

.offline h1 {
  color: var(--warning);
}

p {
  font-size: 16px;
  line-height: 1.6;
  color: var(--on-surface-muted);
  max-width: 300px;
}

.sms-badge {
  margin-top: 24px;
  padding: 8px 16px;
  background: var(--warning);
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

.footer-btn {
  width: 100%;
  max-width: 320px;
  margin-bottom: 40px;
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--on-surface);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-btn:active {
  transform: scale(0.98);
  background-color: var(--surface-2);
}
</style>
