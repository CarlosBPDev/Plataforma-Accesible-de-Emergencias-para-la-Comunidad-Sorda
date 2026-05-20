# Guía del Proyecto — Emergencias

## Descripción

Aplicación móvil de asistencia en emergencias. Permite al usuario enviar alertas rápidas de distintos tipos (violencia, robo, accidente, otra), llevar un historial de alertas enviadas y gestionar su perfil. El diseño está pensado para uso en situaciones de estrés: botones grandes, navegación mínima y feedback visual claro.

## Tecnologías

| Herramienta | Versión | Propósito |
|---|---|---|
| Vite | 8.x | Bundler y servidor de desarrollo |
| Vue 3 | 3.5.x | Framework reactivo (Composition API, `<script setup>`) |
| Vue Router | 4.6.x | Enrutamiento del lado del cliente (SPA) |
| Pinia | 2.x | Gestión de estado centralizado |

## Estructura de Carpetas

```
TallerInterfaces/
├── docs/
│   └── guia-proyecto.md        # Esta guía
├── mockup/                     # Prototipo HTML de referencia
├── public/                     # Archivos estáticos (favicon, etc.)
├── src/
│   ├── data/
│   │   └── emergencias.js      # Datos estáticos de tipos de emergencia
│   ├── router/
│   │   └── index.js            # Configuración de rutas
│   ├── stores/
│   │   └── alertStore.js       # Store de Pinia para gestión de alertas
│   ├── views/                  # Páginas de la aplicación
│   │   ├── HomeView.vue        # Pantalla principal (/)
│   │   ├── ContextoView.vue    # Contexto de emergencia (/contexto)
│   │   ├── ExitoView.vue       # Confirmación de envío (/exito)
│   │   ├── HistorialView.vue   # Registro de alertas (/historial)
│   │   └── PerfilView.vue      # Configuración del usuario (/perfil)
│   ├── components/             # Componentes reutilizables
│   ├── assets/                 # Imágenes, fuentes, etc.
│   ├── App.vue                 # Componente raíz con <router-view>
│   ├── main.js                 # Punto de entrada de la app
│   └── style.css               # Estilos globales y transiciones
├── AGENTS.md                   # Convenciones para agentes de desarrollo
├── index.html                  # HTML base
├── package.json
└── vite.config.js
```

## Rutas

| Ruta | Nombre | Vista | Descripción |
|---|---|---|---|
| `/` | `home` | HomeView | Pantalla principal con botón de pánico y tarjetas de emergencia |
| `/contexto` | `contexto` | ContextoView | Wizard que recopila contexto de la emergencia (ubicación, detalles) |
| `/exito` | `exito` | ExitoView | Confirmación visual de que la alerta fue enviada |
| `/historial` | `historial` | HistorialView | Lista cronológica de alertas anteriores con su estado |
| `/perfil` | `perfil` | PerfilView | Datos del usuario, contactos de emergencia, configuración |

## Estado Global (Pinia)

### useAlertStore (`stores/alertStore.js`)

| Estado | Tipo | Descripción |
|---|---|---|
| `emergenciaSeleccionada` | `object \| null` | Tipo de emergencia que el usuario seleccionó |
| `contextoSeleccionado` | `object \| null` | Datos contextuales recopilados (ubicación, detalles) |

| Acción | Parámetro | Descripción |
|---|---|---|
| `setEmergencia(obj)` | `object` | Guarda la emergencia seleccionada |
| `setContexto(obj)` | `object` | Guarda el contexto de la emergencia |
| `resetAlerta()` | — | Limpia todo el estado de la alerta actual |

### Datos de Emergencias (`data/emergencias.js`)

Array de objetos con los 4 tipos de emergencia. Se renderiza con `v-for` en HomeView. Cada objeto tiene: `id`, `label`, `icon`, `color`, `description`.

## Transición entre rutas

Se usa `<transition name="fade" mode="out-in">` envolviendo `<router-view />` en `App.vue`. Esto produce un fundido suave (opacity 0→1 en 250ms) al cambiar de pantalla, evitando saltos bruscos.

## Bloqueo Móvil (CSS Reset Nativo)

- `overscroll-behavior-y: none` — sin rebote elástico al hacer scroll
- `user-select: none` — sin selección de texto con el dedo
- `-webkit-tap-highlight-color: transparent` — sin destello azul al tocar elementos

## Cómo Ejecutar

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Servidor de desarrollo con hot-reload
npm run dev

# Construir para producción
npm run build

# Previsualizar la build de producción
npm run preview
```

## Flujo de Usuario Típico

1. El usuario abre la app → ve **Home** con botón de pánico y categorías
2. Selecciona un tipo de emergencia → se guarda en `emergenciaSeleccionada` del store → va a **Contexto**
3. En Contexto da detalles → se guardan en `contextoSeleccionado` → envía alerta → ve **Éxito**
4. Puede revisar alertas previas en **Historial**
5. Puede gestionar sus datos en **Perfil**

## Criterios de Accesibilidad

- SVGs con `stroke="currentColor"` y `fill="currentColor"` para heredar color del contexto
- Contraste mínimo 3:1 en iconos (WCAG 2.2 AA)
- `aria-label` en botones y enlaces sin texto visible
- Sad Path: si el array de emergencias está vacío, se muestra mensaje de error
