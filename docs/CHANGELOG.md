# CHANGELOG — La Galería Neotaberna


Añadir al inicio de docs/CHANGELOG.md (después del título, antes de v0.2.18):

## v0.2.19 — Plantillas de turno + componente unificado de trabajador (julio 2026)
- Sistema de plantillas de turno: modal "Generar" ampliado con Cargar plantilla / Automático / Guardar plantilla. Cargar respeta vacaciones, días no disponibles y trabajadores archivados
- turnoPlantilla.js y turnoAutogen.js extraídos a assets/lib/ con JSDoc
- Barra de Turnos reducida a 2 botones: Generar y Limpiar
- workerCreateModal.js — componente compartido para crear trabajador. Admin y Turnos usan el mismo modal (mismos campos, mismo guardado en BD)
- Fix: archivar trabajador desde Turnos ahora actualiza columna archivado=true en BD
- Fix: trabajador archivado desaparece al instante de la lista en Turnos sin recargar


## v0.2.18 — Mejoras modal trabajador, eventos y accesos rápidos (julio 2026)
- Modal trabajador: secciones reorganizadas (Min/Max → Días no disponibles → Nota especial → Prioridad → Habilidades → Vacaciones)
- Fusión "Hora especial" + "Notas" en una única sección "Nota especial" (día + turno + texto, los 3 obligatorios). Las notas aparecen como 📝 en el chip del día/turno correcto en el grid de Turnos
- Botones (?) informativos junto a cada sección del modal de trabajador
- Rename "Eventual" → "Extra" con botón seleccionado resaltado
- Toggle "Descuento 50%" en asistentes de evento (cuenta 0.5 en total económico)
- Botones 📞 💬 en modal de asistente de evento
- Visor de Contactos y Proveedores en Inicio — acceso rápido con llamada/WhatsApp, solo lectura
- Fix: eventos.descripcion corregido (antes buscaba columna nombre inexistente → error 400)
- Cards de trabajador en Admin muestran rol en vez de sección
- Foto de perfil sustituye inicial en header, cards Admin, modal y chips de Turnos
- Sección editable desde modal de trabajador (admin)
- Dudosos no cuentan en total económico del evento
- Vinos y ubicación Bodega funcionando en Stock

## v0.2.17 — Sincronización Admin↔Turnos + fixes post-lanzamiento (julio 2026)
- Fix crítico: disponibilidad noche no se guardaba — 'noc' corregido a 'noch' en worker-modal.js, turnos.js y adminWorkers.js. 48 filas de disponibilidad nocturna ahora reconocidas correctamente
- Fix crítico: skills y vacaciones no escribían en Supabase desde Admin — solo mutaban memoria con toast falso
- Fix crítico: sincronización bidireccional Admin↔Turnos via postMessage — cambios en cualquier módulo se reflejan al cambiar de pestaña
- Grid de días en Admin: vacío (sin turnos de semana concreta), solo lectura con toast informativo al pulsar
- Trabajadores archivados con turnos: aparecen en grid solo lectura, excluidos del roster activo
- Ubicaciones de stock desde BD — eliminado hardcoding, Bodega añadida
- Constraint de categoría eliminado — Vinos funciona correctamente
- PIN escribible con teclado físico (dígitos 0-9, Backspace, Enter)
- Exportación imagen Turnos: botones añadir ocultos
- Fuente del grid de Turnos aumentada (13px, altura mínima 26px)

## v0.2.16 — Eventos, trabajadores y fixes de roles (julio 2026)
- Eventos: campo Instagram, hasta 3 imágenes, botón compartir (Web Share API con fallback WhatsApp)
- Modal de asistente reorganizado: toggle Dudoso, chip Invitado 🎁, campo teléfono, orden lógico de campos
- Dudosos en azul cursiva + "(Dudoso)" explícito — no cuentan en total económico del evento
- Invitados no cuentan en dinero a recaudar
- FAB eliminado — botón "+ Añadir asistente" ancho completo fijo al fondo
- Botón "+" en grid de Turnos: visible solo para admin/superadmin, genera el botón condicionalmente en el DOM
- Cambio de rol desde modal de trabajador (solo admin/superadmin)
- Fix: contador de turnos actualizado en tiempo real al marcar/desmarcar celdas
- Alejandro renombrado desde Alex

## v0.2.15 — Limpieza y reorganización de código (julio 2026)
- assets/lib/utils.js creado: centraliza cleanTel(), hashPin() y normalizeText() con JSDoc. Elimina duplicados en worker-modal.js, adminStock.js, index.js, adminContactos.js y stock.js
- assets/lib/toast.js creado: showToast(mensaje, tipo) unificado con estilos en components.css. Reemplaza implementaciones dispersas en Stock, Admin y shell
- stock-status.js movido de assets/js/ a assets/lib/ — es una utilidad compartida, no un módulo de página
- docs/ARCHITECTURE.md actualizado con convención de carpetas: assets/js/ (un archivo por iframe) vs assets/lib/ (utilidades compartidas y módulos admin*.js)

## v0.2.14 — Stock: búsqueda avanzada, pedido mejorado y contactos (julio 2026)
- Búsqueda multi-campo en Productos: busca en nombre, proveedor, unidad, nota y ubicación simultáneamente. Palabras independientes ("seygo garrafa" filtra por proveedor Y unidad)
- Filtro de proveedor en Productos: botón junto al buscador, muestra "Filtrar: [nombre]" cuando está activo, abre lista directamente
- Cards de Pedido rediseñadas para ser visualmente consistentes con Productos (semáforo, icono categoría, badges de ubicación y proveedor)
- getStockStatus() unificada como única fuente de verdad para semáforos en Productos y Pedido. Fix: min=0 siempre verde
- Chips, buscador y toggle de Pedido con position sticky — siempre visibles al hacer scroll
- Admin/Contactos: nueva sección para técnicos y mantenimiento con CRUD completo
- Botones llamar 📞 y WhatsApp 💬 en modales de proveedores y contactos
- Alhabia separado en "Alhabia Bebidas" y "Alhabia Alimentación" con sus contactos respectivos
- 35 proveedores actualizados con teléfonos de comerciales y notas de contacto
- 8 técnicos insertados en tabla contactos

## v0.2.13 — Fix login: normalización de teléfono (julio 2026)
- Login real ahora encuentra al trabajador independientemente del formato del teléfono en BD (+34 656 187 336, 656187336, 656-187-336, etc.)
- Comparación por últimos 9 dígitos tras eliminar espacios, guiones y prefijos (+34, 0034)

## v0.2.12 — Auth real con PIN + invitación por WhatsApp (julio 2026)
- Sistema de autenticación real: login con teléfono + PIN hasheado (SHA-256 via Web Crypto API)
- Flujo de invitación desde Admin: genera PIN temporal 1234, lo hashea en BD, abre WhatsApp con mensaje de bienvenida y enlace personalizado ?tel=
- Login real contra Supabase (sustituye el bypass hardcodeado como única vía de acceso)
- Pantalla "Cambia tu PIN" obligatoria en primer acceso (must_change_pin=true)
- Enlace ?tel= prellena el teléfono y salta directo al teclado PIN
- Columna archivado añadida a trabajadores (independiente de activo)
- Separación de estados: Pendiente (sin PIN), Activo (con PIN), Archivado (sin acceso)
- Badge ⏳ Pendiente / ● Activo en listado de trabajadores
- Selector de rol al crear trabajador — Superadmin eliminado del selector por seguridad
- Trabajadores ficticios eliminados, 8 trabajadores reales
- docs/TFM.md creado con documentación inicial del proyecto

## v0.2.11 — Pedido por proveedor + catálogo real (julio 2026)
- Módulo Pedido rediseñado con dos vistas: Por categoría y Por proveedor
- Vista por proveedor: lista inicial con indicadores 🔴/🟠 de urgencia, resumen de urgentes agrupado por proveedor, catálogo completo con +/- editable
- Badge de proveedor visible en cada producto de la vista por categoría
- Icono de categoría visible en ambas vistas de Pedido
- Buscador en tiempo real en tab Productos (filtra por nombre, sin tildes, dentro de categoría activa)
- 223 productos reales insertados desde facturas de proveedores
- 35 proveedores reales con teléfonos y emails actualizados
- Columna EAN añadida a stock_productos
- Tab "Stock" renombrada a "Productos"

## v0.2.10 — Stock: Proveedores (julio 2026)
- Nueva sección Admin/Stock·Proveedores con CRUD completo
- Proveedor asignable a cada producto, badge visible en card de inventario
- Pedido: WhatsApp y añadir producto puntual movidos al final del listado
- Chips de categoría con estilo activo dorado igual que Reservas
- Botones +/- iluminados en azul claro al activar modo "Actualizar inventario"
- Cards de inventario completamente clickables para editar (excepto +/-)
- Admin/Stock·Categorías: muestra "X productos" en vez del slug
- Fixes de z-index y acordeón en modales de trabajador

## v0.2.9 — Refactorización CSS/JS (junio-julio 2026)
- Separación total de CSS/JS inline en archivos externos (todos los módulos)
- Estructura de carpetas unificada y documentación movida a docs/
- Renombrado de tablas BD para mayor consistencia

## v0.2.8 — Rediseño grid Turnos (junio 2026)
- Grid más compacto: sin columna de horas, fila de eventos dedicada encima de fechas
- Navegación de semanas y badges de eventos desde Supabase

## v0.2.7 — DatePicker compartido (junio 2026)
- Componente DatePicker corporativo compartido entre Turnos (semanas) y Reservas (días)
- Dots de eventos, botón Hoy, navegación libre sin límites

## v0.2.6 — Gestión de trabajadores (mayo-junio 2026)
- Toggles Disponible y Visible, archivar/restaurar/borrar trabajadores
- Spinner de carga, logout de superadmin, fixes de popups y z-index

## v0.2.5 — Admin modular + categorías de stock (mayo 2026)
- AdminEntityModal: componente compartido para Zonas, Habilidades y Categorías
- Categorías de stock dinámicas desde Supabase, drag-to-reorder, categoría fallback "Sin categoría"

## v0.2.4 — Reservas + Eventos (abril-mayo 2026)
- DatePicker en Reservas, estado vacío visual, reordenación de cabecera
- Fix edición inmediata de reservas y eventos recién creados

## v0.2.3 — Admin + design system (abril 2026)
- Admin como iframe condicional con módulos separados
- Design system: tokens.css, components.css, save indicator global, ls_init() con spinner

## v0.2.2 — Base de datos (abril 2026)
- Conexión Supabase, tablas creadas, datos mock eliminados

## v0.2.0 — Arquitectura modular (marzo 2026)
- Paso de HTML monolítico a arquitectura con iframes y módulos separados
- Despliegue en Vercel

---
*Nota: el CHANGELOG se implementó formalmente a partir de v0.2.10. Las versiones anteriores son una reconstrucción aproximada del historial.*
