## Instrucciones para la IA que lee este documento

Este documento continúa una sesión muy extensa de trabajo en el proyecto Antigravity (La Galería Neotaberna). Léelo completo antes de responder nada. Tu rol es arquitecto y estratega del proyecto, no ejecutor de código — Claude Code (VSCode) ejecuta; tú diseñas, decides, escribes prompts y verificas resultados en el navegador vía Claude in Chrome.

**Cómo comportarte:**

- **No generes archivos .md ni para prompts ni para handoffs.** Todo como texto en el chat — generar archivos infla la conversación innecesariamente y agota recursos antes de tiempo.
- **Antes de cualquier prompt de código, confirma que las decisiones de producto están tomadas.** Si hay ambigüedad, pregunta primero con botones de opción (máx. 3 preguntas, 2-4 opciones cada una).
- **Investiga el código real (vía Claude in Chrome) antes de escribir cualquier prompt.** Nunca asumas cómo funciona algo sin comprobarlo.
- **Nunca aceptes el reporte de Claude Code como verificación suficiente.** Verifica siempre en el navegador real, confirmando en Supabase directo (`_sb.from(...)`) cuando haya persistencia de datos de por medio. Este patrón ha detectado bugs reales decenas de veces esta sesión — incluyendo casos donde el código "ya estaba bien" pero fallaba por falta de una política RLS, algo que solo se ve probándolo.
- **Cuando recomiendes `/clear` o `/compact` para Claude Code**: hazlo cuando el prompt sea una tarea nueva sin relación directa con lo que Claude Code tocó justo antes; no lo recomiendes si es continuación directa del mismo archivo/contexto reciente.
- **Rubén tiene background de ilustrador y diseñador de videojuegos**, no es desarrollador web de formación. Explica decisiones técnicas con claridad, sin condescendencia.
- **Si Rubén te dice que algo "parece raro" en los datos** (cantidades cambiadas, productos nuevos, etc.), considera primero que puede ser él mismo poblando la base de datos real — no asumas que es un bug.
- **Reporta cualquier cosa inesperada que encuentres**, aunque no te la hayan pedido.

---

# Handoff — Antigravity (La Galería Neotaberna) — sesión muy larga, continuación

## Quién eres y qué es esto

Rubén Galera, desarrollador de Antigravity, app de gestión para La Galería Neotaberna (bar en Almería). Stack: vanilla HTML/CSS/JS + Supabase, desplegado en Vercel vía GitHub (`github.com/RubenGalera/lagaleria_demo`, rama `main`). Arquitectura: `index.html` es el shell (header, footer, login, perfil) que monta 4 iframes hermanos siempre cargados simultáneamente: `lagaleria_inicio.html`, `lagaleria_turnos.html`, `lagaleria_reservas.html`, `lagaleria_stock.html`.

Supabase: URL `https://nnmaedehqeeogmhzqzji.supabase.co`, `LOCAL_ID: 3fd1108c-1c7b-4a0e-9141-8527db4e5ccc`. Clave `sb_publishable_...` correcta en todos los archivos (incluido `index.html`, que se quedó atrás con el JWT viejo y se corrigió esta sesión).

**Modelo de seguridad**: control de acceso a nivel de aplicación (login teléfono+PIN), NO RLS granular por usuario. Política por defecto en cualquier tabla nueva: `for all to public using(true) with check(true)`.

**¡Importante sobre Vercel!**: el archivo `vercel.json` NO debe tener una clave `"builds"` que restrinja a `*.html` — eso excluye la carpeta `assets/` del deploy completo y causa 404 silenciosos en producción que no se reproducen en local. Ya se corrigió, pero si en el futuro alguien edita ese archivo, vigilar esto.

**Hay 3 proyectos distintos en la cuenta de Vercel** con nombres parecidos (`lagaleria_demo` — el actual; `la-galeria` y `la-galeria-zt9s` — versiones antiguas/otros proyectos). Solo `lagaleria_demo` es el que importa ahora.

---

## Decisiones de arquitectura permanentes (no reabrir)

- **RLS por defecto**: `for all to public using(true) with check(true)` en cualquier tabla nueva.
- **Excepción deliberada**: `turnos.trabajador_id → trabajadores.id` es `ON DELETE NO ACTION` — protección contra pérdida de histórico. Borrado definitivo de trabajador = 2 pasos explícitos en código (turnos primero, luego trabajador). Nunca cambiar a CASCADE en BD.
- **`evento_asistentes.evento_id`** y **`evento_zonas.evento_id`** SÍ usan `ON DELETE CASCADE` — sin valor histórico independiente del evento.
- **Patrón de creación** (trabajador, producto, evento, asistente, reserva, zona): siempre `await` el INSERT real antes de cerrar el modal, para capturar el UUID real (`_sbId`/`id`) necesario para ediciones/borrados posteriores. Nunca usar un id provisional que luego haya que reconciliar.
- **Patrón de borrado en UI**: nunca confiar solo en quitar de memoria — siempre llamar a la función `sbDelete*` real, con manejo de error (si falla, no modificar memoria ni cerrar el modal).
- **Imágenes — estándar único**: módulo compartido `assets/js/image-utils.js` con `compressImage(file, maxDim=1200, quality=0.75)` → `Promise<Blob>` (JPEG). Toda imagen (foto de perfil, cartel de evento, futuras) pasa por esta función antes de subir a Storage — cada tipo a su bucket (`avatares` para perfiles, `eventos` para carteles), con URL pública `?t=timestamp` para invalidar caché del navegador al cambiar. Nunca guardar imágenes en `localStorage` ni dejarlas solo en memoria como fuente de verdad. Primer paso de modularización real del proyecto (sacar lógica común a su propio `.js`) — seguir este patrón si se extraen más módulos compartidos.
- **Stock — Registro de auditoría**: granularidad de movimiento individual en BD (`stock_movimientos`: producto, delta, tipo `'ajuste'|'inventario'`, quién, fecha/hora) — nunca resúmenes en la tabla. En la UI: agrupación en **día → persona → tipo**, con **agregación por producto** dentro de cada grupo (sumar deltas del mismo producto en vez de listar cada movimiento suelto). Filtro de tiempo tipo extracto bancario (Hoy/7 días/30 días/Este año/Todo). Borrado granular por persona+día (botón ✕ en su sub-card) y "Borrar todo" respetando el filtro activo (solo admin/superadmin).
- **`currentUser` en iframes**: cada iframe tiene su propio contexto global, separado del shell. Cuando un módulo necesita la sesión, usa un wrapper seguro tipo `getStockUser()` (scope local → `window.parent.currentUser` → `null`, con fallback seguro `quien:'Sistema'`/sin permisos de borrado). Nunca referenciar `currentUser` directo sin ese wrapper dentro de un iframe.

---

## Estado al cerrar esta sesión — TODO lo siguiente está completo y verificado en vivo

### Turnos
Fases A1 (carga) y A2 (guardado con autosave, snapshot por semana) verificadas. Bug de label de semana corregido.

### Perfil de trabajador — completo
RLS ampliado (tenía solo SELECT). Foto de perfil conectada a Storage bucket `avatares`, ahora pasando por `compressImage()` antes de subir (antes subía sin comprimir; un Blob de 3MB de prueba terminó en 13KB). Archivado/restaurar/borrado definitivo de trabajador funcionando. Skills/disponibilidad/vacaciones conectados de verdad (ni cargaban ni guardaban antes — RLS + lógica faltante). Bug de matching "Plancha" (BD) vs "Plancha / Freidora" (lista local `ROLES`) arreglado con `.includes()` bidireccional. Creación de trabajador nuevo ahora persiste de verdad (antes solo memoria).

### Zonas
RLS ampliado, CRUD completo funcionando.

### Formulario de reservas — 3 bugs encontrados y arreglados
1. 6 sitios con `onclick="fn(${uuid},this)"` sin comillas → `SyntaxError` en cualquier click (`selectZona`, `toggleEvZona`, `openDetail`, `openEvDetail`, `openEditAsistente`, `setZona`).
2. `getSelectedZona()`/`getEvZonas()` aplicaban `parseInt()` a un UUID, destruyéndolo.
3. El formulario de "Nueva reserva" no resetea pax/mesas/estado al abrir (heredaba de la última edición).

### Borrado real de reservas y asistentes
`confirmDelRes()`/borrado de asistente solo quitaban de memoria, nunca llamaban a la función real de Supabase. Arreglado con manejo de error.

### CSS de login
Gap entre campo de teléfono y botón "Continuar", y gap del teclado PIN (8px→16px).

### Dashboard de `inicio.html`
Leía eventos/reservas/stock de `localStorage`, nunca de Supabase. Ahora hace queries reales mapeadas al formato esperado por las funciones de render existentes. Bug "NaN€/NaN€" → "0€/0€" con 0 asistentes.

### Clave de Supabase antigua en `index.html`
El shell tenía el JWT viejo mientras los módulos ya usaban la clave nueva — causaba `Invalid API key` silencioso en `sbVerifyLogin`/`sbLoadLocal`.

### Sesión no persistía — 2 bugs en cadena
1. `applySession` guardaba en `'lg_session'`, la restauración leía `'ag_session'`.
2. La restauración corría en un IIFE antes de `DOMContentLoaded` — `currentUser` se poblaba pero el DOM del login/app no existía aún. Movido a `ls_init()`. Verificado: login con "Recordar" sobrevive recargas múltiples; logout borra sesión correctamente.

### Stock — Stock + Pedido (básico) + Registro (rediseño completo)
- **Stock**: 10 productos reales, RLS ampliado (INSERT/DELETE para crear/archivar productos — borrado es soft-delete `activo=false`). Categorías y ubicaciones corregidas (bug "Otro" en ambas — `normCat`/`normLoc` no reconocían los valores reales; ubicaciones renombradas de "Despensa"/"Garaje" a "Almacén"/"Garaje" reales del negocio).
- **Pedido**: detecta correctamente productos críticos con datos reales — **pero el rediseño completo (ver pendientes) todavía no se ha aplicado**.
- **Registro**: rediseño completo aplicado y verificado — filtro de tiempo (Hoy/7 días/30 días/Este año/Todo), agrupación día→persona→tipo (ajuste vs inventario distinguidos visualmente), agregación por producto, borrado granular por persona+día, "Borrar todo" respetando filtro (solo admin/superadmin, con 2 bugs encontrados y corregidos: la lógica de mostrar/ocultar el botón solo tenía la rama de ocultar, nunca la de mostrar; y el CSS de los 5 chips de filtro los dejaba agrupados a la izquierda con hueco vacío, corregido a `flex:1` cada uno).
- Bug `getStockUser` (Blob sin `.name`, currentUser no existe en scope de iframe) resuelto con wrapper seguro.

### Asistentes de evento — tabla nueva
`evento_asistentes` creada (no existía nada, vivía solo en memoria). CRUD completo conectado y verificado en vivo.

### Zonas de evento — tabla nueva + payload de evento reescrito
Se descubrió que **la creación/edición de eventos llevaba rota desde siempre**: `sbSaveEvento` no incluía `local_id`, usaba columnas inexistentes (`foto`, `nota` no existía todavía), y nunca persistía las zonas ocupadas. Se creó tabla `evento_zonas` (evento_id, zona_id, CASCADE), se añadió columna `nota` a `eventos`, y se reescribió `sbSaveEvento`/`saveEvento`/`sbLoadEventos` completos. Verificado extremo a extremo: crear evento con nota + 2 zonas, recargar, editar a 1 zona distinta, confirmar reemplazo correcto en BD.

### Bug de tipo de evento "birthday" sin match
Mismo patrón que categorías de Stock: `TIPOS_EVENTO` en `reservas.html` no tenía `birthday`. Arreglado (label "Cumpleaños", emoji 🎂). Auditoría del mismo patrón en `turnos.html` — sin bugs nuevos encontrados ahí (su catálogo de tipos de evento ya incluía `birthday`).

### Imagen de evento (cartel/menú) — conectada a Storage
Bucket nuevo `eventos` (público, 2MB, `image/*`). Usa el módulo compartido `compressImage()`. Verificado: sube, comprime, persiste, sobrevive recarga.

### `toggleDashDispo` — descartado como bug real
El `ReferenceError` que se reportó era síntoma de Live Server desconectado en ese momento, no un bug de código. Confirmado funcionando normal una vez reconectado.

### Vercel — 404 de `stock.css`/`stock.js` en producción
Causa real: `vercel.json` tenía `"builds": [{"src":"*.html","use":"@vercel/static"}]`, que excluía todo lo que no fuera `.html` de la raíz (incluida toda la carpeta `assets/`). No era un problema de git/commit (los archivos sí estaban bien subidos a GitHub). Corregido quitando esa clave.

---

## PENDIENTE ACTIVO MÁS IMPORTANTE — Rediseño de Pedido

Todavía no se ha tocado. Ya se recuperó el **código completo del diseño antiguo** (de una versión anterior del proyecto, desplegada en `la-galeria.vercel.app`) que Rubén quiere recuperar. Lo importante de ese diseño antiguo para Pedido:

- Botón verde **"Enviar pedido por WhatsApp"** arriba (icono SVG de WhatsApp), que construye un mensaje de texto agrupado por categoría con formato WhatsApp (`*negrita*`, viñetas `•`) y abre `https://wa.me/?text=<mensaje codificado>` **sin número fijo** — el usuario elige el destinatario cada vez al abrirse WhatsApp.
- Botón **"+ Añadir producto puntual"** — abre un modal simple (nombre, cantidad, unidad) para un producto que se pide **solo esa vez, sin guardarse en el inventario** (en el diseño antiguo vivía solo en un array `oneoffs` en memoria de sesión — probablemente está bien mantenerlo así, ya que es explícitamente "puntual" y no necesita sobrevivir un refresh, pero confirmar con Rubén si quiere que persista de alguna forma).
- La lista de productos a reponer va **agrupada por categoría** (con su icono, mismo patrón ya usado en Stock), mostrando "Tienes X · mín. Y · ubicación" y un tag con "+N unidad" (cantidad que falta para llegar al mínimo).
- Si no hay nada que pedir, estado vacío "¡Todo en orden!".

Código de referencia del `renderPed()`/`sendWA()`/`addOneoff()` antiguo (adaptar a los datos reales de Supabase, no copiar literal — usa categorías/ubicaciones reales ya conectadas):

```js
function renderPed(){
  const wrap=document.getElementById("ped-content");
  const needed=prods.filter(p=>sc(p)!=="grn");
  const hasContent=needed.length||oneoffs.length;
  let html=`<button class="ped-send" onclick="sendWA()">[icono SVG WhatsApp] Enviar pedido por WhatsApp</button>
  <button class="add-btn" onclick="openOneoffModal()">+ Añadir producto puntual</button>`;
  if(!hasContent){ /* estado vacío */ wrap.innerHTML=html; return; }
  if(oneoffs.length){
    html+=`<div class="oneoff-section-lbl">Productos puntuales</div>`;
    oneoffs.forEach(o=>{ html+=`<div class="oneoff-item">...${o.name}: ${o.qty} ${o.unit}...<button onclick="removeOneoff(${o.id})">×</button></div>`; });
  }
  Object.entries(CATS).forEach(([cat,info])=>{
    const ps=needed.filter(p=>p.cat===cat);
    if(!ps.length)return;
    html+=`<div class="sec-hdr">${info.icon} ${info.label}</div>`;
    ps.forEach(p=>{
      const need=Math.max(1,p.min-p.qty);
      html+=`<div class="ped-item ${sc(p)}">...Tienes ${p.qty} ${p.unit} · mín. ${p.min} · ${LOCS[p.loc]}...<span class="ped-tag">+${need} ${p.unit}</span></div>`;
    });
  });
  wrap.innerHTML=html;
}
function sendWA(){
  let msg="🍷 *Pedido La Galería*\n\n";
  if(oneoffs.length){ msg+="*✦ Productos puntuales*\n"; oneoffs.forEach(o=>msg+=`• ${o.name}: ${o.qty} ${o.unit}\n`); msg+="\n"; }
  Object.entries(CATS).forEach(([cat,info])=>{
    const ps=needed.filter(p=>p.cat===cat);
    if(!ps.length)return;
    msg+=`*${info.icon} ${info.label}*\n`;
    ps.forEach(p=>{const need=Math.max(1,p.min-p.qty);msg+=`• ${p.name}: ${need} ${p.unit}\n`;});
    msg+="\n";
  });
  window.open("https://wa.me/?text="+encodeURIComponent(msg));
}
```

**Antes de escribir el prompt**: confirmar con Rubén si el "producto puntual" debe quedar solo en memoria de sesión (como el diseño antiguo) o necesita algo más persistente, y si quiere ajustes al mensaje de WhatsApp.

---

## Otros pendientes (menores)

- **Reasignación de ubicaciones de Stock**: los 10 productos reales tienen "Almacén" puesto de forma temporal/arbitraria — Rubén los reasignará a Almacén/Garaje reales cuando tenga el inventario físico real. Tarea suya, no requiere prompt.

---

## Entorno de trabajo y patrones de verificación

- **Claude Code (VSCode)**: ejecuta los cambios. Rubén pega los prompts que generas en el chat (nunca archivos .md).
- **Claude in Chrome**: extensión conectada al navegador de Rubén — verificación en vivo. **Se cae intermitentemente en sesiones largas** — si una herramienta da "Tool not found", pide a Rubén que confirme que la extensión está activa y reintenta `list_connected_browsers` en el siguiente turno, normalmente se resuelve solo.
- **Live Server (VSCode)**: sirve la app en `http://127.0.0.1:5500/`. Si algo no carga o las funciones dan `undefined`, confirmar que Live Server sigue activo antes de asumir un bug de código.
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/nnmaedehqeeogmhzqzji` — SQL Editor usado constantemente para políticas RLS y verificación directa de datos.
- **Login de pruebas**: teléfono `admin`, PIN `1234` (atajo de desarrollo). Con "Recordar" activo, la sesión persiste entre recargas del shell — pero recuerda que la sesión real actual de Rubén usa su nombre real ("Rubén García", rol admin), así que verás datos reales mezclados con cualquier dato de prueba que quede sin limpiar.

### Problemas técnicos conocidos y cómo resolverlos

1. **Caché de JS dentro de iframes**: cuando Claude Code modifica un archivo `.js` cargado dentro de un iframe (ej. `stock.js`), `location.reload()` —incluso `location.reload(true)`, que está deprecado— puede **no** recargar el script real, sirviendo una versión vieja cacheada en memoria. Si una función recién "arreglada" parece seguir fallando tras recargar, fuerza la versión fresca así antes de seguir investigando:
```js
   const src = await fetch('/assets/js/stock.js', { cache: 'no-store' }).then(r => r.text());
   window.eval(src);
```
2. **Drawer de perfil se abre solo**: en el shell, hacer scroll dentro de un iframe a veces dispara accidentalmente el panel de perfil (`#profile-sheet`). Si bloquea la interacción: `document.getElementById('profile-sheet').style.display = 'none'`.
3. **Probar permisos por rol sin credenciales reales**: sobrescribe `window.currentUser = {nombre:'Test', rol:'admin'}` en el contexto correcto (shell si el módulo usa wrapper tipo `getStockUser()`, o directo en el documento si la página es standalone), y vuelve a llamar a la función de permisos/render relevante (ej. `applyRolePermissions()`, `renderRegistro()`) para que se refleje.
4. **Verificación de subida de imágenes sin archivo real**: crea un `Blob`/`File` sintético con `canvas.toBlob()` en el navegador, sin necesitar seleccionar un archivo real desde disco — mucho más rápido para probar `compressImage()`/subida a Storage.
5. **`web_fetch` (sin extensión de Chrome) tiene restricciones**: solo permite fetchear URLs que ya aparecieron en un resultado previo de búsqueda/fetch, y no resuelve bien links relativos. Para inspeccionar páginas de deploys antiguos de Vercel, es más fiable pedirle a Rubén que abra la URL y pegue el código fuente (Ctrl+U) directamente como texto.

### El patrón de verificación que ha detectado más bugs reales esta sesión

**Nunca aceptar "el código ya está bien" sin probarlo en vivo con datos reales y confirmando en Supabase directamente.** Decenas de veces el código estaba perfectamente escrito pero fallaba por falta de una política RLS, un nombre de columna desajustado, o una variable de caché — errores que solo se detectan probando, nunca solo leyendo el código. Flujo estándar: cambio aplicado por Claude Code → hard refresh (o fetch+eval si hay sospecha de caché) → reproducir el caso real en el navegador → confirmar en Supabase con `_sb.from(...)` → solo entonces cerrar la tarea.