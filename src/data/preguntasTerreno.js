export const preguntasTerreno = [
  {
    id: 1,
    categoria: 'Violencia',
    pregunta_texto: '¿El agresor sigue aquí?',
    opciones: ['Sí, está aquí', 'No, se fue', 'No sé'],
    gif_lsch: '/lsch/peligro.gif'
  },
  {
    id: 2,
    categoria: 'Violencia',
    pregunta_texto: '¿Tiene un arma?',
    opciones: ['Sí', 'No'],
    gif_lsch: '/lsch/peligro.gif'
  },
  {
    id: 3,
    categoria: 'Violencia',
    pregunta_texto: '¿Qué pasó?',
    opciones: ['Me golpeó', 'Me amenazó', 'Me empujó', 'Me insultó'],
    gif_lsch: '/lsch/peligro.gif'
  },
  {
    id: 4,
    categoria: 'Violencia',
    pregunta_texto: '¿Hay alguien herido?',
    opciones: ['Yo', 'Otra persona', 'Nadie'],
    gif_lsch: '/lsch/ayuda.gif'
  },
  {
    id: 5,
    categoria: 'Violencia',
    pregunta_texto: '¿Hay niños o ancianos?',
    opciones: ['Sí', 'No'],
    gif_lsch: '/lsch/peligro.gif'
  },
  {
    id: 6,
    categoria: 'Violencia',
    pregunta_texto: '¿Es la primera vez?',
    opciones: ['Sí, primera vez', 'No, ya antes', 'No sé'],
    gif_lsch: '/lsch/emergencia.gif'
  },
  {
    id: 7,
    categoria: 'Violencia',
    pregunta_texto: '¿Necesitas ambulancia?',
    opciones: ['Sí', 'No'],
    gif_lsch: '/lsch/ayuda.gif'
  },

  {
    id: 8,
    categoria: 'Robo',
    pregunta_texto: '¿Dónde fue? Casa o calle',
    opciones: ['En mi casa', 'En la calle'],
    saltos: { 'En mi casa': 9, 'En la calle': 11 },
    gif_lsch: '/lsch/emergencia.gif'
  },
  {
    id: 9,
    categoria: 'Robo',
    pregunta_texto: '¿Ladrones aquí?',
    opciones: ['Sí', 'No, ya se fueron'],
    gif_lsch: '/lsch/emergencia.gif'
  },
  {
    id: 10,
    categoria: 'Robo',
    pregunta_texto: '¿Te amenazaron con algo?',
    opciones: ['Con pistola', 'Con cuchillo', 'Sin armas', 'No vi'],
    gif_lsch: '/lsch/peligro.gif',
    siguiente: 13
  },
  {
    id: 11,
    categoria: 'Robo',
    pregunta_texto: '¿Cómo escaparon?',
    opciones: ['A pie', 'En auto', 'En moto', 'No vi'],
    gif_lsch: '/lsch/emergencia.gif'
  },
  {
    id: 12,
    categoria: 'Robo',
    pregunta_texto: '¿Cuántos eran?',
    opciones: ['Uno', 'Dos', 'Tres o más'],
    gif_lsch: '/lsch/emergencia.gif',
    siguiente: 13
  },
  {
    id: 13,
    categoria: 'Robo',
    pregunta_texto: '¿Te hicieron daño?',
    opciones: ['Me golpearon', 'No me tocaron', 'Me empujaron'],
    gif_lsch: '/lsch/peligro.gif'
  },
  {
    id: 14,
    categoria: 'Robo',
    pregunta_texto: '¿Necesitas ambulancia?',
    opciones: ['Sí', 'No'],
    gif_lsch: '/lsch/ayuda.gif'
  },

  {
    id: 15,
    categoria: 'Accidente',
    pregunta_texto: '¿Personas inconscientes?',
    opciones: ['Sí', 'No'],
    gif_lsch: '/lsch/ayuda.gif'
  },
  {
    id: 16,
    categoria: 'Accidente',
    pregunta_texto: '¿Personas atrapadas?',
    opciones: ['Sí', 'No', 'No sé'],
    gif_lsch: '/lsch/ayuda.gif'
  },
  {
    id: 17,
    categoria: 'Accidente',
    pregunta_texto: '¿Hay fuego o humo?',
    opciones: ['Sí, hay fuego', 'Solo humo', 'No'],
    gif_lsch: '/lsch/peligro.gif'
  },
  {
    id: 18,
    categoria: 'Accidente',
    pregunta_texto: '¿Cuántos vehículos?',
    opciones: ['Uno', 'Dos', 'Tres o más', 'Atropello'],
    gif_lsch: '/lsch/ayuda.gif'
  },
  {
    id: 19,
    categoria: 'Accidente',
    pregunta_texto: '¿Dónde fue?',
    opciones: ['En la calle', 'En carretera', 'En estacionamiento'],
    gif_lsch: '/lsch/emergencia.gif'
  },
  {
    id: 20,
    categoria: 'Accidente',
    pregunta_texto: '¿Estás herido?',
    opciones: ['Sí, estoy herido', 'No, solo testigo'],
    gif_lsch: '/lsch/ayuda.gif'
  },

  {
    id: 21,
    categoria: 'Otra',
    pregunta_texto: '¿Cuál es la emergencia?',
    opciones: ['Problema de salud', 'Incendio', 'Persona sospechosa', 'Ruidos fuertes'],
    gif_lsch: '/lsch/emergencia.gif'
  },
  {
    id: 22,
    categoria: 'Otra',
    pregunta_texto: '¿Tu vida corre peligro?',
    opciones: ['Sí, ahora', 'No por ahora', 'No sé'],
    gif_lsch: '/lsch/peligro.gif'
  },
  {
    id: 23,
    categoria: 'Otra',
    pregunta_texto: '¿Necesitas ambulancia?',
    opciones: ['Sí, urgente', 'Sí, pero no urgente', 'No'],
    gif_lsch: '/lsch/ayuda.gif'
  },
  {
    id: 24,
    categoria: 'Otra',
    pregunta_texto: '¿Llamamos a tu contacto?',
    opciones: ['Sí', 'No'],
    gif_lsch: '/lsch/ayuda.gif'
  },
]
