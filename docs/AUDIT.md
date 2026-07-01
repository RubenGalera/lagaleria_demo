# AUDIT.md — lagaleria_demo
Auditoría multi-pasada. Referencia: ARCHITECTURE.md.
Fecha: 2026-06-23.

---

## 1. Inventario de archivos

### lagaleria_stock.html + assets/js/stock-status.js + assets/js/image-utils.js

**lagaleria_stock.html**
- 251 líneas. Wrapper HTML puro sin lógica JS inline.
- Script load order correcto: `stock-status.js defer` → `stock.js defer`.
- Supabase client y `LOCAL_ID` hardcodeados en `<script>` inline antes de los defer (necesario por timing; OK por ahora).
- `SUPABASE_ANON` expuesta en cliente: esperado con Supabase anon key + RLS, pero debe estar en `.env` si se migra a build.
- `onclick="showModal()"` en el botón "Añadir producto" → la función se llama `showModal` (no prefijada con dominio), correcto según prefijo `show`.
- Tiene `onclick="toggleInv()"` → prefijo `toggle` no está en la tabla de ARCHITECTURE.md. Candidato a renombrar: `setInvMode()` o `showInvBanner()`.
- Modal confirmaciones inlined en HTML (confirm-reg-bg, confirm-del-bg) — correcto para vanilla.

**assets/js/stock-status.js**
- 26 líneas. Tres funciones: `getStockStatus`, `isPendingForOrderView`, `markStockActivity`.
- Nomenclatura perfectamente alineada con ARCHITECTURE.md (`get`, `is`, `mark`).
- `_pendingSnapshot` es un Map global — funciona, pero si se extrae a módulo ES debería exportarse junto a las funciones que lo usan.
- No tiene comentario de cabecera de 2-3 líneas (ARCHITECTURE.md §5 lo exige para módulos nuevos). **Pendiente añadirlo.**

**assets/js/image-utils.js**
- Función única `compressImage(file, maxDim, quality)`. Bien documentada.
- Se carga en `lagaleria_reservas.html` (para imágenes de eventos) pero no en `lagaleria_stock.html` ni `lagaleria_turnos.html` — correcto, solo se usa donde se suben imágenes.
- Candidato a `assets/modules/image-utils.js` según árbol objetivo de ARCHITECTURE.md.

---

### index.html

- 1992 líneas. Todo (CSS + HTML + JS) en un único archivo.
- **CSS tokens**: `--bg`, `--surf`, `--acc`, `--grn` — pero le faltan `--amb`, `--amb-bg`, `--amb-bd`, `--red-bg`, `--red-bd`, `--grn-bg`, `--grn-bd` que sí existen en `lagaleria_reservas.html` y `stock.css`. Los modales del perfil y notificaciones que puedan necesitar colores de estado tendrán que duplicarlos inline.
- **MOCK_PROFILES**: objeto global definido aquí (línea ~70). Debería estar en `assets/mock/profiles.js` per ARCHITECTURE.md §2.
- **currentUser**: global window, leído por todos los iframes vía `window.parent.currentUser`. Acoplamiento fuerte — correcto para vanilla, documentar cuando se migre.
- **Login PIN**: PIN temporal `1234` aceptado en fallback mock. **Bug de seguridad en producción**: si Supabase falla (catch), el mock con PIN universal queda activo. Necesita un flag `IS_PRODUCTION` o eliminar el fallback antes de lanzar.
- **Onboarding PIN**: guardado en `localStorage` (`lg_pin_*`). No persiste a Supabase. Si el usuario borra caché, pierde el PIN que configuró. TODO marcado en el código (`ob_pinPress`).
- **`notif_loadPrefs` / `notif_savePrefs` / `aj_loadPrefs` / `aj_savePrefs`**: todas usan localStorage. Aceptable para preferencias de UI (no son fuente de verdad de negocio).
- **Foto de perfil**: guardada en localStorage (`prf_photo_*`). Correcto para demo; en prod debería ir a Supabase Storage.
- **Zone CRUD** (`saveZona`, `delZona`, `renderZon`): lógica en-memoria con `locales` array mock. Sin Supabase. Funciona como demo pero no persiste.
- **Toast duplicado**: `toast()` usa `#_toast`. `stock.js` usa `showToast()` con `#toast`. Dos sistemas distintos sin shared module.
- **`sbVerifyLogin`**: función async que consulta Supabase, pero si falla cae en mock con PIN `1234`. Ver bug de login arriba.
- **`sbLoadLocal` / `getActiveLocal`**: cargan el local activo. Bien estructuradas.
- **`goTo(page)` / `goToAndClose(page)`**: navegan entre iframes (cambian `src` de iframes en el parent). Mecanismo de routing principal.
- **Funciones de nombre incorrecto por ARCHITECTURE.md**:
  - `renderZon()` → debería ser `renderZones()` (inglés).
  - `openNewZona()` / `openEditZona()` → `openNewZone()` / `openEditZone()`.
  - `saveZona()` / `delZona()` → `saveZone()` / `deleteZone()`.
  - `rolLabel()` → `getRolLabel()` o `formatRol()`.
  - `openProfile()` → `showProfile()` (prefijo `show` para abrir UI).

**Funciones JS catalogadas (index.html)**:
`sbLoadLocal`, `sbSaveLocal`, `sbVerifyLogin`, `getActiveLocal`, `applySession`, `doLogout`, `goTo`, `goToAndClose`, `openProfile`, `rolLabel`, `closeAll`, `renderZon`, `openNewZona`, `openEditZona`, `saveZona`, `delZona`, `confirmDelZona`, `renderEmojiGrid`, `pickEmoji`, `toggleEmojiGrid`, `showModal`, `closeModal`, `stepField`, `toast`, `prf_openModal`, `prf_markDirty`, `prf_setPhoto`, `prf_deletePhoto`, `prf_triggerPhoto`, `prf_saveProfile`, `prf_focusField`, `notif_openModal`, `notif_save`, `notif_loadPrefs`, `notif_savePrefs`, `openSuperadminPanel`, `sa_renderLocales`, `sa_editLocal`, `sa_newLocal`, `sa_clearCache`, `ajustes_openModal`, `aj_setTheme`, `aj_save`, `aj_loadPrefs`, `aj_savePrefs`, `pin_onTelInput`, `pin_press`, `pin_del`, `pin_render`, `pin_error`, `pin_forgot`, `forgot_send`, `forgot_whatsapp`, `doLogin`, `ls_init`, `ls_show`, `ls_onTelInput`, `ls_goPin`, `ls_back`, `pin_submit`, `onboarding_check`, `ob_showStep`, `ob_next`, `ob_pinPress`, `ob_pinDel`, `ob_pinRender`, `ob_pinError`, `ob_sendEmail`, `ob_skipEmail`, `ob_finish`, `inv_sendWhatsApp`.

---

### lagaleria_inicio.html

- 4399 líneas. Archivo más grande del proyecto.
- **CSS duplicado**: bloques enteros de CSS repetidos (`.skill-dept-lbl`, `.skill-row`, `.skill-pill`, `.acc-block`, `.minmax-row`, `.hora-row`, etc. aparecen 2 veces). Probablemente por iteraciones incrementales sin limpiar.
- **Tokens CSS**: incluye todas las variables de index.html + añade `--sm-*`, `--sn-*`, `--cm-*`, `--cn-*` para colores de turnos de sala/cocina. Correcto — estos tokens son específicos de turnos.
- **`@tabler/icons-webfont`**: cargado desde CDN. Dependencia externa sin fijar versión (`@latest`). Riesgo de breaking change silencioso.
- **Supabase integración**: bien estructurada. `initSupabase()` carga en paralelo (Promise.all) zonas, trabajadores, skills, productos. Mapea columnas Supabase → formato interno JS.
- **Soft delete**: `sbDeleteTrabajador` hace `update({activo:false})` ✓. `sbDeleteZona` hace `update({activa:false})` ✓.
- **`sbUpdateProducto`**: actualiza `cantidad` y además inserta en `stock_movimientos`. **Problema**: stock.js gestiona su propia lógica de stock (con `ajuste` en su propio flujo). Si este archivo también actualiza `stock_movimientos`, hay dos caminos distintos para el mismo log. Verificar que no haya duplicados.
- **`_sbProductos`**: variable global que se rellena con datos de Supabase. Sin embargo, stock.js tiene su propio `prods` array. Dos caches distintas de los mismos datos — no están sincronizadas entre iframes.
- **`toggleDashDispo()`**: referenciada en el HTML del dashboard. **BUG anotado en sesión anterior**: función existe pero tenía un error de invocación (bug `toggleDashDispo`). Verificar estado actual.
- **Dashboard stock card**: llama a `navTo('stock','pedido')` — función de navegación cross-iframe. Asume que el iframe de stock existe y tiene el tab 'pedido'. Sin error handling si el iframe no está cargado.
- **`renderTrabajadores`** / **`renderZonas`**: llamadas desde `initSupabase()` como `if(typeof renderTrabajadores==='function')`. Patrón defensivo correcto para carga asíncrona.
- **WeekConfig**: componente complejo con 7 días × slots × roles. Sin persistencia a Supabase aún.
- **Stock admin panel**: `#view-stock-admin` embebido en esta página, con pills de categorías y lista de productos. **Duplicación de UI con lagaleria_stock.html**. Sirve propósitos distintos (admin vs operaciones) pero comparte datos.
- **Funciones clave**: `setTab`, `openZonas`, `closeZonas`, `openTrabajadores`, `closeTrabajadores`, `openSkillsPanel`, `closeSkillsPanel`, `openWeekConfigPanel`, `closeWeekConfigPanel`, `openStockPanel`, `renderZonas`, `renderTrabajadores`, `renderSkills`, `initDashboard`, `toggleDashDispo`, `navTo`, `showConfirm`, `initSupabase`, `sbLoadZonas`, `sbLoadTrabajadores`, `sbSaveTrabajador`, `sbDeleteTrabajador`, `sbLoadSkills`, `sbSaveZona`, `sbDeleteZona`, `sbLoadProductos`, `sbUpdateProducto`.

---

### lagaleria_reservas.html

- 1553 líneas.
- **Tokens CSS**: incluye `--amb`, `--amb-bg`, `--amb-bd`, `--grn`, `--grn-bg`, `--grn-bd` — los más completos del proyecto. Referencia para `tokens.css` futuro.
- **Supabase integrado**: reservas, zonas, eventos, asistentes, evento_zonas. `initSupabase()` usa Promise.all para carga paralela.
- **Mock data inicial**: `reservas` array inicializado con 6 reservas hardcodeadas. `initSupabase()` las reemplaza solo si `sbRes.length > 0`. Si Supabase devuelve vacío, el mock persiste. **Bug potencial**: un día sin reservas mostrará las reservas mock en lugar de estado vacío.
  - Fix: inicializar `reservas = []` y llamar siempre a `renderRes()` tras `initSupabase()`, independientemente del length.
- **`loadZonas()`**: intenta `window.parent.getActiveLocal()`, si falla usa zonas mock. **Problema**: esta lista mock no coincide con las zonas reales de Supabase. Si Supabase carga zonas vía `initSupabase()`, esas reemplazan a las mock — pero si la carga falla, los filtros de zona usan IDs mock (1,2,3,4,5) que no coinciden con UUIDs de Supabase.
- **`saveRes()` sin await en Supabase**: hace update optimista local, luego llama `sbSaveReserva(saved)` sin `await` y sin manejar el resultado. Si falla, la UI muestra éxito pero el dato no se guardó.
  - Fix: `const ok = await sbSaveReserva(saved); if(!ok) showError(...)`.
- **`nid = 300`**: contador local para IDs en memoria. Si se añaden ítems antes de que Supabase devuelva los datos (con UUIDs reales), habrá IDs numéricos mezclados con UUIDs. No causa crash pero sí inconsistencia.
- **`sbSaveEvento`**: nota inline que `aforo` no tiene columna en `eventos` — omitido del payload deliberadamente. Bien documentado.
- **`sbUploadEventoImg`**: usa Supabase Storage bucket `eventos`. Correct.
- **Toast**: función `toast()` inline, usa elemento `#_toast` creado dinámicamente. Mismo patrón que index.html pero creado en JS si no existe. Inconsistente con stock.js (usa DOM estático).
- **`stepField()`**: función utilitaria duplicada en al menos 3 archivos (index.html, reservas, turnos). Candidato a `assets/lib/ui-helpers.js`.
- **`showModal(id)` / `closeModal(id)`**: aquí usan `.classList.toggle('show')` sobre `.overlay`. En index.html usan `.modal-overlay`. En stock.js usan `.modal-bg`. Tres implementaciones distintas del mismo patrón.
- **Funciones clave**: `sbLoadZonas`, `sbLoadReservas`, `sbSaveReserva`, `sbDeleteReserva`, `sbLoadEventos`, `sbSaveEvento`, `sbDeleteEvento`, `sbSaveAsistente`, `sbDeleteAsistente`, `sbUploadEventoImg`, `initSupabase`, `setTab`, `initDay`, `changeDay`, `updateDateLbl`, `setZona`, `renderRes`, `openDetail`, `openNewRes`, `openEditRes`, `saveRes`, `delRes`, `confirmDelRes`, `checkCapacity`, `autoPax`, `autoMesas`, `renderEventos`, `openNewEvento`, `openEditEvento`, `saveEvento`, `delEvento`, `confirmDelEvento`, `renderAsistentes`, `openNewAsistente`, `saveAsistente`, `confirmDelAsistente`, `stepField`, `showModal`, `closeModal`, `toast`.

---

### lagaleria_turnos.html

- 3078 líneas. Más complejo del proyecto.
- **Dual-brand**: soporte para dos locales ("La Galería" y "Neotaberna/Sala") con tema oscuro/claro via `body.sala-theme`.
- **CSS más limpio que inicio.html** pero igualmente extenso (700+ líneas solo de estilos). Duplica bloques de skill, vac, wc, etc.
- **Shift grid**: 4 turnos (sm=sala mediodía, sn=sala noche, cm=cocina mediodía, cn=cocina noche). Grid semanal con columnas por día.
- **`#save-indicator`**: indicador visual de guardado automático con estados `saving/saved/save-err`. Buen UX pattern.
- **Autogenerador**: botón "Autogenerar" abre modal que ejecuta algoritmo greedy. Debería vivir en `assets/modules/turnos-greedy.js` per ARCHITECTURE.md.
- **`@tabler/icons-webfont` + Material Symbols**: dos librerías de iconos distintas cargadas. Inconsistencia con el resto del proyecto (stock.css usa SVG inline). Carga extra de red.
- **WeekConfig duplicado**: componente WeekConfig también en lagaleria_inicio.html. Misma UI, datos distintos. Candidato a extracción a módulo compartido.
- **Funciones clave**: `setView`, `changeWeek`, `renderSemana`, `renderPersona`, `openWorkerModal`, `saveWorker`, `deleteWorker`, `addChip`, `removeChip`, `renderGrid`, `limpiarSemana`, `openAutoModal`, `runAutogen`, `editTime`, `saveTime`, `openEvModal`, `saveEv`, `deleteEv`, `renderEvRow`.

---

## 2. Problemas cross-file

### 2.1 CSS tokens sin centralizar
Cinco archivos definen `:root { --bg, --surf, --acc, ... }` por separado. Drift detectado:

| Variable | index.html | stock.css | reservas.html | inicio.html | turnos.html |
|---|---|---|---|---|---|
| `--amb` | ✗ | ✓ | ✓ | ✗ | ✗ |
| `--amb-bg` | ✗ | ✓ | ✓ | ✗ | ✗ |
| `--grn-bg` | ✗ | ✓ | ✓ | ✗ | ✗ |
| `--red-bg` | ✗ | ✓ | ✓ | ✗ | ✗ |
| `--sm-*` | ✗ | ✗ | ✗ | ✓ | ✓ |

**Fix**: crear `assets/styles/tokens.css` con el conjunto completo (tomar reservas.html como referencia) e incluirlo en todos los archivos.

### 2.2 Toast: 3 implementaciones
- `index.html`: `toast(msg)` → usa/crea `#_toast` dinámicamente.
- `lagaleria_reservas.html`: `toast(msg)` → igual, crea `#_toast` en JS.
- `lagaleria_stock.html` / `stock.js`: `showToast(msg)` → usa `#toast` estático en HTML.
- `lagaleria_inicio.html`: probable cuarta variante.

**Fix**: una función shared en `assets/lib/ui-helpers.js` que acepte selector configurable o busque el elemento en el documento actual.

### 2.3 `stepField()` duplicado
Existe en `lagaleria_reservas.html`, `lagaleria_turnos.html`, y `lagaleria_inicio.html` con la misma firma `(id, delta, min, max, cb)`. Candidato directo a `assets/lib/ui-helpers.js`.

### 2.4 `showModal()` / `closeModal()`: 3 implementaciones
- `stock.js`: `showModal()` → muestra `#modal-bg` (class `.modal-bg`), via `style.display`.
- `index.html`: `showModal(id)` / `closeModal(id)` → toggle class `.modal-overlay`.
- `lagaleria_reservas.html`: `showModal(id)` / `closeModal(id)` → toggle class `.overlay` (clase distinta).

Cuando se extraiga a módulo, necesita un contrato único (recomendado: clase `show` sobre el overlay, sea cual sea su nombre).

### 2.5 Supabase client inicializado en cada archivo
Cada HTML tiene:
```js
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
const LOCAL_ID = '3fd1108c-...';
```
Duplicado en 5 sitios. Si cambia la URL o el LOCAL_ID hay que actualizar 5 archivos.
**Fix objetivo**: `assets/lib/supabase-client.js` per ARCHITECTURE.md §2.

### 2.6 `currentUser` acoplado a `window.parent`
Los iframes acceden al usuario via `window.parent.currentUser`. Si un iframe se abre directamente (sin el parent), `currentUser` es undefined y la app falla silenciosamente. Necesita `getStockUser()` (ya existe en stock.js) como patrón en todos los módulos.

### 2.7 Stock duplicado: dos caches no sincronizadas
- `lagaleria_inicio.html` carga productos en `_sbProductos` (global).
- `lagaleria_stock.html` / `stock.js` carga productos en `prods` (local).
- Si el encargado actualiza stock desde el iframe de stock, el dashboard de inicio no se actualiza hasta refresh.

Esto es inherente a la arquitectura de iframes actuales. Documentarlo como known limitation hasta migrar a estado compartido.

---

## 3. Bugs detectados

### BUG-01: Mock de reservas persiste si Supabase devuelve vacío
**Archivo**: `lagaleria_reservas.html`, línea ~797 y ~744.
```js
// La inicialización:
let reservas = [ /* 6 reservas mock */ ];
// initSupabase:
if(sbRes.length)   reservas = sbRes;  // ← solo reemplaza si hay datos
```
Si Supabase devuelve vacío (día sin reservas, o falla), el mock permanece.
**Fix**: `reservas = sbRes;` sin condición, y manejar el caso vacío en `renderRes()`.

### BUG-02: `saveRes()` ignora error de Supabase
**Archivo**: `lagaleria_reservas.html`, líneas ~1122-1126.
```js
if(saved && typeof sbSaveReserva==='function') sbSaveReserva(saved);
// No hay await, no hay catch, no hay feedback de error
```
**Fix**: convertir `saveRes` en async, await la llamada, mostrar toast de error si falla.

### BUG-03: Login mock universal en producción
**Archivo**: `index.html`, `pin_submit()`, líneas ~1510-1531.
Si `sbVerifyLogin` falla (catch), acepta cualquier número del mock con PIN `1234`. En producción esto es bypass de autenticación.
**Fix**: en producción, si Supabase falla mostrar error "Sin conexión" en lugar de caer al mock.

### BUG-04: PIN de onboarding solo en localStorage
**Archivo**: `index.html`, `ob_pinPress()`, línea ~1591.
```js
localStorage.setItem('lg_pin_'+(currentUser.initials||currentUser.rol), _newPin);
```
Si el usuario borra caché, pierde el PIN configurado en onboarding. No hay sync a Supabase.
**Fix**: `sbVerifyLogin` debería verificar el PIN contra Supabase (tabla `trabajadores`), no contra localStorage.

### BUG-05: `toggleDashDispo` — bug pendiente de confirmar
**Archivo**: `lagaleria_inicio.html`, DOM línea ~679.
```html
<div class="dash-row" onclick="toggleDashDispo(this)">
```
Función mencionada en sesión anterior como bug. Verificar que existe y funciona correctamente en el JS actual del archivo (no leído completamente).

### BUG-06: IDs numéricos mezclados con UUIDs en reservas
**Archivo**: `lagaleria_reservas.html`, `nid = 300`.
Las reservas mock usan IDs numéricos (1-6). Las de Supabase usan UUIDs. `openDetail(id)` hace `reservas.find(x => x.id === id)` con igualdad estricta. Si `id` es UUID string y alguna reserva mock tiene id numérico 1, no encontrará coincidencias.
**Fix**: inicializar `reservas = []` y nunca mezclar IDs de fuentes distintas.

### BUG-07: `stock-status.js` sin comentario de cabecera
**Archivo**: `assets/js/stock-status.js`.
ARCHITECTURE.md §5 requiere comentario de cabecera de 2-3 líneas para módulos nuevos.
**Fix**: añadir header comment.

---

## 4. Propuesta de estructura modular

Siguiendo ARCHITECTURE.md §2, orden de extracción sugerido por impacto/esfuerzo:

### Prioridad 1 — Extracción inmediata (bajo riesgo, alto valor)

```
assets/lib/supabase-client.js
  export const _sb = supabase.createClient(URL, ANON)
  export const LOCAL_ID = '3fd1108c-...'

assets/lib/ui-helpers.js
  export function stepField(id, delta, min, max, cb) { ... }
  export function toast(msg) { ... }          // unificado
  export function showOverlay(id) { ... }     // unificado
  export function closeOverlay(id) { ... }    // unificado

assets/styles/tokens.css
  :root { /* conjunto completo de vars — fuente: reservas.html */ }

assets/mock/profiles.js
  export const MOCK_PROFILES = { ... }        // sacado de index.html
```

### Prioridad 2 — Extracción media

```
assets/lib/auth-bridge.js
  function getCurrentUser() {
    try { return window.parent.currentUser }
    catch(e) { return null }
  }
  // Reemplaza todos los window.parent.currentUser inline

assets/modules/turnos-greedy.js
  // Algoritmo autogenerador, extraído de lagaleria_turnos.html
```

### Prioridad 3 — A largo plazo (cambio arquitectural)

```
assets/state/stock.js    ← prods[], oneoffs[], adjustQty, sbLoad*, sbSave*
assets/state/workers.js  ← _trabWorkers[], sbLoadTrabajadores, sbSaveTrabajador
assets/state/zones.js    ← zonas[], sbLoadZonas, sbSaveZona
assets/state/shifts.js   ← shifts data, week state
assets/state/events.js   ← reservas[], eventos[]
```

---

## 5. Resumen ejecutivo

| # | Severidad | Descripción | Archivo |
|---|---|---|---|
| BUG-01 | 🔴 | Mock reservas persiste si Supabase vacío | reservas.html |
| BUG-02 | 🔴 | saveRes() silencia errores Supabase | reservas.html |
| BUG-03 | 🔴 | Mock login bypasseable en producción | index.html |
| BUG-04 | 🟠 | PIN onboarding solo en localStorage | index.html |
| BUG-05 | 🟠 | toggleDashDispo pendiente verificar | inicio.html |
| BUG-06 | 🟠 | IDs numéricos + UUIDs mezclados | reservas.html |
| BUG-07 | 🟡 | stock-status.js sin header comment | stock-status.js |
| CSS-01 | 🟠 | tokens no centralizados (5 copias, drift) | todos |
| CSS-02 | 🟡 | CSS duplicado en inicio.html (2× los bloques de skills, acc, etc.) | inicio.html |
| ARCH-01 | 🟡 | supabase client + LOCAL_ID duplicados en 5 archivos | todos |
| ARCH-02 | 🟡 | toast/showModal/stepField duplicados en 3-5 archivos | todos |
| ARCH-03 | 🟡 | MOCK_PROFILES en index.html (debería ser assets/mock/) | index.html |
| ARCH-04 | 🟡 | Turnos greedy inline (debería ser assets/modules/) | turnos.html |
| NAME-01 | 🟡 | renderZon/saveZona/etc. en español (ARCHITECTURE.md exige inglés) | index.html |
| NAME-02 | 🟡 | toggleInv() — prefijo no reconocido | stock.html |
