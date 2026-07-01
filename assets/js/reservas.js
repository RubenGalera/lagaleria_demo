/* lagaleria_reservas.html — lógica de la página.
   Depende de globals cargados antes: _sb/LOCAL_ID (supabase-client.js), toast/showModal/closeModal/stepField/formatDateLabel/compressImage (ui-helpers.js, image-utils.js), DatePicker (date-picker.js).
   Expone funciones/variables en scope global (sin IIFE/module) para que esos módulos compartidos puedan usarlas. */


/* Mapeo estado Supabase → interno */
function mapEstado(e){ return e||'pendiente'; }

/* ── ZONAS desde Supabase ── */
async function sbLoadZonas(){
  try{
    const {data,error} = await _sb.from('zonas')
      .select('*').eq('local_id',LOCAL_ID).eq('activa',true).order('orden');
    if(error) throw error;
    return (data||[]).map(function(z){
      return {id:z.id, nombre:z.nombre, emoji:z.emoji, mesas:z.mesas, pax:z.pax, activa:z.activa};
    });
  }catch(e){ console.error('sbLoadZonas',e); return []; }
}

/* ── RESERVAS desde Supabase ── */
async function sbLoadReservas(fecha){
  try{
    var q = _sb.from('reservas').select('*').eq('local_id',LOCAL_ID);
    if(fecha) q = q.eq('fecha', fecha);
    const {data,error} = await q.order('hora');
    if(error) throw error;
    return (data||[]).map(function(r){
      return {
        id:     r.id,
        nombre: r.nombre,
        tel:    r.tel||'',
        fecha:  r.fecha,
        hora:   r.hora ? r.hora.slice(0,5) : '',
        pax:    r.pax||2,
        mesas:  r.mesas||1,
        zonaId: r.zona_id,
        estado: mapEstado(r.estado),
        nota:   r.nota||'',
        _sbId:  r.id,
      };
    });
  }catch(e){ console.error('sbLoadReservas',e); return []; }
}

async function sbSaveReserva(r){
  try{
    var payload = {
      local_id: LOCAL_ID,
      zona_id:  r.zonaId||null,
      nombre:   r.nombre,
      tel:      r.tel||null,
      fecha:    r.fecha,
      hora:     r.hora||null,
      pax:      r.pax||2,
      mesas:    r.mesas||1,
      estado:   r.estado||'pendiente',
      nota:     r.nota||null,
    };
    if(r._sbId){
      const {error} = await _sb.from('reservas').update(payload).eq('id',r._sbId);
      if(error) throw error;
    } else {
      const {error} = await _sb.from('reservas').insert(payload);
      if(error) throw error;
    }
    return true;
  }catch(e){ console.error('sbSaveReserva',e); return false; }
}

async function sbDeleteReserva(sbId){
  try{
    const {error} = await _sb.from('reservas').delete().eq('id',sbId);
    if(error) throw error;
    return true;
  }catch(e){ console.error('sbDeleteReserva',e); return false; }
}

/* ── EVENTOS desde Supabase ── */
async function sbLoadEventos(fecha){
  try{
    var q = _sb.from('eventos').select('*').eq('local_id',LOCAL_ID);
    if(fecha) q = q.eq('fecha', fecha);
    const {data,error} = await q.order('hora');
    if(error) throw error;
    const evList = data||[];

    /* Cargar asistentes y zonas de todos los eventos en paralelo */
    var allAsi = [], allZonas = [];
    if(evList.length){
      const evIds = evList.map(function(e){return e.id;});
      const [asiRes, zonasRes] = await Promise.all([
        _sb.from('evento_asistentes').select('*').in('evento_id', evIds).order('created_at'),
        _sb.from('evento_zonas').select('evento_id, zona_id').in('evento_id', evIds),
      ]);
      allAsi   = asiRes.data   || [];
      allZonas = zonasRes.data || [];
    }

    return evList.map(function(e){
      return {
        id:         e.id,
        nombre:     e.descripcion,
        fecha:      e.fecha,
        hora:       e.hora ? e.hora.slice(0,5) : '',
        tipo:       e.tipo||'evento',
        precio:     e.precio||'',
        aforo:      e.aforo||null,
        nota:       e.nota||'',
        img:        e.img_url||null,
        zonasIds:   allZonas.filter(function(z){return z.evento_id===e.id;}).map(function(z){return z.zona_id;}),
        asistentes: allAsi
          .filter(function(a){return a.evento_id===e.id;})
          .map(function(a){
            return {
              id:     a.id,
              nombre: a.nombre,
              acomp:  Number(a.acompanantes)||0,
              pagado: a.pago==='pagado',
              metodo: a.metodo||null,
              nota:   a.nota||'',
              _sbId:  a.id,
            };
          }),
        _sbId: e.id,
      };
    });
  }catch(e){ console.error('sbLoadEventos',e); return []; }
}

async function sbUploadEventoImg(eventoId, blob){
  if(!eventoId||!blob) return {error:'Sin id o imagen'};
  const path = eventoId+'.jpg';
  const {error:upErr} = await _sb.storage.from('eventos').upload(path, blob, {upsert:true, contentType:'image/jpeg'});
  if(upErr){ console.error('[SB] sbUploadEventoImg:',upErr.message); return {error:upErr.message}; }
  const {data} = _sb.storage.from('eventos').getPublicUrl(path);
  const url = data?.publicUrl ? data.publicUrl+'?t='+Date.now() : null;
  if(url) await _sb.from('eventos').update({img_url:url}).eq('id',eventoId);
  return {url};
}

async function sbSaveEvento(ev){
  try{
    // 'aforo' existe en el formulario y en memoria pero NO tiene columna en 'eventos' — se omite del payload deliberadamente
    var payload = {
      local_id:    LOCAL_ID,
      tipo:        ev.tipo||'evento',
      descripcion: ev.nombre||ev.descripcion||'',
      fecha:       ev.fecha,
      hora:        ev.hora||null,
      precio:      ev.precio||null,
      img_url:     ev.img||null,
      nota:        ev.nota||null,
    };
    var eventoId = ev._sbId;
    if(ev._sbId){
      const {error} = await _sb.from('eventos').update(payload).eq('id',ev._sbId);
      if(error) throw error;
    } else {
      const {data,error} = await _sb.from('eventos').insert(payload).select('id').single();
      if(error) throw error;
      eventoId = data.id;
      ev._sbId = data.id;
    }
    /* Persistir zonas: borrar las anteriores e insertar las actuales */
    if(eventoId){
      await _sb.from('evento_zonas').delete().eq('evento_id', eventoId);
      if(ev.zonasIds && ev.zonasIds.length){
        const zonaRows = ev.zonasIds.map(function(zid){ return {evento_id: eventoId, zona_id: zid}; });
        const {error:ze} = await _sb.from('evento_zonas').insert(zonaRows);
        if(ze) throw ze;
      }
    }
    return true;
  }catch(e){ console.error('sbSaveEvento',e); return false; }
}

async function sbDeleteEvento(sbId){
  try{
    const {error} = await _sb.from('eventos').delete().eq('id',sbId);
    if(error) throw error;
    return true;
  }catch(e){ console.error('sbDeleteEvento',e); return false; }
}

/* ── ASISTENTES ── */
async function sbSaveAsistente(a, eventoId){
  try{
    const payload={
      evento_id:    eventoId,
      nombre:       a.nombre,
      acompanantes: a.acomp||0,
      pago:         a.pagado?'pagado':'pendiente',
      metodo:       a.pagado?(a.metodo||null):null,
      nota:         a.nota||null,
    };
    if(a._sbId){
      const {error}=await _sb.from('evento_asistentes').update(payload).eq('id',a._sbId);
      if(error) throw error;
      return {ok:true,id:a._sbId};
    } else {
      const {data,error}=await _sb.from('evento_asistentes').insert(payload).select('id').single();
      if(error) throw error;
      return {ok:true,id:data.id};
    }
  }catch(e){ console.error('sbSaveAsistente',e); return {ok:false}; }
}

async function sbDeleteAsistente(sbId){
  try{
    const {error}=await _sb.from('evento_asistentes').delete().eq('id',sbId);
    if(error) throw error;
    return true;
  }catch(e){ console.error('sbDeleteAsistente',e); return false; }
}

/* ── INIT con Supabase ── */
async function initSupabase(){
  const [sbZonas, sbRes, sbEv] = await Promise.all([
    sbLoadZonas(),
    sbLoadReservas(),
    sbLoadEventos(),
  ]);
  if(sbZonas.length) zonas = sbZonas;
  reservas = sbRes;
  eventos  = sbEv;
  rebuildZonaBar();
  renderRes();
  renderEventos();
  if(window.DatePicker) DatePicker.setEvents(eventosToPickerDates());
}

/* Convierte eventos[] (con fecha real 'YYYY-MM-DD') en [{date}] para el DatePicker */
function eventosToPickerDates(){
  return eventos.map(function(ev){ return {date: ev.fecha}; });
}

/* ═══════════════════════════════════════
   lagaleria_reservas.html
   Future: /src/pages/reservas.jsx
   ═══════════════════════════════════════ */


/* ── DATA ── */
const PAX_PER_MESA = 3;
const TURNOS = { mid:{label:'Mediodía', from:'00:00', to:'17:00'}, noc:{label:'Noche', from:'17:00', to:'23:59'} };
let curZona = 'all', curDay = '', editingId = null, editingZonaId = null;
let nid = 300;

const ESTADOS = {
  pagada:    {label:'Pagada',    color:'#4a9a5a', bg:'rgba(60,140,70,.15)',   bd:'rgba(60,140,70,.4)'},
  confirmada:{label:'Confirmada',color:'#5599bb', bg:'rgba(85,153,187,.15)',  bd:'rgba(85,153,187,.4)'},
  pendiente: {label:'Pendiente', color:'#c89030', bg:'rgba(180,130,0,.15)',   bd:'rgba(180,130,0,.4)'},
  libre:     {label:'Libre',     color:'#7a8f96', bg:'rgba(100,120,130,.12)','bd':'rgba(100,120,130,.35)'},
  cancelada: {label:'Cancelada', color:'#cc4444', bg:'rgba(180,50,50,.15)',   bd:'rgba(180,50,50,.4)'},
};

/* Zonas — cargadas desde inicio (window.parent) o Supabase
   TODO: sustituir por query a Supabase tabla 'zonas' */
let zonas = [];
function loadZonas(){
  try{
    var p = window.parent;
    var local = p && p.getActiveLocal ? p.getActiveLocal() : null;
    if(local && local.zonas && local.zonas.length){
      zonas = local.zonas;
      return;
    }
  }catch(e){}
  /* Fallback mock */
  zonas = [
    {id:1, nombre:'Terraza',    emoji:'☀️', mesas:6,  pax:24, activa:true},
    {id:2, nombre:'Entrada',    emoji:'🚪', mesas:3,  pax:12, activa:true},
    {id:3, nombre:'Sala',       emoji:'🍷', mesas:8,  pax:32, activa:true},
    {id:4, nombre:'Reservados', emoji:'🪑', mesas:4,  pax:16, activa:true},
    {id:5, nombre:'Escenario',  emoji:'🎭', mesas:2,  pax:8,  activa:true},
  ];
}

function localDateStr(d){const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return`${y}-${m}-${day}`;}
function hoyStr(){return localDateStr(new Date());}
function manaStr(){const d=new Date();d.setDate(d.getDate()+1);return localDateStr(d);}

let reservas = [];

/* ── UTILS ── */
function getZona(id){return zonas.find(z=>z.id===id);}
function formatDay(dateStr){
  const d=new Date(dateStr+'T00:00:00');
  const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return d.getDate()+' de '+months[d.getMonth()];
}
function formatDayFull(dateStr){
  const d=new Date(dateStr+'T00:00:00');
  const days=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  return days[d.getDay()]+', '+formatDay(dateStr);
}

/* ── TAB ── */
function setTab(t){
  ['res','ev'].forEach(x=>{
    var tab=document.getElementById('tab-'+x);
    var view=document.getElementById('view-'+x);
    if(tab)  tab.classList.toggle('act',x===t);
    if(view) view.style.display=x===t?'':'none';
  });
  if(t==='res') renderRes();
  if(t==='ev')  renderEventos();
}
function goToSection(section){ setTab(section); }
function resetView(){
  setTab('res');
  document.querySelectorAll('.overlay.show').forEach(function(m){m.classList.remove('show');});
}

/* ── DATE NAV ── */
function initDay(){
  curDay=hoyStr();
  updateDateLbl();
  DatePicker.init({
    mode:'day',
    anchor:document.getElementById('res-date-center'),
    initialDate:curDay,
    events:eventosToPickerDates(),
    onChange:function(d){ curDay=d; DatePicker.setDate(d); updateDateLbl(); renderRes(); renderEventos(); }
  });
}
function changeDay(d){
  const cur=new Date(curDay+'T00:00:00');
  cur.setDate(cur.getDate()+d);
  const y=cur.getFullYear();
  const m=String(cur.getMonth()+1).padStart(2,'0');
  const day=String(cur.getDate()).padStart(2,'0');
  curDay=`${y}-${m}-${day}`;
  if(window.DatePicker) DatePicker.setDate(curDay);
  updateDateLbl();
  renderRes();
  renderEventos();
}
function updateDateLbl(){
  const lbl=document.getElementById('res-date-lbl');
  const ylbl=document.getElementById('res-year-lbl');
  const hoy=hoyStr();
  const man=manaStr();
  if(curDay===hoy) lbl.textContent='Hoy — '+formatDay(curDay);
  else if(curDay===man) lbl.textContent='Mañana — '+formatDay(curDay);
  else lbl.textContent=formatDayFull(curDay);
  const yr=new Date(curDay+'T00:00:00').getFullYear();
  if(ylbl) ylbl.textContent=yr;
}

/* ── ZONA FILTER ── */
function setZona(id,el){
  curZona=id;
  document.querySelectorAll('#zona-bar .zpill').forEach(p=>p.classList.remove('act'));
  if(el) el.classList.add('act');
  renderRes();
}

/* ── MESAS ── */
function turnoDeHora(hora){ return (!hora||hora>='17:00')?'noc':'mid'; }
function totalMesas(){return zonas.reduce((s,z)=>s+z.mesas,0);}
function mesasOcupadasPorTurno(turno){
  return reservas
    .filter(r=>r.fecha===curDay && turnoDeHora(r.hora)===turno && r.estado!=='cancelada' && r.estado!=='libre')
    .reduce((s,r)=>s+(r.mesas||1),0);
}
function toggleMesas(){
  const d=document.getElementById('mesas-detail');
  d.classList.toggle('show');
  const ch=document.getElementById('mesas-chevron');
  if(ch) ch.style.transform=d.classList.contains('show')?'rotate(180deg)':'rotate(0deg)';
  if(d.classList.contains('show')) renderMesasDetail();
}
function renderMesasDetail(){
  const el=document.getElementById('mesas-detail');
  const total=totalMesas();
  const libMid=total-mesasOcupadasPorTurno('mid');
  const libNoc=total-mesasOcupadasPorTurno('noc');
  const hdr=`<div class="mz-cols">
    <div class="mz-col-hdr">🌤 Mediodía · <span style="color:${libMid>0?'var(--grn)':'var(--red)'};">${libMid} libres</span></div>
    <div class="mz-col-hdr">🌙 Noche · <span style="color:${libNoc>0?'var(--grn)':'var(--red)'};">${libNoc} libres</span></div>
  </div>`;
  const rows=zonas.map(z=>{
    const ocpMid=reservas.filter(r=>r.fecha===curDay&&turnoDeHora(r.hora)==='mid'&&r.zonaId===z.id&&r.estado!=='cancelada'&&r.estado!=='libre').reduce((s,r)=>s+(r.mesas||1),0);
    const ocpNoc=reservas.filter(r=>r.fecha===curDay&&turnoDeHora(r.hora)==='noc'&&r.zonaId===z.id&&r.estado!=='cancelada'&&r.estado!=='libre').reduce((s,r)=>s+(r.mesas||1),0);
    const lMid=z.mesas-ocpMid, lNoc=z.mesas-ocpNoc;
    return`<div class="mz-row">
      <div class="mz-cell"><span class="mz-name">${z.emoji} ${z.nombre}</span><span class="mz-count" style="color:${lMid>0?'var(--grn)':'var(--red)'}">${lMid}/${z.mesas}</span></div>
      <div class="mz-cell"><span class="mz-name">${z.emoji} ${z.nombre}</span><span class="mz-count" style="color:${lNoc>0?'var(--grn)':'var(--red)'}">${lNoc}/${z.mesas}</span></div>
    </div>`;
  }).join('');
  el.innerHTML=hdr+rows;
}
function updateMesasPill(){
  const total=totalMesas();
  const libMid=total-mesasOcupadasPorTurno('mid');
  const libNoc=total-mesasOcupadasPorTurno('noc');
  const elMid=document.getElementById('mesas-num-mid');
  const elNoc=document.getElementById('mesas-num-noc');
  if(elMid) elMid.textContent='🌤'+libMid;
  if(elNoc) elNoc.textContent='🌙'+libNoc;
  const d=document.getElementById('mesas-detail');
  if(d&&d.classList.contains('show')) renderMesasDetail();
}

/* ── RENDER RESERVAS ── */
function secHdr(label,count){
  return`<div class="sec-hdr"><div class="sec-line"></div><div class="sec-lbl">${label}<span class="sec-badge">${count}</span></div><div class="sec-line"></div></div>`;
}

function resCard(r){
  const est=ESTADOS[r.estado]||ESTADOS.pendiente;
  return`<div class="res-card" style="border-color:${est.bd}" onclick="openDetail('${r.id}')">
    <div class="res-stripe" style="background:${est.color}"></div>
    <div class="res-top">
      <div class="res-name">${r.nombre}</div>
      <div class="res-badge" style="background:${est.bg};border-color:${est.bd};color:${est.color}">${est.label}</div>
    </div>
    <div class="res-meta">
      <span class="res-meta-item">🕐 ${r.hora}</span>
      <span class="res-meta-item">👥 ${r.pax} pax</span>
      <span class="res-meta-item">🪑 ${r.mesas||1} mesa${(r.mesas||1)!==1?'s':''}</span>
      ${r.nota?`<span class="res-meta-item" style="color:var(--acc)">💬 ${r.nota}</span>`:''}
    </div>
  </div>`;
}

function renderRes(){
  updateMesasPill();
  const list=document.getElementById('res-list');
  const zonasToShow=curZona==='all'?zonas:zonas.filter(z=>z.id===curZona);

  function buildTurno(turno){
    const label=turno==='mid'?'🌤 Mediodía':'🌙 Noche';
    const dayRes=reservas.filter(r=>r.fecha===curDay&&turnoDeHora(r.hora)===turno).sort((a,b)=>a.hora.localeCompare(b.hora));
    const filtered=curZona==='all'?dayRes:dayRes.filter(r=>r.zonaId===curZona);
    let h=`<div class="turno-hdr"><span class="turno-hdr-label">${label}</span><span class="turno-hdr-badge">· ${filtered.length}</span></div>`;
    if(!filtered.length){
      h+=`<div style="text-align:center;padding:18px 20px;font-size:12px;color:var(--faint)">Sin reservas</div>`;
    } else {
      zonasToShow.forEach(z=>{
        const zRes=filtered.filter(r=>r.zonaId===z.id);
        if(!zRes.length) return;
        h+=secHdr(z.emoji+' '+z.nombre, zRes.length);
        h+=zRes.map(r=>resCard(r)).join('');
      });
      const noZona=filtered.filter(r=>!zonas.find(z=>z.id===r.zonaId));
      if(noZona.length){h+=secHdr('📍 Sin zona',noZona.length);h+=noZona.map(r=>resCard(r)).join('');}
    }
    return h;
  }

  list.innerHTML=buildTurno('mid')+buildTurno('noc')+`<div class="tab-footer"><button class="add-btn" onclick="openNewRes()">+ Nueva reserva</button></div>`;
}

/* ── DETAIL (direct edit mode) ── */
function openDetail(id){
  // Direct edit mode — skip intermediate detail view
  openEditRes(id);
  return;
  // (kept below for reference)
  void(0);
}
function setEstado(id,estado){
  const r=reservas.find(x=>x.id===id);if(!r)return;
  r.estado=estado;
  openDetail(id);
  renderRes();
}

/* ── NEW / EDIT RES ── */
function fillZonaSelect(selectedId){
  const el=document.getElementById('e-zona-pills');if(!el)return;
  const sel=selectedId||zonas[0]?.id;
  el.innerHTML=zonas.map(z=>`
    <div class="zona-pill${z.id===sel?' act':''}" onclick="selectZona('${z.id}',this)">
      ${z.emoji} ${z.nombre}
    </div>`).join('');
  el.dataset.selected=sel||'';
}
function selectZona(id,el){
  document.querySelectorAll('#e-zona-pills .zona-pill').forEach(p=>p.classList.remove('act'));
  el.classList.add('act');
  document.getElementById('e-zona-pills').dataset.selected=id;
  checkCapacity();
}
function getSelectedZona(){
  return document.getElementById('e-zona-pills')?.dataset.selected||zonas[0]?.id;
}
function fillEstadoPills(selectedEstado){
  const el=document.getElementById('e-estado-pills');if(!el)return;
  el.innerHTML=Object.entries(ESTADOS).map(([k,e])=>{
    const act=k===selectedEstado;
    return`<button class="est-pill" style="background:${act?e.bg:'transparent'};border-color:${act?e.bd:'var(--brd2)'};color:${act?e.color:'var(--dim)'}"
      onclick="selectEstado('${k}',this)" data-estado="${k}">${e.label}</button>`;
  }).join('');
  el.dataset.selected=selectedEstado;
}
function selectEstado(k,el){
  const est=ESTADOS[k];if(!est)return;
  document.querySelectorAll('#e-estado-pills .est-pill').forEach(p=>{
    const pk=p.dataset.estado;const pe=ESTADOS[pk];
    p.style.background='transparent';p.style.borderColor='var(--brd2)';p.style.color='var(--dim)';
  });
  el.style.background=est.bg;el.style.borderColor=est.bd;el.style.color=est.color;
  document.getElementById('e-estado-pills').dataset.selected=k;
}
function getSelectedEstado(){
  return document.getElementById('e-estado-pills')?.dataset.selected||'pendiente';
}
function openNewRes(){
  editingId=null;
  document.getElementById('edit-title').textContent='Nueva reserva';
  document.getElementById('edit-sub').textContent='';
  document.getElementById('btn-del-res').style.display='none';
  fillZonaSelect(zonas[0]?.id);
  fillEstadoPills('pendiente');
  document.getElementById('e-nombre').value='';
  document.getElementById('e-tel').value='';
  document.getElementById('e-fecha').value=curDay;
  document.getElementById('e-hora').value='';
  document.getElementById('e-pax').value='4';
  document.getElementById('e-mesas').value='1';
  document.getElementById('e-nota').value='';
  delete document.getElementById('e-pax').dataset.manual;
  delete document.getElementById('e-mesas').dataset.manual;
  const w=document.getElementById('cap-warn');if(w)w.classList.remove('show');
  updateTelBtns();
  showModal('ov-edit');
}
function openEditRes(id){
  const r=reservas.find(x=>x.id===id);if(!r)return;
  editingId=id;
  closeModal('ov-detail');
  document.getElementById('edit-title').textContent=r.nombre;
  const z=getZona(r.zonaId);
  document.getElementById('edit-sub').textContent=(z?z.emoji+' '+z.nombre+' · ':'')+r.hora;
  document.getElementById('btn-del-res').style.display='block';
  document.getElementById('del-confirm-row').style.display='none';
  fillZonaSelect(r.zonaId);
  fillEstadoPills(r.estado);
  document.getElementById('e-nombre').value=r.nombre;
  document.getElementById('e-tel').value=r.tel;
  document.getElementById('e-fecha').value=r.fecha;
  document.getElementById('e-hora').value=r.hora;
  document.getElementById('e-pax').value=r.pax;
  document.getElementById('e-mesas').value=r.mesas||1;
  document.getElementById('e-nota').value=r.nota||'';
  updateTelBtns();
  showModal('ov-edit');
}
function autoPax(){
  if(editingId!==null) return; // existing res: no auto-suggest
  const pax=parseInt(document.getElementById('e-pax').value)||0;
  const m=document.getElementById('e-mesas');
  m.value=pax?Math.ceil(pax/PAX_PER_MESA):'';
}
function autoMesas(){
  // Never auto-fill pax from mesas — mesas is always manual
}

function checkCapacity(){
  const warn=document.getElementById('cap-warn');
  const txt=document.getElementById('cap-warn-txt');
  if(!warn||!txt)return;
  const zonaId=getSelectedZona();
  const z=zonas.find(x=>x.id===zonaId);
  if(!z){warn.classList.remove('show');return;}
  const pax=parseInt(document.getElementById('e-pax').value)||0;
  const mesas=parseInt(document.getElementById('e-mesas').value)||0;
  const fecha=document.getElementById('e-fecha').value;
  const hora=document.getElementById('e-hora').value;
  const turno=hora?turnoDeHora(hora):'mid';
  // Mesas ya ocupadas en esa zona+turno+día (excluir la reserva en edición)
  const yaOcupadas=reservas
    .filter(r=>r.fecha===fecha&&r.zonaId===zonaId&&turnoDeHora(r.hora)===turno&&r.estado!=='cancelada'&&r.estado!=='libre'&&r.id!==editingId)
    .reduce((s,r)=>s+(r.mesas||1),0);
  const msgs=[];
  if(z.mesas&&(yaOcupadas+mesas)>z.mesas) msgs.push(`supera el máximo de ${z.mesas} mesas en ${z.nombre} (${yaOcupadas} ya ocupadas en este turno)`);
  if(z.pax&&pax>z.pax) msgs.push(`supera el aforo de ${z.pax} personas en ${z.nombre}`);
  if(msgs.length){
    txt.textContent='Esta reserva '+msgs.join(' y ')+'. Puedes guardarla igualmente.';
    warn.classList.add('show');
  } else {
    warn.classList.remove('show');
  }
}

/* ── EMOJI GRID TOGGLE ── */
let emojiExpanded=false;
async function saveRes(){
  const nombre=document.getElementById('e-nombre').value.trim();
  if(!nombre){toast('Introduce un nombre');return;}
  const data={
    nombre,
    tel:   document.getElementById('e-tel').value.trim(),
    fecha: document.getElementById('e-fecha').value,
    hora:  document.getElementById('e-hora').value,
    pax:   parseInt(document.getElementById('e-pax').value)||1,
    mesas: parseInt(document.getElementById('e-mesas').value)||1,
    zonaId:getSelectedZona(),
    estado:getSelectedEstado(),
    nota:  document.getElementById('e-nota').value.trim(),
  };
  /* Construir payload con _sbId para que sbSaveReserva sepa si es insert o update */
  var toSave = editingId
    ? Object.assign({}, reservas.find(function(r){return r.id===editingId;})||{}, data)
    : data;
  var ok = await sbSaveReserva(toSave);
  if(!ok){ toast('Error al guardar — inténtalo de nuevo'); return; }
  /* Supabase confirmó → actualizar estado local */
  if(editingId){
    var r=reservas.find(function(x){return x.id===editingId;});
    if(r) Object.assign(r,data);
  } else {
    reservas.push({id:++nid,...data});
  }
  closeModal('ov-edit');
  renderRes();
  toast(editingId?'Reserva actualizada ✓':'Reserva añadida ✓');
}
function delRes(){
  document.getElementById('btn-del-res').style.display='none';
  document.getElementById('del-confirm-row').style.display='block';
}
function cancelDelRes(){
  document.getElementById('del-confirm-row').style.display='none';
  document.getElementById('btn-del-res').style.display='block';
}
async function confirmDelRes(){
  if(!editingId)return;
  var r=reservas.find(function(x){return x.id===editingId;});
  var sbId=r&&r._sbId;
  if(sbId){
    var ok=await sbDeleteReserva(sbId);
    if(!ok){ toast('Error al eliminar — inténtalo de nuevo'); return; }
  }
  reservas=reservas.filter(x=>x.id!==editingId);
  document.getElementById('del-confirm-row').style.display='none';
  closeModal('ov-edit');
  renderRes();
  toast('Reserva eliminada');
}



let selectedEmoji = '☀️';

/* ── EVENTOS DATA ── */
const TIPOS_EVENTO = {
  cata:    {label:'Cata',          icon:'🍷', color:'#9b7fd4', bg:'rgba(155,127,212,.15)', bd:'rgba(155,127,212,.4)'},
  menu:    {label:'Menú especial', icon:'🍽️', color:'#5599bb', bg:'rgba(85,153,187,.15)',  bd:'rgba(85,153,187,.4)'},
  evento:  {label:'Evento',        icon:'🎉', color:'#C5A669', bg:'rgba(197,166,105,.12)', bd:'rgba(197,166,105,.35)'},
  birthday:{label:'Cumpleaños',    icon:'🎂', color:'#e07060', bg:'rgba(220,100,80,.15)',  bd:'rgba(220,100,80,.4)'},
};

let eventos = [
  {
    id:200, nombre:'Cata Vinos Rioja', tipo:'cata', fecha:hoyStr(), hora:'20:30',
    precio:45, aforo:20, zonasIds:[5], img:null,
    asistentes:[
      {id:201, nombre:'Carlos Vega',    acomp:1, pagado:true,  metodo:'bizum',    nota:''},
      {id:202, nombre:'Marta Soler',    acomp:0, pagado:true,  metodo:'visa',     nota:'Vegetariana'},
      {id:203, nombre:'Juan Herrero',   acomp:2, pagado:false, metodo:null,       nota:''},
      {id:204, nombre:'Elena Campos',   acomp:1, pagado:true,  metodo:'efectivo', nota:''},
    ]
  },
  {
    id:210, nombre:'Menú Degustación Primavera', tipo:'menu', fecha:manaStr(), hora:'21:00',
    precio:65, aforo:16, zonasIds:[4,5], img:null,
    asistentes:[
      {id:211, nombre:'Roberto Gil',   acomp:1, pagado:true,  metodo:'transferencia', nota:''},
      {id:212, nombre:'Sofía Navarro', acomp:0, pagado:false, metodo:null,            nota:'Sin gluten'},
    ]
  },
];

/* ── RENDER EVENTOS ── */
function renderEventos(){
  const list=document.getElementById('ev-list');
  const empty=document.getElementById('ev-empty');
  const dayEvs=eventos.filter(ev=>ev.fecha>=hoyStr()).sort((a,b)=>a.fecha.localeCompare(b.fecha)||(a.hora||'').localeCompare(b.hora||''));
  if(empty) empty.style.display=dayEvs.length?'none':'block';
  list.innerHTML=dayEvs.map(ev=>{
    const tipo=TIPOS_EVENTO[ev.tipo]||TIPOS_EVENTO.evento;
    const zonasBloq=(ev.zonasIds||[]).map(id=>zonas.find(z=>z.id===id)).filter(Boolean);
    const totalPax=(ev.asistentes||[]).reduce((s,a)=>s+1+(a.acomp||0),0);
    const pagados=(ev.asistentes||[]).filter(a=>a.pagado).length;
    const aforoWarn=ev.aforo&&totalPax>ev.aforo;
    return`<div class="ev-card" onclick="openEvDetail('${ev.id}')">
      <span class="ev-card-icon">${tipo.icon}</span>
      <div class="ev-card-body">
        <div class="ev-card-name">${ev.nombre}</div>
        <div class="ev-card-meta">
          <span>${formatDayFull(ev.fecha)}${ev.hora?' · '+ev.hora:''}</span>
          ${ev.precio?`<span>· 💶 ${ev.precio}€ p.p.</span>`:''}
          ${totalPax?`<span style="${aforoWarn?'color:var(--red)':''}">· 👥 ${totalPax}${ev.aforo?' / '+ev.aforo:''}${aforoWarn?' ⚠️':''}</span>`:''}
        </div>
        ${zonasBloq.length?`<div class="ev-card-zonas">${zonasBloq.map(z=>`<span class="ev-zona-tag">${z.emoji} ${z.nombre}</span>`).join('')}</div>`:''}
      </div>
      <span style="color:var(--faint);font-size:18px;flex-shrink:0">›</span>
    </div>`;
  }).join('');
}

/* ── OPEN / SAVE EVENTO ── */
function updateEvTipoIcon(){
  const t=document.getElementById('ev-tipo').value;
  const icon=document.getElementById('ev-tipo-icon');
  if(icon) icon.textContent=TIPOS_EVENTO[t]?.icon||'🎉';
}
function getEvTipo(){return document.getElementById('ev-tipo')?.value||'evento';}

function fillEvZonaPills(selectedIds){
  document.getElementById('ev-zona-pills').innerHTML=zonas.map(z=>
    `<div class="zona-pill${selectedIds.includes(z.id)?' act':''}" data-zid="${z.id}" onclick="toggleEvZona('${z.id}',this)">${z.emoji} ${z.nombre}</div>`
  ).join('');
}
function toggleEvZona(id,el){el.classList.toggle('act');}
function getEvZonas(){return [...document.querySelectorAll('#ev-zona-pills .zona-pill.act')].map(el=>el.dataset.zid);}

let evImgBlob=null, evImgPreviewUrl=null;
function loadEvImg(input){
  const file=input.files[0];if(!file)return;
  compressImage(file).then(function(blob){
    evImgBlob=blob;
    if(evImgPreviewUrl&&evImgPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(evImgPreviewUrl);
    evImgPreviewUrl=URL.createObjectURL(blob);
    document.getElementById('ev-img-el').src=evImgPreviewUrl;
    document.getElementById('ev-img-preview').style.display='block';
  }).catch(function(err){ console.error('[img] compressImage error:',err); });
}
function clearEvImg(){
  if(evImgPreviewUrl&&evImgPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(evImgPreviewUrl);
  evImgBlob=null; evImgPreviewUrl=null;
  document.getElementById('ev-img-preview').style.display='none';
  document.getElementById('ev-img-input').value='';
}

function openNewEvento(){
  editingEventoId=null;
  document.getElementById('ev-modal-title').textContent='Nuevo evento';
  document.getElementById('btn-del-evento').style.display='none';
  document.getElementById('del-ev-confirm-row').style.display='none';
  document.getElementById('ev-nombre').value='';
  document.getElementById('ev-fecha').value=curDay||hoyStr();
  document.getElementById('ev-hora').value='';
  document.getElementById('ev-precio').value='';
  document.getElementById('ev-aforo').value='';
  document.getElementById('ev-nota').value='';
  document.getElementById('ev-tipo').value='evento';
  updateEvTipoIcon();
  fillEvZonaPills([]);
  clearEvImg();
  showModal('ov-evento');
}
function openEditEvento(id){
  const ev=eventos.find(x=>x.id===id);if(!ev)return;
  editingEventoId=id;
  document.getElementById('ev-modal-title').textContent='Editar evento';
  document.getElementById('btn-del-evento').style.display='block';
  document.getElementById('del-ev-confirm-row').style.display='none';
  document.getElementById('ev-nombre').value=ev.nombre;
  document.getElementById('ev-fecha').value=ev.fecha;
  document.getElementById('ev-hora').value=ev.hora;
  document.getElementById('ev-precio').value=ev.precio||'';
  document.getElementById('ev-aforo').value=ev.aforo||'';
  document.getElementById('ev-nota').value=ev.nota||'';
  document.getElementById('ev-tipo').value=ev.tipo||'evento';
  updateEvTipoIcon();
  fillEvZonaPills(ev.zonasIds||[]);
  evImgBlob=null;
  evImgPreviewUrl=ev.img||null;
  if(evImgPreviewUrl){document.getElementById('ev-img-el').src=evImgPreviewUrl;document.getElementById('ev-img-preview').style.display='block';}
  else{document.getElementById('ev-img-preview').style.display='none';}
  showModal('ov-evento');
}
function openEditEventoFromDetail(){
  closeModal('ov-ev-detail');
  openEditEvento(currentEventoId);
}
async function saveEvento(){
  const nombre=document.getElementById('ev-nombre').value.trim();
  if(!nombre){toast('Introduce un nombre');return;}
  const isEditing = !!editingEventoId;
  const data={
    nombre,
    tipo:getEvTipo(),
    fecha:document.getElementById('ev-fecha').value||hoyStr(),
    hora:document.getElementById('ev-hora').value,
    precio:parseFloat(document.getElementById('ev-precio').value)||0,
    aforo:parseInt(document.getElementById('ev-aforo').value)||0,
    zonasIds:getEvZonas(),
    /* Si hay blob nuevo pendiente de subir, img queda null temporalmente hasta que sbUploadEventoImg lo actualice;
       si no hay blob nuevo, conservamos la URL existente (o null si se borró) */
    img:evImgBlob ? null : evImgPreviewUrl,
    nota:document.getElementById('ev-nota').value.trim(),
    asistentes: editingEventoId ? eventos.find(x=>x.id===editingEventoId)?.asistentes||[] : [],
  };
  if(editingEventoId){
    const ev=eventos.find(x=>x.id===editingEventoId);
    if(ev) Object.assign(ev,data);
  } else {
    eventos.push({id:++nid,...data});
  }
  /* Sync a Supabase ANTES de cerrar — necesitamos el UUID retornado para eventos nuevos */
  var savedEv = editingEventoId
    ? eventos.find(function(e){return e.id===editingEventoId;})
    : eventos[eventos.length-1];
  if(savedEv && typeof sbSaveEvento==='function') await sbSaveEvento(savedEv);
  /* Subir imagen al bucket 'eventos' si hay blob nuevo */
  if(evImgBlob && savedEv && savedEv._sbId){
    var imgResult = await sbUploadEventoImg(savedEv._sbId, evImgBlob);
    if(imgResult.url){
      savedEv.img = imgResult.url;
    } else {
      toast('El evento se guardó pero la imagen no se pudo subir');
    }
    if(evImgPreviewUrl&&evImgPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(evImgPreviewUrl);
    evImgBlob = null;
    evImgPreviewUrl = savedEv.img || null;
  }
  closeModal('ov-evento');
  renderEventos();
  rebuildZonaBar();
  toast(isEditing?'Evento actualizado ✓':'Evento creado ✓');
}
function delEvento(){
  document.getElementById('btn-del-evento').style.display='none';
  document.getElementById('del-ev-confirm-row').style.display='block';
}
function cancelDelEvento(){
  document.getElementById('del-ev-confirm-row').style.display='none';
  document.getElementById('btn-del-evento').style.display='block';
}
function confirmDelEvento(){
  if(!editingEventoId)return;
  var toDelEv = eventos.find(function(e){return e.id===editingEventoId;});
  eventos=eventos.filter(x=>x.id!==editingEventoId);
  closeModal('ov-evento');
  renderEventos();
  rebuildZonaBar();
  toast('Evento eliminado');
  if(toDelEv && toDelEv._sbId && typeof sbDeleteEvento==='function') sbDeleteEvento(toDelEv._sbId);
}

/* ── EVENTO DETAIL ── */
function renderEvStats(ev){
  const totalPax=ev.asistentes.reduce((s,a)=>s+1+(Number(a.acomp)||0),0);
  const pagados=ev.asistentes.filter(a=>a.pagado).reduce((s,a)=>s+1+(Number(a.acomp)||0),0);
  const precio=parseFloat(ev.precio)||0;
  const totalEur=precio>0?(totalPax*precio).toFixed(0):null;
  const pagadoEur=precio>0?(pagados*precio).toFixed(0):null;
  const aforoWarn=ev.aforo&&totalPax>ev.aforo;
  document.getElementById('evd-stats').innerHTML=`
    <div class="info-box"><div class="info-val">${ev.asistentes.length}</div><div class="info-lbl">registros</div></div>
    <div class="info-box"><div class="info-val" style="${aforoWarn?'color:var(--red)':''}">${totalPax}${ev.aforo?'<span style="font-size:11px;color:var(--dim)"> / '+ev.aforo+'</span>':''}</div><div class="info-lbl">personas${aforoWarn?' ⚠️':''}</div></div>
    ${totalEur?`<div class="info-box"><div class="info-val" style="font-size:14px">${pagadoEur}€<span style="font-size:11px;color:var(--dim)">/${totalEur}€</span></div><div class="info-lbl">cobrado</div></div>`:`<div class="info-box"><div class="info-val">—</div><div class="info-lbl">precio</div></div>`}
  `;
}
function openEvDetail(id){
  const ev=eventos.find(x=>x.id===id);if(!ev)return;
  currentEventoId=id;
  const tipo=TIPOS_EVENTO[ev.tipo]||TIPOS_EVENTO.evento;
  document.getElementById('evd-nombre').textContent=ev.nombre;
  document.getElementById('evd-sub').textContent=tipo.label+' · '+formatDayFull(ev.fecha)+(ev.hora?' · '+ev.hora:'');
  const imgWrap=document.getElementById('evd-img-wrap');
  if(ev.img){document.getElementById('evd-img').src=ev.img;imgWrap.style.display='block';}
  else{imgWrap.style.display='none';}
  renderEvStats(ev);
  renderAsistentes(ev);
  showModal('ov-ev-detail');
}
function renderAsistentes(ev){
  const METODO_ICON={efectivo:'💵',visa:'💳',bizum:'📱',transferencia:'🏦'};
  document.getElementById('evd-asistentes').innerHTML=ev.asistentes.map(a=>{
    const acompStr=a.acomp?` +${a.acomp}`:'';
    const metodo=a.pagado&&a.metodo?` · ${METODO_ICON[a.metodo]||''} ${a.metodo}`:'';
    const pagStyle=a.pagado
      ?'background:rgba(60,140,70,.15);color:#4a9a5a'
      :'background:rgba(180,130,0,.15);color:#c89030';
    return`<div class="asi-row" onclick="openEditAsistente('${ev.id}','${a.id}')">
      <div class="asi-info">
        <div class="asi-name">${a.nombre}${acompStr}</div>
        ${a.nota?`<div class="asi-sub">${a.nota}</div>`:''}
      </div>
      <span class="asi-pago" style="${pagStyle}">${a.pagado?'Pagado'+metodo:'Pendiente'}</span>
    </div>`;
  }).join('')||`<div style="text-align:center;padding:16px;font-size:12px;color:var(--faint)">Sin asistentes aún</div>`;
}
function openImgFull(){
  const ev=eventos.find(x=>x.id===currentEventoId);
  if(!ev||!ev.img)return;
  document.getElementById('img-full-el').src=ev.img;
  showModal('ov-img-full');
}

/* ── ASISTENTES ── */
function selectAsiPago(p,el){
  document.querySelectorAll('#asi-pago-pills .zona-pill').forEach(x=>x.classList.remove('act'));
  el.classList.add('act');
  document.getElementById('asi-metodo-wrap').style.display=p==='pagado'?'block':'none';
}
function selectAsiMetodo(m,el){
  document.querySelectorAll('#asi-metodo-pills .zona-pill').forEach(x=>x.classList.remove('act'));
  el.classList.add('act');
}
function getAsiPago(){return document.querySelector('#asi-pago-pills .zona-pill.act')?.dataset.p||'pendiente';}
function getAsiMetodo(){return document.querySelector('#asi-metodo-pills .zona-pill.act')?.dataset.m||null;}

function openNewAsistente(){
  editingAsiId=null;
  document.getElementById('asi-modal-title').textContent='Nuevo asistente';
  document.getElementById('asi-nombre').value='';
  document.getElementById('asi-acomp').value='0';
  document.getElementById('btn-del-asi').style.display='none';
  document.querySelectorAll('#asi-pago-pills .zona-pill').forEach(p=>p.classList.remove('act'));
  document.querySelector('#asi-pago-pills [data-p="pendiente"]').classList.add('act');
  document.querySelectorAll('#asi-metodo-pills .zona-pill').forEach(p=>p.classList.remove('act'));
  document.getElementById('asi-metodo-wrap').style.display='none';
  document.getElementById('asi-nota').value='';
  showModal('ov-asistente');
}
function openEditAsistente(evId,aId){
  const ev=eventos.find(x=>x.id===evId);if(!ev)return;
  const a=ev.asistentes.find(x=>x.id===aId);if(!a)return;
  editingAsiId=aId;
  document.getElementById('asi-modal-title').textContent=a.nombre;
  document.getElementById('asi-nombre').value=a.nombre;
  document.getElementById('asi-acomp').value=a.acomp||0;
  document.getElementById('btn-del-asi').style.display='block';
  document.querySelectorAll('#asi-pago-pills .zona-pill').forEach(p=>p.classList.remove('act'));
  document.querySelector(`#asi-pago-pills [data-p="${a.pagado?'pagado':'pendiente'}"]`).classList.add('act');
  document.getElementById('asi-metodo-wrap').style.display=a.pagado?'block':'none';
  document.querySelectorAll('#asi-metodo-pills .zona-pill').forEach(p=>p.classList.remove('act'));
  if(a.metodo) document.querySelector(`#asi-metodo-pills [data-m="${a.metodo}"]`)?.classList.add('act');
  document.getElementById('asi-nota').value=a.nota||'';
  showModal('ov-asistente');
}
async function saveAsistente(){
  const nombre=document.getElementById('asi-nombre').value.trim();
  if(!nombre){toast('Introduce un nombre');return;}
  const ev=eventos.find(x=>x.id===currentEventoId);if(!ev)return;
  const pagado=getAsiPago()==='pagado';
  const data={nombre,acomp:parseInt(document.getElementById('asi-acomp').value)||0,pagado,metodo:pagado?getAsiMetodo():null,nota:document.getElementById('asi-nota').value.trim()};

  if(editingAsiId){
    /* EDITAR — actualiza memoria inmediatamente, sincroniza Supabase en segundo plano */
    const a=ev.asistentes.find(x=>x.id===editingAsiId);
    if(a) Object.assign(a,data);
    closeModal('ov-asistente');
    renderEvStats(ev);renderAsistentes(ev);renderEventos();
    toast('Asistente actualizado ✓');
    if(a&&a._sbId&&ev._sbId){
      sbSaveAsistente(a,ev._sbId).then(function(r){
        if(!r.ok) console.error('[sbSaveAsistente] update failed:',a._sbId);
      });
    }
  } else {
    /* NUEVO — espera UUID de Supabase antes de cerrar el modal */
    var newA={...data};
    if(ev._sbId){
      const result=await sbSaveAsistente(newA,ev._sbId);
      if(!result.ok){toast('Error al guardar — inténtalo de nuevo');return;}
      newA.id=result.id;
      newA._sbId=result.id;
    } else {
      newA.id=++nid;
    }
    ev.asistentes.push(newA);
    closeModal('ov-asistente');
    renderEvStats(ev);renderAsistentes(ev);renderEventos();
    toast('Asistente añadido ✓');
  }
}
async function confirmDelAsistente(){
  const ev=eventos.find(x=>x.id===currentEventoId);if(!ev)return;
  const a=ev.asistentes.find(x=>x.id===editingAsiId);
  const sbId=a&&a._sbId;
  if(sbId){
    const ok=await sbDeleteAsistente(sbId);
    if(!ok){toast('Error al eliminar — inténtalo de nuevo');return;}
  }
  ev.asistentes=ev.asistentes.filter(x=>x.id!==editingAsiId);
  closeModal('ov-asistente');
  renderEvStats(ev);
  renderAsistentes(ev);
  renderEventos();
  toast('Asistente eliminado');
}

/* ── ZONA BLOCKING — eventos bloquean zonas en su turno ── */
function zonasBlockedHoy(){
  return eventos
    .filter(ev=>ev.fecha===curDay)
    .flatMap(ev=>ev.zonasIds||[]);
}


/* ── ZONA BAR ── */
function rebuildZonaBar(){
  const bar = document.getElementById('zona-bar');
  if(!bar) return;
  const activas = zonas.filter(z => z.activa !== false);
  bar.innerHTML = `<div class="zpill act" onclick="setZona('all',this)"><span class="zpill-icon">✦</span><span class="zpill-lbl">Todas</span></div>` +
    activas.map(z => `<div class="zpill" onclick="setZona('${z.id}',this)"><span class="zpill-icon">${z.emoji}</span><span class="zpill-lbl">${z.nombre}</span></div>`).join('');
}

/* ── INIT ── */

/* ── TEL BTNS ── */
function updateTelBtns(){
  var tel = (document.getElementById('e-tel')?.value||'').replace(/\D/g,'');
  var callBtn = document.getElementById('tel-call-btn');
  var waBtn   = document.getElementById('tel-wa-btn');
  var show = tel.length >= 9;
  if(callBtn) callBtn.style.display = show ? '' : 'none';
  if(waBtn)   waBtn.style.display   = show ? '' : 'none';
}

loadZonas(); rebuildZonaBar();
initDay();
initSupabase(); /* carga datos reales de Supabase */
