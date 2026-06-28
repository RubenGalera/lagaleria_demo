/* adminWorkers.js — Gestión de Trabajadores
   Globals required: sbSaveTrabajador, sbDeleteTrabajador, showOv, closeOv,
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

/* Stubs — worker-modal.js provides the real implementations when in Turnos */
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
  var staff=_trabWorkers;
  try{
    var frames=window.parent.document.querySelectorAll('iframe');
    frames.forEach(function(f){
      try{var loc=f.contentWindow&&f.contentWindow.L&&f.contentWindow.L();if(loc&&loc.staff&&loc.staff.length)_trabWorkers=staff=loc.staff;}catch(e){}
    });
  }catch(e){}
  var h='';
  staff.forEach(function(w){
    var sec=w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos';
    var estado=w.estado||'activo';
    var estadoBadge={
      activo:      '<span class="trab-estado activo">&#9679; Activo</span>',
      invitado:    '<span class="trab-estado invitado">&#9679; Invitado</span>',
      sin_acceso:  '<span class="trab-estado sin-acceso">&#9679; Sin acceso</span>',
      sin_telefono:'<span class="trab-estado sin-tel">&#9679; Sin tel&#233;fono</span>',
    }[estado]||'';
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
  var nombreEl=document.getElementById('inv-nombre'),telEl=document.getElementById('inv-tel');
  var nombre=(nombreEl.value||'').trim(),tel=(telEl.value||'').trim();
  var secBtn=document.querySelector('.inv-sec-btn.active'),sec=secBtn?secBtn.getAttribute('data-sec'):'sala';
  if(!nombre){inv_fieldError(nombreEl,'Introduce el nombre completo');return;}
  var dupNombre=_trabWorkers.find(function(w){return w.name.toLowerCase()===nombre.toLowerCase();});
  if(dupNombre){inv_fieldError(nombreEl,'Ya existe un trabajador llamado '+nombre+' en este local');return;}
  if(tel){
    if(!/^[+\d\s]{6,}$/.test(tel)){inv_fieldError(telEl,'El formato del teléfono no es válido');return;}
    var dupTel=_trabWorkers.find(function(w){return(w.tel||'').replace(/\s/g,'')===(tel.replace(/\s/g,''));});
    if(dupTel){inv_fieldError(telEl,'Este teléfono ya pertenece a '+dupTel.name);return;}
  }
  var newWorker={name:nombre,sec:sec,tel:tel,email:'',photo:null,minT:3,maxT:6,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:'eventual',skills:{},estado:tel?'sin_acceso':'sin_telefono'};
  _trabWorkers.push(newWorker);
  sbSaveTrabajador(newWorker).catch(function(e){console.warn('[SB] create worker failed:',e);});
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
function deleteWorker(name){
  var w=getW(name);
  if(w) sbDeleteTrabajador(w._sbId||w.id).catch(function(e){console.warn('[SB] deleteWorker failed:',e);});
  _trabWorkers=_trabWorkers.filter(function(x){return x.name!==name;});
}
