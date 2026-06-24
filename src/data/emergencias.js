export const emergencias = [
  {
    id: 1,
    titulo: 'Violencia Intrafamiliar',
    icono: 'violence',
    color: '#c62828',
    gif_lsch: '/lsch/peligro.gif',
    preguntas: [
      { id: 'vif_1', tipo: 'select', texto: '¿Agresor está aquí?', opciones: ['Sí', 'No'], gif_lsch: '/lsch/peligro.gif' },
      { id: 'vif_2', tipo: 'select', texto: '¿Hay armas?', opciones: ['Sí', 'No'], gif_lsch: '/lsch/peligro.gif' },
    ]
  },
  {
    id: 2,
    titulo: 'Robo',
    icono: 'robber',
    color: '#f57c00',
    gif_lsch: '/lsch/emergencia.gif',
    preguntas: [
      { id: 'rob_1', tipo: 'select', texto: '¿Hay armas?', opciones: ['Sí', 'No'], gif_lsch: '/lsch/emergencia.gif' },
      { id: 'rob_2', tipo: 'select', texto: '¿Hay heridos?', opciones: ['Sí', 'No'], gif_lsch: '/lsch/ayuda.gif' },
    ]
  },
  {
    id: 3,
    titulo: 'Accidente Auto',
    icono: 'crash',
    color: '#1565c0',
    gif_lsch: '/lsch/ayuda.gif',
    preguntas: [
      { id: 'acc_1', tipo: 'select', texto: '¿Hay heridos?', opciones: ['Sí', 'No'], gif_lsch: '/lsch/ayuda.gif' },
      { id: 'acc_2', tipo: 'select', texto: '¿Hay atrapados?', opciones: ['Sí', 'No'], gif_lsch: '/lsch/ayuda.gif' },
    ]
  },
  {
    id: 4,
    titulo: 'Maltrato Animal',
    icono: 'animal',
    color: '#7b1fa2',
    gif_lsch: '/lsch/peligro.gif',
    preguntas: [
      { id: 'mal_1', tipo: 'select', texto: '¿Agresor está aquí?', opciones: ['Sí', 'No'], gif_lsch: '/lsch/peligro.gif' },
    ]
  },
  {
    id: 5,
    titulo: 'Incendio',
    icono: 'fire',
    color: '#d84315',
    gif_lsch: '/lsch/ayuda.gif',
    preguntas: [
      { id: 'inc_1', tipo: 'select', texto: '¿Qué se quema?', opciones: ['Casa', 'Auto', 'Pastizal'], gif_lsch: '/lsch/peligro.gif' },
      { id: 'inc_2', tipo: 'select', texto: '¿Hay heridos?', opciones: ['Sí', 'No'], gif_lsch: '/lsch/ayuda.gif' },
      { id: 'inc_3', tipo: 'select', texto: '¿Hay atrapados?', opciones: ['Sí', 'No'], gif_lsch: '/lsch/ayuda.gif' },
    ]
  },
  {
    id: 6,
    titulo: 'Ambulancia',
    icono: 'ambulancia',
    color: '#2e7d32',
    gif_lsch: '/lsch/emergencia.gif',
    preguntas: [
      { id: 'amb_1', tipo: 'select', texto: '¿Qué sucede?', opciones: ['Infarto', 'Caída', 'Quemadura', 'Accidente'], gif_lsch: '/lsch/emergencia.gif' },
      { id: 'amb_2', tipo: 'select', texto: '¿A quién le pasa?', opciones: ['A mí', 'A otro'], gif_lsch: '/lsch/ayuda.gif' },
    ]
  },
]
