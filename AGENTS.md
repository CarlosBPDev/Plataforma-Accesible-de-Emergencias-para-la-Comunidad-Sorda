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

### Seguridad (VIF)

- **Protocolo de limpieza**: Al navegar fuera de `/exito`, se debe llamar a `resetAlerta()` y limpiar el almacenamiento local (`localStorage.clear()`).
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
