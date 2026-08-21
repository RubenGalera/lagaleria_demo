/* utils.js — utilidades compartidas sin dependencias entre sí, importables
   desde cualquier módulo (assets/js/*.js o assets/lib/admin*.js). Ver
   docs/ARCHITECTURE.md para la convención de carpetas.

   Antes de este archivo, cada una de estas funciones vivía duplicada (con
   pequeñas variaciones) en varios módulos — ver el comentario de cada una
   para el detalle de dónde estaba antes. */

/**
 * Limpia un número de teléfono español para usarlo en enlaces `tel:` y
 * `wa.me`, o para comparar dos teléfonos guardados con formato distinto.
 *
 * Elimina espacios, guiones y paréntesis, quita el prefijo de país (+34 o
 * 0034, con o sin el "+") y devuelve solo los últimos 9 dígitos — así
 * "+34 656 187 336", "656-187-336" y "0034656187336" se normalizan al mismo
 * valor ("656187336"), independientemente del formato en que se guardó el
 * dato originalmente en Supabase.
 *
 * Quién la llama:
 * - worker-modal.js (prev_sendInvite, callWorker/waWorker): construir el
 *   enlace de invitación y los botones de llamar/WhatsApp del trabajador.
 * - adminStock.js / adminContactos.js (_callTelField, _waTelField): botones
 *   de llamar/WhatsApp en los modales de proveedor y contacto.
 * - index.js (sbVerifyLogin): comparar el teléfono introducido en el login
 *   contra el guardado en `trabajadores`, sin que el formato de guardado
 *   afecte a si el login encuentra al trabajador o no.
 *
 * @param {string} tel - Teléfono en cualquier formato ("+34 656 187 336", "656187336"...).
 * @returns {string} Los últimos 9 dígitos, sin espacios/guiones/paréntesis ni prefijo de país.
 */
function cleanTel(tel) {
  return (tel || '')
    .replace(/[\s\-()]/g, '')
    .replace(/^\+?0034/, '')
    .replace(/^\+?34/, '')
    .replace(/\D/g, '')
    .slice(-9)
}

/**
 * Hashea un PIN de 4 dígitos con SHA-256 vía Web Crypto API (nativa del
 * navegador, sin librerías externas). Se guarda el hash en Supabase
 * (`trabajadores.pin_hash`), nunca el PIN en claro.
 *
 * No es bcrypt/scrypt/Argon2 a propósito: esos algoritmos añaden un coste
 * computacional pensado para proteger contraseñas de uso prolongado frente
 * a fuerza bruta offline — aquí el PIN es de 4 dígitos, protegido además por
 * estar detrás de RLS y de un teléfono conocido, así que ese coste extra no
 * aporta seguridad real. Si el proyecto necesita ese nivel de protección más
 * adelante, la vía correcta es migrar a Supabase Auth (ver MEJORAS.md), no
 * reforzar este hash a mano.
 *
 * Quién la llama:
 * - index.js (sbVerifyLogin, cp_submit): verificar el PIN introducido en el
 *   login contra el hash guardado, y guardar el hash del PIN nuevo al
 *   cambiarlo en el primer acceso.
 * - worker-modal.js (prev_sendInvite): generar el hash del PIN temporal
 *   ("1234") al enviar la invitación desde Admin.
 *
 * Debe seguir siendo el MISMO algoritmo en ambos sitios — el hash generado
 * al invitar tiene que coincidir bit a bit con el que se compara al entrar.
 *
 * @param {string} pin - PIN en texto plano (ej. "1234").
 * @returns {Promise<string>} Hash SHA-256 en hexadecimal (64 caracteres).
 */
async function hashPin(pin) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Normaliza texto para comparaciones de búsqueda: minúsculas y sin tildes/
 * diacríticos ("Aceitunas" y "aceituna" comparan igual que "acéitunas").
 *
 * Quién la llama:
 * - stock.js (matchesSearch): buscador en tiempo real de la tab Productos,
 *   comparando cada palabra del input contra nombre/proveedor/unidad/nota/
 *   ubicación del producto sin que las tildes afecten al resultado.
 *
 * @param {string} str - Texto a normalizar.
 * @returns {string} Texto en minúsculas y sin diacríticos.
 */
function normalizeText(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

/**
 * Vibración táctil breve al pulsar un elemento — respeta la preferencia
 * "Vibración al pulsar" del panel de Ajustes (aj_prefs.haptic). Lee
 * localStorage['aj_prefs'] directamente (misma clave que aj_loadPrefs()/
 * aj_savePrefs() en index.js) en vez de pedírsela al shell vía window.parent:
 * localStorage es compartido entre documentos del mismo origen, así que cada
 * iframe (Turnos, Stock...) puede leerla sin depender de que el shell exista
 * o esté accesible. Si el usuario nunca ha tocado el toggle (aj_prefs.haptic
 * === undefined), usa hapticDefaultOn() — ON en móvil, OFF en desktop. No
 * hace nada si el dispositivo no soporta vibración (desktop) — nunca lanza,
 * seguro de llamar desde cualquier handler de click.
 *
 * Quién la llama:
 * - turnos.js (buildGrid): al pulsar un chip de trabajador en el grid.
 * - stock.js (adjustQty/adjustPedQty, saveProdModal): al pulsar +/- de
 *   cantidad y al guardar un producto.
 * - worker-modal.js (saveProfile): al pulsar "Guardar y cerrar".
 * - index.js: listener global de tap del shell (nav inferior, botones del
 *   header), y aj_save() al activar el toggle (vibración de confirmación).
 *
 * @param {number} [ms=10] - Duración de la vibración en milisegundos.
 */
function haptic(ms) {
  try {
    if (!navigator.vibrate) return
    var raw = localStorage.getItem('aj_prefs')
    var prefs = raw && raw !== 'undefined' ? JSON.parse(raw) : {}
    var enabled = prefs.haptic !== undefined ? prefs.haptic : hapticDefaultOn()
    if (enabled) navigator.vibrate(ms || 10)
  } catch (e) {}
}
/**
 * Default de "Vibración al pulsar" cuando el usuario nunca lo ha tocado en
 * Ajustes: ON en móvil, OFF en desktop. Detección por user-agent (no
 * matchMedia/pointer) porque así lo pide el diseño aprobado del panel de
 * Ajustes — /Mobi|Android/i cubre Android e iOS (Safari en iPhone/iPad
 * incluye "Mobi" en su UA). También la usa index.js (ajustes_openModal) para
 * que el estado inicial del toggle coincida con lo que haptic() va a hacer
 * de verdad — si no, el switch podría mostrarse en OFF mientras el móvil ya
 * vibra por defecto.
 * @returns {boolean}
 */
function hapticDefaultOn() {
  try { return /Mobi|Android/i.test(navigator.userAgent) } catch (e) { return false }
}

/**
 * Nombres de los 12 meses en español, en minúsculas — para construir
 * etiquetas de fecha ("22 de junio").
 *
 * Quién la llama:
 * - turnos.js (weekLabel): etiqueta "22 jun – 28 jun" del selector de semana
 *   (en realidad usa MESES_CORTO, propio de turnos.js, no este array — este
 *   es el de nombre completo, para textos más largos).
 */
const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

/**
 * Número de semana ISO-8601 (1-53) de una fecha. La semana ISO empieza en
 * lunes y la semana 1 es la que contiene el primer jueves del año — por eso
 * el cálculo ajusta al jueves de esa semana antes de contar desde el 1 de enero.
 *
 * Quién la llama:
 * - turnos.js (weekLabel, vía curWeek): número de semana mostrado junto a la
 *   fecha en el selector de semana ("Sem 26").
 * - inicio.js (_renderHeader): "Semana 26" en la cabecera del dashboard.
 *
 * @param {string} dateStr - Fecha en formato 'YYYY-MM-DD'.
 * @returns {number} Número de semana ISO (1-53).
 */
function isoWeekNum(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const day = dt.getUTCDay() || 7
  dt.setUTCDate(dt.getUTCDate() + 4 - day)
  const y0 = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1))
  return Math.ceil((((dt - y0) / 86400000) + 1) / 7)
}

/**
 * Lunes de la semana ISO a la que pertenece una fecha — la semana ISO
 * siempre empieza en lunes, así que esto retrocede desde `dateStr` hasta
 * el lunes de esa misma semana (o se queda igual si ya es lunes).
 *
 * Quién la llama:
 * - turnos.js (curMonday, changeWeek, _applyWeek): fecha ancla de la semana
 *   mostrada en el grid de Turnos — todo el módulo de variantes A/B y
 *   guardado de turnos se indexa por este valor (turnos.semana_inicio).
 * - inicio.js (initDashboard): calcula la semana actual para "Tu semana" y
 *   la card de turnos de hoy.
 *
 * @param {string} dateStr - Fecha en formato 'YYYY-MM-DD'.
 * @returns {string} Lunes de esa semana ISO, en formato 'YYYY-MM-DD'.
 */
function mondayOfDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const dow = dt.getUTCDay() || 7
  dt.setUTCDate(dt.getUTCDate() - (dow - 1))
  return dt.toISOString().split('T')[0]
}
