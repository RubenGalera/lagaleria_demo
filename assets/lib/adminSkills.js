/* adminSkills.js — Gestión de Habilidades / Skills
   Usa el modal compartido AdminEntityModal (assets/lib/admin-entity-modal.js).
   Globals required: showOv, closeOv, showToast, toast, showConfirm, getW, _previewName, curLocal, AdminEntityModal */

var _editSkillId = null, _skillCat = 'cocina';
var SKILL_EMOJIS = ['🍺','🍳','📋','🥗','🤝','📦','🍞','🪑','🏃','📅','⭐','🔥','🎯','💪','🔑','📊','🧹','🚀','💡','🎨','🎭','🎪','🥂','🍾','🧊','🔧','🌿','🧂','🫙','🎸'];
var SKILL_EMOJIS_EXTRA = ['🏆','🎖️','🥇','🎗️','🏅','🎀','💎','👑','🌟','✨','💫','⚡','🌈','🎆','🎇','🧨'];
var SKILL_ICONS = SKILL_EMOJIS.concat(SKILL_EMOJIS_EXTRA);
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
  h+='<div class="skill-cat-header">Cocina</div>';
  ROLES_COCINA.forEach(function(r){h+='<div class="zona-row skill-row-item" data-id="'+r.id+'" data-cat="cocina"><span class="zona-emoji">'+r.icon+'</span><div class="zona-info"><div class="zona-name">'+escHtml(r.label)+'</div></div><span class="zona-arrow">›</span></div>';});
  h+='<button class="btn-nueva-zona" data-newcat="cocina">+ Añadir a Cocina</button>';
  h+='<div class="skill-cat-header">Sala</div>';
  ROLES_SALA.forEach(function(r){h+='<div class="zona-row skill-row-item" data-id="'+r.id+'" data-cat="sala"><span class="zona-emoji">'+r.icon+'</span><div class="zona-info"><div class="zona-name">'+escHtml(r.label)+'</div></div><span class="zona-arrow">›</span></div>';});
  h+='<button class="btn-nueva-zona" data-newcat="sala">+ Añadir a Sala</button>';
  list.innerHTML=h;
  list.querySelectorAll('.skill-row-item').forEach(function(el){el.addEventListener('click',function(){openEditSkill(el.dataset.id,el.dataset.cat);});});
  list.querySelectorAll('[data-newcat]').forEach(function(btn){btn.addEventListener('click',function(){openNuevaSkill(btn.dataset.newcat);});});
}
function openNuevaSkill(cat){
  _editSkillId=null;_skillCat=cat||'cocina';
  AdminEntityModal.open({
    title:'Nueva habilidad',
    saveLabel:'+ Añadir habilidad',
    nombre:'',
    nombrePlaceholder:'Barra, Plancha...',
    activo:true,
    activoLabel:'Activa',
    icons:SKILL_ICONS,
    icono:'⭐',
    onSave:saveSkill,
    onDelete:null
  });
}
function openEditSkill(id,cat){
  var roles=cat==='cocina'?ROLES_COCINA:ROLES_SALA;
  var skill=roles.find(function(r){return r.id===id;});if(!skill)return;
  _editSkillId=id;_skillCat=cat;
  AdminEntityModal.open({
    title:'Editar habilidad',
    saveLabel:'Guardar habilidad',
    deleteLabel:'Eliminar habilidad',
    nombre:skill.label,
    activo:true,
    activoLabel:'Activa',
    icons:SKILL_ICONS,
    icono:skill.icon||'⭐',
    onSave:saveSkill,
    onDelete:function(){ AdminEntityModal.close(); promptDelSkill(); }
  });
}
function saveSkill(data){
  var nombre=(data.nombre||'').trim();
  if(!nombre){ toast('Introduce un nombre'); return; }
  var s={id:_editSkillId||nombre.toLowerCase().replace(/\s+/g,'_'),label:nombre,icon:data.icono||'⭐'};
  if(_editSkillId){
    var arr=_skillCat==='cocina'?ROLES_COCINA:ROLES_SALA;
    var i=arr.findIndex(function(r){return r.id===_editSkillId;});
    if(i>=0)arr[i]=s;
  } else {
    if(_skillCat==='cocina')ROLES_COCINA.push(s);else ROLES_SALA.push(s);
  }
  saveSkillsLocal();
  AdminEntityModal.close();
  renderSkillsList();
}
function promptDelSkill(){
  if(!_editSkillId)return;
  var skill=ROLES_COCINA.concat(ROLES_SALA).find(function(r){return r.id===_editSkillId;});
  var name=skill?skill.label:'esta habilidad';
  showConfirm({
    title:'¿Eliminar habilidad?',
    message:'Vas a eliminar "'+name+'". Los trabajadores que la tengan asignada la perderán.',
    confirmLabel:'Sí, eliminar',
    onConfirm:doDeleteSkill
  });
}
function doDeleteSkill(){
  ROLES_COCINA=ROLES_COCINA.filter(function(r){return r.id!==_editSkillId;});
  ROLES_SALA=ROLES_SALA.filter(function(r){return r.id!==_editSkillId;});
  saveSkillsLocal();
  renderSkillsList();
  toast('Habilidad eliminada');
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
