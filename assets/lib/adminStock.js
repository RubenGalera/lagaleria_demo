/* adminStock.js — Gestión de Stock e Inventario
   Globals required: showOv, closeOv, showToast, doDeleteWorker */

var _stEditId=null,_stCurCat='all',_stCatColor='#5599cc';
var _stEditCatId=null,_stCatEmojiSelected='📦',_stCatEmojiExpanded=false;
var LG_STOCK_KEY='lg_stock_v1',LG_CATS_KEY='lg_stock_cats_v1',LG_LOCS_KEY='lg_stock_locs_v1';

var ST_CATS_DEFAULT=[
  {id:'beb',label:'Bebidas',icon:'🍺',color:'#5599cc'},
  {id:'ali',label:'Alimentación',icon:'🥩',color:'#5ab870'},
  {id:'lim',label:'Limpieza',icon:'🧴',color:'#60b8cc'},
  {id:'mat',label:'Material',icon:'📦',color:'#c89030'},
];
var ST_LOCS_DEFAULT=[{id:'d',label:'Almacén'},{id:'g',label:'Garaje'},{id:'a',label:'Ambos'}];
var ST_PRODS_DEFAULT=[
  {id:1,name:'Cerveza Estrella',cat:'beb',loc:'a',qty:8,min:24,unit:'bot',note:'Nevera grande barra',active:true},
  {id:2,name:'Vino tinto Arrocal',cat:'beb',loc:'g',qty:36,min:12,unit:'bot',note:'',active:true},
  {id:3,name:'Agua mineral 1.5L',cat:'beb',loc:'d',qty:48,min:24,unit:'bot',note:'',active:true},
  {id:4,name:'Refresco Coca-Cola',cat:'beb',loc:'d',qty:4,min:12,unit:'caja',note:'Quedan 2 abiertas',active:true},
  {id:5,name:'Cerveza sin alcohol',cat:'beb',loc:'d',qty:6,min:12,unit:'bot',note:'',active:true},
  {id:6,name:'Pollo entero',cat:'ali',loc:'g',qty:3,min:5,unit:'kg',note:'',active:true},
  {id:7,name:'Aceite AOVE',cat:'ali',loc:'d',qty:2,min:4,unit:'bot',note:'',active:true},
  {id:8,name:'Patatas fritas',cat:'ali',loc:'d',qty:8,min:6,unit:'bol',note:'',active:true},
  {id:9,name:'Jamón ibérico',cat:'ali',loc:'g',qty:1,min:2,unit:'pieza',note:'',active:true},
  {id:10,name:'Lejía',cat:'lim',loc:'d',qty:1,min:3,unit:'bot',note:'',active:true},
  {id:11,name:'Lavavajillas',cat:'lim',loc:'d',qty:3,min:2,unit:'bot',note:'',active:true},
  {id:12,name:'Papel cocina',cat:'lim',loc:'d',qty:4,min:8,unit:'rol',note:'',active:true},
  {id:13,name:'Servilletas',cat:'mat',loc:'d',qty:12,min:8,unit:'pak',note:'',active:true},
  {id:14,name:'Vasos desechables',cat:'mat',loc:'g',qty:2,min:4,unit:'pak',note:'',active:true},
  {id:15,name:'Bolsas basura',cat:'mat',loc:'d',qty:3,min:3,unit:'rol',note:'',active:true},
];

var _stCatEmojis=['🍺','🥩','🧴','📦','🍷','☕','🥗','🍕','🥤','🍾','🧃','🥛','🫙','🧂','🫒','🍳','🥘','🍱','🥡','🎂','🍰','🧁','🍫','🍬','🍭','🧹','🪣','🧽','🪥','🧻','🗑️','🪤','🔧','🔨','⚙️','🪛','🔩','📋','🗂️','🏷️','📎','✂️','📌','🖊️','🪑','🛋️','🪞','🪟','🚿','🛁'];

function _stLoadProds(){try{var r=localStorage.getItem(LG_STOCK_KEY);if(r)return JSON.parse(r);}catch(e){}var d=JSON.parse(JSON.stringify(ST_PRODS_DEFAULT));_stSaveProds(d);return d;}
function _stSaveProds(data){try{localStorage.setItem(LG_STOCK_KEY,JSON.stringify(data));}catch(e){}}
function _stLoadCats(){try{var r=localStorage.getItem(LG_CATS_KEY);if(r)return JSON.parse(r);}catch(e){}return JSON.parse(JSON.stringify(ST_CATS_DEFAULT));}
function _stSaveCats(cats){try{localStorage.setItem(LG_CATS_KEY,JSON.stringify(cats));}catch(e){}}
function _stLoadLocs(){try{var r=localStorage.getItem(LG_LOCS_KEY);if(r)return JSON.parse(r);}catch(e){}return JSON.parse(JSON.stringify(ST_LOCS_DEFAULT));}
function _stSaveLocs(locs){try{localStorage.setItem(LG_LOCS_KEY,JSON.stringify(locs));}catch(e){}}

function stSc(p){if(!p.qty||p.qty<=0)return 'red';if(p.qty<p.min*0.5)return 'red';if(p.qty<p.min)return 'amb';return 'grn';}

function openStockPanel(){
  document.getElementById('view-editar-list').style.display='none';
  document.getElementById('view-stock-admin').classList.add('active');
  stBuildCatBar();stFillSelects();stRenderProds();
}
function closeStockPanel(){
  document.getElementById('view-stock-admin').classList.remove('active');
  document.getElementById('view-editar-list').style.display='';
}

/* migrado de .st-cpill a .cpill (components.css) */
function stBuildCatBar(){
  var bar=document.getElementById('st-cat-bar');if(!bar)return;
  var cats=_stLoadCats();
  var h='<div class="cpill cpill-all act" data-cat="all" onclick="stSetCat(this)">✦ <span class="cpill-lbl">Todo</span></div>';
  cats.forEach(function(c){
    var col=c.color||'#888';
    h+='<div class="cpill" data-cat="'+c.id+'" onclick="stSetCat(this)" style="border-color:'+col+'66;color:'+col+'" data-color="'+col+'">'+c.icon+' <span class="cpill-lbl">'+c.label+'</span></div>';
  });
  bar.innerHTML=h;
}

function stSetCat(el){
  document.querySelectorAll('#st-cat-bar .cpill').forEach(function(p){p.classList.remove('act');p.classList.remove('active');p.style.background='';});
  el.classList.add('act');
  var col=el.getAttribute('data-color');if(col)el.style.background=col+'22';
  _stCurCat=el.getAttribute('data-cat');stRenderProds();
}

function stFillSelects(){
  var cats=_stLoadCats(),locs=_stLoadLocs();
  var csel=document.getElementById('st-np-c'),lsel=document.getElementById('st-np-l');
  if(csel)csel.innerHTML=cats.map(function(c){return '<option value="'+c.id+'">'+c.icon+' '+c.label+'</option>';}).join('')+'<option value="__new__">+ Nueva categoría...</option>';
  if(lsel)lsel.innerHTML=locs.map(function(l){return '<option value="'+l.id+'">'+l.label+'</option>';}).join('')+'<option value="__new__">+ Nueva ubicación...</option>';
}
function stCatChange(sel){if(sel.value==='__new__'){sel.value=sel.options[0].value;showOv('st-modal-cat');}}
function stLocChange(sel){if(sel.value==='__new__'){sel.value=sel.options[0].value;showOv('st-modal-loc');}}

function stSaveLoc(){
  var name=document.getElementById('st-loc-name').value.trim();if(!name)return;
  var locs=_stLoadLocs();
  var id=name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'').substr(0,4);
  if(locs.find(function(l){return l.id===id;}))id+=locs.length;
  locs.push({id:id,label:name});_stSaveLocs(locs);closeOv('st-modal-loc');stFillSelects();
  if(typeof showToast==='function')showToast('Ubicación creada');
}

function stProdHTML(p,archived){
  var s=archived?'dim':stSc(p);
  var dot=archived?'<div style="width:8px;height:8px;border-radius:50%;background:var(--faint);flex-shrink:0"></div>':'<div class="st-prod-sema st-sema-'+s+'"></div>';
  return '<div class="st-prod-item'+(archived?' st-prod-archived':'')+'" onclick="stOpenEditModal('+p.id+')">'+dot+
    '<div class="st-prod-info"><div class="st-prod-name"'+(archived?' style="color:var(--dim)"':'')+'>'+p.name+'</div>'+
    '<div class="st-prod-meta">mín. '+p.min+' '+p.unit+(p.note?' · '+p.note:'')+'</div></div>'+
    '<div style="text-align:right;flex-shrink:0"><div class="st-prod-qty"'+(archived?' style="color:var(--dim)"':'')+'>'+p.qty+'</div>'+
    '<div class="st-prod-unit">'+p.unit+'</div></div></div>';
}
function stRenderProds(){
  var list=document.getElementById('st-prod-list');if(!list)return;
  var allData=_stLoadProds();
  var active=allData.filter(function(p){return p.active!==false;});
  var archived=allData.filter(function(p){return p.active===false;});
  var filtered=_stCurCat==='all'?active:active.filter(function(p){return p.cat===_stCurCat;});
  var h='';
  if(!filtered.length){
    h='<div style="padding:24px 0;text-align:center;font-size:12px;color:var(--dim)">Sin productos</div>';
  }else if(_stCurCat==='all'){
    _stLoadCats().forEach(function(c){
      var cp=filtered.filter(function(p){return p.cat===c.id;});if(!cp.length)return;
      h+='<div class="st-sec-hdr">'+c.icon+' '+c.label+'</div>';
      cp.forEach(function(p){h+=stProdHTML(p,false);});
    });
  }else{filtered.forEach(function(p){h+=stProdHTML(p,false);});}
  list.innerHTML=h;
  var sec=document.getElementById('st-archived-section'),lbl=document.getElementById('st-archived-lbl');
  if(sec)sec.style.display=archived.length?'':'none';
  if(lbl)lbl.textContent='▶ '+archived.length+' producto'+(archived.length!==1?'s':'')+' archivado'+(archived.length!==1?'s':'');
  var al=document.getElementById('st-archived-list');if(al)al.style.display='none';
}
function stToggleArchived(el){
  var list=document.getElementById('st-archived-list'),lbl=document.getElementById('st-archived-lbl');if(!list)return;
  var open=list.style.display==='none';
  list.style.display=open?'block':'none';
  var data=_stLoadProds().filter(function(p){return p.active===false;});
  if(open){var h='';data.forEach(function(p){h+=stProdHTML(p,true);});list.innerHTML=h||'<div style="padding:8px 0;font-size:12px;color:var(--dim)">Sin archivados</div>';if(lbl)lbl.textContent='▾ '+data.length+' productos archivados';}
  else{if(lbl)lbl.textContent='▶ '+data.length+' productos archivados';}
}
function stShowAddModal(){
  _stEditId=null;document.getElementById('st-modal-title').textContent='Nuevo producto';document.getElementById('st-modal-btn').textContent='Añadir producto';document.getElementById('st-modal-del').style.display='none';
  ['st-np-n','st-np-q','st-np-m','st-np-u','st-np-no'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var tog=document.getElementById('st-np-active');if(tog)tog.checked=true;
  stFillSelects();showOv('st-modal-prod');
}
function stHideModal(){closeOv('st-modal-prod');}
function stOpenEditModal(id){
  var data=_stLoadProds(),p=data.find(function(x){return x.id===id;});if(!p)return;
  _stEditId=id;document.getElementById('st-modal-title').textContent=p.name;document.getElementById('st-modal-btn').textContent='Guardar cambios';document.getElementById('st-modal-del').style.display='';
  stFillSelects();
  document.getElementById('st-np-n').value=p.name;document.getElementById('st-np-c').value=p.cat;document.getElementById('st-np-l').value=p.loc;
  document.getElementById('st-np-q').value=p.qty;document.getElementById('st-np-u').value=p.unit;document.getElementById('st-np-m').value=p.min;document.getElementById('st-np-no').value=p.note||'';
  var tog=document.getElementById('st-np-active');if(tog)tog.checked=(p.active!==false);
  showOv('st-modal-prod');
}
function stSaveProd(){
  var name=document.getElementById('st-np-n').value.trim();if(!name){document.getElementById('st-np-n').focus();return;}
  var data=_stLoadProds(),tog=document.getElementById('st-np-active'),active=tog?tog.checked:true;
  if(_stEditId){
    var p=data.find(function(x){return x.id===_stEditId;});if(!p)return;
    p.name=name;p.cat=document.getElementById('st-np-c').value;p.loc=document.getElementById('st-np-l').value;
    p.qty=parseInt(document.getElementById('st-np-q').value)||p.qty;p.unit=document.getElementById('st-np-u').value||p.unit;
    p.min=parseInt(document.getElementById('st-np-m').value)||0;p.note=document.getElementById('st-np-no').value;p.active=active;
  }else{
    var maxId=data.reduce(function(m,x){return Math.max(m,x.id);},0);
    data.push({id:maxId+1,name:name,cat:document.getElementById('st-np-c').value,loc:document.getElementById('st-np-l').value,qty:parseInt(document.getElementById('st-np-q').value)||0,unit:document.getElementById('st-np-u').value||'ud',min:parseInt(document.getElementById('st-np-m').value)||0,note:document.getElementById('st-np-no').value,active:active});
  }
  _stSaveProds(data);stHideModal();stRenderProds();
  if(typeof showToast==='function')showToast(_stEditId?'Producto actualizado':'Producto añadido');
}
function stDeleteProd(){
  if(!_stEditId)return;
  var prod=_stLoadProds().find(function(p){return p.id===_stEditId;});if(!prod)return;
  var body=document.getElementById('confirm-body');if(body)body.textContent='Vas a eliminar "'+prod.name+'" del inventario. Esta acción es permanente.';
  var btn=document.querySelector('#ov-confirm .mbtn-d');if(btn){btn.textContent='Sí, eliminar';btn.onclick=stConfirmDeleteProd;}
  var cancel=document.querySelector('#ov-confirm .mbtn-c');if(cancel){cancel.onclick=function(){closeOv('ov-confirm');showOv('st-modal-prod');};}
  closeOv('st-modal-prod');showOv('ov-confirm');
}
function stConfirmDeleteProd(){
  closeOv('ov-confirm');_stSaveProds(_stLoadProds().filter(function(p){return p.id!==_stEditId;}));stRenderProds();
  if(typeof showToast==='function')showToast('Producto eliminado');
  var btn=document.querySelector('#ov-confirm .mbtn-d');if(btn){btn.textContent='Sí, eliminar';btn.onclick=doDeleteWorker;}
  var cancel=document.querySelector('#ov-confirm .mbtn-c');if(cancel){cancel.onclick=function(){closeOv('ov-confirm');showOv('ov-preview');};}
}

function stOpenCatModal(catId){
  var cats=_stLoadCats();
  if(catId){
    var c=cats.find(function(x){return x.id===catId;});if(!c)return;
    _stEditCatId=catId;document.getElementById('st-cat-modal-title').textContent=c.label;document.getElementById('st-cat-name').value=c.label;
    document.getElementById('st-cat-activa').checked=(c.active!==false);document.getElementById('st-cat-modal-btn').textContent='Guardar categoría';
    document.getElementById('st-cat-modal-del').style.display='';_stCatEmojiSelected=c.icon||'📦';_stCatColor=c.color||'#5599cc';
  }else{
    _stEditCatId=null;document.getElementById('st-cat-modal-title').textContent='Nueva categoría';document.getElementById('st-cat-name').value='';
    document.getElementById('st-cat-activa').checked=true;document.getElementById('st-cat-modal-btn').textContent='+ Añadir categoría';
    document.getElementById('st-cat-modal-del').style.display='none';_stCatEmojiSelected='📦';_stCatColor='#5599cc';
  }
  document.querySelectorAll('.st-color-opt').forEach(function(o){o.classList.toggle('active',o.getAttribute('data-color')===_stCatColor);});
  stRenderCatEmojiGrid(false);showOv('st-modal-cat');
}
function stCloseCatModal(){closeOv('st-modal-cat');}
function stRenderCatEmojiGrid(expanded){
  _stCatEmojiExpanded=expanded;
  var emojis=expanded?_stCatEmojis:_stCatEmojis.slice(0,14);
  var grid=document.getElementById('st-cat-emoji-grid');if(!grid)return;
  grid.innerHTML=emojis.map(function(e){return '<button class="emoji-opt'+(e===_stCatEmojiSelected?' act':'')+'" onclick="stPickCatEmoji(\''+e+'\')" type="button">'+e+'</button>';}).join('');
  var wrap=document.getElementById('st-cat-emoji-wrap'),chev=document.getElementById('st-cat-emoji-chev'),lbl=document.getElementById('st-cat-emoji-lbl');
  if(wrap)wrap.classList.toggle('collapsed',!expanded);
  if(chev)chev.style.transform=expanded?'rotate(180deg)':'';
  if(lbl)lbl.textContent=expanded?'Ver menos':'Ver más iconos';
}
function stToggleCatEmojis(){stRenderCatEmojiGrid(!_stCatEmojiExpanded);}
function stPickCatEmoji(emoji){_stCatEmojiSelected=emoji;stRenderCatEmojiGrid(_stCatEmojiExpanded);}
function stPickColor(el){document.querySelectorAll('.st-color-opt').forEach(function(o){o.classList.remove('active');});el.classList.add('active');_stCatColor=el.getAttribute('data-color');}
function stSaveCat(){
  var name=document.getElementById('st-cat-name').value.trim();if(!name)return;
  var active=document.getElementById('st-cat-activa').checked,cats=_stLoadCats();
  if(_stEditCatId){
    var c=cats.find(function(x){return x.id===_stEditCatId;});
    if(c){c.label=name;c.icon=_stCatEmojiSelected;c.color=_stCatColor;c.active=active;}
  }else{
    var id=name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
    if(cats.find(function(c){return c.id===id;}))id+='_'+Date.now();
    cats.push({id:id,label:name,icon:_stCatEmojiSelected,color:_stCatColor,active:active});
  }
  _stSaveCats(cats);stCloseCatModal();stBuildCatBar();stFillSelects();stRenderProds();
  if(typeof showToast==='function')showToast(_stEditCatId?'Categoría actualizada':'Categoría creada');
}
function stDeleteCat(){
  if(!_stEditCatId)return;
  var prods=_stLoadProds(),using=prods.filter(function(p){return p.cat===_stEditCatId;}).length;
  if(using>0){if(typeof showToast==='function')showToast('Hay '+using+' productos en esta categoría');return;}
  var cats=_stLoadCats().filter(function(c){return c.id!==_stEditCatId;});
  _stSaveCats(cats);stCloseCatModal();stBuildCatBar();stFillSelects();
  if(typeof showToast==='function')showToast('Categoría eliminada');
}
