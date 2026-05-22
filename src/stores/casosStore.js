import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

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

function cargarCasos() {
  try {
    const raw = localStorage.getItem('casos')
    if (!raw) return []
    const lista = JSON.parse(raw)
    return lista.map(c => {
      if (c.asignadoA && !c.asignados) c.asignados = [c.asignadoA]
      if (!c.asignados) c.asignados = []
      if (!c.serviciosExternos) c.serviciosExternos = []
      if (!c.comisariaCercana) c.comisariaCercana = ''
      if (!c.victimContactoNombre) c.victimContactoNombre = ''
      if (!c.victimContactoTelefono) c.victimContactoTelefono = ''
      if (!c.contactoEstado) c.contactoEstado = null
      if (!c.contactoNotas) c.contactoNotas = ''
      delete c.asignadoA
      return c
    })
  } catch {
    return []
  }
}

function guardarCasos(lista) {
  localStorage.setItem('casos', JSON.stringify(lista))
}

export const useCasosStore = defineStore('casos', () => {
  const casos = ref(cargarCasos())

  function sync() {
    guardarCasos(casos.value)
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

  function crearCaso(datos) {
    const nuevo = {
      id: generarId(),
      victimRut: datos.victimRut || '',
      victimNombre: datos.victimNombre || '',
      victimTelefono: datos.victimTelefono || '',
      victimContacto: datos.victimContacto || '',
      victimContactoNombre: datos.victimContactoNombre || '',
      victimContactoTelefono: datos.victimContactoTelefono || '',
      contactoEstado: null,
      contactoNotas: '',
      emergencia: datos.emergencia || null,
      contexto: datos.contexto || { ubicacion: '', respuestas: {}, preguntas: {} },
      estado: 'recibida',
      asignados: [],
      comisariaCercana: calcularComisaria(datos.contexto?.ubicacion || ''),
      serviciosExternos: [
        { servicio: 'Ambulancia 131', contactado: false },
        { servicio: 'Bomberos 132', contactado: false },
      ],
      notaOperador: '',
      preguntasTerrenoPendientes: [],
      respuestasTerreno: {},
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
      acta: null,
    }
    casos.value.unshift(nuevo)
    sync()
    return nuevo
  }

  function aceptarCaso(casoId) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && c.estado === 'recibida') {
      c.estado = 'aceptada'
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function asignarCarabinero(casoId, nombre) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && (c.estado === 'recibida' || c.estado === 'aceptada' || c.estado === 'asignada') && !c.asignados.includes(nombre)) {
      c.asignados.push(nombre)
      if (c.estado !== 'asignada') c.estado = 'asignada'
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function quitarCarabinero(casoId, nombre) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.asignados = c.asignados.filter(n => n !== nombre)
      if (c.asignados.length === 0 && c.estado === 'asignada') {
        c.estado = 'aceptada'
      }
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function iniciarEncuentro(casoId) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && c.estado === 'asignada') {
      c.estado = 'en_terreno'
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function marcarEnTerreno(casoId) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && (c.estado === 'asignada' || c.estado === 'aceptada')) {
      c.estado = 'en_terreno'
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function toggleServicioContactado(casoId, index) {
    const c = casos.value.find(x => x.id === casoId)
    if (c && c.serviciosExternos && c.serviciosExternos[index]) {
      c.serviciosExternos[index].contactado = !c.serviciosExternos[index].contactado
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function setContactoEstado(casoId, estado) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.contactoEstado = estado
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function setContactoNotas(casoId, notas) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.contactoNotas = notas
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function setNotaOperador(casoId, nota) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.notaOperador = nota
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function enviarPreguntasTerreno(casoId, arrayIds) {
    const c = casos.value.find(x => x.id === casoId)
    if (!c) return
    c.preguntasTerrenoPendientes = [...new Set([...c.preguntasTerrenoPendientes, ...arrayIds])]
    if (c.estado === 'asignada') c.estado = 'en_terreno'
    c.actualizadoEn = new Date().toISOString()
    sync()
  }

  function responderPreguntasTerreno(casoId, respuestasObj) {
    const c = casos.value.find(x => x.id === casoId)
    if (!c) return
    c.respuestasTerreno = { ...c.respuestasTerreno, ...respuestasObj }
    c.preguntasTerrenoPendientes = []
    c.actualizadoEn = new Date().toISOString()
    sync()
  }

  function completarCaso(casoId, acta) {
    const c = casos.value.find(x => x.id === casoId)
    if (c) {
      c.estado = 'completada'
      c.acta = acta
      c.actualizadoEn = new Date().toISOString()
      sync()
    }
  }

  function getCasoPorId(casoId) {
    return casos.value.find(x => x.id === casoId) || null
  }

  function getCasosPorRut(rut) {
    return casos.value.filter(c => c.victimRut === rut)
  }

  const casosDisponibles = computed(() =>
    casos.value.filter(c => c.estado === 'recibida' || c.estado === 'aceptada')
  )

  return {
    casos,
    carabineros,
    casosRecibidos,
    casosAceptados,
    casosAsignados,
    casosCompletados,
    casosDisponibles,
    crearCaso,
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
    getCasoPorId,
    getCasosPorRut,
    calcularComisaria,
    sync,
  }
})
