<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const pasoActual = ref(0)

const pasos = [
  {
    titulo: 'Selecciona tu emergencia',
    descripcion: 'Elige el tipo de problema que estás viviendo',
    icono: 'emergency',
  },
  {
    titulo: 'Responde preguntas rápidas',
    descripcion: 'Preguntas simples con opciones de un toque',
    icono: 'questions',
  },
  {
    titulo: 'Tu perfil se envía a carabineros',
    descripcion: 'RUT, nombre y contacto se envían automáticamente',
    icono: 'profile',
  },
  {
    titulo: 'Botón de pánico',
    descripcion: 'Manten presionado 4 segundos para emergencia directa',
    icono: 'panic',
  },
  {
    titulo: 'Modo camuflaje',
    descripcion: 'La calculadora oculta la app para tu seguridad',
    icono: 'calculator',
  },
]

function siguiente() {
  if (pasoActual.value < pasos.length - 1) {
    pasoActual.value++
  } else {
    cerrar()
  }
}

function cerrar() {
  localStorage.setItem('tutorialVisto', 'true')
  emit('update:modelValue', false)
  pasoActual.value = 0
}

onUnmounted(() => {
  pasoActual.value = 0
})
</script>

<template>
  <div v-if="modelValue" class="tutorial-overlay">
    <div class="tutorial-card">
      <div class="tutorial-header">
        <span class="tutorial-paso">Paso {{ pasoActual + 1 }} de {{ pasos.length }}</span>
        <button class="tutorial-close" @click="cerrar">&times;</button>
      </div>

      <div class="tutorial-content">
        <div class="tutorial-icon">
          <svg v-if="pasos[pasoActual].icono === 'emergency'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else-if="pasos[pasoActual].icono === 'questions'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else-if="pasos[pasoActual].icono === 'profile'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <svg v-else-if="pasos[pasoActual].icono === 'panic'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <svg v-else-if="pasos[pasoActual].icono === 'calculator'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="10" x2="8" y2="10.01"/>
            <line x1="12" y1="10" x2="12" y2="10.01"/>
            <line x1="16" y1="10" x2="16" y2="10.01"/>
            <line x1="8" y1="14" x2="8" y2="14.01"/>
            <line x1="12" y1="14" x2="12" y2="14.01"/>
            <line x1="16" y1="14" x2="16" y2="14.01"/>
            <line x1="8" y1="18" x2="8" y2="18.01"/>
            <line x1="12" y1="18" x2="12" y2="18.01"/>
            <line x1="16" y1="18" x2="16" y2="18.01"/>
          </svg>
        </div>
        <h3>{{ pasos[pasoActual].titulo }}</h3>
        <p>{{ pasos[pasoActual].descripcion }}</p>
      </div>

      <div class="tutorial-actions">
        <div class="tutorial-dots">
          <span
            v-for="(_, i) in pasos"
            :key="i"
            class="dot"
            :class="{ active: i === pasoActual }"
          />
        </div>
        <button class="tutorial-btn" @click="siguiente">
          {{ pasoActual < pasos.length - 1 ? 'Siguiente' : 'Entendido' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.tutorial-card {
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 360px;
  overflow: hidden;
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.tutorial-paso {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.tutorial-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;
}

.tutorial-content {
  padding: 32px 20px;
  text-align: center;
}

.tutorial-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #ecfdf5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tutorial-icon svg {
  width: 40px;
  height: 40px;
  color: #006F3E;
}

.tutorial-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.tutorial-content p {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.5;
}

.tutorial-actions {
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.tutorial-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  transition: all 0.2s;
}

.dot.active {
  background: #006F3E;
  width: 24px;
  border-radius: 4px;
}

.tutorial-btn {
  width: 100%;
  padding: 14px;
  background: #006F3E;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.tutorial-btn:active {
  background: #005a33;
}
</style>
