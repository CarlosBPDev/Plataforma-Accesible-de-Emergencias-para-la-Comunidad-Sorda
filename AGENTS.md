# AGENTS.md — Convenciones para Agentes de Desarrollo

> Este archivo contiene las reglas, convenciones y decisiones que todo agente (humano o IA) debe seguir al trabajar en este proyecto.

## Convenciones de Código

### Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos de vistas | PascalCase + sufijo `View.vue` | `HomeView.vue`, `PerfilView.vue` |
| Archivos de componentes | PascalCase + sufijo `...Component.vue` o descriptivo | `PanicButton.vue`, `AlertCard.vue` |
| Variables y funciones | camelCase | `handlePanicPress`, `alertList` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Rutas URL | minúsculas con guiones si es necesario | `/historial`, `/mi-perfil` |
| Nombres de ruta (name) | minúsculas, una palabra | `home`, `contexto`, `exito` |

### Estructura de Componentes Vue

Siempre usar `<script setup>` con Composition API. Orden de bloques:

```vue
<script setup>
// 1. Imports
// 2. Props / Emits
// 3. Estado reactivo (ref, reactive)
// 4. Computed
// 5. Métodos / funciones
// 6. Lifecycle hooks (onMounted, etc.)
</script>

<template>
  <!-- Markup -->
</template>

<style scoped>
/* Estilos scoped al componente */
</style>
```

### Comentarios en Código

- **Solo en funciones complejas**: comentar lógica no obvia, algoritmos o decisiones técnicas
- **No comentar lo evidente**: `<template>` y código autoexplicativo no necesitan comentarios
- **Idioma**: español

### Estilo

- 2 espacios de indentación
- Sin punto y coma al final de líneas en JS/TS
- Single quotes para strings en JS, double quotes en HTML
- CSS: propiedades en orden lógico (layout → box model → typography → visual)

## Decisiones de Diseño

### Stack: Vite + Vue 3 + Vue Router

- **Vite** sobre Webpack por velocidad de desarrollo (HMR instantáneo)
- **Vue 3 Composition API** (`<script setup>`) por mejor organización del código y type inference
- **Vue Router 4** con `createWebHistory` para URLs limpias (sin hash)

### Transición Fade

- `<transition name="fade" mode="out-in">` en `App.vue`
- `mode="out-in"` asegura que el componente actual se desvanezca antes de que entre el nuevo
- 250ms de duración: lo suficientemente rápido para no molestar, lo suficientemente lento para ser perceptible

### Estructura de Rutas

- Rutas planas (sin nested routes por ahora)
- Cada ruta tiene un `name` para usar en `router.push({ name: '...' })` en vez de hardcodear paths
- Las vistas viven en `src/views/`, los componentes reutilizables en `src/components/`

### Estado Global (Pinia)

- **Pinia** como store oficial de Vue 3 (no Vuex)
- Stores en `src/stores/` con nomenclatura `...Store.js`
- Usar Composition API style: `defineStore('nombre', () => { ... })`
- Estado con `ref()`, acciones como funciones normales
- `resetAlerta()` limpia todo el estado de la alerta actual
- Si no hay `emergenciaSeleccionada` al entrar a `/contexto`, redirigir a `/`

### Datos Estáticos

- Arrays de datos en `src/data/` (ej. `emergencias.js`)
- Se renderizan con `v-for`, nunca hardcodear tarjetas en el template

### Inclusión de Personas Sordas (LSCh)

- **No infantilizar**: Las personas sordas chilenas son una comunidad lingüística y cultural, no personas con capacidades reducidas. El diseño debe ser digno y respetuoso.
- **No asumir español escrito**: Muchas personas sordas tienen el español como segunda lengua y pueden tener dificultades de lectura. Priorizar siempre la comunicación visual.
- **Pictogramas y elementos visuales**: Toda interfaz debe ser comprensible sin depender de texto. Iconos, colores, animaciones y GIFs deben comunicar el mensaje por sí solos.
- **GIFs de lengua de señas**: Siempre que sea posible, usar GIFs reales de personas haciendo señas (LSCh) en lugar de ilustraciones genéricas. Los GIFs se reproducen al interactuar (hover/focus/tap), no al cargar la vista.
- **Idioma de comentarios y documentación**: Español (para el equipo de desarrollo), pero la interfaz debe minimizar el uso de texto.

### CentralView — Flujo del Operador

- **Fondo blanco, letras negras**: sin dark theme, diseño funcional mínimo.
- **Workflow obligatorio**:
  1. El caso llega como `recibida`.
  2. El operador **debe contactar al contacto de emergencia** antes de aceptar. Mientras no se presione "Contactado" o "Sin respuesta", el botón "Aceptar" está deshabilitado y se muestra un aviso amarillo.
  3. Al aceptar, pasa a `aceptada`.
  4. El operador puede **asignar múltiples carabineros** usando checkboxes + botón "Asignar".
  5. Puede **contactar servicios externos** (Ambulancia 131, Bomberos 132) con toggle "He contactado".
  6. El carabinero recibe toda esta info en PoliciaView.

### casosStore — Esquema completo

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | ID único generado con timestamp + random |
| `victimRut` | string | RUT de la víctima |
| `victimNombre` | string | Nombre de la víctima |
| `victimTelefono` | string | Teléfono de la víctima |
| `victimContactoNombre` | string | Nombre del contacto de emergencia |
| `victimContactoTelefono` | string | Teléfono del contacto de emergencia |
| `contactoEstado` | string|null | `null` (pendiente), `'contactado'`, `'sin_respuesta'` |
| `contactoNotas` | string | Notas del operador sobre la llamada al contacto |
| `emergencia` | object | Objeto de emergencia (titulo, color, gif, etc.) |
| `contexto` | object | `{ ubicacion, respuestas, preguntas }` |
| `estado` | string | `recibida` → `aceptada` → `asignada` → `en_terreno` → `completada` |
| `asignados` | string[] | Array de nombres de carabineros asignados |
| `comisariaCercana` | string | Nombre de la comisaría más cercana (mockup basado en ubicación) |
| `serviciosExternos` | array | `[{ servicio: 'Ambulancia 131', contactado: false }, { servicio: 'Bomberos 132', contactado: false }]` |
| `notaOperador` | string | Nota escrita por el operador para el carabinero |
| `preguntasTerrenoPendientes` | number[] | IDs de preguntas enviadas al terreno |
| `respuestasTerreno` | object | Mapa `preguntaId → respuesta` recibido de la víctima |
| `creadoEn` | ISO string | Fecha de creación |
| `actualizadoEn` | ISO string | Última actualización |
| `acta` | object|null | Acta del encuentro en terreno |

### CasosStore — Migración desde schema anterior

- `asignadoA` (string) → `asignados` (string[]), migración automática en `cargarCasos()`
- `despacho` (string) → reemplazado por `serviciosExternos` (array de objetos)
- Campos nuevos opcionales: `victimContactoNombre`, `victimContactoTelefono`, `contactoEstado`, `contactoNotas`, `comisariaCercana`, `serviciosExternos`

### Comisaría Cercana (Mockup)

`calcularComisaria(ubicacion)` en `casosStore.js` hace match por palabras clave en la dirección:

| Palabra clave | Comisaría |
|---|---|
| providencia, santiago | 48° Comisaría |
| ñuño | 14° Comisaría |
| la florida | 47° Comisaría |
| maipú | 52° Comisaría |
| las condes, vitacura | 12° Comisaría |
| independencia, recoleta | 3° Comisaría |
| default | 48° Comisaría (cercanía estimada) |

### CentralView — Asignación Múltiple de Carabineros

- Los carabineros se muestran con checkboxes.
- Se pueden seleccionar varios y asignar de golpe con "Asignar (N)".
- Los ya asignados aparecen deshabilitados con badge "Asignado".
- Se pueden remover individualmente con botón ✕.

### CentralView — Servicios Externos

- Dos servicios: **Ambulancia 131** y **Bomberos 132**.
- Cada uno tiene un botón toggle "He contactado" que cambia de estado.
- El estado se envía al carabinero (se muestra en PoliciaView detail).
- Los números de emergencia chilenos se muestran como ayuda textual.

### Seguridad (VIF)

- **Protocolo de limpieza (autodestrucción)**: Al salir de `/exito`, ejecutar `resetAlerta()`, `localStorage.clear()` y `sessionStorage.clear()` en `onUnmounted`. También en `onBeforeRouteLeave` como doble capa de seguridad. Todo en español.
- **Feedback de red**: Usar `navigator.onLine` para adaptar la UI en pasos críticos (como la confirmación de envío).

### CSS

- Variables CSS en `:root` para colores, spacing y tipografía
- `style.css` contiene solo estilos globales y transiciones
- Cada componente usa `<style scoped>` para sus estilos propios
- Mobile-first: la app está diseñada para viewport de máximo 480px
- `overscroll-behavior-y: none` en body para evitar rebote elástico
- `user-select: none` en body para evitar selección de texto
- `-webkit-tap-highlight-color: transparent` en body y `*` para evitar destello azul

## Workflow del Equipo

### Ramas (Branches)

- `main` — código estable, siempre funcional
- `feat/<nombre>` — nuevas funcionalidades (ej. `feat/panic-button`)
- `fix/<nombre>` — corrección de bugs (ej. `fix/route-guard`)
- `chore/<nombre>` — mantenimiento, configuración (ej. `chore/update-deps`)

### Commits

Formato: `tipo: descripción corta`

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Cambios de formato (sin afectar lógica) |
| `refactor` | Reestructuración sin cambiar comportamiento |
| `chore` | Tareas de mantenimiento |

Ejemplos:
```
feat: agregar botón de pánico con hold de 4s
fix: corregir navegación a ruta /exito
docs: actualizar guía de rutas
refactor: extraer componente AlertCard
```

### Pull Requests

1. Crear rama desde `main`
2. Desarrollar la funcionalidad
3. Verificar que `npm run build` funciona sin errores
4. Abrir PR con descripción de cambios
5. Revisión de al menos 1 persona antes de merge

### Verificación Antes de Commit

```bash
# Verificar que la build funciona
npm run build

# Verificar que no hay errores en consola del navegador
npm run dev  # y probar manualmente
```
