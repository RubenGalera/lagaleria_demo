/* index.html — shell de la app (login, navegación entre iframes, perfil, notificaciones).
   Depende de globals cargados antes: _sb/LOCAL_ID (supabase-client.js), toast/showModal/closeModal/stepField/formatDateLabel (ui-helpers.js), MOCK_PROFILES (assets/mock/profiles.js), haptic (assets/lib/utils.js), playTap/initAudio (assets/lib/sounds.js).
   Expone funciones/variables globales (goTo, applySession, sbVerifyLogin, ls_init, currentUser, etc.) en window — sin IIFE/module — para que los iframes (fr-turnos, fr-reservas, fr-admin, fr-inicio) puedan llamarlas via window.parent.*

   NOMBRES: cada mini-feature tiene su propio prefijo de función en vez de
   (o además de) el `_` de "privado" que usan turnos.js/stock.js/worker-modal.js/
   inicio.js — ls_ (login steps), pin_ (teclado PIN), cp_ (cambio de PIN),
   ob_ (onboarding), prf_ (mi perfil), sa_ (superadmin), aj_ (ajustes),
   notif_ (notificaciones), inv_ (invite link). Es deliberado y consistente:
   con 9 features sin relación entre sí en un solo archivo, el prefijo dice
   "a qué feature pertenece esta función" — algo que un `_` genérico no
   puede expresar. La única inconsistencia real encontrada: ZONAS (12
   funciones, L.470) es la única mini-feature comparable que NO tiene
   prefijo propio (podría ser zon_/zona_) — no se ha renombrado porque
   exigiría tocar también los onclick="..." de index.html, fuera de lo que
   este archivo por sí solo puede garantizar sin riesgo.

   ÍNDICE (línea aprox. — no reordenado físicamente; el archivo es mucho más
   grande de lo que sugiere una lectura rápida, son 9 mini-features aparte
   del login/navegación — Zonas, Mi Perfil, Cambiar PIN, Notificaciones,
   Superadmin, Ajustes, PIN, Cambio de PIN, Onboarding, Invite Link):
     1. CONSTANTES Y CONFIGURACIÓN    L.48  (isSafeImg, APP_VERSION...) / L.166
                                              (currentUser, locales mock) — el resto
                                              (LS_KEY, PAGES, *_DEFAULTS, PIN_LEN...)
                                              se declara junto a su sección, no aquí.
     2. LOGIN — SPLASH Y TELÉFONO     L.1234 (LOGIN STEPS: ls_init/ls_show/
                                              ls_onTelInput/ls_goPin/ls_back)
     3. LOGIN — PIN Y SESIÓN          L.104 (sbVerifyLogin) / L.248 (applySession) /
                                              L.1092 (PIN LOGIN: pin_press/pin_submit) /
                                              L.1390 (CAMBIO DE PIN, primer acceso)
     4. SESIÓN Y ROLES                L.248 (applySession) / L.324 (doLogout)
     5. NAVEGACIÓN ENTRE IFRAMES      L.367
     6. SHELL — HEADER Y AVATAR       L.51  (_renderHeaderAvatar) / L.452 (PERFIL SHEET)
     7. UTILIDADES                    L.48  (isSafeImg) / L.83 (getActiveLocal) / L.463 (rolLabel)
     · OFFLINE DETECTION              L.335
     · CERRAR TODO                    L.469
     · ZONAS                          L.482
     · MI PERFIL                      L.611
     · CAMBIAR PIN (ya logueado)      L.823 — distinto de L.1390: aquí currentUser
                                              ya tiene sesión, solo hace UPDATE de
                                              pin_hash (sin applySession/must_change_pin).
                                              Mismo teclado numérico que el onboarding
                                              (ob_pinPress, L.1500) pero estado propio.
     · NOTIFICACIONES                 L.912
     · SUPERADMIN PANEL               L.932
     · AJUSTES                        L.978 (tema: aj_setTheme/_applyTheme/
                                              _resolveTheme, con propagación en vivo
                                              a los iframes de PAGES y listener de
                                              matchMedia para 'system')
     · ONBOARDING PRIMER ACCESO       L.1460
     · INVITE LINK                    L.1572

   Ver el flujo de login completo documentado justo antes de ls_init(). */


/* ── UTILIDADES ── */
function isSafeImg(u){return typeof u==='string'&&u.trim()!==''&&!u.includes('${');}

/* Versión mostrada en Ajustes → Acerca de (ajustes_openModal). Actualizar en
   cada release junto al tag del CHANGELOG — no se deriva de package.json ni
   de git porque el shell corre como HTML estático, sin build step. */
var APP_VERSION = 'v0.2.34';

/* ── SHELL — HEADER Y AVATAR ── */
/* Avatar del header (esquina superior derecha) — foto si existe, si no las iniciales. */
function _renderHeaderAvatar(){
  var av=document.getElementById('header-avatar');if(!av||!currentUser)return;
  av.innerHTML=isSafeImg(currentUser.foto_url)
    ?'<img src="'+currentUser.foto_url+'" alt="'+(currentUser.initials||'')+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover">'
    :currentUser.initials;
}

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
      document.documentElement.style.setProperty('--surf-nav', data.color_surf_nav||'#1a2226');
      document.documentElement.style.setProperty('--nav-brd', data.color_nav_brd||'#3a4a50');
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
   hashPin() y cleanTel() vienen de assets/lib/utils.js — el hash tiene que
   ser el MISMO algoritmo que usa prev_sendInvite() en worker-modal.js al
   generar la invitación, para poder compararlos bit a bit.
   Devuelve {status,...} en vez de null/profile porque el login real tiene
   más de dos desenlaces: teléfono que no existe, teléfono que existe pero
   aún no tiene invitación (pin_hash null — el admin no ha pulsado "Enviar
   invitación" todavía), PIN que no coincide, o PIN correcto pero es la
   primera vez que se usa (must_change_pin=true, hay que forzar el cambio
   antes de dejarle entrar). Cada caso necesita un mensaje o una pantalla
   distinta, así que pin_submit() decide qué hacer según "status". */
async function sbVerifyLogin(tel, pin){
  try{
    /* Comparación de teléfono normalizada en cliente — no un simple ILIKE
       por columna. En BD los teléfonos se han ido guardando en formatos
       distintos según quién los introdujo ("+34 656 187 336", "656187336",
       "0034656187336"…). Un ILIKE '%656187336%' no encuentra "+34 656 187
       336" porque los espacios rompen la subcadena. La forma robusta de
       comparar dos teléfonos españoles sin importar prefijo/espacios/
       guiones es quedarse solo con los dígitos y comparar los últimos 9
       (longitud fija de un móvil español) — así "+34 656 187 336",
       "656187336" y "0034656187336" son todos el mismo número.
       Se trae la lista completa del local (archivado=false) en vez de
       filtrar en la query: el volumen por local es pequeño (decenas de
       trabajadores) y así no dependemos de que PostgREST sepa normalizar
       teléfonos, que no es algo que un filtro de columna pueda expresar. */
    const telDigits = cleanTel(tel);
    const {data:workers,error} = await _sb.from('trabajadores')
      .select('id, nombre, seccion, tel, email, rol, prioridad, foto_url, visible, pin_hash, must_change_pin')
      .eq('local_id', LOCAL_ID)
      .eq('archivado', false);
    if(error){
      console.warn('sbVerifyLogin RLS/error:', error.message);
      return {status:'error'};
    }
    const data = (workers||[]).find(function(w){
      return cleanTel(w.tel) === telDigits;
    });
    if(!data) return {status:'not_found'};

    /* Nunca se le ha enviado la invitación (o se le reseteó el PIN) —
       no hay nada contra lo que comparar todavía. */
    if(!data.pin_hash) return {status:'pending'};

    const pinHash = await hashPin(pin);
    if(pinHash !== data.pin_hash) return {status:'wrong_pin'};

    if(data.must_change_pin) return {status:'must_change_pin', worker:data};

    return {
      status: 'ok',
      profile: {
        nombre:   data.nombre,
        initials: data.nombre.split(' ').map(function(n){return n[0];}).join('').toUpperCase().slice(0,2),
        rol:      data.rol || 'empleado',
        seccion:  data.seccion || '',
        localId:  LOCAL_ID,
        _sbId:    data.id,
        tel:      data.tel || '',
        email:    data.email || '',
        foto_url: data.foto_url || null,
        visible:  data.visible !== false,
      }
    };
  }catch(e){ console.error('sbVerifyLogin',e); return {status:'error'}; }
}


/* ── CONSTANTES Y CONFIGURACIÓN ── */
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

/* ── Por qué localStorage para la sesión (y no cookies/JWT) ──
   Es suficiente para el contexto actual: una PWA de un solo dispositivo por
   trabajador, sin necesidad de que el servidor valide la sesión en cada
   petición (Supabase con RLS por anon key ya protege el acceso a datos, no
   depende de esta sesión local). localStorage sobrevive a cerrar el
   navegador (a diferencia de sessionStorage) y no requiere backend propio
   para emitir/rotar tokens. Cuando se migre a Supabase Auth real (ver
   MEJORAS.md), esto pasa a ser un JWT gestionado por la librería de
   Supabase — toda esta sección de localStorage se elimina entonces, no se
   adapta. Los nombres de campo (_sbId, localId) se mantienen tal cual están
   ahora mismo: en vez de "id"/"local_id" es porque así los usan ya decenas
   de sitios en el resto de módulos (worker-modal.js, admin.js, turnos.js…);
   renombrarlos ahora sería un cambio grande y ajeno a este flujo de login. */
/**
 * Punto de llegada común de todo el login (ver FLUJO DE LOGIN en ls_init())
 * y también del auto-login al recargar con sesión guardada
 * (ls_refreshAndApply). Efectos, en orden: rellena currentUser; pinta
 * avatar/botón superadmin; guarda sesión en localStorage ('lg_session'
 * siempre, para que los iframes hermanos la lean vía window.parent.currentUser;
 * LS_KEY solo si `remember`); carga la config del local (sbLoadLocal);
 * muestra/oculta pestañas según el rol (Inicio, Admin — crea el iframe de
 * Admin al vuelo la primera vez que hace falta); navega a la pestaña por
 * defecto (goTo); refresca permisos de Stock si ya estaba cargado de una
 * sesión anterior; hace la transición visual login→app; y comprueba el
 * onboarding de primer acceso.
 * @param {object} profile - Perfil normalizado (de sbVerifyLogin/MOCK_PROFILES/cp_submit):
 *   {nombre, initials, rol, seccion, localId, _sbId, tel, email, foto_url, visible}.
 * @param {boolean} [remember] - Si true, la sesión sobrevive a recargar la página (LS_KEY).
 */
function applySession(profile, remember){
  currentUser = {
    nombre:   profile.nombre,
    initials: profile.initials,
    rol:      profile.rol,
    seccion:  profile.seccion || '',
    localId:  profile.localId,
    _sbId:    profile._sbId   || null,
    tel:      profile.tel     || '',
    email:    profile.email   || '',
    foto_url: profile.foto_url || null,
    visible:  profile.visible !== false,
  };

  var avatarBtn = document.getElementById('header-avatar');
  var saBtn     = document.getElementById('header-sa');
  _renderHeaderAvatar();
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

  /* goTo() solo refresca permisos del iframe al que se navega — Stock nunca es
     defaultPage, así que si ya estaba cargado (re-login sin recargar la página)
     seguiría mostrando los permisos del usuario anterior hasta que alguien
     entrara manualmente a esa pestaña. Se refresca aquí explícitamente. */
  try{
    var frStock = document.getElementById('fr-stock');
    if(frStock && frStock.contentWindow && typeof frStock.contentWindow.applyRolePermissions === 'function'){
      frStock.contentWindow.applyRolePermissions();
    }
  }catch(e){}

  var ls  = document.getElementById('login-screen');
  var app = document.getElementById('app');
  ls.classList.add('hide');
  app.classList.add('show');
  setTimeout(function(){ ls.style.display='none'; }, 350);
  setTimeout(function(){ onboarding_check(); }, 400);
}

/* auto-login — se ejecuta desde ls_init (DOMContentLoaded), no antes */

/**
 * Cierra la sesión: borra currentUser y ambas claves de localStorage
 * (LS_KEY — "recordar sesión" — y 'lg_session' — la que leen los
 * iframes), cierra cualquier modal abierto (closeAll) y hace la
 * transición visual inversa a applySession() (app → pantalla de login,
 * de vuelta al primer paso, ls-tel).
 */
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

/* Admin y Turnos son iframes hermanos que quedan vivos en memoria mientras dura la
   sesión — goTo() solo cambia cuál se ve, no los recarga. Cada módulo (turnos.js,
   worker-modal.js, adminSkills.js, admin.js) avisa al shell por postMessage justo
   después de guardar algo de un trabajador en Supabase; el shell solo marca que hace
   falta refrescar — el refresco real (sin recargar el iframe entero) se dispara al
   activar la pestaña correspondiente, y solo si de verdad hay algo pendiente. */
var pendingWorkerReload = { admin:false, turnos:false };
window.addEventListener('message', function(e){
  if(e.data && e.data.type === 'worker_updated'){
    pendingWorkerReload.admin = true;
    pendingWorkerReload.turnos = true;
  }
});

/**
 * Cambia qué pestaña/iframe se ve. Los iframes (Turnos, Admin...) son
 * hermanos que quedan vivos en memoria mientras dura la sesión — goTo()
 * solo alterna la clase .active, nunca recarga un iframe. También: cierra
 * DatePicker/detalle de mesas abiertos en el iframe que se abandona
 * (evita popups huérfanos visibles tras cambiar de pestaña); llama a
 * resetView() del iframe destino, si la expone, para que siempre aparezca
 * en su vista por defecto; y, si hay un guardado de trabajador pendiente
 * de reflejar en Admin o Turnos (pendingWorkerReload, marcado por el
 * listener de postMessage 'worker_updated' más arriba), dispara el
 * refresco real justo al entrar en esa pestaña — no antes, no si no hace falta.
 * @param {string} page - Id de la pestaña destino ('inicio'|'turnos'|'reservas'|'stock'|'admin').
 */
function goTo(page){
  PAGES.forEach(function(p){
    var fr = document.getElementById('fr-'+p);
    var bn = document.getElementById('bnav-'+p);
    if(fr) fr.classList.remove('active');
    if(bn) bn.classList.remove('active');
    try{ if(fr && fr.contentWindow && fr.contentWindow.DatePicker) fr.contentWindow.DatePicker.close(); }catch(e){}
    try{ if(fr && fr.contentWindow && fr.contentWindow.closeMesasDetail) fr.contentWindow.closeMesasDetail(); }catch(e){}
  });
  var fr = document.getElementById('fr-'+page);
  var bn = document.getElementById('bnav-'+page);
  if(fr) fr.classList.add('active');
  if(bn) bn.classList.add('active');
  try{ if(fr && fr.contentWindow && fr.contentWindow.resetView) fr.contentWindow.resetView(); }catch(e){}
  try{
    if(page==='admin' && pendingWorkerReload.admin && fr && fr.contentWindow && typeof fr.contentWindow._syncTrab==='function'){
      fr.contentWindow._syncTrab();
      pendingWorkerReload.admin = false;
    }
  }catch(e){}
  try{
    if(page==='turnos' && pendingWorkerReload.turnos && fr && fr.contentWindow && typeof fr.contentWindow.sbInitTrabajadores==='function'){
      fr.contentWindow.sbInitTrabajadores();
      pendingWorkerReload.turnos = false;
    }
  }catch(e){}
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
      _renderHeaderAvatar();
    }catch(e){
      console.error('prf_deletePhoto',e);
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
  if(_prf_dirtyFields.email) payload.email=email||null;
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
        console.error('prf_saveProfile',e);
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
            var fotoRes=await _sb.from('trabajadores').update({foto_url:photoUrl}).eq('id',currentUser._sbId);
            if(fotoRes.error)throw fotoRes.error;
            currentUser.foto_url=photoUrl;
          }
        }catch(photoErr){
          console.error('prf_saveProfile (foto)',photoErr);
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
  _renderHeaderAvatar();
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
    console.error('toggleMiVisibilidad',e);
    el.checked=prev!==false;
    currentUser.visible=prev;
    _prf_syncSession();
    toast('Error al guardar: '+(e.message||String(e)));
  }
}

/* ── Cambiar PIN (usuario ya logueado, desde Ajustes → Sesión) ──
   Reutiliza el componente de teclado numérico del onboarding de primer
   acceso (ob_pinPress/ob_pinDel/ob_pinRender, más abajo — mismo .pin-dots/
   .pin-pad/.pin-btn) — NO el flujo cp_open/cp_submit (ese usa inputs de
   texto y depende de _pendingWorker porque corre ANTES de que exista sesión;
   este ya tiene currentUser con sesión abierta). Estado propio (_cmp*) para
   no compartirlo con _newPin/_newPinConfirm del onboarding — evita que
   cambiar el PIN desde Ajustes interfiera si el onboarding llegara a estar
   montado a la vez (no debería ocurrir en la práctica, pero son módulos
   independientes y no cuesta nada mantenerlos así). A diferencia del stub
   del onboarding (que solo guarda en localStorage), aquí sí se hashea con
   hashPin() y se persiste en Supabase — currentUser ya tiene sesión real. */
var _cmpNewPin = '';
var _cmpNewPinConfirm = '';
var _cmpConfirming = false;

function prf_changePin_open(){
  closeModal('ov-ajustes');
  _cmpNewPin=''; _cmpNewPinConfirm=''; _cmpConfirming=false;
  var lbl=document.getElementById('cmp-pin-label');
  if(lbl) lbl.textContent='Introduce tu nuevo PIN';
  prf_changePin_render();
  showModal('ov-change-mypin');
}

function prf_changePin_press(digit){
  if(!_cmpConfirming){
    if(_cmpNewPin.length>=4) return;
    _cmpNewPin += digit; prf_changePin_render();
    if(_cmpNewPin.length===4){
      _cmpConfirming=true; _cmpNewPinConfirm=''; prf_changePin_render();
      var lbl=document.getElementById('cmp-pin-label');
      if(lbl) lbl.textContent='Confirma tu PIN';
    }
  } else {
    if(_cmpNewPinConfirm.length>=4) return;
    _cmpNewPinConfirm += digit; prf_changePin_render();
    if(_cmpNewPinConfirm.length===4){
      if(_cmpNewPinConfirm===_cmpNewPin) prf_changePin_submit(_cmpNewPin);
      else prf_changePin_mismatch();
    }
  }
}

function prf_changePin_del(){
  if(!_cmpConfirming) _cmpNewPin=_cmpNewPin.slice(0,-1);
  else _cmpNewPinConfirm=_cmpNewPinConfirm.slice(0,-1);
  prf_changePin_render();
}

function prf_changePin_render(){
  var len=_cmpConfirming?_cmpNewPinConfirm.length:_cmpNewPin.length;
  for(var i=0;i<4;i++){
    var dot=document.getElementById('cmp-pdot-'+i);
    if(dot){ dot.classList.toggle('filled',i<len); dot.classList.remove('error'); }
  }
}

/* Paso 2 no coincide con paso 1 → toast + vuelta al paso 1 (a diferencia del
   onboarding, que solo reintenta el paso 2 contra el mismo PIN nuevo). */
function prf_changePin_mismatch(){
  for(var i=0;i<4;i++){
    var dot=document.getElementById('cmp-pdot-'+i);
    if(dot) dot.classList.add('error');
  }
  toast('Los PIN no coinciden — vuelve a intentarlo');
  setTimeout(function(){
    _cmpConfirming=false; _cmpNewPin=''; _cmpNewPinConfirm='';
    var lbl=document.getElementById('cmp-pin-label');
    if(lbl) lbl.textContent='Introduce tu nuevo PIN';
    prf_changePin_render();
  }, 500);
}

/**
 * Hashea y guarda el nuevo PIN de currentUser en `trabajadores.pin_hash`.
 * @param {string} pin - PIN de 4 dígitos ya confirmado (coincide con el paso 1).
 * @returns {Promise<void>}
 */
async function prf_changePin_submit(pin){
  if(!currentUser||!currentUser._sbId||!_sb){
    toast('Sesión no disponible — vuelve a intentarlo');
    closeModal('ov-change-mypin');
    return;
  }
  if(typeof haptic==='function') haptic();

  try{
    var newHash=await hashPin(pin);
    var res=await _sb.from('trabajadores').update({pin_hash:newHash}).eq('id',currentUser._sbId);
    if(res.error) throw res.error;
  }catch(e){
    console.error('prf_changePin_submit',e);
    toast('Error al guardar el PIN — inténtalo de nuevo');
    _cmpConfirming=false; _cmpNewPin=''; _cmpNewPinConfirm='';
    var lbl=document.getElementById('cmp-pin-label');
    if(lbl) lbl.textContent='Introduce tu nuevo PIN';
    prf_changePin_render();
    return;
  }

  closeModal('ov-change-mypin');
  toast('PIN actualizado ✓');
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
var AJ_DEFAULTS = { sound:false };
var AJ_KEY = 'aj_prefs';

function ajustes_openModal(){
  var prefs = aj_loadPrefs();
  var theme = prefs.theme || 'dark';
  document.querySelectorAll('.aj-theme-btn').forEach(function(btn){
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
  var hapticCb = document.getElementById('aj-haptic');
  if(hapticCb) hapticCb.checked = prefs.haptic !== undefined ? prefs.haptic : (typeof hapticDefaultOn==='function' && hapticDefaultOn());
  var soundCb = document.getElementById('aj-sound');
  if(soundCb) soundCb.checked = prefs.sound !== undefined ? prefs.sound : AJ_DEFAULTS.sound;
  var verEl = document.getElementById('aj-version');
  if(verEl) verEl.textContent = APP_VERSION;
  showModal('ov-ajustes');
}

function aj_setTheme(theme){
  var prefs = aj_loadPrefs();
  prefs.theme = theme;
  aj_savePrefs(prefs);
  document.querySelectorAll('.aj-theme-btn').forEach(function(btn){
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
  _applyTheme(theme);
}

/**
 * Resuelve 'system' contra prefers-color-scheme — 'dark'/'light' se
 * devuelven tal cual, sin consultar el SO.
 * @param {string} theme - 'dark'|'light'|'system'
 * @returns {'dark'|'light'}
 */
function _resolveTheme(theme){
  if(theme === 'light' || theme === 'dark') return theme;
  var isLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  return isLight ? 'light' : 'dark';
}

/**
 * Aplica el tema resuelto al <html> del shell y al de cada iframe activo
 * (PAGES) — para cuando el usuario cambia el ajuste con la app ya abierta.
 * La carga inicial de cada documento (shell o iframe) NO pasa por aquí: ya
 * se resuelve sola, síncronamente y antes del primer pintado, con el script
 * anti-FOUT del <head> de cada página (lee el mismo localStorage['aj_prefs']
 * por su cuenta — ver comentario completo en index.html <head>).
 * @param {string} theme - 'dark'|'light'|'system'
 */
function _applyTheme(theme){
  var effective = _resolveTheme(theme);
  var addCls = effective === 'light' ? 'light-theme' : 'dark-theme';
  var rmCls  = effective === 'light' ? 'dark-theme' : 'light-theme';
  document.documentElement.classList.remove(rmCls);
  document.documentElement.classList.add(addCls);
  PAGES.forEach(function(page){
    try{
      var fr = document.getElementById('fr-'+page);
      var doc = fr && fr.contentDocument;
      if(!doc || !doc.documentElement) return;
      doc.documentElement.classList.remove(rmCls);
      doc.documentElement.classList.add(addCls);
    }catch(e){}
  });
}

/* Tema 'system' en vivo: si el usuario tiene elegida esta opción, reacciona
   a cambios de prefers-color-scheme del sistema operativo mientras la app
   está abierta (sin esto, el tema quedaría fijo hasta el próximo recargar).
   Se registra una sola vez al cargar el script — comprueba la preferencia
   guardada CADA VEZ que dispara, así que no hace falta añadir/quitar el
   listener al entrar o salir de 'system'. */
if(window.matchMedia){
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(){
    var prefs = aj_loadPrefs();
    if((prefs.theme || 'dark') === 'system') _applyTheme('system');
  });
}

function aj_save(key, value){
  var prefs = aj_loadPrefs();
  prefs[key] = value;
  aj_savePrefs(prefs);
  /* Vibración de confirmación al activar el toggle — mismo haptic() (utils.js)
     que usa el resto de la app, no un navigator.vibrate() suelto aparte. */
  if(key === 'haptic' && value && typeof haptic==='function') haptic(30);
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

/* Vibración/sonido al tap en cualquier punto del shell (nav inferior,
   header...) — los iframes no reciben este listener (documentos aparte),
   por eso Turnos/Stock llaman a haptic()/playTap() (utils.js/sounds.js)
   directamente en sus propios handlers. initAudio() solo hace falta una vez
   (el primer click "despierta" el AudioContext, ver sounds.js) — el resto
   de clicks no lo vuelven a llamar, aunque tampoco pasaría nada si lo
   hicieran (resume() en un contexto ya activo no hace nada). */
var _audioInited = false;
document.addEventListener('click', function(){
  if(typeof haptic==='function') haptic();
  if(typeof playTap==='function') playTap();
  if(!_audioInited && typeof initAudio==='function'){ _audioInited=true; initAudio(); }
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

/* Teclado físico para el PIN — solo activo mientras la pantalla de login está
   visible Y el paso actual es el teclado numérico (#ls-pin), para no interferir
   con el campo de teléfono ni con la pantalla de cambio de PIN (esa usa inputs
   de texto normales que ya reciben teclado de forma nativa). */
document.addEventListener('keydown', function(e){
  var loginScreen = document.getElementById('login-screen');
  var lsPin = document.getElementById('ls-pin');
  if(!loginScreen || !lsPin) return;
  if(loginScreen.style.display === 'none' || lsPin.style.display === 'none') return;
  if(e.key >= '0' && e.key <= '9'){
    e.preventDefault();
    pin_press(e.key);
  } else if(e.key === 'Backspace'){
    e.preventDefault();
    pin_del();
  } else if(e.key === 'Enter'){
    e.preventDefault();
    if(_pin.length === PIN_LEN) pin_submit();
  }
});

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

/**
 * Alias legacy de pin_submit() — el login real ya no se dispara con un botón
 * "Entrar" propio (se envía solo al completar el 4º dígito del PIN, ver
 * pin_press()), esta función se conserva porque el listener de Enter global
 * (más abajo, "Permitir Enter en el formulario de login") todavía la llama
 * por su nombre histórico.
 */
function doLogin(){
  pin_submit();
}

/* ══ LOGIN STEPS ══
   FLUJO DE LOGIN COMPLETO (ls_init(), abajo, es el punto de entrada — se
   llama una sola vez, en DOMContentLoaded):

   1. ls_init() decide qué pantalla mostrar primero, por prioridad:
      a) ?tel=X en la URL (enlace de invitación de prev_sendInvite(),
         worker-modal.js) → rellena el teléfono y, tras 1200ms, salta
         DIRECTO a la pantalla de PIN (ls_goPin). Gana siempre, incluso si
         hay una sesión guardada de OTRO usuario en este dispositivo — ver
         el comentario dentro de ls_init().
      b) Si no hay ?tel= pero sí sesión guardada (localStorage[LS_KEY]) →
         muestra el spinner de carga y llama a ls_refreshAndApply(cached):
         reverifica esos datos contra Supabase con un timeout de 5s
         (Promise.race) y, si responde a tiempo, aplica la versión fresca;
         si no hay red o hay timeout, aplica igualmente la versión
         cacheada (con un toast avisando) — nunca deja al usuario
         atascado en el spinner por falta de conexión.
      c) Sin ?tel= y sin sesión → pantalla de teléfono normal (ls-tel), tras
         1500ms (tiempo del splash inicial, #ls-splash, visible por
         defecto en el HTML).
   2. Pantalla de teléfono (ls-tel): el usuario escribe su móvil y pulsa
      "Continuar" (ls_goPin) → pasa a la pantalla de PIN (ls-pin).
   3. Pantalla de PIN (ls-pin): pin_press() acumula dígitos; al llegar a 4
      (PIN_LEN) dispara pin_submit() automáticamente, sin botón "Entrar".
      pin_submit() tiene DOS caminos:
      a) Atajo de desarrollo: si el teléfono es literalmente 'admin' /
         'superadmin' / 'encargado' / 'trabajador' Y el PIN es '1234' →
         usa MOCK_PROFILES en vez de Supabase (TODO: quitar en producción).
      b) Camino real: sbVerifyLogin(tel, pin) contra la tabla
         `trabajadores` — compara el teléfono normalizado (cleanTel) y el
         hash del PIN (hashPin, mismo algoritmo que al invitar). Según su
         `status`: 'not_found'/'pending'/'wrong_pin'/'error' → pin_error()
         + toast explicando qué pasó; 'must_change_pin' → guarda el
         trabajador en _pendingWorker y abre la pantalla de cambio de PIN
         (cp_open); 'ok' → applySession(profile, remember).
   4. Cambio de PIN obligatorio (ls-change-pin, solo si must_change_pin
      era true — primer acceso con el PIN temporal "1234"): cp_submit()
      pide el PIN nuevo dos veces, lo hashea y hace UPDATE de
      pin_hash/must_change_pin/activo antes de poder continuar — entonces
      sí llama a applySession() con los datos de _pendingWorker.
   5. applySession(profile, remember) es el final común de TODOS los
      caminos anteriores: rellena currentUser, pinta el header/avatar,
      decide qué pestañas ve el rol, guarda la sesión en localStorage
      (siempre en 'lg_session' para los iframes; también en LS_KEY si
      `remember` estaba marcado) y hace la transición visual de la
      pantalla de login a la app. */
/**
 * Punto de entrada del login — decide qué pantalla mostrar primero (ver el
 * FLUJO DE LOGIN completo justo arriba). Se registra una sola vez, como
 * listener de DOMContentLoaded (al final de este archivo), nunca se llama
 * a mano desde otro sitio.
 */
function ls_init(){
  /* Enlace de invitación con teléfono prellenado (?tel=...) — lo genera
     prev_sendInvite() en worker-modal.js al enviar la invitación por
     WhatsApp. Se comprueba ANTES que la sesión guardada a propósito: si el
     dispositivo tiene la sesión de otro trabajador recordada (ej. el admin
     que generó el enlace), ?tel= debe ganar siempre y llevar a la pantalla
     de PIN de ese teléfono — nunca cargar la sesión de otro usuario. */
  try{
    var urlTel = new URLSearchParams(window.location.search).get('tel');
    if(urlTel){
      var elUrlTel = document.getElementById('l-tel');
      if(elUrlTel) elUrlTel.value = urlTel;
      setTimeout(function(){ ls_goPin(); }, 1200);
      return;
    }
  }catch(e){}

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
        .select('id, nombre, seccion, tel, email, rol, prioridad, foto_url, visible')
        .eq('id', sbId)
        .maybeSingle(),
      new Promise(function(resolve){
        setTimeout(function(){ resolve({data:null,error:{message:'timeout'}}); }, 5000);
      })
    ]);
    hideRing();
    if(result.error || !result.data){
      console.error('ls_refreshAndApply: sin datos frescos, usando sesión cacheada —', result.error && result.error.message);
      toast('Sin conexión — usando datos de la última sesión');
      applySession(cached);
      return;
    }
    var d = result.data;
    var fresh = {
      nombre:   d.nombre,
      initials: d.nombre.split(' ').map(function(n){return n[0];}).join('').toUpperCase().slice(0,2),
      rol:      d.rol || cached.rol || 'empleado',
      seccion:  d.seccion || cached.seccion || '',
      localId:  cached.localId  || LOCAL_ID,
      _sbId:    d.id,
      tel:      d.tel      || '',
      email:    d.email || cached.email || '',
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
  ['ls-splash','ls-tel','ls-pin','ls-change-pin'].forEach(function(s){
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
  /* Foco en el primer botón del pad para que, viniendo de un enlace de
     invitación (?tel=...), el trabajador pueda teclear el PIN sin tocar nada más. */
  setTimeout(function(){
    var firstBtn=document.querySelector('#pin-pad .pin-btn');
    if(firstBtn) firstBtn.focus();
  }, 50);
}
function ls_back(){ _pin=''; pin_render(); ls_show('ls-tel'); }

/* Trabajador verificado con must_change_pin=true — se guarda aquí mientras
   pasa por la pantalla de cambio de PIN, para que cp_submit() sepa a qué
   fila escribir sin tener que volver a pedir teléfono+PIN. */
var _pendingWorker   = null;
var _pendingRemember = false;

function pin_submit(){
  var tel=(document.getElementById('l-tel').value||'').trim().replace(/\s/g,'');
  if(!tel){ ls_show('ls-tel'); return; }

  /* Acceso de prueba: solo si el campo tel es exactamente una palabra clave de dev.
     TODO: eliminar en producción — solo existe para no bloquear el desarrollo
     mientras el login real (arriba) no cubre todos los roles/casos todavía. */
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
  sbVerifyLogin(tel, _pin).then(function(result){
    var remember = document.getElementById('l-remember').checked;

    if(result.status==='not_found'){ pin_error(); toast('Teléfono no encontrado'); return; }
    if(result.status==='pending'){ pin_error(); toast('Acceso pendiente — espera tu invitación del administrador'); return; }
    if(result.status==='wrong_pin'){ pin_error(); toast('PIN incorrecto'); return; }
    if(result.status==='error'){ pin_error(); toast('Sin conexión — inténtalo de nuevo'); return; }

    if(remember){ try{ localStorage.setItem('lg_saved_tel',tel); }catch(e){} }

    if(result.status==='must_change_pin'){
      _pendingWorker   = result.worker;
      _pendingRemember = remember;
      cp_open();
      return;
    }

    /* status === 'ok' */
    applySession(result.profile, remember);
  }).catch(function(){
    pin_error();
    toast('Sin conexión — inténtalo de nuevo');
  });
}

/* ══ CAMBIO DE PIN — primer acceso (must_change_pin=true) ══
   Por qué must_change_pin como columna separada de pin_hash (en vez de,
   por ejemplo, comparar si pin_hash sigue siendo el del PIN temporal fijo):
   es explícito y no depende de que el PIN temporal nunca cambie de valor —
   si en el futuro el temporal se generase al azar en vez de ser siempre
   "1234", esta columna seguiría funcionando exactamente igual sin tocar
   nada aquí. Además dice la intención directamente ("hay que cambiarlo"),
   no la infiere de comparar hashes. */
function cp_open(){
  var i1=document.getElementById('cp-pin1'), i2=document.getElementById('cp-pin2');
  if(i1) i1.value='';
  if(i2) i2.value='';
  cp_clearError();
  ls_show('ls-change-pin');
  setTimeout(function(){ if(i1) i1.focus(); }, 50);
}
function cp_onInput(){ cp_clearError(); }
function cp_clearError(){
  var err=document.getElementById('cp-error');
  if(err) err.textContent='';
}
function cp_showError(msg){
  var err=document.getElementById('cp-error');
  if(err) err.textContent=msg;
}
async function cp_submit(){
  var p1=(document.getElementById('cp-pin1').value||'').trim();
  var p2=(document.getElementById('cp-pin2').value||'').trim();

  if(!/^\d{4}$/.test(p1) || !/^\d{4}$/.test(p2)){ cp_showError('El PIN debe tener 4 dígitos'); return; }
  if(p1!==p2){ cp_showError('Los PIN no coinciden'); return; }
  if(!_pendingWorker){ cp_showError('Sesión expirada — vuelve a intentarlo'); ls_show('ls-tel'); return; }

  var btn=document.getElementById('cp-submit-btn');
  if(btn){ btn.style.opacity='.6'; btn.style.pointerEvents='none'; }

  try{
    var newHash = await hashPin(p1);
    var res = await _sb.from('trabajadores')
      .update({ pin_hash:newHash, must_change_pin:false, activo:true })
      .eq('id', _pendingWorker.id);
    if(res.error) throw res.error;
  }catch(e){
    console.error('cp_submit',e);
    cp_showError('Error al guardar — inténtalo de nuevo');
    if(btn){ btn.style.opacity=''; btn.style.pointerEvents=''; }
    return;
  }

  var worker   = _pendingWorker;
  var remember = _pendingRemember;
  _pendingWorker = null;

  applySession({
    nombre:   worker.nombre,
    initials: worker.nombre.split(' ').map(function(n){return n[0];}).join('').toUpperCase().slice(0,2),
    rol:      worker.rol || 'empleado',
    seccion:  worker.seccion || '',
    localId:  LOCAL_ID,
    _sbId:    worker.id,
    tel:      worker.tel || '',
    email:    worker.email || '',
    foto_url: worker.foto_url || null,
    visible:  worker.visible !== false,
  }, remember);
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
