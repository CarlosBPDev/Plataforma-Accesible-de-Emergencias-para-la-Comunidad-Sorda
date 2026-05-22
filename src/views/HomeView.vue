<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'
import { emergencias } from '../data/emergencias'
import TriageCard from '../components/TriageCard.vue'
import SafeCalculatorOverlay from '../components/SafeCalculatorOverlay.vue'

const router = useRouter()
const store = useAlertStore()
const mostrarCalculadora = ref(false)

// Al montar el Home, nos aseguramos de resetear cualquier estado previo.
// Esto cumple con el criterio de aceptación de evitar fugas de estado al volver a /.
onMounted(() => {
  store.resetAlerta()
})

function handleSelect(id) {
  const emergencia = emergencias.find(e => e.id === id)
  if (emergencia) {
    store.setEmergencia(emergencia)
    router.push({ name: 'contexto' })
  }
}
</script>

<template>
  <div class="page home">
    <header class="home-header">
      <h1>Emergencias</h1>
      <router-link to="/victim/perfil" class="icon-btn" aria-label="Ir a perfil">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="10" r="3" />
          <path d="M6.17 18a6 6 0 0 1 11.66 0" />
        </svg>
      </router-link>
    </header>

    <!-- Botón de pánico principal -->
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
      ¿Qué sucede?
    </div>

    <!-- Mensaje si no hay datos de emergencia -->
    <p v-if="emergencias.length === 0" class="error-msg">
      No hay tipos de emergencia disponibles en este momento.
    </p>

    <!-- Rejilla de triaje con componente reutilizable -->
    <div v-else class="emergency-grid">
      <TriageCard
        v-for="em in emergencias"
        :key="em.id"
        v-bind="em"
        @select="handleSelect"
      />
    </div>

    <div class="section-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      Última actividad
    </div>

    <router-link to="/victim/historial" class="alert-mini">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3z" />
      </svg>
      <div class="a-info">
        <div class="a-type">Violencia</div>
        <div class="a-date">12 may 2026 - 14:32</div>
      </div>
      <div class="a-badge">Finalizada</div>
    </router-link>
    <button class="ocultar-mini" @click="mostrarCalculadora = true">
      Ocultar
    </button>
  </div>
</template>

<SafeCalculatorOverlay v-model="mostrarCalculadora" />

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
  font-weight: 800;
  color: var(--on-surface);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: var(--on-surface);
  text-decoration: none;
  background: var(--surface-2);
  transition: background-color 0.2s ease;
}

.icon-btn:active {
  background-color: var(--border);
}

.icon-btn svg {
  width: 24px;
  height: 24px;
}

.panic-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px;
  margin-bottom: 32px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(166, 33, 0, 0.25);
  transition: all 0.2s ease;
}

.panic-card:active {
  transform: scale(0.98);
  box-shadow: 0 4px 8px rgba(166, 33, 0, 0.3);
}

.panic-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.panic-left svg {
  width: 32px;
  height: 32px;
}

.panic-title {
  font-size: 20px;
  font-weight: 800;
  text-align: left;
}

.panic-sub {
  font-size: 14px;
  opacity: 0.9;
  text-align: left;
}

.panic-arrow {
  width: 24px;
  height: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--on-surface-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.section-title svg {
  width: 18px;
  height: 18px;
}

.emergency-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.error-msg {
  padding: 24px;
  text-align: center;
  color: var(--danger);
  background: rgba(198, 40, 40, 0.05);
  border-radius: var(--radius);
  font-weight: 600;
}

.alert-mini {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--surface-2);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--on-surface);
  transition: transform 0.2s ease;
}

.alert-mini:active {
  transform: scale(0.99);
}

.alert-mini svg {
  width: 24px;
  height: 24px;
  color: var(--on-surface-muted);
}

.ocultar-mini {
  margin-top: 16px;
  width: 100%;
  padding: 12px;
  border: 2px solid #222;
  border-radius: var(--radius);
  background: #222;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.a-info {
  flex: 1;
  text-align: left;
}

.a-type {
  font-size: 16px;
  font-weight: 700;
}

.a-date {
  font-size: 13px;
  color: var(--on-surface-muted);
}

.a-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(46, 125, 50, 0.1);
  color: var(--success);
}
</style>
