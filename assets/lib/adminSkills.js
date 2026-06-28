/* adminSkills.js — Gestión de Habilidades / Skills
   Globals required: showOv, closeOv, showToast, doDeleteWorker, getW, _previewName, curLocal */

var _editSkillId = null, _skillCat = 'cocina';
var _skillEmoji = '⭐', _skillEmojiExpanded = false;
var SKILL_EMOJIS = ['🍺','🍳','📋','🥗','🤝','📦','🍞','🪑','🏃','📅','⭐','🔥','🎯','💪','🔑','📊','🧹','🚀','💡','🎨','🎭','🎪','🥂','🍾','🧊','🔧','🌿','🧂','🫙','🎸'];
var SKILL_EMOJIS_EXTRA = ['🏆','🎖️','🥇','🎗️','🏅','🎀','💎','👑','🌟','✨','💫','⚡','🌈','🎆','🎇','🧨'];
var LG_SKILLS_KEY = 'lg_skills_v1';

var ROLES_COCINA = [
  {id:'raciones',icon:'🍽️',label:'Raciones'},
  {id:'plancha',icon:'🍳',label:'Plancha / Freidora'},
  {id:'pase',icon:'📋',label:'Pase'},
  {id:'preparacion',icon:'🥗',label:'Preparación'},
  {id:'apoyo_cocina',icon:'🤝',label:'Apoyo Cocina'},
  {id:'stock_cocina',icon:'📦',label:'Stock Cocina'},
];
var ROLES_SALA = [
  {id:'barra',icon:'🍺',label:'Barra'},
  {id:'tostas',icon:'🍞',label:'Tostas'},
  {id:'camarero',icon:'🪑',label:'Camarero'},
  {id:'runner',icon:'🏃',label:'Runner'},
  {id:'reservas',icon:'📅',label:'Reservas'},
  {id:'apoyo_sala',icon:'🤝',label:'Apoyo Sala'},
  {id:'stock_sala',icon:'📦',label:'Stock Sala'},
];

function openSkillsPanel(){
  document.getElementById('view-editar-list').style.display='none';
  document.getElementById('view-skills').classList.add('active');
  renderSkillsList();
}
function closeSkillsPanel(){
  document.getElementById('view-skills').classList.remove('active');
  document.getElementById('view-editar-list').style.display='';
}
function renderSkillsList(){
  var list=document.getElementById('skills-list');if(!list)return;
  var h='';
  if(ROLES_COCINA.length){h+='<div class="skill-cat-header">Cocina</div>';ROLES_COCINA.forEach(function(r){h+='<div class="zona-row skill-row-item" data-id="'+r.id+'" data-cat="cocina"><div style="font-size:20px;width:28px;text-align:center">'+r.icon+'</div><div class="zona-name" style="flex:1">'+r.label+'</div><span class="skill-cat-badge">Cocina</span><span class="zona-arrow">›</span></div>';});}
  if(ROLES_SALA.length){h+='<div class="skill-cat-header">Sala</div>';ROLES_SALA.forEach(function(r){h+='<div class="zona-row skill-row-item" data-id="'+r.id+'" data-cat="sala"><div style="font-size:20px;width:28px;text-align:center">'+r.icon+'</div><div class="zona-name" style="flex:1">'+r.label+'</div><span class="skill-cat-badge">Sala</span><span class="zona-arrow">›</span></div>';});}
  if(!h)h='<div class="zona-empty">Sin habilidades.</div>';
  h+='<div style="padding:12px 0 4px"><button onclick="openNuevaSkill()" style="width:100%;padding:13px;border-radius:10px;border:1.5px dashed var(--acc-bd);background:transparent;color:var(--acc);font-size:13px;font-weight:600;cursor:pointer">+ Añadir habilidad</button></div>';
  list.innerHTML=h;
  list.querySelectorAll('.skill-row-item').forEach(function(el){el.addEventListener('click',function(){openEditSkill(el.dataset.id,el.dataset.cat);});});
}
function openNuevaSkill(){
  _editSkillId=null;_skillCat='cocina';_skillEmoji='⭐';_skillEmojiExpanded=false;
  document.getElementById('modal-skill-title').textContent='Editar / añadir habilidad';
  document.getElementById('skill-nombre').value='';document.getElementById('skill-activa').checked=true;
  document.getElementById('btn-del-skill').style.display='none';
  document.getElementById('btn-save-skill').textContent='+ Añadir habilidad';
  document.querySelectorAll('.lugar-btn').forEach(function(b){b.classList.toggle('active',b.dataset.cat==='cocina');});
  var sw=document.getElementById('skill-emoji-wrap');if(sw)sw.classList.add('collapsed');
  renderSkillEmojiGrid(false);document.getElementById('modal-skill').classList.add('show');
}
function openEditSkill(id,cat){
  var roles=cat==='cocina'?ROLES_COCINA:ROLES_SALA;
  var skill=roles.find(function(r){return r.id===id;});if(!skill)return;
  _editSkillId=id;_skillCat=cat;_skillEmoji=skill.icon||'⭐';_skillEmojiExpanded=false;
  document.getElementById('modal-skill-title').textContent='Editar / añadir habilidad';
  document.getElementById('skill-nombre').value=skill.label;document.getElementById('skill-activa').checked=true;
  document.getElementById('btn-del-skill').style.display='block';
  document.getElementById('btn-save-skill').textContent='Guardar habilidad';
  document.querySelectorAll('.lugar-btn').forEach(function(b){b.classList.toggle('active',b.dataset.cat===cat);});
  var sw=document.getElementById('skill-emoji-wrap');if(sw)sw.classList.add('collapsed');
  renderSkillEmojiGrid(false);document.getElementById('modal-skill').classList.add('show');
}
function closeModalSkill(){document.getElementById('modal-skill').classList.remove('show');}
function selectSkillCat(btn){_skillCat=btn.dataset.cat;document.querySelectorAll('.lugar-btn').forEach(function(b){b.classList.toggle('active',b===btn);});}
function renderSkillEmojiGrid(expanded){
  _skillEmojiExpanded=expanded;
  var emojis=expanded?SKILL_EMOJIS.concat(SKILL_EMOJIS_EXTRA):SKILL_EMOJIS;
  var grid=document.getElementById('skill-emoji-grid');if(!grid)return;
  var h='';
  emojis.forEach(function(e){h+='<button class="emoji-opt'+(e===_skillEmoji?' act':'')+'" data-emoji="'+e+'" type="button">'+e+'</button>';});
  grid.innerHTML=h;
  grid.querySelectorAll('.emoji-opt').forEach(function(btn){btn.addEventListener('click',function(){pickSkillEmoji(btn.getAttribute('data-emoji'));});});
  var wrap=document.getElementById('skill-emoji-wrap'),chev=document.getElementById('skill-emoji-chev'),lbl=document.getElementById('skill-emoji-lbl');
  if(wrap){if(expanded){wrap.classList.remove('collapsed');wrap.style.maxHeight='';}else{wrap.classList.add('collapsed');wrap.style.maxHeight='';}}
  if(chev)chev.style.transform=expanded?'rotate(180deg)':'';
  if(lbl)lbl.textContent=expanded?'Ver menos':'Ver más iconos';
}
function pickSkillEmoji(e){_skillEmoji=e;renderSkillEmojiGrid(_skillEmojiExpanded);}
function toggleSkillEmojis(){renderSkillEmojiGrid(!_skillEmojiExpanded);}
function saveSkill(){
  var nombre=document.getElementById('skill-nombre').value.trim();if(!nombre){alert('Introduce un nombre');return;}
  var s={id:nombre.toLowerCase().replace(/\s+/g,'_'),label:nombre,icon:_skillEmoji};
  if(_editSkillId){var arr=_skillCat==='cocina'?ROLES_COCINA:ROLES_SALA;var i=arr.findIndex(function(r){return r.id===_editSkillId;});if(i>=0)arr[i]=s;}
  else{if(_skillCat==='cocina')ROLES_COCINA.push(s);else ROLES_SALA.push(s);}
  saveSkillsLocal();closeModalSkill();renderSkillsList();
}
function promptDelSkill(){
  if(!_editSkillId)return;
  var skill=ROLES_COCINA.concat(ROLES_SALA).find(function(r){return r.id===_editSkillId;});
  var name=skill?skill.label:'esta habilidad';
  var body=document.getElementById('confirm-body');if(body)body.textContent='Vas a eliminar "'+name+'". Los trabajadores que la tengan asignada la perderán.';
  var btn=document.querySelector('#ov-confirm .mbtn-d');if(btn){btn.textContent='Sí, eliminar';btn.onclick=doDeleteSkill;}
  var cancel=document.querySelector('#ov-confirm .mbtn-c');if(cancel){cancel.onclick=function(){closeOv('ov-confirm');showOv('modal-skill');};}
  closeModalSkill();showOv('ov-confirm');
}
function doDeleteSkill(){
  closeOv('ov-confirm');
  ROLES_COCINA=ROLES_COCINA.filter(function(r){return r.id!==_editSkillId;});
  ROLES_SALA=ROLES_SALA.filter(function(r){return r.id!==_editSkillId;});
  saveSkillsLocal();renderSkillsList();
  var btn=document.querySelector('#ov-confirm .mbtn-d');if(btn){btn.textContent='Sí, eliminar';btn.onclick=doDeleteWorker;}
  var cancel=document.querySelector('#ov-confirm .mbtn-c');if(cancel){cancel.onclick=function(){closeOv('ov-confirm');showOv('ov-preview');};}
  if(typeof showToast==='function')showToast('Habilidad eliminada');
}

function ensureWorkerExtras(w){
  if(!w.prioridad)w.prioridad='eventual';
  if(!w.skills){
    w.skills={};
    var defaults=w.sec==='sala'?{barra:'puede',camarero_salon:'domina',camarero_terraza:'puede',camarero_sala:'puede'}:w.sec==='cocina'?{plancha:'puede',pase:'domina',raciones:'puede'}:{};
    Object.assign(w.skills,defaults);
  }
}

function renderSkills(){
  var w=getW(_previewName);if(!w)return;
  ensureWorkerExtras(w);
  var cont=document.getElementById('skills-body');if(!cont)return;
  var showC=w.sec==='cocina'||w.sec==='ambos';
  var showS=w.sec==='sala'||w.sec==='ambos';
  var mkRow=function(r){
    var cur=(w.skills[r.id]||'none');
    var mkP=function(lv,lbl){return '<button class="skill-pill'+(cur===lv?' sp-'+lv:'')+'" onclick="setSkill(\''+r.id+'\',\''+lv+'\')">'+lbl+'</button>';};
    return '<div class="skill-row"><span class="skill-icon">'+r.icon+'</span><span class="skill-name">'+r.label+'</span><div class="skill-pill-group">'+mkP('none','—')+mkP('puede','🟡')+mkP('domina','🟢')+'</div></div>';
  };
  var h='';
  if(showC){h+='<div class="skill-dept-lbl">🍳 Cocina</div>';ROLES_COCINA.forEach(function(r){h+=mkRow(r);});}
  if(showS){h+='<div class="skill-dept-lbl">🍺 Sala</div>';ROLES_SALA.forEach(function(r){h+=mkRow(r);});}
  cont.innerHTML=h;
}
function setSkill(roleId,level){var w=getW(_previewName);if(!w)return;ensureWorkerExtras(w);w.skills[roleId]=level;renderSkills();}

function openSkillsModal(){
  var w=getW(_previewName);if(!w)return;
  if(!w.skills)w.skills={};
  document.getElementById('skills-modal-sub').textContent=w.name+' · '+(w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos');
  var mkRow=function(r){
    var cur=w.skills[r.id]||'none';
    var mkBtn=function(lv,lbl){return '<button class="skill-pill sp-'+(lv==='none'?'none':lv)+(cur===lv?' sp-'+lv:'')+'" style="'+(cur===lv&&lv!=='none'?'':'opacity:.5')+'" onclick="setSkillLive(\''+r.id+'\',\''+lv+'\',this)">'+lbl+'</button>';};
    return '<div class="skill-row"><span class="skill-icon">'+r.icon+'</span><span class="skill-name">'+r.label+'</span><div class="skill-pill-group">'+mkBtn('none','—')+mkBtn('puede','🟡 Puede')+mkBtn('domina','🟢 Domina')+'</div></div>';
  };
  var h='<div class="skill-dept-lbl">Cocina</div>'+ROLES_COCINA.map(mkRow).join('');
  h+='<div class="skill-dept-lbl">Sala</div>'+ROLES_SALA.map(mkRow).join('');
  document.getElementById('skills-modal-body').innerHTML=h;
  showOv('ov-skills');
}
function setSkillLive(roleId,level,btn){
  var w=getW(_previewName);if(!w)return;
  if(!w.skills)w.skills={};
  w.skills[roleId]=level;
  var row=btn.closest('.skill-row');
  if(row)row.querySelectorAll('.skill-pill').forEach(function(b){b.style.opacity='.5';});
  btn.style.opacity='1';
}
function applySkills(){
  var w=getW(_previewName);
  if(w){
    if(!w.skills)w.skills={};
    var hasCocina=ROLES_COCINA.some(function(r){return(w.skills[r.id]||'none')!=='none';});
    var hasSala=ROLES_SALA.some(function(r){return(w.skills[r.id]||'none')!=='none';});
    if(hasCocina&&hasSala)w.sec='ambos';else if(hasCocina)w.sec='cocina';else if(hasSala)w.sec='sala';
    var sub=document.getElementById('prev-sub');
    if(sub)sub.textContent=(w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos')+' · '+(curLocal==='galeria'?'La Galería':'La Sala');
    var estado=w.estado||'activo';
    var estadoEl=document.getElementById('prev-estado');
    if(estadoEl){var eLabels={activo:'🟢 Activo',invitado:'🟡 Invitado',sin_acceso:'⚪ Sin acceso',sin_telefono:'⚪ Sin teléfono'};estadoEl.textContent=eLabels[estado]||'';}
    var invBtn=document.getElementById('prev-invite-btn');
    if(invBtn){
      if(estado==='sin_acceso'){invBtn.style.display='';invBtn.textContent='📱 Enviar invitación';invBtn.onclick=function(){prev_sendInvite(w.name);};}
      else if(estado==='sin_telefono'){invBtn.style.display='';invBtn.textContent='📞 Añade teléfono para dar acceso';invBtn.style.opacity='.5';invBtn.style.pointerEvents='none';}
      else{invBtn.style.display='none';}
    }
  }
  renderSkillsSummary();closeOv('ov-skills');showToast('Skills actualizados');
}
function renderSkillsSummary(){
  var w=getW(_previewName);if(!w)return;
  var cont=document.getElementById('skills-body');if(!cont)return;
  if(!w.skills)w.skills={};
  var ALL=ROLES_COCINA.concat(ROLES_SALA);
  var ICON={puede:'🟡',domina:'🟢'};
  var active=ALL.filter(function(r){return(w.skills[r.id]||'none')!=='none';});
  if(!active.length){cont.innerHTML='<div style="font-size:11px;color:var(--faint);padding:4px 0;font-style:italic">Sin skills configurados</div>';return;}
  cont.innerHTML=active.map(function(r){
    return '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:5px;background:var(--acc-bg);border:1px solid var(--acc-bd);color:var(--acc);margin:2px">'+r.icon+' '+r.label+' '+(ICON[w.skills[r.id]]||'')+'</span>';
  }).join('');
}

function loadSkillsLocal(){
  try{
    var raw=localStorage.getItem(LG_SKILLS_KEY);if(!raw)return;
    var data=JSON.parse(raw);
    if(data.cocina&&data.cocina.length){ROLES_COCINA.length=0;data.cocina.forEach(function(r){ROLES_COCINA.push(r);});}
    if(data.sala&&data.sala.length){ROLES_SALA.length=0;data.sala.forEach(function(r){ROLES_SALA.push(r);});}
  }catch(e){console.warn('loadSkillsLocal failed',e);}
}
function saveSkillsLocal(){
  try{localStorage.setItem(LG_SKILLS_KEY,JSON.stringify({cocina:ROLES_COCINA,sala:ROLES_SALA}));}catch(e){console.warn('saveSkillsLocal failed',e);}
}
