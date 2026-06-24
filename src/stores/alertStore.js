import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { api } from '../services/api.js'

async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return ''
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
      { headers: { 'User-Agent': 'EmergenciaApp/1.0' } }
    )
    const data = await res.json()
    if (data.display_name) {
      const parts = data.display_name.split(', ')
      if (parts.length >= 2) {
        return `${parts[0]}, ${parts[1]}`
      }
      return parts[0] || data.display_name
    }
  } catch {}
  return ''
}

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

  async function cargarPerfil() {
    try {
      const raw = localStorage.getItem('perfil')
      if (raw) {
        const data = JSON.parse(raw)
        Object.assign(perfil, data)
      }
    } catch {}

    if (perfil.rut && navigator.onLine) {
      try {
        const data = await api.perfil.obtener(perfil.rut)
        Object.assign(perfil, {
          rut: data.rut || perfil.rut,
          num_documento: data.num_documento || perfil.num_documento,
          nombre: data.nombre || perfil.nombre,
          telefono: data.telefono || perfil.telefono,
          direccion: data.direccion || perfil.direccion,
          contacto_nombre: data.contacto_nombre || perfil.contacto_nombre,
          contacto_telefono: data.contacto_telefono || perfil.contacto_telefono,
        })
        localStorage.setItem('perfil', JSON.stringify({ ...perfil }))
      } catch {}
    }
  }

  async function actualizarPerfil(data) {
    Object.assign(perfil, data)
    localStorage.setItem('perfil', JSON.stringify({ ...perfil }))

    if (navigator.onLine && perfil.rut) {
      try {
        await api.perfil.actualizar(perfil.rut, {
          rut: perfil.rut,
          num_documento: perfil.num_documento || '',
          nombre: perfil.nombre,
          telefono: perfil.telefono,
          direccion: perfil.direccion,
          contacto_nombre: perfil.contacto_nombre,
          contacto_telefono: perfil.contacto_telefono,
        })
      } catch {}
    }
  }

  const wizardStep = ref(0)
  const preguntaActual = ref(0)

  const respuestas = reactive({})
  const ubicacion = ref('')
  const ubicacionNombre = ref('')

  const encuentroActivo = ref(false)
  const encuentroModo = ref('carabinero')
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

  function setUbicacion(val, lat, lng) {
    ubicacion.value = val
    if (lat !== undefined && lng !== undefined) {
      perfil._lastLat = lat
      perfil._lastLng = lng
    }
    if (lat && lng) {
      reverseGeocode(lat, lng).then(nombre => {
        ubicacionNombre.value = nombre
      })
    }
  }

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
    ubicacionNombre,
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
