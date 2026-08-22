# CHANGELOG — La Galería Neotaberna

## v0.2.37 — Navegación con botón atrás + manifest.json + instalación (agosto 2026)
- Botón atrás interceptado: cierra modales, overlays, date-picker, navega entre secciones visitadas y muestra toast de confirmación antes de salir
- goTo() añade estado al historial para navegación hacia atrás entre secciones
- _showModalWithHistory() wrapper para modales del shell con historial
- manifest.json creado con nombre, iconos y configuración de PWA
- Iconos icon-192.png e icon-512.png añadidos a assets/img/
- Meta tags de instalación añadidos a index.html (manifest, theme-color, apple-mobile-web-app)
- Botón "Instalar app" en Ajustes — aparece solo cuando Chrome permite instalar
- APP_VERSION actualizada a v0.2.37

## v0.2.36 — Registro de Stock funcional (agosto 2026)
- Fix crítico: stock_movimientos sin local_id — añadida columna via SQL y poblada en registros existentes
- Fix: renderRegistro() usaba nombre de tabla incorrecto 'productos' en vez de 'stock_productos' — error PGRST200 silencioso
- Fix: renderRegistro() excluía movimientos de productos archivados — eliminado filtro por prodIds, local_id es suficiente para aislar por local
- Fix: adjustQty() no incluía local_id en el INSERT a stock_movimientos — nuevos movimientos ya se guardan correctamente
- Fix: confirmClearReg() tenía el mismo bug de filtrado — corregido de paso
- Registro muestra historial completo incluyendo productos archivados
- MEJORAS.md actualizado: contraste completo, 9 puntos resueltos eliminados, 7 actualizados a parcial
- APP_VERSION actualizada a v0.2.36

## v0.2.35 — Fixes menores + limpieza + date-picker eventos (agosto 2026)
- Fix: date-picker de Turnos muestra puntos de evento en todos los meses — sbLoadTodosLosEventos() carga todos los eventos del local al inicializar
- Eliminado trabajador duplicado "Jaime" de BD (sustituido por "x (Jaime)" activo)
- Limpieza: código muerto .logo-g/.logo-s/.lbtn/.local-sel eliminado de turnos.css y stock.css
- Fix: reservas.css .step-btn usa var(--surf2) — confirmado ya aplicado en refactor anterior
- MEJORAS.md actualizado: 9 puntos resueltos eliminados, 7 actualizados a parcial con notas, contraste completo contra CHANGELOG y código
- APP_VERSION actualizada a v0.2.35

No tocar nada más del archivo.

## v0.2.34 — Segunda pasada modo claro + unificación tokens superficie (agosto 2026)
- Refactoring: var(--nav) → var(--surf2) en 23 elementos de admin.css, turnos.css, stock.css, reservas.css e inicio.css — --nav queda exclusivo para identidad del local (header/footer)
- rgba(255,255,255,.XX) → rgba(0,0,0,.XX) en estados :active y borders — visibles en ambos temas
- Hardcodeados semánticos → tokens: .tab-dot.red/amb usan var(--red)/var(--amb), .sg-cell.unavail usa var(--red), .inv-dot-blue usa var(--sm-text), .inv-banner usa var(--surf2)
- Sistema de superficie unificado: --surf (principal), --surf2 (secundaria), --nav (local) con semántica clara

## v0.2.33 — Fixes modo claro + unificación toast + productos temporales editables (agosto 2026)
- Fix modo claro: .pin-btn, #_toast, .toast, .mclose, .step-btn usan var(--surf2) en vez de var(--nav)
- Sistema de toast unificado: toast.js es la única fuente de verdad para todos los iframes — eliminados showToast() locales de turnos.js e inicio.js, ui-helpers.js sin hardcodeados, #_toast sin estilos inline en todos los HTML
- toast.js busca #_toast en document y window.parent.document — funciona desde cualquier iframe
- Productos temporales editables: al pulsar sobre uno se abre el modal con datos rellenos, saveOneoff() hace INSERT o UPDATE según contexto
- stopPropagation en botón ✕ de producto temporal para no abrir el modal al borrar
- Fix: turnos.html #toast renombrado a #_toast, cargado toast.js

## v0.2.32 — Panel de ajustes, modo claro y sistema de tokens por local (agosto 2026)
- Panel de Ajustes completo: selector Oscuro/Claro/Sistema, vibración al pulsar, sonido de notificaciones, cambiar PIN, versión
- Modo claro implementado con tokens CSS completos — fondo crema cálido, cards blancas, alertas con colores semánticos
- Anti-FOUT: script inline en los 6 HTML aplica el tema antes del primer pintado
- Sistema de tokens por local: --nav, --acc, --surf-nav, --nav-brd derivados de Supabase (tabla locales) — un solo punto de cambio para personalizar el local
- Componente .modal unificado en components.css — eliminadas copias redundantes en index.css, stock.css y reservas.css
- #profile-sheet y subnavegador siguen el tema del usuario (--surf), header mantiene color del local (--nav)
- Haptic feedback: haptic() en utils.js conectado en Turnos, Stock, worker-modal e index
- sounds.js: playTap() y playNotif() con Web Audio API — singleton AudioContext, sin archivos externos
- Badge "Próximamente" en toggle de sonido de notificaciones
- Cambiar PIN con teclado numérico (mismo patrón que onboarding)
- Eliminado sistema legacy sala-theme (setLocal, body.sala-theme, .navbar)
- Limpieza: #save-indicator (código muerto), --gold reemplazado por var(--acc), fallbacks hardcodeados eliminados
- Fix: todos los colores de chips/celdas del grid de Turnos tokenizados (--chip-name-txt, --sm-bg/sn/cm/cn en light-theme más saturados)

## v0.2.31 — Auditoría inicio.js + index.js (agosto 2026)
- Auditoría inicio.js: índice de 9 secciones, JSDoc en 8 funciones, dependencias externas documentadas, fix manejo de errores en Promise.all de _countConflictosTurnos, 5 huecos de error logging cubiertos
- Auditoría index.js: índice con 16 secciones reales, JSDoc en 5 funciones clave, flujo de login documentado completo (incluyendo rama ?tel=, must_change_pin y mock profiles de desarrollo), fix prf_saveProfile foto URL actualizaba memoria aunque fallara BD, 6 huecos de error logging cubiertos
- Convención de prefijos por feature documentada en index.js: ls_, prf_, pin_, cp_, ob_, sa_, aj_, notif_, inv_
- Deuda técnica documentada: date-picker.js con copias privadas de utils (intencional), Zonas sin prefijo propio, prev_sendInvite/prev_resetPin con prefijo inconsistente

## v0.2.30 — Auditoría stock.js + worker-modal.js + refactoring utils (agosto 2026)
- Auditoría stock.js: índice de secciones, JSDoc en 9 funciones clave, glosario de variables globales, fix manejo de errores en adjustQty() (Promise.all sin catch)
- Auditoría stock-status.js: JSDoc añadido
- Auditoría worker-modal.js: índice de 8 secciones, JSDoc en 5 funciones clave, contrato con turnos.js corregido (lagaleria_admin.html añadido, dependencias falsas eliminadas), logs de debug eliminados, .catch() en 5 llamadas fire-and-forget
- Refactoring: MESES_ES, isoWeekNum(), mondayOfDate() movidas a utils.js — eliminadas copias duplicadas de turnos.js e inicio.js
- Fix: lagaleria_turnos.html no cargaba utils.js — añadido antes de worker-modal.js y turnos.js

## v0.2.29 — Auditoría turnos.js + fix saveWeekConfig (agosto 2026)
- Auditoría turnos.js: secciones con índice de navegación, JSDoc en 7 funciones clave, logs de diagnóstico eliminados, código muerto limpiado
- Fix: saveWeekConfig() en Turnos ahora persiste en localStorage['lg_weekconfig_v1'] — el toast "Configuración guardada ✓" ya es verdad
- Auditoría worker-modal.js: logs [MODAL SAVE] y [MODAL CANCEL] eliminados, código muerto limpiado
- MEJORAS.md actualizado: eliminadas las mejoras ya implementadas, reorganizado con pendientes reales

## v0.2.28 — Fix crítico variantes A/B y estandarización guardado turnos (agosto 2026)
- Fix crítico de raíz: constraint turnos_unique ahora incluye variante — variante B puede tener los mismos trabajadores en los mismos slots que variante A. Sin este fix, todos los INSERTs de B fallaban con error 409 silencioso
- Fix: doEliminarVariante usa DELETE+INSERT en vez de UPDATE para promover B→A, evitando violación del índice único
- Fix: _refreshWorkerTurnosFromSupabase carga datos frescos de Supabase al abrir modal de trabajador, sin filtrar por activa
- Datos históricos estandarizados: todas las semanas con variante=A y activa=true correctamente
- Logs de diagnóstico en todas las operaciones: [TURNO ADD], [TURNO DEL], [TURNO REORDER], [MODAL SAVE], [MODAL CANCEL]
- Verificado con prueba completa: A y B coexisten, eliminar A promueve B→A correctamente, sin huérfanos

## v0.2.27 — Fix variantes A/B y auditoría guardado turnos (agosto 2026)
- Fix: eliminar variante A promueve B a A con activa=true — antes dejaba todos los turnos en activa=false
- Fix: datos históricos corregidos (semanas 3, 10, 17 ago tenían activa=false por el bug anterior)
- Auditoría completa de guardado inmediato — todas las rutas confirmadas: añadir/quitar/reordenar trabajador, modal guardar/cancelar, autogenerar, plantilla, limpiar
- Logs de diagnóstico añadidos: [TURNO ADD], [TURNO DEL], [TURNO REORDER], [MODAL SAVE], [MODAL CANCEL]
- B siempre es la alternativa — al pulsar + el nuevo plan se crea siempre como B

## v0.2.26 — Fix guardado turnos + mejoras Stock y Inicio (agosto 2026)
- Fix crítico: guardado inmediato fila a fila en Turnos — eliminado scheduleAutosave() y saveWeekSnapshot() completo. Añadir/quitar trabajador escribe en Supabase al instante, sin ventana de pérdida de datos
- Fix crítico: orden manual de trabajadores persiste — drag & drop sincroniza L().data y hace UPDATE inmediato del campo orden
- Operaciones en bloque (cargar plantilla, autogenerar, limpiar) siguen usando INSERT/DELETE masivo eficiente
- Nombre propio resaltado en dorado en el grid de Turnos (igual que en Inicio)
- Inicio: vacaciones reflejadas en "Tu semana" con celda 🌴 diferenciada
- Inicio: reservas pendientes de confirmar con badge naranja ⏳ en Reservas hoy y alerta dedicada
- Inicio: alerta stock ahora usa getStockStatus() como fuente única de verdad — muestra 8 (red+amb) en vez de 7
- Fix scroll dropdown "Filtrar" en Productos: position:fixed con coordenadas calculadas, overflow-y:scroll, overscroll-behavior:contain
- Pedido/Por proveedor: estado inicial muestra productos urgentes agrupados por proveedor (🔴/🟠) en vez de lista vacía. Sección "Sin proveedor" incluida

## v0.2.25 — Rediseño pantalla Inicio (agosto 2026)
- Inicio rediseñado completo: header personalizado "Buenas, [nombre]", mini grid "Tu semana", turnos de hoy con nombre resaltado en dorado, reservas con barra de ocupación, próximo evento con plazas, alertas navegables, contactos
- Datos en tiempo real desde Supabase: turnos del usuario, reservas del día, próximo evento, alertas de stock y conflictos de turnos
- Reservas sin datos: estado visual verde "Día libre · X mesas disponibles" con icono
- Alertas con etiquetas específicas: "Stock en orden" / "Turnos sin conflictos"
- Responsive desktop: columna centrada 640px, fondo neutro a los lados
- Avatar duplicado eliminado del iframe de Inicio
- Todas las cards son tappables y navegan a su sección correspondiente

## v0.2.24 — Fix crítico variante B + orden manual de turnos (agosto 2026)
- Fix crítico: variante B se perdía al cambiar a variante A dentro de la ventana de autoguardado (2s). scheduleAutosave() ahora captura un snapshot {semana, variante, grid} en el momento de la edición — saveWeekSnapshot() ya no lee globals en vivo sino parámetros fijos
- Fix: todos los turnos existentes migrados a variante='A' (antes tenían NULL por el ALTER TABLE)
- Orden manual de trabajadores persiste: saveWeekSnapshot() guarda el índice de posición (campo orden) y loadWeekFromSupabase() ordena por orden ASC al cargar
- Fix layout chips A/B: misma línea que el selector de semana, alineados a la izquierda
- Fix login ?tel=: sesión activa de otro usuario se ignora correctamente

## v0.2.23 — Plan B de turnos + fixes de variante (agosto 2026)
- Nueva feature: variantes A/B de turnos por semana — plan de respaldo para admin
- Botón "+" junto al selector de semana crea variante B vacía (solo admin)
- Chips A/B en la misma línea que el selector, alineados a la izquierda
- Chip seleccionado en dorado (--acc) con texto oscuro, igual que chips activos en Productos
- Un botón "Activar" y uno "Eliminar" actúan sobre la variante seleccionada
- Modal de confirmación al activar variante no activa o eliminar variante activa
- Empleados solo ven la variante activa — sin chips ni botón "+"
- Fix crítico: cambiar de variante B a A ya no borra los turnos de B (saveWeekSnapshot filtra siempre por variante)
- Fix login ?tel=: sesión activa de otro usuario se ignora al acceder con enlace de invitación

## v0.2.22 — Algoritmo stock, permisos Pedido y fix login ?tel= (agosto 2026)
- Algoritmo getStockStatus() simplificado: qty>min→verde, qty<=min y qty>ceil(min/2)→naranja, qty<=ceil(min/2)→rojo. Más intuitivo y consistente
- Editar producto desde Pedido: admin/encargado abren modal de edición directamente, empleado ve toast informativo
- Chips de categoría en Pedido/Por categoría (mismo espacio que dropdown proveedor)
- Ordenación correcta en Pedido/Por categoría: subcategorías agrupadas bajo su padre (Vinos → Ribera/Rioja/Otros)
- Fix scroll dropdown proveedores en Pedido: panel propio con overflow-y:auto y max-height:60vh
- Fix login con ?tel=: si hay sesión activa de otro usuario, se ignora y muestra PIN del teléfono del enlace
- Toast informativo para empleados al intentar editar/crear productos


## v0.2.21 — Subcategorías de vinos, permisos Stock y validación de campos (julio 2026)
- Subcategorías de Vinos: Ribera del Duero / Rioja / Otros con dropdown en chip "Vinos ▾"
- Vista "Todo": vinos agrupados bajo sección VINOS con subsecciones indentadas
- Header de categoría siempre visible al filtrar (BEBIDAS, ALIMENTACIÓN, RIBERA DEL DUERO...)
- Scroll al inicio al cambiar de categoría o filtro
- Permisos por rol en Stock: empleados solo pueden usar +/- de cantidad, sin crear/editar/borrar
- Modal de producto: selects de categoría en cascada (categoría principal → subcategoría)
- Validación de campos obligatorios en modal de producto: Nombre*, Categoría*, Unidad* con borde rojo y mensaje de error. Patrón reutilizable en components.css
- Foto eliminada de chips del grid de Turnos — más espacio para el nombre
- Ancho mínimo 90px en columnas del grid de Turnos
- Fix: hora_especial formato antiguo eliminado de todos los turnos
- Fix: badge de nota especial aparecía en todos los días del mismo turno en vez de solo el día correcto
- 132 vinos de la carta completa añadidos al catálogo

## v0.2.20 — Fixes post-lanzamiento y nuevos productos (julio 2026)
- Fix: notas especiales en chips de Turnos muestran texto visible en badge dorado (antes icono 📝 con tooltip)
- Fix: selects de nota especial filtrados por días/turnos asignados del trabajador
- Fix: modal de nota especial con campos en una sola línea compacta
- Texto informativo (?) de Nota especial actualizado con descripción del comportamiento
- 38 productos nuevos insertados: El Pozo (6), Indalques (11), Divina Pastora (3), Elias Ortiz (18 verduras)
- Proveedores El Pozo, Indalques, Divina Pastora y Elias Ortiz actualizados con teléfono y comercial
- Total catálogo: 274 productos

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
