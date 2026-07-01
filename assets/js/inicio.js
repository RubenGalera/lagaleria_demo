/* lagaleria_inicio.html — dashboard de Inicio.
   Depende de globals cargados antes: _sb/LOCAL_ID (supabase-client.js), toast/showModal/closeModal/stepField/formatDateLabel (ui-helpers.js).
   Expone funciones/variables globales (initFromParent, navTo, initDashboard, etc.) en window — sin IIFE/module — para que window.parent y los iframes puedan usarlas. */


var SUPA_URL = 'https://nnmaedehqeeogmhzqzji.supabase.co';
var SUPA_KEY = 'sb_publishable_spxukgcwMf-VFre7l_E68g_tWatBs9X';

/* ── Auth helpers ─────────────────────────────────────────────────────── */
/* revisar: getAuthToken()/supaFetch() reimplementan acceso REST a Supabase en paralelo a _sb (supabase-client.js), que ya está cargado en esta página. No se unificó porque cambiaría la lógica de negocio (headers, manejo de errores). Ver docs/MEJORAS.md — deuda técnica. */
function getAuthToken(){
  try{
    var p = window.parent;
    if(p.supabase){
      var sess = p._supaSession;
      if(sess && sess.access_token) return sess.access_token;
    }
  }catch(e){}
  return SUPA_KEY;
}

function supaFetch(path, opts){
  var token = getAuthToken();
  var headers = Object.assign({
    'apikey': SUPA_KEY,
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  }, opts && opts.headers || {});
  return fetch(SUPA_URL + path, Object.assign({}, opts, { headers: headers }));
}

/* ── Init ─────────────────────────────────────────────────────────────── */
var rol = 'admin';
var localId = null;

function initFromParent(){
  try{
    var p = window.parent;
    if(!p || !p.currentUser){
      try{
        var saved = localStorage.getItem('lg_session');
        if(saved){ var u = JSON.parse(saved); rol = u.rol || 'admin'; applyRolPermissions(rol); }
      }catch(e){}
      var isMockDirect = new URLSearchParams(window.location.search).get('mock') === '1';
      if(isMockDirect) showMockBadge();
      else{ localId = LOCAL_ID; fetchReservasHoy(); }
      return;
    }
    rol = p.currentUser.rol;
    applyRolPermissions(rol);
    var local = p.getActiveLocal ? p.getActiveLocal() : null;
    if(local){
      var gn = document.getElementById('greeting-name');
      if(gn) gn.textContent = local.nombre;
    }
    var isMock = new URLSearchParams(window.location.search).get('mock') === '1';
    if(!isMock){ localId = LOCAL_ID; fetchReservasHoy(); }
  }catch(e){ console.error('initFromParent', e); }
}

function showMockBadge(){
  var b = document.getElementById('mock-badge');
  if(b) b.style.display = 'block';
}

async function fetchReservasHoy(){
  if(!localId) return;
  try{
    var hoy = new Date().toISOString().slice(0,10);
    var res = await supaFetch(
      '/rest/v1/reservas?select=id&local_id=eq.'+localId+'&fecha=eq.'+hoy
    );
    if(!res.ok) throw new Error(res.status);
    var data = await res.json();
    document.getElementById('stat-reservas').textContent = data.length || '0';
    if(data.length > 0){
      document.getElementById('mod-reservas-sub').textContent = data.length + ' reserva'+(data.length===1?'':'s')+' hoy';
    }
  }catch(e){ /* silencioso */ }
}

/* ── Navegación entre iframes ─────────────────────────────────────────── */
function navTo(page, section){
  try{
    window.parent.goTo(page);
    if(section){
      setTimeout(function(){
        try{
          var fr = window.parent.document.getElementById('fr-'+page);
          if(fr && fr.contentWindow && fr.contentWindow.goToSection){
            fr.contentWindow.goToSection(section);
          }
        }catch(e){}
      }, 400);
    }
  }catch(e){}
}

window.addEventListener('load', function(){ initFromParent(); setTimeout(initDashboard, 300); });
window.refreshInicio = initFromParent;

/* ── Helpers locales ──────────────────────────────────────────────────── */
var _trabWorkers = [];
function L(){return{staff:_trabWorkers,data:{sm:[[],[],[],[],[],[],[]],sn:[[],[],[],[],[],[],[]],cm:[[],[],[],[],[],[],[]],cn:[[],[],[],[],[],[],[]]},eventos:[]};}

function showToast(msg){
  var t=document.getElementById('_toast');if(!t)return;
  t.textContent=msg;t.style.opacity='1';
  clearTimeout(t._t);t._t=setTimeout(function(){t.style.opacity='0';},2200);
}

function toggleDashDispo(el){
  var exp=el.parentElement.querySelector('.dash-expand');
  var chev=el.querySelector('.dash-chev');
  if(exp)exp.classList.toggle('open');
  if(chev)chev.classList.toggle('open');
}

/* ── Dashboard — orquestador ──────────────────────────────────────────── */
async function initDashboard(){
  var d=new Date();
  var dias=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  var meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var startOfYear=new Date(d.getFullYear(),0,1);
  var sem=Math.ceil(((d-startOfYear)/86400000+startOfYear.getDay()+1)/7);
  var fel=document.getElementById('dash-fecha-full');if(fel)fel.textContent=dias[d.getDay()]+' '+d.getDate()+' '+meses[d.getMonth()]+' '+d.getFullYear();
  var sel=document.getElementById('dash-semana');if(sel)sel.textContent='Semana '+sem;
  var reservas=null,eventos=null,prods=null,loc=null;
  try{
    var frames=window.parent?window.parent.document.querySelectorAll('iframe'):[];
    console.log('[dash] iframes en padre:',frames.length);
    frames.forEach(function(f){
      try{
        var cw=f.contentWindow;
        console.log('[dash] iframe src:',f.src,'→ cw.eventos:',cw&&cw.eventos,'len:',cw&&cw.eventos&&cw.eventos.length);
        if(cw&&cw.reservas&&cw.reservas.length)reservas=cw.reservas;
        if(cw&&cw.eventos&&cw.eventos.length)eventos=cw.eventos;
        if(cw&&cw.prods)prods=cw.prods;
        if(cw&&cw.L)loc=cw.L();
      }catch(e){console.log('[dash] iframe bloqueado:',e.message);}
    });
  }catch(e){console.log('[dash] frames error:',e);}
  console.log('[dash] post-iframe → _sb:',!!_sb,'eventos:',eventos,'reservas:',!!reservas,'prods:',!!prods);
  if(_sb&&(!eventos||!reservas||!prods)){
    try{
      var hoyStr=new Date().toISOString().split('T')[0];
      var _td=new Date(),_dow=_td.getDay(),_moff=_dow===0?-6:1-_dow;
      var _mon=new Date(_td);_mon.setDate(_td.getDate()+_moff);
      var _sun=new Date(_mon);_sun.setDate(_mon.getDate()+6);
      var _monStr=_mon.toISOString().split('T')[0],_sunStr=_sun.toISOString().split('T')[0];
      console.log('[dash] Supabase query eventos: gte',hoyStr,'lte',_sunStr,'local_id',LOCAL_ID);
      var _qEv   = (eventos&&eventos.length) ? null : _sb.from('eventos').select('id,nombre,fecha,hora').eq('local_id',LOCAL_ID).gte('fecha',hoyStr).lte('fecha',_sunStr).order('fecha').order('hora');
      var _qRes  = reservas ? null : _sb.from('reservas').select('*').eq('local_id',LOCAL_ID).eq('fecha',hoyStr).order('hora');
      var _qProd = prods    ? null : _sb.from('productos').select('nombre,cantidad,minimo').eq('local_id',LOCAL_ID).eq('activo',true);
      var _qZona = reservas ? null : _sb.from('zonas').select('id,emoji').eq('local_id',LOCAL_ID);
      var _noop=Promise.resolve({data:null});
      var _rs=await Promise.all([
        Promise.resolve(_qEv  ||_noop).catch(function(){return{data:null};}),
        Promise.resolve(_qRes ||_noop).catch(function(){return{data:null};}),
        Promise.resolve(_qProd||_noop).catch(function(){return{data:null};}),
        Promise.resolve(_qZona||_noop).catch(function(){return{data:null};}),
      ]);
      var _evData=_rs[0].data,_resData=_rs[1].data,_prodData=_rs[2].data,_zonaData=_rs[3].data;
      console.log('[dash] _evData completo:',JSON.stringify(_rs[0]));
      if(!(eventos&&eventos.length)&&_evData)eventos=_evData.map(function(e){return{nombre:e.nombre||'',fecha:e.fecha,hora:e.hora?e.hora.slice(0,5):''};});
      if(!reservas&&_resData){var _zm={};(_zonaData||[]).forEach(function(z){_zm[z.id]=z.emoji;});reservas=_resData.map(function(r){return{nombre:r.nombre,fecha:r.fecha,hora:r.hora?r.hora.slice(0,5):'',pax:r.pax,mesas:r.mesas,estado:r.estado,zonaId:r.zona_id,emoji:_zm[r.zona_id]||'📍',nota:r.nota||''};});}
      if(!prods&&_prodData)prods=_prodData.map(function(p){return{name:p.nombre,qty:p.cantidad,min:p.minimo};});
    }catch(e){console.error('[dash] sbFallback:',e);}
  }else{console.log('[dash] bloque Supabase OMITIDO — _sb:',!!_sb,'eventos ya cargado:',!!eventos);}
  console.log('[dash] → _dashEventos con:',eventos);
  if(!loc)loc=L();
  _dashReservas(reservas);_dashStock(prods);_dashEventos(eventos);_dashTurnos(loc);
}

/* ── Dashboard — card: Reservas hoy ──────────────────────────────────── */
function _dashReservas(reservas){
  var hoy=new Date().toISOString().split('T')[0];
  var deHoy=reservas?reservas.filter(function(r){return r.fecha===hoy;}):[];
  var conf=deHoy.filter(function(r){return r.estado==='confirmada';}).length;
  var pend=deHoy.filter(function(r){return r.estado==='pendiente';}).length;
  var total=deHoy.length;
  var sub=document.getElementById('dash-res-sub'),badge=document.getElementById('dash-res-badge');
  if(sub)sub.textContent=total?'Reservas programadas para hoy':'Sin reservas hoy';
  if(badge)badge.textContent=total||'—';
  if(total&&badge)badge.className='dash-badge dash-badge-warn';
  var ahora=new Date().toTimeString().slice(0,5);
  var proximas=deHoy.filter(function(r){return r.hora>=ahora&&r.estado!=='cancelada';});
  proximas.sort(function(a,b){return a.hora.localeCompare(b.hora);});
  var prox=proximas[0];
  var pn=document.getElementById('dash-prox-nombre'),pm=document.getElementById('dash-prox-meta'),ph=document.getElementById('dash-prox-hora');
  if(prox){if(pn)pn.textContent=prox.nombre;if(pm)pm.textContent=prox.pax+' pax · '+prox.estado;if(ph)ph.textContent=prox.hora;}
  var zonas=[{id:101,emoji:'☀️',nombre:'Terraza',mesas:8},{id:102,emoji:'🚪',nombre:'Entrada',mesas:4},{id:103,emoji:'🍷',nombre:'Barra',mesas:6},{id:104,emoji:'🪑',nombre:'Sala',mesas:10},{id:105,emoji:'🎭',nombre:'Salón',mesas:6}];
  var libM=0,libN=0,hM='',hN='';
  zonas.forEach(function(z){
    var rM=deHoy.filter(function(r){return r.hora<'16:00'&&r.zonaId===z.id;}).length;
    var rN=deHoy.filter(function(r){return r.hora>='16:00'&&r.zonaId===z.id;}).length;
    libM+=Math.max(0,z.mesas-rM);libN+=Math.max(0,z.mesas-rN);
    hM+='<div class="dash-zona-item"><span class="dash-zona-name">'+z.emoji+' '+z.nombre+'</span><span class="'+(rM>=z.mesas?'dash-zona-full':'dash-zona-count')+'">'+rM+'/'+z.mesas+'</span></div>';
    hN+='<div class="dash-zona-item"><span class="dash-zona-name">'+z.emoji+' '+z.nombre+'</span><span class="'+(rN>=z.mesas?'dash-zona-full':'dash-zona-count')+'">'+rN+'/'+z.mesas+'</span></div>';
  });
  var zm=document.getElementById('dash-zonas-med'),zn=document.getElementById('dash-zonas-noch'),lm=document.getElementById('dash-libres-med'),ln=document.getElementById('dash-libres-noch');
  if(zm)zm.innerHTML=hM;if(zn)zn.innerHTML=hN;if(lm)lm.textContent='· '+libM+' libres';if(ln)ln.textContent='· '+libN+' libres';
}

/* ── Dashboard — card: Stock ──────────────────────────────────────────── */
function _dashStock(prods){
  var sub=document.getElementById('dash-stock-sub'),badge=document.getElementById('dash-stock-badge'),ic=document.getElementById('dash-stock-ic'),title=document.getElementById('dash-stock-title');
  if(!prods){try{var raw=localStorage.getItem('lg_stock_v1');if(raw)prods=JSON.parse(raw);}catch(e){}}
  if(!prods||!prods.length){if(sub)sub.textContent='Sin datos de stock';return;}
  var rojos=prods.filter(function(p){return p.min>0&&p.qty*2<=p.min;});
  var ambars=prods.filter(function(p){return p.min>0&&p.qty*2>p.min&&p.qty<=p.min;});
  var total=rojos.length+ambars.length;
  if(rojos.length){if(title)title.textContent='Stock crítico';if(sub)sub.textContent=rojos.slice(0,2).map(function(p){return p.name;}).join(' · ')+(rojos.length>2?' +más':'');if(badge){badge.textContent=total;badge.className='dash-badge dash-badge-alert';}if(ic)ic.className='dash-ic dash-ic-alert';}
  else if(ambars.length){if(title)title.textContent='Stock en mínimos';if(sub)sub.textContent=ambars.slice(0,2).map(function(p){return p.name;}).join(' · ')+(ambars.length>2?' +más':'');if(badge){badge.textContent=total;badge.className='dash-badge dash-badge-warn';}if(ic)ic.className='dash-ic dash-ic-warn';}
  else{if(title)title.textContent='Stock';if(sub)sub.textContent='Todo en orden';if(badge){badge.textContent='✓';badge.className='dash-badge dash-badge-ok';}if(ic)ic.className='dash-ic dash-ic-ok';}
}

/* ── Dashboard — cards: Eventos hoy / Esta semana ────────────────────── */
function _dashEventos(eventos){
  var hoy=new Date().toISOString().split('T')[0];
  var _dt=new Date(),_dw=_dt.getDay(),_ms=_dw===0?-6:1-_dw;
  var _sn=new Date(_dt);_sn.setDate(_dt.getDate()+_ms+6);
  var sunStr=_sn.toISOString().split('T')[0];
  var evHoy=eventos?eventos.filter(function(e){return e.fecha===hoy;}):[];
  var evSem=eventos?eventos.filter(function(e){return e.fecha>=hoy&&e.fecha<=sunStr;}):[];
  var sub=document.getElementById('dash-ev-hoy-sub'),badge=document.getElementById('dash-ev-hoy-badge');
  if(evHoy.length){if(sub)sub.textContent=evHoy.map(function(e){return e.nombre;}).join(' · ');if(badge){badge.textContent=evHoy.length;badge.className='dash-badge dash-badge-info';}}
  else{if(sub)sub.textContent='Sin eventos programados para hoy';}
  var subS=document.getElementById('dash-ev-sem-sub'),badgeS=document.getElementById('dash-ev-sem-badge'),icS=document.getElementById('dash-ev-sem-ic');
  if(evSem.length){var dias=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];var pe=evSem[0];var dName=dias[new Date(pe.fecha+'T12:00:00').getDay()]||'';if(subS)subS.textContent='Próximo evento: '+pe.nombre+' · '+dName+(pe.hora?' '+pe.hora:'');if(badgeS){badgeS.textContent=evSem.length;badgeS.className='dash-badge dash-badge-info';}if(icS)icS.className='dash-ic dash-ic-info';}
  else{if(subS)subS.textContent='Sin eventos esta semana';}
}

/* ── Dashboard — card: Turnos esta semana ────────────────────────────── */
function _dashTurnos(loc){
  var sub=document.getElementById('dash-turnos-sub'),badge=document.getElementById('dash-turnos-badge'),ic=document.getElementById('dash-turnos-ic');
  if(!loc||!loc.data){if(sub)sub.textContent='Abre Turnos para cargar datos';return;}
  var slots=['sm','sn','cm','cn'],huecos=0;
  slots.forEach(function(s){for(var d=0;d<7;d++){if(!loc.data[s]||!loc.data[s][d]||!loc.data[s][d].length)huecos++;}});
  if(huecos===0){if(sub)sub.textContent='Todos los slots cubiertos';if(badge){badge.textContent='✓';badge.className='dash-badge dash-badge-ok';}if(ic)ic.className='dash-ic dash-ic-ok';}
  else{if(sub)sub.textContent='Faltan '+huecos+' slots por cubrir';if(badge){badge.textContent='⚠';badge.className='dash-badge dash-badge-warn';}if(ic)ic.className='dash-ic dash-ic-warn';}
}

/* ── Permisos por rol ─────────────────────────────────────────────────── */
function applyRolPermissions(r){
  var isEmpleado=r==='empleado';
  var cardReservas=document.getElementById('card-reservas');if(cardReservas)cardReservas.style.display=isEmpleado?'none':'';
  var cardEventos=document.getElementById('card-eventos');if(cardEventos)cardEventos.style.display=isEmpleado?'none':'';
  var stockBadge=document.getElementById('stock-readonly-badge');if(stockBadge)stockBadge.style.display=isEmpleado?'':'none';
  var greetUser=document.getElementById('greeting-user');
  try{var u=window.parent&&window.parent.currentUser?window.parent.currentUser:JSON.parse(localStorage.getItem('lg_session')||'{}');if(greetUser&&u.nombre)greetUser.textContent=u.nombre.split(' ')[0];}catch(e){}
}

