/* Modal de detalle/edición de trabajador — openPreview, saveProfile y helpers.
   Implementación canónica compartida entre lagaleria_turnos.html y lagaleria_inicio.html.
   Inyecta automáticamente el markup de #ov-preview en el body al cargar el DOM.
   Requiere en el ámbito de página: getW, cntT, L, ROWS, CONFLICTS, parse, ini,
   isSafeImg, curLocal, curWeek, curYear, curMonday, showOv, closeOv, showToast, buildGrid, renderW,
   updateStats, renderTrabajadores, renderHoraList, renderVacList, renderSkillsSummary,
   getDayVacacion, ensureWorkerExtras, _sb. Opcionales: scheduleAutosave,
   sbUploadFotoTrabajador, compressImage, saveWorker, showConfirm. */

var _previewName = '';
var _horaRows    = [];
var _previewSnapshot = null;

function getHour(name, d) {
  var h = '';
  ROWS.forEach(function(r) {
    var f = (L().data[r][d] || []).find(function(n) { return parse(n).name === name; });
    if (f && parse(f).hour) h = parse(f).hour;
  });
  return h;
}

/* ── Patch parcial sobre la tabla trabajadores ── */
async function sbUpdateTrabajador(id, campos) {
  if (!_sb || !id) { console.warn('[SB] sbUpdateTrabajador: sin conexión o sin id'); return; }
  const { error } = await _sb.from('trabajadores').update(campos).eq('id', id);
  if (error) { console.error('[SB] sbUpdateTrabajador:', error.message); return; }
  console.log('[SB] trabajador actualizado:', campos);
}

/* ── Detecta rol admin/superadmin en ambos contextos de página ── */
function _isAdmin() {
  if (typeof rol !== 'undefined') return rol === 'admin' || rol === 'superadmin';
  var u = null;
  try { u = (window.parent && window.parent !== window) ? window.parent.currentUser : null; } catch(e) {}
  if (!u) try { var s = localStorage.getItem('lg_session'); if (s) u = JSON.parse(s); } catch(e) {}
  return u != null && (u.rol === 'admin' || u.rol === 'superadmin');
}

/* ── PERFIL / PREVIEW TRABAJADOR ── */
function openPreview(name) {
  _previewName = name;
  const w = getW(name) || {name, sec:'?', photo:null, tel:'', minT:0, maxT:0, unavailMed:[], unavailNoch:[], vacaciones:[]};
  const t = cntT(name);

  /* Snapshot del estado editable-sin-guardar, para poder descartarlo si se cierra con X */
  _previewSnapshot = {
    unavailMed:  (w.unavailMed  || []).slice(),
    unavailNoch: (w.unavailNoch || []).slice(),
    prioridad:   w.prioridad,
    shifts: ROWS.reduce(function(acc, r) {
      acc[r] = {};
      for (let d = 0; d < 7; d++) {
        const found = (L().data[r][d] || []).find(n => parse(n).name === name);
        acc[r][d] = found || null;
      }
      return acc;
    }, {})
  };
  document.getElementById('prev-title').textContent = name;
  document.getElementById('prev-sub').textContent = (w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos') + ' · ' + (curLocal==='galeria'?'La Galería':'La Sala');
  document.getElementById('prev-avatar').innerHTML = isSafeImg(w.photo) ? `<img src="${w.photo}" alt="${name}">` : `${ini(name)}`;
  document.getElementById('prev-name').textContent = name;
  document.getElementById('prev-sect').textContent = w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos';
  document.getElementById('prev-min').value = w.minT != null ? String(w.minT) : '';
  document.getElementById('prev-max').value = w.maxT != null ? String(w.maxT) : '';
  document.getElementById('prev-turnos-count').textContent = t + ' turno' + (t !== 1 ? 's' : '');
  const dispChk = document.getElementById('prev-disponible');
  if (dispChk) dispChk.checked = w.disponible !== false;

  const td = document.getElementById('prev-tel-display');
  const ti = document.getElementById('prev-tel-input');
  ti.style.display = 'none';
  if (w.tel) { td.textContent = w.tel; td.className = 'w-tel-display'; }
  else { td.textContent = '+ Tel'; td.className = 'w-tel-display empty'; }
  td.style.display = '';

  document.querySelectorAll('#prof-sg .sg-cell').forEach(c => {
    ROWS.forEach(r => c.classList.remove('on-'+r, 'unavail', 'on-vac'));
    c.removeAttribute('data-vac-icon');
    c.removeAttribute('title');
    const col = parseInt(c.dataset.col);
    const r = c.dataset.row;
    if ((L().data[r][col]||[]).some(n => parse(n).name === name)) c.classList.add('on-'+r);
    const isMed = r === 'sm' || r === 'cm';
    if ((isMed ? w.unavailMed : w.unavailNoch).includes(col)) c.classList.add('unavail');
    const vacIcon = getDayVacacion(name, col);
    if (vacIcon) {
      c.classList.add('on-vac');
      c.setAttribute('data-vac-icon', vacIcon);
      c.setAttribute('title', 'Día de vacaciones');
    }
  });

  document.querySelectorAll('#unavail-med .unavail-chip-h').forEach(el => {
    el.classList.toggle('active', w.unavailMed.includes(parseInt(el.dataset.d)));
  });
  document.querySelectorAll('#unavail-noch .unavail-chip-h').forEach(el => {
    el.classList.toggle('active', w.unavailNoch.includes(parseInt(el.dataset.d)));
  });

  _horaRows = [];
  for (let d = 0; d < 7; d++) { const h = getHour(name, d); if (h) _horaRows.push({d, h}); }
  renderHoraList(); renderVacList(); updateAlert();

  const accBody  = document.getElementById('acc-body-cfg');
  const accArrow = document.getElementById('acc-arrow-cfg');
  if (accBody) accBody.classList.remove('open');
  if (accArrow) accArrow.style.transform = '';

  renderSkillsSummary();
  renderPrioridad();

  /* Elementos condicionales por rol */
  const isAdmin = _isAdmin();

  var resetBtn = document.getElementById('prev-reset-pin-btn');
  if (resetBtn) resetBtn.style.display = isAdmin ? '' : 'none';

  _refreshInviteUI(w);

  showOv('ov-preview');
}

/* ── Estado real de acceso + botón "Enviar invitación" ──
   Fuente de verdad: pin_hash + must_change_pin (BD), no un campo local
   efímero — así el botón no depende de qué otras interacciones haya habido
   desde que se creó/cargó w. Un trabajador sigue "pendiente" aunque ya se le
   haya enviado el PIN temporal (pin_hash relleno): mientras must_change_pin
   sea true no ha entrado todavía a cambiarlo por el suyo — ese primer acceso
   real aún no está implementado, así que hoy must_change_pin nunca pasa a
   false por sí solo. */
function _refreshInviteUI(w) {
  var isAdmin  = _isAdmin();
  var pending  = w.pinHash == null || w.mustChangePin !== false;

  var estadoEl = document.getElementById('prev-estado');
  if (estadoEl) {
    var label = !w.tel ? '⚪ Sin teléfono' : (pending ? (w.pinHash ? '🟡 Invitación enviada' : '⚪ Sin acceso') : '🟢 Activo');
    if (!pending && w.disponible === false) label = '🔴   No disponible';
    estadoEl.textContent = isAdmin ? label : '';
    estadoEl.style.display = isAdmin ? '' : 'none';
  }

  var invBtn = document.getElementById('prev-invite-btn');
  if (invBtn) {
    if (!isAdmin || !pending) {
      invBtn.style.display = 'none';
    } else if (!w.tel) {
      invBtn.style.display = '';
      invBtn.style.opacity = '.5';
      invBtn.style.pointerEvents = 'none';
      invBtn.textContent = '📞 Añade teléfono para dar acceso';
    } else {
      invBtn.style.display = '';
      invBtn.style.opacity = '1';
      invBtn.style.pointerEvents = '';
      invBtn.textContent = '📱 Enviar invitación';
      invBtn.onclick = function() { prev_sendInvite(w.name); };
    }
  }
}

function toggleDisponible(el) {
  const w = getW(_previewName); if (!w) return;
  const val = !!el.checked;
  w.disponible = val;
  if (w._sbId) sbUpdateTrabajador(w._sbId, { disponible: val });
  _refreshInviteUI(w);
  if (typeof buildGrid === 'function') buildGrid();
  if (typeof renderW === 'function') renderW();
  if (typeof updateStats === 'function') updateStats();
  if (typeof showToast === 'function') showToast(val ? _previewName + ' marcado como disponible' : _previewName + ' marcado como no disponible', 'info');
}

/* ── CERRAR SIN GUARDAR — descarta turnos, días no disponibles y prioridad tocados en esta apertura ── */
function cancelPreview() {
  const w = getW(_previewName);
  if (w && _previewSnapshot) {
    w.unavailMed  = _previewSnapshot.unavailMed.slice();
    w.unavailNoch = _previewSnapshot.unavailNoch.slice();
    w.prioridad   = _previewSnapshot.prioridad;
    ROWS.forEach(r => {
      for (let d = 0; d < 7; d++) {
        if (!L().data[r][d]) L().data[r][d] = [];
        const orig = _previewSnapshot.shifts[r][d];
        const idx = L().data[r][d].findIndex(n => parse(n).name === _previewName);
        if (orig) {
          if (idx >= 0) L().data[r][d][idx] = orig; else L().data[r][d].push(orig);
        } else if (idx >= 0) {
          L().data[r][d].splice(idx, 1);
        }
      }
    });
  }
  _previewSnapshot = null;
  closeOv('ov-preview');
  if (typeof buildGrid === 'function') buildGrid();
  if (typeof renderW === 'function') renderW();
  if (typeof updateStats === 'function') updateStats();
  if (typeof scheduleAutosave === 'function') scheduleAutosave();
}

/* ── ALERTAS DE PERFIL ── */
function updateAlert() {
  const w = getW(_previewName); if (!w) return;
  const t = cntT(_previewName);
  const min = parseInt(document.getElementById('prev-min').value) || 0;
  const max = parseInt(document.getElementById('prev-max').value) || 0;
  const msgs = [];

  if (max > 0 && t > max) msgs.push(`Exceso de turnos — lleva ${t}, máximo ${max}`);
  if (min > 0 && t < min) msgs.push(`Faltan turnos — lleva ${t}, mínimo ${min}`);

  const SLOTS = {sm:'unavailMed', sn:'unavailNoch', cm:'unavailMed', cn:'unavailNoch'};
  const DAYS  = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const SLOT_LBL = {sm:'Sala med', sn:'Sala noche', cm:'Cocina med', cn:'Cocina noche'};
  Object.entries(SLOTS).forEach(([slot, unavailKey]) => {
    const unavail = w[unavailKey] || [];
    for (let d = 0; d < 7; d++) {
      if (!unavail.includes(d)) continue;
      const assigned = (L().data[slot][d]||[]).some(n => n.split(':')[0].trim() === w.name);
      if (assigned) msgs.push(`Turno en día no disponible — ${SLOT_LBL[slot]} ${DAYS[d]}`);
    }
  });

  if (w.vacaciones && w.vacaciones.length) {
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(curMonday + 'T00:00:00Z');
      dayDate.setUTCDate(dayDate.getUTCDate() + d);
      const dayStr = dayDate.toISOString().split('T')[0];
      const onVac = w.vacaciones.some(v => dayStr >= v.desde && dayStr <= v.hasta);
      if (!onVac) continue;
      const hasShift = ['sm','sn','cm','cn'].some(sl => (L().data[sl][d]||[]).some(n => n.split(':')[0].trim() === w.name));
      if (hasShift) msgs.push(`Turno en periodo de vacaciones — ${DAYS[d]}`);
    }
  }

  const alertEl = document.getElementById('prev-alert');
  if (msgs.length) {
    alertEl.className = 'w-alert alert-err';
    alertEl.innerHTML = msgs.map(m => `⚠ ${m}`).join('<br>');
    alertEl.style.display = 'block';
  } else {
    alertEl.style.display = 'none';
  }
}

/* ── DISPONIBILIDAD EN PERFIL ── */
function toggleSg(cell) {
  const row = cell.dataset.row, col = parseInt(cell.dataset.col), conf = CONFLICTS[row];
  const turningOn = !cell.classList.contains('on-'+row);
  if (turningOn) {
    const w = getW(_previewName);
    if (w && (w.disponible === false || w.visible === false)) {
      if (typeof showToast === 'function') showToast(_previewName + ' no está disponible actualmente', 'error');
      return;
    }
  }
  if (!cell.classList.contains('on-'+row)) {
    document.querySelector(`#prof-sg .sg-cell[data-row="${conf}"][data-col="${col}"]`)?.classList.remove('on-'+conf);
    if (L().data[conf][col]) L().data[conf][col] = L().data[conf][col].filter(n => parse(n).name !== _previewName);
  }
  cell.classList.toggle('on-'+row);
  if (!L().data[row][col]) L().data[row][col] = [];
  if (cell.classList.contains('on-'+row)) {
    if (!L().data[row][col].some(n => parse(n).name === _previewName)) L().data[row][col].push(_previewName);
  } else {
    L().data[row][col] = L().data[row][col].filter(n => parse(n).name !== _previewName);
  }
  updateAlert();
  if (typeof scheduleAutosave === 'function') scheduleAutosave();
}

function toggleUnavail(el) {
  el.classList.toggle('active');
  const d = parseInt(el.dataset.d);
  const t = el.dataset.t;
  const rows = t === 'med' ? ['sm','cm'] : ['sn','cn'];
  rows.forEach(r => {
    document.querySelector(`#prof-sg .sg-cell[data-row="${r}"][data-col="${d}"]`)?.classList.toggle('unavail', el.classList.contains('active'));
  });
  updateAlert();
  const w = getW(_previewName); if (!w) return;
  if (!w.unavailMed) w.unavailMed = [];
  if (!w.unavailNoch) w.unavailNoch = [];
  const arr = t === 'med' ? w.unavailMed : w.unavailNoch;
  /* Solo memoria — se persiste a Supabase en saveProfile() para poder descartarse con cancelPreview() */
  if (el.classList.contains('active')) {
    if (!arr.includes(d)) arr.push(d);
  } else {
    const i = arr.indexOf(d); if (i >= 0) arr.splice(i, 1);
  }
}

/* ── ACORDEÓN CONFIGURACIÓN ── */
function toggleAccCfg() {
  const b = document.getElementById('acc-body-cfg');
  const a = document.getElementById('acc-arrow-cfg');
  if (!b) return;
  b.classList.toggle('open');
  a.style.transform = b.classList.contains('open') ? 'rotate(90deg)' : '';
}

/* ── PRIORIDAD TRABAJADOR ── */
function setPrioridad(nivel) {
  const w = getW(_previewName); if (!w) return;
  w.prioridad = nivel;
  renderPrioridad();
}

function renderPrioridad() {
  const w = getW(_previewName); if (!w) return;
  ensureWorkerExtras(w);
  const btns = document.querySelectorAll('#prio-btns .prio-btn');
  btns.forEach(b => b.className = 'prio-btn');
  if (w.prioridad === 'fijo' && btns[0]) btns[0].classList.add('prio-fijo');
  else if (btns[1]) btns[1].classList.add('prio-eventual');
}

/* ── GUARDAR PERFIL ── */
function saveProfile() {
  const w = getW(_previewName); if (!w) return;
  w.minT = parseInt(document.getElementById('prev-min').value) || 0;
  w.maxT = parseInt(document.getElementById('prev-max').value) || 0;
  w.unavailMed  = Array.from(document.querySelectorAll('#unavail-med .unavail-chip-h.active')).map(el => parseInt(el.dataset.d));
  w.unavailNoch = Array.from(document.querySelectorAll('#unavail-noch .unavail-chip-h.active')).map(el => parseInt(el.dataset.d));
  ROWS.forEach(r => L().data[r].forEach((da, di) => { L().data[r][di] = da.filter(n => parse(n).name !== _previewName); }));
  document.querySelectorAll('#prof-sg .sg-cell').forEach(c => {
    ROWS.forEach(r => {
      if (c.dataset.row === r && c.classList.contains('on-'+r)) {
        const d = parseInt(c.dataset.col);
        const hour = _horaRows.find(hr => hr.d === d);
        const raw = _previewName + (hour && hour.h ? ':'+hour.h : '');
        if (!L().data[r][d]) L().data[r][d] = [];
        if (!L().data[r][d].some(n => parse(n).name === _previewName)) L().data[r][d].push(raw);
      }
    });
  });
  const gs = document.querySelector('.grid-scroll');
  const scrollLeft = gs ? gs.scrollLeft : 0;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  _syncUnavailToSupabase(w, _previewSnapshot);
  _previewSnapshot = null;
  closeOv('ov-preview'); buildGrid(); renderW(); updateStats();
  if (gs) gs.scrollLeft = scrollLeft;
  window.scrollTo(0, scrollTop);
  if (w._sbId) sbUpdateTrabajador(w._sbId, { min_turnos: w.minT, max_turnos: w.maxT, prioridad: w.prioridad || 'eventual' });
  if (typeof showToast === 'function') showToast('Perfil guardado ✓', 'success');
  if (typeof scheduleAutosave === 'function') scheduleAutosave();
}

/* ── Persiste a Supabase solo los días que realmente cambiaron desde la apertura del modal ── */
function _syncUnavailToSupabase(w, snapshot) {
  if (!w._sbId || !snapshot) return;
  [['unavailMed','med'], ['unavailNoch','noc']].forEach(([key, turno]) => {
    const before = snapshot[key] || [];
    const after = w[key] || [];
    after.filter(d => !before.includes(d)).forEach(d => {
      _sb?.from('disponibilidad').insert({trabajador_id:w._sbId, dia_semana:d, turno})
        .then(({error}) => { if (error) console.error('[SB] insert dispo:', error.message); });
    });
    before.filter(d => !after.includes(d)).forEach(d => {
      _sb?.from('disponibilidad').delete().eq('trabajador_id',w._sbId).eq('dia_semana',d).eq('turno',turno)
        .then(({error}) => { if (error) console.error('[SB] delete dispo:', error.message); });
    });
  });
}

/* ── CONTACTO ── */
function startEditTel() {
  const td = document.getElementById('prev-tel-display');
  const ti = document.getElementById('prev-tel-input');
  td.style.display = 'none';
  ti.value = getW(_previewName)?.tel || '';
  ti.style.display = '';
  ti.focus();
}

function saveTel() {
  const w = getW(_previewName);
  const v = document.getElementById('prev-tel-input').value.trim();
  if (w) w.tel = v;
  const td = document.getElementById('prev-tel-display');
  const ti = document.getElementById('prev-tel-input');
  ti.style.display = 'none';
  if (v) { td.textContent = v; td.className = 'w-tel-display'; }
  else { td.textContent = '+ Tel'; td.className = 'w-tel-display empty'; }
  td.style.display = '';
  if (w && w._sbId) sbUpdateTrabajador(w._sbId, { tel: v || null });
}

/* cleanTel() vive en assets/lib/utils.js. */
function callWorker() {
  const w = getW(_previewName);
  if (w && w.tel) window.location.href = `tel:${cleanTel(w.tel)}`;
}

function waWorker() {
  const w = getW(_previewName);
  if (w && w.tel) window.open(`https://wa.me/34${cleanTel(w.tel)}`);
}

/* ── FOTO DE TRABAJADOR — solo visor, sin subida ── */
function viewWorkerPhoto() {
  const w = getW(_previewName);
  if (!w || !isSafeImg(w.photo)) return;
  var ovId = 'ov-worker-photo';
  if (!document.getElementById(ovId)) {
    document.body.insertAdjacentHTML('beforeend',
      '<div class="overlay" id="' + ovId + '" onclick="if(event.target===this)closeOv(\'' + ovId + '\')" style="z-index:300;padding:16px;align-items:center">' +
      '<div style="display:flex;flex-direction:column;align-items:center;gap:10px">' +
      '<button onclick="closeOv(\'' + ovId + '\')" style="align-self:flex-end;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.2);border-radius:7px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:20px;line-height:1">&#215;</button>' +
      '<img id="wph-img" src="" alt="" style="max-width:90vw;max-height:80vh;object-fit:contain;border-radius:10px">' +
      '</div></div>'
    );
  }
  document.getElementById('wph-img').src = w.photo;
  showOv(ovId);
}

/* ── ACCIONES DE ADMIN ──
   Da de alta el acceso de un trabajador pendiente: genera un PIN temporal,
   lo guarda hasheado en BD y abre WhatsApp con el mensaje de bienvenida ya
   escrito para que el admin solo tenga que revisarlo y pulsar enviar.
   El flujo de login real del trabajador (pantalla de PIN, obligar a
   cambiarlo en el primer acceso) NO está implementado todavía — esta función
   solo prepara el acceso; el trabajador sigue "pendiente" hasta que ese
   flujo exista y se use. */
async function prev_sendInvite(name) {
  var w = (typeof getW === 'function') ? getW(name) : null;
  if (!w) return;

  /* Sin teléfono no hay ni canal para avisarle (WhatsApp) ni número con el
     que vaya a poder entrar — cortamos aquí en vez de generar un PIN que
     nadie podría recibir ni usar. */
  if (!w.tel) {
    if (typeof showToast === 'function') showToast('Este trabajador no tiene teléfono asignado', 'error');
    return;
  }

  /* ── 1. PIN temporal ──
     Fijo y conocido (1234), no aleatorio: no es la contraseña definitiva del
     trabajador, es un valor "de un solo uso" que must_change_pin obliga a
     cambiar en el primer acceso real. Al ser de un solo uso y de vida muy
     corta, no hace falta generarlo al azar ni mandarlo por un canal más
     seguro que WhatsApp. */
  var TEMP_PIN = '1234';

  /* ── 2. Hash del PIN — SHA-256 vía Web Crypto API ──
     hashPin() vive en assets/lib/utils.js — MISMO algoritmo que usa index.js
     al verificar el login, el hash tiene que coincidir bit a bit. Se guarda
     el hash en BD, nunca el PIN en claro, por si la fila llegara a
     filtrarse. No es bcrypt/scrypt/Argon2 a propósito: esos algoritmos
     añaden un coste computacional deliberado para proteger contraseñas de
     uso prolongado frente a fuerza bruta offline durante años. Aquí el PIN
     es temporal y de un solo uso — su "vida útil" termina en cuanto el
     trabajador lo cambia — así que ese coste extra no aporta seguridad real
     y sí penaliza rendimiento. Cuando se implemente el cambio de PIN
     definitivo (el que el propio trabajador elige y usará indefinidamente),
     ese sí debería hashearse con un algoritmo lento tipo bcrypt. */
  var pinHash = await hashPin(TEMP_PIN);

  /* ── 3. Persistir en Supabase ──
     must_change_pin=true es lo que hace que el trabajador siga apareciendo
     como pendiente (ver _refreshInviteUI) aunque pin_hash ya no sea null:
     fuerza, en cuanto exista el login real, el flujo de "elige tu PIN" antes
     de dejarle usar la app con el 1234 temporal. */
  if (w._sbId) {
    await sbUpdateTrabajador(w._sbId, { pin_hash: pinHash, must_change_pin: true });
  }
  w.pinHash = pinHash;
  w.mustChangePin = true;
  _refreshInviteUI(w);
  if (typeof renderTrabajadores === 'function') renderTrabajadores();

  /* ── 4. Notificación por WhatsApp ──
     Se usa WhatsApp (wa.me) en vez de SMS/email propio porque es el canal
     que el equipo ya usa a diario (mismo patrón que el envío de pedidos a
     proveedores en Stock): no requiere backend de envío ni contratar ningún
     proveedor de SMS/email transaccional, y funciona en cualquier móvil sin
     instalar nada. wa.me abre la conversación con el texto ya escrito — no
     se envía nada automáticamente, el admin revisa y pulsa enviar él mismo. */
  /* cleanTel() vive en assets/lib/utils.js — mismo criterio en todo el
     proyecto para limpiar teléfonos (quita espacios/guiones/prefijo de país,
     deja los últimos 9 dígitos). wa.me necesita el 34 aparte, sin duplicarlo. */
  var telClean = '34' + cleanTel(w.tel);

  /* Enlace con ?tel= — index.js lo lee al cargar y salta directo a la
     pantalla de PIN con el teléfono ya puesto, para que el trabajador solo
     tenga que teclear el PIN que le acabamos de mandar. */
  var telUrlParam = encodeURIComponent(cleanTel(w.tel));

  var mensaje = '¡Hola ' + w.name + '! 👋\n\n' +
    'Te damos la bienvenida a La Galería Neotaberna.\n\n' +
    'Ya tienes acceso a la app de gestión:\n' +
    '🔗 https://lagaleriademo.vercel.app/?tel=' + telUrlParam + '\n\n' +
    'Tu acceso:\n' +
    '📱 Teléfono: ' + w.tel + '\n' +
    '🔑 PIN temporal: ' + TEMP_PIN + '\n\n' +
    'Al entrar por primera vez te pedirá que cambies el PIN por uno personal.\n\n' +
    '¡Cualquier duda con el acceso, habla con el admin!';

  window.open('https://wa.me/' + telClean + '?text=' + encodeURIComponent(mensaje), '_blank');

  if (typeof showToast === 'function') showToast('✅ Invitación enviada a ' + name + ' — ' + w.tel, 'success');
}

function prev_resetPin() {
  var name = document.getElementById('prev-title').textContent;
  var w = (typeof getW === 'function') ? getW(name) : null;
  if (!w) return;
  var doReset = function() {
    try { localStorage.removeItem('lg_onboarding_done_' + (w.initials || w.sec)); } catch(e) {}
    if (typeof showToast === 'function') showToast('🔓 PIN de ' + w.name + ' reseteado', 'success');
  };
  if (typeof showConfirm === 'function') {
    showConfirm({ message: 'El PIN de ' + w.name + ' volverá a 1234 y tendrá que cambiarlo en su próximo acceso.', confirmLabel: 'Resetear PIN', onConfirm: doReset });
  } else {
    if (window.confirm('¿Resetear PIN de ' + w.name + '?')) doReset();
  }
}

/* ── CSS canónico del overlay: se inyecta una sola vez en <head> ── */
document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('worker-modal-css')) {
    var st = document.createElement('style');
    st.id = 'worker-modal-css';
    st.textContent =
      '.overlay{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;display:none;align-items:flex-start;justify-content:center;padding:16px;padding-top:20px;overflow-y:auto}' +
      '.overlay.show{display:flex}' +
      '.overlay .modal{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;width:100%;max-width:460px;max-height:90vh;overflow-y:auto}' +
      '.overlay .modal-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;gap:8px}' +
      '.overlay .modal-title{font-size:16px;font-weight:600;color:var(--text)}' +
      '.overlay .modal-sub{font-size:12px;color:var(--dim);margin-top:2px}' +
      '.overlay .mclose{background:var(--nav);border:1px solid var(--border2);border-radius:7px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--dim);font-size:20px;flex-shrink:0;line-height:1}' +
      '.w-disp-row{display:flex;flex-direction:row;align-items:center;gap:6px;margin:0}' +
      '.w-disp-row span{font-size:11px;font-weight:600;color:var(--dim)}' +
      '.w-disp-row .sw{position:relative;display:inline-block;width:40px;height:24px;flex-shrink:0}' +
      '.w-disp-row .sw input{opacity:0;width:0;height:0;position:absolute}' +
      '.w-disp-row .sw-track{position:absolute;inset:0;background:var(--border2);border-radius:12px;transition:.2s;cursor:pointer}' +
      '.w-disp-row .sw-track::before{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s}' +
      '.w-disp-row .sw input:checked + .sw-track{background:var(--acc)}' +
      '.w-disp-row .sw input:checked + .sw-track::before{transform:translateX(16px)}';
    document.head.appendChild(st);
  }
  if (document.getElementById('ov-preview')) return;
  document.body.insertAdjacentHTML('beforeend',
`<div class="overlay" id="ov-preview">
  <div class="modal">
    <div class="modal-hdr" style="flex-direction:column;align-items:stretch;gap:6px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
        <div>
          <div class="modal-title" id="prev-title">Trabajador</div>
          <div class="modal-sub" id="prev-sub"></div>
        </div>
        <button class="mclose" onclick="cancelPreview()">&#215;</button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div id="prev-estado" style="font-size:11px;font-weight:600"></div>
        <div class="w-disp-row">
          <span>Disponible</span>
          <label class="sw"><input type="checkbox" id="prev-disponible" checked onchange="toggleDisponible(this)"><span class="sw-track"></span></label>
        </div>
      </div>
    </div>
    <div class="w-preview">
      <div class="w-preview-top">
        <div class="w-avatar-wrap" onclick="viewWorkerPhoto()">
          <div class="w-avatar" id="prev-avatar">AB</div>
        </div>
        <div class="w-info">
          <div class="w-name" id="prev-name">—</div>
          <div class="w-sect" id="prev-sect">—</div>
        </div>
        <div class="w-right">
          <div id="prev-tel-display" class="w-tel-display empty" onclick="startEditTel()">+ Tel</div>
          <input class="w-tel-input" id="prev-tel-input" type="tel" style="display:none" onblur="saveTel()" onkeydown="if(event.key==='Enter')this.blur()">
          <div class="contact-btns">
            <button class="contact-btn" onclick="callWorker()" style="border-color:rgba(85,187,85,.4)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55bb55" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 011.18 1.18C1.5.61.96.01 1.72.01H4.72a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L5.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.03z"/></svg>
            </button>
            <button class="contact-btn" onclick="waWorker()" style="border-color:rgba(37,211,102,.4)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div class="w-alert" id="prev-alert"></div>
    </div>
    <div class="msec" style="display:flex;align-items:center;justify-content:space-between">
      <span>Turnos esta semana</span>
      <span id="prev-turnos-count" style="font-size:13px;font-weight:600;color:var(--acc)">0 turnos</span>
    </div>
    <div class="sg" style="grid-template-columns:72px repeat(7,1fr)" id="prof-sg">
      <div class="sg-corner"></div>
      <div class="sg-day">Lun<br><b>—</b></div><div class="sg-day">Mar<br><b>—</b></div><div class="sg-day">Mié<br><b>—</b></div><div class="sg-day">Jue<br><b>—</b></div><div class="sg-day">Vie<br><b>—</b></div><div class="sg-day">Sáb<br><b>—</b></div><div class="sg-day">Dom<br><b>—</b></div>
      <div class="sg-label"><span class="dot" style="background:var(--sm-text)"></span>Sala Med</div>
      <div class="sg-cell" data-row="sm" data-col="0" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sm" data-col="1" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sm" data-col="2" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sm" data-col="3" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sm" data-col="4" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sm" data-col="5" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sm" data-col="6" onclick="toggleSg(this)"></div>
      <div class="sg-label"><span class="dot" style="background:var(--sn-text)"></span>Sala Noche</div>
      <div class="sg-cell" data-row="sn" data-col="0" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sn" data-col="1" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sn" data-col="2" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sn" data-col="3" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sn" data-col="4" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sn" data-col="5" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="sn" data-col="6" onclick="toggleSg(this)"></div>
      <div class="sg-label"><span class="dot" style="background:var(--cm-text)"></span>Cocina Med</div>
      <div class="sg-cell" data-row="cm" data-col="0" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cm" data-col="1" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cm" data-col="2" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cm" data-col="3" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cm" data-col="4" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cm" data-col="5" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cm" data-col="6" onclick="toggleSg(this)"></div>
      <div class="sg-label"><span class="dot" style="background:var(--cn-text)"></span>Cocina Noche</div>
      <div class="sg-cell" data-row="cn" data-col="0" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cn" data-col="1" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cn" data-col="2" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cn" data-col="3" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cn" data-col="4" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cn" data-col="5" onclick="toggleSg(this)"></div><div class="sg-cell" data-row="cn" data-col="6" onclick="toggleSg(this)"></div>
    </div>
    <div class="modal-note">&#8505; Sala med y cocina med no pueden coincidir — igual para noche.</div>
    <div class="acc-toggle" id="acc-toggle-cfg" onclick="toggleAccCfg()">
      <div class="acc-toggle-lbl">⚙ Configuración y restricciones</div>
      <div class="acc-arrow" id="acc-arrow-cfg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></div>
    </div>
    <div class="acc-body" id="acc-body-cfg">
      <div class="acc-block">
        <div class="acc-block-title">Hora especial de entrada</div>
        <div class="hora-list" id="hora-list"></div>
        <button class="btn-add" onclick="addHoraRow()">+ Añadir hora especial</button>
      </div>
      <div class="acc-block">
        <div class="acc-block-title">Min / Max turnos semana</div>
        <div class="minmax-row">
          <div class="minmax-field">
            <span class="minmax-lbl">Mínimo</span>
            <select class="minmax-inp" id="prev-min" onchange="updateAlert()">
              <option value="">—</option><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option>
            </select>
          </div>
          <div class="minmax-field">
            <span class="minmax-lbl">Máximo</span>
            <select class="minmax-inp" id="prev-max" onchange="updateAlert()">
              <option value="">—</option><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option>
            </select>
          </div>
        </div>
      </div>
      <div class="acc-block">
        <div class="acc-block-title">Días no disponibles</div>
        <div style="display:flex;flex-direction:column;gap:5px">
          <div class="unavail-row-wrap">
            <span class="unavail-row-label">Mediodía</span>
            <div class="unavail-chips-row" id="unavail-med">
              <div class="unavail-chip-h" data-t="med" data-d="0" onclick="toggleUnavail(this)">Lun</div>
              <div class="unavail-chip-h" data-t="med" data-d="1" onclick="toggleUnavail(this)">Mar</div>
              <div class="unavail-chip-h" data-t="med" data-d="2" onclick="toggleUnavail(this)">Mié</div>
              <div class="unavail-chip-h" data-t="med" data-d="3" onclick="toggleUnavail(this)">Jue</div>
              <div class="unavail-chip-h" data-t="med" data-d="4" onclick="toggleUnavail(this)">Vie</div>
              <div class="unavail-chip-h" data-t="med" data-d="5" onclick="toggleUnavail(this)">Sáb</div>
              <div class="unavail-chip-h" data-t="med" data-d="6" onclick="toggleUnavail(this)">Dom</div>
            </div>
          </div>
          <div class="unavail-row-wrap">
            <span class="unavail-row-label">Noche</span>
            <div class="unavail-chips-row" id="unavail-noch">
              <div class="unavail-chip-h" data-t="noch" data-d="0" onclick="toggleUnavail(this)">Lun</div>
              <div class="unavail-chip-h" data-t="noch" data-d="1" onclick="toggleUnavail(this)">Mar</div>
              <div class="unavail-chip-h" data-t="noch" data-d="2" onclick="toggleUnavail(this)">Mié</div>
              <div class="unavail-chip-h" data-t="noch" data-d="3" onclick="toggleUnavail(this)">Jue</div>
              <div class="unavail-chip-h" data-t="noch" data-d="4" onclick="toggleUnavail(this)">Vie</div>
              <div class="unavail-chip-h" data-t="noch" data-d="5" onclick="toggleUnavail(this)">Sáb</div>
              <div class="unavail-chip-h" data-t="noch" data-d="6" onclick="toggleUnavail(this)">Dom</div>
            </div>
          </div>
        </div>
      </div>
      <div class="acc-block">
        <div class="acc-block-title">Prioridad de asignación</div>
        <div class="prio-btns" id="prio-btns">
          <button class="prio-btn" onclick="setPrioridad('fijo')">⭐ Fijo</button>
          <button class="prio-btn" onclick="setPrioridad('eventual')">— Eventual</button>
        </div>
      </div>
      <div class="acc-block">
        <div class="acc-block-title">Skills</div>
        <div id="skills-body"></div>
        <button class="btn-add" onclick="openSkillsModal()">✏ Añadir / Quitar Skills</button>
      </div>
      <div class="acc-block">
        <div class="acc-block-title">Vacaciones 🌴<span id="vac-days-total" class="badge" style="margin-left:6px">0 días</span></div>
        <div class="vac-section" id="vac-list"></div>
        <button class="btn-add" onclick="openVacPopup()">+ Añadir periodo</button>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">
      <button id="prev-invite-btn" style="display:none;width:100%;padding:12px;border-radius:12px;border:1.5px solid rgba(197,166,105,.3);background:rgba(197,166,105,.08);color:var(--acc);font-size:13px;font-weight:600;cursor:pointer"></button>
      <button id="prev-reset-pin-btn" style="display:none;width:100%;padding:11px;border-radius:12px;border:1px solid var(--brd2);background:var(--surf);color:var(--dim);font-size:13px;font-weight:600;cursor:pointer" onclick="prev_resetPin()">&#128274; Resetear PIN</button>
      <div style="display:flex;gap:8px">
        <button class="mbtn-d" style="flex:1;text-align:center;padding:11px" onclick="archiveWorker(_previewName)">Eliminar</button>
        <button class="btn-confirm" style="flex:1" onclick="saveProfile()">Guardar y cerrar</button>
      </div>
    </div>
  </div>
</div>`);
});
