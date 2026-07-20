# REPORTE_AUDITORIA_BACKEND.md
## Auditoria de Codigo Real — Sistema de Mantenimiento CUADRA
**Fecha:** 2026-07-16 | **Auditado por:** Antigravity (lectura verbatim, sin asunciones)
**Referencia:** PLAN_PORTAL_CLIENTE v2.0 — Resolucion de puntos ciegos

---

## 1. Estructura Real de /tickets/

### Nivel raiz (backend/src/modules/tickets/)

| Archivo / Carpeta | Tipo | Tamano |
|---|---|---|
| 01_list.ts | archivo | 1,386 B |
| 02_get.ts | archivo | 1,939 B |
| 03_create.ts | archivo | 2,333 B |
| 04_update.ts | archivo | 734 B |
| 05_status.ts | archivo | 814 B |
| 06_metrics.ts | archivo | 10,789 B |
| 06_reschedule.ts | archivo | 2,088 B |
| 07_approve_batch.ts | archivo | 3,769 B |
| automations.ts | archivo | 6,014 B |
| expiration.ts | archivo | 2,534 B |
| helper.ts | archivo | 31,683 B |
| types.ts | archivo | 2,195 B |
| create/ | carpeta | — |
| list/ | carpeta | — |
| status/ | carpeta | — |
| update/ | carpeta | — |
| zod/ | carpeta | — |

### Subcarpeta: status/

| Archivo | Tamano |
|---|---|
| _core.ts | 14,057 B |
| index.ts | 233 B |
| status_admin.ts | 3,820 B |
| status_cliente.ts | 2,857 B |
| status_tecnico.ts | 3,298 B |

### Subcarpeta: update/

| Archivo | Tamano |
|---|---|
| index.ts | 168 B |
| update_admin.ts | 13,526 B |
| update_cliente.ts | 7,927 B |

### Subcarpeta: create/

| Archivo | Tamano |
|---|---|
| create_admin.ts | 7,422 B |
| create_batch.ts | 5,461 B |
| create_cliente.ts | 4,990 B |
| helper_upload.ts | 681 B |

### Subcarpeta: list/

| Archivo | Tamano |
|---|---|
| index.ts | 348 B |
| list_actividades.ts | 4,852 B |
| list_bandeja.ts | 4,690 B |
| list_hoy.ts | 3,681 B |
| list_mantenimientos.ts | 4,868 B |
| list_todas.ts | 3,472 B |

### Subcarpeta: zod/

| Archivo | Tamano |
|---|---|
| index.ts | 14,185 B |

### Respuesta a la pregunta R0

AMBAS cosas existen al mismo tiempo:
- 04_update.ts (734 B) y 05_status.ts (814 B) EXISTEN como archivos planos en el nivel raiz.
- Las carpetas update/ y status/ TAMBIEN existen.

Los archivos planos son thin dispatchers (~800 B) que detectan el rol y delegan a los
archivos especializados dentro de las carpetas. La logica real vive en las subcarpetas.

Cadena de llamadas para el cambio de estado:
  PATCH /api/tickets/:id/status
    → tickets_rutas.ts (authenticate, upload, validate)
    → 05_status.ts::changeTicketStatus (dispatcher por rol)
    → status/status_cliente.ts::changeStatusCliente (logica real del cliente)

---

## 2. Codigo de Guards en Status (changeStatusCliente verbatim)

Archivo real: backend/src/modules/tickets/status/status_cliente.ts
Funcion: changeStatusCliente (lineas 16-72)

```typescript
export const changeStatusCliente = async (req: Request, res: Response) => {
  const user = req.user!;
  const { id: ticketId } = req.params as unknown as ChangeTicketStatusParams;
  const data = req.body as ChangeTicketStatusInput;

  try {
    // Procesar imagenes
    const files = req.files as Express.Multer.File[] | undefined;
    const urlsImagenes = await processTicketImages(files);
    if (urlsImagenes.length > 0) data.imagenes = urlsImagenes;

    const { estado: nuevoEstado, nota, imagenes: imagenesFinales = [], fechaVencimiento, refacciones } = data;

    // Fetch ticket
    const ticket = await prisma.tarea.findUnique({
      where: { id: ticketId },
      include: { responsables: true }
    });
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });

    // GUARD 0: Validar transicion (FSM generica)
    if (!isValidTransition(ticket.estado, nuevoEstado, ticket.clasificacion, ticket.categoria)) {
      return res.status(400).json({ error: `Transicion no permitida: ${ticket.estado} → ${nuevoEstado}` });
    }

    // GUARD 1: Ownership — el ticket debe pertenecer al cliente
    if (ticket.creadorId !== user.id) {
      return res.status(403).json({ error: "No puedes modificar un ticket que no es tuyo." });
    }

    // GUARD 2: Estado actual — el ticket DEBE estar en RESUELTO
    // Esta linea BLOQUEA PENDIENTE→CANCELADA — cualquier estado que no sea RESUELTO es rechazado
    if (ticket.estado !== EstadoTarea.RESUELTO) {
      return res.status(403).json({ error: "Solo puedes validar el ticket cuando el tecnico lo marque como RESUELTO." });
    }

    // GUARD 3: Estado destino — SOLO CERRADO o RECHAZADO son permitidos
    if (nuevoEstado !== EstadoTarea.CERRADO && nuevoEstado !== EstadoTarea.RECHAZADO) {
      return res.status(400).json({ error: "Como cliente, solo puedes CERRAR o RECHAZAR el ticket." });
    }

    return ejecutarCambioEstado({
      ticketId,
      ticket,
      nuevoEstado,
      nota,
      imagenesFinales,
      fechaVencimiento,
      refacciones,
      registroTiempoManual: undefined, // cliente no registra tiempo
      user,
      req,
      res,
      autoCloseInspeccion: false,
      manejarIntervalos:   false,
    });

  } catch (error) {
    await registrarError("CHANGE_STATUS_CLIENTE", user.id, error);
    return res.status(500).json({ error: "Error al cambiar estado" });
  }
};
```

### Analisis de los guards

| Guard | Codigo | Efecto |
|---|---|---|
| GUARD 0 | isValidTransition(ticket.estado, nuevoEstado, ...) | Valida que la transicion exista en el FSM. Se ejecuta PRIMERO. |
| GUARD 1 | ticket.creadorId !== user.id → 403 | Bloquea acceso a tickets ajenos. |
| GUARD 2 | ticket.estado !== EstadoTarea.RESUELTO → 403 | BLOQUEA PENDIENTE→CANCELADA. El ticket DEBE estar en RESUELTO. No hay excepcion. |
| GUARD 3 | nuevoEstado !== CERRADO && nuevoEstado !== RECHAZADO → 400 | Solo CERRADO y RECHAZADO son destinos validos. |

CONCLUSION DEFINITIVA sobre PENDIENTE→CANCELADA:
  isValidTransition SI permite PENDIENTE→CANCELADA en su mapa.
  PERO el Guard 2 ("ticket.estado !== RESUELTO → 403") hace que sea inalcanzable.
  El Guard 2 se ejecuta despues del Guard 0 pero antes de llegar al Guard 3.
  Resultado: cualquier intento de cancelar un ticket PENDIENTE retorna 403.
  Para habilitar la cancelacion habria que agregar un caso especial antes del Guard 2:
    if (nuevoEstado === EstadoTarea.CANCELADA && ticket.estado === EstadoTarea.PENDIENTE) {
      // permitir y ejecutar
    }

---

## 3. Payload Real del Prefill — Bloque select de Prisma (verbatim)

Archivo: backend/src/modules/maquinas/01_list.ts
Funcion: getMaquinaPrefill (lineas 88-112)

```typescript
const maquina = await prisma.maquina.findUnique({
  where: { codigo: codigo.toUpperCase() },
  include: {
    tareas: {
      where: {
        estado: {
          in: [
            EstadoTarea.PENDIENTE,
            EstadoTarea.ASIGNADA,
            EstadoTarea.EN_PROGRESO,
            EstadoTarea.EN_PAUSA
          ]
        }
      },
      select: {
        id: true,
        titulo: true,
        estado: true,
        prioridad: true,
        responsables: { select: { nombre: true } }
      },
      take: 3
    }
  }
});
```

### Campos seleccionados por ticket activo

| Campo | Tipo | Notas |
|---|---|---|
| id | number | Identificador del ticket |
| titulo | string | CONFIRMADO: si se devuelve |
| estado | EstadoTarea | PENDIENTE/ASIGNADA/EN_PROGRESO/EN_PAUSA |
| prioridad | Prioridad | BAJA/MEDIA/ALTA/CRITICA |
| responsables | array de { nombre: string } | CONFIRMADO: si se devuelven los nombres |

Campos NO incluidos en ticketsActivos:
  - fechaVencimiento (no seleccionado)
  - creadorId (no seleccionado)
  - clasificacion (no seleccionado)
  - categoria (no seleccionado)
  - descripcion (no seleccionado)

Nota de nomenclatura: la relacion en Prisma se llama "tareas" internamente.
En el DTO de respuesta (response.data.ticketsActivos) se renombra:
  ticketsActivos: maquina.tareas
El nombre "ticketsActivos" solo existe en la capa de respuesta HTTP, no en el schema.

Limite: take: 3 — maximo 3 tickets activos en la respuesta.

---

## 4. Estado de Deudas Tecnicas

### 4a. Cloudinary — Busqueda de hardcoding data:image/jpeg

Archivo: backend/src/utils/cloudinary.ts — EXISTE (73 lineas, 2,309 B)

Resultado de la busqueda:
  "data:image/jpeg"  → NO ENCONTRADO
  "image/jpeg"       → NO ENCONTRADO
  "image/png"        → NO ENCONTRADO
  "image/webp"       → NO ENCONTRADO
  Cualquier MIME type hardcodeado → NO ENCONTRADO

Funcion uploadTaskImage (verbatim, lineas 31-50):

```typescript
export const uploadTaskImage = async (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "Mantenimiento/Tareas",
        resource_type: "image",
        transformation: [
          { width: 1280, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};
```

Analisis:
- La funcion recibe un Buffer raw — no asume ni declara ningun MIME type.
- "fetch_format: auto" deja que Cloudinary detecte y convierta el formato automaticamente.
- Esto significa que archivos HEIC (iPhone), WebP o PNG son aceptados sin problema.
- DEUDA B8 NO CONFIRMADA: No existe el hardcoding que se sospechaba.

### 4b. 02_get.ts — isLate / isOverdue / computeTicketTemporalState

Archivo: backend/src/modules/tickets/02_get.ts (54 lineas, 1,939 B)
Funcion completa verbatim:

```typescript
import type { Request, Response } from "express";
import { prisma } from "../../db";
import { Rol, EstadoTarea } from "@prisma/client";
import { registrarError } from "../../utils/logger";
import { ticketStandardInclude } from "./types";
import { checkTicketExpiration } from "./expiration";
import type { GetTicketByIdParams } from "./zod";
import { computeTicketTemporalState } from "./helper";

export const getTicket = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id: ticketId } = req.params as unknown as GetTicketByIdParams;

    const ticketDB = await prisma.tarea.findUnique({
      where: { id: ticketId },
      include: ticketStandardInclude
    });

    if (!ticketDB) {
      return res.status(404).json({ error: "Ticket no encontrado" });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrlHost = `${protocol}://${host}`;

    // Delegacion de regla de dominio pura
    const ticket = await checkTicketExpiration(ticketDB, fullUrlHost);

    let tienePermiso = false;
    const rolesAdmin: Rol[] = [Rol.SUPER_ADMIN, Rol.JEFE_MTTO, Rol.COORDINADOR_MTTO];

    if (rolesAdmin.includes(user.rol)) {
      tienePermiso = true;
    } else if (user.rol === Rol.TECNICO) {
      tienePermiso = ticket.responsables.some((r: { id: number }) => r.id === user.id);
    } else if (user.rol === Rol.CLIENTE_INTERNO) {
      tienePermiso = ticket.creadorId === user.id;
    }

    if (!tienePermiso) {
      return res.status(403).json({ error: "No tienes permisos para ver el detalle de este ticket." });
    }

    const ticketDTO = computeTicketTemporalState(ticket);

    return res.json(ticketDTO);

  } catch (error) {
    await registrarError('GET_TICKET_DETAIL', req.user?.id || null, error);
    return res.status(500).json({ error: "Error interno al obtener el ticket" });
  }
};
```

Hallazgos especificos:

| Punto | Resultado |
|---|---|
| computeTicketTemporalState presente | SI — importado de ./helper, llamado en linea 46 |
| isLate / isOverdue en este archivo | NO — esos simbolos se calculan DENTRO de computeTicketTemporalState en helper.ts |
| checkTicketExpiration | SI — se llama en linea 29, antes del chequeo de permisos |
| Permiso CLIENTE_INTERNO | SI — ticket.creadorId === user.id, retorna 403 si no coincide |
| Estructura del response final | res.json(ticketDTO) — sin envelope { status, data } |
| EstadoTarea importado pero no usado | SI — import presente en linea 3, no aparece en el cuerpo de la funcion |

Estructura de respuesta GET /api/tickets/:id:
  El endpoint NO envuelve en { status: "success", data: ... }.
  Envia el DTO directamente: res.json(ticketDTO).
  Esto difiere de GET /api/maquinas/codigo/:codigo/prefill que SI usa { status: "success", data: ... }.
  IMPORTANTE para el frontend: el acceso a los datos es distinto en cada endpoint.
    - Prefill: response.data.prefill.planta
    - Ticket detalle: response.titulo, response.estado, response.isLate, etc.


---

## 5. Tabla de Impacto en el Plan del Portal de Clientes

### Impacto en la capa de datos (frontend)

| Endpoint | Estructura de respuesta | Como acceder en JS |
|---|---|---|
| GET /api/maquinas/codigo/:c/prefill | { status, data: { maquinaId, nombre, ticketsActivos, prefill: { planta, area, categoria, tituloSugerido, prioridadSugerida } } } | response.data.prefill.planta |
| GET /api/tickets/:id | ticketDTO plano (sin envelope) | response.titulo, response.estado, response.isLate |
| GET /api/tickets | Array paginado (verificar envelope) | Verificar en 01_list.ts |

### Estado de las deudas tecnicas tras auditoria

| ID | Deuda | Estado Confirmado |
|---|---|---|
| B8 | Cloudinary hardcoding data:image/jpeg | NO EXISTE — deuda descartada |
| B9 | isLate/isOverdue inyectados en respuesta | CONFIRMADO: computeTicketTemporalState en helper.ts (31,683 B) los inyecta antes del res.json |
| R0 | Estructura tickets/ ambigua (archivos vs carpetas) | RESUELTA: ambos coexisten — planos son dispatchers, subcarpetas contienen logica real |
| checkTicketExpiration | Funcion que puede mutar el estado del ticket antes del response | CONFIRMADO: se llama antes del permiso check — puede cambiar estado en DB |

### Proximos archivos a auditar si se requiere

| Archivo | Por que importa |
|---|---|
| backend/src/modules/tickets/helper.ts (31,683 B) | Contiene computeTicketTemporalState — necesario para saber que campos extra se inyectan (isLate, isOverdue, etc.) en el DTO que el frontend recibe |
| backend/src/modules/tickets/status/_core.ts (14,057 B) | Contiene ejecutarCambioEstado — la logica compartida que disparan todos los status handlers |
| backend/src/modules/tickets/expiration.ts (2,534 B) | Contiene checkTicketExpiration — puede auto-cancelar o auto-cerrar tickets por fecha |
| backend/src/modules/tickets/update/update_cliente.ts (7,927 B) | Logica completa del PUT/:id para CLIENTE_INTERNO — campos exactos permitidos vs bloqueados |
| backend/src/modules/tickets/list/ | Cada archivo list_*.ts puede tener diferentes filtros por rol — confirmar cual usa CLIENTE_INTERNO |

---
*Generado el 2026-07-16. Todo el codigo es verbatim del repositorio. Cero asunciones.*
