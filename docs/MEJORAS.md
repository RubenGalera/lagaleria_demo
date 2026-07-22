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
| 🟡 | Página pública de inscripción a eventos: URL pública por evento (sin login) donde el cliente ve el cartel, el menú y rellena nombre, teléfono y número de acompañantes. Los datos se guardan directamente en la tabla de asistentes pendientes de confirmar por el admin. Requiere rutas públicas — mejor implementar con Next.js en la migración a React.

## Stock
| 🟠 | Pedido: filtro por proveedor — dropdown en cabecera para ver solo productos de ese proveedor y enviar WhatsApp dirigido a su número de teléfono. Al filtrar, mostrar dos grupos: 1) Productos bajo mínimos (rojo, arriba) con cantidad sugerida automática precargada (hasta cubrir el mínimo) editable con +/-, stock actual y mínimo visibles como referencia; 2) Resto de productos del proveedor (gris, abajo) con cantidad 0 editable con +/-, stock actual y mínimo visibles como referencia. Solo los productos con cantidad > 0 se incluyen en el mensaje de WhatsApp.
| 🟢 | Productos puntuales en Pedido: al pulsar sobre una card, abrir modal de edición con campos rellenos (mismo modal que añadir, pero con datos precargados).
| 🟢 | Productos archivados: mostrarlos agrupados al final de su categoría en gris, no mezclados con los activos.
| 🟢 | Etiqueta de tipo de producto en card de inventario: actualmente eliminada. Revisar si es necesario recuperarla cuando se implemente el filtro por proveedor en Pedidos.
| 🟡 | Ciclo completo de pedidos — guardar pedido al enviarlo por WhatsApp (estado: pendiente → en_reparto → recibido), vista de pedidos en reparto en el dashboard de Inicio, y confirmación de recepción que suma automáticamente las cantidades al stock. Permite verificar que lo recibido coincide con lo pedido y editar diferencias antes de confirmar. Solo accesible para Admin y Encargado. Requiere tabla `pedidos` en BD con estado, proveedor_id, fecha y productos en JSON.
| 🟢 | Filtro de proveedor en Productos: al pulsar el botón "Filtrar", abrir directamente la lista de proveedores (no el último seleccionado). Mostrar "Filtrar: [nombre]" en el botón cuando hay filtro activo.

## Admin
| 🟢 | Descripción de cards "Stock · Categorías" y "Stock · Proveedores": revisar que el texto descriptivo esté actualizado.
| 🟢 | Stock · Ubicaciones: card en Admin para que cada local gestione sus propias ubicaciones (crear/editar/borrar/reordenar). Necesario cuando la app escale a múltiples locales. La tabla stock_ubicaciones ya existe con local_id — solo falta la UI de gestión.

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

## Accesibilidad y UX — Estándares profesionales

### Heurísticas de Nielsen (10 principios)
Aplicar progresivamente en todos los módulos:
- **Visibilidad del estado del sistema**: toast de confirmación en TODAS las acciones que escriben en BD. Estilo unificado: ✅ éxito, ❌ error, ⏳ cargando. Actualmente inconsistente entre módulos.
- **Mensajes de error útiles**: borde rojo en el campo concreto que falla + texto explicativo debajo ("Este email no es válido", "Este teléfono ya existe"...). Eliminar mensajes genéricos tipo "Error al guardar".
- **Prevención de errores**: validación en tiempo real donde sea posible (formato email, longitud PIN, campos obligatorios) antes de intentar guardar.
- **Feedback en elementos interactivos**: estado hover y foco de botones notorio — el usuario sabe en todo momento qué está pulsando.
- Resto de heurísticas a auditar módulo por módulo cuando se aborde la limpieza global.

### Accesibilidad — WCAG 2.1 nivel AA
Objetivo: cumplir el nivel AA del estándar internacional de accesibilidad web.
- **Contraste de color**: todos los textos deben cumplir ratio mínimo 4.5:1 (texto normal) y 3:1 (texto grande). Herramienta de verificación: WebAIM Contrast Checker.
- **Área táctil mínima**: 44x44px en todos los elementos interactivos (botones, links) para uso cómodo en móvil.
- **Textos alternativos**: `alt` descriptivo en todas las imágenes. Imágenes decorativas con `alt=""`.
- **Etiquetas en formularios**: todos los inputs con `<label>` asociado o `aria-label`.

### Principios POUR
Los 4 principios fundamentales de accesibilidad que debe cumplir toda interfaz:
- **Perceptible**: información presentable de múltiples formas (textos alt, contraste, no depender solo del color para transmitir información).
- **Operable**: interfaz navegable y usable (navegación por teclado, sin trampas de foco, tiempo suficiente para completar acciones).
- **Comprensible**: mensajes de error claros, comportamiento predecible, ayuda contextual donde sea necesario.
- **Robusto**: contenido interpretable por tecnologías de asistencia (HTML semántico, ARIA correctamente implementado).

### Navegación por teclado
- Todos los elementos interactivos accesibles con Tab en orden lógico (izquierda→derecha, arriba→abajo).
- Focus visible y notorio en el elemento activo — nunca eliminar `outline` sin alternativa visible.
- Orden de tabulación coherente con el flujo visual de la página.
- Esc para cerrar modales, Enter para confirmar acciones principales.

### ARIA (Accessible Rich Internet Applications)
- `aria-label` en iconos y botones sin texto visible ("×", "≡", "+", "-", emojis como acción).
- `aria-expanded` en acordeones y desplegables.
- `aria-live="polite"` en zonas que se actualizan dinámicamente (toasts, contadores, listados que se recargan).
- `role` apropiado en elementos semánticos personalizados (modales → `role="dialog"`, tabs → `role="tab"`, alertas → `role="alert"`).
- `aria-required="true"` en campos obligatorios de formularios.

### Panel de accesibilidad en Perfil de usuario
Opciones personalizables por cada usuario, guardadas en BD (columna `accesibilidad` JSON en trabajadores):

**Tipografía**
- Tamaño de fuente: Normal / Grande / Muy grande (escala el rem base del sistema)
- Familia tipográfica: Sans-serif (actual) / Serif / Monospace (útil para usuarios con dislexia)

**Contraste**
- Tema: Normal (actual) / Alto contraste / Bajo contraste (para sensibilidad a la luz)

**Movimiento**
- Reducir animaciones: desactiva transiciones y animaciones (respeta `prefers-reduced-motion` del sistema operativo)

**Implementación futura:**
- Preferencias guardadas en columna `accesibilidad` (JSON) en tabla `trabajadores`
- Al cargar la app, se aplican vía variables CSS en `:root`
- En React: Context de accesibilidad que envuelve toda la app
- Cumple WCAG 2.1 criterios 1.4.4 (Resize text) y 1.4.12 (Text spacing) nivel AA

### Prioridad de implementación
- **Antes de React**: contraste, etiquetas `alt`, `aria-label` en botones de icono, mensajes de error específicos — rápidos y de alto impacto.
- **En React**: todo lo demás se aplica globalmente en componentes reutilizables (Button, Input, Modal, Toast) — mucho más eficiente que módulo por módulo en vanilla.

---

## Cuando migremos a React / Zustand

### Arquitectura
- Eliminar iframes — SPA con React Router y Zustand para estado global
- Nav y Footer como componentes React reutilizables (actualmente duplicados en HTML)
- Migrar autenticación de sistema propio (PIN hasheado en BD + sesión localStorage) a Supabase Auth completo. Beneficios en React: RLS automática por JWT, sesiones gestionadas por Supabase, Realtime con auth real. La migración es un refactor de ~1 semana — los datos de trabajadores no cambian, solo la capa de auth.
- Normalización de teléfonos internacionales: actualmente el login compara los últimos 9 dígitos del teléfono, lo que funciona para números españoles (+34) pero no para otras nacionalidades. En React migrar a una librería como libphonenumber-js para parsear y comparar números en formato E.164 independientemente del país.
- Sistema de filtros unificado en Productos: reemplazar chips de categoría + filtro de proveedor por un panel de filtros con tags activos (con × para quitar cada uno individualmente) y botón "Limpiar todo". Permite combinar múltiples filtros visualmente claros. Referencia UX: filtros de Amazon/Zalando.

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


añade en mejoras, que la ubicacion del trabajador deberia ser mas determinante, y para el autogenerador, la ubicacion que tengas hace que te incluyan en cocina, sala o en ambas



añade tb en mejoras que actualemnte en el modal de trabajadores, en hora especial de entrada, se añade una etiqueta sobre el trabajador indicadndo la hora extra que le corresponde ese turno, hay dos cosas que quiero tener en cuenta para esta etiqueta, La primera esq actualmente se ve doble en el grid, si pones a las 14:00, se ve tambien en el turno de noche, que debe entrar a esa hora, cuando deberia interpretar que ese texto deberia salir solo en el turno de medio dia por logia horaria. como segundo es que en algunos casos a los trabajadores no solo se les pone hora en el grid, sino tb algun texto tipo (sala) para dar indicaciones adicionales de donde va en ese turno, deberiamosa añadir un boton de + Añadir nota especial con un texto para ese turno