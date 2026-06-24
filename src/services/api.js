const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error de red' }))
    throw new Error(error.detail || error.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  auth: {
    register: (datos) =>
      request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(datos),
      }),
  },
  casos: {
    listar: () => request('/casos/'),
    obtener: (id) => request(`/casos/${id}/`),
    crear: (datos) => request('/casos/', { method: 'POST', body: JSON.stringify(datos) }),
    actualizar: (id, datos) => request(`/casos/${id}/`, { method: 'PUT', body: JSON.stringify(datos) }),
    cambiarEstado: (id, estado) => request(`/casos/${id}/estado/`, { method: 'PUT', body: JSON.stringify({ estado }) }),
    enviarPreguntas: (id, preguntas) => request(`/casos/${id}/preguntas/`, { method: 'POST', body: JSON.stringify({ preguntas }) }),
    responderPreguntas: (id, respuestas) => request(`/casos/${id}/responder/`, { method: 'POST', body: JSON.stringify({ respuestas }) }),
    actualizarGPS: (id, lat, lng) => request(`/casos/${id}/gps/`, { method: 'POST', body: JSON.stringify({ lat, lng }) }),
    porRut: (rut) => request(`/casos/rut/${rut}/`),
    eliminar: (id) => request(`/casos/${id}/`, { method: 'DELETE' }),
  },
  perfil: {
    obtener: (rut) => request(`/perfil/${rut}/`),
    guardar: (datos) => request('/perfil/', { method: 'POST', body: JSON.stringify(datos) }),
    actualizar: (rut, datos) => request(`/perfil/${rut}/`, { method: 'PUT', body: JSON.stringify(datos) }),
  },
  carabineros: {
    listar: () => request('/carabineros/'),
  },
}

let gpsSocket = null

export function connectGPSSocket(casoId, callbacks = {}) {
  if (gpsSocket) {
    gpsSocket.close()
  }
  gpsSocket = new WebSocket(`${WS_BASE}/casos/${casoId}/gps/`)

  gpsSocket.onopen = () => {
    console.log('GPS WebSocket connected')
    callbacks.onConnect?.()
  }

  gpsSocket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    callbacks.onMessage?.(data)
  }

  gpsSocket.onerror = (error) => {
    console.error('GPS WebSocket error:', error)
    callbacks.onError?.(error)
  }

  gpsSocket.onclose = () => {
    console.log('GPS WebSocket closed')
    callbacks.onClose?.()
    gpsSocket = null
  }

  return gpsSocket
}

export function sendGPSUpdate(lat, lng) {
  if (gpsSocket && gpsSocket.readyState === WebSocket.OPEN) {
    gpsSocket.send(JSON.stringify({ lat, lng }))
  }
}

export function closeGPSSocket() {
  if (gpsSocket) {
    gpsSocket.close()
    gpsSocket = null
  }
}
