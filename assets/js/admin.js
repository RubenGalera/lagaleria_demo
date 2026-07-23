/* lagaleria_admin.html — panel de administración.
   Depende de globals cargados antes: _sb/LOCAL_ID (supabase-client.js), toast/showModal/closeModal/stepField/formatDateLabel (ui-helpers.js),
   y de assets/lib/adminZones.js, adminSkills.js, adminWeekConfig.js, adminWorkers.js, adminStock.js, worker-modal.js (funciones como buildGrid/renderW/L/getW/cntT las definen esos módulos, este script solo las invoca).
   Expone funciones/variables globales (initFromParent, navTo, showOv/closeOv, showToast, etc.) en window — sin IIFE/module — para que esos módulos y los iframes puedan usarlas. */


function isSafeImg(u){return typeof u==='string'&&u.trim()!==''&&!u.includes('${');}

/* SUPABASE DATA LAYER */
async function sbLoadZonas(){
  try{
    const {data,error} = await _sb.from('zonas').select('*').eq('local_id', LOCAL_ID).eq('activa', true).order('orden');
    if(error) throw error;
    return data || [];
  }catch(e){ console.error('sbLoadZonas',e); return []; }
}

async function sbLoadTrabajadores(){
  try{
    const {data,error} = await _sb.from('trabajadores').select('*').eq('local_id', LOCAL_ID).eq('archivado', false).order('nombre');
    if(error) throw error;
    return data || [];
  }catch(e){ console.error('sbLoadTrabajadores',e); return []; }
}

async function sbSaveTrabajador(t){
  try{
    const sbId = t._sbId || t.id;
    const payload = {
      nombre:     t.name     || t.nombre   || '',
      seccion:    t.sec      || t.seccion  || 'sala',
      tel:        t.tel      || null,
      foto_url:   t.photo    || t.foto_url || null,
      min_turnos: t.minT     != null ? t.minT : (t.min_turnos != null ? t.min_turnos : 3),
      max_turnos: t.maxT     != null ? t.maxT : (t.max_turnos != null ? t.max_turnos : 6),
      prioridad:  t.prioridad || 'eventual',
      rol:        t.rol || 'empleado',
      /* Nuevo trabajador: activo=false hasta que confirme acceso con su PIN (pendiente de invitación).
         Trabajador existente: se preserva el valor salvo que se pida desactivar explícitamente. */
      activo:     sbId ? (t.activo !== false) : (t.activo === true),
    };
    if(sbId){
      const {error} = await _sb.from('trabajadores').update(payload).eq('id', sbId);
      if(error) throw error;
      return true;
    } else {
      payload.local_id = LOCAL_ID;
      /* .select().single() para recuperar el id real generado por BD — sin esto el
         objeto local del trabajador recién creado se queda sin _sbId, y cualquier
         acción posterior que dependa de él (p. ej. prev_sendInvite) no tiene a qué
         fila de Supabase escribir. */
      const {data, error} = await _sb.from('trabajadores').insert(payload).select().single();
      if(error) throw error;
      return data;
    }
  }catch(e){ console.error('sbSaveTrabajador',e); return false; }
}

/* archivado es independiente de activo: un trabajador archivado no puede volver a
   conectarse tenga el PIN que tenga, hasta ser restaurado. */
async function sbArchivarTrabajador(id){
  try{
    const {error} = await _sb.from('trabajadores').update({archivado:true}).eq('id',id);
    if(error) throw error;
    return true;
  }catch(e){ console.error('sbArchivarTrabajador',e); return false; }
}

async function sbBorrarTrabajadorDefinitivo(id){
  try{
    const {error} = await _sb.from('trabajadores').delete().eq('id',id);
    if(error) throw error;
    /* Limpieza del avatar en Storage (best-effort) */
    try{ await Promise.all(['jpg','png'].map(function(ext){ return _sb.storage.from('avatares').remove([id+'.'+ext]); })); }catch(se){}
    return true;
  }catch(e){ console.error('sbBorrarTrabajadorDefinitivo',e); return false; }
}

async function sbLoadSkills(){
  try{
    const {data,error} = await _sb.from('trabajadores_skills').select('*').eq('local_id', LOCAL_ID).order('categoria').order('orden');
    if(error) throw error;
    return data || [];
  }catch(e){ console.error('sbLoadSkills',e); return []; }
}

async function sbSaveZona(z){
  try{
    if(z.id){
      const {error} = await _sb.from('zonas').update(z).eq('id',z.id);
      if(error) throw error;
    } else {
      z.local_id = LOCAL_ID;
      const {error} = await _sb.from('zonas').insert(z);
      if(error) throw error;
    }
    return true;
  }catch(e){ console.error('sbSaveZona',e); return false; }
}

async function sbDeleteZona(id){
  try{
    const {error} = await _sb.from('zonas').update({activa:false}).eq('id',id);
    if(error) throw error;
    return true;
  }catch(e){ console.error('sbDeleteZona',e); return false; }
}

async function sbLoadProductos(){
  try{
    const {data,error} = await _sb.from('stock_productos').select('*').eq('local_id', LOCAL_ID).eq('activo', true).order('categoria').order('nombre');
    if(error) throw error;
    return data || [];
  }catch(e){ console.error('sbLoadProductos',e); return []; }
}

async function initSupabase(){
  /* _trabWorkers se carga vía _syncTrab() (adminWorkers.js) en vez de un mapeo propio
     aquí — había dos implementaciones duplicadas y la de aquí nunca cargaba
     disponibilidad (unavailMed/unavailNoch quedaban siempre []) ni el campo
     'disponible'. _syncTrab() ya hace fetch real de la tabla 'disponibilidad' y
     además llama a renderTrabajadores()/loadArchivados() por su cuenta. */
  const [[zonas, skills, productos]] = await Promise.all([
    Promise.all([sbLoadZonas(), sbLoadSkills(), sbLoadProductos()]),
    _syncTrab(),
  ]);
  if(zonas.length) window._sbZonas = zonas;
  if(skills.length) window._sbSkills = skills;
  if(productos.length) window._sbProductos = productos;
  if(typeof renderZonas==='function') renderZonas();
}

/* CONFIRM MODAL */
function showConfirm(opts){
  var titleEl = document.getElementById('confirm-title');
  var body    = document.getElementById('confirm-body');
  var btnOk   = document.querySelector('#ov-confirm .mbtn-d');
  var btnCan  = document.querySelector('#ov-confirm .mbtn-c');
  if(!body || !btnOk || !btnCan) return;
  if(titleEl) titleEl.textContent = opts.title || '¿Confirmar?';
  body.textContent = opts.message || '¿Confirmar acción?';
  btnOk.textContent = opts.confirmLabel || 'Confirmar';
  btnOk.onclick = function(){ closeOv('ov-confirm'); if(typeof opts.onConfirm === 'function') opts.onConfirm(); };
  btnCan.onclick = function(){ closeOv('ov-confirm'); if(typeof opts.onCancel === 'function') opts.onCancel(); };
  showOv('ov-confirm');
}

/* CREDENTIALS */
/* revisar: getAuthToken()/supaFetch() reimplementan acceso REST a Supabase en paralelo a _sb (supabase-client.js), que ya está cargado en esta página — mismo patrón duplicado en lagaleria_inicio.html. No se unificó porque cambiaría la lógica de negocio. Ver docs/MEJORAS.md — deuda técnica. */
var SUPA_URL = 'https://nnmaedehqeeogmhzqzji.supabase.co';
var SUPA_KEY = 'sb_publishable_spxukgcwMf-VFre7l_E68g_tWatBs9X';

function getAuthToken(){
  try{
    var p = window.parent;
    if(p.supabase){ var sess = p._supaSession; if(sess && sess.access_token) return sess.access_token; }
  }catch(e){}
  return SUPA_KEY;
}

function supaFetch(path, opts){
  var token = getAuthToken();
  var headers = Object.assign({'apikey':SUPA_KEY,'Authorization':'Bearer '+token,'Content-Type':'application/json','Prefer':'return=representation'}, opts&&opts.headers||{});
  return fetch(SUPA_URL + path, Object.assign({}, opts, {headers:headers}));
}

/* STATE */
var rol = 'admin';
var localId = null;

/* INIT */
function initFromParent(){
  try{
    var p = window.parent;
    if(!p || !p.currentUser){
      try{
        var saved = localStorage.getItem('lg_session');
        if(saved){ var u = JSON.parse(saved); rol = u.rol || 'admin'; applyRolPermissions(rol); }
      }catch(e){}
      var isMockDirect = new URLSearchParams(window.location.search).get('mock') === '1';
      if(isMockDirect){ showMockBadge(); loadZonasFromParent(); }
      else{ localId = LOCAL_ID; fetchZonas(); initSupabase(); }
      return;
    }
    rol = p.currentUser.rol;
    applyRolPermissions(rol);
    var local = p.getActiveLocal ? p.getActiveLocal() : null;
    if(local){
      var sln = document.getElementById('sec-local-name');
      if(sln) sln.textContent = local.nombre;
      var bt = document.getElementById('badge-trabajadores');
      if(bt) bt.textContent = local.trabajadores || '—';
    }
    var isMock = new URLSearchParams(window.location.search).get('mock') === '1';
    if(isMock){ showMockBadge(); loadZonasFromParent(); }
    else{ localId = LOCAL_ID; fetchZonas(); initSupabase(); }
  }catch(e){ console.error('initFromParent', e); }
}

function showMockBadge(){
  var b = document.getElementById('mock-badge');
  if(b) b.style.display = 'block';
}

function navTo(page, section){
  try{
    window.parent.goTo(page);
    if(section){ setTimeout(function(){ try{ var fr=window.parent.document.getElementById('fr-'+page); if(fr&&fr.contentWindow&&fr.contentWindow.goToSection) fr.contentWindow.goToSection(section); }catch(e){} },80); }
  }catch(e){}
}

function escHtml(str){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.addEventListener('load', function(){ initFromParent(); });
window.refreshAdmin = initFromParent;

/* MISC VARS */
const ROW_LBL={sm:"Sala Med",sn:"Sala Noche",cm:"Cocina Med",cn:"Cocina Noche"};
var wkLbls=[["11-17 mayo","Sem 20"],["18-24 mayo","Sem 21"],["25-31 mayo","Sem 22"]];
const RO=new URLSearchParams(location.search).has('readonly');
var _tpCtx='',_tpIdx=-1,_tpH=0,_tpM=0,_tpBtn=null;

/* OVERLAY / STUBS */
function removeHoraRow(btn){var row=btn?btn.closest('.hora-row'):null;if(row)row.remove();}
function showOv(id){var el=document.getElementById(id);if(el)el.classList.add("show");else console.error("showOv: not found #"+id);}
function closeOv(id){var el=document.getElementById(id);if(el)el.classList.remove("show");}
document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click",e=>{if(e.target===o)o.classList.remove("show");}));
function resetView(){
  ['view-zonas','view-skills','view-trabajadores','view-weekconfig','view-stock-admin','view-stock-prov'].forEach(function(v){var e=document.getElementById(v);if(e)e.classList.remove('active');});
  var el=document.getElementById('view-editar-list');if(el)el.style.display='';
  document.querySelectorAll('.overlay.show,.modal-overlay.show').forEach(function(m){m.classList.remove('show');});
}
buildGrid();renderW();updateStats();

/* PHOTO HANDLER */
var _pi=document.getElementById("photo-input");if(_pi)_pi.addEventListener("change",function(){
  const file=this.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{const w=L().staff.find(s=>s.name===_photoTarget);if(w){w.photo=e.target.result;buildGrid();renderTrabajadores();if(document.getElementById("ov-preview")&&document.getElementById("ov-preview").classList.contains("show"))openPreview(_photoTarget);}};
  reader.readAsDataURL(file);this.value="";_photoTarget=null;
});

/* WORKER ARCHIVE — handled by archiveWorker() in adminWorkers.js */

let _addRow="",_addCol=0;

/* VACACIONES */
function formatVacDate(dateStr){
  if(!dateStr)return"—";
  const d=new Date(dateStr+"T00:00:00");
  return d.toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"});
}

function renderVacList(){
  const w=getW(_previewName);if(!w)return;
  const list=document.getElementById("vac-list");if(!list)return;
  const totalEl=document.getElementById("vac-days-total");
  const days=countVacDays(w.vacaciones);
  if(totalEl)totalEl.textContent=days+" día"+(days!==1?"s":"");
  if(!w.vacaciones||!w.vacaciones.length){list.innerHTML='<div class="vac-empty">Sin periodos registrados</div>';return;}
  const TIPO_ICON={vacaciones:"🌴",baja:"🤒",libre:"📅",personal:"🔒"};
  list.innerHTML=w.vacaciones.map((v,i)=>`<div class="vac-item"><div class="vac-item-info"><div class="vac-item-dates">${formatVacDate(v.desde)} → ${formatVacDate(v.hasta)}</div><div class="vac-item-type">${TIPO_ICON[v.tipo]||"📅"} ${v.tipo.charAt(0).toUpperCase()+v.tipo.slice(1)}</div></div><button class="vac-del" onclick="delVacaciones(${i})">&#215;</button></div>`).join("");
}

function openVacPopup(){
  document.getElementById("vac-desde").value="";document.getElementById("vac-hasta").value="";document.getElementById("vac-tipo").value="vacaciones";
  showOv("ov-vac-popup");
}

/* addVacaciones()/delVacaciones() nunca llamaban a _sb — solo mutaban w.vacaciones en
   memoria (se perdía al recargar). Mismo patrón que turnos.js: insert/delete en
   trabajadores_vacaciones, con console.error explícito si falla. */
function addVacaciones(){
  const w=getW(_previewName);if(!w)return;
  const desde=document.getElementById("vac-desde").value,hasta=document.getElementById("vac-hasta").value,tipo=document.getElementById("vac-tipo").value;
  if(!desde||!hasta){showToast("Selecciona fecha de inicio y fin","error");return;}
  if(desde>hasta){showToast("La fecha de inicio debe ser anterior al fin","error");return;}
  if(!w.vacaciones)w.vacaciones=[];
  const overlap=vacDatesOverlap(w.vacaciones,desde,hasta,-1);
  const newVac={desde,hasta,tipo};
  w.vacaciones.push(newVac);w.vacaciones.sort((a,b)=>a.desde.localeCompare(b.desde));
  closeOv("ov-vac-popup");renderVacList();
  document.querySelectorAll("#prof-sg .sg-cell").forEach(c=>{
    c.classList.remove("on-vac");c.removeAttribute("data-vac-icon");
    const col=parseInt(c.dataset.col),vacIcon=getDayVacacion(_previewName,col);
    if(vacIcon){c.classList.add("on-vac");c.setAttribute("data-vac-icon",vacIcon);}
  });
  showToast(overlap?"⚠️ Solapamiento detectado — revisa las fechas":"Periodo añadido ✓", overlap?"error":"success");
  if(w._sbId){
    _sb?.from('trabajadores_vacaciones').insert({trabajador_id:w._sbId,desde,hasta,tipo}).select('id').single()
      .then(function(res){
        if(res.error){ console.error('[SB] insert trabajadores_vacaciones:',res.error.message); return; }
        if(res.data) newVac._sbId=res.data.id;
        _notifyWorkerUpdated();
      });
  }
}

function delVacaciones(idx){
  const w=getW(_previewName);if(!w)return;
  const item=w.vacaciones[idx];
  w.vacaciones.splice(idx,1);renderVacList();
  document.querySelectorAll("#prof-sg .sg-cell").forEach(c=>{
    c.classList.remove("on-vac");c.removeAttribute("data-vac-icon");
    const col=parseInt(c.dataset.col),vacIcon=getDayVacacion(_previewName,col);
    if(vacIcon){c.classList.add("on-vac");c.setAttribute("data-vac-icon",vacIcon);}
  });
  if(w._sbId&&item&&item._sbId){
    _sb?.from('trabajadores_vacaciones').delete().eq('id',item._sbId)
      .then(function(res){ if(res.error) console.error('[SB] delete trabajadores_vacaciones:',res.error.message); else _notifyWorkerUpdated(); });
  }
}

const TP_MINS=[0,15,30,45];

/* NOTA ESPECIAL — fusión de la antigua "hora especial de entrada" + "notas":
   una fila = día + turno + texto libre, los 3 obligatorios (ver saveProfile). */
function addNotaRow(){_notaRows.push({d:0,turno:'med',nota:''});renderNotaList();}

function renderNotaList(){
  const list=document.getElementById("nota-list");if(!list)return;list.innerHTML="";
  const DIAS_FULL=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  _notaRows.forEach((nr,i)=>{
    const row=document.createElement("div");row.className="nota-row";
    const esc=s=>(s||"").replace(/"/g,"&quot;");
    row.innerHTML=`<select class="nota-sel" onchange="_notaRows[${i}].d=parseInt(this.value)">${DIAS_FULL.map((d,di)=>`<option value="${di}" ${nr.d===di?"selected":""}>${d}</option>`).join("")}</select><select class="nota-sel" onchange="_notaRows[${i}].turno=this.value"><option value="med" ${nr.turno==="med"?"selected":""}>Mediodía</option><option value="noch" ${nr.turno==="noch"?"selected":""}>Noche</option></select><input class="nota-input" type="text" placeholder="Ej: 9:00, solo SALA, llega tarde..." value="${esc(nr.nota)}" oninput="_notaRows[${i}].nota=this.value"><button class="nota-del" onclick="_notaRows.splice(${i},1);renderNotaList()">&#215;</button>`;
    list.appendChild(row);
  });
}

function openTp(ctx,btn,idx,initVal){
  _tpCtx=ctx;_tpBtn=btn;_tpIdx=idx!=null?idx:-1;
  const cur=initVal||(btn?btn.textContent:""),parts=(cur||"").split(":");
  _tpH=parseInt(parts[0]);if(isNaN(_tpH))_tpH=8;
  _tpM=TP_MINS.includes(parseInt(parts[1]))?parseInt(parts[1]):0;
  var popup=document.getElementById("tp-popup");
  if(!popup){
    var bd=document.createElement("div");bd.className="tp-backdrop";bd.id="tp-backdrop";bd.onclick=function(){closeTp();};document.body.appendChild(bd);
    popup=document.createElement("div");popup.className="tp-popup";popup.id="tp-popup";popup.style.display="none";popup.style.position="fixed";popup.style.zIndex="9999";
    popup.innerHTML='<div class="tp-title">Hora de entrada</div><div class="tp-cols"><div class="tp-col" id="tp-horas"><div class="tp-col-hdr">h</div></div><div class="tp-col" id="tp-mins"><div class="tp-col-hdr">min</div></div></div><div class="tp-actions"><button class="tp-cancel" onclick="closeTp()">Cancelar</button><button class="tp-ok" onclick="confirmTp()">Listo</button></div>';
    document.body.appendChild(popup);
  }
  popup.querySelector(".tp-title").textContent=ctx==="ev"?"Hora del evento":"Hora de entrada";
  const hCol=document.getElementById("tp-horas"),mCol=document.getElementById("tp-mins");
  hCol.innerHTML='<div class="tp-col-hdr">h</div>';mCol.innerHTML='<div class="tp-col-hdr">min</div>';
  for(var h=0;h<24;h++){var el=document.createElement("div");el.className="tp-opt"+(h===_tpH?" sel":"");el.textContent=String(h).padStart(2,"0");(function(hh,e){e.onclick=function(){_tpH=hh;hCol.querySelectorAll(".tp-opt").forEach(function(o){o.classList.remove("sel")});e.classList.add("sel");};})(h,el);hCol.appendChild(el);}
  TP_MINS.forEach(function(m){var el=document.createElement("div");el.className="tp-opt"+(m===_tpM?" sel":"");el.textContent=String(m).padStart(2,"0");(function(mm,e){e.onclick=function(){_tpM=mm;mCol.querySelectorAll(".tp-opt").forEach(function(o){o.classList.remove("sel")});e.classList.add("sel");};})(m,el);mCol.appendChild(el);});
  popup.style.display="block";
  if(btn){var r=btn.getBoundingClientRect(),pw=220,ph=320,top=r.bottom+6,left=r.left;if(top+ph>window.innerHeight)top=r.top-ph-6;if(left+pw>window.innerWidth)left=window.innerWidth-pw-8;if(left<8)left=8;popup.style.top=top+"px";popup.style.left=left+"px";}
  var backdrop=document.getElementById("tp-backdrop");if(backdrop)backdrop.classList.add("show");
  setTimeout(function(){var selH=hCol.querySelector(".sel");if(selH)selH.scrollIntoView({block:"center"});var selM=mCol.querySelector(".sel");if(selM)selM.scrollIntoView({block:"center"});},20);
}
function closeTp(){document.getElementById("tp-popup").style.display="none";document.getElementById("tp-backdrop").classList.remove("show");_tpIdx=-1;_tpBtn=null;_tpCtx=null;}
function confirmTp(){
  const val=String(_tpH).padStart(2,"0")+":"+String(_tpM).padStart(2,"0");
  if(_tpBtn)_tpBtn.textContent=val;
  if(_tpCtx==="ev"){_evHora=val;}
  closeTp();
}

function getDayVacacion(workerName,dayCol){
  const w=getW(workerName);if(!w||!w.vacaciones||!w.vacaciones.length)return null;
  const baseDate=new Date('2026-05-18'),weekStart=new Date(baseDate);
  weekStart.setDate(baseDate.getDate()+(curWeek-1)*7);
  const dayDate=new Date(weekStart);dayDate.setDate(weekStart.getDate()+dayCol);
  const dayStr=dayDate.toISOString().split('T')[0];
  const TIPO_ICON={vacaciones:'🌴',baja:'🤒',libre:'📅',personal:'🔒'};
  for(const v of w.vacaciones){if(dayStr>=v.desde&&dayStr<=v.hasta)return TIPO_ICON[v.tipo]||'📅';}
  return null;
}

function vacDatesOverlap(vacaciones,desde,hasta,excludeIdx){
  return vacaciones.some((v,i)=>{if(i===excludeIdx)return false;if(!v.desde||!v.hasta)return false;return desde<=v.hasta&&hasta>=v.desde;});
}
function countVacDays(vacaciones){
  if(!vacaciones||!vacaciones.length)return 0;
  let total=0;
  vacaciones.forEach(v=>{if(!v.desde||!v.hasta)return;if(v.tipo!=='vacaciones')return;const d0=new Date(v.desde+"T00:00:00"),d1=new Date(v.hasta+"T00:00:00"),diff=Math.round((d1-d0)/(1000*60*60*24))+1;if(diff>0)total+=diff;});
  return total;
}

/* showToast() ahora viene de assets/lib/toast.js (window.showToast) —
   antes admin.js tenía su propia copia local, ligeramente distinta a la de
   los demás módulos. */

/* ROL PERMISSIONS */
function applyRolPermissions(r){
  var isAdmin=r==='admin',isEncargado=r==='encargado',isEmpleado=r==='empleado';
  var tabEditar=document.getElementById('tab-editar');if(tabEditar)tabEditar.style.display=isAdmin?'':'none';
  var cardReservas=document.getElementById('card-reservas');if(cardReservas)cardReservas.style.display=isEmpleado?'none':'';
  var cardEventos=document.getElementById('card-eventos');if(cardEventos)cardEventos.style.display=isEmpleado?'none':'';
  var stockBadge=document.getElementById('stock-readonly-badge');if(stockBadge)stockBadge.style.display=isEmpleado?'':'none';
  var greetUser=document.getElementById('greeting-user');
  try{var u=window.parent&&window.parent.currentUser?window.parent.currentUser:JSON.parse(localStorage.getItem('lg_session')||'{}');if(greetUser&&u.nombre)greetUser.textContent=u.nombre.split(' ')[0];}catch(e){}
}

window.addEventListener('load',function(){loadSkillsLocal();loadWeekConfigLocal();});

