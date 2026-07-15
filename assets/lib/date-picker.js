/* date-picker.js — Componente reutilizable de selección de fecha o semana.
   Modos: 'week' (selecciona lunes de semana ISO) | 'day' (selecciona día).
   Inyecta su propio CSS en <head> y su HTML en <body> al init().
   No tiene dependencias externas.

   API pública (window.DatePicker):
     init({ mode, anchor, initialDate, onChange, events })
     open()      — abre el dropdown (toggle: si está abierto, lo cierra)
     close()     — cierra sin seleccionar
     setDate(str) — actualiza la fecha activa sin disparar onChange
     setEvents(events) — actualiza los puntos de evento; events: [{date:'YYYY-MM-DD'}]
     destroy()   — elimina el DOM y los listeners globales
*/
(function (global) {
  'use strict';

  /* ── Helpers de fecha ISO ── */
  var MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  function _isoWeekNum(dateStr) {
    var parts = dateStr.split('-').map(Number);
    var dt = new Date(Date.UTC(parts[0], parts[1]-1, parts[2]));
    var day = dt.getUTCDay() || 7;
    dt.setUTCDate(dt.getUTCDate() + 4 - day);
    var y0 = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
    return Math.ceil((((dt - y0) / 86400000) + 1) / 7);
  }
  function _mondayOf(dateStr) {
    var parts = dateStr.split('-').map(Number);
    var dt = new Date(Date.UTC(parts[0], parts[1]-1, parts[2]));
    var dow = dt.getUTCDay() || 7;
    dt.setUTCDate(dt.getUTCDate() - (dow - 1));
    return dt.toISOString().split('T')[0];
  }
  function _todayStr() {
    return new Date().toISOString().split('T')[0];
  }

  /* ── CSS inyectado una sola vez ── */
  var _CSS = [
    '#_dp-dropdown{position:fixed;z-index:500;background:var(--surf);border:1px solid var(--brd2);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.55);padding:10px 8px 8px;width:236px;display:none;animation:_dp-in .14s ease}',
    '#_dp-dropdown.show{display:block}',
    '@keyframes _dp-in{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}',
    '._dp-hdr{display:flex;align-items:center;gap:4px;margin-bottom:8px}',
    '._dp-mth{flex:1;text-align:center;font-size:12px;font-weight:700;color:var(--txt);text-transform:capitalize}',
    '._dp-arrow{background:none;border:1px solid var(--brd2);border-radius:6px;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--acc);font-size:16px;flex-shrink:0;line-height:1}',
    '._dp-arrow:hover{background:var(--surf2)}',
    '._dp-today-btn{background:none;border:1px solid var(--acc-bd);border-radius:5px;color:var(--acc);font-size:10px;font-weight:600;padding:2px 7px;cursor:pointer;line-height:18px;flex-shrink:0}',
    '._dp-today-btn:hover{background:var(--acc-bg)}',
    '._dp-row{display:flex;align-items:center;border-radius:8px;border:1px solid transparent;padding:2px 4px;cursor:pointer;transition:background .1s,border-color .1s;margin-bottom:2px}',
    '._dp-mode-day ._dp-row{cursor:default}',
    '._dp-mode-week ._dp-row:hover{background:var(--acc-bg);border-color:var(--acc-bd)}',
    '._dp-row._dp-row-active{background:var(--acc-bg);border-color:var(--acc-bd)}',
    '._dp-row._dp-row-active ._dp-d{color:var(--acc);font-weight:700}',
    '._dp-row._dp-thisweek{border-left:2px solid var(--acc-bd);background:var(--surf2)}',
    '._dp-wnum{width:22px;font-size:9px;color:var(--faint);text-align:center;flex-shrink:0}',
    '._dp-d{position:relative;flex:1;text-align:center;font-size:11px;color:var(--muted);line-height:22px}',
    '._dp-d._dp-out{color:var(--faint)}',
    '._dp-mode-day ._dp-d{cursor:pointer;border-radius:6px}',
    '._dp-mode-day ._dp-d:hover{background:var(--acc-bg)}',
    '._dp-d._dp-now{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;min-width:22px;min-height:22px;border-radius:50%;background:rgba(255,255,255,0.18);color:var(--txt);font-weight:600;font-size:11px;line-height:1}',
    '._dp-d._dp-day-active{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;min-width:22px;min-height:22px;border-radius:50%;background:var(--acc);color:var(--bg);font-weight:700;font-size:11px;line-height:1}',
    '._dp-d._dp-now._dp-day-active{background:var(--acc);color:var(--bg)}',
    '._dp-evt-dot{position:absolute;left:50%;bottom:0px;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:var(--color-event);pointer-events:none}',
    '._dp-legend{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:8px;padding-top:7px;border-top:1px solid var(--brd2)}',
    '._dp-legend-item{display:flex;align-items:center;gap:4px;font-size:9px;color:var(--dim)}',
    '._dp-legend-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}',
    '._dp-legend-dot._dp-legend-today{background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.35)}',
    '._dp-legend-dot._dp-legend-sel{background:var(--acc)}',
    '._dp-legend-dot._dp-legend-evt{background:var(--color-event)}',
    '#_dp-dropdown._dp-inline{position:static;left:auto;top:auto;margin:8px 14px}'
  ].join('');

  function _injectCSS() {
    if (document.getElementById('_dp-style')) return;
    var s = document.createElement('style');
    s.id = '_dp-style';
    s.textContent = _CSS;
    document.head.appendChild(s);
  }

  /* ── Construcción del DOM del dropdown ── */
  function _buildEl() {
    var el = document.createElement('div');
    el.id = '_dp-dropdown';
    if (_pushContent) el.classList.add('_dp-inline');
    el.innerHTML =
      '<div class="_dp-hdr">' +
        '<button class="_dp-arrow" id="_dp-prev">&#8249;</button>' +
        '<span class="_dp-mth" id="_dp-mth-lbl"></span>' +
        '<button class="_dp-arrow" id="_dp-next">&#8250;</button>' +
        '<button class="_dp-today-btn" id="_dp-today-btn">Hoy</button>' +
      '</div>' +
      '<div id="_dp-weeks"></div>' +
      '<div class="_dp-legend">' +
        '<span class="_dp-legend-item"><span class="_dp-legend-dot _dp-legend-today"></span>Hoy</span>' +
        '<span class="_dp-legend-item"><span class="_dp-legend-dot _dp-legend-sel"></span>Selección</span>' +
        '<span class="_dp-legend-item"><span class="_dp-legend-dot _dp-legend-evt"></span>Evento</span>' +
      '</div>';
    if (_pushContent && _anchor && _anchor.parentNode) {
      _anchor.parentNode.insertBefore(el, _anchor.nextSibling);
    } else {
      document.body.appendChild(el);
    }
    document.getElementById('_dp-prev').addEventListener('click', function (e) {
      e.stopPropagation(); _prevMonth();
    });
    document.getElementById('_dp-next').addEventListener('click', function (e) {
      e.stopPropagation(); _nextMonth();
    });
    document.getElementById('_dp-today-btn').addEventListener('click', function (e) {
      e.stopPropagation(); _goToday();
    });
    return el;
  }

  /* ── Estado interno ── */
  var _mode = 'week';
  var _anchor = null;
  var _currentDate = '';
  var _onChange = null;
  var _pushContent = false;
  var _pkY = 0, _pkM = 0;
  var _isOpen = false;
  var _el = null;
  var _mdListener = null, _kbListener = null;
  var _eventDates = {};

  function _setEvents(events) {
    _eventDates = {};
    (events || []).forEach(function (e) {
      if (e && e.date) _eventDates[e.date] = true;
    });
  }

  /* ── Render del calendario mensual ── */
  function _render() {
    if (!_el) return;
    _el.classList.toggle('_dp-mode-day', _mode === 'day');
    _el.classList.toggle('_dp-mode-week', _mode === 'week');
    var monthName = MESES_ES[_pkM];
    document.getElementById('_dp-mth-lbl').textContent =
      monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + _pkY;

    var firstDay = new Date(Date.UTC(_pkY, _pkM, 1));
    var dow = firstDay.getUTCDay() || 7;
    var firstMon = new Date(firstDay);
    firstMon.setUTCDate(firstDay.getUTCDate() - (dow - 1));
    var lastDay = new Date(Date.UTC(_pkY, _pkM + 1, 0));

    var today = _todayStr();
    var todayMon = _mondayOf(today);
    var activeMon = _mode === 'week' ? _currentDate : _mondayOf(_currentDate || today);

    var rows = [];
    var wMon = new Date(firstMon);
    while (wMon <= lastDay) {
      var monStr = wMon.toISOString().split('T')[0];
      var isActiveRow = _mode === 'week' && monStr === activeMon;
      var isThisWeek = monStr === todayMon;
      var rowCls = '_dp-row';
      if (isActiveRow) rowCls += ' _dp-row-active';
      if (isThisWeek && !isActiveRow) rowCls += ' _dp-thisweek';

      var rowHtml = '<div class="' + rowCls + '" data-mon="' + monStr + '">';
      rowHtml += '<span class="_dp-wnum">' + _isoWeekNum(monStr) + '</span>';

      for (var d = 0; d < 7; d++) {
        var day = new Date(wMon);
        day.setUTCDate(wMon.getUTCDate() + d);
        var dayStr = day.toISOString().split('T')[0];
        var outMon = day.getUTCMonth() !== _pkM;
        var isToday = dayStr === today;
        var isDayActive = _mode === 'day' && dayStr === _currentDate;
        var cls = '_dp-d';
        if (outMon) cls += ' _dp-out';
        if (isToday && !isDayActive) cls += ' _dp-now';
        if (isDayActive) cls += ' _dp-day-active' + (isToday ? ' _dp-now' : '');
        var evtDot = _eventDates[dayStr] ? '<span class="_dp-evt-dot"></span>' : '';
        rowHtml += '<span class="' + cls + '" data-day="' + dayStr + '">' + day.getUTCDate() + evtDot + '</span>';
      }
      rowHtml += '</div>';
      rows.push(rowHtml);
      wMon = new Date(wMon);
      wMon.setUTCDate(wMon.getUTCDate() + 7);
    }

    var weeksEl = document.getElementById('_dp-weeks');
    weeksEl.innerHTML = rows.join('');

    if (_mode === 'week') {
      weeksEl.querySelectorAll('._dp-row[data-mon]').forEach(function (row) {
        row.addEventListener('click', function () { _pick(row.getAttribute('data-mon')); });
      });
    } else {
      weeksEl.querySelectorAll('._dp-d[data-day]').forEach(function (cell) {
        cell.addEventListener('click', function (e) {
          e.stopPropagation();
          _pick(cell.getAttribute('data-day'));
        });
      });
    }
  }

  function _position() {
    if (!_anchor || !_el) return;
    var r = _anchor.getBoundingClientRect();
    var left = r.left;
    if (left + 236 > window.innerWidth - 8) left = window.innerWidth - 244;
    if (left < 8) left = 8;
    _el.style.left = left + 'px';
    _el.style.top = (r.bottom + 5) + 'px';
  }

  function _prevMonth() { _pkM--; if (_pkM < 0) { _pkM = 11; _pkY--; } _render(); }
  function _nextMonth() { _pkM++; if (_pkM > 11) { _pkM = 0; _pkY++; } _render(); }
  function _goToday() {
    var today = _todayStr();
    _pick(_mode === 'week' ? _mondayOf(today) : today);
  }
  function _pick(dateStr) {
    _currentDate = dateStr;
    _isOpen = false;
    if (_el) _el.classList.remove('show');
    if (typeof _onChange === 'function') _onChange(dateStr);
  }

  function _open() {
    if (!_el || !_anchor) return;
    if (_isOpen) { _close(); return; }
    var d = new Date((_currentDate || _todayStr()) + 'T00:00:00Z');
    _pkY = d.getUTCFullYear();
    _pkM = d.getUTCMonth();
    _render();
    if (!_pushContent) _position();
    _el.classList.add('show');
    _isOpen = true;
  }

  function _close() {
    if (_el) _el.classList.remove('show');
    _isOpen = false;
  }

  function _attachGlobal() {
    if (_mdListener) return;
    _mdListener = function (e) {
      if (!_isOpen) return;
      if (_el && !_el.contains(e.target) && (!_anchor || !_anchor.contains(e.target))) _close();
    };
    _kbListener = function (e) {
      if (e.key === 'Escape' && _isOpen) _close();
    };
    document.addEventListener('mousedown', _mdListener);
    document.addEventListener('keydown', _kbListener);
  }

  function _detachGlobal() {
    if (_mdListener) document.removeEventListener('mousedown', _mdListener);
    if (_kbListener) document.removeEventListener('keydown', _kbListener);
    _mdListener = null;
    _kbListener = null;
  }

  /* ── API pública ── */
  global.DatePicker = {
    init: function (opts) {
      _injectCSS();
      _mode = opts.mode || 'week';
      _anchor = opts.anchor || null;
      _currentDate = opts.initialDate || _todayStr();
      _onChange = opts.onChange || null;
      _pushContent = !!opts.pushContent;
      _setEvents(opts.events);
      if (!_el) {
        _el = _buildEl();
        _attachGlobal();
      }
    },
    open: function () { _open(); },
    close: function () { _close(); },
    setDate: function (dateStr) { _currentDate = dateStr; },
    setEvents: function (events) { _setEvents(events); if (_isOpen) _render(); },
    destroy: function () {
      _detachGlobal();
      if (_el && _el.parentNode) _el.parentNode.removeChild(_el);
      _el = null;
      _anchor = null;
      _onChange = null;
      _isOpen = false;
    }
  };

}(window));
