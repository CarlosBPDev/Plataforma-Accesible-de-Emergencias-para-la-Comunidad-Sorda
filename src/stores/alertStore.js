import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  const emergenciaSeleccionada = ref(null)
  const contextoSeleccionado = ref(null)

  const perfil = reactive({
    rut: '',
    nombre: '',
    telefono: '',
    direccion: '',
    contacto_nombre: '',
    contacto_telefono: '',
  })

  function cargarPerfil() {
    try {
      const raw = localStorage.getItem('perfil')
      if (raw) {
        const data = JSON.parse(raw)
        perfil.rut = data.rut || ''
        perfil.nombre = data.nombre || ''
        perfil.telefono = data.telefono || ''
        perfil.direccion = data.direccion || ''
        perfil.contacto_nombre = data.contacto_nombre || ''
        perfil.contacto_telefono = data.contacto_telefono || ''
      }
    } catch {}
  }

  function actualizarPerfil(data) {
    Object.assign(perfil, data)
    localStorage.setItem('perfil', JSON.stringify({ ...perfil }))
  }

  const wizardStep = ref(0)
  const preguntaActual = ref(0)

  const respuestas = reactive({})
  const ubicacion = ref('')

  // Estado del Encuentro en Terreno
  const encuentroActivo = ref(false)
  const encuentroModo = ref('carabinero') // 'carabinero' | 'sordo'
  const encuentroPreguntaActual = ref(0)
  const encuentroPreguntas = ref([])
  const encuentroRespuestas = reactive([])
  const encuentroMensajes = reactive([])
  const encuentroTimestamp = ref(null)
  const encuentroActa = ref(null)

  function setEmergencia(obj) {
    emergenciaSeleccionada.value = obj
  }

  function setContexto(obj) {
    contextoSeleccionado.value = obj
  }

  function setWizardStep(paso) {
    wizardStep.value = paso
  }

  function setPreguntaActual(idx) {
    preguntaActual.value = idx
  }

  function setRespuesta(preguntaId, opcion) {
    respuestas[preguntaId] = opcion
  }

  function setUbicacion(val) {
    ubicacion.value = val
  }

  // Acciones del Encuentro
  function iniciarEncuentro(preguntas) {
    encuentroActivo.value = true
    encuentroModo.value = 'carabinero'
    encuentroPreguntaActual.value = 0
    encuentroPreguntas.value = preguntas
    encuentroRespuestas.splice(0)
    encuentroMensajes.splice(0)
    encuentroTimestamp.value = new Date().toISOString()
    encuentroActa.value = null
  }

  function responderEncuentro(opcion) {
    const preguntas = encuentroPreguntas.value
    const idx = encuentroPreguntaActual.value
    if (idx >= preguntas.length) return
    const p = preguntas[idx]
    encuentroRespuestas.push({
      preguntaId: p.id,
      preguntaTexto: p.pregunta_texto,
      respuesta: opcion,
      timestamp: new Date().toISOString(),
    })
  }

  function avanzarEncuentro() {
    const total = encuentroPreguntas.value.length
    if (encuentroPreguntaActual.value < total - 1) {
      encuentroPreguntaActual.value++
    }
  }

  function retrocederEncuentro() {
    if (encuentroPreguntaActual.value > 0) {
      encuentroPreguntaActual.value--
    }
  }

  function toggleModoEncuentro() {
    encuentroModo.value = encuentroModo.value === 'carabinero' ? 'sordo' : 'carabinero'
  }

  function agregarMensajeEncuentro(tipo, texto) {
    encuentroMensajes.push({
      tipo,
      texto,
      timestamp: new Date().toISOString(),
    })
  }

  function cerrarEncuentro() {
    encuentroActa.value = {
      emergencia: emergenciaSeleccionada.value?.titulo || '',
      fecha: encuentroTimestamp.value,
      respuestas: [...encuentroRespuestas],
      mensajes: [...encuentroMensajes],
      cerrado: new Date().toISOString(),
    }
    encuentroActivo.value = false
  }

  function limpiarEncuentro() {
    encuentroActivo.value = false
    encuentroModo.value = 'carabinero'
    encuentroPreguntaActual.value = 0
    encuentroPreguntas.value = []
    encuentroRespuestas.splice(0)
    encuentroMensajes.splice(0)
    encuentroTimestamp.value = null
    encuentroActa.value = null
  }

  function resetAlerta() {
    emergenciaSeleccionada.value = null
    contextoSeleccionado.value = null
    wizardStep.value = 0
    preguntaActual.value = 0
    Object.keys(respuestas).forEach(k => delete respuestas[k])
    ubicacion.value = ''
    limpiarEncuentro()
  }

  cargarPerfil()

  return {
    emergenciaSeleccionada,
    contextoSeleccionado,
    wizardStep,
    preguntaActual,
    respuestas,
    ubicacion,
    encuentroActivo,
    encuentroModo,
    encuentroPreguntaActual,
    encuentroPreguntas,
    encuentroRespuestas,
    encuentroMensajes,
    encuentroTimestamp,
    encuentroActa,
    perfil,
    cargarPerfil,
    actualizarPerfil,
    setEmergencia,
    setContexto,
    setWizardStep,
    setPreguntaActual,
    setRespuesta,
    setUbicacion,
    iniciarEncuentro,
    responderEncuentro,
    avanzarEncuentro,
    retrocederEncuentro,
    toggleModoEncuentro,
    agregarMensajeEncuentro,
    cerrarEncuentro,
    limpiarEncuentro,
    resetAlerta,
  }
})
