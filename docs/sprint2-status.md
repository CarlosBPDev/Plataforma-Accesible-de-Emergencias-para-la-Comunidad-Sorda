# Sprint 2 - Estado de Implementación

## Historias de Usuario Completadas

### FRONT-03: onUnmounted SafeCalculatorOverlay ✅
**Archivo:** `src/components/SafeCalculatorOverlay.vue`

**Cambios realizados:**
- Importado `onUnmounted` desde Vue
- Agregado hook `onUnmounted` que limpia:
  - `display.value = ''` (liberar referencia de memoria)
  - `sessionStorage.clear()` (limpiar storage de sesión)

---

### FRONT-04: Variables de perfil en crearCaso() ✅
**Archivos:** `src/stores/casosStore.js` + `src/views/ExitoView.vue`

**Estado:** Ya implementado en Sprint 1. Se verificó que ExitoView.vue pasa todos los campos del perfil:
- victimRut
- victimNombre
- victimTelefono
- victimContactoNombre
- victimContactoTelefono

---

## Feedback de Usuarios - Palabras más Claras ✅

### Cambios en `src/data/emergencias.js`:
| Campo | Antes | Después |
|-------|-------|---------|
| titulo (id:2) | "Robo o Hurto" | "Ladrón / Robo" |
| icono (id:1) | "shield" | "shield-alert" |
| vif_1 opciones | 2 opciones | 3 opciones (agregado "Está en otra habitación") |
| vif_2 opciones | 3 opciones | 4 opciones (agregado "Objetos contundentes") |
| vif_3 opciones | 2 opciones | 3 opciones (agregado "Heridas leves" / "Heridas graves") |

### Cambios en `src/data/preguntasTerreno.js`:
| Pregunta ID | Antes | Después |
|-------------|-------|---------|
| 8 | "¿Fue en tu casa o en la calle?" | "¿Dónde fue? Casa o calle" |
| 9 | "¿Los ladrones siguen ahí?" | "¿Ladrones aquí?" |
| 11 | "¿Viste cómo escaparon?" | "¿Cómo escaparon?" |
| 15 | "¿Hay personas inconscientes?" | "¿Personas inconscientes?" |
| 16 | "¿Hay personas atrapadas?" | "¿Personas atrapadas?" |
| 7, 14, 23 | "¿Necesitas una ambulancia?" | "¿Necesitas ambulancia?" |

### Cambios en `src/data/preguntasTerrenoCarabineros.js`:
| Pregunta ID | Antes | Después |
|-------------|-------|---------|
| 1 | "¿Eres tú quien pidió ayuda por la aplicación?" | "¿Eres tú quien pidió ayuda?" |
| 2 | "¿Entiendes lo que dice esta pantalla?" | "¿Entiendes esta pantalla?" |
| 3 | "¿Estás herido/a o sangrando?" | "¿Estás herido/a?" |
| 4 | "¿Necesitas que llamemos a una ambulancia urgente?" | "¿Necesitas ambulancia urgente?" |
| 5 | "¿Estás completamente solo/a aquí?" | "¿Estás solo/a aquí?" |
| 6 | "¿Hay cámaras de seguridad en este lugar?" | "¿Hay cámaras aquí?" |
| 7 | "¿Quieres hacer la denuncia oficial ahora mismo?" | "¿Quieres hacer la denuncia ahora?" |
| 8 | "¿El agresor está dentro de esta casa AHORA MISMO?" | "¿El agresor está aquí AHORA?" |
| 9 | "¿El agresor tiene un arma (cuchillo, pistola o similar)?" | "¿El agresor tiene arma?" |
| 10 | "¿Te golpeó o te amenazó de muerte hoy?" | "¿Te golpeó o amenazó hoy?" |
| 11 | "¿Hay niños pequeños o ancianos en peligro aquí?" | "¿Hay niños o ancianos en peligro?" |
| 12 | "¿Tienes una orden de alejamiento vigente contra esta persona?" | "¿Tienes orden de alejamiento?" |
| 13 | "¿Los delincuentes siguen aquí adentro?" | "¿Ladrones aquí?" |
| 14 | "¿Te mostraron armas de fuego o cuchillos?" | "¿Te mostraron armas?" |
| 15 | "¿Se llevaron tus documentos de identidad?" | "¿Se llevaron tus documentos?" |
| 16 | "¿Los ladrones escaparon en un vehículo (auto/moto)?" | "¿Escaparon en auto?" |
| 17 | "¿Te golpearon durante el robo?" | "¿Te golpearon durante el robo?" |
| 18 | "¿Hay personas atrapadas dentro de los vehículos?" | "¿Personas atrapadas en vehículos?" |
| 19 | "¿Hay alguna persona inconsciente o que no respira?" | "¿Alguien inconsciente o no respira?" |
| 20 | "¿El otro conductor se arrancó del lugar?" | "¿El otro conductor se fue?" |
| 21 | "¿Tú ibas manejando?" | "¿Tú ibas manejando?" |
| 22 | "¿La persona sospechosa sigue cerca de aquí?" | "¿Sospechoso sigue cerca?" |
| 23 | "¿El sospechoso intentó forzar la puerta o ventana?" | "¿Intentó forzar puerta o ventana?" |
| 24 | "¿Tu vida corre peligro en este exacto momento?" | "¿Tu vida en peligro ahora?" |

---

## Funcionalidades Nuevas

### Tutorial al Descargar ✅
**Archivo:** `src/components/TutorialOverlay.vue` (NUEVO)

**Características:**
- 5 pasos: Emergencia, Preguntas, Perfil, Botón pánico, Modo camuflaje
- Persistencia en `localStorage.setItem('tutorialVisto', 'true')`
- Se muestra solo la primera vez que el usuario abre la app
- Integrado en `HomeView.vue`

---

### GPS y Tiempo de Llegada ✅
**Archivo:** `src/views/ExitoView.vue`

**Características:**
- Muestra ubicación compartida (GPS activo)
- Tiempo estimado de llegada (mock: 12 minutos iniciales)
- Estado de carabineros en camino
- Countdown que se actualiza cada minuto

---

## Backend Django ✅

### Estructura
```
backend/
├── config/
│   ├── settings.py
│   └── urls.py
├── api/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── migrations/
├── manage.py
├── .env
└── .gitignore
```

### Modelos
- **Caso:** Todos los campos del esquema actual + GPS carabinero
- **Perfil:** RUT, nombre, teléfono, dirección, contacto

### API Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/casos/ | Listar casos |
| POST | /api/casos/ | Crear caso |
| GET | /api/casos/:id/ | Obtener caso |
| PUT | /api/casos/:id/ | Actualizar caso |
| PUT | /api/casos/:id/estado/ | Cambiar estado |
| POST | /api/casos/:id/preguntas/ | Enviar preguntas |
| POST | /api/casos/:id/responder/ | Respuestas terreno |
| POST | /api/casos/:id/gps/ | Actualizar GPS |
| GET | /api/casos/rut/:rut/ | Casos por RUT |
| GET | /api/perfil/:rut/ | Obtener perfil |
| POST | /api/perfil/ | Crear/actualizar perfil |
| GET | /api/carabineros/ | Listar carabineros |

### Frontend API Service
**Archivo:** `src/services/api.js` (NUEVO)

- Cliente HTTP para comunicar con Django
- Integrado en `casosStore.js` y `alertStore.js`
- Fallback a localStorage cuando no hay conexión

---

## Flujo Simplificado ✅ (Sprint 2 - Sesión actual)

### Arquitectura del flujo
```
HomeView (PANICO)
    ↓
ExitoView (crea caso + GPS)
    ↓
ContextoView (edita caso existente)
    ↓
ExitoView (caso actualizado)
```

### Cambios implementados:
- **HomeView.vue**: Solo botón pánico gigante + OCULTAR con SVG
- **ExitoView.vue**: Mínimo texto, íconos GPS, botón EXPLICAR, botones VER ESTADO + INICIO
- **ContextoView.vue**: Edita el caso existente (no crea nuevo). Usa `actualizarCaso()` + `enviarCasoAPI()` del store
- **casosStore.js**: Agregados métodos `actualizarCaso()` y `enviarCasoAPI()`
- **alertStore.js**: `setEmergencia()` permite null para permitir flujo Panico → Exito

### Pendiente para Próximo Sprint

### GPS en Tiempo Real (PoliciaView)
- [ ] Botón "Compartir ubicación" en PoliciaView
- [ ] Actualización cada 30 segundos
- [ ] Mapa con ubicación del carabinero

### Íconos y GIFs
- [ ] GIF `ladron.gif` para robos
- [ ] GIF `vif.gif` para violencia intrafamiliar
- [ ] GIF `accidente.gif` para accidentes
- [ ] Ícono `shield-alert` SVG para VIF

### Base de Datos PostgreSQL
- [ ] Configurar PostgreSQL en el equipo
- [ ] Ejecutar `python manage.py migrate`
- [ ] Crear superuser: `python manage.py createsuperuser`
- [ ] Probar endpoints con curl o Postman

### Preguntas para Dailys
1. ¿Con cuántos GIFs LSCh quedamos?
2. ¿GPS en tiempo real o solo ubicación estática?
3. ¿Tutorial obligatorio o opcional?
4. ¿Necesitamos autenticación JWT o es público?

---

## Archivos Modificados en Sprint 2

| Archivo | Acción |
|---------|--------|
| `src/components/SafeCalculatorOverlay.vue` | Modificado (FRONT-03) |
| `src/data/emergencias.js` | Modificado (feedback) |
| `src/data/preguntasTerreno.js` | Modificado (feedback) |
| `src/data/preguntasTerrenoCarabineros.js` | Modificado (feedback) |
| `src/views/ExitoView.vue` | Modificado (GPS, tiempo, flujo simplificado) |
| `src/views/HomeView.vue` | Modificado (tutorial, panic button solo) |
| `src/views/ContextoView.vue` | Modificado (edita caso existente) |
| `src/stores/casosStore.js` | Modificado (API integration + actualizarCaso + enviarCasoAPI) |
| `src/stores/alertStore.js` | Modificado (setEmergencia permite null) |
| `src/services/api.js` | **NUEVO** |
| `src/components/TutorialOverlay.vue` | **NUEVO** |
| `backend/` | **NUEVO** (Django completo) |

---

## Preguntas para la Daily

1. **¿Backend listo?** PostgreSQL necesita configuración. ¿Quién tiene acceso?
2. **¿GIFs LSCh?** ¿Tenemos los GIFs específicos para ladrones, VIF, accidentes?
3. **¿GPS real?** ¿Implementamos GPS real del carabinero o mock?
4. **¿Prioridad siguiente?** ¿Qué es lo más urgente para el Sprint 3?
