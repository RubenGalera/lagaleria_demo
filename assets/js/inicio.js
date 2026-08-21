/* lagaleria_inicio.html — dashboard de Inicio (rediseño mockup v7).

   Depende de globals cargados antes: _sb/LOCAL_ID (supabase-client.js),
   showModal (ui-helpers.js — llamado desde este .js con guard typeof;
   closeModal, del mismo archivo, se usa solo desde el HTML del modal,
   onclick="closeModal(...)", nunca desde este .js), cleanTel/isoWeekNum/
   mondayOfDate (utils.js), getStockStatus (assets/lib/stock-status.js —
   mismo criterio de semáforo rojo/ámbar/verde que Stock/Pedido, ver
   _loadAlertaStock()), showToast (assets/lib/toast.js — este archivo ya no
   tiene su propio showToast, ver toast.js para el porqué).

   Dependencias del SHELL (window.parent = index.html, el documento que
   monta este archivo dentro de un iframe — nunca están garantizadas si esta
   página se abre suelta, por eso todo acceso va en try/catch):
     window.parent.currentUser        — sesión activa, ver _getCurrentUser()
     window.parent.goTo(page)         — cambia de iframe/pestaña, ver navTo()
     window.parent.document.getElementById('fr-'+page) — referencia directa
       al <iframe> de otra sección, para llamar a una función suya
       (goToSection/openEvDetail/setCat) tras el cambio de pestaña.

   Expone funciones/variables globales (initDashboard, navTo, goToTurnos, navToEvento, navToStockReponer,
   openContactosPanel, openProveedoresPanel, etc.) en window — sin IIFE/module — para que window.parent y
   los iframes puedan usarlas.
   A diferencia de la versión anterior (que "espiaba" el estado en memoria de los iframes hermanos con un
   fallback a Supabase), esta versión consulta Supabase directamente para cada card — más simple y no
   depende de que otro iframe ya esté cargado.

   ÍNDICE (línea aprox. — no reordenado físicamente):
     1. CONSTANTES Y ESTADO             L.45  (_todayDowIdx, MESES_ABR, DIAS_LARGOS,
                                                _formatFechaCorta, _getCurrentUser...)
     2. NAVEGACIÓN (navTo)              L.87  (navTo, goToTurnos, navToEvento, navToStockReponer)
     3. INICIALIZACIÓN Y CARGA DE DATOS L.129 (listener load, initDashboard, _renderAllEmpty)
        · Header                        L.177 (_renderHeader, _weekRangeLabel)
     4. TU SEMANA (mini-grid)           L.205
     5. TURNOS DE HOY                   L.294
     6. RESERVAS HOY                    L.340
     7. PRÓXIMO EVENTO                  L.415
     8. ALERTAS                         L.464
     9. CONTACTOS Y PROVEEDORES         L.573 */


/* ── CONSTANTES Y ESTADO ──
   mondayOfDate/isoWeekNum viven ahora en assets/lib/utils.js — antes eran una
   copia local (mismo algoritmo que turnos.js), duplicada porque esta página
   no carga turnos.js; ahora ambas cargan utils.js en su lugar. */
function _todayDowIdx(){ var jsDay=new Date().getDay(); return jsDay===0?6:jsDay-1; } // 0=Lunes...6=Domingo, igual que turnos.dia
var MESES_ABR=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
var DIAS_LARGOS=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
function _formatFechaCorta(fecha){
  var d=new Date(fecha+'T00:00:00Z');
  return d.getUTCDate()+' '+MESES_ABR[d.getUTCMonth()];
}

/* ── Sesión actual ── */
function _getCurrentUser(){
  try{ if(window.parent && window.parent!==window && window.parent.currentUser) return window.parent.currentUser; }catch(e){}
  try{ var saved=localStorage.getItem('lg_session'); if(saved) return JSON.parse(saved); }catch(e){}
  return null;
}
function showMockBadge(){ var b=document.getElementById('mock-badge'); if(b) b.style.display='block'; }

function _escHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _uniq(arr){ var seen={},out=[]; arr.forEach(function(x){ if(x&&!seen[x]){seen[x]=true;out.push(x);} }); return out; }

/* ── Navegación entre iframes ─────────────────────────────────────────── */
/**
 * Lleva al usuario a otra pestaña del shell y, opcionalmente, a una sección
 * concreta dentro de ella — usado en el onclick de las cards de Inicio
 * ("Reservas hoy" → Reservas/res, alertas → Turnos/Stock...).
 *
 * El cambio de pestaña (window.parent.goTo) es síncrono, pero el iframe
 * destino puede tardar en montar su DOM — por eso goToSection() se llama
 * 400ms después, dando tiempo a que exista fr.contentWindow.goToSection.
 * Si el shell no existe (página abierta suelta) o el iframe no expone esa
 * función, falla en silencio (try/catch) en vez de romper la navegación
 * básica, que sí puede ya haber funcionado.
 *
 * @param {string} page - Id de la pestaña destino ('turnos'|'reservas'|'stock'|...).
 * @param {string} [section] - Sección a la que saltar dentro de esa pestaña
 *   (se le pasa tal cual a goToSection() del iframe destino).
 */
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
function goToTurnos(){ try{ window.parent.goTo('turnos'); }catch(e){} }
function navToEvento(id){
  try{
    window.parent.goTo('reservas');
    setTimeout(function(){
      try{
        var fr=window.parent.document.getElementById('fr-reservas');
        var cw=fr&&fr.contentWindow;
        if(cw&&cw.goToSection) cw.goToSection('ev');
        if(cw&&cw.openEvDetail) cw.openEvDetail(id);
      }catch(e){}
    },400);
  }catch(e){}
}
function navToStockReponer(){
  try{
    window.parent.goTo('stock');
    setTimeout(function(){
      try{
        var fr=window.parent.document.getElementById('fr-stock');
        if(fr&&fr.contentWindow&&fr.contentWindow.setCat) fr.contentWindow.setCat('rep');
      }catch(e){}
    },400);
  }catch(e){}
}

/* ── INICIALIZACIÓN Y CARGA DE DATOS ── */
window.addEventListener('load', function(){
  try{ if(new URLSearchParams(window.location.search).get('mock')==='1') showMockBadge(); }catch(e){}
  setTimeout(initDashboard, 300);
});
window.refreshInicio = initDashboard;

/* ── Dashboard — orquestador ──────────────────────────────────────────── */
async function initDashboard(){
  var todayStr = new Date().toISOString().split('T')[0];
  var monday = mondayOfDate(todayStr);
  var todayIdx = _todayDowIdx();
  var user = _getCurrentUser();
  var myId = user && user._sbId || null;

  _renderHeader(user, todayStr);
  var wr=document.getElementById('week-range'); if(wr) wr.textContent=_weekRangeLabel(monday);

  if(!window._sb || typeof LOCAL_ID==='undefined' || !LOCAL_ID){
    _renderAllEmpty('Sin conexión');
    return;
  }

  try{
    await Promise.all([
      _loadTuSemana(monday, todayIdx, myId),
      _loadTurnosHoy(monday, todayIdx, myId),
      _loadReservasHoy(todayStr),
      _loadProximoEvento(todayStr),
      _loadAlertaStock(),
      _loadAlertaConflictos(monday),
      _loadAlertaReservas(todayStr),
    ]);
  }catch(e){ console.error('[inicio] initDashboard', e); }
}

function _renderAllEmpty(msg){
  ['week-grid','turnos-hoy-card','reservas-card'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.innerHTML='<div class="card-empty">'+_escHtml(msg)+'</div>';
  });
  var sec=document.getElementById('evento-sec'); if(sec) sec.style.display='none';
  var as=document.getElementById('alert-stock');
  if(as){ as.className='alert-card'; as.innerHTML='<div class="alert-n">—</div><div class="alert-bottom"><div class="alert-txt">'+_escHtml(msg)+'</div></div>'; }
  var at=document.getElementById('alert-turnos');
  if(at){ at.className='alert-card warn'; at.innerHTML='<div class="alert-n warn">—</div><div class="alert-bottom"><div class="alert-txt">'+_escHtml(msg)+'</div></div>'; }
  var ar=document.getElementById('alert-reservas'); if(ar) ar.style.display='none';
}

/* ── Header ────────────────────────────────────────────────────────────── */
function _renderHeader(user, todayStr){
  var nameEl=document.getElementById('hdr-name'), dateEl=document.getElementById('hdr-date');
  var nombre=(user&&user.nombre)||'';
  if(nameEl) nameEl.textContent = nombre ? nombre.split(' ')[0] : '—';
  var d=new Date(todayStr+'T12:00:00');
  var sem=isoWeekNum(todayStr);
  if(dateEl) dateEl.textContent = DIAS_LARGOS[d.getDay()]+' '+d.getDate()+' '+['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][d.getMonth()]+' · Semana '+sem;
}
function _weekRangeLabel(monday){
  var m=new Date(monday+'T00:00:00Z');
  var s=new Date(m.getTime()); s.setUTCDate(m.getUTCDate()+6);
  return m.getUTCDate()+' – '+s.getUTCDate()+' '+MESES_ABR[s.getUTCMonth()];
}

/* ── Tu semana ─────────────────────────────────────────────────────────── */
/**
 * Pinta el mini-grid "Tu semana": dos filas (Mediodía/Noche) × 7 días con un
 * check en los días donde el usuario tiene turno activo, y una celda de
 * vacaciones (🌴) en los días sin turno que caen dentro de un periodo de
 * `trabajadores_vacaciones` — nunca sobrescribe un día con turno real, la
 * marca de vacaciones solo se pinta si ese día no tiene check.
 * Sin sesión (myId null) muestra un estado vacío pidiendo iniciar sesión,
 * sin llegar a consultar Supabase.
 *
 * @param {string} monday - Lunes de la semana actual, 'YYYY-MM-DD'.
 * @param {number} todayIdx - Día de hoy (0=lunes...6=domingo) para resaltarlo.
 * @param {string|null} myId - trabajador_id (UUID) del usuario logueado.
 */
async function _loadTuSemana(monday, todayIdx, myId){
  var grid=document.getElementById('week-grid'); if(!grid) return;
  var legend=document.getElementById('week-legend');
  if(!myId){
    grid.style.display='block';
    grid.innerHTML='<div class="card-empty">Inicia sesión para ver tus turnos</div>';
    if(legend) legend.style.display='none';
    return;
  }
  grid.style.display='';
  var sundayObj=new Date(monday+'T00:00:00Z'); sundayObj.setUTCDate(sundayObj.getUTCDate()+6);
  var sundayStr=sundayObj.toISOString().split('T')[0];
  var results = await Promise.all([
    _sb.from('turnos').select('dia, slot')
      .eq('local_id',LOCAL_ID).eq('semana_inicio',monday).eq('activa',true).eq('trabajador_id',myId),
    _sb.from('trabajadores_vacaciones').select('desde, hasta')
      .eq('trabajador_id',myId).lte('desde',sundayStr).gte('hasta',monday),
  ]);
  var res=results[0], vacRes=results[1];
  if(res.error){ console.error('[inicio] tu semana:', res.error.message); grid.innerHTML=''; return; }
  var med=[false,false,false,false,false,false,false], noc=[false,false,false,false,false,false,false];
  (res.data||[]).forEach(function(r){
    if(r.dia<0||r.dia>6) return;
    if(r.slot==='sm'||r.slot==='cm') med[r.dia]=true;
    if(r.slot==='sn'||r.slot==='cn') noc[r.dia]=true;
  });
  var vac=[false,false,false,false,false,false,false];
  if(vacRes.error) console.error('[inicio] tu semana vacaciones:', vacRes.error.message);
  else (vacRes.data||[]).forEach(function(v){
    for(var d=0;d<7;d++){
      var dt=new Date(monday+'T00:00:00Z'); dt.setUTCDate(dt.getUTCDate()+d);
      var dayStr=dt.toISOString().split('T')[0];
      if(dayStr>=v.desde && dayStr<=v.hasta) vac[d]=true;
    }
  });
  var DAYS=['L','M','X','J','V','S','D'];
  var h='<div class="wg-head"></div>';
  DAYS.forEach(function(d,i){ h+='<div class="wg-head'+(i===todayIdx?' today':'')+'">'+d+'</div>'; });
  h+=_weekGridRow('Med', med, todayIdx, vac);
  h+=_weekGridRow('Noc', noc, todayIdx, vac);
  grid.innerHTML=h;
  if(legend) legend.style.display = vac.some(function(v){return v;}) ? 'flex' : 'none';
}
function _weekGridRow(label, arr, todayIdx, vac){
  var h='<div class="wg-row-lbl">'+label+'</div>';
  arr.forEach(function(on,i){
    var gold = on && i===todayIdx;
    if(on) h+='<div class="wg-cell"><div class="wg-check'+(gold?' me':'')+'"><i class="ti ti-check" aria-hidden="true"></i></div></div>';
    else if(vac && vac[i]) h+='<div class="wg-cell"><div class="wg-check vac" title="Vacaciones">🌴</div></div>';
    else h+='<div class="wg-cell"></div>';
  });
  return h;
}

/* ── Turnos de hoy ─────────────────────────────────────────────────────── */
/* Nº de personas requeridas por slot para el día de hoy: lee la plantilla WeekConfig
   (Admin/Turnos), guardada en localStorage — es solo del dispositivo/navegador actual
   (no viaja por Supabase), así que si nunca se configuró ahí, se asume 0 y una card
   con gente asignada siempre se ve "completa" (nunca se inventan huecos sin base). */
function _requiredForToday(todayIdx){
  var out={sm:0,sn:0,cm:0,cn:0};
  try{
    var raw=localStorage.getItem('lg_weekconfig_v1');
    if(raw){
      var cfg=JSON.parse(raw);
      var day=cfg[todayIdx];
      if(day){ ['sm','sn','cm','cn'].forEach(function(s){ out[s]=(day[s]||[]).length; }); }
    }
  }catch(e){ console.warn('[inicio] weekConfig local no disponible:', e); }
  return out;
}
function _slotNamesHtml(list, myId){
  return list.map(function(p){
    var esc=_escHtml(p.nombre);
    return p.id===myId ? '<span class="name-me">'+esc+'</span>' : esc;
  }).join(', ');
}
/**
 * Pinta la card "Turnos de hoy": una fila por slot (Sala med/noc, Cocina
 * med/noc) con los nombres asignados hoy (el propio usuario resaltado, ver
 * _slotNamesHtml) y, si el slot no cubre el mínimo de WeekConfig
 * (_requiredForToday), cuántos huecos faltan y un punto de aviso (dot-warn).
 * Segunda query encadenada (no en el Promise.all de initDashboard) porque
 * necesita los trabajador_id de la primera para resolver sus nombres.
 *
 * @param {string} monday - Lunes de la semana actual, 'YYYY-MM-DD'.
 * @param {number} todayIdx - Día de hoy (0=lunes...6=domingo) a consultar.
 * @param {string|null} myId - trabajador_id del usuario logueado, para resaltar su nombre.
 */
async function _loadTurnosHoy(monday, todayIdx, myId){
  var card=document.getElementById('turnos-hoy-card'); if(!card) return;
  var res = await _sb.from('turnos').select('slot, trabajador_id')
    .eq('local_id',LOCAL_ID).eq('semana_inicio',monday).eq('dia',todayIdx).eq('activa',true);
  if(res.error){ console.error('[inicio] turnos hoy:', res.error.message); card.innerHTML='<div class="card-empty">Error al cargar</div>'; return; }
  var rows=res.data||[];
  var ids=_uniq(rows.map(function(r){return r.trabajador_id;}));
  var nameById={};
  if(ids.length){
    var tRes=await _sb.from('trabajadores').select('id, nombre').in('id', ids);
    if(tRes.error) console.error('[inicio] turnos hoy (nombres):', tRes.error.message);
    (tRes.data||[]).forEach(function(t){ nameById[t.id]=t.nombre; });
  }
  var bySlot={sm:[],sn:[],cm:[],cn:[]};
  rows.forEach(function(r){ if(bySlot[r.slot]) bySlot[r.slot].push({id:r.trabajador_id, nombre:nameById[r.trabajador_id]||'—'}); });
  var required=_requiredForToday(todayIdx);
  var SLOTS=[{k:'sm',lbl:'Sala med'},{k:'sn',lbl:'Sala noc'},{k:'cm',lbl:'Cocina med'},{k:'cn',lbl:'Cocina noc'}];
  card.innerHTML = SLOTS.map(function(s){
    var list=bySlot[s.k], need=required[s.k], falta=Math.max(0, need-list.length), complete=falta===0;
    var namesHtml;
    if(!list.length){
      namesHtml = falta>0
        ? '<span style="color:var(--text-warning)">'+falta+' hueco'+(falta===1?'':'s')+' sin cubrir</span>'
        : '<span style="color:var(--text-muted)">Sin turnos</span>';
    } else if(falta>0){
      namesHtml = _slotNamesHtml(list, myId)+' · <span style="color:var(--text-warning)">'+falta+' hueco'+(falta===1?'':'s')+' sin cubrir</span>';
    } else {
      namesHtml = _slotNamesHtml(list, myId);
    }
    return '<div class="turnos-slot">'+
      '<span class="slot-dot '+(complete?'dot-ok':'dot-warn')+'"></span>'+
      '<span class="slot-tag">'+s.lbl+'</span>'+
      '<span class="slot-names">'+namesHtml+'</span>'+
    '</div>';
  }).join('');
}

/* ── Reservas hoy ──────────────────────────────────────────────────────── */
/**
 * Pinta la card "Reservas hoy": total de mesas/aforo del local, y una fila
 * por franja (Mediodía/Noche, corte a las 16:00) con nº de reservas, barra
 * de ocupación y badge de pendientes de confirmar — ver _resRow(), que hace
 * el pintado real de cada fila. Las canceladas se excluyen de todo el cómputo.
 *
 * @param {string} todayStr - Fecha de hoy, 'YYYY-MM-DD'.
 */
async function _loadReservasHoy(todayStr){
  var card=document.getElementById('reservas-card'); if(!card) return;
  var results = await Promise.all([
    _sb.from('zonas').select('mesas, pax').eq('local_id',LOCAL_ID).eq('activa',true),
    _sb.from('reservas').select('hora, mesas, estado').eq('local_id',LOCAL_ID).eq('fecha',todayStr),
  ]);
  var zonasRes=results[0], resRes=results[1];
  if(zonasRes.error || resRes.error){
    console.error('[inicio] reservas hoy:', (zonasRes.error||resRes.error).message);
    card.innerHTML='<div class="card-empty">Error al cargar</div>';
    return;
  }
  var zonas=zonasRes.data||[];
  var totalMesas=zonas.reduce(function(s,z){return s+(z.mesas||0);},0);
  var totalPax=zonas.reduce(function(s,z){return s+(z.pax||0);},0);
  var reservas=(resRes.data||[]).filter(function(r){ return r.estado!=='cancelada'; });
  var med=reservas.filter(function(r){ return (r.hora||'')<'16:00'; });
  var noc=reservas.filter(function(r){ return (r.hora||'')>='16:00'; });
  var medMesas=med.reduce(function(s,r){return s+(r.mesas||1);},0);
  var nocMesas=noc.reduce(function(s,r){return s+(r.mesas||1);},0);
  var medPend=med.filter(function(r){return r.estado==='pendiente';}).length;
  var nocPend=noc.filter(function(r){return r.estado==='pendiente';}).length;
  card.innerHTML =
    '<div class="res-meta">'+totalMesas+' mesas · aforo '+totalPax+' pax</div>'+
    _resRow('Mediodía', med.length, medMesas, totalMesas, medPend)+
    _resRow('Noche', noc.length, nocMesas, totalMesas, nocPend);
}
/**
 * HTML de una fila de _loadReservasHoy() (Mediodía o Noche). Sin reservas
 * (`count===0`) pinta un estado vacío en verde "Día libre" en vez de la
 * barra — evitar una barra al 0% que se leería como "todo ocupado" por
 * error. Con reservas, calcula % de ocupación (para el color de la barra:
 * normal / 'warn' >80% / 'full' 100%) y añade el badge naranja ⏳ solo si
 * `pending` > 0 (reservas con estado='pendiente' sin confirmar).
 *
 * @param {string} label - 'Mediodía' | 'Noche'.
 * @param {number} count - Nº de reservas (no canceladas) de esa franja.
 * @param {number} mesasOcupadas - Suma de mesas reservadas en esa franja.
 * @param {number} totalMesas - Mesas totales del local (todas las zonas activas).
 * @param {number} pending - Cuántas de esas reservas están sin confirmar.
 * @returns {string} HTML de la fila.
 */
function _resRow(label, count, mesasOcupadas, totalMesas, pending){
  if(count===0){
    return '<div class="reservas-row">'+
      '<span class="res-label">'+label+'</span>'+
      '<div class="res-empty">'+
        '<i class="ti ti-circle-check" aria-hidden="true"></i>'+
        '<span>Día libre · '+totalMesas+' mesa'+(totalMesas===1?'':'s')+' disponible'+(totalMesas===1?'':'s')+'</span>'+
      '</div>'+
    '</div>';
  }
  var libres=Math.max(0, totalMesas-mesasOcupadas);
  var pct = totalMesas ? Math.min(100, (mesasOcupadas/totalMesas)*100) : 0;
  var cls = pct>=100 ? 'full' : (pct>80 ? 'warn' : '');
  var pendBadge = pending>0 ? '<span class="res-pend" title="'+pending+' pendiente'+(pending===1?'':'s')+' de confirmar">⏳'+pending+'</span>' : '';
  return '<div class="reservas-row">'+
    '<span class="res-label">'+label+'</span>'+
    '<span class="res-num">'+count+'</span>'+
    pendBadge+
    '<div class="res-bar"><div class="res-bar-fill'+(cls?' '+cls:'')+'" style="width:'+pct+'%"></div></div>'+
    '<span class="res-libre">'+libres+' mesa'+(libres===1?'':'s')+' libre'+(libres===1?'':'s')+'</span>'+
  '</div>';
}

/* ── Próximo evento ────────────────────────────────────────────────────── */
/**
 * Pinta la card "Próximo evento": el primer evento con fecha >= hoy (nunca
 * pasados), con su nº de asistentes confirmados (dudosos excluidos) frente
 * al aforo de las zonas que tenga asociadas, y un badge "Hoy"/"Mañana"/fecha
 * corta (_dateBadge). Sin eventos futuros, oculta toda la sección
 * (#evento-sec) en vez de mostrar una card vacía.
 *
 * @param {string} todayStr - Fecha de hoy, 'YYYY-MM-DD'.
 */
async function _loadProximoEvento(todayStr){
  var sec=document.getElementById('evento-sec'), card=document.getElementById('evento-card');
  if(!sec||!card) return;
  var res = await _sb.from('eventos').select('id, descripcion, fecha, hora')
    .eq('local_id',LOCAL_ID).gte('fecha',todayStr).order('fecha').order('hora').limit(1);
  if(res.error){ console.error('[inicio] próximo evento:', res.error.message); sec.style.display='none'; return; }
  if(!res.data || !res.data.length){ sec.style.display='none'; return; }
  var ev=res.data[0];
  var results = await Promise.all([
    _sb.from('evento_asistentes').select('acompanantes, dudoso').eq('evento_id', ev.id),
    _sb.from('evento_zonas').select('zona_id').eq('evento_id', ev.id),
  ]);
  var asiRes=results[0], zonasRes=results[1];
  if(asiRes.error) console.error('[inicio] próximo evento (asistentes):', asiRes.error.message);
  if(zonasRes.error) console.error('[inicio] próximo evento (zonas):', zonasRes.error.message);
  var totalPax=(asiRes.data||[]).filter(function(a){return !a.dudoso;}).reduce(function(s,a){return s+1+(Number(a.acompanantes)||0);},0);
  var aforo=null;
  var zonaIds=(zonasRes.data||[]).map(function(z){return z.zona_id;});
  if(zonaIds.length){
    var zpaxRes = await _sb.from('zonas').select('pax').in('id', zonaIds);
    if(zpaxRes.error) console.error('[inicio] próximo evento (aforo):', zpaxRes.error.message);
    aforo=(zpaxRes.data||[]).reduce(function(s,z){return s+(z.pax||0);},0);
  }
  var badge=_dateBadge(ev.fecha, todayStr);
  var sub = badge==='Hoy'
    ? 'Hoy'+(ev.hora?' · '+ev.hora.slice(0,5):'')
    : _formatFechaCorta(ev.fecha)+(ev.hora?' · '+ev.hora.slice(0,5):'');
  card.innerHTML =
    '<div class="evento-row" onclick="navToEvento(\''+ev.id+'\')">'+
      '<div class="ev-icon"><i class="ti ti-star" aria-hidden="true"></i></div>'+
      '<div class="ev-meta">'+
        '<div class="ev-title">'+_escHtml(ev.descripcion||'Evento')+'</div>'+
        '<div class="ev-sub">'+_escHtml(sub)+'</div>'+
      '</div>'+
      '<div class="ev-right">'+
        '<span class="ev-today">'+badge+'</span>'+
        '<span class="ev-plazas">'+totalPax+(aforo!=null?'/'+aforo:'')+' <span>pax</span></span>'+
      '</div>'+
    '</div>';
  sec.style.display='';
}
function _dateBadge(fecha, todayStr){
  if(fecha===todayStr) return 'Hoy';
  var t=new Date(todayStr+'T00:00:00Z'); t.setUTCDate(t.getUTCDate()+1);
  if(fecha===t.toISOString().split('T')[0]) return 'Mañana';
  return _formatFechaCorta(fecha);
}

/* ── Alertas ───────────────────────────────────────────────────────────── */
function _renderAlertCard(el, n, label, variant, emptyLabel){
  if(n>0){
    el.className='alert-card'+(variant==='warn'?' warn':'');
    el.innerHTML='<div class="alert-n'+(variant==='warn'?' warn':'')+'">'+n+'</div><div class="alert-bottom"><div class="alert-txt">'+_escHtml(label)+'</div><i class="ti ti-chevron-right alert-arr" aria-hidden="true"></i></div>';
  }else{
    el.className='alert-card ok';
    el.innerHTML='<div class="alert-n ok">✓</div><div class="alert-bottom"><div class="alert-txt">'+_escHtml(emptyLabel)+'</div><i class="ti ti-chevron-right alert-arr" aria-hidden="true"></i></div>';
  }
}
/**
 * Cuenta productos bajo mínimos y pinta la card "Stock" con _renderAlertCard()
 * — rojo con el nº si hay alguno, verde "Stock en orden" si no. Usa
 * getStockStatus() (assets/lib/stock-status.js) para decidir qué cuenta como
 * "bajo mínimos" (red o amb), el mismo criterio que Stock/Pedido — nunca un
 * cálculo propio que pudiera divergir del resto de la app.
 */
async function _loadAlertaStock(){
  var el=document.getElementById('alert-stock'); if(!el) return;
  var res = await _sb.from('stock_productos').select('cantidad, minimo').eq('local_id',LOCAL_ID).eq('activo',true);
  if(res.error){ console.error('[inicio] alerta stock:', res.error.message); return; }
  /* getStockStatus() viene de assets/lib/stock-status.js (mismo criterio que
     Stock/Pedido) — cuenta red+amb, no un cálculo propio que podía divergir. */
  var n=(res.data||[]).filter(function(p){ return getStockStatus(p.cantidad, p.minimo)!=='grn'; }).length;
  _renderAlertCard(el, n, 'producto'+(n===1?'':'s')+' bajo mínimos', 'danger', 'Stock en orden');
}
async function _countConflictosTurnos(monday){
  try{
    var turnosRes = await _sb.from('turnos').select('trabajador_id, dia, slot').eq('local_id',LOCAL_ID).eq('semana_inicio',monday).eq('activa',true);
    if(turnosRes.error) throw turnosRes.error;
    var turnos=turnosRes.data||[];
    if(!turnos.length) return 0;
    var ids=_uniq(turnos.map(function(t){return t.trabajador_id;}));
    var results = await Promise.all([
      _sb.from('trabajadores').select('id, max_turnos').eq('local_id',LOCAL_ID).eq('archivado',false),
      _sb.from('disponibilidad').select('trabajador_id, dia_semana, turno').in('trabajador_id', ids),
    ]);
    var trabRes=results[0], dispoRes=results[1];
    if(trabRes.error) throw trabRes.error;
    if(dispoRes.error) throw dispoRes.error;
    var maxById={};
    (trabRes.data||[]).forEach(function(t){ maxById[t.id]=t.max_turnos; });
    var dispoSet={};
    (dispoRes.data||[]).forEach(function(d){ dispoSet[d.trabajador_id+'-'+d.dia_semana+'-'+d.turno]=true; });
    var countById={}, conflictIds={};
    turnos.forEach(function(t){
      countById[t.trabajador_id]=(countById[t.trabajador_id]||0)+1;
      var tipo=(t.slot==='sm'||t.slot==='cm')?'med':'noch';
      if(dispoSet[t.trabajador_id+'-'+t.dia+'-'+tipo]) conflictIds[t.trabajador_id]=true;
    });
    Object.keys(countById).forEach(function(id){
      var max=maxById[id];
      if(max && countById[id]>max) conflictIds[id]=true;
    });
    return Object.keys(conflictIds).length;
  }catch(e){ console.error('[inicio] conflictos turnos:', e); return 0; }
}
async function _loadAlertaConflictos(monday){
  var el=document.getElementById('alert-turnos'); if(!el) return;
  var n=await _countConflictosTurnos(monday);
  _renderAlertCard(el, n, 'conflicto'+(n===1?'':'s')+' en turnos', 'warn', 'Turnos sin conflictos');
}
/**
 * Cuenta reservas de hoy con estado='pendiente' y muestra (u oculta) la
 * card "Reservas por confirmar". A diferencia de _loadAlertaStock()/
 * _loadAlertaConflictos(), esta alerta no tiene estado "ok" visible: si
 * n===0 se oculta del todo (display:none) en vez de pintar una card verde
 * fija — no es una de las dos alertas permanentes del dashboard.
 *
 * @param {string} todayStr - Fecha de hoy, 'YYYY-MM-DD'.
 */
async function _loadAlertaReservas(todayStr){
  var el=document.getElementById('alert-reservas'); if(!el) return;
  var res = await _sb.from('reservas').select('id').eq('local_id',LOCAL_ID).eq('fecha',todayStr).eq('estado','pendiente');
  if(res.error){ console.error('[inicio] alerta reservas:', res.error.message); return; }
  var n=(res.data||[]).length;
  if(n>0){
    el.style.display='';
    el.className='alert-card warn';
    el.innerHTML='<div class="alert-n warn">'+n+'</div><div class="alert-bottom"><div class="alert-txt">reserva'+(n===1?'':'s')+' por confirmar</div><i class="ti ti-chevron-right alert-arr" aria-hidden="true"></i></div>';
  }else{
    el.style.display='none';
  }
}

/* ── Contactos / Proveedores — solo lectura, siempre fresco desde Supabase (sin caché) ──
   Sin cambios de comportamiento respecto a la versión anterior — solo se les quitó el
   subtítulo de preview en la card de Inicio, que ya no existe en el rediseño. ── */
var _CT_CALL_SVG='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#55bb55" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 011.18 1.18C1.5.61.96.01 1.72.01H4.72a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L5.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.03z"/></svg>';
var _CT_WA_SVG='<svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

function _renderContactList(containerId, items){
  var body=document.getElementById(containerId);
  if(!body) return;
  if(!items || !items.length){ body.innerHTML='<div class="ct-empty">Sin datos guardados</div>'; return; }
  body.innerHTML = items.map(function(c){
    var hasTel = c.tel && typeof cleanTel==='function' && cleanTel(c.tel);
    var btns = hasTel ? (
      '<div class="contact-btns">'+
        '<button type="button" class="contact-btn ct-call" data-tel="'+_escHtml(c.tel)+'" style="border-color:rgba(85,187,85,.4)">'+_CT_CALL_SVG+'</button>'+
        '<button type="button" class="contact-btn ct-wa" data-tel="'+_escHtml(c.tel)+'" style="border-color:rgba(37,211,102,.4)">'+_CT_WA_SVG+'</button>'+
      '</div>'
    ) : '';
    return '<div class="ct-item"><div class="ct-item-info"><div class="ct-item-name">'+_escHtml(c.nombre)+'</div>'+
      (c.nota?'<div class="ct-item-nota">'+_escHtml(c.nota)+'</div>':'')+'</div>'+btns+'</div>';
  }).join('');
  body.querySelectorAll('.ct-call').forEach(function(b){ b.onclick=function(){ var v=cleanTel(b.dataset.tel); if(v) window.location.href='tel:'+v; }; });
  body.querySelectorAll('.ct-wa').forEach(function(b){ b.onclick=function(){ var v=cleanTel(b.dataset.tel); if(v) window.open('https://wa.me/34'+v,'_blank'); }; });
}

async function openContactosPanel(){
  var body=document.getElementById('contactos-list-body');
  if(body) body.innerHTML='<div class="ct-empty">Cargando…</div>';
  if(typeof showModal==='function') showModal('ov-contactos');
  if(!_sb){ if(body) body.innerHTML='<div class="ct-empty">Sin conexión</div>'; return; }
  try{
    var r=await _sb.from('contactos').select('nombre,tel,nota').eq('local_id',LOCAL_ID).eq('activo',true).order('nombre');
    if(r.error){ console.error('[SB] openContactosPanel:',r.error.message); if(body) body.innerHTML='<div class="ct-empty">Error al cargar</div>'; return; }
    _renderContactList('contactos-list-body', r.data||[]);
  }catch(e){ console.error('[SB] openContactosPanel:',e); if(body) body.innerHTML='<div class="ct-empty">Error al cargar</div>'; }
}

async function openProveedoresPanel(){
  var body=document.getElementById('proveedores-list-body');
  if(body) body.innerHTML='<div class="ct-empty">Cargando…</div>';
  if(typeof showModal==='function') showModal('ov-proveedores');
  if(!_sb){ if(body) body.innerHTML='<div class="ct-empty">Sin conexión</div>'; return; }
  try{
    var r=await _sb.from('stock_proveedores').select('nombre,tel,nota').eq('local_id',LOCAL_ID).eq('activo',true).order('nombre');
    if(r.error){ console.error('[SB] openProveedoresPanel:',r.error.message); if(body) body.innerHTML='<div class="ct-empty">Error al cargar</div>'; return; }
    _renderContactList('proveedores-list-body', r.data||[]);
  }catch(e){ console.error('[SB] openProveedoresPanel:',e); if(body) body.innerHTML='<div class="ct-empty">Error al cargar</div>'; }
}
