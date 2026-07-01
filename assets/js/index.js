/* index.html — shell de la app (login, navegación entre iframes, perfil, notificaciones).
   Depende de globals cargados antes: _sb/LOCAL_ID (supabase-client.js), toast/showModal/closeModal/stepField/formatDateLabel (ui-helpers.js), MOCK_PROFILES (assets/mock/profiles.js).
   Expone funciones/variables globales (goTo, applySession, sbVerifyLogin, ls_init, currentUser, etc.) en window — sin IIFE/module — para que los iframes (fr-turnos, fr-reservas, fr-admin, fr-inicio) puedan llamarlas via window.parent.*  */


/* ── LOAD LOCAL CONFIG desde Supabase ──
   Lee nombre, colores del local y los aplica al header
   TODO: cuando tengamos auth real, leer el local del usuario */
async function sbLoadLocal(){
  try{
    const {data,error} = await _sb.from('locales')
      .select('*').eq('id', LOCAL_ID).single();
    if(error){
      console.warn('sbLoadLocal RLS/error:', error.message);
      return null;
    }
    if(data){
      /* Apply colors */
      document.documentElement.style.setProperty('--nav', data.color_nav||'#22292D');
      document.documentElement.style.setProperty('--acc', data.color_acc||'#C5A669');
      /* Store for iframes */
      window._activeLocal = data;
    }
    return data;
  }catch(e){ console.error('sbLoadLocal',e); return null; }
}

/* getActiveLocal — llamado desde iframes para obtener config del local */
function getActiveLocal(){
  return window._activeLocal || {
    id:        LOCAL_ID,
    nombre:    'La Galería Neotaberna',
    slug:      'galeria',
    color_nav: '#22292D',
    color_acc: '#C5A669',
  };
}

/* ── VERIFY LOGIN contra Supabase ──
   TODO: reemplazar mock por Supabase Phone Auth
   Por ahora valida tel contra tabla trabajadores */
async function sbVerifyLogin(tel, pin){
  /* Mock PIN check — en producción: Supabase Auth */
  if(pin !== '1234') return null;

  /* Buscar trabajador por teléfono */
  try{
    const telClean = tel.replace(/\s/g,'').replace('+34','');
    const {data,error} = await _sb.from('trabajadores')
      .select('id, nombre, seccion, tel, prioridad, foto_url, visible')
      .eq('local_id', LOCAL_ID)
      .ilike('tel', '%'+telClean+'%')
      .eq('activo', true)
      .maybeSingle();
    if(error){
      console.warn('sbVerifyLogin RLS/error:', error.message);
      return null; /* fallback to mock */
    }
    if(data){
      return {
        nombre:   data.nombre,
        initials: data.nombre.split(' ').map(function(n){return n[0];}).join('').toUpperCase().slice(0,2),
        rol:      'empleado', /* TODO: leer de usuario_local cuando haya auth */
        localId:  LOCAL_ID,
        _sbId:    data.id,
        tel:      data.tel || '',
        foto_url: data.foto_url || null,
        visible:  data.visible !== false,
      };
    }
  }catch(e){ console.error('sbVerifyLogin',e); }
  return null;
}


var currentUser = null; // se rellena al hacer login

/* Restore saved tel on load */
(function(){
  try{
    var saved = localStorage.getItem('lg_saved_tel');
    if(saved){
      var el = document.getElementById('l-tel');
      if(el) el.value = saved;
    }
  }catch(e){}
})();

var locales = [
  {id:1, nombre:'La Galería Neotaberna', initials:'LG', color:'#22292D', acc:'#C5A669', activo:true,
   trabajadores:19,
   zonas:[
     {id:101, nombre:'Terraza', emoji:'☀️', mesas:8,  pax:24, activa:true},
     {id:102, nombre:'Entrada', emoji:'🚪', mesas:4,  pax:12, activa:true},
     {id:103, nombre:'Barra',   emoji:'🍷', mesas:6,  pax:18, activa:true},
     {id:104, nombre:'Sala',    emoji:'🪑', mesas:10, pax:30, activa:true},
     {id:105, nombre:'Salón',   emoji:'🎭', mesas:6,  pax:20, activa:false},
   ]
  },
  {id:2, nombre:'La Sala', initials:'LS', color:'#1a1e2e', acc:'#8b9cf4', activo:true,
   trabajadores:8,
   zonas:[
     {id:201, nombre:'Escenario', emoji:'🎬', mesas:3, pax:80, activa:true},
     {id:202, nombre:'Barra',     emoji:'🍺', mesas:5, pax:15, activa:true},
     {id:203, nombre:'VIP',       emoji:'💫', mesas:4, pax:16, activa:true},
   ]
  },
];

var nextZonaId = 300;
var editingZonaId = null;
var selectedEmoji = '☀️';

var ZONA_EMOJIS = [
  '☀️','🌙','🌿','🌊','🏡','🚪','🍷','🍺','🎭','🎪',
  '🪑','🛋️','🌺','⛱️','🔥','💫','🎵','🏮','🕯️','🌸',
  '🍃','🏛️','🎨','🌴','🍾','✨','🎬','🎩',
];

/* ══════════════════════════════
   LOGIN / LOGOUT
══════════════════════════════ */
/* ── CLAVE localStorage (mock dev) ──
   TODO: con Supabase, persistSession:true lo gestiona automáticamente.
   Eliminar toda la lógica de localStorage de esta sección cuando se migre. */
var LS_KEY = 'ag_session';

function applySession(profile, remember){
  currentUser = {
    nombre:   profile.nombre,
    initials: profile.initials,
    rol:      profile.rol,
    localId:  profile.localId,
    _sbId:    profile._sbId   || null,
    tel:      profile.tel     || '',
    email:    profile.email   || '',
    foto_url: profile.foto_url || null,
    visible:  profile.visible !== false,
  };

  var avatarBtn = document.getElementById('header-avatar');
  var saBtn     = document.getElementById('header-sa');
  avatarBtn.textContent = currentUser.initials;
  /* Superadmin: muestra botón LG gestión + oculta perfil */
  if(currentUser.rol === 'superadmin'){
    if(saBtn)     saBtn.style.display = '';
    if(avatarBtn) avatarBtn.style.display = 'none';
  } else {
    if(saBtn)     saBtn.style.display = 'none';
    if(avatarBtn) avatarBtn.style.display = '';
  }

  /* Acceso para sub-módulos (iframes) — siempre disponible mientras dure la pestaña */
  try{ localStorage.setItem('lg_session', JSON.stringify(currentUser)); }catch(e){}
  /* Restaurar shell al recargar — solo si el toggle "Recordar" estaba activo */
  if(remember){ try{ localStorage.setItem(LS_KEY, JSON.stringify(currentUser)); }catch(e){} }
  /* Load local config from Supabase */
  sbLoadLocal();
  var canSeeInicio = (currentUser.rol === 'admin' || currentUser.rol === 'encargado');
  document.getElementById('bnav-inicio').style.display = canSeeInicio ? '' : 'none';

  var canSeeAdmin = (currentUser.rol === 'admin' || currentUser.rol === 'superadmin');
  document.getElementById('bnav-admin').style.display = canSeeAdmin ? '' : 'none';
  if (canSeeAdmin && !document.getElementById('fr-admin')) {
    var frAdmin = document.createElement('iframe');
    frAdmin.id = 'fr-admin';
    frAdmin.src = 'lagaleria_admin.html';
    frAdmin.loading = 'lazy';
    document.getElementById('pages').appendChild(frAdmin);
  }

  var defaultPage = canSeeInicio ? 'inicio' : 'turnos';
  goTo(defaultPage);

  var ls  = document.getElementById('login-screen');
  var app = document.getElementById('app');
  ls.classList.add('hide');
  app.classList.add('show');
  setTimeout(function(){ ls.style.display='none'; }, 350);
  setTimeout(function(){ onboarding_check(); }, 400);
}

/* auto-login — se ejecuta desde ls_init (DOMContentLoaded), no antes */

function doLogout(){
  /* limpiar sesión guardada */
  try{ localStorage.removeItem(LS_KEY); }catch(e){}
  try{ localStorage.removeItem('lg_session'); }catch(e){}
  /* TODO: await supabase.auth.signOut() */
  currentUser = null;
  closeAll();
  var ls  = document.getElementById('login-screen');
  var app = document.getElementById('app');
  ls.style.display = 'flex';
  ls.style.opacity = '0';
  app.classList.remove('show');
  setTimeout(function(){ ls.classList.remove('hide'); ls.style.opacity = ''; ls_show('ls-tel'); }, 50);
}

/* ══════════════════════════════
   OFFLINE DETECTION
   TODO (Antigravity React): implementar last-write-wins con
   localStorage como buffer y cola de sync al reconectar.
   Por ahora: solo aviso visual, sin persistencia offline.
══════════════════════════════ */
function updateOnlineStatus(){
  var banner = document.getElementById('offline-banner');
  if(!banner) return;
  if(navigator.onLine){
    banner.style.display = 'none';
  } else {
    banner.style.display = 'block';
    toast('Sin conexión — los cambios no se guardarán');
  }
}
window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

/* Permitir Enter en el formulario de login */
document.addEventListener('keydown', function(e){
  if(e.key === 'Enter'){
    var ls = document.getElementById('login-screen');
    if(ls && ls.style.display !== 'none' && !ls.classList.contains('hide')){
      doLogin();
    }
  }
});


/* ══════════════════════════════
   NAVEGACIÓN
══════════════════════════════ */
var PAGES = ['inicio','turnos','reservas','stock','admin'];

function goTo(page){
  PAGES.forEach(function(p){
    var fr = document.getElementById('fr-'+p);
    var bn = document.getElementById('bnav-'+p);
    if(fr) fr.classList.remove('active');
    if(bn) bn.classList.remove('active');
    try{ if(fr && fr.contentWindow && fr.contentWindow.DatePicker) fr.contentWindow.DatePicker.close(); }catch(e){}
  });
  var fr = document.getElementById('fr-'+page);
  var bn = document.getElementById('bnav-'+page);
  if(fr) fr.classList.add('active');
  if(bn) bn.classList.add('active');
  try{ if(fr && fr.contentWindow && fr.contentWindow.resetView) fr.contentWindow.resetView(); }catch(e){}
}

var _hsiDimTimer = null;
function setHeaderSaveState(state){
  var el = document.getElementById('header-save-ind');
  if(!el) return;
  el.classList.remove('saving','saved','save-err');
  clearTimeout(_hsiDimTimer);
  if(state === 'saving'){
    el.classList.add('saving');
    el.title = 'Guardando cambios automáticamente';
  } else if(state === 'saved'){
    el.classList.add('saved');
    el.title = 'Cambios guardados';
    _hsiDimTimer = setTimeout(function(){ el.classList.remove('saved'); }, 3000);
  } else if(state === 'error'){
    el.classList.add('save-err');
    el.title = 'Error al guardar — revisa la conexión';
  } else {
    el.title = 'Guardado automático';
  }
}

function goToAndClose(page){
  goTo(page);
  closeAll();
}


/* ══════════════════════════════
   PERFIL SHEET
══════════════════════════════ */
function openProfile(){
  var local = getActiveLocal();
  document.getElementById('prf-name').textContent  = currentUser.name;
  document.getElementById('prf-badge').textContent = rolLabel(currentUser.rol);
  document.getElementById('prf-local').textContent = local.nombre;
  document.getElementById('profile-sheet').classList.add('show');
  document.getElementById('overlay').classList.add('show');
}

function rolLabel(rol){
  return {admin:'⭐ Admin', encargado:'🔑 Encargado', empleado:'👤 Empleado'}[rol] || rol;
}


/* ══════════════════════════════
   CERRAR TODO
══════════════════════════════ */
function closeAll(){
  document.getElementById('profile-sheet').classList.remove('show');
  document.getElementById('overlay').classList.remove('show');
  /* cerrar modales secundarios */
  document.querySelectorAll('.modal-overlay.show').forEach(function(m){
    m.classList.remove('show');
  });
}


/* ══════════════════════════════
   ZONAS
══════════════════════════════ */
function openZonasFromAdmin(){
  renderZon();
  var local = getActiveLocal();
  var sub = document.getElementById('zona-list-sub');
  if(sub) sub.textContent = (local.zonas||[]).length + ' zonas · ' + local.nombre.split(' ')[0];
  showModal('ov-zona-list');
}
function closeZonasPanel(){ closeModal('ov-zona-list'); }

function renderZon(){
  var zonas = (getActiveLocal().zonas || []);
  var html = zonas.map(function(z){
    var inactiva = z.activa === false;
    return '<div style="background:var(--surf);border:1px solid var(--brd);border-radius:10px;padding:12px 14px;margin:0 14px 8px;display:flex;align-items:center;gap:10px;cursor:pointer;opacity:'+(inactiva?.5:1)+'" onclick="openEditZona('+z.id+')">'
      +'<span style="font-size:20px">'+z.emoji+'</span>'
      +'<div style="flex:1">'
        +'<div style="display:flex;align-items:center;gap:7px">'
          +'<span style="font-size:13px;font-weight:700;color:var(--txt)">'+z.nombre+'</span>'
          +(inactiva?'<span style="font-size:9px;font-weight:700;background:var(--red-bg);border:1px solid var(--red-bd);color:var(--red);border-radius:4px;padding:1px 6px">INACTIVA</span>':'')
        +'</div>'
        +'<div style="font-size:11px;color:var(--dim)">'+z.mesas+' mesas'+(z.pax?' · '+z.pax+' personas':'')+'</div>'
      +'</div>'
      +'<span style="color:var(--faint);font-size:18px">›</span>'
    +'</div>';
  }).join('');
  var listModal = document.getElementById('zon-list-modal');
  if(listModal) listModal.innerHTML = html;
}

function openNewZona(){
  editingZonaId = null;
  document.getElementById('zona-title').textContent = 'Nueva zona';
  document.getElementById('btn-del-zona').style.display = 'none';
  document.getElementById('del-zona-confirm-row').style.display = 'none';
  document.getElementById('z-nombre').value = '';
  document.getElementById('z-mesas').value = '';
  document.getElementById('z-pax').value = '';
  document.getElementById('z-activa').checked = true;
  renderEmojiGrid('☀️');
  showModal('ov-zona');
}

function openEditZona(id){
  var z = (getActiveLocal().zonas||[]).find(function(x){ return x.id===id; });
  if(!z) return;
  editingZonaId = id;
  document.getElementById('zona-title').textContent = 'Editar zona';
  document.getElementById('btn-del-zona').style.display = 'block';
  document.getElementById('del-zona-confirm-row').style.display = 'none';
  document.getElementById('z-nombre').value = z.nombre;
  document.getElementById('z-mesas').value = z.mesas;
  document.getElementById('z-pax').value = z.pax || '';
  document.getElementById('z-activa').checked = z.activa !== false;
  renderEmojiGrid(z.emoji);
  showModal('ov-zona');
}

function saveZona(){
  var nombre = document.getElementById('z-nombre').value.trim();
  if(!nombre){ toast('Introduce un nombre'); return; }
  var data = {
    nombre: nombre,
    emoji: selectedEmoji || '📍',
    mesas: parseInt(document.getElementById('z-mesas').value) || 1,
    pax: parseInt(document.getElementById('z-pax').value) || null,
    activa: document.getElementById('z-activa').checked,
  };
  var local = getActiveLocal();
  if(editingZonaId){
    var z = local.zonas.find(function(x){ return x.id===editingZonaId; });
    if(z) Object.assign(z, data);
  } else {
    local.zonas.push(Object.assign({id: ++nextZonaId}, data));
  }
  closeModal('ov-zona');
  renderZon();
  toast('Zona guardada ✓');
}

function delZona(){
  document.getElementById('btn-del-zona').style.display = 'none';
  document.getElementById('del-zona-confirm-row').style.display = 'block';
}
function confirmDelZona(){
  if(!editingZonaId) return;
  var local = getActiveLocal();
  local.zonas = local.zonas.filter(function(x){ return x.id !== editingZonaId; });
  closeModal('ov-zona');
  renderZon();
  toast('Zona eliminada');
}
function cancelDelZona(){
  document.getElementById('btn-del-zona').style.display = 'block';
  document.getElementById('del-zona-confirm-row').style.display = 'none';
}

function renderEmojiGrid(current){
  selectedEmoji = current || ZONA_EMOJIS[0];
  document.getElementById('z-emoji').value = selectedEmoji;
  var grid = document.getElementById('emoji-grid');
  if(!grid) return;
  grid.innerHTML = ZONA_EMOJIS.map(function(e){
    return '<div class="emoji-opt'+(e===selectedEmoji?' act':'')+'" onclick="pickEmoji(\''+e+'\',this)">'+e+'</div>';
  }).join('');
}
function pickEmoji(e, el){
  selectedEmoji = e;
  document.querySelectorAll('#emoji-grid .emoji-opt').forEach(function(x){ x.classList.remove('act'); });
  el.classList.add('act');
}
function toggleEmojiGrid(){
  var wrap = document.getElementById('emoji-grid-wrap');
  var lbl  = document.getElementById('emoji-expand-lbl');
  var chev = document.getElementById('emoji-chevron');
  var expanded = wrap.classList.toggle('expanded');
  wrap.classList.toggle('collapsed', !expanded);
  lbl.textContent  = expanded ? 'Ver menos' : 'Ver más iconos';
  chev.style.transform = expanded ? 'rotate(180deg)' : '';
}



/* ══ MI PERFIL ══ */
var _prf_dirtyFields = {};
function prf_openModal(){
  _prf_dirtyFields = {};
  var u=currentUser||{};
  var isAdmin=u.rol==='admin';
  var nameEl=document.getElementById('prf-mp-name');
  var emailEl=document.getElementById('prf-mp-email');
  var telEl=document.getElementById('prf-mp-tel');
  var rolEl=document.getElementById('prf-mp-rol');
  var initEl=document.getElementById('prf-mp-initials');
  var nameBtn=document.getElementById('prf-mp-name-btn');
  var nameField=document.getElementById('prf-name-field');
  if(nameEl){nameEl.value=u.nombre||'';nameEl.readOnly=!isAdmin;
    if(isAdmin)nameEl.oninput=function(){_prf_dirtyFields.nombre=true;prf_markDirty(true);};}
  if(emailEl){emailEl.value=u.email||'';emailEl.readOnly=false;
    emailEl.oninput=function(){_prf_dirtyFields.email=true;prf_markDirty(true);};}
  if(telEl){telEl.value=u.tel||'';
    telEl.oninput=function(){_prf_dirtyFields.tel=true;prf_markDirty(true);};}
  if(rolEl)rolEl.textContent=typeof rolLabel==='function'?rolLabel(u.rol):(u.rol||'');
  if(initEl){var p=(u.nombre||'').split(' ');initEl.textContent=p.length>1?(p[0][0]+p[1][0]).toUpperCase():(u.nombre||'?')[0].toUpperCase();}
  if(nameBtn)nameBtn.style.display=isAdmin?'':'none';
  if(nameField)nameField.classList.toggle('prf-mp-field-ro',!isAdmin);
  var visField=document.getElementById('prf-mp-visible-field');
  var visChk=document.getElementById('prf-mp-visible');
  var visHint=document.getElementById('prf-mp-visible-hint');
  if(visField){
    visField.style.display=isAdmin?'':'none';
    if(isAdmin&&visChk){
      visChk.checked=u.visible!==false;
      if(u._sbId){
        visChk.disabled=false;
        if(visHint)visHint.textContent='Aparece en Admin/Trabajadores y puede recibir turnos';
      }else{
        visChk.disabled=true;
        if(visHint)visHint.textContent='No disponible para esta cuenta';
      }
    }
  }
  var saved=u.foto_url||(u.email?localStorage.getItem('prf_photo_'+u.email):null);
  prf_setPhoto(saved||null);
  prf_markDirty(false);
  showModal('ov-miperfil');
}
function prf_markDirty(dirty){var btn=document.getElementById('prf-mp-save');if(btn)btn.classList.toggle('dirty',dirty);}
function prf_focusField(id){var el=document.getElementById(id);if(el){el.focus();el.select&&el.select();}}
function prf_setPhoto(dataUrl){
  var img=document.getElementById('prf-mp-img');
  var init=document.getElementById('prf-mp-initials');
  var delBtn=document.getElementById('prf-mp-del-photo-btn');
  if(!img||!init) return;
  if(dataUrl){
    img.src=dataUrl; img.style.display=''; init.style.display='none';
    if(delBtn) delBtn.style.display='';
  } else {
    img.style.display='none'; init.style.display='';
    if(delBtn) delBtn.style.display='none';
  }
}
function _prf_dataUrlToBlob(dataUrl){
  var arr=dataUrl.split(','),mime=arr[0].match(/:(.*?);/)[1];
  var bstr=atob(arr[1]),n=bstr.length,u8=new Uint8Array(n);
  while(n--)u8[n]=bstr.charCodeAt(n);
  return new Blob([u8],{type:mime});
}
function _prf_syncSession(){
  var s=JSON.stringify(currentUser);
  try{localStorage.setItem('lg_session',s);}catch(ex){}
  try{if(localStorage.getItem(LS_KEY))localStorage.setItem(LS_KEY,s);}catch(ex){}
}
async function prf_deletePhoto(){
  prf_setPhoto(null);
  try{ localStorage.removeItem('prf_photo_'+(currentUser&&currentUser.email||'')); }catch(e){}
  if(currentUser&&currentUser._sbId&&_sb){
    try{
      var res=await _sb.from('trabajadores').update({foto_url:null}).eq('id',currentUser._sbId);
      if(res.error)throw res.error;
      currentUser.foto_url=null;
      _prf_syncSession();
    }catch(e){
      toast('Error al quitar foto: '+(e.message||String(e)));
    }
  }
}
function prf_triggerPhoto(){
  var input=document.getElementById('prf-photo-input');if(!input)return;
  input.onchange=function(){
    var file=input.files[0];if(!file)return;
    var reader=new FileReader();
    reader.onload=function(e){prf_setPhoto(e.target.result);_prf_dirtyFields.foto=true;prf_markDirty(true);};
    reader.readAsDataURL(file);input.value='';
  };
  input.click();
}
async function prf_saveProfile(){
  var name=(document.getElementById('prf-mp-name').value||'').trim();
  var tel=(document.getElementById('prf-mp-tel').value||'').trim();
  var email=(document.getElementById('prf-mp-email').value||'').trim();
  if(_prf_dirtyFields.nombre&&!name){toast('El nombre no puede estar vacío');return;}
  var payload={};
  if(_prf_dirtyFields.nombre) payload.nombre=name;
  if(_prf_dirtyFields.tel) payload.tel=tel||null;
  var hasFoto=!!_prf_dirtyFields.foto;
  if(!Object.keys(payload).length&&!hasFoto){closeModal('ov-miperfil');return;}
  var saveBtn=document.getElementById('prf-mp-save');
  if(saveBtn)saveBtn.disabled=true;
  if(currentUser._sbId&&_sb){
    if(Object.keys(payload).length){
      try{
        var res=await _sb.from('trabajadores').update(payload).eq('id',currentUser._sbId);
        if(res.error)throw res.error;
      }catch(e){
        toast('Error al guardar: '+(e.message||String(e)));
        if(saveBtn)saveBtn.disabled=false;
        return;
      }
    }
    if(hasFoto){
      var img=document.getElementById('prf-mp-img');
      if(img&&img.src&&img.style.display!=='none'&&img.src.startsWith('data:')){
        try{
          var blob=_prf_dataUrlToBlob(img.src);
          var ext=blob.type==='image/png'?'png':'jpg';
          var path=currentUser._sbId+'.'+ext;
          var upRes=await _sb.storage.from('avatares').upload(path,blob,{upsert:true,contentType:blob.type});
          if(upRes.error)throw upRes.error;
          var urlRes=_sb.storage.from('avatares').getPublicUrl(path);
          var photoUrl=urlRes.data&&urlRes.data.publicUrl?urlRes.data.publicUrl+'?t='+Date.now():null;
          if(photoUrl){
            await _sb.from('trabajadores').update({foto_url:photoUrl}).eq('id',currentUser._sbId);
            currentUser.foto_url=photoUrl;
          }
        }catch(photoErr){
          toast('Foto no guardada: '+(photoErr.message||String(photoErr)));
        }
      }
    }
  }
  if(saveBtn)saveBtn.disabled=false;
  if(_prf_dirtyFields.nombre){
    currentUser.nombre=name;
    var parts=name.split(' ');
    currentUser.initials=parts.length>1?(parts[0][0]+parts[1][0]).toUpperCase():name[0].toUpperCase();
  }
  if(_prf_dirtyFields.tel) currentUser.tel=tel;
  if(_prf_dirtyFields.email) currentUser.email=email;
  _prf_dirtyFields={};
  _prf_syncSession();
  var av=document.getElementById('header-avatar');if(av)av.textContent=currentUser.initials;
  prf_markDirty(false);
  closeModal('ov-miperfil');
  toast('Perfil actualizado ✓');
}

/* ── Toggle "Visible en panel de trabajadores" — guardado inmediato, igual que disponible ── */
async function toggleMiVisibilidad(el){
  if(!currentUser||!currentUser._sbId||!_sb){ el.checked=!el.checked; return; }
  var val=!!el.checked;
  var prev=currentUser.visible;
  currentUser.visible=val;
  _prf_syncSession();
  try{
    var res=await _sb.from('trabajadores').update({visible:val}).eq('id',currentUser._sbId);
    if(res.error)throw res.error;
    toast(val?'Ahora eres visible en el panel de trabajadores':'Ya no eres visible en el panel de trabajadores');
    try{
      var frAdmin=document.getElementById('fr-admin');
      if(frAdmin&&frAdmin.contentWindow&&typeof frAdmin.contentWindow._syncTrab==='function') frAdmin.contentWindow._syncTrab();
    }catch(e){}
    try{
      var frTurnos=document.getElementById('fr-turnos');
      if(frTurnos&&frTurnos.contentWindow&&typeof frTurnos.contentWindow.sbInitTrabajadores==='function') frTurnos.contentWindow.sbInitTrabajadores();
    }catch(e){}
  }catch(e){
    el.checked=prev!==false;
    currentUser.visible=prev;
    _prf_syncSession();
    toast('Error al guardar: '+(e.message||String(e)));
  }
}

/* ══ NOTIFICACIONES ══ */
var NOTIF_DEFAULTS={notif_reserva_nueva:true,notif_reserva_cambio:true,notif_stock_minimos:true,notif_stock_critico:true,notif_turno_nuevo:true,notif_turno_cambio:true,notif_evento_nuevo:true};
function notif_openModal(){
  var rol=(currentUser||{}).rol||'empleado';
  var prefs=notif_loadPrefs();
  document.querySelectorAll('#ov-notif .notif-row').forEach(function(row){
    var key=row.getAttribute('data-key');
    var roles=(row.getAttribute('data-roles')||'').split(',');
    var allowed=roles.indexOf(rol)>=0;
    var cb=row.querySelector('input[type="checkbox"]');
    row.classList.toggle('locked',!allowed);
    if(cb){cb.checked=allowed?(prefs[key]!==undefined?prefs[key]:NOTIF_DEFAULTS[key]):false;cb.disabled=!allowed;}
  });
  showModal('ov-notif');
}
function notif_save(cb){var row=cb.closest('.notif-row');var key=row?row.getAttribute('data-key'):null;if(!key)return;var prefs=notif_loadPrefs();prefs[key]=cb.checked;notif_savePrefs(prefs);}
function notif_loadPrefs(){try{var u=currentUser||{};var k='notif_prefs_'+(u.email||u.rol||'user');var raw=localStorage.getItem(k);if(raw&&raw!=='undefined')return JSON.parse(raw);}catch(e){}return{};}
function notif_savePrefs(prefs){try{var u=currentUser||{};localStorage.setItem('notif_prefs_'+(u.email||u.rol||'user'),JSON.stringify(prefs));}catch(e){}}


/* ══ SUPERADMIN PANEL ══ */
function openSuperadminPanel(){
  sa_renderLocales();
  showModal('ov-superadmin');
}

function sa_renderLocales(){
  var list = document.getElementById('sa-locales-list');
  if(!list) return;
  var locs = typeof locales !== 'undefined' ? locales : [];
  if(!locs.length){
    list.innerHTML = '<div style="padding:8px 18px;font-size:12px;color:var(--dim)">Sin locales configurados</div>';
    return;
  }
  list.innerHTML = locs.map(function(l){
    var active = l.activo !== false;
    return '<div class="prf-row" style="padding:12px 18px;border-bottom:1px solid var(--brd);cursor:pointer" onclick="sa_editLocal('+l.id+')">'
      + '<div style="width:36px;height:36px;border-radius:9px;background:'+l.color+';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:'+(l.acc||'#C5A669')+';flex-shrink:0">'
      + (l.initials||'LG') + '</div>'
      + '<div style="flex:1;margin-left:12px;min-width:0">'
      + '<div style="font-size:13px;font-weight:600;color:var(--txt)">' + l.nombre + '</div>'
      + '<div style="font-size:11px;color:var(--dim);margin-top:2px">' + (l.trabajadores||0) + ' trabajadores · ' + (active ? '<span style="color:#68d391">Activo</span>' : '<span style="color:#fc8181">Inactivo</span>') + '</div>'
      + '</div>'
      + '<span style="color:var(--dim);font-size:18px">›</span>'
      + '</div>';
  }).join('');
}

function sa_editLocal(id){
  /* TODO: abrir modal edición de local */
  toast('Edición de local — próximamente');
}
function sa_newLocal(){
  /* TODO: abrir modal nuevo local */
  toast('Nuevo local — próximamente');
}
function sa_clearCache(){
  try{
    var keys = Object.keys(localStorage).filter(function(k){ return k.startsWith('lg_'); });
    keys.forEach(function(k){ localStorage.removeItem(k); });
    toast('Caché limpiada ('+keys.length+' claves)');
  }catch(e){ toast('Error al limpiar caché'); }
}



/* ══ AJUSTES ══ */
var AJ_DEFAULTS = { aj_sound:true, aj_vibration_notif:true, aj_vibration_tap:false };
var AJ_KEY = 'aj_prefs';

function ajustes_openModal(){
  var prefs = aj_loadPrefs();
  /* Theme */
  var theme = prefs.theme || 'dark';
  document.querySelectorAll('.aj-theme-btn').forEach(function(btn){
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
  /* Toggles */
  ['aj_sound','aj_vibration_notif','aj_vibration_tap'].forEach(function(key){
    var el = document.getElementById(key.replace(/_/g,'-').replace('aj-','aj-'));
    /* find by id */
    var elId = key === 'aj_sound' ? 'aj-sound'
             : key === 'aj_vibration_notif' ? 'aj-vibration-notif'
             : 'aj-vibration-tap';
    var cb = document.getElementById(elId);
    if(cb) cb.checked = prefs[key] !== undefined ? prefs[key] : AJ_DEFAULTS[key];
  });
  showModal('ov-ajustes');
}

function aj_setTheme(theme){
  var prefs = aj_loadPrefs();
  prefs.theme = theme;
  aj_savePrefs(prefs);
  /* Update active button */
  document.querySelectorAll('.aj-theme-btn').forEach(function(btn){
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
  /* Apply theme — light is TODO, dark is default */
  if(theme === 'light'){
    toast('Tema claro — próximamente');
  } else {
    /* dark / system → keep current */
    document.body.removeAttribute('data-theme');
  }
}

function aj_save(key, value){
  var prefs = aj_loadPrefs();
  prefs[key] = value;
  aj_savePrefs(prefs);
  /* Apply immediately */
  if(key === 'aj_vibration_tap' && value && navigator.vibrate){
    navigator.vibrate(30);
  }
}

function aj_loadPrefs(){
  try{
    var raw = localStorage.getItem(AJ_KEY);
    if(raw && raw !== 'undefined') return JSON.parse(raw);
  }catch(e){}
  return {};
}
function aj_savePrefs(prefs){
  try{ localStorage.setItem(AJ_KEY, JSON.stringify(prefs)); }catch(e){}
}

/* Apply vibration on tap if enabled */
document.addEventListener('click', function(){
  try{
    var prefs = aj_loadPrefs();
    if(prefs.aj_vibration_tap && navigator.vibrate) navigator.vibrate(10);
  }catch(e){}
});
/* ══ PIN LOGIN ══ */
var _pin = '';
var PIN_LEN = 4;

function pin_onTelInput(){
  /* Reset PIN when tel changes */
  _pin = '';
  pin_render();
}

function pin_press(digit){
  if(_pin.length >= PIN_LEN) return;
  _pin += digit;
  pin_render();
  if(_pin.length === PIN_LEN) pin_submit();
}

function pin_del(){
  _pin = _pin.slice(0, -1);
  pin_render();
}

function pin_render(){
  for(var i=0;i<PIN_LEN;i++){
    var dot = document.getElementById('pd'+i);
    if(dot){
      dot.classList.toggle('filled', i < _pin.length);
      dot.classList.remove('error');
    }
  }
}

function pin_error(){
  for(var i=0;i<PIN_LEN;i++){
    var dot = document.getElementById('pd'+i);
    if(dot) dot.classList.add('error');
  }
  setTimeout(function(){
    _pin = '';
    pin_render();
  }, 600);
}

function pin_forgot(){
  var emailEl = document.getElementById('forgot-email');
  if(emailEl) emailEl.value = '';
  showModal('ov-forgot-pin');
}

function forgot_send(){
  var email = (document.getElementById('forgot-email').value||'').trim();
  if(!email || !email.includes('@')){
    document.getElementById('forgot-email').focus();
    return;
  }
  /* TODO: supabase.auth.resetPasswordForEmail(email) */
  closeModal('ov-forgot-pin');
  toast('\u2709\ufe0f Enlace enviado a ' + email);
}

function forgot_whatsapp(){
  /* TODO: SELECT tel FROM profiles WHERE rol='admin' AND local_id=currentUser.localId */
  var adminTel = '34656187336';
  var nombre = currentUser && currentUser.nombre ? currentUser.nombre : 'Un trabajador';
  var msg = encodeURIComponent('Hola, soy ' + nombre + '. He olvidado mi PIN y necesito que me lo resetees. Gracias');
  window.open('https://wa.me/' + adminTel + '?text=' + msg, '_blank');
}

function doLogin(){
  /* Legacy — redirige a pin_submit */
  pin_submit();
}

/* ══ LOGIN STEPS ══ */
function ls_init(){
  /* Restaurar sesión guardada — DOM ya está listo aquí */
  try{
    var saved = localStorage.getItem(LS_KEY);
    if(saved){
      var cached = JSON.parse(saved);
      /* Mostrar spinner mientras se verifica con Supabase */
      var ring = document.getElementById('ls-loading-ring');
      if(ring) ring.style.display = '';
      ls_refreshAndApply(cached);
      return;
    }
  }catch(e){}
  /* Sin sesión — mostrar login normal */
  try{
    var savedTel=localStorage.getItem('lg_saved_tel');
    if(savedTel){ var el=document.getElementById('l-tel'); if(el){ el.value=savedTel; ls_onTelInput(el); } }
  }catch(e){}
  setTimeout(function(){ ls_show('ls-tel'); }, 1500);
}
async function ls_refreshAndApply(cached){
  var ring = document.getElementById('ls-loading-ring');
  function hideRing(){ if(ring) ring.style.display = 'none'; }
  var sbId = cached && cached._sbId;
  if(!sbId || !_sb){ hideRing(); applySession(cached); return; }
  try{
    var result = await Promise.race([
      _sb.from('trabajadores')
        .select('id, nombre, seccion, tel, prioridad, foto_url, visible')
        .eq('id', sbId)
        .maybeSingle(),
      new Promise(function(resolve){
        setTimeout(function(){ resolve({data:null,error:{message:'timeout'}}); }, 5000);
      })
    ]);
    hideRing();
    if(result.error || !result.data){
      toast('Sin conexión — usando datos de la última sesión');
      applySession(cached);
      return;
    }
    var d = result.data;
    var fresh = {
      nombre:   d.nombre,
      initials: d.nombre.split(' ').map(function(n){return n[0];}).join('').toUpperCase().slice(0,2),
      rol:      cached.rol      || 'empleado',
      localId:  cached.localId  || LOCAL_ID,
      _sbId:    d.id,
      tel:      d.tel      || '',
      email:    cached.email || '',
      foto_url: d.foto_url || null,
      visible:  d.visible  !== false,
    };
    applySession(fresh);
  }catch(e){
    hideRing();
    toast('Sin conexión — usando datos de la última sesión');
    applySession(cached);
  }
}
function ls_show(id){
  ['ls-splash','ls-tel','ls-pin'].forEach(function(s){
    var el=document.getElementById(s);
    if(el) el.style.display=s===id?'':'none';
  });
}
function ls_onTelInput(input){
  var val=input.value.trim();
  var btn=document.getElementById('ls-tel-btn');
  if(btn){ btn.style.opacity=val.length>=4?'1':'.4'; btn.style.pointerEvents=val.length>=4?'':'none'; }
  _pin=''; pin_render();
}
function ls_goPin(){
  var tel=(document.getElementById('l-tel').value||'').trim();
  if(!tel) return;
  var disp=document.getElementById('ls-tel-display');
  if(disp) disp.textContent=tel;
  _pin=''; pin_render();
  ls_show('ls-pin');
}
function ls_back(){ _pin=''; pin_render(); ls_show('ls-tel'); }

function pin_submit(){
  var tel=(document.getElementById('l-tel').value||'').trim().replace(/\s/g,'');
  if(!tel){ ls_show('ls-tel'); return; }

  /* Acceso de prueba: solo si el campo tel es exactamente una palabra clave de dev */
  var DEV_KEYS = ['admin','superadmin','encargado','trabajador'];
  if(DEV_KEYS.indexOf(tel) !== -1){
    var profile = MOCK_PROFILES[tel]||null;
    if(!profile||_pin!=='1234'){ pin_error(); return; }
    var remember = document.getElementById('l-remember').checked;
    if(remember){ try{ localStorage.setItem('lg_saved_tel',tel); }catch(e){} }
    applySession(profile, remember);
    return;
  }

  /* Número de teléfono real — solo Supabase, sin fallback mock */
  sbVerifyLogin(tel, _pin).then(function(profile){
    if(!profile){ pin_error(); return; }
    var remember = document.getElementById('l-remember').checked;
    if(remember){ try{ localStorage.setItem('lg_saved_tel',tel); }catch(e){} }
    applySession(profile, remember);
  }).catch(function(){
    pin_error();
    toast('Sin conexión — inténtalo de nuevo');
  });
}

document.addEventListener('DOMContentLoaded', ls_init);


/* ══ ONBOARDING PRIMER ACCESO ══ */
var OB_KEY = 'lg_onboarding_done';
var _obStep = 1;
var _newPin = '';
var _newPinConfirm = '';
var _confirmingPin = false;

function onboarding_check(){
  var u = currentUser;
  if(!u) return;
  if(u.rol === 'superadmin' || u.rol === 'admin') return;
  var nombre = u.nombre ? u.nombre.split(' ')[0] : 'bienvenido';
  var nombreEl = document.getElementById('ob-nombre');
  if(nombreEl) nombreEl.textContent = nombre;
  try{
    var done = localStorage.getItem(OB_KEY+'_'+(u.initials||u.rol));
    if(done === 'true') return;
  }catch(e){}
  _obStep = 1;
  ob_showStep(1);
  showModal('ov-onboarding');
}

function ob_showStep(step){
  _obStep = step;
  [1,2,3,4].forEach(function(s){
    var el = document.getElementById('ob-step-'+s);
    if(el) el.style.display = s===step ? '' : 'none';
  });
  [1,2,3,4].forEach(function(s){
    var dot = document.getElementById('ob-dot-'+s);
    if(dot) dot.classList.toggle('active', s<=step);
  });
}

function ob_next(){
  if(_obStep===1){ _newPin=''; _confirmingPin=false; ob_pinRender(); ob_showStep(2); }
  else if(_obStep===3){ ob_showStep(4); }
}

function ob_pinPress(digit){
  if(!_confirmingPin){
    if(_newPin.length>=4) return;
    _newPin += digit; ob_pinRender();
    if(_newPin.length===4){
      _confirmingPin=true; _newPinConfirm=''; ob_pinRender();
      var lbl=document.getElementById('ob-pin-label');
      if(lbl) lbl.textContent='Confirma tu nuevo PIN';
    }
  } else {
    if(_newPinConfirm.length>=4) return;
    _newPinConfirm += digit; ob_pinRender();
    if(_newPinConfirm.length===4){
      if(_newPinConfirm===_newPin){
        try{ localStorage.setItem('lg_pin_'+(currentUser.initials||currentUser.rol),_newPin); }catch(e){}
        var lbl=document.getElementById('ob-pin-label');
        if(lbl) lbl.textContent='Elige tu nuevo PIN';
        ob_showStep(3);
      } else { ob_pinError(); }
    }
  }
}

function ob_pinDel(){
  if(!_confirmingPin) _newPin=_newPin.slice(0,-1);
  else _newPinConfirm=_newPinConfirm.slice(0,-1);
  ob_pinRender();
}

function ob_pinRender(){
  var len=_confirmingPin?_newPinConfirm.length:_newPin.length;
  for(var i=0;i<4;i++){
    var dot=document.getElementById('ob-pdot-'+i);
    if(dot){ dot.classList.toggle('filled',i<len); dot.classList.remove('error'); }
  }
}

function ob_pinError(){
  for(var i=0;i<4;i++){
    var dot=document.getElementById('ob-pdot-'+i);
    if(dot) dot.classList.add('error');
  }
  setTimeout(function(){
    _newPinConfirm='';
    var lbl=document.getElementById('ob-pin-label');
    if(lbl) lbl.textContent='Los PINs no coinciden — inténtalo de nuevo';
    ob_pinRender();
  }, 600);
}

function ob_sendEmail(){
  var email=(document.getElementById('ob-email').value||'').trim();
  if(!email||!email.includes('@')){
    var el=document.getElementById('ob-email');
    if(el) el.style.borderColor='var(--red,#fc8181)'; return;
  }
  /* TODO: supabase.auth.updateUser({ email }) */
  var sentEl=document.getElementById('ob-email-sent');
  if(sentEl){ sentEl.textContent='Email enviado a '+email; }
  var checkEl=document.getElementById('ob-email-check');
  if(checkEl) checkEl.textContent='\u2705 Email a\u00f1adido — revisa tu correo para verificarlo';
  ob_showStep(4);
}

function ob_skipEmail(){ ob_showStep(4); }

function ob_finish(){
  try{ localStorage.setItem(OB_KEY+'_'+(currentUser.initials||currentUser.rol),'true'); }catch(e){}
  closeModal('ov-onboarding');
}


/* ══ INVITE LINK ══ */
function inv_sendWhatsApp(workerName, workerTel){
  /* Mock invite link — in production: Supabase magic link or deep link */
  var appUrl = window.location.origin + window.location.pathname;
  var token  = btoa(workerName + ':' + Date.now()); /* mock token */
  var link   = appUrl + '?invite=' + token;
  var msg    = encodeURIComponent(
    'Hola ' + workerName + '! Te invitamos a La Galer\u00eda. ' +
    'Entra con tu n\u00famero de tel\u00e9fono y el PIN temporal: 1234. ' +
    'Accede aqu\u00ed: ' + link
  );
  var tel = (workerTel||'').replace(/[^\d]/g,'');
  if(tel && tel.length > 6){
    window.open('https://wa.me/34'+tel+'?text='+msg,'_blank');
  } else {
    /* Copy link to clipboard */
    navigator.clipboard && navigator.clipboard.writeText(link);
    toast('\uD83D\uDD17 Enlace copiado al portapapeles');
  }
}
