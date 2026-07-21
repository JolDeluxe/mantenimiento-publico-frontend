# PLAN_PORTAL_CLIENTE.md
## Portal de Clientes Internos — Plan de Construccion
### Sistema CUADRA — Modulo Mantenimiento/Tickets
**Version:** 2.0 (Segunda ronda de auditoria con evidencia de codigo real)
**Fecha:** 2026-07-16 - **Autor:** Cuadra Lead (Antigravity)

> CHANGELOG v2.0: Correccion del payload real del prefill (envuelto en data), ubicacion
> real de handlers (todos en 01_list.ts, no existe 07_prefill.ts), resolucion de la
> contradiccion entre las dos carpetas tickets/ con evidencia de codigo, verificacion de
> permisos de CLIENTE_INTERNO contra 05_status.ts / 04_update.ts / 02_get.ts, y
> conversion de R4/R5 de preguntas abiertas a requerimientos confirmados.

---

## 1. Resumen Ejecutivo

El mantenimiento-publico-frontend (puerto 5001) es el portal de cara al rol CLIENTE_INTERNO.
Consume el mismo backend (mismo dominio, mismo JWT, misma API).

Terminologia obligatoria: **"reporte" / "reportes"** — nunca "ticket" en ningun copy de UI.
El modelo de backend sigue siendo Tarea con tipo:TICKET; eso no cambia.

| Modulo | Descripcion | Estado actual |
|---|---|---|
| Autenticacion | Login / Register / Forgot / Change-password | Completo |
| Crear reporte por QR | Escanea codigo - formulario pre-llenado desde backend | No existe |
| Crear reporte manual | Seleccion de maquina o categoria + incidencia frecuente | No existe |
| Mis reportes | Lista de reportes del cliente con sus estados | API lista, UI incompleta |
| Editar reporte | Solo cuando estado=PENDIENTE, solo campos permitidos | No existe |
| Aprobacion / Rechazo | Cliente revisa RESUELTO - CERRADO o RECHAZADO | No existe |
| Notificaciones | Campana + push + Socket.io | Completo |
| Dashboard | KPIs de cliente | Parcial |
| Maquinaria | Consulta de maquinas (solo lectura) | Solo API, sin UI |

Lo que NO esta en alcance: modificar mantenimiento-interno-frontend, TypeScript, z_super-admin,
cancelacion de reportes por el cliente (bloqueado en backend — ver seccion 2.7), creacion/edicion de maquinas.

---

## 2. Hallazgos de la Auditoria del Backend

### 2.1 Modulo maquinas — Ubicacion real de handlers

CORRECCION v2.0: NO existe 07_prefill.ts. Los cuatro handlers de lectura viven en 01_list.ts.

| Handler | Archivo |
|---|---|
| listarMaquinas | modules/maquinas/01_list.ts |
| getMaquinaById | modules/maquinas/01_list.ts |
| getMaquinaPrefill | modules/maquinas/01_list.ts |
| getMaquinaKPIs | modules/maquinas/01_list.ts |
| createMaquina | modules/maquinas/02_create.ts |
| updateMaquina | modules/maquinas/03_update.ts |
| patchMaquinaEstado | modules/maquinas/04_patch.ts |

Estructura del modulo:
  01_list.ts  (8,280 B) — todos los handlers de lectura
  02_create.ts (2,173 B)
  03_update.ts (1,783 B)
  04_patch.ts  (1,455 B)
  helper.ts      (665 B)
  types.ts       (185 B)
  zod/index.ts (5,025 B)

### 2.2 Ruta de prefill — Verificada contra codigo real

GET /api/maquinas/codigo/:codigo/prefill
- Middleware: authenticate (global) — SIN authorize
- Cualquier rol autenticado puede llamarla (CLIENTE_INTERNO incluido)
- Validacion: validate(getMaquinaPrefillSchema)

getMaquinaPrefillSchema (verbatim):
  params.codigo: string.trim().toUpperCase().regex(/^MBC\d{4}$/)

### 2.3 Payload real de respuesta del prefill — CORRECCION v2.0

IMPORTANTE: la respuesta esta envuelta en "data". Acceder como response.data.prefill.*

`json
{
  "status": "success",
  "data": {
    "maquinaId": 12,
    "codigo": "MBC0042",
    "nombre": "Prensa Hidraulica Alpha",
    "proceso": "Ensamblado",
    "planta": "KAPPA",
    "area": "Linea 3",
    "ubicacionDetalle": "Nave 2, Pasillo C",
    "estadoActual": "OPERATIVA",
    "criticidad": "A",
    "tieneTicketsActivos": true,
    "ticketsActivos": [
      { "id": 101, "titulo": "Fuga de aceite reportada", "estado": "EN_PROGRESO",
        "prioridad": "ALTA", "responsables": [{ "nombre": "Carlos Tecnico" }] }
    ],
    "prefill": {
      "planta": "KAPPA",
      "area": "Linea 3",
      "categoria": "Ensamblado",
      "tituloSugerido": "Reporte de Falla: Prensa Hidraulica Alpha [MBC0042]",
      "prioridadSugerida": "ALTA"
    }
  }
}
`

Notas criticas:
- prefill.categoria = maquina.proceso (no el nombre de la maquina)
- prioridadSugerida: A=ALTA, B=MEDIA, C/null=BAJA/MEDIA
- ticketsActivos: hasta 3 registros en PENDIENTE/ASIGNADA/EN_PROGRESO/EN_PAUSA
- tieneTicketsActivos: booleano conveniente para mostrar alerta de posible duplicado

Implicacion de UI: si tieneTicketsActivos=true, mostrar aviso antes del formulario.
El cliente decide si continua o no. Esto fue disenado intencionalmente para evitar duplicados.

### 2.4 ETL como fuente real del catalogo de maquinas

El catalogo NO se administra desde la UI. Existe un ETL (maquinaria-csv-ingest.ts) que:
- Lee CSV: codigo (MBC####), nombre, proceso, ubicacionRaw
- Deriva planta por palabras clave (OMEGA, SIGMA, LAMBDA, default KAPPA)
- Deriva departamentoId por proceso (PESPUNTE/ACABADO/CORTE=Produccion Kappa, etc.)
- Marca como BAJA maquinas que desaparecen del CSV
- Modo preview (sin escritura) y apply (min 100 filas como guarda de seguridad)

Implicacion: el portal de clientes NO tendra pantallas de administracion de maquinas.
El cliente solo consume el catalogo: busqueda y prefill por QR.

### 2.5 Unico cambio obligatorio en backend para produccion

CORS (backend/src/middlewares/cors.ts): agregar URL de produccion del portal publico.
Sin esto el portal no funciona en produccion.

Cambio adicional OPCIONAL (si Joel lo decide):
  backend/src/modules/tickets/status/status_cliente.ts
  Agregar caso PENDIENTE→CANCELADA para que el cliente pueda cancelar sus propios reportes.
  (Actualmente el backend bloquea todas las transiciones que no sean desde RESUELTO)

### 2.6 Permisos exactos de CLIENTE_INTERNO — Verificados contra codigo real

| Accion | Permitido | Condicion | Fuente en codigo |
|---|---|---|---|
| Crear reporte | SI | Siempre | 03_create.ts dispatcher |
| Ver lista de propios reportes | SI | Siempre (filtra por creadorId) | 01_list.ts |
| Ver detalle de reporte propio | SI | creadorId === user.id | 02_get.ts |
| Ver detalle de reporte ajeno | NO — 403 | — | 02_get.ts linea verificada |
| Editar reporte propio | SI | Solo estado=PENDIENTE | update/update_cliente.ts |
| Cambiar prioridad/responsables/fechaVencimiento | NO | campos bloqueados | update/update_cliente.ts |
| Aprobar (RESUELTO a CERRADO) | SI | Solo propio, solo desde RESUELTO | status/status_cliente.ts |
| Rechazar (RESUELTO a RECHAZADO) | SI | Solo propio, solo desde RESUELTO | status/status_cliente.ts |
| Cancelar (PENDIENTE a CANCELADA) | NO — 403 | Guard: solo acepta si estado=RESUELTO | status/status_cliente.ts |
| Llamar prefill por QR | SI | Solo autenticacion | maquinas_rutas.ts |
| Ver maquinas (lectura) | SI | Solo autenticacion | maquinas_rutas.ts |
| Crear/editar/eliminar maquinas | NO | No en roles autorizados | maquinas_rutas.ts |

Por que PENDIENTE a CANCELADA esta bloqueado:
  changeStatusCliente tiene el guard: if (ticket.estado !== EstadoTarea.RESUELTO) return 403.
  Este guard se ejecuta ANTES de evaluar isValidTransition. Aunque la funcion de transicion
  permite PENDIENTE a CANCELADA en su mapa, es inalcanzable para este rol.

---

## 3. Resolucion de la Contradiccion — Cual tickets/ es la Version Vigente

CORRECCION v2.0 — Evidencia verificada contra archivos reales y git.

### Comparacion de las dos carpetas tickets/

| Metrica | INTERNO tickets/ | PUBLICO tickets/ |
|---|---|---|
| Total de archivos | 25 | 52 |
| constants.js | NO | SI (2,443 B) |
| ticket-timeline.jsx | NO | SI (19,576 B, 384 lineas) |
| ticket-detail-modal.jsx | NO | SI (31,308 B) |
| ticket-assign-modal.jsx | NO | SI (12,206 B) |
| ticket-filter-bar.jsx | NO | SI (20,862 B) |
| ticket-status-badge.jsx | NO | SI (2,491 B) |
| ticket-status-modal.jsx | NO | SI (10,132 B) |
| ticket-summary-bar.jsx | NO | SI (4,430 B) |
| ticket-fechas.jsx | NO | SI (14,707 B) |
| components/bandeja/ | NO | SI (4 archivos) |
| components/hoy/ | NO | SI (10 archivos) |
| status-modals/ | 1 archivo | 5 archivos |
| ticket-form-modal.jsx | 57,161 B | 87,277 B (1,554 lineas — 53% mas grande) |
| use-tickets.js | 325 lineas | 230 lineas |
| Offline queue (enqueue) | NO | SI |
| Rutas en AppRoutes | actividades, reportes, historico | hoy, bandeja, historico |
| Pages stub | tickets-actividades.jsx (483 B), tickets-reportes.jsx (452 B) | N/A |
| package.json name | mantenimiento-interno-frontend | "mantenimiento-interno-frontend" (artefacto de fork) |

### Conclusion con evidencia

La version final y mas completa del feature tickets/ vive en:
  mantenimiento-publico-frontend/src/features/tickets/

Razones:
1. Doble de archivos (52 vs 25), con subfamilias enteras que INTERNO no tiene.
2. 5 status-modals vs 1 — cobertura completa de la maquina de estados.
3. ticket-form-modal.jsx 53% mas grande en PUBLICO.
4. utils/ en INTERNO esta completamente vacio — directorio fantasma.
5. Pages de INTERNO tickets-actividades.jsx (483 B) y tickets-reportes.jsx (452 B) son stubs.
6. PUBLICO tiene constants.js, offline queue, isOffline tracking — PWA de produccion.
7. package.json del PUBLICO tiene name "mantenimiento-interno-frontend" — artefacto de fork.

### Aclaracion critica

features/tickets/ en el portal publico sirve al EQUIPO DE MANTENIMIENTO (COORDINADOR, JEFE,
TECNICO) — no al cliente. ProtectedRoute redirige estos roles via SSO al sistema interno.
En produccion, un CLIENTE_INTERNO nunca accede a /tickets/hoy ni /tickets/bandeja.

Esta carpeta NO es el punto de partida del portal de clientes. El portal de clientes se
construye en features/reportes/ (nueva carpeta), tomando de features/tickets/ unicamente
los patrones de arquitectura y componentes reutilizables.

### Componentes de tickets/ a adaptar para reportes/

| Componente | Origen | Uso en reportes/ |
|---|---|---|
| ticket-status-badge.jsx | publico tickets/ | reporte-status-badge.jsx con ESTADO_CONFIG de cliente |
| ticket-timeline.jsx | publico tickets/ | reporte-timeline.jsx para detalle del reporte |
| ticket-detail-modal.jsx | publico tickets/ | reporte-detalle-modal.jsx sin acciones de admin |
| ticket-card.jsx | publico tickets/ | reporte-card.jsx (Liquid Glass, terminologia cliente) |
| ticket-status-modal.jsx | publico tickets/ | base para modal de aprobacion/rechazo |
| ticket-filter-bar.jsx | publico tickets/ | filtro simple para "mis reportes" |
| use-tickets.js | publico tickets/ | patron base para use-reportes.js |
| tickets-api.js | publico tickets/ | patron base para reportes-api.js |

---

## 4. Estado Actual de mantenimiento-publico-frontend

### 4.1 Completo — NO requiere trabajo

| Feature | Estado |
|---|---|
| auth (login, logout, perfil, forgot, reset) | Completo — solo falta register real |
| notificaciones | Completo |
| lib/date.js, lib/socket.js, lib/push.js | Completo |
| stores/auth-store.js, stores/notify-store.js | Completo |
| hooks/useIsDesktop, hooks/useDisclosure | Completo |
| layouts/dashboard-layout.jsx | Completo |
| components/ui/* barrel | Completo (ver bug B3) |
| components/form/* barrel | Completo |
| components/notification/adaptive-notify.js | Completo |

### 4.2 Bugs pre-existentes a corregir (Fase 0)

| ID | Bug | Archivo | Correccion |
|---|---|---|---|
| B1 | register() es stub simulado sin API real | features/auth/hooks/use-auth.js | Conectar POST /api/auth/register |
| B2 | offline-queue.js usa store 'offline_queue' que NO existe en idb.js | lib/idb.js + lib/offline-queue.js | Agregar 'offline_queue' a STORE_NAMES |
| B3 | OfflineBanner existe pero NO esta en el barrel | components/ui/z_index.js | Agregar export |
| B4 | package.json tiene name incorrecto | package.json | Corregir a "mantenimiento-publico-frontend" |
| B5 | lib/push copy.js duplicado | lib/push copy.js | Eliminar |
| B6 | lib/storage.js vacio 0 bytes | lib/storage.js | Eliminar |
| B7 | axios.js sin serializeData/deserializeData para FormData | lib/axios.js | Portar del interno |

### 4.3 Estado por feature

| Feature | Que hay | Que falta |
|---|---|---|
| features/tickets/ | 52 archivos — version completa del sistema del equipo | No tocar; solo referencia |
| features/maquinaria/ | Solo api/maquinaria-api.js | hooks, pages, views |
| features/dashboard/ | Sustancialmente completo | dashboard-reportes.jsx puede ser placeholder |
| features/usuarios/ | Completo | No se expone al cliente en el portal |
| features/z_super-admin/ | Esqueletos vacios | Fuera de alcance |
| features/reportes/ (NUEVO) | No existe | Todo por crear |

---

## 5. Propuesta de Taxonomia de Categorias e Incidencias

Este catalogo vive en src/features/reportes/constants.js.
El backend acepta cualquier string en categoria — esto es solo normalizacion de UI.

AREAS_POR_PLANTA se alinea con el constants.js de features/tickets/ ya en produccion:
  KAPPA:  ACABADO, ALMACEN DE MATERIA PRIMA, ALMACEN DE PIELES, BORDADO,
          CELULA DESARROLLO, CHAMARRAS, CINTOS, CORTE, LASER, PESPUNTE, MONTADO, PRELIMINARES
  OMEGA:  PT
  SIGMA:  PRELIMINARES, LASER Y BORDADO
  LAMBDA: BOLSAS Y BILLETERAS
  GENERAL: []

Categorias (con incidencias frecuentes predefinidas):

MAQUINARIA / Equipo (icon: precision_manufacturing)
  - Maquina no enciende o no arranca
  - Ruido o vibracion inusual en maquina
  - Fuga de aceite o lubricante
  - Sobrecalentamiento de equipo
  - Error de pantalla o panel de control
  - Paro inesperado de maquina en produccion
  - Pieza o componente roto o desgastado
  - Velocidad o presion fuera de parametro
  - Otro (describir en detalle)

INFRAESTRUCTURA / Instalaciones (icon: domain)
  - Fuga de agua o tuberia danada
  - Falla electrica o corto circuito
  - Iluminacion deficiente o foco quemado
  - Puerta o acceso con falla
  - Piso danado o en mal estado
  - Techo con filtraciones
  - Sistema de ventilacion sin funcionar
  - Otro

MOBILIARIO / Ergonomia (icon: chair)
  - Silla o banco roto o inestable
  - Mesa de trabajo danada
  - Estante o rack con problema
  - Casillero o gaveta sin funcionar
  - Otro

SEGURIDAD e Higiene (icon: security)
  - Derrame de sustancia en area de trabajo
  - Senalizacion faltante o danada
  - EPP danado o faltante
  - Extintor con falla o vencido
  - Salida de emergencia obstruida
  - Riesgo de caida por condicion insegura
  - Otro

LIMPIEZA / Sanitizacion (icon: cleaning_services)
  - Area requiere limpieza profunda
  - Residuos sin recolectar
  - Bano o vestidor insalubre
  - Plaga o presencia de insectos/roedores
  - Otro

SISTEMAS / Computo (icon: computer)
  - Computadora no enciende o se congela
  - Sin acceso a red o internet
  - Impresora con falla
  - Error en sistema o aplicacion de trabajo
  - Otro

OTRO / General (icon: help_outline)
  - Solicitud de adecuacion o mejora de area
  - Cambio de ubicacion de equipo o mobiliario
  - Describir situacion en detalle

---

## 6. Contrato de Datos

### 6.1 Crear reporte por QR

Paso 1 — Prefill (CORRECCION v2.0: datos en response.data, no en response directamente):
  GET /api/maquinas/codigo/MBC0042/prefill
  // Frontend: const { data } = response; const prefill = data.prefill;
  // Acceso correcto: data.maquinaId, data.nombre, data.tieneTicketsActivos, data.prefill.planta

Paso 2 — Crear reporte (FormData):
  POST /api/tickets
  titulo               string min(3)        — de data.prefill.tituloSugerido, editable
  categoria            string min(1)        — de data.prefill.categoria (= proceso maquina), readonly
  descripcion          string opcional      — texto libre
  prioridad            BAJA|MEDIA|ALTA|CRITICA — de data.prefill.prioridadSugerida, editable
  planta               string              — de data.prefill.planta, readonly
  area                 string              — de data.prefill.area, readonly
  maquinaId            number              — data.maquinaId, readonly
  paroProduccion       boolean default false
  impactoProduccion    number opcional
  imagenes             File[] max 5
  esMantenimientoAutonomo false            — siempre false

### 6.2 Crear reporte manual

Opcion A — Con maquina (busqueda manual):
  GET /api/maquinas?q=prensa&limit=20
  GET /api/maquinas/:id  — al seleccionar, para auto-llenar planta/area
  Luego misma peticion que 6.1 Paso 2

Opcion B — Sin maquina:
  POST /api/tickets con titulo, categoria, descripcion, prioridad, planta, area, imagenes
  NO se envia maquinaId. paroProduccion=false.

### 6.3 Editar reporte (solo PENDIENTE)

  PUT /api/tickets/:id  (multipart/form-data)
  Campos PERMITIDOS: titulo(min5 si se manda), descripcion, categoria, imagenes, imagenesEliminadas
  Campos NO enviar: responsables, prioridad, fechaVencimiento, tiempoEstimado (seran ignorados o daran error)

### 6.4 Aprobar o Rechazar (solo desde RESUELTO)

  PATCH /api/tickets/:id/status  (multipart/form-data)
  estado  "CERRADO"    + nota opcional    — para aprobar
  estado  "RECHAZADO"  + nota RECOMENDADO — para rechazar

### 6.5 Consultar mis reportes

  GET /api/tickets?tipo=TICKET&page=1&limit=20&sort=[{"createdAt":"desc"}]
  Backend filtra automaticamente por creadorId. El frontend NO envia creadorId.
  Filtros opcionales: estado, prioridad, fechaInicio, fechaFin, q

---

## 7. Plan de Fases

### Fase 0 — Saneamiento (1-2 horas)
1. Corregir package.json name
2. Eliminar lib/push copy.js y lib/storage.js
3. Agregar 'offline_queue' a STORE_NAMES en lib/idb.js
4. Agregar OfflineBanner al barrel components/ui/z_index.js
5. Conectar register() real en features/auth/hooks/use-auth.js
6. Portar serializeData/deserializeData a lib/axios.js
7. Agregar URL de produccion del portal al CORS del backend

### Fase 1 — Constantes y rutas base (2-3 horas)
1. Crear src/features/reportes/constants.js (taxonomia completa — seccion 5)
2. Ampliar src/routes/AppRoutes.jsx:
   - /reportes        → MisReportesPage
   - /reportes/nuevo  → NuevoReportePage
   - /reportes/nuevo/qr → NuevoReporteQRPage
   - /reportes/:id    → ReporteDetallePage

### Fase 2 — Capa de datos (3-4 horas)
1. Crear src/features/reportes/api/reportes-api.js
   getReportes, getReporteById, createReporte, updateReporte, changeReporteStatus
2. Crear src/features/reportes/hooks/use-reportes.js
   IDB cache + network, fetchReportes, handleCreate, handleUpdate, handleChangeStatus
3. Crear src/features/maquinaria/hooks/use-maquinaria.js
   fetchMaquinas, getPrefill (cuidado: respuesta en response.data)

### Fase 3 — Pantalla principal y creacion (1 semana)
3a — Mis Reportes:
  mis-reportes-mobile.jsx, mis-reportes-desktop.jsx, mis-reportes-page.jsx
  reporte-card.jsx (Liquid Glass), reporte-status-badge.jsx
3b — Selector: nuevo-reporte-selector.jsx (QR vs Manual)
3c — Formulario QR:
  qr-scanner-input.jsx, maquina-readonly-card.jsx (con alerta ticketsActivos), reporte-qr-form.jsx
3d — Formulario manual:
  categoria-selector.jsx, incidencia-selector.jsx, reporte-manual-form.jsx
3e — Pages: nuevo-reporte-page.jsx, nuevo-reporte-qr-page.jsx, reporte-detalle-page.jsx
     (con reporte-timeline.jsx adaptado de ticket-timeline.jsx)
3f — Edicion: reporte-edit-form.jsx (solo cuando estado=PENDIENTE)

### Fase 4 — Modulo de aprobacion (3-4 dias)
  reporte-revision-modal.jsx
  Badge visual en Mis Reportes para reportes RESUELTO pendientes de aprobacion

### Fase 5 — Pulido y PWA (2-3 dias)
  Actualizar vite.config.js / manifiesto PWA
  Smoke test de processSyncQueue tras correccion bug B2
  Revisar dashboard-reportes.jsx (placeholder vs real)
  Flujo mustChangePassword en DashboardLayout (si Joel lo decide — R3 abierto)

---

## 8. Lista de Archivos a Crear / Modificar

### Backend
| Accion | Archivo | Cambio |
|---|---|---|
| MODIFICAR | backend/src/middlewares/cors.ts | Agregar URL de produccion del portal publico |
| MODIFICAR (opcional) | backend/src/modules/tickets/status/status_cliente.ts | Agregar PENDIENTE→CANCELADA si se decide habilitar |

### mantenimiento-publico-frontend

Fase 0: package.json, lib/idb.js, lib/axios.js, lib/push copy.js(ELIMINAR),
        lib/storage.js(ELIMINAR), components/ui/z_index.js, features/auth/hooks/use-auth.js

Fase 1: src/features/reportes/constants.js, src/routes/AppRoutes.jsx

Fase 2: src/features/reportes/api/reportes-api.js
        src/features/reportes/hooks/use-reportes.js
        src/features/maquinaria/hooks/use-maquinaria.js

Fase 3: src/features/reportes/components/reporte-card.jsx
        src/features/reportes/components/reporte-status-badge.jsx
        src/features/reportes/components/nuevo-reporte-selector.jsx
        src/features/reportes/components/qr-scanner-input.jsx
        src/features/reportes/components/maquina-readonly-card.jsx
        src/features/reportes/components/reporte-qr-form.jsx
        src/features/reportes/components/categoria-selector.jsx
        src/features/reportes/components/incidencia-selector.jsx
        src/features/reportes/components/reporte-manual-form.jsx
        src/features/reportes/components/reporte-edit-form.jsx
        src/features/reportes/components/reporte-timeline.jsx
        src/features/reportes/views/mis-reportes-mobile.jsx
        src/features/reportes/views/mis-reportes-desktop.jsx
        src/features/reportes/pages/mis-reportes-page.jsx
        src/features/reportes/pages/nuevo-reporte-page.jsx
        src/features/reportes/pages/nuevo-reporte-qr-page.jsx
        src/features/reportes/pages/reporte-detalle-page.jsx

Fase 4: src/features/reportes/components/reporte-revision-modal.jsx

---

## 9. Riesgos y Puntos Abiertos

### RESUELTOS en v2.0

| Punto | Decision | Evidencia |
|---|---|---|
| R4 — Cancelacion de reportes | CLIENTE_INTERNO NO puede cancelar sus propios reportes. Backend lo bloquea en status_cliente.ts. Si se desea habilitar: modificar ese archivo primero. | status_cliente.ts: guard "solo acepta si estado=RESUELTO" |
| R5 — Edicion de reportes | SI disponible, pero SOLO cuando estado=PENDIENTE y SOLO titulo/descripcion/categoria/imagenes. Campos bloqueados por el backend: responsables/prioridad/fechaVencimiento/tiempoEstimado. | update/update_cliente.ts verificado |

### BLOQUEANTES — Necesitan respuesta antes de implementar

| # | Punto abierto | Opciones |
|---|---|---|
| R1 | URL de produccion del portal publico — necesaria para el CORS del backend | Definir dominio de Netlify |
| R2 | Escaner QR real con camara | (a) Solo input de texto MBC#### manual · (b) Integrar html5-qrcode |
| R3 | mustChangePassword flow | (a) Si, forzar cambio en DashboardLayout · (b) Ignorarlo |

### IMPORTANTES — Afectan diseno pero no bloquean el inicio

| # | Punto abierto | Opciones |
|---|---|---|
| R6 | Habilitar cancelacion para el cliente | (a) No — estado actual del backend · (b) Si — modificar status_cliente.ts primero |
| R7 | Paro de produccion visible para el cliente en el formulario | (a) Si con checkbox · (b) No |
| R8 | Alerta de duplicados en prefill QR (tieneTicketsActivos=true) | (a) Bloquear y mostrar lista · (b) Advertir y dejar continuar · (c) Ignorar |
| R9 | Areas del portal — confirmar que AREAS_POR_PLANTA propuesto es correcto y completo | Revisar con Joel |

### MENORES

| # | Punto abierto |
|---|---|
| R10 | Cantidad de reportes por pagina (recomendacion: 20 mobile, 50 desktop) |
| R11 | Paleta de color del portal cliente — misma que interno (#482b2c) o variante |
| R12 | Pantalla de bienvenida/onboarding en primer acceso |

---

## Apendice — Diagrama de Flujo

`
Usuario autentica en /login (portal publico)
         |
         +-- Rol = TECNICO|COORDINADOR_MTTO|JEFE_MTTO|SUPER_ADMIN
         |              --> ProtectedRoute: SSO bounce al sistema interno
         |
         +-- Rol = CLIENTE_INTERNO
                    --> Portal publico
                               |
                               +-- /dashboard     --> KPIs del cliente
                               +-- /reportes      --> Mis reportes
                               |      +-- estado=PENDIENTE --> Boton Editar
                               |      +-- estado=RESUELTO  --> Modal Aprobar/Rechazar
                               |      +-- FAB "+"  --> /reportes/nuevo
                               +-- /reportes/nuevo  --> Selector QR vs Manual
                               |      +-- QR:    /reportes/nuevo/qr --> Form pre-llenado
                               |      +-- Manual: Form categorias/incidencias
                               +-- /notificaciones --> Historial
                               +-- /perfil         --> Datos del usuario
`

---
Version 2.0 — Basada en auditoria de codigo real.
No se escribe una sola linea de implementacion hasta que Joel confirme R1, R2 y R3.
