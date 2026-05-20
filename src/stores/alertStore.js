// Store central de alertas
// Gestiona el estado de la emergencia seleccionada y su contexto
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  // Estado: qué emergencia eligió el usuario y qué contexto recopiló
  const emergenciaSeleccionada = ref(null)
  const contextoSeleccionado = ref(null)

  // Acciones
  function setEmergencia(obj) {
    emergenciaSeleccionada.value = obj
  }

  function setContexto(obj) {
    contextoSeleccionado.value = obj
  }

  // Resetea todo el estado de la alerta actual
  function resetAlerta() {
    emergenciaSeleccionada.value = null
    contextoSeleccionado.value = null
  }

  return {
    emergenciaSeleccionada,
    contextoSeleccionado,
    setEmergencia,
    setContexto,
    resetAlerta,
  }
})
