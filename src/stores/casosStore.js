import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api.js'

const CARABINEROS_MOCK = [
  { nombre: 'Sargento Muñoz', unidad: '48° Comisaría' },
  { nombre: 'Cabo Pérez', unidad: '48° Comisaría' },
  { nombre: 'Teniente Soto', unidad: '48° Comisaría' },
  { nombre: 'Suboficial Rojas', unidad: '14° Comisaría' },
  { nombre: 'Carabinero Morales', unidad: '14° Comisaría' },
]

function calcularComisaria(ubicacion) {
  if (!ubicacion) return '48° Comisaría (por defecto)'
  const u = ubicacion.toLowerCase()
  if (u.includes('providencia') || u.includes('santiago')) return '48° Comisaría · Av. Providencia 123'
  if (u.includes('ñuño')) return '14° Comisaría · Av. Irarrázaval 2500'
  if (u.includes('la florida')) return '47° Comisaría · Av. Vicuña Mackenna 7000'
  if (u.includes('maipú')) return '52° Comisaría · Av. 5 de Abril 1500'
  if (u.includes('las condes') || u.includes('vitacura')) return '12° Comisaría · Av. Las Condes 8500'
  if (u.includes('independencia') || u.includes('recoleta')) return '3° Comisaría · Av. Independencia 700'
  return '48° Comisaría (cercanía estimada)'
}

function cargarCasosLocal() {
  try {
    const raw = localStorage.getItem('casos')
    if (!raw) return []
    return JSON.parse(raw).map(normalizeCase)
  } catch {
    return []
  }
}

function guardarCasosLocal(lista) {
  localStorage.setItem('casos', JSON.stringify(lista))
}

export const useCasosStore = defineStore('casos', () => {
  const casos = ref(cargarCasosLocal())
  const useAPI = ref(navigator.onLine)

  function sync() {
    guardarCasosLocal(casos.value)
  }

  const carabineros = ref(CARABINEROS_MOCK)

  const casosRecibidos = computed(() =>
    casos.value.filter(c => c.estado === 'recibida')
  )
  const casosAceptados = computed(() =>
    casos.value.filter(c => c.estado === 'aceptada')
  )
  const casosAsignados = computed(() =>
    casos.value.filter(c => c.estado === 'asignada' || c.estado === 'en_terreno')
  )
  const casosCompletados = computed(() =>
    casos.value.filter(c => c.estado === 'completada')
  )
  const casosDisponibles = computed(() =>
    casos.value.filter(c => c.estado === 'recibida' || c.estado === 'aceptada')
  )

  async function cargarCasos() {
    if (!useAPI.value) return
    try {
      const data = await api.casos.listar()
      const lista = data.results || data || []
      casos.value = lista.map(normalizeCase)
      sync()
    } catch (e) {
      console.warn('API no disponible, usando localStorage:', e.message)
    }
  }

  function normalizeCase(c) {
    return {
      ...c,
      victimRut: c.victim_rut || c.victimRut || '',
      victimNombre: c.victim_nombre || c.victimNombre || '',
      victimTelefono: c.victim_telefono || c.victimTelefono || '',
      victimContactoNombre: c.victim_contacto_nombre || c.victimContactoNombre || '',
      victimContactoTelefono: c.victim_contacto_telefono || c.victimContactoTelefono || '',
      estado: c.estado || 'recibida',
      creadoEn: c.creado_en || c.creadoEn || new Date().toISOString(),
      actualizadoEn: c.actualizado_en || c.actualizadoEn || new Date().toISOString(),
    }
  }

  async function crearCaso(datos) {
    const payload = {
      victimRut: datos.victimRut || '',
      victimNombre: datos.victimNombre || '',
      victimTelefono: datos.victimTelefono || '',
      victimContactoNombre: datos.victimContactoNombre || '',
      victimContactoTelefono: datos.victimContactoTelefono || '',
      emergencia: datos.emergencia || null,
      contexto: datos.contexto || { ubicacion: '', respuestas: {}, preguntas: {} },
      lat: datos.lat || null,
      lng: datos.lng || null,
    }

    if (useAPI.value) {
      try {
        const nuevo = normalizeCase(await api.casos.crear(payload))
        casos.value.unshift(nuevo)
        sync()
        return nuevo
      } catch (e) {
        console.warn('API error, creando localmente:', e.message)
      }
    }

    const nuevo = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...payload,
      victimContacto: datos.victimContacto || '',
      contactoEstado: null,
      contactoNotas: '',
      estado: 'asignada',
      asignados: ['Sargento Munoz', 'Cabo Perez'],
      comisariaCercana: calcularComisaria(datos.contexto?.ubicacion || ''),
      serviciosExternos: [
        { servicio: 'Ambulancia 131', contactado: false },
        { servicio: 'Bomberos 132', contactado: false },
      ],
      notaOperador: '',
      preguntasTerrenoPendientes: [],
      respuestasTerreno: {},
      ubicacionCarabinero: {},
      tiempoEstimadoLlegada: null,
      gpsLastUpdated: null,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      acta: null,
    }
    casos.value.unshift(nuevo)
    sync()
    return nuevo
  }

  async function aceptarCaso(casoId) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && c.estado === 'recibida') {
      c.estado = 'aceptada'
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.cambiarEstado(casoId, 'aceptada') } catch {}
      }
    }
  }

  async function asignarCarabinero(casoId, nombre) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && !c.asignados.includes(nombre)) {
      c.asignados.push(nombre)
      if (c.estado !== 'asignada') c.estado = 'asignada'
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.actualizar(casoId, { asignados: c.asignados, estado: c.estado }) } catch {}
      }
    }
  }

  async function quitarCarabinero(casoId, nombre) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.asignados = c.asignados.filter(n => n !== nombre)
      if (c.asignados.length === 0 && c.estado === 'asignada') {
        c.estado = 'aceptada'
      }
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.actualizar(casoId, { asignados: c.asignados, estado: c.estado }) } catch {}
      }
    }
  }

  async function iniciarEncuentro(casoId) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && c.estado === 'asignada') {
      c.estado = 'en_terreno'
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.cambiarEstado(casoId, 'en_terreno') } catch {}
      }
    }
  }

  async function marcarEnTerreno(casoId) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && (c.estado === 'asignada' || c.estado === 'aceptada')) {
      c.estado = 'en_terreno'
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.cambiarEstado(casoId, 'en_terreno') } catch {}
      }
    }
  }

  async function toggleServicioContactado(casoId, index) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && c.serviciosExternos && c.serviciosExternos[index]) {
      c.serviciosExternos[index].contactado = !c.serviciosExternos[index].contactado
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.actualizar(casoId, { serviciosExternos: c.serviciosExternos }) } catch {}
      }
    }
  }

  async function setContactoEstado(casoId, estado) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.contactoEstado = estado
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.actualizar(casoId, { contactoEstado: estado }) } catch {}
      }
    }
  }

  async function setContactoNotas(casoId, notas) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.contactoNotas = notas
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.actualizar(casoId, { contactoNotas: notas }) } catch {}
      }
    }
  }

  async function setNotaOperador(casoId, nota) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.notaOperador = nota
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.actualizar(casoId, { notaOperador: nota }) } catch {}
      }
    }
  }

  async function enviarPreguntasTerreno(casoId, arrayIds) {
    const c = casos.value.find(x => x.id === casoId)
    if (!c) return
    c.preguntasTerrenoPendientes = [...new Set([...c.preguntasTerrenoPendientes, ...arrayIds])]
    if (c.estado === 'asignada') c.estado = 'en_terreno'
    c.actualizadoEn = new Date().toISOString()
    sync()
    if (useAPI.value) {
      try { await api.casos.enviarPreguntas(casoId, arrayIds) } catch {}
    }
  }

  async function responderPreguntasTerreno(casoId, respuestasObj) {
    const c = casos.value.find(x => x.id === casoId)
    if (!c) return
    c.respuestasTerreno = { ...c.respuestasTerreno, ...respuestasObj }
    c.preguntasTerrenoPendientes = []
    c.actualizadoEn = new Date().toISOString()
    sync()
    if (useAPI.value) {
      try { await api.casos.responderPreguntas(casoId, respuestasObj) } catch {}
    }
  }

  async function completarCaso(casoId, acta) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.estado = 'completada'
      c.acta = acta
      c.actualizadoEn = new Date().toISOString()
      sync()
      if (useAPI.value) {
        try { await api.casos.actualizar(casoId, { estado: 'completada', acta }) } catch {}
      }
    }
  }

  async function actualizarGPS(casoId, lat, lng) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.ubicacionCarabinero = { lat, lng, actualizadoEn: new Date().toISOString() }
      sync()
      if (useAPI.value) {
        try { await api.casos.actualizarGPS(casoId, lat, lng) } catch {}
      }
    }
  }

  function getCasoPorId(casoId) {
    return casos.value.find(x => x.id === casoId) || null
  }

  function getCasosPorRut(rut) {
    return casos.value.filter(c => c.victimRut === rut)
  }

  async function actualizarCaso(casoId, datos) {
    const c = casos.value.find(x => x.id === casoId)
    if (!c) return
    Object.assign(c, datos)
    c.actualizadoEn = new Date().toISOString()
    sync()
    if (useAPI.value) {
      try { await api.casos.actualizar(casoId, datos) } catch {}
    }
  }

  async function enviarCasoAPI(casoId) {
    if (!useAPI.value) return
    const c = casos.value.find(x => x.id === casoId)
    if (!c) return
    try {
      await api.casos.actualizar(casoId, { estado: c.estado, contexto: c.contexto })
    } catch {}
  }

  return {
    casos,
    carabineros,
    casosRecibidos,
    casosAceptados,
    casosAsignados,
    casosCompletados,
    casosDisponibles,
    cargarCasos,
    crearCaso,
    actualizarCaso,
    aceptarCaso,
    asignarCarabinero,
    quitarCarabinero,
    iniciarEncuentro,
    marcarEnTerreno,
    toggleServicioContactado,
    setContactoEstado,
    setContactoNotas,
    setNotaOperador,
    enviarPreguntasTerreno,
    responderPreguntasTerreno,
    completarCaso,
    actualizarGPS,
    getCasoPorId,
    getCasosPorRut,
    calcularComisaria,
    sync,
    enviarCasoAPI,
  }
})
