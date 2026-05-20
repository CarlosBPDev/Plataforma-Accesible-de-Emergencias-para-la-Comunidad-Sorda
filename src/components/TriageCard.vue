<script setup>
import { ref } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  titulo: { type: String, required: true },
  icono: { type: String, required: true },
  color: { type: String, default: '#6b6b6b' },
  gif_lsch: { type: String, default: '' }
})

const emit = defineEmits(['select'])

const isActive = ref(false)

const handleInteraction = (state) => {
  isActive.value = state
}

const handleClick = () => {
  emit('select', props.id)
}
</script>

<template>
  <button
    class="triage-card"
    :style="{ '--card-color': color }"
    @click="handleClick"
    @pointerenter="handleInteraction(true)"
    @pointerleave="handleInteraction(false)"
    @focus="handleInteraction(true)"
    @blur="handleInteraction(false)"
    :aria-label="`Seleccionar emergencia: ${titulo}`"
  >
    <div class="card-inner">
      <!-- GIF real de LSCh: se muestra al interactuar (hover/focus) -->
      <div v-if="isActive && gif_lsch" class="gif-container">
        <img :src="gif_lsch" :alt="`Seña LSCh de ${titulo}`" />
      </div>

      <!-- Vista normal: icono SVG + título -->
      <template v-else>
        <div class="icon-container">
          <svg v-if="icono === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3z" />
          </svg>
          <svg v-else-if="icono === 'lock'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <svg v-else-if="icono === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M6 12h12" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="16" r="1.5" />
          </svg>
        </div>
        <span class="card-label">{{ titulo }}</span>
      </template>
    </div>
  </button>
</template>

<style scoped>
.triage-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  min-width: 88px;
  width: 100%;
  padding: 0;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.25s ease-out;
  position: relative;
  overflow: hidden;
  outline: none;
}

.triage-card:hover,
.triage-card:focus {
  border-color: var(--card-color);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.triage-card:active {
  transform: scale(0.94);
}

.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  pointer-events: none;
  padding: 20px 16px 16px;
}

.gif-container {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
}

.gif-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-container {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-container svg {
  width: 76px;
  height: 76px;
  color: var(--card-color);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.triage-card:hover .icon-container svg,
.triage-card:focus .icon-container svg {
  transform: scale(1.08);
}

.card-label {
  font-size: 16px;
  font-weight: 800;
  color: var(--on-surface);
  letter-spacing: -0.3px;
}
</style>
