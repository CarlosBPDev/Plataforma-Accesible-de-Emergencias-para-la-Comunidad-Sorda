<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'
import { useCasosStore } from '../stores/casosStore'

const router = useRouter()
const alertStore = useAlertStore()
const casosStore = useCasosStore()

const respuestas = ref({})
const currentStep = ref(0)
const isSubmitting = ref(false)

const emergenciasData = computed(() => alertStore.emergenciaSeleccionada || { titulo: 'Emergencia', preguntas: [] })
const preguntaActual = computed(() => emergenciasData.value.preguntas?.[currentStep.value] || null)
const esUltimoPaso = computed(() => currentStep.value === emergenciasData.value.preguntas.length - 1)

const ultimoCaso = computed(() => {
  const casos = casosStore.casos
  return casos.length > 0 ? casos[casos.length - 1] : null
})

onMounted(() => {
  if (!alertStore.emergenciaSeleccionada) {
    router.push('/victim')
    return
  }
  if (ultimoCaso.value?.respuestas) {
    respuestas.value = { ...ultimoCaso.value.respuestas }
  }
})

function seleccionarRespuesta(opcion) {
  if (!preguntaActual.value) return
  respuestas.value[preguntaActual.value.id] = opcion.texto || opcion
}

function pasoAnterior() {
  if (currentStep.value <= 0) return
  currentStep.value--
}

async function handleFinalizar() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  if (!preguntaActual.value || !respuestas.value[preguntaActual.value.id]) {
    isSubmitting.value = false
    return
  }

  const caso = ultimoCaso.value
  if (!caso) {
    router.push('/victim')
    return
  }

  const respuestasActualizadas = { ...respuestas.value }
  casosStore.actualizarCaso(caso.id, {
    contexto: {
      ubicacion: alertStore.ubicacion || caso.contexto?.ubicacion || '',
      respuestas: respuestasActualizadas,
      preguntas: caso.contexto?.preguntas || {},
    },
    estado: 'aceptada',
  })

  await casosStore.enviarCasoAPI(caso.id)

  router.push({ name: 'exito' })
}

function handleAvanzarFlujo() {
  const preguntaId = preguntaActual.value?.id
  if (!preguntaId || !respuestas.value[preguntaId]) return

  if (esUltimoPaso.value) {
    handleFinalizar()
  } else {
    currentStep.value++
  }
}
</script>

<template>
  <div class="page contexto mobile-triage-container">
    <header class="triage-header">
      <button class="back-btn" @click="router.push('/victim')" aria-label="Volver">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="header-center-title">
        <span class="sub-dept">Carabineros de Chile</span>
        <h1>{{ emergenciasData.titulo }}</h1>
      </div>
      <img
        class="escudo-carabineros"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Roundel_of_Carabineros_de_Chile.svg/250px-Roundel_of_Carabineros_de_Chile.svg.png"
        alt="Carabineros"
      />
    </header>

    <main class="triage-body-scroll">
      <template v-if="preguntaActual">
        <div class="question-visual-box">
          <img
            v-if="preguntaActual.gif || preguntaActual.gif_lsch"
            :src="preguntaActual.gif || preguntaActual.gif_lsch"
            alt="Seña de la pregunta"
            class="triage-main-gif"
          />
          <h2 class="question-text-title">{{ preguntaActual.texto }}</h2>
        </div>

        <div class="options-media-grid">
          <button
            v-for="(opcion, index) in preguntaActual.opciones"
            :key="index"
            type="button"
            class="option-card-button"
            :class="{ 'is-selected': respuestas[preguntaActual.id] === (opcion.texto || opcion) }"
            @click="seleccionarRespuesta(opcion)"
          >
            <img
              :src="opcion.gif || opcion.gif_lsch || preguntaActual.opciones_gifs?.[index] || preguntaActual.gif || preguntaActual.gif_lsch"
              alt="Seña de la opción"
              class="option-button-gif"
            />
            <span class="option-card-label">{{ opcion.texto || opcion }}</span>
          </button>
        </div>

        <div class="triage-navigation-footer">
          <button
            v-if="currentStep > 0"
            class="nav-btn-back"
            @click="pasoAnterior"
          >
            <svg viewBox="0 0 320 512" fill="currentColor" stroke="none" style="width:20px;height:20px;display:block">
              <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
            </svg>
          </button>
          <button
            v-if="!esUltimoPaso"
            class="nav-btn-next"
            :disabled="!respuestas[preguntaActual?.id]"
            @click="handleAvanzarFlujo"
          >
            <svg viewBox="0 0 320 512" fill="currentColor" stroke="none" style="width:20px;height:20px;display:block">
              <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
            </svg>
          </button>
          <button
            v-else
            class="nav-btn-submit"
            :disabled="!respuestas[preguntaActual?.id] || isSubmitting"
            @click="handleAvanzarFlujo"
          >
            <svg viewBox="0 0 448 512" fill="currentColor" stroke="none" style="width:20px;height:20px;display:block">
              <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
            </svg>
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.mobile-triage-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #F4F7F5;
  font-family: 'Roboto', sans-serif;
}

.triage-header {
  height: 68px;
  background-color: #006F3E;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  color: #ffffff;
}

.back-btn {
  background: none;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
}
.back-btn svg {
  width: 26px;
  height: 26px;
}

.header-center-title {
  text-align: center;
}
.sub-dept {
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
  opacity: 0.85;
  display: block;
}
.header-center-title h1 {
  margin: 2px 0 0 0;
  font-size: 16px;
  font-weight: 900;
}
.escudo-carabineros {
  height: 34px;
  width: auto;
  display: block;
  filter: drop-shadow(0 0 1px rgba(255,255,255,0.5));
}

.triage-body-scroll {
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
}

.question-visual-box {
  background-color: #ffffff;
  border: 1px solid #D1DDD7;
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  text-align: center;
}
.question-visual-box img, .question-visual-box video {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 12px;
}
.question-text-title {
  font-size: 15px;
  font-weight: 900;
  color: #0A1410;
  line-height: 1.4;
}

.options-media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 24px;
}

.option-card-button {
  background: #ffffff;
  border: 2px solid #D1DDD7;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  box-sizing: border-box;
}

.option-card-button.is-selected, .option-card-button:active {
  border-color: #006F3E !important;
  background-color: rgba(0, 111, 62, 0.05) !important;
}

.option-card-button img {
  width: 100%;
  height: auto;
  max-height: 100px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}

.option-card-label {
  font-size: 12px;
  font-weight: 700;
  color: #0A1410;
  text-align: center;
}

.triage-navigation-footer {
  display: flex;
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 44px;
  justify-content: center;
}

.nav-btn-back {
  width: 48px;
  height: 48px;
  flex: none;
  padding: 0;
  background-color: #ffffff;
  color: #5A6E65;
  border: 2px solid #D1DDD7;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn-next, .nav-btn-submit {
  background-color: #006F3E;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  width: 48px;
  height: 48px;
  flex: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.nav-btn-next:disabled,
.nav-btn-submit:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.contexto, .mobile-triage-container {
  font-family: 'Roboto', sans-serif !important;
  background-color: #F4F7F5 !important;
}

.triage-header, .header-institucional {
  background-color: #006F3E !important;
  color: #ffffff !important;
}

.btn-siguiente, .btn-enviar, button[type="submit"], .triage-navigation-footer {
  margin-bottom: 44px !important;
}

.question-visual-box img, .options-media-grid img, .triage-accessible-card img {
  max-width: 100% !important;
  border-radius: 8px !important;
  object-fit: cover;
}

.triage-main-gif {
  width: 100% !important;
  max-height: 200px !important;
  object-fit: cover !important;
  border-radius: 8px;
  margin-bottom: 12px;
}

.option-button-gif {
  width: 100% !important;
  height: 90px !important;
  object-fit: cover !important;
  border-radius: 6px;
  margin-bottom: 6px;
}
</style>
