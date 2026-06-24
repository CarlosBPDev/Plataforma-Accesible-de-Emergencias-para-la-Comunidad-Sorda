<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  id: { type: [String, Number], required: true },
  titulo: { type: String, required: true },
  icono: { type: String, required: true },
  color: { type: String, default: '#6b6b6b' },
  gif_lsch: { type: String, default: '' }
})

const emit = defineEmits(['select'])

const isTouchDevice = matchMedia('(hover: none)').matches || 'ontouchstart' in window
const gifActivo = ref(false)

function handleInteraction() {
  if (isTouchDevice && props.gif_lsch && !gifActivo.value) {
    gifActivo.value = true
    return
  }
  emit('select', props.id)
}

function onClickOutside(e) {
  if (gifActivo.value && !e.target.closest('.triage-card')) {
    gifActivo.value = false
  }
}

onMounted(() => {
  if (isTouchDevice) {
    document.addEventListener('click', onClickOutside)
  }
})

onUnmounted(() => {
  if (isTouchDevice) {
    document.removeEventListener('click', onClickOutside)
  }
})
</script>

<template>
  <button
    class="triage-card"
    :style="{ '--card-color': color }"
    :class="{ 'gif-activo': gifActivo }"
    @click="handleInteraction"
    @mouseenter="!isTouchDevice && (gifActivo = true)"
    @mouseleave="!isTouchDevice && (gifActivo = false)"
    :aria-label="'Seleccionar ' + titulo"
  >
    <div v-if="gif_lsch" class="card-gif">
      <img :src="gif_lsch" :alt="'LSCh ' + titulo" />
    </div>

    <div class="card-body">
      <div class="card-svg">
        <!-- Violencia Intrafamiliar -->
      <svg v-if="icono === 'violence'" viewBox="0 0 100 100" fill="currentColor">
        <path d="M50 20L10 50v40h80V50L50 20z"/>
        <circle cx="35" cy="65" r="6"/>
        <circle cx="55" cy="72" r="4"/>
        <path d="M35 71v14"/>
        <path d="M55 76v9"/>
        <ellipse cx="75" cy="15" rx="12" ry="10"/>
        <path d="M63 15v20"/>
        <path d="M75 8v7"/>
        <path d="M68 12h14"/>
        <path d="M70 25l5 5 5-5"/>
      </svg>

      <!-- Robo -->
      <svg v-else-if="icono === 'robber'" viewBox="0 0 576 512" fill="currentColor">
        <path d="M488.2 59.1C478.1 99.6 441.7 128 400 128s-78.1-28.4-88.2-68.9L303 24.2C298.8 7.1 281.4-3.3 264.2 1S236.7 22.6 241 39.8l8.7 34.9c11 44 40.2 79.6 78.3 99.6L328 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 16 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-305.7c38.1-20 67.3-55.6 78.3-99.6L559 39.8c4.3-17.1-6.1-34.5-23.3-38.8S501.2 7.1 497 24.2l-8.7 34.9zM400 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM80 96A48 48 0 1 0 80 0a48 48 0 1 0 0 96zm-8 32c-35.3 0-64 28.7-64 64l0 96 0 .6L8 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 16 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-227.3 13 20.5c5.9 9.2 16.1 14.9 27 14.9l48 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-30.4 0-37.4-58.9C157.6 142 132.1 128 104.7 128L72 128z"/>
      </svg>

      <!-- Accidente Auto -->
      <svg v-else-if="icono === 'crash'" viewBox="0 0 640 512" fill="currentColor">
        <path d="M213.2 32L288 32l0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-64 74.8 0c27.1 0 51.3 17.1 60.3 42.6l42.7 120.6c-10.9-2.1-22.2-3.2-33.8-3.2c-59.5 0-112.1 29.6-144 74.8l0-42.8c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32c2.3 0 4.6-.3 6.8-.7c-4.5 15.5-6.8 31.8-6.8 48.7c0 5.4 .2 10.7 .7 16l-.7 0c-17.7 0-32 14.3-32 32l0 64L86.6 480C56.5 480 32 455.5 32 425.4c0-6.2 1.1-12.4 3.1-18.2L152.9 74.6C162 49.1 186.1 32 213.2 32zM496 224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm0 240a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm0-192c-8.8 0-16 7.2-16 16l0 80c0 8.8 7.2 16 16 16s16-7.2 16-16l0-80c0-8.8-7.2-16-16-16z"/>
      </svg>

      <!-- Maltrato Animal -->
      <svg v-else-if="icono === 'animal'" viewBox="0 0 576 512" fill="currentColor">
        <path d="M226.5 92.9c-2.8-22.6-28-36.6-50.9-30.9s-37.3 28.4-34.5 51l12.9 106.2c2.8 22.6 28 36.6 50.9 30.9s37.3-28.4 34.5-51L226.5 92.9zM119.9 198.6c-19.5-12-45.1-6.8-55.6 12.9s-6.1 44.1 13.4 56.1l87.2 53.8c19.5 12 45.1 6.8 55.6-12.9s6.1-44.1-13.4-56.1l-87.2-53.8zM392.1 92.9c2.8-22.6-11.7-44.1-34.5-51s-48.1 8.3-50.9 30.9l-12.9 106.2c-2.8 22.6 11.7 44.1 34.5 51s48.1-8.3 50.9-30.9L392.1 92.9zM447.7 211.5c-10.5-19.7-36.1-24.9-55.6-12.9l-87.2 53.8c-19.5 12-24.4 38.3-13.4 56.1s36.1 24.9 55.6 12.9l87.2-53.8c19.5-12 24.4-38.3 13.4-56.1zM256 320c-35.3 0-64 28.7-64 64s28.7 64 64 64s64-28.7 64-64s-28.7-64-64-64z"/>
      </svg>

      <!-- Incendio -->
      <svg v-else-if="icono === 'fire'" viewBox="0 0 640 512" fill="currentColor">
        <path d="M288 350.1l0 1.9-32 0c-17.7 0-32 14.3-32 32l0 64 0 24c0 22.1-17.9 40-40 40l-24 0-31.9 0c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2l-16 0c-22.1 0-40-17.9-40-40l0-112c0-.9 0-1.9 .1-2.8l0-69.7-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L447.3 128.1c-12.3-1-25 3-34.8 11.7c-35.4 31.6-65.6 67.7-87.3 102.8C304.3 276.5 288 314.9 288 350.1zM480 512c-88.4 0-160-71.6-160-160c0-76.7 62.5-144.7 107.2-179.4c5-3.9 10.9-5.8 16.8-5.8c7.9-.1 16 3.1 22 9.2l46 46 11.3-11.3c11.7-11.7 30.6-12.7 42.3-1C624.5 268 640 320.2 640 352c0 88.4-71.6 160-160 160zm64-111.8c0-36.5-37-73-54.8-88.4c-5.4-4.7-13.1-4.7-18.5 0C453 327.1 416 363.6 416 400.2c0 35.3 28.7 64 64 64s64-28.7 64-64z"/>
      </svg>

      <!-- Ambulancia -->
      <svg v-else-if="icono === 'ambulancia'" viewBox="0 0 640 512" fill="currentColor">
        <path d="M192 96c0-35.3 28.7-64 64-64l96 0c35.3 0 64 28.7 64 64l0 32 48 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0 32c0 35.3-28.7 64-64 64l-192 0c-35.3 0-64-28.7-64-64l0-32-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48l48 0 0-32zm64 0l0 32 64 0 0-32-64 0zm-16 128l-48 0c-8.8 0-16 7.2-16 16l0 16 0 48c0 8.8 7.2 16 16 16l48 0 16 0 16 0 48 0c8.8 0 16-7.2 16-16l0-48 0-16c0-8.8-7.2-16-16-16l-48 0-16 0-16 0z"/>
      </svg>

      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
      </div>

      <span class="card-label">{{ titulo }}</span>
    </div>
  </button>
</template>

<style scoped>
.triage-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 170px;
  width: 100%;
  padding: 20px 12px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.25s ease-out;
  position: relative;
  overflow: hidden;
  outline: none;
}

.triage-card:hover {
  border-color: var(--card-color);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.triage-card:active {
  transform: scale(0.94);
}

.card-gif {
  display: none;
  position: absolute;
  inset: 0;
  z-index: 10;
}

.card-gif img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.triage-card:hover .card-gif,
.triage-card.gif-activo .card-gif {
  display: block;
}

.triage-card:hover .card-body,
.triage-card.gif-activo .card-body {
  display: none;
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 1;
}

.card-svg {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--card-color);
  flex-shrink: 0;
}

.card-svg svg {
  width: 52px;
  height: 52px;
}

.card-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--on-surface);
  text-align: center;
  line-height: 1.3;
}
</style>
