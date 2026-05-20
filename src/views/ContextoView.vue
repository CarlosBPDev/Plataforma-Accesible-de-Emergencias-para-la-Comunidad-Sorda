<script setup>
import { useRouter } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'

const router = useRouter()
const store = useAlertStore()

// Si no hay emergencia seleccionada, redirige al home
if (!store.emergenciaSeleccionada) {
  router.replace({ name: 'home' })
}
</script>

<template>
  <div class="page contexto">
    <header class="contexto-header">
      <button class="back-btn" @click="router.back()" aria-label="Volver">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1>Contexto</h1>
    </header>

    <div v-if="store.emergenciaSeleccionada" class="contexto-content">
      <div class="emergencia-badge" :style="{ '--badge-color': store.emergenciaSeleccionada.color }">
        {{ store.emergenciaSeleccionada.label }}
      </div>

      <p class="contexto-desc">
        {{ store.emergenciaSeleccionada.description }}
      </p>

      <div class="contexto-form">
        <label class="form-group">
          <span>Ubicación actual</span>
          <input type="text" placeholder="Ej: Av. Principal #123" />
        </label>
        <label class="form-group">
          <span>Detalles adicionales</span>
          <textarea rows="3" placeholder="Describe brevemente lo que sucede..."></textarea>
        </label>
      </div>

      <button class="submit-btn" @click="store.setContexto({ ubicacion: '', detalles: '' }); router.push({ name: 'exito' })">
        Enviar alerta
      </button>
    </div>
  </div>
</template>

<style scoped>
.contexto-header {
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
}

.back-btn svg {
  width: 22px;
  height: 22px;
}

.contexto-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.emergencia-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--badge-color);
}

.contexto-desc {
  margin: 12px 0 24px;
  color: var(--on-surface-muted);
  font-size: 15px;
}

.contexto-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--on-surface);
}

.form-group input,
.form-group textarea {
  padding: 12px 14px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 15px;
  font-family: inherit;
  color: var(--on-surface);
  background: var(--surface);
  transition: border-color 200ms ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.submit-btn:active {
  transform: scale(0.97);
}
</style>
