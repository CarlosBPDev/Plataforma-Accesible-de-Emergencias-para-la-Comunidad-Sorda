// Datos estáticos de los tipos de emergencia
// Se usan para renderizar las tarjetas con v-for en HomeView
export const emergencias = [
  {
    id: 'violencia',
    label: 'Violencia',
    icon: 'shield',
    color: '#c62828',
    description: 'Situación de violencia o agresión',
  },
  {
    id: 'robo',
    label: 'Robo',
    icon: 'lock',
    color: '#f57c00',
    description: 'Robo o hurto en curso',
  },
  {
    id: 'accidente',
    label: 'Accidente',
    icon: 'warning',
    color: '#1565c0',
    description: 'Accidente de tránsito o laboral',
  },
  {
    id: 'otra',
    label: 'Otra',
    icon: 'dots',
    color: '#6b6b6b',
    description: 'Otro tipo de emergencia',
  },
]
