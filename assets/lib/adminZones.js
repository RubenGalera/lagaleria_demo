/* adminZones.js — Gestión de Zonas
   Usa el modal compartido AdminEntityModal (assets/lib/admin-entity-modal.js).
   Globals required: localId, toast, supaFetch, escHtml, showConfirm, AdminEntityModal */

var zonas = [];
var editingZonaId = null;

var EMOJIS = [
  '☀️','🌙','🌿','🌊','🏡','🚪','🍷','🍺','🎭','🎪',
  '🪑','🛋️','🌺','⛱️','🔥','💫','🎵','🏮','🕯️','🌸',
  '🍃','🏛️','🎨','🌴','🍾','✨','🎬','🎩',
];


var LG_ZONAS_KEY = 'lg_zonas_v1';
var ZONAS_DEFAULT = [
  {id:101,nombre:'Terraza',emoji:'☀️',mesas:8,pax:24,activa:true,orden:1},
  {id:102,nombre:'Entrada',emoji:'🚪',mesas:4,pax:12,activa:true,orden:2},
  {id:103,nombre:'Barra',emoji:'🍷',mesas:6,pax:18,activa:true,orden:3},
  {id:104,nombre:'Sala',emoji:'🪑',mesas:10,pax:30,activa:true,orden:4},
  {id:105,nombre:'Salón',emoji:'🎭',mesas:6,pax:20,activa:true,orden:5},
];

async function fetchZonas(){
  if(!localId) return;
  try{
    var res = await supaFetch('/rest/v1/zonas?select=*&local_id=eq.'+localId+'&order=orden.asc,nombre.asc');
    if(!res.ok) throw new Error(res.status);
    zonas = await res.json();
    updateZonasUI();
  }catch(e){
    console.error('fetchZonas', e);
    renderZonaList('<div class="state-msg error">Error cargando zonas.</div>');
  }
}

function updateZonasUI(){
  var count = zonas.length;
  var sz = document.getElementById('stat-zonas'); if(sz) sz.textContent = count;
  var bz = document.getElementById('badge-zonas'); if(bz) bz.textContent = count;
  renderZonaList(buildZonaListHTML());
}

function buildZonaListHTML(){
  if(!zonas.length) return '<div class="zona-empty">Sin zonas todavía.<br>Crea la primera con el botón de abajo.</div>';
  var html = zonas.map(function(z){
    var inactiva = z.activa === false;
    return '<div class="zona-row" style="opacity:'+(inactiva?.55:1)+'" onclick="openEditZona(\''+z.id+'\')">'+
      '<span class="zona-emoji">'+(z.emoji||'🪑')+'</span>'+
      '<div class="zona-info"><div class="zona-name">'+escHtml(z.nombre)+(inactiva?'<span class="zona-inactiva">INACTIVA</span>':'')+'</div>'+
      '<div class="zona-sub">'+z.mesas+' mesas'+(z.pax?' · '+z.pax+' personas':'')+'</div></div>'+
      '<span class="zona-arrow">›</span></div>';
  }).join('');
  html += '<button class="btn-nueva-zona" onclick="openNewZona()">+ Nueva zona</button>';
  return html;
}

function renderZonaList(html){
  document.getElementById('zona-list').innerHTML = html;
  if(zonas.length && !document.querySelector('.btn-nueva-zona')){
    document.getElementById('zona-list').insertAdjacentHTML('beforeend','<button class="btn-nueva-zona" onclick="openNewZona()">+ Nueva zona</button>');
  }
}

async function createZona(data){
  setBtnLoading(true);
  if(!localId){
    var newZ = Object.assign({id:'z'+Date.now(), orden:zonas.length, activa:true}, data);
    zonas.push(newZ); updateZonasUI(); AdminEntityModal.close(); toast('Zona creada ✓ (mock)'); setBtnLoading(false); return;
  }
  try{
    var body = Object.assign({local_id:localId, orden:zonas.length}, data);
    var res = await supaFetch('/rest/v1/zonas', {method:'POST', body:JSON.stringify(body)});
    if(!res.ok){ var e=await res.json(); throw new Error(e.message||res.status); }
    var created = await res.json();
    zonas.push(Array.isArray(created)?created[0]:created);
    updateZonasUI(); AdminEntityModal.close(); toast('Zona creada ✓');
  }catch(e){ toast('Error: '+e.message); }
  finally{ setBtnLoading(false); }
}

async function updateZona(id, data){
  setBtnLoading(true);
  if(!localId){
    var idx=zonas.findIndex(function(z){return z.id===id;});
    if(idx>=0) zonas[idx]=Object.assign(zonas[idx],data);
    updateZonasUI(); AdminEntityModal.close(); toast('Zona guardada ✓ (mock)'); setBtnLoading(false); return;
  }
  try{
    var res = await supaFetch('/rest/v1/zonas?id=eq.'+id, {method:'PATCH', body:JSON.stringify(data)});
    if(!res.ok){ var e=await res.json(); throw new Error(e.message||res.status); }
    var idx=zonas.findIndex(function(z){return z.id===id;});
    if(idx>=0) zonas[idx]=Object.assign(zonas[idx],data);
    updateZonasUI(); AdminEntityModal.close(); toast('Zona guardada ✓');
  }catch(e){ toast('Error: '+e.message); }
  finally{ setBtnLoading(false); }
}

async function deleteZona(id){
  if(!localId){
    zonas=zonas.filter(function(z){return z.id!==id;}); updateZonasUI(); AdminEntityModal.close(); toast('Zona eliminada (mock)'); return;
  }
  try{
    var res = await supaFetch('/rest/v1/zonas?id=eq.'+id, {method:'DELETE'});
    if(!res.ok){ var e=await res.json(); throw new Error(e.message||res.status); }
    zonas=zonas.filter(function(z){return z.id!==id;}); updateZonasUI(); AdminEntityModal.close(); toast('Zona eliminada');
  }catch(e){ toast('Error: '+e.message); }
}

function openZonas(){
  document.getElementById('view-editar-list').style.display='none';
  document.getElementById('view-zonas').classList.add('active');
  if(!zonas.length && localId) fetchZonas();
}

function closeZonas(){
  ['view-zonas','view-skills','view-trabajadores','view-weekconfig','view-stock-admin'].forEach(function(v){var e=document.getElementById(v);if(e)e.classList.remove('active');});
  document.getElementById('view-editar-list').style.display='';
}

function _zonaFieldsHtml(){
  return [
    '<div class="steppers">' +
      '<div class="fgroup"><label class="flbl">Mesas máx.</label><div class="step-row">' +
        '<button class="step-btn" type="button" onclick="stepField(\'z-mesas\',-1,1,50)">−</button>' +
        '<input class="inp step-inp" id="z-mesas" type="number" min="1" max="50" placeholder="4">' +
        '<button class="step-btn" type="button" onclick="stepField(\'z-mesas\',1,1,50)">+</button>' +
      '</div></div>' +
      '<div class="fgroup"><label class="flbl">Personas máx.</label><div class="step-row">' +
        '<button class="step-btn" type="button" onclick="stepField(\'z-pax\',-1,1,999)">−</button>' +
        '<input class="inp step-inp" id="z-pax" type="number" min="1" max="999" placeholder="12">' +
        '<button class="step-btn" type="button" onclick="stepField(\'z-pax\',1,1,999)">+</button>' +
      '</div></div>' +
    '</div>'
  ];
}

function openNewZona(){
  editingZonaId=null;
  AdminEntityModal.open({
    title:'Nueva zona',
    saveLabel:'Guardar zona',
    nombre:'',
    nombrePlaceholder:'Terraza...',
    activo:true,
    activoLabel:'Activa',
    fields:_zonaFieldsHtml(),
    icons:EMOJIS,
    icono:'🪑',
    onRender:function(){
      document.getElementById('z-mesas').value='';
      document.getElementById('z-pax').value='';
    },
    onSave:_saveZonaFromModal,
    onDelete:null
  });
}

function openEditZona(id){
  var z=zonas.find(function(x){return x.id===id;});if(!z)return;
  editingZonaId=id;
  AdminEntityModal.open({
    title:'Editar zona',
    saveLabel:'Guardar zona',
    deleteLabel:'Eliminar zona',
    nombre:z.nombre,
    activo:z.activa!==false,
    activoLabel:'Activa',
    fields:_zonaFieldsHtml(),
    icons:EMOJIS,
    icono:z.emoji||'🪑',
    onRender:function(){
      document.getElementById('z-mesas').value=z.mesas||'';
      document.getElementById('z-pax').value=z.pax||'';
    },
    onSave:_saveZonaFromModal,
    onDelete:function(){ AdminEntityModal.close(); promptDelZona(); }
  });
}

function _saveZonaFromModal(data){
  var nombre=(data.nombre||'').trim();
  if(!nombre){ toast('Introduce un nombre'); return; }
  var payload={nombre:nombre,emoji:data.icono||'🪑',mesas:parseInt(data['z-mesas'])||4,pax:parseInt(data['z-pax'])||null,activa:data.activo!==false};
  if(editingZonaId){ updateZona(editingZonaId,payload); } else { createZona(payload); }
}

function promptDelZona(){
  var z=zonas.find(function(x){return x.id===editingZonaId;});
  var name=z?z.nombre:'esta zona';
  showConfirm({message:'Vas a eliminar la zona "'+name+'". Las reservas asociadas no se eliminarán.',onConfirm:function(){if(editingZonaId)deleteZona(editingZonaId);}});
}

function setBtnLoading(loading){
  var btn=document.getElementById('_aem-save');
  if(!btn) return;
  btn.disabled=loading;
  btn.textContent=loading?'Guardando...':'Guardar zona';
}

function loadZonasFromParent(){
  var loaded = false;
  try{
    var local = window.parent.getActiveLocal();
    if(local && local.zonas && local.zonas.length){
      zonas = local.zonas.map(function(z){
        return {id:String(z.id), nombre:z.nombre, emoji:z.emoji, mesas:z.mesas, pax:z.pax, activa:z.activa!==false, orden:0};
      });
      var bt = document.getElementById('badge-trabajadores'); if(bt) bt.textContent = local.trabajadores || '—';
      var sln = document.getElementById('sec-local-name'); if(sln) sln.textContent = local.nombre;
      loaded = true;
    }
  }catch(e){ console.warn('loadZonasFromParent', e); }
  if(!loaded){
    zonas = [];
    renderZonaList('<div class="state-msg error">No se pudieron cargar las zonas desde el panel principal.<button class="btn-volver" onclick="closeZonas()" style="display:block;margin-top:12px">← Volver a Admin</button></div>');
    return;
  }
  updateZonasUI();
}

function loadZonasLocal(){
  try{var raw=localStorage.getItem(LG_ZONAS_KEY);if(raw){zonas=JSON.parse(raw);updateZonasUI();return;}}catch(e){}
  zonas=JSON.parse(JSON.stringify(ZONAS_DEFAULT));saveZonasLocal();updateZonasUI();
}
function saveZonasLocal(){
  try{localStorage.setItem(LG_ZONAS_KEY,JSON.stringify(zonas));}catch(e){console.warn('saveZonasLocal failed',e);}
}
