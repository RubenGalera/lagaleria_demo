/* adminWeekConfig.js — Plantilla de turnos (WeekConfig)
   Globals required: ROLES_COCINA, ROLES_SALA (adminSkills.js), showToast */

var slotTimes = {sm:'12:30',sn:'20:00',cm:'12:00',cn:'20:00'};
var LG_WEEKCONFIG_KEY = 'lg_weekconfig_v1';

var SLOT_NAMES = {sm:'Sala mediodía',sn:'Sala noche',cm:'Cocina mediodía',cn:'Cocina noche'};
/* SLOT_ROLES references ROLES_COCINA/SALA defined in adminSkills.js (loads first) */
var SLOT_ROLES = {sm:ROLES_SALA,sn:ROLES_SALA,cm:ROLES_COCINA,cn:ROLES_COCINA};
var DAYS_SHORT = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
var DAYS_S = DAYS_SHORT;
var DAYS_L = ['Lunes 18','Martes 19','Miércoles 20','Jueves 21','Viernes 22','Sábado 23','Domingo 24'];

var weekNeeds = {
  sm:{barra:1,camarero_salon:2,camarero_terraza:1,camarero_sala:0,jefe_sala:0,plancha:0,pase:0,raciones:0,jefe_cocina:0},
  sn:{barra:1,camarero_salon:2,camarero_terraza:1,camarero_sala:1,jefe_sala:1,plancha:0,pase:0,raciones:0,jefe_cocina:0},
  cm:{plancha:1,pase:1,raciones:1,jefe_cocina:1,barra:0,camarero_salon:0,camarero_terraza:0,camarero_sala:0,jefe_sala:0},
  cn:{plancha:1,pase:1,raciones:0,jefe_cocina:1,barra:0,camarero_salon:0,camarero_terraza:0,camarero_sala:0,jefe_sala:0},
};

var weekConfig = (function(){
  var cfg = {};
  for(var d=0;d<7;d++){
    cfg[d]={};
    ['sm','sn','cm','cn'].forEach(function(slot){
      var needs=weekNeeds[slot],roles=SLOT_ROLES[slot];
      cfg[d][slot]=[];
      roles.forEach(function(r){var n=needs[r.id]||0;for(var i=0;i<n;i++)cfg[d][slot].push({roleId:r.id,level:'domina'});});
    });
  }
  return cfg;
})();

var _wcDirty = false;

function openWeekConfigPanel(){
  _wcDirty=false;
  var btn=document.getElementById('wc-save-btn');if(btn){btn.style.opacity='0';btn.style.pointerEvents='none';}
  document.getElementById('view-editar-list').style.display='none';
  document.getElementById('view-weekconfig').classList.add('active');
  renderWeekConfig();
}
function closeWeekConfigPanel(){
  document.getElementById('view-weekconfig').classList.remove('active');
  document.getElementById('view-editar-list').style.display='';
  _wcDirty=false;
}
function saveWeekConfigPanel(){
  _wcDirty=false;
  var btn=document.getElementById('wc-save-btn');if(btn){btn.style.opacity='0';btn.style.pointerEvents='none';}
  saveWeekConfigLocal();if(typeof showToast==='function')showToast('Guardado');
}
function _wcMarkDirty(){
  _wcDirty=true;
  var btn=document.getElementById('wc-save-btn');if(btn){btn.style.opacity='1';btn.style.pointerEvents='auto';}
}

function renderWeekConfig(){
  var body=document.getElementById('wc-body');if(!body)return;
  var SLOT_INFO=[
    {id:'sm',label:'Sala mediodía',icon:'🍺',color:'var(--sm-bd)',text:'var(--sm-text)'},
    {id:'sn',label:'Sala noche',icon:'🍺',color:'var(--sn-bd)',text:'var(--sn-text)'},
    {id:'cm',label:'Cocina mediodía',icon:'🍳',color:'var(--cm-bd)',text:'var(--cm-text)'},
    {id:'cn',label:'Cocina noche',icon:'🍳',color:'var(--cn-bd)',text:'var(--cn-text)'},
  ];
  var DAY_NAMES=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  var h='';
  for(var d=0;d<7;d++){
    h+='<div class="wc-day-block"><div class="wc-day-title">'+DAY_NAMES[d]+'</div>';
    SLOT_INFO.forEach(function(sl){
      var entries=(weekConfig[d]||{})[sl.id]||[];
      var roles=SLOT_ROLES[sl.id];
      h+='<div class="wc-slot-block" style="border-left:3px solid '+sl.color+'"><div class="wc-slot-title" style="color:'+sl.text+'"><span style="font-size:13px">'+sl.icon+'</span>'+sl.label+'</div>';
      if(!entries.length){
        h+='<div class="wc-empty-slot">Sin requisitos — pulsa + para añadir</div>';
      }else{
        entries.forEach(function(entry,idx){
          var role=roles.find(function(r){return r.id===entry.roleId;})||{icon:'?',label:entry.roleId};
          h+='<div class="wc-role-row" id="wcr-'+d+'-'+sl.id+'-'+idx+'">'+
            '<span class="wc-role-icon">'+role.icon+'</span>'+
            '<span class="wc-role-name">'+role.label+'</span>'+
            '<div class="wc-level-btns">'+
              '<button class="wc-lvl wc-puede'+(entry.level==='puede'?' active':'')+'" onclick="setWcLevel('+d+',\''+sl.id+'\','+idx+',\'puede\',this)">🟡 Puede</button>'+
              '<button class="wc-lvl wc-domina'+(entry.level==='domina'?' active':'')+'" onclick="setWcLevel('+d+',\''+sl.id+'\','+idx+',\'domina\',this)">🟢 Domina</button>'+
            '</div>'+
            '<button class="wc-del" onclick="removeWcEntry('+d+',\''+sl.id+'\','+idx+')">&#215;</button></div>';
        });
      }
      h+='<div class="wc-add-role">';
      roles.forEach(function(r){h+='<button class="wc-add-role-btn" onclick="addWcEntry('+d+',\''+sl.id+'\',\''+r.id+'\')">+ '+r.icon+' '+r.label+'</button>';});
      h+='</div></div>';
    });
    h+='</div>';
  }
  body.innerHTML=h;
}

function setWcLevel(day,slot,idx,level,btn){
  if(!weekConfig[day])return;
  var entries=weekConfig[day][slot];if(!entries||!entries[idx])return;
  entries[idx].level=level;
  var row=btn.closest('.wc-role-row');if(row)row.querySelectorAll('.wc-lvl').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');_wcMarkDirty();
}
function addWcEntry(day,slot,roleId){
  if(!weekConfig[day])weekConfig[day]={};if(!weekConfig[day][slot])weekConfig[day][slot]=[];
  weekConfig[day][slot].push({roleId:roleId,level:'domina'});renderWeekConfig();_wcMarkDirty();
  var dayBlocks=document.querySelectorAll('.wc-day-block');if(dayBlocks[day])dayBlocks[day].scrollIntoView({behavior:'smooth',block:'nearest'});
}
function removeWcEntry(day,slot,idx){
  if(!weekConfig[day]||!weekConfig[day][slot])return;
  weekConfig[day][slot].splice(idx,1);renderWeekConfig();_wcMarkDirty();
}

function loadWeekConfigLocal(){
  try{var raw=localStorage.getItem(LG_WEEKCONFIG_KEY);if(!raw)return;weekConfig=JSON.parse(raw);}
  catch(e){console.warn('loadWeekConfigLocal failed',e);}
}
function saveWeekConfigLocal(){
  try{localStorage.setItem(LG_WEEKCONFIG_KEY,JSON.stringify(weekConfig));}
  catch(e){console.warn('saveWeekConfigLocal failed',e);}
}
