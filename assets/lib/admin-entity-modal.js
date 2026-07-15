/* admin-entity-modal.js — Modal reutilizable para entidades de Admin
   (Zonas, Habilidades, Categorías de Stock, ...). Inyecta su propio HTML
   en <body> al primer open() — reutiliza las clases ya existentes en
   admin.css (.modal-overlay, .nombre-switch-row, .switch-col, .sw,
   .emoji-grid-wrap, .emoji-opt, .btn-guardar, .btn-del, .modal-note),
   así que no necesita CSS propio. Sin dependencias externas.

   API pública (window.AdminEntityModal):
     open({
       title, saveLabel, deleteLabel,
       nombre, nombrePlaceholder,
       activo, activoLabel, showActivo,
       fields,            // array de strings HTML con los campos propios de la entidad
       icons, icono,      // catálogo de emojis sugeridos + el actualmente seleccionado
       showIcono,         // false = oculta toda la sección de icono (entidades sin icono visual, ej. proveedores)
       onIconChange,      // (emoji) => void — para previews en vivo que dependan del icono
       onRender,          // () => void — se llama tras insertar `fields`, para wiring extra
       onSave,            // (data) => void — data incluye nombre/activo/icono + cada
                           //   input/select/textarea con [id] dentro de `fields`, por su id
       onDelete,          // () => void | null — null = modo crear, sin botón eliminar
     })
     close()
*/
(function (global) {
  'use strict';

  var _el = null;
  var _icons = [];
  var _selectedIcon = '';
  var _expanded = false;
  var _onSave = null;
  var _onDelete = null;
  var _onIconChange = null;

  function _build() {
    var el = document.createElement('div');
    el.className = 'modal-overlay';
    el.id = '_aem-overlay';
    el.innerHTML =
      '<div class="modal">' +
        '<div class="modal-hdr">' +
          '<span class="modal-title" id="_aem-title"></span>' +
          '<button class="mclose" id="_aem-close">&#215;</button>' +
        '</div>' +
        '<div class="modal-body">' +
          '<div class="nombre-switch-row">' +
            '<div class="fgroup">' +
              '<label class="flbl" for="_aem-nombre">Nombre</label>' +
              '<input class="inp" id="_aem-nombre">' +
            '</div>' +
            '<div class="switch-col" id="_aem-activo-col">' +
              '<span class="flbl" id="_aem-activo-lbl">Activo</span>' +
              '<label class="sw"><input type="checkbox" id="_aem-activo" checked><span class="sw-track"></span></label>' +
            '</div>' +
          '</div>' +
          '<div id="_aem-fields"></div>' +
          '<div id="_aem-icon-section">' +
            '<label class="flbl">Icono</label>' +
            '<div class="emoji-grid-wrap collapsed" id="_aem-emoji-wrap">' +
              '<div class="emoji-grid" id="_aem-emoji-grid"></div>' +
            '</div>' +
            '<button class="btn-expand" id="_aem-emoji-expand">' +
              '<i class="expand-chev" id="_aem-emoji-chev">&#9660;</i>' +
              '<span id="_aem-emoji-lbl">Ver más iconos</span>' +
            '</button>' +
            '<div class="modal-note">💡 También puedes pegar cualquier emoji de WhatsApp u otro teclado</div>' +
          '</div>' +
          '<button class="btn-guardar" id="_aem-save"></button>' +
          '<button class="btn-del" id="_aem-del" style="display:none"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) { if (e.target === el) _close(); });
    el.querySelector('#_aem-close').addEventListener('click', _close);
    el.querySelector('#_aem-emoji-expand').addEventListener('click', _toggleExpand);
    el.querySelector('#_aem-save').addEventListener('click', _handleSave);
    el.querySelector('#_aem-del').addEventListener('click', function () { if (_onDelete) _onDelete(); });
    return el;
  }

  function _renderIcons() {
    var grid = _el.querySelector('#_aem-emoji-grid');
    grid.innerHTML = _icons.map(function (e) {
      return '<div class="emoji-opt' + (e === _selectedIcon ? ' sel' : '') + '" data-emoji="' + e + '">' + e + '</div>';
    }).join('');
    grid.querySelectorAll('.emoji-opt').forEach(function (opt) {
      opt.addEventListener('click', function () {
        _selectedIcon = opt.getAttribute('data-emoji');
        grid.querySelectorAll('.emoji-opt').forEach(function (o) { o.classList.remove('sel'); });
        opt.classList.add('sel');
        if (_onIconChange) _onIconChange(_selectedIcon);
      });
    });
  }

  function _toggleExpand() {
    _expanded = !_expanded;
    var wrap = _el.querySelector('#_aem-emoji-wrap');
    wrap.classList.toggle('collapsed', !_expanded);
    wrap.classList.toggle('expanded', _expanded);
    _el.querySelector('#_aem-emoji-chev').style.transform = _expanded ? 'rotate(180deg)' : '';
    _el.querySelector('#_aem-emoji-lbl').textContent = _expanded ? 'Ver menos' : 'Ver más iconos';
  }

  function _collectFieldValues() {
    var data = {};
    _el.querySelectorAll('#_aem-fields [id]').forEach(function (input) {
      data[input.id] = input.type === 'checkbox' ? input.checked : input.value;
    });
    return data;
  }

  function _handleSave() {
    if (!_onSave) return;
    var data = _collectFieldValues();
    data.nombre = _el.querySelector('#_aem-nombre').value.trim();
    data.activo = _el.querySelector('#_aem-activo').checked;
    data.icono = _selectedIcon;
    _onSave(data);
  }

  function _close() {
    if (_el) _el.classList.remove('show');
  }

  function open(cfg) {
    cfg = cfg || {};
    if (!_el) _el = _build();
    _icons = cfg.icons || [];
    _selectedIcon = cfg.icono || _icons[0] || '';
    _expanded = false;
    _onSave = cfg.onSave || null;
    _onDelete = cfg.onDelete || null;
    _onIconChange = cfg.onIconChange || null;

    _el.querySelector('#_aem-title').textContent = cfg.title || '';
    var nombreInp = _el.querySelector('#_aem-nombre');
    nombreInp.value = cfg.nombre || '';
    nombreInp.placeholder = cfg.nombrePlaceholder || '';

    var activoCol = _el.querySelector('#_aem-activo-col');
    activoCol.style.display = cfg.showActivo === false ? 'none' : '';
    _el.querySelector('#_aem-activo-lbl').textContent = cfg.activoLabel || 'Activo';
    _el.querySelector('#_aem-activo').checked = cfg.activo !== false;

    _el.querySelector('#_aem-fields').innerHTML = (cfg.fields || []).join('');

    _el.querySelector('#_aem-icon-section').style.display = cfg.showIcono === false ? 'none' : '';

    _renderIcons();
    var wrap = _el.querySelector('#_aem-emoji-wrap');
    wrap.classList.remove('expanded');
    wrap.classList.add('collapsed');
    _el.querySelector('#_aem-emoji-chev').style.transform = '';
    _el.querySelector('#_aem-emoji-lbl').textContent = 'Ver más iconos';

    _el.querySelector('#_aem-save').textContent = cfg.saveLabel || 'Guardar';
    var delBtn = _el.querySelector('#_aem-del');
    if (cfg.onDelete) {
      delBtn.style.display = 'block';
      delBtn.textContent = cfg.deleteLabel || 'Eliminar';
    } else {
      delBtn.style.display = 'none';
    }

    _el.classList.add('show');
    if (typeof cfg.onRender === 'function') cfg.onRender();
  }

  global.AdminEntityModal = { open: open, close: _close };
}(window));
