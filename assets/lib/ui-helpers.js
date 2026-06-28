/* Helpers de UI compartidos — toast, showModal/closeModal, stepField.
   Sin dependencias externas; solo manipula DOM. Cargado en todas las páginas
   que los usan excepto lagaleria_stock.html (tiene su propio showToast). */

function toast(msg) {
  if (window.parent !== window) {
    try { window.parent.toast(msg); return; } catch(e) {}
  }
  var t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_toast';
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a2f3a;border:1px solid var(--brd2);color:var(--txt);padding:9px 18px;border-radius:20px;font-size:12px;font-weight:600;z-index:999;transition:opacity .3s';
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
