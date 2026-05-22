<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from '../stores/alertStore'
import { preguntasTerreno } from '../data/preguntasTerreno'

const router = useRouter()
const store = useAlertStore()

if (!store.emergenciaSeleccionada) {
  router.replace({ name: 'home' })
}

onMounted(() => {
  if (!store.ubicacion && store.perfil.direccion) {
    store.setUbicacion(store.perfil.direccion)
  }
})

const c = computed(() => store.emergenciaSeleccionada?.color || '#a62100')

const preguntasCategoria = computed(() => {
  if (!store.emergenciaSeleccionada) return []
  return preguntasTerreno.filter(
    p => p.categoria === store.emergenciaSeleccionada.titulo
  )
})

const pregunta = computed(() =>
  preguntasCategoria.value[store.preguntaActual] || null
)

const totalPreguntas = computed(() => preguntasCategoria.value.length)

// mapa: id global → índice local (1-based)
const indiceLocal = computed(() => {
  const m = {}
  preguntasCategoria.value.forEach((q, i) => {
    m[q.id] = i + 1
  })
  return m
})

const historial = ref([0])

function responder(opcion) {
  if (!pregunta.value) return
  store.setRespuesta(pregunta.value.id, opcion)
  const p = pregunta.value
  const salto = p.saltos?.[opcion] ?? p.siguiente
  if (salto) {
    const idx = preguntasCategoria.value.findIndex(q => q.id === salto)
    if (idx !== -1) {
      store.setPreguntaActual(idx)
      historial.value.push(idx)
      return
    }
  }
  const sig = store.preguntaActual + 1
  if (sig < totalPreguntas.value) {
    store.setPreguntaActual(sig)
    historial.value.push(sig)
  } else {
    store.setWizardStep(1)
  }
}

function volver() {
  if (store.wizardStep === 1) {
    store.setWizardStep(0)
    return
  }
  if (historial.value.length > 1) {
    historial.value.pop()
    store.setPreguntaActual(historial.value[historial.value.length - 1])
  } else {
    router.back()
  }
}

  function enviarAlerta() {
    store.setContexto({
      ubicacion: store.ubicacion,
      respuestas: { ...store.respuestas },
    })
    router.push({ name: 'exito' })
  }
</script>

<template>
  <div class="ctx" :style="{ '--c': c }">
    <header class="top">
      <button class="top-back" @click="volver" aria-label="Volver">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>

      <template v-if="store.wizardStep === 0">
        <span class="top-tit">Pregunta {{ store.preguntaActual + 1 }}/{{ totalPreguntas }}</span>
        <div class="dots">
          <div
            v-for="i in totalPreguntas"
            :key="i"
            class="dot"
            :class="{
              full: i - 1 < store.preguntaActual,
              cur: i - 1 === store.preguntaActual
            }"
          ></div>
        </div>
      </template>

      <template v-else>
        <span class="top-tit">Revisar y enviar</span>
        <div class="dots">
          <div
            v-for="i in totalPreguntas"
            :key="i"
            class="dot full"
          ></div>
        </div>
      </template>
    </header>

    <div class="body">
      <transition name="s" mode="out-in">
        <div v-if="store.wizardStep === 0 && pregunta" :key="'q' + pregunta.id" class="q">
          <div class="q-vid">
            <img :src="pregunta.gif_lsch" alt="LSCh" />
          </div>

          <p class="q-txt">{{ pregunta.pregunta_texto }}</p>

          <div class="q-opts">
            <button
              v-for="op in pregunta.opciones"
              :key="op"
              class="q-opt"
              @click="responder(op)"
            >
              <div class="q-opt-gif">
                <img :src="pregunta.gif_lsch" :alt="op" />
              </div>
              <span class="q-opt-lbl">{{ op }}</span>
            </button>
          </div>
        </div>
      </transition>

      <div v-if="store.wizardStep === 1" class="rv">
        <div class="rv-s">
          <h3>Ubicación</h3>
          <input
            :value="store.ubicacion"
            @input="store.setUbicacion($event.target.value)"
            type="text" placeholder="Av. Principal #123"
            class="rv-inp"
          />
        </div>

        <div v-if="Object.keys(store.respuestas).length" class="rv-s">
          <h3>Respuestas</h3>
          <div v-for="(opt, pid) in store.respuestas" :key="pid" class="rv-r">
            <div class="rv-q">
              <img :src="preguntasCategoria.find(p => p.id === Number(pid))?.gif_lsch" alt="LSCh" />
            </div>
            <div class="rv-a">
              <img :src="preguntasCategoria.find(p => p.id === Number(pid))?.gif_lsch" alt="Respuesta" />
              <span>{{ opt }}</span>
            </div>
          </div>
        </div>

        <button class="btn btn-s" @click="enviarAlerta">
          Enviar alerta
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ctx {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

/* top */
.top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #fff;
  border-bottom: 2px solid #eee;
  flex-shrink: 0;
}

.top-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #222;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-back svg {
  width: 18px;
  height: 18px;
}

.top-tit {
  font-size: 13px;
  font-weight: 800;
  color: var(--c);
  white-space: nowrap;
  flex-shrink: 0;
}

.dots {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: flex-end;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.dot.full {
  background: var(--c);
  opacity: 0.45;
}

.dot.cur {
  background: var(--c);
  opacity: 1;
  transform: scale(1.3);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--c) 18%, transparent);
}

/* body */
.body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 14px 20px;
  -webkit-overflow-scrolling: touch;
}

/* question */
.q {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.q-vid {
  position: relative;
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: #1a1a1a;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
}

.q-vid img {
  width: 100%;
  display: block;
  max-height: 28vh;
  object-fit: contain;
}

.q-txt {
  font-size: 17px;
  font-weight: 700;
  color: #222;
  text-align: center;
  margin: 0;
  line-height: 1.3;
}

.q-opts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.q-opt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition: transform 0.1s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
}

.q-opt:active {
  transform: scale(0.95);
}

.q-opt-gif {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f0f0f0;
}

.q-opt-gif img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.q-opt-lbl {
  font-size: 13px;
  font-weight: 700;
  color: #222;
  padding: 0 4px 6px;
}

/* review */
.rv {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 4px;
}

.rv-s h3 {
  font-size: 10px;
  font-weight: 800;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0 0 4px;
}

.rv-inp {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  color: #222;
  background: #fff;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.rv-inp:focus {
  outline: none;
  border-color: var(--c);
}

.rv-r {
  display: grid;
  grid-template-columns: 64px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.rv-q img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
  background: #1a1a1a;
}

.rv-a {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rv-a img {
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 8px;
  background: #1a1a1a;
}

.rv-a span {
  font-size: 13px;
  font-weight: 700;
  color: #222;
}

/* buttons */
.btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  background: var(--c);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.btn:active {
  transform: scale(0.97);
}

.btn-s {
  margin-top: 4px;
  padding: 15px 20px;
  font-size: 16px;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--c) 25%, transparent);
}

/* transition */
.s-enter-active { transition: all 0.2s ease-out; }
.s-leave-active { transition: all 0.12s ease-in; }
.s-enter-from { opacity: 0; transform: translateX(24px); }
.s-leave-to { opacity: 0; transform: translateX(-24px); }
</style>
