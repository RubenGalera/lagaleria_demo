# MEJORAS.md — La Galería Neotaberna
Backlog de mejoras pendientes. Lo resuelto se documenta en CHANGELOG.md.
Última revisión: julio 2026 (v0.2.10)

Prioridad:
⚠️ Proceso delicado | 🔴 Urgente | 🟠 Alta | 🟡 Media | 🟢 Baja

---

## Navegación
| 🟢 | Al pulsar un tab, si hay algo desplegado dentro del iframe (acordeón, subpanel), comprimirlo antes de mostrar la vista por defecto.
| 🟢 | Responsive del grid de trabajadores (vista Persona en Turnos): 1 columna en móvil, 2 en tablet (768px), 3+ en desktop (≥1024px).

## Inicio — Cards del dashboard
| 🟢 | Card "Próxima Reserva": valorar si tiene suficiente valor o quitarla para ganar espacio.
| 🟢 | Card "Reservas hoy": conectar con BD real para mostrar zonas + disponibilidad de mesas. Al pulsar llevar a Reservas/Reservas.
| 🟢 | Card "Eventos hoy": mostrar nombre del evento si hay uno, "Sin eventos" si no. Al pulsar llevar a Reservas/Eventos.
| 🟢 | Card "Stock crítico": texto "Sin productos bajo mínimos" si todo está bien. Badge ámbar si hay productos bajo mínimos, rojo si hay alguno agotado. Al pulsar llevar a Stock/Pedido.
| 🟢 | Card "Turnos planificados": al pulsar llevar a Turnos/Semana.

## Turnos
| 🟢 | Icono de guardado (disquete) debería estar en el shell (index) a la izquierda del botón de perfil, no dentro del iframe de Turnos.
| 🟢 | Vista Persona — pendiente de diseño y conexión real con BD.
| 🟢 | WeekConfig: añadir editor de hora de entrada y salida por turno.

## Reservas
| 🟡 | Sistema de bloqueo de zonas por eventos: al crear un evento en una zona, bloquear esa zona para nuevas reservas ese día/turno. Si ya existe una reserva, mostrar warning para reubicarla. Eventos tienen prioridad sobre Reservas.
| 🟢 | Estado vacío de Reservas: cuando no hay reservas ese día mostrar estado visual centrado (emoji + texto + botón "Nueva reserva") en vez de secciones MEDIODÍA/NOCHE vacías.
| 🟢 | Modal de Evento: añadir campo "zonas ocupadas" (chips de zona) y campo "mesas" (número editable) que se descuenta del total disponible del local.

## Stock
| 🟠 | Pedido: filtro por proveedor — dropdown en cabecera para ver solo productos de ese proveedor y enviar WhatsApp dirigido a su número de teléfono. Al filtrar, mostrar dos grupos: 1) Productos bajo mínimos (rojo, arriba) con cantidad sugerida automática precargada (hasta cubrir el mínimo) editable con +/-, stock actual y mínimo visibles como referencia; 2) Resto de productos del proveedor (gris, abajo) con cantidad 0 editable con +/-, stock actual y mínimo visibles como referencia. Solo los productos con cantidad > 0 se incluyen en el mensaje de WhatsApp.
| 🟢 | Productos puntuales en Pedido: al pulsar sobre una card, abrir modal de edición con campos rellenos (mismo modal que añadir, pero con datos precargados).
| 🟢 | Productos archivados: mostrarlos agrupados al final de su categoría en gris, no mezclados con los activos.
| 🟢 | Etiqueta de tipo de producto en card de inventario: actualmente eliminada. Revisar si es necesario recuperarla cuando se implemente el filtro por proveedor en Pedidos.

## Admin
| 🟢 | Descripción de cards "Stock · Categorías" y "Stock · Proveedores": revisar que el texto descriptivo esté actualizado.

## Notificaciones (sistema futuro)
| 🟡 | Notificar al admin cada lunes que puede planificar los turnos de la semana siguiente. Al pulsar, llevar directamente a Turnos/semana siguiente.
| 🟡 | Notificar al trabajador cuando el admin guarda el grid de turnos por primera vez y lo incluye.
| 🟢 | Reservas: notificar cuando se añade una nueva reserva o cambia su estado (confirmada/cancelada). No notificar a quien realiza la acción.
| 🟢 | Eventos: notificar cuando se crea un evento nuevo o se añade una reserva asociada.

---

## Deuda técnica — CSS/JS

### components.css incompleto
Los siguientes componentes tienen estilos distintos en cada página que deberían vivir en components.css como fuente única de verdad:
- `.btn-confirm` — border-radius, margin-top y transition inconsistentes en turnos.css, reservas.css, index.css, admin.css vs components.css. `.btn-confirm:active` con opacity .85 vs .8 según el archivo.
- `.btn-del` — border-radius, padding, font-size, font-weight y margin-top distintos en reservas.css y admin.css vs components.css, sin transition.
- `.modal-hdr` / `.modal-title` — en index.css: align-items:center (vs flex-start en components.css) y font-size:14px (vs var(--fs-md)=15px).
- `.mclose` — tres variantes visuales bajo el mismo nombre: botón cuadrado con fondo (components.css, admin.css), "×" plano sin fondo (reservas.css, index.css). Inconsistencia de diseño a unificar.
- `.modal-sub` — font-size inconsistente entre turnos.css y components.css.

### Duplicaciones JS
- `getAuthToken()` y `supaFetch()` — reimplementadas casi idénticas en inicio.js y admin.js en paralelo al cliente _sb de supabase-client.js. Candidato a extraer a módulo compartido.
- `MESES_ES`, `isoWeekNum()`, `isoWeekYear()`, `mondayOfDate()` — duplicados entre turnos.js y date-picker.js (privados en IIFE, no expuestos). Exponer en API pública de DatePicker y eliminar copias de turnos.js.

### Duplicación interna en admin.css
`.acc-block`, `.acc-block-title`, `.vac-section` y `.modal-note` definidos dos veces dentro del mismo archivo. No es duplicado con components.css, es consigo mismo. Se conservó para no alterar qué regla gana la cascada.

---

## Cuando migremos a React / Zustand

### Arquitectura
- Eliminar iframes — SPA con React Router y Zustand para estado global
- Nav y Footer como componentes React reutilizables (actualmente duplicados en HTML)
- Migrar autenticación de sistema propio (PIN hasheado en BD + sesión localStorage) a Supabase Auth completo. Beneficios en React: RLS automática por JWT, sesiones gestionadas por Supabase, Realtime con auth real. La migración es un refactor de ~1 semana — los datos de trabajadores no cambian, solo la capa de auth.
- Normalización de teléfonos internacionales: actualmente el login compara los últimos 9 dígitos del teléfono, lo que funciona para números españoles (+34) pero no para otras nacionalidades. En React migrar a una librería como libphonenumber-js para parsear y comparar números en formato E.164 independientemente del país.

### Base de datos
- Migrar stock_productos.categoria de slug texto a FK uuid con ON DELETE SET NULL, igual que proveedor_id. Requiere columna nueva + migración de datos + actualizar todo el código que usa categoria como string.

### Deuda técnica CSS/JS
- Unificar .btn-confirm, .btn-del, .modal-sub, .mclose en components.css (ver detalle arriba)
- Exponer helpers ISO de date-picker.js y eliminar copias en turnos.js
- Consolidar getAuthToken() y supaFetch() en supabase-client.js
- Reset * { box-sizing } duplicado en cada CSS de página — mover a components.css

### Nomenclatura BD
- trabajador_skill (pivote) vs trabajadores_skills (catálogo) — revisar convención
- zonas podría ser reserva_zonas para mayor claridad

### Accesibilidad
- Hover: aclarar elemento interactuable globalmente
- Focus (tabulación escritorio): outline visible en elemento activo globalmente

### Optimización (valorar antes o durante React)
- Revisar queries e indexing en Supabase para búsquedas más dirigidas
- Estrategia de caché para reducir consultas repetidas
- Operaciones asíncronas en paralelo donde sea posible
- Load testing con tráfico simulado antes de producción real

### Funcionalidad pospuesta
- Modo offline / resiliencia ante pérdida de conexión durante el servicio
- Registro automático de pedidos en Stock/Registro cuando se envía un pedido por WhatsApp
- Notificaciones push para alertas de stock crítico

### Meta
- CHANGELOG implementado formalmente a partir de v0.2.10 — mantener actualizado en cada commit futuro
