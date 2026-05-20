// Datos estáticos de los tipos de emergencia
// Se usan para renderizar las tarjetas con v-for en HomeView
export const emergencias = [
  {
    id: 'violencia',
    titulo: 'Violencia',
    icono: 'shield',
    color: '#c62828',
    description: 'Situación de violencia o agresión',
    gif_lsch: '/lsch/peligro.gif'
  },
  {
    id: 'robo',
    titulo: 'Robo',
    icono: 'lock',
    color: '#f57c00',
    description: 'Robo o hurto en curso',
    gif_lsch: '/lsch/emergencia.gif'
  },
  {
    id: 'accidente',
    titulo: 'Accidente',
    icono: 'warning',
    color: '#1565c0',
    description: 'Accidente de tránsito o laboral',
    gif_lsch: '/lsch/ayuda.gif'
  },
  {
    id: 'otra',
    titulo: 'Otra',
    icono: 'dots',
    color: '#6b6b6b',
    description: 'Otro tipo de emergencia',
    gif_lsch: '/lsch/peligro.gif'
  },
]
