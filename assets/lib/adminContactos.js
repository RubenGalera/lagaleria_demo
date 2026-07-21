/* adminContactos.js — Gestión de Contactos (técnicos y personal de mantenimiento).
   Mismo patrón que Proveedores en adminStock.js (tabla contactos, sin icono/color,
   sin drag-to-reorder). Usa el modal compartido AdminEntityModal.

   Globals required: showConfirm, escHtml, toast, _sb, LOCAL_ID, AdminEntityModal */

var contactos = [];
var editContactoId = null;

async function fetchContactos(){
  try{
    var res = await _sb.from('contactos').select('*').eq('local_id',LOCAL_ID).order('nombre');
    if(res.error) throw res.error;
    contactos = res.data || [];
  }catch(e){
    console.error('[admin] fetchContactos', e);
    contactos = [];
  }
  renderContactosList();
}

function openContactosPanel(){
  document.getElementById('view-editar-list').style.display='none';
  document.getElementById('view-contactos').classList.add('active');
  fetchContactos();
}
function closeContactosPanel(){
  document.getElementById('view-contactos').classList.remove('active');
  document.getElementById('view-editar-list').style.display='';
}

function renderContactosList(){
  var list=document.getElementById('contactos-list'); if(!list) return;
  var rows = !contactos.length
    ? '<div class="zona-empty">Sin contactos todavía.<br>Crea el primero con el botón de abajo.</div>'
    : contactos.map(function(c){
        var inactivo = c.activo===false;
        var sub = [c.tel, c.nota].filter(Boolean).join(' · ') || 'Sin datos';
        return '<div class="zona-row contacto-row" data-id="'+c.id+'" style="opacity:'+(inactivo?.55:1)+'">'+
          '<div class="zona-info"><div class="zona-name">'+escHtml(c.nombre)+(inactivo?'<span class="zona-inactiva">INACTIVO</span>':'')+'</div><div class="zona-sub">'+escHtml(sub)+'</div></div>'+
          '<span class="zona-arrow">›</span>'+
        '</div>';
      }).join('');
  list.innerHTML = rows + '<button class="btn-nueva-zona" id="btn-nuevo-contacto">+ Nuevo contacto</button>';
  var btnNew = document.getElementById('btn-nuevo-contacto');
  if(btnNew) btnNew.addEventListener('click', openNewContacto);

  list.querySelectorAll('.contacto-row').forEach(function(row){
    row.addEventListener('click', function(){ openEditContacto(row.dataset.id); });
  });
}

function _contactoFieldsHtml(tel){
  return [
    '<div class="fgroup" style="margin-bottom:12px"><label class="flbl">Teléfono</label><input class="inp" id="ctc-tel" type="tel" placeholder="+34 600 000 000">'+_contactBtnsHtml(tel,'ctc-tel')+'</div>' +
    '<div class="fgroup" style="margin-bottom:12px"><label class="flbl">Email</label><input class="inp" id="ctc-email" type="email" placeholder="contacto@empresa.com"></div>' +
    '<div class="fgroup" style="margin-bottom:12px"><label class="flbl">Nota</label><textarea class="inp" id="ctc-nota" rows="3" placeholder="Notas internas..."></textarea></div>'
  ];
}

function openNewContacto(){
  editContactoId=null;
  AdminEntityModal.open({
    title:'Nuevo contacto',
    saveLabel:'+ Añadir contacto',
    nombre:'',
    nombrePlaceholder:'Electricista, Técnico cafetera...',
    activo:true,
    activoLabel:'Activo',
    fields:_contactoFieldsHtml(),
    showIcono:false,
    onSave:saveContacto,
    onDelete:null
  });
}
function openEditContacto(id){
  var c=contactos.find(function(x){return x.id===id;}); if(!c) return;
  editContactoId=id;
  AdminEntityModal.open({
    title:'Editar contacto',
    saveLabel:'Guardar contacto',
    deleteLabel:'Eliminar contacto',
    nombre:c.nombre,
    activo:c.activo!==false,
    activoLabel:'Activo',
    fields:_contactoFieldsHtml(c.tel),
    showIcono:false,
    onRender:function(){
      var telInp=document.getElementById('ctc-tel'); if(telInp) telInp.value=c.tel||'';
      var emailInp=document.getElementById('ctc-email'); if(emailInp) emailInp.value=c.email||'';
      var notaInp=document.getElementById('ctc-nota'); if(notaInp) notaInp.value=c.nota||'';
    },
    onSave:saveContacto,
    onDelete:function(){ AdminEntityModal.close(); promptDelContacto(id); }
  });
}

async function saveContacto(data){
  var nombre=(data.nombre||'').trim();
  if(!nombre){ showToast('Introduce un nombre','error'); return; }
  var payload={
    nombre:nombre,
    tel:(data['ctc-tel']||'').trim()||null,
    email:(data['ctc-email']||'').trim()||null,
    nota:(data['ctc-nota']||'').trim()||null,
    activo:data.activo!==false
  };
  try{
    if(editContactoId){
      var res=await _sb.from('contactos').update(payload).eq('id',editContactoId);
      if(res.error) throw res.error;
      showToast('Contacto actualizado','success');
    } else {
      var res=await _sb.from('contactos').insert(Object.assign({local_id:LOCAL_ID, tipo:'tecnico'}, payload));
      if(res.error) throw res.error;
      showToast('Contacto creado','success');
    }
    AdminEntityModal.close();
    await fetchContactos();
  }catch(e){
    console.error('[admin] saveContacto', e);
    showToast('Error al guardar el contacto','error');
  }
}

function promptDelContacto(id){
  var c=contactos.find(function(x){return x.id===id;}); if(!c) return;
  showConfirm({
    title:'¿Eliminar contacto?',
    message:'Vas a eliminar el contacto "'+c.nombre+'". Esta acción no se puede deshacer.',
    confirmLabel:'Eliminar',
    onConfirm:function(){ deleteContacto(id); }
  });
}
async function deleteContacto(id){
  try{
    var res=await _sb.from('contactos').delete().eq('id',id);
    if(res.error) throw res.error;
    showToast('Contacto eliminado','success');
    await fetchContactos();
  }catch(e){
    console.error('[admin] deleteContacto', e);
    showToast('Error al eliminar el contacto','error');
  }
}
