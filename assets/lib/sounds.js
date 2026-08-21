/* sounds.js — sonidos de interacción de la app, Web Audio API pura (sin
   archivos de audio externos que cargar). Mismo patrón que haptic() en
   utils.js: lee aj_prefs directamente de localStorage, sin depender de
   index.js ni de que el shell exista, para poder llamarse desde cualquier
   iframe (Turnos, Stock, Admin) igual que desde el propio shell.

   Público (llamado desde fuera de este archivo): initAudio, playTap, playNotif.
   El resto (prefijo `_`) es implementación interna. */

var _audioCtx = null;

/**
 * Devuelve el AudioContext único de la app, creándolo la primera vez que
 * hace falta (nunca en el arranque del script: construir un AudioContext
 * antes de cualquier gesto del usuario lo deja "suspended" en la mayoría de
 * navegadores por la política de autoplay). Una sola instancia — crear uno
 * por sonido sería caro y los navegadores limitan cuántos puede haber vivos
 * a la vez.
 * @returns {AudioContext|null} null si el navegador no soporta Web Audio.
 */
function _getAudioCtx() {
  try {
    if (_audioCtx) return _audioCtx
    var Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    _audioCtx = new Ctx()
    return _audioCtx
  } catch (e) { return null }
}

/**
 * Preferencia "Sonido de notificaciones" del panel de Ajustes — misma clave
 * localStorage['aj_prefs'] que usa aj_loadPrefs()/aj_savePrefs() en
 * index.js, leída aquí en directo para no depender de que index.js esté
 * cargado. Estrictamente === true (no hay default-on como en haptic(): la
 * feature está "preparada para futuras notificaciones push", apagada por
 * defecto — ver AJ_DEFAULTS.sound en index.js).
 * @returns {boolean}
 */
function _soundEnabled() {
  try {
    var raw = localStorage.getItem('aj_prefs')
    var prefs = raw && raw !== 'undefined' ? JSON.parse(raw) : {}
    return prefs.sound === true
  } catch (e) { return false }
}

/**
 * Programa un tono senoidal con envolvente de ataque/caída suave (evita el
 * "click" de encender/apagar la ganancia en seco).
 * @param {AudioContext} ctx
 * @param {number} freq - Frecuencia en Hz.
 * @param {number} startTime - ctx.currentTime (o posterior) en el que empieza.
 * @param {number} duration - Duración en segundos.
 * @param {number} gainPeak - Ganancia máxima (0-1).
 */
function _tone(ctx, freq, startTime, duration, gainPeak) {
  var osc = ctx.createOscillator()
  var gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
}

/**
 * Inicializa/despierta el AudioContext en el primer gesto real del usuario.
 * Los navegadores crean el contexto en estado "suspended" hasta una
 * interacción humana (click, tap...) — llamar esto en el primer click de la
 * app evita que el primer playTap()/playNotif() real se pierda en silencio.
 *
 * Quién la llama:
 * - index.js: listener global de click del shell (mismo sitio que ya
 *   llama a haptic() en cada tap), una vez por carga de página.
 */
function initAudio() {
  try {
    var ctx = _getAudioCtx()
    if (ctx && ctx.state === 'suspended') ctx.resume()
  } catch (e) {}
}

/**
 * Sonido sutil de interacción al pulsar elementos UI — un tono breve
 * (~50ms). Silencioso si aj_prefs.sound no es exactamente true, si el
 * navegador no soporta Web Audio, o si el contexto sigue suspendido y no
 * hay ningún AudioContext disponible — nunca lanza, seguro de llamar desde
 * cualquier handler de click junto a haptic().
 *
 * Quién la llama:
 * - turnos.js (buildGrid): al pulsar un chip de trabajador en el grid.
 * - stock.js (adjustQty/adjustPedQty, saveProdModal): +/- de cantidad y
 *   "Guardar" de producto.
 * - worker-modal.js (saveProfile): al pulsar "Guardar y cerrar".
 * - index.js: listener global de tap del shell (nav inferior, botones del
 *   header) y prf_changePin_submit() (cambio de PIN).
 */
function playTap() {
  try {
    if (!_soundEnabled()) return
    var ctx = _getAudioCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    _tone(ctx, 880, ctx.currentTime, 0.05, 0.06)
  } catch (e) {}
}

/**
 * Sonido de notificación — dos tonos ascendentes, Do5-Mi5 (~400ms en
 * total). Mismo criterio de silencio que playTap(). Preparado para cuando
 * existan notificaciones push reales — hoy no lo llama nada en producción,
 * solo pensado para probarse a mano desde la consola.
 */
function playNotif() {
  try {
    if (!_soundEnabled()) return
    var ctx = _getAudioCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    var t = ctx.currentTime
    _tone(ctx, 523.25, t, 0.18, 0.08)        /* Do5 */
    _tone(ctx, 659.25, t + 0.16, 0.22, 0.08) /* Mi5 */
  } catch (e) {}
}
