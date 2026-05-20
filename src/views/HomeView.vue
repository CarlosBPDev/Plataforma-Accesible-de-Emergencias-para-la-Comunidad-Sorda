<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'
import { emergencias } from '../data/emergencias'

const router = useRouter()
const store = useAlertStore()

// Controla qué tarjeta está siendo interactuada (para animación del GIF)
const activeCard = ref(null)

function handleSelect(emergencia) {
  store.setEmergencia(emergencia)
  router.push({ name: 'contexto' })
}

function handleEnter(id) {
  activeCard.value = id
}

function handleLeave() {
  activeCard.value = null
}
</script>

<template>
  <div class="page home">
    <header class="home-header">
      <h1>Emergencias</h1>
      <router-link to="/perfil" class="icon-btn" aria-label="Ir a perfil">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="10" r="3" />
          <path d="M6.17 18a6 6 0 0 1 11.66 0" />
        </svg>
      </router-link>
    </header>

    <button class="panic-card" aria-label="Botón de pánico, mantener presionado 4 segundos">
      <div class="panic-left">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 5a2 2 0 1 1 4 0 7 7 0 0 1 4 6v3l2 2H4l2-2v-3a7 7 0 0 1 4-6z" />
          <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
          <path d="M21 6.5A11.2 11.2 0 0 0 18 4" />
          <path d="M3 6.5A11.2 11.2 0 0 1 6 4" />
        </svg>
        <div>
          <div class="panic-title">Pánico</div>
          <div class="panic-sub">Mantener presionado 4s</div>
        </div>
      </div>
      <svg class="panic-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14" />
        <path d="M15 8l4 4-4 4" />
      </svg>
    </button>

    <div class="section-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3z" />
      </svg>
      Emergencias
    </div>

    <!-- Sad Path: si el array está vacío, muestra mensaje de error -->
    <p v-if="emergencias.length === 0" class="error-msg">
      No hay tipos de emergencia disponibles.
    </p>

    <!-- Tarjetas renderizadas dinámicamente con v-for -->
    <div v-else class="emergency-grid">
      <button
        v-for="em in emergencias"
        :key="em.id"
        class="e-card"
        :style="{ '--card-color': em.color }"
        @click="handleSelect(em)"
        @pointerenter="handleEnter(em.id)"
        @pointerleave="handleLeave"
        :aria-label="`Emergencia: ${em.label}`"
      >
        <div class="e-icon-wrap">
          <!-- Icono SVG con fill='currentColor' para contraste accesible -->
          <svg v-if="em.icon === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3z" />
          </svg>
          <svg v-else-if="em.icon === 'lock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <svg v-else-if="em.icon === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M6 12h12" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="16" r="1.5" />
          </svg>
        </div>
        <span class="e-label">{{ em.label }}</span>
        <!-- Indicador visual de interacción (simula GIF al interactuar) -->
        <div v-if="activeCard === em.id" class="e-active-dot" />
      </button>
    </div>

    <div class="section-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      Última alerta
    </div>

    <router-link to="/historial" class="alert-mini">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3z" />
      </svg>
      <div class="a-info">
        <div class="a-type">Violencia</div>
        <div class="a-date">12 may 2026 - 14:32</div>
      </div>
      <div class="a-badge">En proceso</div>
    </router-link>
  </div>
</template>

<style scoped>
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.home-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--on-surface);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: var(--on-surface);
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
}

.icon-btn svg {
  width: 22px;
  height: 22px;
}

.panic-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px 20px;
  margin-bottom: 24px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(166, 33, 0, 0.3);
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.panic-card:active {
  transform: scale(0.97);
  box-shadow: 0 2px 6px rgba(166, 33, 0, 0.4);
}

.panic-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panic-left svg {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.panic-title {
  font-size: 18px;
  font-weight: 700;
}

.panic-sub {
  font-size: 13px;
  opacity: 0.85;
}

.panic-arrow {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.section-title svg {
  width: 16px;
  height: 16px;
}

.error-msg {
  padding: 16px;
  text-align: center;
  color: var(--danger);
  background: rgba(198, 40, 40, 0.08);
  border-radius: var(--radius);
  font-size: 14px;
}

.emergency-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.e-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 150ms ease;
  position: relative;
}

.e-card:hover {
  border-color: var(--card-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.e-card:active {
  transform: scale(0.96);
}

.e-icon-wrap svg {
  width: 32px;
  height: 32px;
  color: var(--card-color);
}

.e-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
}

.e-active-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--card-color);
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}

.alert-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface-2);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--on-surface);
  transition: box-shadow 150ms ease;
}

.alert-mini:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.alert-mini svg {
  width: 20px;
  height: 20px;
  color: var(--on-surface-muted);
  flex-shrink: 0;
}

.a-info {
  flex: 1;
}

.a-type {
  font-size: 14px;
  font-weight: 600;
}

.a-date {
  font-size: 12px;
  color: var(--on-surface-muted);
}

.a-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(46, 125, 50, 0.1);
  color: var(--success);
}
</style>
