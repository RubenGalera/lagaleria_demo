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

/* ─── HERO / ESTADO VACÍO REUTILIZABLE ───
   Un único componente para el "estado vacío + botón de acción principal" de
   todas las secciones (Reservas, Eventos, Stock Productos, Stock Pedido), para
   que no haya un botón "+ Añadir X" distinto en cada pantalla. El botón es el
   .add-btn de components.css (borde discontinuo dorado, de borde a borde); los
   estilos propios del hero (.hero-empty*) viven también en components.css.
   Iconos: emoji grande, mismo tamaño que el .empty-icon original de Reservas
   (36px) — 🍽️ y 🎉 son los que ya tenían "Sin reservas"/"Sin eventos". */
var HERO_ICONS = {
  cutlery: '🍽️',
  party:   '🎉',
  box:     '📦',
  cart:    '🛒'
};

function _heroEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
  });
}

/**
 * Devuelve el HTML (string) del hero/estado vacío — mismo patrón que el resto
 * de renders del proyecto: quien llama lo mete con innerHTML.
 *
 * @param {Object} config
 * @param {'full'|'compact'} [config.mode='full'] — 'full': icono + título +
 *   subtítulo + botón (estado vacío, o siempre en Pedido); 'compact': solo el botón.
 * @param {string} [config.icon]      — emoji (ver HERO_ICONS); admite también HTML/SVG. Solo en 'full'.
 * @param {string} [config.title]     — solo en 'full'.
 * @param {string} [config.subtitle]  — solo en 'full'.
 * @param {string} [config.btnLabel]  — sin él no se pinta botón (p. ej. rol sin permiso).
 * @param {string} [config.btnAction] — código del onclick, p. ej. "openNewRes()".
 * @param {number|null} [config.btnBadge] — si > 0, badge dorado dentro del botón.
 * @param {string} [config.btnBadgeTitle] — tooltip del badge.
 * @param {{label: string, action: string}} [config.btnSecondary] — botón
 *   secundario opcional debajo (borde simple, sin relleno).
 * @returns {string}
 */
function renderHeroEmpty(config) {
  var c = config || {};
  var mode = c.mode === 'compact' ? 'compact' : 'full';

  var badgeN = Number(c.btnBadge);
  var badge = badgeN > 0
    ? '<span class="hero-empty-badge"' + (c.btnBadgeTitle ? ' title="' + _heroEsc(c.btnBadgeTitle) + '"' : '') + '>' + badgeN + '</span>'
    : '';
  var btn = c.btnLabel
    ? '<button type="button" class="add-btn hero-empty-btn" onclick="' + _heroEsc(c.btnAction || '') + '">' + _heroEsc(c.btnLabel) + badge + '</button>'
    : '';
  var btn2 = c.btnSecondary && c.btnSecondary.label
    ? '<button type="button" class="hero-empty-btn2" onclick="' + _heroEsc(c.btnSecondary.action || '') + '">' + _heroEsc(c.btnSecondary.label) + '</button>'
    : '';

  if (mode === 'compact') {
    if (!btn && !btn2) return '';
    return '<div class="hero-empty compact">' + btn + btn2 + '</div>';
  }

  return '<div class="hero-empty">' +
    (c.icon ? '<div class="hero-empty-icon">' + c.icon + '</div>' : '') +
    (c.title ? '<div class="hero-empty-title">' + _heroEsc(c.title) + '</div>' : '') +
    (c.subtitle ? '<div class="hero-empty-sub">' + _heroEsc(c.subtitle) + '</div>' : '') +
    btn + btn2 +
  '</div>';
}
