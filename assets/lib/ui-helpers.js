/* Helpers de UI compartidos — toast, showModal/closeModal, stepField.
   Sin dependencias externas; solo manipula DOM. Cargado en todas las páginas
   que lo usan, incluida lagaleria_stock.html (que además carga toast.js). */

function toast(msg) {
  if (window.parent !== window) {
    try { window.parent.toast(msg); return; } catch(e) {}
  }
  var t = document.getElementById('_toast');
  if (!t) {
    /* Sin estilo inline: class="toast" hereda fondo/color/forma de
       components.css (var(--surf2)/var(--txt)) — así sigue el tema
       claro/oscuro en vez de quedar fijo en el hardcodeado de antes. */
    t = document.createElement('div');
    t.id = '_toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(function(){ t.style.opacity = '0'; }, 2500);
}

function showModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('show');
}

function closeModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

function stepField(id, delta, min, max, cb) {
  var el = document.getElementById(id);
  if (!el) return;
  el.value = Math.min(max, Math.max(min, (parseInt(el.value) || 0) + delta));
  if (cb) cb();
}

function formatDateLabel(dateStr) {
  var today     = new Date().toISOString().slice(0, 10);
  var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  var d         = new Date(dateStr + 'T12:00:00');
  var dayMonth  = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  if (dateStr === today)     return 'Hoy — ' + dayMonth;
  if (dateStr === yesterday) return 'Ayer — ' + dayMonth;
  var weekday = d.toLocaleDateString('es-ES', { weekday: 'long' });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1) + ' — ' + dayMonth;
}
