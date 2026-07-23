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

/* Stubs — worker-modal.js provides the real implementations when in Turnos.
   L().data se queda SIEMPRE vacío a propósito: el grid de días de #prof-sg en Admin
   es solo para restricciones genéricas, nunca debe mostrar ni cargar turnos asignados
   de ninguna semana (eso vive exclusivamente en Turnos — tabla 'turnos'). Las celdas
   marcadas que sí debe mostrar el modal son las de disponibilidad habitual
   (unavailMed/unavailNoch, cargadas en _syncTrab() desde la tabla 'disponibilidad'),
   que viven en una sección aparte del modal (#unavail-med/#unavail-noch), no en
   #prof-sg. toggleSg() (worker-modal.js) sigue bloqueando el click aquí con un toast. */
function buildGrid(){}
function renderW(){}
function updateStats(){}

function L(){
  return {
    staff: _trabWorkers,
    data:  {sm:[[],[],[],[],[],[],[]],sn:[[],[],[],[],[],[],[]],cm:[[],[],[],[],[],[],[]],cn:[[],[],[],[],[],[],[]]},
    eventos: [],
  };
}

/* Helpers required by worker-modal.js */
function ini(n){return n.split(":")[0].trim().split(" ").map(function(w){return w[0];}).join("").slice(0,2).toUpperCase();}
function parse(raw){var p=raw.split(":");return{name:p[0].trim(),hour:p.length>1?p[1]+":"+p[2]:""};}
function getW(n){return L().staff.find(function(w){return w.name===n;})||null;}
function cntT(name){var c=0;ROWS.forEach(function(r){L().data[r].forEach(function(d){if(d.some(function(n){return parse(n).name===name;}))c++;});});return c;}

/* extra: {dispo:{med:[],noc:[]}, skills:{roleId:nivel}, vacaciones:[{desde,hasta,tipo,_sbId}]}
   para ESTE trabajador, ya agrupado desde las tablas reales — ver _syncTrab(). Antes las
   tres quedaban siempre vacías (nunca se cargaban), así que Admin mostraba "sin
   restricciones"/"sin skills"/"sin vacaciones" aunque el trabajador sí las tuviera
   guardadas en BD — parecía que nada se guardaba nunca, cuando el guardado sí funcionaba. */
function _mapTrab(t, extra){
  extra = extra || {};
  return {id:t.id,name:t.nombre,sec:t.seccion,tel:t.tel||'',email:t.email||'',photo:t.foto_url||null,prioridad:t.prioridad,minT:t.min_turnos||3,maxT:t.max_turnos||6,activo:t.activo,archivado:t.archivado===true,pinHash:t.pin_hash||null,mustChangePin:t.must_change_pin!==false,rol:t.rol||'empleado',disponible:t.disponible!==false,visible:t.visible!==false,skills:extra.skills||{},unavailMed:(extra.dispo&&extra.dispo.med)||[],unavailNoch:(extra.dispo&&extra.dispo.noc)||[],vacaciones:extra.vacaciones||[],notas:extra.notas||[],_sbId:t.id};
}

/* Catálogo de skills (UUID en BD ↔ slug local ROLES_COCINA/ROLES_SALA) — mismo patrón
   de fuzzy-match por label que usa turnos.js (sbInitTrabajadores), independiente de él
   porque cada página tiene su propia copia de ROLES_COCINA/ROLES_SALA (mismos valores). */
var _skillLocalToUUID = {};
var _skillUUIDToLocal = {};

async function _syncTrab(){
  if(typeof sbLoadTrabajadores!=='function'){ renderTrabajadores(); loadArchivados(); return; }
  var ts=await sbLoadTrabajadores();
  if(!ts){ renderTrabajadores(); loadArchivados(); return; }
  var trabIds=ts.map(function(t){return t.id;});
  var dispoByW={}, skillsByW={}, vacByW={}, notasByW={};
  if(trabIds.length&&_sb){
    var results=await Promise.all([
      _sb.from('disponibilidad').select('trabajador_id,dia_semana,turno').in('trabajador_id',trabIds),
      _sb.from('trabajadores_skills').select('id,nombre'),
      _sb.from('trabajador_skill').select('trabajador_id,skill_id,nivel').in('trabajador_id',trabIds),
      _sb.from('trabajadores_vacaciones').select('id,trabajador_id,desde,hasta,tipo').in('trabajador_id',trabIds),
      _sb.from('trabajador_notas').select('id,trabajador_id,turno,nota,dia_semana').in('trabajador_id',trabIds),
    ]);
    var dispoRes=results[0], catalogRes=results[1], skillsRes=results[2], vacRes=results[3], notasRes=results[4];
    if(dispoRes.error) console.error('[SB] _syncTrab disponibilidad:',dispoRes.error.message);
    else (dispoRes.data||[]).forEach(function(r){
      if(!dispoByW[r.trabajador_id]) dispoByW[r.trabajador_id]={med:[],noc:[]};
      if(r.turno==='med') dispoByW[r.trabajador_id].med.push(r.dia_semana);
      else if(r.turno==='noch') dispoByW[r.trabajador_id].noc.push(r.dia_semana);
    });
    if(catalogRes.error) console.error('[SB] _syncTrab trabajadores_skills:',catalogRes.error.message);
    if(skillsRes.error) console.error('[SB] _syncTrab trabajador_skill:',skillsRes.error.message);
    if(vacRes.error) console.error('[SB] _syncTrab trabajadores_vacaciones:',vacRes.error.message);
    if(notasRes.error) console.error('[SB] _syncTrab trabajador_notas:',notasRes.error.message);
    else (notasRes.data||[]).forEach(function(r){
      if(!notasByW[r.trabajador_id]) notasByW[r.trabajador_id]=[];
      notasByW[r.trabajador_id].push({d:r.dia_semana,turno:r.turno,nota:r.nota,_sbId:r.id});
    });

    _skillLocalToUUID={}; _skillUUIDToLocal={};
    var ALL_ROLES_FLAT=(typeof ROLES_COCINA!=='undefined'&&typeof ROLES_SALA!=='undefined')?ROLES_COCINA.concat(ROLES_SALA):[];
    (catalogRes.data||[]).forEach(function(s){
      var sn=s.nombre.toLowerCase();
      var role=ALL_ROLES_FLAT.find(function(r){ var rl=r.label.toLowerCase(); return rl===sn||rl.indexOf(sn)!==-1||sn.indexOf(rl)!==-1; });
      if(role){ _skillLocalToUUID[role.id]=s.id; _skillUUIDToLocal[s.id]=role.id; }
    });
    (skillsRes.data||[]).forEach(function(r){
      var localId=_skillUUIDToLocal[r.skill_id];
      if(!localId) return;
      if(!skillsByW[r.trabajador_id]) skillsByW[r.trabajador_id]={};
      skillsByW[r.trabajador_id][localId]=r.nivel;
    });
    (vacRes.data||[]).forEach(function(r){
      if(!vacByW[r.trabajador_id]) vacByW[r.trabajador_id]=[];
      vacByW[r.trabajador_id].push({desde:r.desde,hasta:r.hasta,tipo:r.tipo||'vacaciones',_sbId:r.id});
    });
  }
  _trabWorkers=ts.map(function(t){
    return _mapTrab(t,{dispo:dispoByW[t.id],skills:skillsByW[t.id],vacaciones:vacByW[t.id],notas:notasByW[t.id]});
  });
  renderTrabajadores();
  loadArchivados();
}

function openTrabajadores(){
  document.getElementById('view-editar-list').style.display='none';
  document.getElementById('view-trabajadores').classList.add('active');
  renderTrabajadores();
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
    var rolTxt=(typeof ROL_LABELS!=='undefined'&&ROL_LABELS[w.rol])||'Empleado';
    /* Sigue pendiente aunque ya se le haya enviado el PIN temporal (pinHash relleno)
       mientras no haya entrado a cambiarlo por el suyo — ver prev_sendInvite. */
    var pending=w.pinHash==null||w.mustChangePin!==false;
    var estadoBadge=pending
      ?'<span class="trab-estado pendiente">&#9203; Pendiente</span>'
      :'<span class="trab-estado activo">&#9679; Activo</span>';
    var avatarHtml=(typeof isSafeImg==='function'&&isSafeImg(w.photo))
      ?'<img src="'+w.photo+'" alt="'+w.name.replace(/"/g,'&quot;')+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover">'
      :w.name.charAt(0).toUpperCase();
    h+='<div class="zona-row trab-item" data-name="'+w.name.replace(/"/g,'&quot;')+'">'+
       '<div class="trab-avatar">'+avatarHtml+'</div>'+
       '<div class="zona-info"><div class="zona-name">'+w.name+'</div>'+
       '<div class="zona-sub">'+rolTxt+' &middot; '+estadoBadge+'</div></div>'+
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
