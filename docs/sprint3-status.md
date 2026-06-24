# Sprint 3 - Estado de Implementación

## Meta: Flow Completo DB + WebSockets + Visual

**Para SORDOS - Mínimo texto, máximo íconos/animaciones**

---

## Flujo Implementado

```
Login (RUT + Num Documento)
    ↓
Home (Solo Panico + OCULTAR)
    ↓
Panico presionado (4s) → Crear Caso en DB con GPS
    ↓
Exito (mapa animado policía acercándose + GPS OK + EXPLICAR)
    ↓
Explicar → ContextoView (edita caso existente)
    ↓
Historial → Lista casos → Ver detalle (mapa + EXPLICAR + RESPONDER)
```

---

## Backend - Django + Channels

### Modelo Perfil
```python
rut (PK), num_documento, nombre, telefono, direccion
contacto_nombre, contacto_telefono
blocked (bool), blocked_reason (text)
```

### Modelo Caso
```python
...campos existentes...
lat, lng, gps_timestamp, gps_last_updated  # GPS tracking
```

### API Auth
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/login/` | POST | Login con RUT + num_documento → verifica blocked |
| `/api/auth/register/` | POST | Registro con RUT, num_documento, nombre, telefono... |

### API WebSocket
| Ruta WS | Descripción |
|---------|-------------|
| `ws://.../ws/casos/<id>/gps/` | GPS real-time (victim → server → policia) |

### Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login/` | Login (RUT + num_documento) |
| POST | `/api/auth/register/` | Registro perfil |
| GET/POST | `/api/casos/` | Listar/Crear casos |
| GET/PUT | `/api/casos/:id/` | Ver/Actualizar caso |
| POST | `/api/casos/:id/gps/` | Actualizar GPS |
| PUT | `/api/casos/:id/estado/` | Cambiar estado |
| POST | `/api/casos/:id/preguntas/` | Enviar preguntas terreno |
| POST | `/api/casos/:id/responder/` | Responder preguntas |
| GET | `/api/casos/rut/:rut/` | Casos por RUT |
| GET/PUT | `/api/perfil/:rut/` | Perfil |

---

## Frontend

### LoginView (NUEVO)
- Solo RUT + Num Documento
- Si blocked → error "ACCESO BLOQUEADO"
- Si no encontrado → modo registro
- GPS automático

### HomeView (REDISEÑADO)
- Solo: Logo + Botón Pánico + OCULTAR + Historial
- Sin tarjetas de emergencia (flujo directo)
- GPS en background
- Panic 4s → crea caso + redirige a Exito

### ExitoView (REDISEÑADO)
- Mapa animado: policía acercándose (mock)
- GPS OK / GPS...
- Botón EXPLICAR
- Botón VER ESTADO (historial)
- Botón INICIO
- NO OCULTAR (protección)
- WebSocket GPS

### OCULTAR
- Visible en Home, Historial, Contexto, Perfil
- NO visible en Exito
- Calculadora iPhone-style
- 133 → vuelve a pantalla anterior

### api.js (ACTUALIZADO)
```javascript
api.auth.login(rut, numDocumento)
api.auth.register(datos)
connectGPSSocket(casoId, callbacks)
sendGPSUpdate(lat, lng)
closeGPSSocket()
```

---

## Archivos Creados/Modificados

### Backend
| Archivo | Cambio |
|---------|--------|
| `backend/requirements.txt` | **NUEVO** (channels, daphne, redis) |
| `backend/api/models.py` | num_documento, blocked, lat, lng, gps_timestamp |
| `backend/api/views.py` | login_view, register_view, GPS update |
| `backend/api/serializers.py` | Auth serializers, GPS fields |
| `backend/api/urls.py` | auth/login, auth/register |
| `backend/api/consumers.py` | **NUEVO** GPSConsumer, CasoConsumer |
| `backend/api/routing.py` | **NUEVO** WebSocket routing |
| `backend/config/settings.py` | Channels, ASGI, daphne |
| `backend/config/asgi.py` | **NUEVO** ASGI config |

### Frontend
| Archivo | Cambio |
|---------|--------|
| `src/services/api.js` | auth endpoints, WebSocket functions |
| `src/stores/alertStore.js` | num_documento support |
| `src/stores/casosStore.js` | lat/lng en crearCaso, actualizarCaso, enviarCasoAPI |
| `src/views/LoginView.vue` | **REDISEÑADO** (RUT + Num Doc) |
| `src/views/HomeView.vue` | **REDISEÑADO** (solo panic + ocultar) |
| `src/views/ExitoView.vue` | **REDISEÑADO** (mapa + GPS WebSocket) |

---

## Pendiente

### Alta Prioridad
- [ ] Vista PoliciaView completa con mapa + enviar pregunta
- [ ] ContextoView con preguntas terrain (GIFs LSCh)
- [ ] HistorialView con detalle de caso

### Media Prioridad
- [ ] Tiempo real policia vs victim (WebSocket bidireccional)
- [ ] Animación mapa "policía acercándose" más realista
- [ ] Indicador "última actualización hace X min" cuando pierde señal

### Baja Prioridad
- [ ] Pantalla encuentro (chatvideo)
- [ ] CentralView del operador

---

## Para Probar

```bash
# Backend
cd backend
source venv/bin/activate
daphne -b 0.0.0.0 -p 8000 config.asgi:application

# Frontend
npm run dev
```

---

## Dependencias Backend
```
Django>=4.2,<5.0
djangorestframework>=3.14
django-cors-headers>=4.0
psycopg2-binary>=2.9
channels>=4.0
channels-redis>=4.0
daphne>=4.0
```
