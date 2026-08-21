/* toast.js — sistema de notificaciones unificado (window.showToast).
   Única implementación de toast en toda la app — turnos.js e inicio.js
   tenían la suya propia (con hardcodeados de color que no seguían el tema
   claro/oscuro, y en el caso de turnos.js un id de DOM distinto, "toast" en
   vez de "_toast"); se retiraron a favor de esta. Se carga en index.html y
   en lagaleria_turnos/stock/admin/inicio.html. lagaleria_reservas.html
   queda fuera (sigue con toast() de ui-helpers.js, que delega en el toast
   del shell vía window.parent) — no estaba en el alcance de esta unificación.

   Busca #_toast en el documento actual y, si no está ahí, en
   window.parent.document — no delega la llamada entera al padre (como hacía
   antes): manipula el nodo encontrado directamente, así no depende de que
   showToast exista con la misma firma en el documento padre. Cubre el caso
   de un iframe sin #_toast propio (ej. Stock), que reutiliza el del shell
   (index.html) para que la notificación no quede recortada dentro del
   iframe. Si no encuentra #_toast en ningún sitio, lo crea en el documento
   actual con class="toast" y SIN estilo inline — el fondo/color siempre
   salen de .toast en components.css, para que el tema claro/oscuro se
   aplique solo, sin hardcodear ningún color aquí. */

/**
 * Muestra una notificación flotante que se autooculta a los 3 segundos.
 * @param {string} mensaje - Texto a mostrar.
 * @param {'success'|'error'|'info'} [tipo='info'] - Estilo visual del toast.
 */
function showToast(mensaje, tipo) {
  tipo = tipo || 'info'

  var t = document.getElementById('_toast')
  if (!t) {
    try {
      if (window.parent && window.parent !== window) t = window.parent.document.getElementById('_toast')
    } catch (e) {}
  }
  if (!t) {
    t = document.createElement('div')
    t.id = '_toast'
    t.className = 'toast'
    document.body.appendChild(t)
  }
  /* limpiar cualquier opacity inline heredada de ui-helpers.js#toast() (index.js
     sigue usando ese toggle inline sobre el mismo #_toast en index.html) — si no,
     ese estilo inline ganaría siempre a la clase .toast.show de aquí abajo. */
  t.style.opacity = ''
  t.className = 'toast toast-' + tipo
  t.textContent = mensaje
  clearTimeout(t._t)
  /* requestAnimationFrame: si el toast se reutiliza (ya tenía la clase show
     de un mensaje anterior), quitar y añadir "show" en el mismo tick no
     dispara la transición CSS — el navegador la colapsa. */
  t.classList.remove('show')
  requestAnimationFrame(function () { t.classList.add('show') })
  t._t = setTimeout(function () { t.classList.remove('show') }, 3000)
}

window.showToast = showToast
