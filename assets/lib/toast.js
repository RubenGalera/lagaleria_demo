/* toast.js — sistema de notificaciones unificado (window.showToast).
   Antes cada módulo tenía su propia implementación de toast/showToast, con
   estilos y comportamiento ligeramente distintos (admin.js exigía que el
   div #_toast ya existiera en el HTML; ui-helpers.js lo creaba si faltaba;
   ninguna distinguía éxito/error visualmente). Esta es la única versión que
   usan stock.js, admin.js, worker-modal.js, adminStock.js y adminContactos.js.

   turnos.js e inicio.js mantienen su propio showToast (id="toast"/id="_toast"
   con un contrato de DOM distinto) — no están en el alcance de esta
   unificación, así que este archivo no se carga en lagaleria_turnos.html ni
   en lagaleria_inicio.html. Ver docs/ARCHITECTURE.md. */

/**
 * Muestra una notificación flotante que se autooculta a los 3 segundos.
 *
 * Igual que el toast() heredado de ui-helpers.js: si se llama desde dentro
 * de un iframe (window.parent !== window) delega en el showToast del
 * documento padre, para que la notificación aparezca en el shell
 * (index.html) y no quede recortada dentro del iframe. Por eso index.html
 * también carga este archivo, aunque index.js siga usando su propio toast()
 * para sus propios mensajes — sirve como destino de esa delegación cuando
 * el toast viene de un iframe hijo (Stock, Admin).
 *
 * @param {string} mensaje - Texto a mostrar.
 * @param {'success'|'error'|'info'} [tipo='info'] - Estilo visual del toast.
 */
function showToast(mensaje, tipo) {
  tipo = tipo || 'info'

  if (window.parent !== window) {
    try { window.parent.showToast(mensaje, tipo); return } catch (e) {}
  }

  var t = document.getElementById('_toast')
  if (!t) {
    t = document.createElement('div')
    t.id = '_toast'
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
