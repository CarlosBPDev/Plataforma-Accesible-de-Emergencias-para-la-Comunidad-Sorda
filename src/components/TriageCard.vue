<script setup>
import { ref } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  icono: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#6b6b6b'
  },
  gif_lsch: {
    type: String,
    default: ''
  }
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
      <div class="icon-container">
        <!-- Ilustración animada para Violencia: mano en "stop" con escudo -->
        <svg v-if="icono === 'shield'" class="ls-ch lsch-violencia" viewBox="0 0 80 80" fill="none">
          <g class="hand">
            <!-- Palma abierta en posición de "alto" -->
            <rect x="28" y="20" width="24" height="40" rx="10" :stroke="color" stroke-width="2.5" />
            <!-- Dedos extendidos -->
            <line x1="34" y1="16" x2="30" y2="6" :stroke="color" stroke-width="2.5" stroke-linecap="round" />
            <line x1="40" y1="16" x2="40" y2="4" :stroke="color" stroke-width="2.5" stroke-linecap="round" />
            <line x1="46" y1="16" x2="50" y2="6" :stroke="color" stroke-width="2.5" stroke-linecap="round" />
            <!-- Escudo protector animado -->
            <path v-if="isActive" class="shield-anim" d="M14 40 L66 40" :stroke="color" stroke-width="2.5" stroke-linecap="round" opacity="0" />
          </g>
          <!-- Partículas de protección -->
          <circle v-if="isActive" class="particle p1" cx="20" cy="30" r="2.5" :fill="color" />
          <circle v-if="isActive" class="particle p2" cx="60" cy="50" r="2.5" :fill="color" />
          <circle v-if="isActive" class="particle p3" cx="25" cy="55" r="2" :fill="color" />
        </svg>

        <!-- Ilustración animada para Robo: mano cerrando/agarrando -->
        <svg v-else-if="icono === 'lock'" class="ls-ch lsch-robo" viewBox="0 0 80 80" fill="none">
          <g class="hand">
            <!-- Mano cerrando -->
            <rect x="28" y="24" width="24" height="36" rx="8" :stroke="color" stroke-width="2.5" />
            <!-- Pulgar cerrándose -->
            <path d="M52 34 Q62 30 58 40" :stroke="color" stroke-width="2.5" stroke-linecap="round" :class="{ 'thumb-close': isActive }" />
            <!-- Dedos superiores curvándose -->
            <path d="M32 24 Q40 18 48 24" :stroke="color" stroke-width="2.5" stroke-linecap="round" :class="{ 'fingers-curl': isActive }" />
          </g>
          <!-- Objeto siendo tomado (animación de desaparición) -->
          <rect v-if="isActive" x="35" y="44" width="10" height="10" rx="3" :fill="color" class="object-take" opacity="0.8" />
        </svg>

        <!-- Ilustración animada para Accidente: persona con alerta -->
        <svg v-else-if="icono === 'warning'" class="ls-ch lsch-accidente" viewBox="0 0 80 80" fill="none">
          <g class="person">
            <!-- Cabeza -->
            <circle cx="40" cy="22" r="10" :stroke="color" stroke-width="2.5" />
            <!-- Cuerpo -->
            <line x1="40" y1="32" x2="40" y2="52" :stroke="color" stroke-width="2.5" stroke-linecap="round" />
            <!-- Brazos alzados (alerta) -->
            <line x1="40" y1="38" x2="24" y2="28" :stroke="color" stroke-width="2.5" stroke-linecap="round" :class="{ 'arm-warn': isActive }" />
            <line x1="40" y1="38" x2="56" y2="28" :stroke="color" stroke-width="2.5" stroke-linecap="round" :class="{ 'arm-warn': isActive }" />
            <!-- Exclamación pulsante -->
            <g v-if="isActive" class="exclamation">
              <line x1="40" y1="12" x2="40" y2="4" :stroke="color" stroke-width="3" stroke-linecap="round" />
              <circle cx="40" cy="2" r="2" :fill="color" />
            </g>
          </g>
        </svg>

        <!-- Ilustración animada para Otra: mano con gesto de pregunta -->
        <svg v-else class="ls-ch lsch-otra" viewBox="0 0 80 80" fill="none">
          <g class="hand-question">
            <!-- Palma rotando -->
            <rect x="28" y="22" width="24" height="36" rx="10" :stroke="color" stroke-width="2.5" :class="{ 'palm-rotate': isActive }" />
            <!-- Dedos extendidos hacia arriba -->
            <line x1="34" y1="18" x2="32" y2="6" :stroke="color" stroke-width="2.5" stroke-linecap="round" :class="{ 'finger-wave': isActive }" />
            <line x1="40" y1="18" x2="40" y2="4" :stroke="color" stroke-width="2.5" stroke-linecap="round" :class="{ 'finger-wave': isActive }" />
            <line x1="46" y1="18" x2="48" y2="6" :stroke="color" stroke-width="2.5" stroke-linecap="round" :class="{ 'finger-wave': isActive }" />
          </g>
          <!-- Signo de pregunta animado -->
          <g v-if="isActive" class="question-mark">
            <path d="M60 16 Q64 10 60 6 Q56 2 52 6" :stroke="color" stroke-width="2.5" stroke-linecap="round" fill="none" />
            <circle cx="52" cy="14" r="2" :fill="color" />
          </g>
          <!-- Puntos suspensivos -->
          <circle v-if="isActive" class="dot d1" cx="40" cy="68" r="2.5" :fill="color" />
          <circle v-if="isActive" class="dot d2" cx="48" cy="68" r="2.5" :fill="color" />
          <circle v-if="isActive" class="dot d3" cx="56" cy="68" r="2.5" :fill="color" />
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
  min-height: 120px;
  min-width: 88px;
  width: 100%;
  padding: 20px 16px 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.25s ease-out;
  position: relative;
  overflow: visible;
  outline: none;
}

.triage-card:hover,
.triage-card:focus {
  border-color: var(--card-color);
  background: color-mix(in srgb, var(--card-color) 4%, var(--surface));
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-3px);
}

.triage-card:active {
  transform: scale(0.94);
}

.card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
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

/* ============================================
   Animaciones LSCh
   Solo se activan al hacer hover/focus
   ============================================ */

/* Violencia: partículas de protección */
@keyframes particleFloat {
  0% { opacity: 0; transform: translate(0, 0) scale(0); }
  20% { opacity: 0.6; }
  80% { opacity: 0.3; }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1); }
}

.particle {
  animation: particleFloat 1.5s ease-out infinite;
  animation-delay: var(--delay, 0s);
}
.p1 { --dx: -18px; --dy: -20px; --delay: 0s; }
.p2 { --dx: 18px; --dy: 10px; --delay: 0.3s; }
.p3 { --dx: -10px; --dy: 20px; --delay: 0.6s; }

@keyframes shieldPulse {
  0%, 100% { opacity: 0; transform: scaleX(0.8); }
  50% { opacity: 0.5; transform: scaleX(1); }
}

.shield-anim {
  animation: shieldPulse 1.2s ease-in-out infinite;
  transform-origin: center;
}

/* Robo: objetos siendo tomados */
@keyframes takeObject {
  0% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7) translateY(-4px); }
  100% { opacity: 0; transform: scale(0.3) translateY(-10px); }
}

.object-take {
  animation: takeObject 1.8s ease-in-out infinite;
}

@keyframes thumbClose {
  0% { transform: translate(0, 0); }
  50% { transform: translate(-4px, 2px); }
  100% { transform: translate(0, 0); }
}

.thumb-close {
  animation: thumbClose 1.5s ease-in-out infinite;
}

/* Accidente: brazos de alerta */
@keyframes armWarn {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(10deg); transform-origin: bottom; }
}

.arm-warn {
  animation: armWarn 0.8s ease-in-out infinite;
}

@keyframes exclamationPop {
  0%, 100% { opacity: 1; transform: translateY(0); }
  50% { opacity: 0.5; transform: translateY(-4px); }
}

.exclamation {
  animation: exclamationPop 0.7s ease-in-out infinite;
  transform-origin: center;
}

/* Otra: palm rotation */
@keyframes palmRotate {
  0% { transform: rotate(0deg); }
  30% { transform: rotate(8deg); }
  60% { transform: rotate(-8deg); }
  100% { transform: rotate(0deg); }
}

.palm-rotate {
  animation: palmRotate 1.5s ease-in-out infinite;
  transform-origin: center;
}

@keyframes fingerWave {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(5deg); }
}

.finger-wave:nth-child(1) {
  animation: fingerWave 1.2s ease-in-out infinite;
  transform-origin: bottom;
}
.finger-wave:nth-child(2) {
  animation: fingerWave 1.2s ease-in-out infinite 0.15s;
  transform-origin: bottom;
}
.finger-wave:nth-child(3) {
  animation: fingerWave 1.2s ease-in-out infinite 0.3s;
  transform-origin: bottom;
}

@keyframes questionFloat {
  0%, 100% { transform: translateY(0); opacity: 0; }
  30% { opacity: 1; transform: translateY(-6px); }
  70% { opacity: 1; }
}

.question-mark {
  animation: questionFloat 2s ease-in-out infinite;
}

@keyframes dotAppear {
  0%, 100% { opacity: 0; transform: scale(0); }
  40% { opacity: 1; transform: scale(1); }
  80% { opacity: 0.3; }
}

.dot {
  animation: dotAppear 1.8s ease-in-out infinite;
}
.d1 { animation-delay: 0s; }
.d2 { animation-delay: 0.3s; }
.d3 { animation-delay: 0.6s; }
</style>
