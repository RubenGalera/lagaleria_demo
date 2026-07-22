/* adminWorkers.js — Gestión de Trabajadores
   Globals required: sbSaveTrabajador, sbArchivarTrabajador, sbBorrarTrabajadorDefinitivo,
                     sbLoadTrabajadores, LOCAL_ID, _sb, showOv, closeOv, showConfirm,
                     openPreview (worker-modal), renderSkillsSummary (adminSkills),
                     showToast, toast */

const ROWS = ["sm","sn","cm","cn"];
const CONFLICTS = {sm:"cm",cm:"sm",sn:"cn",cn:"sn"};
const EV_NAMES = {birthday:"Cumpleaños",cata:"Cata",menu:"Menú especial",evento:"Evento"};
const EV_ICONS = {birthday:"🎂",cata:"🍷",menu:"🍽️",evento:"📅"};
const EV_COLS  = {birthday:"#e880c0",cata:"#b880e0",menu:"#60c888",evento:"#60aaee"};

var _trabWorkers = [];
var curWeek  = 1;
var curLocal = 'galeria';

/* Turnos de la semana ACTUAL — SOLO LECTURA, cargados de verdad desde Supabase para que
   el grid del modal de trabajador (y cntT()) no muestren siempre "0 turnos". Admin nunca
   asigna turnos (eso vive en Turnos): scheduleAutosave()/saveWeekSnapshot() no existen en
   esta página, así que aunque el grid fuera clicable no hay forma de que un cambio
   persista — y además toggleSg() (worker-modal.js) ahora bloquea el click aquí con un
   toast en vez de tocar esto. Se recarga cada vez que se abre el panel Trabajadores. */
var _adminTurnosData = {sm:[[],[],[],[],[],[],[]],sn:[[],[],[],[],[],[],[]],cm:[[],[],[],[],[],[],[]],cn:[[],[],[],[],[],[],[]]};

/* Stubs — worker-modal.js provides the real implementations when in Turnos */
function buildGrid(){}
function renderW(){}
function updateStats(){}

function L(){
  return {
    staff: _trabWorkers,
    data:  _adminTurnosData,
    eventos: [],
  };
}

function _mondayOfToday(){
  var d=new Date();
  var dow=d.getDay()||7;
  d.setDate(d.getDate()-(dow-1));
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
async function _loadAdminTurnosReadOnly(){
  if(!_sb) return;
  var semana=_mondayOfToday();
  var res=await _sb.from('turnos').select('slot,dia,trabajador_id,hora_especial').eq('local_id',LOCAL_ID).eq('semana_inicio',semana);
  if(res.error){ console.warn('[SB] _loadAdminTurnosReadOnly:',res.error.message); return; }
  var data={sm:[[],[],[],[],[],[],[]],sn:[[],[],[],[],[],[],[]],cm:[[],[],[],[],[],[],[]],cn:[[],[],[],[],[],[],[]]};
  if(!res.data||!res.data.length){ _adminTurnosData=data; return; }
  /* idToName: TODOS los trabajadores del turno (incluidos archivados) — no solo
     _trabWorkers (el roster activo, sin archivados). Un archivado puede seguir
     teniendo turnos asignados esta semana y deben mostrarse igual, solo lectura. */
  var ids=[...new Set(res.data.map(function(t){return t.trabajador_id;}))];
  var namesRes=await _sb.from('trabajadores').select('id,nombre').in('id',ids);
  if(namesRes.error){ console.warn('[SB] _loadAdminTurnosReadOnly (nombres):',namesRes.error.message); return; }
  var idToName={};
  (namesRes.data||[]).forEach(function(t){ idToName[t.id]=t.nombre; });
  res.data.forEach(function(t){
    var nombre=idToName[t.trabajador_id];
    if(!nombre||!data[t.slot]) return;
    data[t.slot][t.dia].push(nombre+(t.hora_especial?':'+t.hora_especial:''));
  });
  _adminTurnosData=data;
}

/* Helpers required by worker-modal.js */
function ini(n){return n.split(":")[0].trim().split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase();}
function parse(raw){var p=raw.split(":");return{name:p[0].trim(),hour:p.length>1?p[1]+":"+p[2]:""};}
function getW(n){return L().staff.find(function(w){return w.name===n;})||null;}
function cntT(name){var c=0;ROWS.forEach(function(r){L().data[r].forEach(function(d){if(d.some(function(n){return parse(n).name===name;}))c++;});});return c;}

/* dispo: {med:[0,2,...], noc:[...]} para ESTE trabajador, ya agrupado desde la tabla
   'disponibilidad' — ver _syncTrab(). Antes unavailMed/unavailNoch quedaban siempre
   [] (nunca se cargaban), así que Admin mostraba "sin restricciones" aunque el
   trabajador sí las tuviera guardadas en BD. */
function _mapTrab(t, dispo){
  return {id:t.id,name:t.nombre,sec:t.seccion,tel:t.tel||'',email:t.email||'',photo:t.foto_url||null,prioridad:t.prioridad,minT:t.min_turnos||3,maxT:t.max_turnos||6,activo:t.activo,archivado:t.archivado===true,pinHash:t.pin_hash||null,mustChangePin:t.must_change_pin!==false,rol:t.rol||'empleado',disponible:t.disponible!==false,visible:t.visible!==false,skills:{},unavailMed:(dispo&&dispo.med)||[],unavailNoch:(dispo&&dispo.noc)||[],vacaciones:[],_sbId:t.id};
}

async function _syncTrab(){
  if(typeof sbLoadTrabajadores==='function'){
    var ts=await sbLoadTrabajadores();
    if(ts){
      var dispoByW={};
      var trabIds=ts.map(function(t){return t.id;});
      if(trabIds.length&&_sb){
        var dispoRes=await _sb.from('disponibilidad').select('trabajador_id,dia_semana,turno').in('trabajador_id',trabIds);
        if(dispoRes.error){
          console.warn('[SB] disponibilidad:',dispoRes.error.message);
        } else {
          (dispoRes.data||[]).forEach(function(r){
            if(!dispoByW[r.trabajador_id]) dispoByW[r.trabajador_id]={med:[],noc:[]};
            if(r.turno==='med') dispoByW[r.trabajador_id].med.push(r.dia_semana);
            else if(r.turno==='noc') dispoByW[r.trabajador_id].noc.push(r.dia_semana);
          });
        }
      }
      _trabWorkers=ts.map(function(t){ return _mapTrab(t,dispoByW[t.id]); });
    }
  }
  renderTrabajadores();
  loadArchivados();
}

function openTrabajadores(){
  document.getElementById('view-editar-list').style.display='none';
  document.getElementById('view-trabajadores').classList.add('active');
  renderTrabajadores();
  _loadAdminTurnosReadOnly();
}
function closeTrabajadores(){
  document.getElementById('view-trabajadores').classList.remove('active');
  document.getElementById('view-editar-list').style.display='';
}
function renderTrabajadores(){
  var list=document.getElementById('trab-list');if(!list)return;
  /* archivado ya se filtra en sbLoadTrabajadores() — aquí solo ocultamos los no-visibles.
     Los pendientes de invitación (sin PIN o sin confirmar el suyo propio) SÍ deben
     aparecer, con su propio badge. */
  var staff = _trabWorkers.filter(function(w){ return w.visible !== false; });
  var h='';
  staff.forEach(function(w){
    var sec=w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos';
    /* Sigue pendiente aunque ya se le haya enviado el PIN temporal (pinHash relleno)
       mientras no haya entrado a cambiarlo por el suyo — ver prev_sendInvite. */
    var pending=w.pinHash==null||w.mustChangePin!==false;
    var estadoBadge=pending
      ?'<span class="trab-estado pendiente">&#9203; Pendiente</span>'
      :'<span class="trab-estado activo">&#9679; Activo</span>';
    h+='<div class="zona-row trab-item" data-name="'+w.name.replace(/"/g,'&quot;')+'">'+
       '<div class="trab-avatar">'+w.name.charAt(0).toUpperCase()+'</div>'+
       '<div class="zona-info"><div class="zona-name">'+w.name+'</div>'+
       '<div class="zona-sub">'+sec+' &middot; '+estadoBadge+'</div></div>'+
       '<span class="zona-arrow">&#x203a;</span></div>';
  });
  h+='<div style="padding:8px 0 4px"><button onclick="openNuevoTrabajador()" style="width:100%;padding:13px;border-radius:11px;border:1.5px dashed var(--acc-bd);background:transparent;color:var(--acc);font-size:13px;font-weight:600;cursor:pointer">+ A&#241;adir trabajador</button></div>';
  list.innerHTML=h;
  list.querySelectorAll('.trab-item').forEach(function(el){
    el.addEventListener('click',function(){openPreview(el.getAttribute('data-name'));});
  });
}

function openNuevoTrabajador(){
  ['inv-nombre','inv-tel'].forEach(function(id){
    var el=document.getElementById(id);
    if(el){el.value='';el.style.borderColor='';}
    var hint=el&&el.parentNode.querySelector('.inv-error');if(hint)hint.textContent='';
  });
  var rolSel=document.getElementById('inv-rol');if(rolSel)rolSel.value='empleado';
  document.querySelectorAll('.inv-sec-btn').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-sec')==='sala');});
  showOv('ov-invite-trab');
}
function inv_setSec(btn){document.querySelectorAll('.inv-sec-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');}
function inv_send(){
  var nombreEl=document.getElementById('inv-nombre'),telEl=document.getElementById('inv-tel'),rolEl=document.getElementById('inv-rol');
  var nombre=(nombreEl.value||'').trim(),tel=(telEl.value||'').trim();
  var rol=rolEl?rolEl.value:'empleado';
  var secBtn=document.querySelector('.inv-sec-btn.active'),sec=secBtn?secBtn.getAttribute('data-sec'):'sala';
  if(!nombre){inv_fieldError(nombreEl,'Introduce el nombre completo');return;}
  var dupNombre=_trabWorkers.find(function(w){return w.name.toLowerCase()===nombre.toLowerCase();});
  if(dupNombre){inv_fieldError(nombreEl,'Ya existe un trabajador llamado '+nombre+' en este local');return;}
  if(tel){
    if(!/^[+\d\s]{6,}$/.test(tel)){inv_fieldError(telEl,'El formato del teléfono no es válido');return;}
    var dupTel=_trabWorkers.find(function(w){return(w.tel||'').replace(/\s/g,'')===(tel.replace(/\s/g,''));});
    if(dupTel){inv_fieldError(telEl,'Este teléfono ya pertenece a '+dupTel.name);return;}
  }
  var newWorker={name:nombre,sec:sec,tel:tel,rol:rol,email:'',photo:null,minT:3,maxT:6,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:'eventual',skills:{},activo:false,pinHash:null,mustChangePin:true};
  _trabWorkers.push(newWorker);
  /* Capturamos el id real que devuelve Supabase — sin él, newWorker no tiene _sbId
     y no se podría, por ejemplo, enviarle la invitación hasta el próximo resync. */
  sbSaveTrabajador(newWorker).then(function(result){
    if(result&&result.id){newWorker._sbId=result.id;newWorker.id=result.id;}
  }).catch(function(e){console.warn('[SB] create worker failed:',e);});
  if(typeof renderTrabajadores==='function')renderTrabajadores();
  closeOv('ov-invite-trab');
  var msg=nombre+' añadido a la plantilla';if(!tel)msg+=' — recuerda añadir su teléfono para darle acceso';
  if(typeof showToast==='function')showToast(msg);
}
function inv_fieldError(el,msg){
  if(!el)return;
  el.focus();el.style.borderColor='var(--red,#fc8181)';
  var hint=el.parentNode.querySelector('.inv-error');
  if(!hint){hint=document.createElement('span');hint.className='inv-error';hint.style.cssText='font-size:11px;color:var(--red,#fc8181);margin-top:4px;display:block';el.parentNode.appendChild(hint);}
  hint.textContent=msg;
  el.oninput=function(){el.style.borderColor='';if(hint)hint.textContent='';};
}

function saveWorker(name){
  var w=getW(name);if(!w)return;
  sbSaveTrabajador(w).catch(function(e){console.warn('[SB] saveWorker failed:',e);});
}

/* ── ARCHIVAR (soft delete) ── */
function archiveWorker(name){
  if(typeof closeOv==='function') closeOv('ov-preview');
  showConfirm({
    title: '¿Archivar trabajador?',
    message: 'Este trabajador quedará en Trabajadores archivados con todo su historial intacto. Para eliminarlo definitivamente, accede a Trabajadores archivados.',
    confirmLabel: 'Archivar',
    onConfirm: async function(){
      var w=getW(name);
      if(w&&w._sbId&&typeof sbArchivarTrabajador==='function'){
        var ok=await sbArchivarTrabajador(w._sbId);
        if(!ok){if(typeof showToast==='function')showToast('Error al archivar — inténtalo de nuevo');return;}
      }
      if(typeof showToast==='function')showToast('Trabajador archivado ✓');
      await _syncTrab();
    },
    onCancel: function(){ if(typeof openPreview==='function') openPreview(name); }
  });
}

/* ── SECCIÓN ARCHIVADOS ── */
function toggleArchivados(){
  var list=document.getElementById('archived-list');
  var chevron=document.getElementById('archived-chevron');
  if(!list)return;
  var open=list.style.display!=='none';
  list.style.display=open?'none':'';
  if(chevron)chevron.style.transform=open?'':'rotate(180deg)';
  if(!open)loadArchivados();
}

async function loadArchivados(){
  var list=document.getElementById('archived-list');
  var countEl=document.getElementById('archived-count');
  if(!list)return;
  list.innerHTML='<div style="padding:16px;text-align:center;font-size:12px;color:var(--dim)">Cargando&#8230;</div>';
  if(typeof _sb==='undefined'||!_sb){list.innerHTML='<div style="padding:16px;text-align:center;font-size:12px;color:var(--dim)">Sin conexión</div>';return;}
  try{
    var r=await _sb.from('trabajadores').select('id,nombre,seccion,tel,foto_url').eq('local_id',LOCAL_ID).eq('archivado',true).order('nombre');
    if(r.error)throw r.error;
    var data=r.data||[];
    if(countEl)countEl.textContent=data.length?'('+data.length+')':'';
    if(!data.length){list.innerHTML='<div style="padding:16px;text-align:center;font-size:12px;color:var(--dim)">No hay trabajadores archivados</div>';return;}
    var h='';
    data.forEach(function(w){
      var ini=w.nombre.split(' ').map(function(p){return p[0];}).join('').toUpperCase().slice(0,2);
      var sec=(w.seccion||'');sec=sec.charAt(0).toUpperCase()+sec.slice(1);
      var esc=function(s){return (s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");};
      h+='<div class="zona-row" style="opacity:.75">'+
         '<div class="trab-avatar" style="opacity:.5">'+ini+'</div>'+
         '<div class="zona-info"><div class="zona-name">'+w.nombre+'</div>'+
         '<div class="zona-sub">'+sec+'&nbsp;&middot;&nbsp;<span style="color:var(--dim)">Archivado</span></div></div>'+
         '<div style="display:flex;gap:6px;flex-shrink:0;padding:0 4px">'+
         '<button onclick="restaurarTrabajador(\''+w.id+'\',\''+esc(w.nombre)+'\')" style="padding:5px 10px;border-radius:7px;border:1px solid var(--acc-bd);background:var(--acc-bg);color:var(--acc);font-size:11px;font-weight:600;cursor:pointer">Restaurar</button>'+
         '<button onclick="confirmarBorrarDefinitivo(\''+w.id+'\',\''+esc(w.nombre)+'\')" style="padding:5px 10px;border-radius:7px;border:1px solid var(--red-bd);background:var(--red-bg);color:var(--red);font-size:11px;font-weight:600;cursor:pointer">Borrar</button>'+
         '</div></div>';
    });
    list.innerHTML=h;
  }catch(e){
    console.error('loadArchivados',e);
    list.innerHTML='<div style="padding:16px;text-align:center;font-size:12px;color:var(--red)">Error al cargar archivados</div>';
  }
}

async function restaurarTrabajador(id, name){
  if(typeof _sb==='undefined'||!_sb)return;
  try{
    var r=await _sb.from('trabajadores').update({archivado:false}).eq('id',id);
    if(r.error)throw r.error;
    if(typeof showToast==='function')showToast(name+' restaurado ✓');
    await _syncTrab();
  }catch(e){
    if(typeof showToast==='function')showToast('Error al restaurar — '+(e.message||String(e)));
  }
}

function confirmarBorrarDefinitivo(id, name){
  showConfirm({
    title: '¿Borrar definitivamente?',
    message: '⚠️ Esto eliminará a '+name+' de forma permanente e irreversible, incluyendo toda su información y participación en turnos pasados.',
    confirmLabel: 'Borrar definitivamente',
    onConfirm: async function(){
      if(typeof sbBorrarTrabajadorDefinitivo==='function'){
        var ok=await sbBorrarTrabajadorDefinitivo(id);
        if(!ok){if(typeof showToast==='function')showToast('Error al borrar — inténtalo de nuevo');return;}
      }
      if(typeof showToast==='function')showToast(name+' eliminado definitivamente');
      await _syncTrab();
    },
    onCancel: null
  });
}
