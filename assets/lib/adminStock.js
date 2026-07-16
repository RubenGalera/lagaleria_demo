/* adminStock.js — Gestión de Categorías y Proveedores de Stock (stock_categorias, stock_proveedores)
   La gestión de productos vive únicamente en assets/js/stock.js.
   Usa el modal compartido AdminEntityModal (assets/lib/admin-entity-modal.js),
   mismo patrón que adminZones.js / adminSkills.js.
   Globals required: showConfirm, escHtml, toast, _sb, LOCAL_ID, AdminEntityModal */

var stockCats = [];
var stockCatCounts = {};
var editCatId = null;
var _dragCatId = null;

var STOCK_CAT_ICONS = ['🍺','🍕','🧴','🔧','🍷','🥩','🧊','🫙','🧹','🛒','📦','🍾','🥤','🫒','🧃','🍫'];
var STOCK_CAT_DEFAULT_SLUG = 'default';

async function fetchStockCategorias(){
  try{
    var res = await _sb.from('stock_categorias').select('*').eq('local_id',LOCAL_ID).order('orden');
    if(res.error) throw res.error;
    stockCats = (res.data || []).slice().sort(function(a,b){
      var ad = a.slug===STOCK_CAT_DEFAULT_SLUG ? 1 : 0;
      var bd = b.slug===STOCK_CAT_DEFAULT_SLUG ? 1 : 0;
      if(ad!==bd) return ad-bd;
      return (a.orden||0)-(b.orden||0);
    });
  }catch(e){
    console.error('[admin] fetchStockCategorias', e);
    stockCats = [];
  }
  await fetchStockCatCounts();
  renderCatList();
}

async function fetchStockCatCounts(){
  stockCatCounts = {};
  try{
    var res = await _sb.from('stock_productos').select('categoria').eq('local_id',LOCAL_ID);
    if(res.error) throw res.error;
    (res.data||[]).forEach(function(p){
      var slug = p.categoria || STOCK_CAT_DEFAULT_SLUG;
      stockCatCounts[slug] = (stockCatCounts[slug]||0)+1;
    });
  }catch(e){
    console.error('[admin] fetchStockCatCounts', e);
  }
}

function openStockPanel(){
  document.getElementById('view-editar-list').style.display='none';
  document.getElementById('view-stock-admin').classList.add('active');
  fetchStockCategorias();
}
function closeStockPanel(){
  document.getElementById('view-stock-admin').classList.remove('active');
  document.getElementById('view-editar-list').style.display='';
}

function renderCatList(){
  var list=document.getElementById('cat-list'); if(!list) return;
  var rows = !stockCats.length
    ? '<div class="zona-empty">Sin categorías todavía.<br>Crea la primera con el botón de abajo.</div>'
    : stockCats.map(function(c){
        var isDefault = c.slug===STOCK_CAT_DEFAULT_SLUG;
        var count = stockCatCounts[c.slug]||0;
        var countLabel = count+' producto'+(count!==1?'s':'');
        if(isDefault){
          return '<div class="zona-row cat-row-default" style="cursor:default">'+
            '<span class="zona-emoji" style="border-radius:50%;background:var(--brd2);border:1px solid var(--brd2);color:var(--dim)">'+(c.icono||'📦')+'</span>'+
            '<div class="zona-info"><div class="zona-name" style="color:var(--dim)">'+escHtml(c.nombre)+'</div><div class="zona-sub">'+countLabel+'</div></div>'+
          '</div>';
        }
        var color = c.color||'#5599cc';
        var inactiva = c.activa===false;
        return '<div class="zona-row cat-row" data-id="'+c.id+'" style="opacity:'+(inactiva?.55:1)+'">'+
          '<span class="cat-drag-handle" draggable="true" title="Arrastrar para reordenar">≡</span>'+
          '<span class="zona-emoji" style="border-radius:50%;background:'+color+'33;border:1px solid '+color+'">'+(c.icono||'📦')+'</span>'+
          '<div class="zona-info"><div class="zona-name">'+escHtml(c.nombre)+(inactiva?'<span class="zona-inactiva">INACTIVA</span>':'')+'</div><div class="zona-sub">'+countLabel+'</div></div>'+
          '<span class="zona-arrow">›</span>'+
        '</div>';
      }).join('');
  list.innerHTML = rows + '<button class="btn-nueva-zona" id="btn-nueva-cat">+ Nueva categoría</button>';
  var btnNew = document.getElementById('btn-nueva-cat');
  if(btnNew) btnNew.addEventListener('click', openNewCategoria);

  list.querySelectorAll('.cat-row').forEach(function(row){
    row.addEventListener('click', function(e){
      if(e.target.closest('.cat-drag-handle')) return;
      openEditCategoria(row.dataset.id);
    });
    row.addEventListener('dragover', function(e){ e.preventDefault(); row.classList.add('cat-drag-over'); });
    row.addEventListener('dragleave', function(){ row.classList.remove('cat-drag-over'); });
    row.addEventListener('drop', function(e){
      e.preventDefault();
      row.classList.remove('cat-drag-over');
      if(_dragCatId && _dragCatId!==row.dataset.id) reorderCategorias(_dragCatId, row.dataset.id);
    });
  });
  list.querySelectorAll('.cat-drag-handle').forEach(function(handle){
    handle.addEventListener('dragstart', function(e){
      var row = handle.closest('.cat-row');
      _dragCatId = row.dataset.id;
      e.dataTransfer.effectAllowed = 'move';
      try{ e.dataTransfer.setData('text/plain', _dragCatId); }catch(err){}
      row.classList.add('cat-dragging');
    });
    handle.addEventListener('dragend', function(){
      var row = handle.closest('.cat-row');
      if(row) row.classList.remove('cat-dragging');
      _dragCatId = null;
      list.querySelectorAll('.cat-drag-over').forEach(function(r){ r.classList.remove('cat-drag-over'); });
    });
  });
}

function genCatSlug(nombre){
  var base = (nombre||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'').slice(0,3);
  if(!base) base = 'cat';
  var slug = base, n = 2;
  while(stockCats.some(function(c){return c.slug===slug;})){ slug = base+n; n++; }
  return slug;
}

function _catFieldsHtml(icon){
  return [
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
      '<div class="fgroup" style="flex:1"><label class="flbl">Color</label><input class="inp" id="cat-color" type="color" value="#5599cc" style="padding:3px;height:38px"></div>' +
      '<div class="cat-preview" id="cat-preview">'+(icon||'✦')+'</div>' +
    '</div>'
  ];
}
function _updateCatPreview(){
  var prev=document.getElementById('cat-preview'); if(!prev) return;
  var colorInp=document.getElementById('cat-color');
  var color=colorInp?colorInp.value:'#5599cc';
  prev.style.background=color+'33';
  prev.style.borderColor=color;
}

function openNewCategoria(){
  editCatId=null;
  AdminEntityModal.open({
    title:'Nueva categoría',
    saveLabel:'+ Añadir categoría',
    nombre:'',
    nombrePlaceholder:'Vinos, Cafés...',
    activo:true,
    activoLabel:'Activa',
    fields:_catFieldsHtml('📦'),
    icons:STOCK_CAT_ICONS,
    icono:'📦',
    onIconChange:function(icon){ var p=document.getElementById('cat-preview'); if(p) p.textContent=icon; },
    onRender:function(){
      var colorInp=document.getElementById('cat-color');
      if(colorInp) colorInp.addEventListener('input', _updateCatPreview);
      _updateCatPreview();
    },
    onSave:saveCategoria,
    onDelete:null
  });
}
function openEditCategoria(id){
  var c=stockCats.find(function(x){return x.id===id;}); if(!c) return;
  if(c.slug===STOCK_CAT_DEFAULT_SLUG) return;
  editCatId=id;
  AdminEntityModal.open({
    title:'Editar categoría',
    saveLabel:'Guardar categoría',
    deleteLabel:'Eliminar categoría',
    nombre:c.nombre,
    activo:c.activa!==false,
    activoLabel:'Activa',
    fields:_catFieldsHtml(c.icono||'📦'),
    icons:STOCK_CAT_ICONS,
    icono:c.icono||'📦',
    onIconChange:function(icon){ var p=document.getElementById('cat-preview'); if(p) p.textContent=icon; },
    onRender:function(){
      var colorInp=document.getElementById('cat-color');
      if(colorInp){ colorInp.value=c.color||'#5599cc'; colorInp.addEventListener('input', _updateCatPreview); }
      _updateCatPreview();
    },
    onSave:saveCategoria,
    onDelete:function(){ AdminEntityModal.close(); promptDelCategoria(id); }
  });
}

async function saveCategoria(data){
  var nombre=(data.nombre||'').trim();
  if(!nombre){ toast('Introduce un nombre'); return; }
  var icono=data.icono||'📦';
  var color=data['cat-color']||'#5599cc';
  var activa=data.activo!==false;
  try{
    if(editCatId){
      var cat=stockCats.find(function(x){return x.id===editCatId;});
      if(cat && cat.slug===STOCK_CAT_DEFAULT_SLUG){ toast('Esta categoría no puede editarse'); return; }
      var res=await _sb.from('stock_categorias').update({nombre:nombre,icono:icono,color:color,activa:activa}).eq('id',editCatId);
      if(res.error) throw res.error;
      toast('Categoría actualizada');
    } else {
      var slug=genCatSlug(nombre);
      var maxOrden=stockCats.reduce(function(m,c){return Math.max(m,c.orden||0);},0);
      var res=await _sb.from('stock_categorias').insert({local_id:LOCAL_ID,nombre:nombre,slug:slug,icono:icono,color:color,activa:activa,orden:maxOrden+1});
      if(res.error) throw res.error;
      toast('Categoría creada');
    }
    AdminEntityModal.close();
    await fetchStockCategorias();
  }catch(e){
    console.error('[admin] saveCategoria', e);
    toast('Error al guardar la categoría');
  }
}

async function promptDelCategoria(id){
  var c=stockCats.find(function(x){return x.id===id;}); if(!c) return;
  if(c.slug===STOCK_CAT_DEFAULT_SLUG){ toast('Esta categoría no puede eliminarse'); return; }
  var count = 0;
  try{
    var res = await _sb.from('stock_productos').select('id',{count:'exact',head:true}).eq('local_id',LOCAL_ID).eq('categoria',c.slug);
    if(res.error) throw res.error;
    count = res.count||0;
  }catch(e){
    console.error('[admin] promptDelCategoria count', e);
    toast('Error al comprobar los productos de la categoría');
    return;
  }
  var message = count>0
    ? 'Esta categoría tiene '+count+' producto'+(count!==1?'s':'')+'. Al borrarla pasarán a "Sin categoría".'
    : 'Vas a eliminar la categoría "'+c.nombre+'". Esta acción no se puede deshacer.';
  showConfirm({
    title:'¿Eliminar categoría?',
    message:message,
    confirmLabel:'Eliminar',
    onConfirm:function(){ deleteCategoria(id, count>0); }
  });
}
async function deleteCategoria(id, reassign){
  var c=stockCats.find(function(x){return x.id===id;}); if(!c) return;
  try{
    if(reassign){
      var upd = await _sb.from('stock_productos').update({categoria:STOCK_CAT_DEFAULT_SLUG}).eq('local_id',LOCAL_ID).eq('categoria',c.slug);
      if(upd.error) throw upd.error;
    }
    var res=await _sb.from('stock_categorias').delete().eq('id',id);
    if(res.error) throw res.error;
    toast('Categoría eliminada');
    await fetchStockCategorias();
  }catch(e){
    console.error('[admin] deleteCategoria', e);
    toast('Error al eliminar la categoría');
  }
}

async function reorderCategorias(draggedId, targetId){
  var orderable = stockCats.filter(function(c){ return c.slug!==STOCK_CAT_DEFAULT_SLUG; });
  var fromIdx = orderable.findIndex(function(c){ return c.id===draggedId; });
  var toIdx = orderable.findIndex(function(c){ return c.id===targetId; });
  if(fromIdx<0 || toIdx<0 || fromIdx===toIdx) return;
  var moved = orderable.splice(fromIdx,1)[0];
  orderable.splice(toIdx,0,moved);
  try{
    await Promise.all(orderable.map(function(c,i){
      return _sb.from('stock_categorias').update({orden:i+1}).eq('id',c.id);
    }));
    await fetchStockCategorias();
  }catch(e){
    console.error('[admin] reorderCategorias', e);
    toast('Error al reordenar');
  }
}

/* ═══════════════════════════════════════════════════════════
   PROVEEDORES (stock_proveedores) — mismo patrón que Categorías,
   sin icono/color (fields: teléfono, email, nota).
   ═══════════════════════════════════════════════════════════ */
var stockProvs = [];
var editProvId = null;

async function fetchStockProveedores(){
  try{
    var res = await _sb.from('stock_proveedores').select('*').eq('local_id',LOCAL_ID).order('nombre');
    if(res.error) throw res.error;
    stockProvs = res.data || [];
  }catch(e){
    console.error('[admin] fetchStockProveedores', e);
    stockProvs = [];
  }
  renderProvList();
}

function openStockProveedoresPanel(){
  document.getElementById('view-editar-list').style.display='none';
  document.getElementById('view-stock-prov').classList.add('active');
  fetchStockProveedores();
}
function closeStockProveedoresPanel(){
  document.getElementById('view-stock-prov').classList.remove('active');
  document.getElementById('view-editar-list').style.display='';
}

function renderProvList(){
  var list=document.getElementById('prov-list'); if(!list) return;
  var rows = !stockProvs.length
    ? '<div class="zona-empty">Sin proveedores todavía.<br>Crea el primero con el botón de abajo.</div>'
    : stockProvs.map(function(p){
        var inactivo = p.activo===false;
        var sub = [p.tel, p.email].filter(Boolean).join(' · ') || 'Sin contacto';
        return '<div class="zona-row prov-row" data-id="'+p.id+'" style="opacity:'+(inactivo?.55:1)+'">'+
          '<span class="zona-emoji">🚚</span>'+
          '<div class="zona-info"><div class="zona-name">'+escHtml(p.nombre)+(inactivo?'<span class="zona-inactiva">INACTIVA</span>':'')+'</div><div class="zona-sub">'+escHtml(sub)+'</div></div>'+
          '<span class="zona-arrow">›</span>'+
        '</div>';
      }).join('');
  list.innerHTML = rows + '<button class="btn-nueva-zona" id="btn-nuevo-prov">+ Nuevo proveedor</button>';
  var btnNew = document.getElementById('btn-nuevo-prov');
  if(btnNew) btnNew.addEventListener('click', openNewProveedor);

  list.querySelectorAll('.prov-row').forEach(function(row){
    row.addEventListener('click', function(){ openEditProveedor(row.dataset.id); });
  });
}

/* Número limpio: sin espacios/guiones ni prefijo +34/0034 — mismo criterio
   para el enlace tel: y para wa.me (que necesita el 34 aparte, sin duplicarlo). */
function _cleanTel(raw){
  return (raw||'').replace(/[\s-]/g,'').replace(/^\+?0034/,'').replace(/^\+?34/,'');
}
/* inputId: id del campo tel del modal abierto en ese momento — distinto para
   proveedores (prov-tel) y contactos (ctc-tel), así que se lee en el click en
   vez de cerrar sobre un valor capturado al construir el HTML. */
function _callTelField(inputId){
  var v=_cleanTel(document.getElementById(inputId).value);
  if(v) window.location.href='tel:'+v;
}
function _waTelField(inputId){
  var v=_cleanTel(document.getElementById(inputId).value);
  if(v) window.open('https://wa.me/34'+v,'_blank');
}
function _contactBtnsHtml(tel, inputId){
  if(!tel) return '';
  inputId = inputId || 'prov-tel';
  return '<div class="contact-btns" style="margin-top:6px">' +
    '<button type="button" class="contact-btn" onclick="_callTelField(\''+inputId+'\')" style="border-color:rgba(85,187,85,.4)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55bb55" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 011.18 1.18C1.5.61.96.01 1.72.01H4.72a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L5.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.03z"/></svg></button>' +
    '<button type="button" class="contact-btn" onclick="_waTelField(\''+inputId+'\')" style="border-color:rgba(37,211,102,.4)"><svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>' +
  '</div>';
}

function _provFieldsHtml(tel){
  return [
    '<div class="fgroup" style="margin-bottom:12px"><label class="flbl">Teléfono</label><input class="inp" id="prov-tel" type="tel" placeholder="+34 600 000 000">'+_contactBtnsHtml(tel,'prov-tel')+'</div>' +
    '<div class="fgroup" style="margin-bottom:12px"><label class="flbl">Email</label><input class="inp" id="prov-email" type="email" placeholder="contacto@proveedor.com"></div>' +
    '<div class="fgroup" style="margin-bottom:12px"><label class="flbl">Nota</label><textarea class="inp" id="prov-nota" rows="3" placeholder="Notas internas..."></textarea></div>'
  ];
}

function openNewProveedor(){
  editProvId=null;
  AdminEntityModal.open({
    title:'Nuevo proveedor',
    saveLabel:'+ Añadir proveedor',
    nombre:'',
    nombrePlaceholder:'Distribuidora XYZ...',
    activo:true,
    activoLabel:'Activo',
    fields:_provFieldsHtml(),
    showIcono:false,
    onSave:saveProveedor,
    onDelete:null
  });
}
function openEditProveedor(id){
  var p=stockProvs.find(function(x){return x.id===id;}); if(!p) return;
  editProvId=id;
  AdminEntityModal.open({
    title:'Editar proveedor',
    saveLabel:'Guardar proveedor',
    deleteLabel:'Eliminar proveedor',
    nombre:p.nombre,
    activo:p.activo!==false,
    activoLabel:'Activo',
    fields:_provFieldsHtml(p.tel),
    showIcono:false,
    onRender:function(){
      var telInp=document.getElementById('prov-tel'); if(telInp) telInp.value=p.tel||'';
      var emailInp=document.getElementById('prov-email'); if(emailInp) emailInp.value=p.email||'';
      var notaInp=document.getElementById('prov-nota'); if(notaInp) notaInp.value=p.nota||'';
    },
    onSave:saveProveedor,
    onDelete:function(){ AdminEntityModal.close(); promptDelProveedor(id); }
  });
}

async function saveProveedor(data){
  var nombre=(data.nombre||'').trim();
  if(!nombre){ toast('Introduce un nombre'); return; }
  var payload={
    nombre:nombre,
    tel:(data['prov-tel']||'').trim()||null,
    email:(data['prov-email']||'').trim()||null,
    nota:(data['prov-nota']||'').trim()||null,
    activo:data.activo!==false
  };
  try{
    if(editProvId){
      var res=await _sb.from('stock_proveedores').update(payload).eq('id',editProvId);
      if(res.error) throw res.error;
      toast('Proveedor actualizado');
    } else {
      var res=await _sb.from('stock_proveedores').insert(Object.assign({local_id:LOCAL_ID}, payload));
      if(res.error) throw res.error;
      toast('Proveedor creado');
    }
    AdminEntityModal.close();
    await fetchStockProveedores();
  }catch(e){
    console.error('[admin] saveProveedor', e);
    toast('Error al guardar el proveedor');
  }
}

async function promptDelProveedor(id){
  var p=stockProvs.find(function(x){return x.id===id;}); if(!p) return;
  var count = 0;
  try{
    var res = await _sb.from('stock_productos').select('id',{count:'exact',head:true}).eq('local_id',LOCAL_ID).eq('proveedor_id',id);
    if(res.error) throw res.error;
    count = res.count||0;
  }catch(e){
    console.error('[admin] promptDelProveedor count', e);
    toast('Error al comprobar los productos del proveedor');
    return;
  }
  var message = count>0
    ? 'Este proveedor tiene '+count+' producto'+(count!==1?'s':'')+' asociados. Se desvinculará de esos productos.'
    : 'Vas a eliminar el proveedor "'+p.nombre+'". Esta acción no se puede deshacer.';
  showConfirm({
    title:'¿Eliminar proveedor?',
    message:message,
    confirmLabel:'Eliminar',
    onConfirm:function(){ deleteProveedor(id, count>0); }
  });
}
async function deleteProveedor(id, reassign){
  try{
    if(reassign){
      var upd = await _sb.from('stock_productos').update({proveedor_id:null}).eq('local_id',LOCAL_ID).eq('proveedor_id',id);
      if(upd.error) throw upd.error;
    }
    var res=await _sb.from('stock_proveedores').delete().eq('id',id);
    if(res.error) throw res.error;
    toast('Proveedor eliminado');
    await fetchStockProveedores();
  }catch(e){
    console.error('[admin] deleteProveedor', e);
    toast('Error al eliminar el proveedor');
  }
}
