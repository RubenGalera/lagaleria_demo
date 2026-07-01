/* lagaleria_turnos.html — lógica de la página.
   Depende de globals cargados antes: _sb/LOCAL_ID (supabase-client.js), DatePicker (date-picker.js).
   Expone funciones/variables en scope global para que worker-modal.js y date-picker.js puedan usarlas (sin IIFE/module). */


/* Diccionario nombre ↔ UUID — se puebla en sbInitTrabajadores() */
let _nombreToId = {};
let _idToNombre = {};
let _sbTrabajadores = [];
let _skillLocalToUUID = {};  /* slug 'barra' → UUID del catálogo skills */
let _skillUUIDToLocal = {};  /* UUID → slug 'barra' */

async function sbLoadTurnos(semanaInicio) {
  if (!_sb) { console.warn('sbLoadTurnos: Supabase no disponible'); return []; }
  const {data, error} = await _sb.from('turnos')
    .select('*')
    .eq('local_id', LOCAL_ID)
    .eq('semana_inicio', semanaInicio);
  if (error) { console.warn('sbLoadTurnos:', error.message); return []; }
  return data || [];
}

async function sbLoadEventos(desde, hasta) {
  if (!_sb) { console.warn('sbLoadEventos: Supabase no disponible'); return []; }
  const {data, error} = await _sb.from('eventos')
    .select('*')
    .eq('local_id', LOCAL_ID)
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha');
  if (error) { console.warn('sbLoadEventos:', error.message); return []; }
  return data || [];
}

async function sbSaveTurno(turno) {
  if (!_sb) { console.warn('sbSaveTurno: Supabase no disponible'); return false; }
  const payload = {
    local_id:      LOCAL_ID,
    semana_inicio: turno.semana_inicio,
    slot:          turno.slot,
    dia:           turno.dia,
    trabajador_id: turno.trabajador_id,
    hora_especial: turno.hora_especial || null,
  };
  const {error} = await _sb.from('turnos').upsert(payload, {
    onConflict: 'local_id,semana_inicio,slot,dia,trabajador_id'
  });
  if (error) { console.warn('sbSaveTurno:', error.message); return false; }
  return true;
}

async function sbInitTrabajadores() {
  if (!_sb) { console.warn('[SB] sbInitTrabajadores: _sb no disponible'); return; }

  /* 1 — Trabajadores base */
  const {data, error} = await _sb.from('trabajadores')
    .select('id, nombre, seccion, prioridad, min_turnos, max_turnos, tel, foto_url, activo, disponible, visible')
    .eq('local_id', LOCAL_ID)
    .order('nombre');
  if (error) { console.warn('[SB] sbInitTrabajadores:', error.message); return; }
  _sbTrabajadores = data || [];
  _nombreToId = {};
  _idToNombre = {};
  const duplicates = {};
  _sbTrabajadores.forEach(t => {
    if (_nombreToId[t.nombre] !== undefined) {
      duplicates[t.nombre] = true;
      console.warn('[SB] nombre duplicado en trabajadores:', t.nombre);
    }
    _nombreToId[t.nombre] = t.id;
    _idToNombre[t.id] = t.nombre;
  });
  const nDups = Object.keys(duplicates).length;
  console.log(`[SB] ✅ trabajadores cargados: ${_sbTrabajadores.length}` + (nDups ? ` (⚠ ${nDups} nombre/s duplicado/s)` : ''));

  if (!_sbTrabajadores.length) return;

  /* 2 — Carga paralela: catálogo skills + tablas relacionadas */
  const trabIds = _sbTrabajadores.map(t => t.id);
  const [
    {data: catalogData,  error: catalogErr},
    {data: skillsData,   error: skillsErr},
    {data: dispoData,    error: dispoErr},
    {data: vacData,      error: vacErr},
  ] = await Promise.all([
    _sb.from('skills').select('id, nombre'),
    _sb.from('trabajador_skill').select('trabajador_id, skill_id, nivel').in('trabajador_id', trabIds),
    _sb.from('disponibilidad').select('trabajador_id, dia_semana, turno').in('trabajador_id', trabIds),
    _sb.from('vacaciones').select('id, trabajador_id, desde, hasta, tipo').in('trabajador_id', trabIds),
  ]);
  if (catalogErr) console.warn('[SB] skills catalog:', catalogErr.message);
  if (skillsErr)  console.warn('[SB] trabajador_skill:', skillsErr.message);
  if (dispoErr)   console.warn('[SB] disponibilidad:', dispoErr.message);
  if (vacErr)     console.warn('[SB] vacaciones:', vacErr.message);

  /* 3 — Mapa catálogo UUID ↔ slug local */
  _skillLocalToUUID = {};
  _skillUUIDToLocal = {};
  const ALL_ROLES_FLAT = [...ROLES_COCINA, ...ROLES_SALA];
  (catalogData || []).forEach(s => {
    const sn = s.nombre.toLowerCase();
    const role = ALL_ROLES_FLAT.find(r => { const rl=r.label.toLowerCase(); return rl===sn||rl.includes(sn)||sn.includes(rl); });
    if (role) {
      _skillLocalToUUID[role.id] = s.id;
      _skillUUIDToLocal[s.id]    = role.id;
    } else {
      console.warn('[SB] skill sin match en ROLES:', s.nombre);
    }
  });
  console.log(`[SB] ✅ skill catalog: ${Object.keys(_skillLocalToUUID).length}/${ALL_ROLES_FLAT.length} roles mapeados`);

  /* 4 — Agrupar por trabajador_id */
  const skillsByW = {}, dispoByW = {}, vacByW = {};
  (skillsData || []).forEach(r => {
    const localId = _skillUUIDToLocal[r.skill_id];
    if (!localId) return;
    if (!skillsByW[r.trabajador_id]) skillsByW[r.trabajador_id] = {};
    skillsByW[r.trabajador_id][localId] = r.nivel;
  });
  (dispoData || []).forEach(r => {
    if (!dispoByW[r.trabajador_id]) dispoByW[r.trabajador_id] = {med: [], noc: []};
    if (r.turno === 'med')      dispoByW[r.trabajador_id].med.push(r.dia_semana);
    else if (r.turno === 'noc') dispoByW[r.trabajador_id].noc.push(r.dia_semana);
  });
  (vacData || []).forEach(r => {
    if (!vacByW[r.trabajador_id]) vacByW[r.trabajador_id] = [];
    vacByW[r.trabajador_id].push({desde: r.desde, hasta: r.hasta, tipo: r.tipo || 'vacaciones', _sbId: r.id});
  });

  /* 5 — Poblar locals.galeria.staff */
  locals.galeria.staff = _sbTrabajadores.map(t => ({
    name:        t.nombre,
    sec:         t.seccion,
    photo:       t.foto_url || null,
    tel:         t.tel || '',
    minT:        t.min_turnos != null ? t.min_turnos : 0,
    maxT:        t.max_turnos != null ? t.max_turnos : 0,
    prioridad:   t.prioridad || 'eventual',
    activo:      t.activo !== false,
    disponible:  t.disponible !== false,
    visible:     t.visible !== false,
    skills:      skillsByW[t.id] || {},
    unavailMed:  dispoByW[t.id]?.med  || [],
    unavailNoch: dispoByW[t.id]?.noc  || [],
    vacaciones:  vacByW[t.id]         || [],
    _sbId:       t.id,
  }));
  buildGrid(); renderW(); updateStats();
  console.log('[SB] ✅ locals.galeria.staff actualizado con', _sbTrabajadores.length, 'trabajadores reales');
}

function sbNombreToId(nombre) {
  const id = _nombreToId[nombre];
  if (!id) console.warn('[SB] sbNombreToId: sin match para nombre:', JSON.stringify(nombre));
  return id || null;
}
function sbIdToNombre(id) {
  const nombre = _idToNombre[id];
  if (!nombre) console.warn('[SB] sbIdToNombre: sin match para id:', id);
  return nombre || null;
}

async function sbUploadFotoTrabajador(id, file) {
  const MAX = 2 * 1024 * 1024;
  if (!id || !file) return { error: 'Sin id o archivo' };
  if (file.size > MAX) return { error: 'La imagen supera el límite de 2 MB' };
  if (!_sb) return { error: 'Supabase no disponible' };
  const ext = (file.name ? file.name.split('.').pop() : 'jpg').toLowerCase();
  const path = `${id}.${ext}`;
  const { error: upErr } = await _sb.storage.from('avatares').upload(path, file, { upsert: true });
  if (upErr) { console.error('[SB] sbUploadFotoTrabajador:', upErr.message); return { error: upErr.message }; }
  const { data } = _sb.storage.from('avatares').getPublicUrl(path);
  const url = data?.publicUrl ? data.publicUrl + '?t=' + Date.now() : null;
  if (url) await sbUpdateTrabajador(id, { foto_url: url });
  return { url };
}

async function sbArchivarTrabajador(id) {
  if (!_sb || !id) return;
  const { error } = await _sb.from('trabajadores').update({ activo: false }).eq('id', id);
  if (error) console.error('[SB] sbArchivarTrabajador:', error.message);
  else console.log('[SB] ✅ trabajador archivado:', id);
}

async function sbRestaurarTrabajador(id) {
  if (!_sb || !id) return;
  const { error } = await _sb.from('trabajadores').update({ activo: true }).eq('id', id);
  if (error) console.error('[SB] sbRestaurarTrabajador:', error.message);
  else console.log('[SB] ✅ trabajador restaurado:', id);
}

async function sbBorrarTrabajadorDefinitivo(id) {
  if (!_sb || !id) return;
  const { error: e1 } = await _sb.from('turnos').delete().eq('trabajador_id', id);
  if (e1) { console.error('[SB] sbBorrarDefinitivo (turnos):', e1.message); return; }
  const { error: e2 } = await _sb.from('trabajadores').delete().eq('id', id);
  if (e2) console.error('[SB] sbBorrarDefinitivo (trabajadores):', e2.message);
  else console.log('[SB] ✅ trabajador borrado definitivamente:', id);
}

/* ── CARGA DE SEMANA DESDE SUPABASE ── */
async function loadWeekFromSupabase(semanaInicio) {
  const finDt = new Date(semanaInicio + 'T00:00:00Z');
  finDt.setUTCDate(finDt.getUTCDate() + 6);
  const semanaFin = finDt.toISOString().split('T')[0];

  const [filas, filasEv] = await Promise.all([
    sbLoadTurnos(semanaInicio),
    sbLoadEventos(semanaInicio, semanaFin),
  ]);

  const data = {
    sm: [[],[],[],[],[],[],[]],
    sn: [[],[],[],[],[],[],[]],
    cm: [[],[],[],[],[],[],[]],
    cn: [[],[],[],[],[],[],[]],
  };
  filas.forEach(f => {
    const nombre = sbIdToNombre(f.trabajador_id);
    if (!nombre) return;
    const str = f.hora_especial ? `${nombre}:${f.hora_especial}` : nombre;
    if (data[f.slot] && f.dia >= 0 && f.dia <= 6) data[f.slot][f.dia].push(str);
  });
  locals.galeria.data = data;

  const inicioDt = new Date(semanaInicio + 'T00:00:00Z');
  locals.galeria.eventos = filasEv
    .map(f => ({
      tipo: f.tipo || 'evento',
      desc: f.descripcion || '',
      dia: Math.round((new Date(f.fecha + 'T00:00:00Z') - inicioDt) / 86400000),
      hora: f.hora || '—',
      precio: f.precio || '',
      img: f.img_url || null,
    }))
    .filter(e => e.dia >= 0 && e.dia <= 6)
    .sort((a, b) => a.dia - b.dia);

  buildGrid(); renderW(); updateStats();
  if (window.DatePicker) DatePicker.setEvents(eventosToPickerDates());
}

/* Convierte locals.galeria.eventos (dia relativo a curMonday) en [{date:'YYYY-MM-DD'}] para el DatePicker */
function eventosToPickerDates() {
  return (locals.galeria.eventos || []).map(ev => {
    const d = new Date(curMonday + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + ev.dia);
    return { date: d.toISOString().split('T')[0] };
  });
}

/* ── /SUPABASE Fase 1 ── */

/* ── AUTOSAVE (Fase A2) ── */
let _saveTimer = null;

async function saveWeekSnapshot() {
  if (!_sb) { console.warn('[autosave] Supabase no disponible'); return; }
  const semana = curMonday;
  const { error: delErr } = await _sb.from('turnos')
    .delete()
    .eq('local_id', LOCAL_ID)
    .eq('semana_inicio', semana);
  if (delErr) { console.error('[autosave] Error borrando:', delErr.message); return; }
  const rows = [];
  ROWS.forEach(slot => {
    for (let dia = 0; dia < 7; dia++) {
      (L().data[slot][dia] || []).forEach(raw => {
        const { name, hour } = parse(raw);
        const trabajador_id = sbNombreToId(name);
        if (!trabajador_id) return;
        rows.push({ local_id: LOCAL_ID, semana_inicio: semana, slot, dia, trabajador_id, hora_especial: hour || null });
      });
    }
  });
  if (rows.length) {
    const { error: insErr } = await _sb.from('turnos').insert(rows);
    if (insErr) { console.error('[autosave] Error insertando:', insErr.message); return; }
  }
  console.log('[autosave] ✅', rows.length, 'filas guardadas, semana', semana);
}

function scheduleAutosave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async () => { _saveTimer = null; await saveWeekSnapshot(); }, 2000);
}

async function flushSave() {
  if (_saveTimer === null) return;
  clearTimeout(_saveTimer);
  _saveTimer = null;
  await saveWeekSnapshot();
}
/* ── /AUTOSAVE ── */

/* ── CONSTANTES Y DATOS LOCALES ── */
const DAYS_S=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const DAYS_L=["Lunes 18","Martes 19","Miércoles 20","Jueves 21","Viernes 22","Sábado 23","Domingo 24"];
const ROWS=["sm","sn","cm","cn"];
const CONFLICTS={sm:"cm",cm:"sm",sn:"cn",cn:"sn"};
const ROW_LBL={sm:"Sala Med",sn:"Sala Noche",cm:"Cocina Med",cn:"Cocina Noche"};
const EV_ICONS={birthday:"🎂",cata:"🍷",menu:"🍽️",evento:"📅"};
const EV_NAMES={birthday:"Cumpleaños",cata:"Cata",menu:"Menú especial",evento:"Evento"};
const EV_COLS={birthday:"#e880c0",cata:"#b880e0",menu:"#60c888",evento:"#60aaee"};

// Safety helper to avoid injecting template placeholders or malformed src
function isSafeImg(u){return typeof u==='string'&&u.trim()!==''&&!u.includes('${');}
const locals={
  galeria:{
    staff:[
      {name:"Lorenzo",sec:"ambos",photo:null,tel:"666 123 456",minT:4,maxT:8,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"fijo",skills:{barra:"domina",camarero_salon:"domina",pase:"puede"}},
      {name:"Manu",sec:"sala",photo:null,tel:"677 234 567",minT:3,maxT:6,unavailMed:[0],unavailNoch:[],prioridad:"fijo",skills:{barra:"puede",camarero_salon:"domina",camarero_terraza:"puede"}},
      {name:"Luis",sec:"sala",photo:null,tel:"688 345 678",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"fijo",skills:{barra:"domina",camarero_salon:"puede",camarero_terraza:"domina"}},
      {name:"Mayte",sec:"sala",photo:null,tel:"699 456 789",minT:2,maxT:5,unavailMed:[],unavailNoch:[6],prioridad:"fijo",skills:{camarero_salon:"domina",camarero_sala:"domina"}},
      {name:"Bryan",sec:"sala",photo:null,tel:"",minT:0,maxT:0,unavailMed:[1,2],unavailNoch:[1,2],prioridad:"eventual",skills:{barra:"puede",camarero_salon:"puede"}},
      {name:"Antonio",sec:"ambos",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"eventual",skills:{camarero_salon:"domina",camarero_terraza:"puede",plancha:"puede",pase:"puede"}},
      {name:"Alejandro",sec:"sala",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"eventual",skills:{barra:"puede",camarero_salon:"domina",camarero_terraza:"puede"}},
      {name:"Sara",sec:"sala",photo:null,tel:"",minT:0,maxT:0,unavailMed:[0,1,2,3,4],unavailNoch:[0,1,2,3,4],prioridad:"eventual",skills:{camarero_sala:"domina",camarero_salon:"puede"}},
      {name:"Noa",sec:"sala",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"eventual",skills:{barra:"puede",camarero_terraza:"domina"}},
      {name:"Josep",sec:"sala",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"eventual",skills:{camarero_salon:"puede",camarero_terraza:"puede",barra:"puede"}},
      {name:"Israel",sec:"ambos",photo:null,tel:"611 987 654",minT:5,maxT:10,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"fijo",skills:{plancha:"domina",pase:"domina"}},
      {name:"Noemi",sec:"ambos",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[5],prioridad:"eventual",skills:{pase:"domina",raciones:"puede",camarero_sala:"puede"}},
      {name:"JL",sec:"cocina",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"fijo",skills:{plancha:"domina",pase:"puede",raciones:"puede"}},
      {name:"Ruben",sec:"cocina",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"eventual",skills:{plancha:"puede",pase:"domina"}},
      {name:"JI",sec:"cocina",photo:null,tel:"",minT:0,maxT:0,unavailMed:[0,1,2,3,4,5,6],unavailNoch:[0,1,2,3,4,5,6],prioridad:"eventual",skills:{plancha:"puede",raciones:"puede"}},
      {name:"Noa C",sec:"cocina",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"eventual",skills:{pase:"puede",raciones:"domina"}},
      {name:"Josep C",sec:"cocina",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"eventual",skills:{plancha:"domina",raciones:"puede"}},
      {name:"Refuerzo X",sec:"ambos",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"eventual",skills:{barra:"puede",camarero_salon:"puede",plancha:"puede",pase:"puede"}},
    ],
    data:{
      sm:[["Lorenzo","Luis","Alejandro","Manu","Bryan"],["Luis","Alejandro:8:00","Mayte","Manu","Bryan"],["Lorenzo","Manu","Antonio","Mayte","Bryan"],["Antonio","Mayte","Lorenzo","Luis","Bryan"],["Alejandro","Mayte","Lorenzo","Antonio:14:00","Josep"],["Manu","Luis:14:00","Lorenzo","Noa","Antonio"],["Mayte","Luis","Alejandro","Noa","Manu"]],
      sn:[["Lorenzo","Manu","Bryan","Luis","Sara"],["Bryan","Alejandro","Mayte","Luis","Sara"],["Bryan","Lorenzo","Mayte","Alejandro","Manu"],["Antonio","Luis","Lorenzo","Mayte","Bryan"],["Mayte","Antonio","Manu","Noa","Sara"],["Luis","Manu","Lorenzo","Antonio","Bryan"],["Lorenzo","Mayte","Antonio","Bryan","Manu"]],
      cm:[["Israel","Noemi","JL","Josep C"],["JL","Ruben","Noemi","Israel"],["Ruben","Noemi","Josep C","Israel"],["Israel","Ruben:8:30","Josep C","Noa C"],["JI","Noemi","Ruben","Israel"],["Josep C","JL","Ruben","Israel"],["Israel","Josep C","Ruben","JL"]],
      cn:[["Israel","Noemi","JL","Noa C"],["JL","Noemi","Ruben","Noa C"],["Ruben","Noa C","Josep C"],["Noa C","Josep C","Israel","JI"],["Ruben","JL","Josep C","Israel"],["Josep C","JL","Ruben","Israel"],["Noemi","JL","Josep C","Israel"]],
    },
    eventos:[] /* se rellena en loadWeekFromSupabase() con datos reales de la tabla eventos */
  },
  sala:{
    staff:[
      {name:"Isabel",sec:"sala",photo:null,tel:"666 111 222",minT:3,maxT:6,unavailMed:[],unavailNoch:[],vacaciones:[]},
      {name:"Carmen",sec:"sala",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[]},
      {name:"Paco",sec:"sala",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[]},
      {name:"Ana",sec:"sala",photo:null,tel:"",minT:0,maxT:0,unavailMed:[0],unavailNoch:[]},
      {name:"Miguel",sec:"cocina",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[]},
      {name:"Rosa",sec:"cocina",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[]},
      {name:"Refuerzo X",sec:"ambos",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],prioridad:"eventual",skills:{barra:"puede",camarero_salon:"puede",plancha:"puede",pase:"puede"}},
    ],
    data:{
      sm:[["Isabel","Carmen"],["Carmen","Paco"],["Isabel","Ana"],["Paco","Carmen"],["Isabel","Carmen","Ana"],["Carmen","Paco","Isabel"],["Isabel","Ana"]],
      sn:[["Paco","Isabel"],["Isabel","Ana"],["Carmen","Paco"],["Isabel","Carmen"],["Ana","Paco"],["Isabel","Carmen"],["Paco","Carmen"]],
      cm:[["Miguel","Rosa"],["Rosa","Miguel"],["Miguel"],["Rosa","Miguel"],["Miguel","Rosa"],["Rosa","Miguel"],["Miguel","Rosa"]],
      cn:[["Rosa","Miguel"],["Miguel"],["Rosa","Miguel"],["Miguel","Rosa"],["Rosa"],["Miguel","Rosa"],["Rosa","Miguel"]],
    },
    eventos:[] /* "sala" no tiene fuente Supabase propia todavía; sin eventos mock */
  }
};

/* ── ESTADO Y UTILIDADES ── */
let curLocal="galeria",curSort="td",curSec="all",curSearch="",_evPhotoIdx=null,curPage="turnos";
function L(){return locals[curLocal];}
function ini(n){return n.split(":")[0].trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();}
function parse(raw){const p=raw.split(":");return{name:p[0].trim(),hour:p.length>1?p[1]+":"+p[2]:""};}
function getW(n){return L().staff.find(w=>w.name===n)||null;}
function cntT(name){let c=0;ROWS.forEach(r=>L().data[r].forEach(d=>{if(d.some(n=>parse(n).name===name))c++;}));return c;}

/* ── NAVEGACIÓN DE PÁGINA ── */
function setPage(p){
  curPage=p;
  document.querySelectorAll(".page").forEach(el=>el.classList.remove("active"));
  document.getElementById("page-"+p).classList.add("active");
  document.querySelectorAll(".bnav-item").forEach(el=>el.classList.remove("active"));
  document.getElementById("bnav-"+p).classList.add("active");
}

/* ── SELECTOR DE LOCAL ── */
function setLocal(local){
  curLocal=local;const isG=local==="galeria";
  document.getElementById("navbar").style.background=isG?"#22292D":"#A32B2A";
  document.getElementById("logo-area").innerHTML=isG?
    `<div class="logo-g"><div class="logo-g-neo">— NEOTABERNA —</div><div class="logo-g-main">LA GALERÍA</div><div class="logo-g-deco"><div class="logo-g-line"></div><div class="logo-g-sub">— Y ALGO MÁS —</div><div class="logo-g-line"></div></div></div>`:
    `<div class="logo-s"><div class="logo-s-main">LA SALA</div><div class="logo-s-sub">VUELTA AL ORIGEN · BAR</div></div>`;
  document.getElementById("btn-g").className="lbtn"+(isG?" active-g":"");
  document.getElementById("btn-s").className="lbtn"+(isG?"":" active-s");
  document.documentElement.style.setProperty("--acc",isG?"#C5A669":"#A32B2A");
  document.documentElement.style.setProperty("--acc-bg",isG?"rgba(197,166,105,0.12)":"rgba(163,43,42,0.1)");
  document.documentElement.style.setProperty("--acc-bd",isG?"rgba(197,166,105,0.35)":"rgba(163,43,42,0.3)");
  document.body.classList.toggle("sala-theme",!isG);
  buildGrid();renderW();updateStats();
}

/* ── ESTADÍSTICAS ── */
function updateStats(){
  const sw=document.getElementById("st-w");
  if(sw) sw.textContent=L().staff.length;
  const swm=document.getElementById("st-w-m");
  if(swm) swm.textContent=L().staff.length;
  const sev=document.getElementById("st-ev");
  if(sev) sev.textContent=L().eventos.length;
}

/* ── GRID: BUILD Y RENDER ── */
const BAND_LBL_CLS={sm:'band-label-sm',sn:'band-label-sn',cm:'band-label-cm',cn:'band-label-cn'};
var slotTimes = {sm:'12:30', sn:'20:00', cm:'12:00', cn:'20:00'};
const SLOT_NAMES = {sm:'Sala mediodía', sn:'Sala noche', cm:'Cocina mediodía', cn:'Cocina noche'};
function buildGrid(){
  const er=document.getElementById("ev-row");
  er.innerHTML='';
  if(L().eventos.length){
    for(let d=0;d<7;d++){
      const div=document.createElement("div");div.className="ev-day";
      L().eventos.filter(e=>e.dia===d).forEach(ev=>{
        const b=document.createElement("div");b.className="ev-badge";
        b.innerHTML=`<div class="ev-dot"></div><span>${EV_NAMES[ev.tipo]}</span>`;
        b.onclick=()=>showEvDetail(ev);
        div.appendChild(b);
      });
      er.appendChild(div);
    }
  }
  const dh=document.getElementById("day-headers");
  dh.innerHTML='';
  const todayStr=new Date().toISOString().split('T')[0];
  for(let d=0;d<7;d++){
    const dayDate=new Date(curMonday+'T00:00:00Z');
    dayDate.setUTCDate(dayDate.getUTCDate()+d);
    const isToday=dayDate.toISOString().split('T')[0]===todayStr;
    const el=document.createElement("div");el.className="day-head"+(isToday?" today":"");
    el.innerHTML=`<div class="dname">${DAYS_S[d]}</div><div class="dnum">${dayDate.getUTCDate()}</div>${isToday?"<div class='today-dot'></div>":""}`;
    dh.appendChild(el);
  }
  const SLOT_INFO={sm:['t-time-sm','Sala'],sn:['t-time-sn','Sala'],cm:['t-time-cm','Cocina'],cn:['t-time-cn','Cocina']};
  ROWS.forEach(r=>{
    const hdrEl=document.getElementById(`hdr-${r}`);
    const timeVal=document.getElementById(SLOT_INFO[r][0])?.textContent||slotTimes[r]||'';
    hdrEl.innerHTML='';
    for(let d=0;d<7;d++){
      const hc=document.createElement("div");hc.className="hdr-cell"+(d===0?" hdr-cell-mon":"");
      if(d===0){
        const lbl=document.createElement("div");
        lbl.className=`band-label ${BAND_LBL_CLS[r]}`;
        lbl.onclick=()=>editTime(r);
        lbl.innerHTML=`<span id="${SLOT_INFO[r][0]}">${timeVal}</span><span class="band-label-sect"> · ${SLOT_INFO[r][1]}</span>`;
        hc.appendChild(lbl);
      }
      hdrEl.appendChild(hc);
    }

    const rowEl=document.getElementById(`row-${r}`);
    rowEl.innerHTML='';
    for(let d=0;d<7;d++){
      const cell=document.createElement("div");cell.className=`cell cell-${r}`;
      (L().data[r][d]||[]).forEach(raw=>{
        const {name,hour}=parse(raw);const w=getW(name);
        const isMed=r==="sm"||r==="cm";
        const unavail=w&&(isMed?w.unavailMed:w.unavailNoch)&&(isMed?w.unavailMed:w.unavailNoch).includes(d);
        const onVac=w&&w.vacaciones&&(()=>{
          const dayDate=new Date(curMonday+'T00:00:00Z');
          dayDate.setUTCDate(dayDate.getUTCDate()+d);
          const dayStr=dayDate.toISOString().split('T')[0];
          return w.vacaciones.some(v=>dayStr>=v.desde&&dayStr<=v.hasta);
        })();
        const t=w?cntT(name):0;
        let alertMsg=null;
        if(w){
          if(w.maxT&&t>w.maxT) alertMsg=`Exceso de turnos — lleva ${t}, máximo ${w.maxT}`;
          else if(w.minT&&t<w.minT) alertMsg=`Faltan turnos — lleva ${t}, mínimo ${w.minT}`;
          else if(w.disponible===false) alertMsg='No disponible';
          else if(w.visible===false) alertMsg='No visible';
          else if(unavail) alertMsg='Día no disponible';
          else if(onVac) alertMsg='En vacaciones';
        }
        const chip=document.createElement("div");chip.className=`chip chip-${r}`;chip.draggable=true;
        if(unavail)chip.style.cssText="border-color:rgba(200,60,60,.5);background:rgba(200,60,60,.08)";
        const warnIcon=alertMsg?`<span style="font-size:9px;color:#cc4444;margin-left:auto" title="⚠ ${alertMsg}">⚠</span>`:"";
        chip.innerHTML=`<div class="dh"><span></span><span></span><span></span></div><span class="chip-name">${name}</span>${hour?`<span class="chip-tag">${hour}</span>`:""}${warnIcon}`;
        chip.onclick=()=>openPreview(name);setupDrag(chip,cell);cell.appendChild(chip);
      });
      const add=document.createElement("div");add.className="add-chip";add.textContent="+ añadir";
      add.onclick=()=>openAddModal(r,d);cell.appendChild(add);
      rowEl.appendChild(cell);
    }
  });
}

/* ── DRAG & DROP ── */
function setupDrag(chip,cell){
  chip.addEventListener("dragstart",()=>{chip.style.opacity=".4";window._dc=chip;});
  chip.addEventListener("dragend",()=>chip.style.opacity="");
  chip.addEventListener("dragover",e=>{e.preventDefault();chip.style.outline="1px dashed var(--acc)";});
  chip.addEventListener("dragleave",()=>chip.style.outline="");
  chip.addEventListener("drop",e=>{
    e.preventDefault();chip.style.outline="";const src=window._dc;
    if(src&&src!==chip&&src.parentNode===chip.parentNode){
      const chips=[...chip.parentNode.querySelectorAll(".chip")];
      const si=chips.indexOf(src),ti=chips.indexOf(chip);
      if(si<ti)chip.parentNode.insertBefore(src,chip.nextSibling);else chip.parentNode.insertBefore(src,chip);
    }
  });
}









/* ── HORA ESPECIAL ── */
function renderHoraList(){
  const list=document.getElementById("hora-list");list.innerHTML="";
  _horaRows.forEach((hr,i)=>{
    const row=document.createElement("div");row.className="hora-row";
    const displayVal=hr.h||"--:--";
    row.innerHTML=`<select class="hora-sel" onchange="_horaRows[${i}].d=parseInt(this.value)">${DAYS_S.map((d,di)=>`<option value="${di}" ${hr.d===di?"selected":""}>${d} ${18+di}</option>`).join("")}</select><span style="font-size:11px;color:var(--dim)">⏰</span><button class="hora-display" onclick="openTp('hora',this,${i})">${displayVal}</button><button class="hora-del" onclick="_horaRows.splice(${i},1);renderHoraList()">&#215;</button>`;
    list.appendChild(row);
  });
}
function addHoraRow(){_horaRows.push({d:0,h:""});renderHoraList();}

/* ── TIME PICKER (reutilizable) ── */
let _tpIdx=-1,_tpH=8,_tpM=0,_tpBtn=null,_tpCtx=null,_tpCb=null;
const TP_MINS=[0,15,30,45];

function openTp(ctx,btn,idx,initVal){
  _tpCtx=ctx;_tpBtn=btn;_tpIdx=idx!=null?idx:-1;
  const cur=initVal||(btn?btn.textContent:"");
  const parts=(cur||"").split(":");
  _tpH=parseInt(parts[0]);if(isNaN(_tpH))_tpH=8;
  _tpM=TP_MINS.includes(parseInt(parts[1]))?parseInt(parts[1]):0;
  // Título contextual
  document.getElementById("tp-popup").querySelector(".tp-title").textContent=
    ctx==="ev"?"Hora del evento":"Hora de entrada";
  // Build columns
  const hCol=document.getElementById("tp-horas");
  const mCol=document.getElementById("tp-mins");
  hCol.innerHTML='<div class="tp-col-hdr">h</div>';
  mCol.innerHTML='<div class="tp-col-hdr">min</div>';
  for(let h=0;h<24;h++){
    const el=document.createElement("div");
    el.className="tp-opt"+(h===_tpH?" sel":"");
    el.textContent=String(h).padStart(2,"0");
    el.onclick=()=>{_tpH=h;hCol.querySelectorAll(".tp-opt").forEach(o=>o.classList.remove("sel"));el.classList.add("sel");};
    hCol.appendChild(el);
  }
  TP_MINS.forEach(m=>{
    const el=document.createElement("div");
    el.className="tp-opt"+(m===_tpM?" sel":"");
    el.textContent=String(m).padStart(2,"0");
    el.onclick=()=>{_tpM=m;mCol.querySelectorAll(".tp-opt").forEach(o=>o.classList.remove("sel"));el.classList.add("sel");};
    mCol.appendChild(el);
  });
  // Posición junto al botón
  const popup=document.getElementById("tp-popup");
  popup.style.display="block";
  if(btn){
    const r=btn.getBoundingClientRect();
    const pw=220,ph=320;
    let top=r.bottom+6,left=r.left;
    if(top+ph>window.innerHeight)top=r.top-ph-6;
    if(left+pw>window.innerWidth)left=window.innerWidth-pw-8;
    if(left<8)left=8;
    popup.style.top=top+"px";popup.style.left=left+"px";
  }
  document.getElementById("tp-backdrop").classList.add("show");
  setTimeout(()=>{
    const selH=hCol.querySelector(".sel");if(selH)selH.scrollIntoView({block:"center"});
    const selM=mCol.querySelector(".sel");if(selM)selM.scrollIntoView({block:"center"});
  },20);
}

function closeTp(){
  document.getElementById("tp-popup").style.display="none";
  document.getElementById("tp-backdrop").classList.remove("show");
  _tpIdx=-1;_tpBtn=null;_tpCtx=null;
}

function confirmTp(){
  const val=String(_tpH).padStart(2,"0")+":"+String(_tpM).padStart(2,"0");
  if(_tpBtn)_tpBtn.textContent=val;
  if(_tpCtx==="hora"&&_tpIdx>=0){
    _horaRows[_tpIdx].h=val;
  } else if(_tpCtx==="ev"){
    // el botón ya muestra el valor; addEvento lo leerá de _evHora
    _evHora=val;
  }
  closeTp();
}






document.getElementById("photo-input").addEventListener("change",function(){
  const file=this.files[0];if(!file)return;
  if(file.size>2*1024*1024){showToast('La imagen supera el límite de 2 MB');this.value="";return;}
  const target=_photoTarget;
  const reader=new FileReader();
  reader.onload=e=>{
    const w=L().staff.find(s=>s.name===target);if(!w)return;
    w.photo=e.target.result;buildGrid();renderTrabajadores();
    if(document.getElementById("ov-preview").classList.contains("show"))openPreview(target);
    if(w._sbId){
      compressImage(file).then(function(blob){
        sbUploadFotoTrabajador(w._sbId,blob).then(res=>{
          if(res.url){w.photo=res.url;buildGrid();renderTrabajadores();}
          else if(res.error)showToast('Error al subir la foto');
        });
      }).catch(function(err){ console.error('[img] compressImage error:',err); });
    }
  };
  reader.readAsDataURL(file);this.value="";_photoTarget=null;
});

/* ── CONFIRM DIALOG (genérico) ── */
let _confirmOkCb = null, _confirmCancelCb = null;
function _doConfirmOk()    { if (_confirmOkCb)     _confirmOkCb(); }
function _doConfirmCancel(){ if (_confirmCancelCb) _confirmCancelCb(); else closeOv('ov-confirm'); }
function showConfirmDialog(title, body, okText, okCb, cancelCb) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-body').textContent  = body;
  document.getElementById('confirm-ok-btn').textContent = okText;
  _confirmOkCb     = okCb;
  _confirmCancelCb = cancelCb;
  showOv('ov-confirm');
}

/* ── ARCHIVAR / ELIMINAR TRABAJADOR ── */
function confirmDelete(){
  closeOv('ov-preview');
  showConfirmDialog(
    '¿Eliminar trabajador?',
    `Vas a archivar a ${_previewName}. Desaparecerá de los listados activos pero su historial de turnos quedará intacto.`,
    'Sí, eliminar',
    () => doDeleteWorker(),
    () => { closeOv('ov-confirm'); showOv('ov-preview'); }
  );
}
function doDeleteWorker(){
  const w = getW(_previewName); if (!w) return;
  w.activo = false;
  if (w._sbId) sbArchivarTrabajador(w._sbId);
  closeOv('ov-confirm');
  buildGrid(); renderTrabajadores(); renderW(); updateStats();
  showToast('El trabajador ha sido archivado. Puedes borrarlo en Trabajadores archivados.');
}

/* ── TRABAJADORES ARCHIVADOS ── */
function openArchivedWorkers(){
  renderArchivedWorkers();
  showOv('ov-archived');
}

function renderArchivedWorkers(){
  const archived = L().staff.filter(w => w.activo === false);
  const list  = document.getElementById('archived-list');
  const empty = document.getElementById('archived-empty');
  if (!archived.length) {
    list.innerHTML = '';
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = archived.map(w => `
    <div class="pitem" style="cursor:default">
      <div class="p-av">${isSafeImg(w.photo)?`<img src="${w.photo}" alt="${w.name}">`:`${ini(w.name)}`}</div>
      <div class="p-info"><div class="p-name">${w.name}</div><div class="p-sect">${w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos'}</div></div>
      <div style="display:flex;gap:5px;flex-shrink:0">
        <button class="topbar-pill" onclick="restaurarTrabajador('${w.name}')" style="font-size:11px;padding:5px 9px;color:var(--acc);border-color:var(--acc-bd)">Restaurar</button>
        <button class="topbar-pill" onclick="confirmarBorrarDefinitivo('${w.name}')" style="font-size:11px;padding:5px 9px;color:#cc6060;border-color:rgba(200,60,60,.3)">Borrar</button>
      </div>
    </div>`).join('');
}

function restaurarTrabajador(name){
  const w = getW(name); if (!w) return;
  w.activo = true;
  if (w._sbId) sbRestaurarTrabajador(w._sbId);
  renderArchivedWorkers();
  buildGrid(); renderTrabajadores(); renderW(); updateStats();
  showToast(`${name} restaurado ✓`);
}

let _pendingPermDeleteName = null;
function confirmarBorrarDefinitivo(name){
  _pendingPermDeleteName = name;
  closeOv('ov-archived');
  showConfirmDialog(
    '¿Borrar definitivamente?',
    `Esto borrará permanentemente a ${name} y toda su información, incluida su participación en turnos pasados. Esta acción no se puede deshacer.`,
    'Borrar definitivamente',
    () => doBorrarDefinitivo(),
    () => { closeOv('ov-confirm'); showOv('ov-archived'); }
  );
}

async function doBorrarDefinitivo(){
  const name = _pendingPermDeleteName; if (!name) return;
  const w = getW(name); if (!w) return;
  closeOv('ov-confirm');
  if (w._sbId) await sbBorrarTrabajadorDefinitivo(w._sbId);
  const idx = L().staff.findIndex(x => x.name === name);
  if (idx > -1) L().staff.splice(idx, 1);
  ROWS.forEach(r => L().data[r].forEach((d, i) => { L().data[r][i] = d.filter(n => parse(n).name !== name); }));
  _pendingPermDeleteName = null;
  buildGrid(); renderTrabajadores(); renderW(); updateStats();
  scheduleAutosave();
  showToast(`${name} eliminado definitivamente`);
}

/* ── MODAL AÑADIR AL TURNO ── */
let _addRow="",_addCol=0;
function openAddModal(row,col){
  _addRow=row;_addCol=col;
  document.getElementById("add-sub").textContent=`${ROW_LBL[row]} · ${DAYS_L[col]}`;
  const assigned=(L().data[row][col]||[]).map(n=>parse(n).name);
  const list=document.getElementById("add-worker-list");list.innerHTML="";
  L().staff.filter(w=>w.activo!==false).forEach(w=>{
    const isAssigned=assigned.includes(w.name);
    const item=document.createElement("div");item.className="aw-item"+(isAssigned?" assigned":"");
    item.innerHTML=`<div class="aw-av">${isSafeImg(w.photo)?`<img src="${w.photo}">`:`${ini(w.name)}`}</div><div class="aw-name">${w.name}</div><span class="aw-tag">${w.sec}</span>${isAssigned?`<span class="aw-assigned-badge">ya asignado</span>`:""}`;
    if(!isAssigned)item.onclick=()=>{closeOv("ov-add");openPreview(w.name);};
    list.appendChild(item);
  });
  showOv("ov-add");
}
async function addNewFromShift(){
  const n=document.getElementById("add-new-name").value.trim();
  if(!n)return;
  if(!_sb){showToast('Sin conexión a Supabase');return;}
  const {data,error}=await _sb.from('trabajadores').insert({
    nombre:n, local_id:LOCAL_ID, seccion:'ambos', activo:true, prioridad:'eventual', min_turnos:0, max_turnos:0
  }).select('id').single();
  if(error){showToast('Error al crear trabajador');console.error('[SB] addNewFromShift:',error.message);return;}
  const newW={name:n,sec:'ambos',photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],skills:{},activo:true,prioridad:'eventual',_sbId:data.id};
  L().staff.push(newW);
  _nombreToId[n]=data.id;
  _idToNombre[data.id]=n;
  document.getElementById("add-new-name").value="";
  closeOv("ov-add");
  buildGrid();renderW();updateStats();
  openPreview(n);
}

/* ── PANEL TRABAJADORES ── */
function openTrabajadores(){
  document.getElementById("trab-sub").textContent=curLocal==="galeria"?"La Galería":"La Sala";
  renderTrabajadores();showOv("ov-trabajadores");
}
function renderTrabajadores(){
  updateStats();
  document.getElementById("plist").innerHTML=L().staff.filter(w=>w.activo!==false).map(w=>`
    <div class="pitem" onclick="closeOv('ov-trabajadores');openPreview('${w.name}')">
      <div class="p-av">${isSafeImg(w.photo)?`<img src="${w.photo}" alt="${w.name}">`:`${ini(w.name)}`}</div>
      <div class="p-info"><div class="p-name">${w.name}</div><div class="p-sect">${w.sec==="sala"?"Sala":w.sec==="cocina"?"Cocina":"Ambos"} · ${cntT(w.name)} turnos</div></div>
      <div class="p-chevron">&#8250;</div>
    </div>`).join("");
}
function addWorker(){
  const n=document.getElementById("pnew-name").value.trim();
  if(!n)return;L().staff.push({name:n,sec:'ambos',photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],skills:{}});
  document.getElementById("pnew-name").value="";closeOv("ov-trabajadores");openPreview(n);
}

/* ── PANEL EVENTOS ── */
let _evHora="--:--", _evImgNew=null;

function openEventos(){
  document.getElementById("eventos-sub").textContent=curLocal==="galeria"?"La Galería":"La Sala";
  renderEventos();showOv("ov-eventos");
}
function openEvPopup(){
  document.getElementById("ev-desc").value="";
  document.getElementById("ev-tipo").value="evento";
  document.getElementById("ev-dia").value="0";
  document.getElementById("ev-precio").value="";
  _evHora="--:--";
  _evImgNew=null;
  document.getElementById("ev-hora-btn").textContent="--:--";
  document.getElementById("ev-img-placeholder").style.display="";
  document.getElementById("ev-img-preview").style.display="none";
  showOv("ov-ev-popup");
}
function triggerEvPhotoNew(){
  document.getElementById("ev-photo-new-input").click();
}
function removeEvImgNew(){
  _evImgNew=null;
  document.getElementById("ev-img-placeholder").style.display="";
  document.getElementById("ev-img-preview").style.display="none";
}
document.getElementById("ev-photo-new-input").addEventListener("change",function(){
  const file=this.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    _evImgNew=e.target.result;
    document.getElementById("ev-img-thumb").src=_evImgNew;
    document.getElementById("ev-img-placeholder").style.display="none";
    document.getElementById("ev-img-preview").style.display="block";
  };
  reader.readAsDataURL(file); this.value="";
});
function renderEventos(){
  updateStats();
  const list=document.getElementById("ev-list");
  if(!L().eventos.length){
    list.innerHTML=`<div class="vac-empty">No hay eventos esta semana.</div>`;
    return;
  }
  list.innerHTML=L().eventos.map((ev,i)=>`
    <div class="vac-item" style="cursor:pointer;align-items:flex-start" onclick="showEvDetail(L().eventos[${i}])">
      ${isSafeImg(ev.img)
        ?`<img src="${ev.img}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;flex-shrink:0;border:1px solid var(--border)">`
        :`<div style="font-size:20px;width:36px;text-align:center;flex-shrink:0;color:${EV_COLS[ev.tipo]};padding-top:2px">${EV_ICONS[ev.tipo]}</div>`
      }
      <div class="vac-item-info">
        <div class="vac-item-dates">${ev.desc}</div>
        <div class="vac-item-type">${DAYS_L[ev.dia]} · ${ev.hora}${ev.precio?" · "+ev.precio:""}</div>
      </div>
      <button class="vac-del" onclick="event.stopPropagation();delEv(${i})">&#215;</button>
    </div>`).join("");
}
function delEv(i){L().eventos.splice(i,1);renderEventos();buildGrid();}
function addEvento(){
  const desc=document.getElementById("ev-desc").value.trim();
  if(!desc){showToast("Escribe un nombre para el evento");return;}
  const hora=(_evHora&&_evHora!=="--:--")?_evHora:"—";
  L().eventos.push({
    tipo:document.getElementById("ev-tipo").value,
    desc,
    dia:parseInt(document.getElementById("ev-dia").value),
    hora,
    precio:document.getElementById("ev-precio").value.trim(),
    img:_evImgNew||null
  });
  L().eventos.sort((a,b)=>a.dia-b.dia);
  closeOv("ov-ev-popup");
  renderEventos();buildGrid();updateStats();
  showToast("Evento añadido ✓");
}
function showEvDetail(ev){
  document.getElementById("evd-title").textContent=EV_ICONS[ev.tipo]+" "+EV_NAMES[ev.tipo];
  document.getElementById("evd-body").innerHTML=`
    <div style="font-size:14px;color:var(--text);font-weight:600;margin-top:8px">${ev.desc}</div>
    <div style="font-size:12px;color:var(--dim);margin-top:8px">📅 ${DAYS_L[ev.dia]}</div>
    <div style="font-size:12px;color:var(--dim);margin-top:4px">🕐 ${ev.hora}</div>
    ${ev.precio?`<div style="font-size:13px;color:var(--acc);margin-top:6px;font-weight:600">💶 ${ev.precio}</div>`:""}
    ${isSafeImg(ev.img)?`<img src="${ev.img}" style="width:100%;border-radius:8px;margin-top:10px;max-height:180px;object-fit:contain">`:""}`;
  showOv("ov-evd");
}

/* ── VISTA PERSONA ── */
function buildPersonaHeader(){
  const todayStr=new Date().toISOString().split('T')[0];
  let html=`<tr><th class="th-n">Trabajador</th>`;
  for(let d=0;d<7;d++){
    const dayDate=new Date(curMonday+'T00:00:00Z');
    dayDate.setUTCDate(dayDate.getUTCDate()+d);
    const isToday=dayDate.toISOString().split('T')[0]===todayStr;
    html+=`<th class="th-dg${isToday?" tday":""}">${DAYS_S[d]}<br><b style="font-size:13px;color:${isToday?"var(--acc)":"var(--text)"}">${dayDate.getUTCDate()}</b></th>`;
  }
  html+=`<th class="th-tot">#</th></tr>`;
  document.getElementById("persona-thead").innerHTML=html;
}
function setSort(v){curSort=v;renderW();}
function fSec(s,el){curSec=s;document.querySelectorAll(".ftab").forEach(t=>t.classList.remove("active"));el.classList.add("active");renderW();}
function fName(v){curSearch=v;renderW();}
function wDayCell(name,d){
  const med=["sm","cm"].find(r=>(L().data[r][d]||[]).some(n=>parse(n).name===name));
  const noch=["sn","cn"].find(r=>(L().data[r][d]||[]).some(n=>parse(n).name===name));
  const hour=getHour(name,d);
  return`<div class="day-cell">
    <div class="day-slot-top">${med?`<div class="ws ws-${med}">${med==="sm"?"S.Med":"C.Med"}</div>`:""}</div>
    <div class="day-slot-bot">${noch?`<div class="ws ws-${noch}">${noch==="sn"?"S.Noch":"C.Noch"}</div>`:""}</div>
    ${hour?`<div class="day-slot-hr"><span class="ws-hour">⏰${hour}</span></div>`:""}
  </div>`;
}
function renderW(){
  buildPersonaHeader();
  let f=L().staff.filter(w=>w.activo!==false&&(curSec==="all"||w.sec===curSec||w.sec==="ambos")&&w.name.toLowerCase().includes(curSearch.toLowerCase()));
  if(curSort==="td")f.sort((a,b)=>cntT(b.name)-cntT(a.name));
  else if(curSort==="ta")f.sort((a,b)=>cntT(a.name)-cntT(b.name));
  else if(curSort==="na")f.sort((a,b)=>a.name.localeCompare(b.name));
  else f.sort((a,b)=>b.name.localeCompare(a.name));
  document.getElementById("wtbody").innerHTML=f.map(w=>{
    const t=cntT(w.name);const hasAlert=((w.minT&&t<w.minT)||(w.maxT&&t>w.maxT));
    return`<tr class="wr" onclick="openPreview('${w.name}')">
      <td class="td-mid" style="padding:8px 10px;vertical-align:middle"><div style="display:flex;align-items:center;gap:8px">
        <div class="row-av">${isSafeImg(w.photo)?`<img src="${w.photo}" alt="${w.name}">`:`${ini(w.name)}`}</div>
        <div><div class="rname">${w.name}${hasAlert?` <span style="color:#e09600;font-size:11px">⚠</span>`:""}</div><div class="rsec">${w.sec}</div></div>
      </div></td>
      ${[0,1,2,3,4,5,6].map(d=>`<td class="td-mid" style="padding:3px 2px">${wDayCell(w.name,d)}</td>`).join("")}
      <td style="vertical-align:middle;border:1px solid var(--border);border-left:none;border-radius:0 8px 8px 0;padding:6px 8px;text-align:center"><div class="tot-n">${t}</div></td>
    </tr>`;
  }).join("");
}

function setView(v){
  flushSave();
  document.getElementById("view-semana").style.display=v==="semana"?"":"none";
  document.getElementById("view-persona").style.display=v==="persona"?"":"none";
  document.getElementById("vtab-s").classList.toggle("active",v==="semana");
  document.getElementById("vtab-p").classList.toggle("active",v==="persona");
  if(v==="persona")renderW();
}
function resetView(){
  setView('semana');
  document.querySelectorAll('.overlay.show').forEach(function(m){m.classList.remove('show');});
}

/* ── NAVEGACIÓN DE SEMANA ── */
/* revisar: MESES_ES e isoWeekNum()/isoWeekYear()/mondayOfDate() duplican logica de assets/lib/date-picker.js (_isoWeekNum/_mondayOf/MESES_ES), pero esas son privadas dentro de su IIFE y no se exponen via window.DatePicker — no se puede reutilizar sin ampliar la API publica del modulo compartido (fuera de alcance de este cambio) */
const MESES_ES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESES_CORTO=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function isoWeekNum(dateStr){
  const [y,m,d]=dateStr.split('-').map(Number);
  const dt=new Date(Date.UTC(y,m-1,d));
  const day=dt.getUTCDay()||7;
  dt.setUTCDate(dt.getUTCDate()+4-day);
  const y0=new Date(Date.UTC(dt.getUTCFullYear(),0,1));
  return Math.ceil((((dt-y0)/86400000)+1)/7);
}
function isoWeekYear(dateStr){
  const [y,m,d]=dateStr.split('-').map(Number);
  const dt=new Date(Date.UTC(y,m-1,d));
  const day=dt.getUTCDay()||7;
  dt.setUTCDate(dt.getUTCDate()+4-day);
  return dt.getUTCFullYear();
}
function mondayOfDate(dateStr){
  const [y,m,d]=dateStr.split('-').map(Number);
  const dt=new Date(Date.UTC(y,m-1,d));
  const dow=dt.getUTCDay()||7;
  dt.setUTCDate(dt.getUTCDate()-(dow-1));
  return dt.toISOString().split('T')[0];
}
function weekMondayStr(isoYear,isoWeek){
  const jan4=new Date(Date.UTC(isoYear,0,4));
  const dow=jan4.getUTCDay()||7;
  const mon=new Date(jan4);
  mon.setUTCDate(jan4.getUTCDate()-(dow-1)+(isoWeek-1)*7);
  return mon.toISOString().split('T')[0];
}
function weekLabel(monStr){
  const st=new Date(monStr+'T00:00:00Z');
  const en=new Date(monStr+'T00:00:00Z');
  en.setUTCDate(en.getUTCDate()+6);
  const wNum=isoWeekNum(monStr);
  let dateLine;
  if(st.getUTCFullYear()!==en.getUTCFullYear()){
    // Cambio de año: "29 dic 2026 – 4 ene 2027"
    dateLine=st.getUTCDate()+' '+MESES_CORTO[st.getUTCMonth()]+' '+st.getUTCFullYear()+' – '+en.getUTCDate()+' '+MESES_CORTO[en.getUTCMonth()]+' '+en.getUTCFullYear();
  } else if(st.getUTCMonth()===en.getUTCMonth()){
    // Mismo mes: "22–28 jun"
    dateLine=st.getUTCDate()+'–'+en.getUTCDate()+' '+MESES_CORTO[st.getUTCMonth()];
  } else {
    // Meses distintos, mismo año: "29 jun – 5 jul"
    dateLine=st.getUTCDate()+' '+MESES_CORTO[st.getUTCMonth()]+' – '+en.getUTCDate()+' '+MESES_CORTO[en.getUTCMonth()];
  }
  return [dateLine,'Sem '+wNum];
}

// curMonday: lunes de la semana mostrada ('YYYY-MM-DD')
// curWeek / curYear: semana ISO y año ISO derivados de curMonday
let curMonday=mondayOfDate(new Date().toISOString().split('T')[0]);
let curWeek=isoWeekNum(curMonday);
let curYear=isoWeekYear(curMonday);

function _applyWeek(monStr){
  curMonday=monStr;
  curWeek=isoWeekNum(monStr);
  curYear=isoWeekYear(monStr);
  const [line1,line2]=weekLabel(monStr);
  document.getElementById('wlabel').textContent=line1;
  document.getElementById('wsub').textContent=line2;
  if(window.DatePicker) DatePicker.setDate(monStr);
  loadWeekFromSupabase(monStr);
}
function changeWeek(delta){
  const dt=new Date(curMonday+'T00:00:00Z');
  dt.setUTCDate(dt.getUTCDate()+delta*7);
  _applyWeek(dt.toISOString().split('T')[0]);
}

/* picker delegado a DatePicker (assets/lib/date-picker.js) */

/* ── HELPERS DE UI ── */


function showOv(id){document.getElementById(id).classList.add("show");}
/* ── EXPORT: WhatsApp / PDF / Enlace ── */
const TURNO_LABEL={sm:"☀️ Sala mediodía",sn:"🌙 Sala noche",cm:"🔴 Cocina mediodía",cn:"🟠 Cocina noche"};

function buildWeekText(){
  const label=document.getElementById("wlabel").textContent;
  const loc=curLocal==="galeria"?"La Galería":"La Sala";
  let txt=`📋 *${loc} — Turnos ${label}*\n\n`;
  const dl=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  for(let d=0;d<7;d++){
    const hasTurno=["sm","sn","cm","cn"].some(r=>L().data[r][d]&&L().data[r][d].length>0);
    if(!hasTurno)continue;
    txt+=`📅 *${dl[d]} ${18+d}*\n`;
    ["sm","sn","cm","cn"].forEach(r=>{
      const arr=L().data[r][d];
      if(arr&&arr.length){
        const names=arr.map(n=>parse(n).name).join(", ");
        txt+=`  ${TURNO_LABEL[r]}: ${names}\n`;
      }
    });
    // Eventos del día
    const evs=L().eventos.filter(e=>e.dia===d);
    if(evs.length)txt+=`  🎉 ${evs.map(e=>e.desc+(e.hora&&e.hora!=="—"?" "+e.hora:"")).join(" · ")}\n`;
    txt+="\n";
  }
  return txt.trim();
}

function shareWA(){
  const txt=buildWeekText();
  window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank");
}

function genPDF(){
  const label=document.getElementById("wlabel").textContent;
  const loc=curLocal==="galeria"?"La Galería":"La Sala";
  const dl=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  const ROWS_ALL=["sm","sn","cm","cn"];
  const TLBL={sm:"Sala mediodía",sn:"Sala noche",cm:"Cocina mediodía",cn:"Cocina noche"};
  const TCOL={sm:"var(--sm-text)",sn:"var(--sn-text)",cm:"var(--cm-text)",cn:"var(--cn-text)"};

  let rows="";
  for(let d=0;d<7;d++){
    const dayRows=ROWS_ALL.map(r=>{
      const arr=L().data[r][d];
      if(!arr||!arr.length)return "";
      const names=arr.map(n=>parse(n).name).join(", ");
      return `<tr><td style="padding:4px 8px;font-size:11px;color:#666;white-space:nowrap">${dl[d]}</td><td style="padding:4px 8px;font-size:11px;font-weight:600;color:${TCOL[r]}">${TLBL[r]}</td><td style="padding:4px 8px;font-size:12px">${names}</td></tr>`;
    }).filter(Boolean).join("");
    if(dayRows)rows+=dayRows;
  }
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=calendar_month" /><title>Turnos ${label}</title>
  <style>body{font-family:Arial,sans-serif;padding:24px;color:#222}h1{font-size:18px;margin-bottom:4px}p{font-size:12px;color:#666;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{background:#f4f4f4;padding:6px 8px;font-size:11px;text-align:left;border-bottom:2px solid #ddd}td{border-bottom:1px solid #eee}@media print{body{padding:8px}}</style></head>
  <body onload="window.print()"><h1>${loc} — Turnos semana</h1><p>${label}</p>
  <table><thead><tr><th>Día</th><th>Turno</th><th>Trabajadores</th></tr></thead><tbody>${rows||"<tr><td colspan='3' style='padding:12px;color:#999;text-align:center'>Sin turnos asignados</td></tr>"}</tbody></table>
  <\/body><\/html>`;

  const win=window.open("","_blank");
  win.document.write(html);
  win.document.close();
}

function buildReadonlyHTML(){
  const label=document.getElementById("wlabel").textContent;
  const dl=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  let html=`<div class="ro-week">${label}</div>`;
  for(let d=0;d<7;d++){
    const hasTurno=["sm","sn","cm","cn"].some(r=>L().data[r][d]&&L().data[r][d].length>0);
    const evs=L().eventos.filter(e=>e.dia===d);
    if(!hasTurno&&!evs.length)continue;
    html+=`<div class="ro-day"><div class="ro-day-hdr">${dl[d]} ${18+d}</div>`;
    ["sm","sn","cm","cn"].forEach(r=>{
      const arr=L().data[r][d];
      if(arr&&arr.length){
        const names=arr.map(n=>parse(n).name).join(", ");
        html+=`<div class="ro-row"><span class="ro-turno" style="background:rgba(80,80,80,.15);color:var(--dim)">${{sm:"SM",sn:"SN",cm:"CM",cn:"CN"}[r]}</span><span class="ro-names">${names}</span></div>`;
      }
    });
    evs.forEach(ev=>{
      html+=`<div class="ro-row"><span class="ro-turno" style="background:rgba(197,166,105,.1);color:var(--acc)">EVT</span><span class="ro-names">${EV_ICONS[ev.tipo]} ${ev.desc}${ev.hora&&ev.hora!=="—"?" · "+ev.hora:""}</span></div>`;
    });
    html+="</div>";
  }
  if(html===`<div class="ro-week">${label}</div>`)
    html+=`<div class="ro-empty" style="text-align:center;padding:20px">Sin turnos asignados esta semana</div>`;
  return html;
}

function copyLink(){
  // Genera un enlace con los datos codificados en el hash para vista solo lectura
  const data={label:document.getElementById("wlabel").textContent,loc:curLocal,data:L().data,eventos:L().eventos};
  const encoded=btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  const url=window.location.href.split("#")[0]+"#view="+encoded;
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(()=>showCopyToast("🔗 Enlace copiado"));
  } else {
    // Fallback
    const ta=document.createElement("textarea");
    ta.value=url;ta.style.position="fixed";ta.style.opacity="0";
    document.body.appendChild(ta);ta.select();
    document.execCommand("copy");document.body.removeChild(ta);
    showCopyToast("🔗 Enlace copiado");
  }
  // También abre la vista de solo lectura en este mismo overlay para previsualizar
  document.getElementById("ro-body").innerHTML=buildReadonlyHTML();
  showOv("ov-readonly");
}

function showCopyToast(msg){
  const t=document.getElementById("copy-toast");
  t.textContent=msg;t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2500);
}

/* ── VACACIONES: warning de solapamiento ── */
function vacDatesOverlap(vacaciones,desde,hasta,excludeIdx){
  return vacaciones.some((v,i)=>{
    if(i===excludeIdx)return false;
    if(!v.desde||!v.hasta)return false;
    return desde<=v.hasta&&hasta>=v.desde;
  });
}

function closeOv(id){document.getElementById(id).classList.remove("show");}
document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click",e=>{if(e.target===o)o.classList.remove("show");}));

/* ── INICIALIZACIÓN ── */
buildGrid();renderW();updateStats();
DatePicker.init({
  mode:'week',
  anchor:document.querySelector('.tp-week-center'),
  initialDate:curMonday,
  events:eventosToPickerDates(),
  onChange:function(d){ _applyWeek(d); }
});
sbInitTrabajadores().then(()=>changeWeek(0)); /* carga diccionario nombre↔UUID, actualiza label y carga semana actual */
window.addEventListener('beforeunload', () => { if (_saveTimer !== null) { clearTimeout(_saveTimer); _saveTimer = null; saveWeekSnapshot(); } });




/* ── VACACIONES ── */
function countVacDays(vacaciones){
  if(!vacaciones||!vacaciones.length)return 0;
  let total=0;
  vacaciones.forEach(v=>{
    if(!v.desde||!v.hasta)return;
    if(v.tipo!=='vacaciones')return; // solo cuenta vacaciones, no baja/libre/personal
    const d0=new Date(v.desde+"T00:00:00");
    const d1=new Date(v.hasta+"T00:00:00");
    const diff=Math.round((d1-d0)/(1000*60*60*24))+1;
    if(diff>0)total+=diff;
  });
  return total;
}

function renderVacList(){
  const w=getW(_previewName); if(!w)return;
  const list=document.getElementById("vac-list"); if(!list)return;
  const totalEl=document.getElementById("vac-days-total");
  const days=countVacDays(w.vacaciones);
  if(totalEl)totalEl.textContent=days+" día"+(days!==1?"s":"");
  if(!w.vacaciones||!w.vacaciones.length){
    list.innerHTML='<div class="vac-empty">Sin periodos registrados</div>';
    return;
  }
  const TIPO_ICON={vacaciones:"🌴",baja:"🤒",libre:"📅",personal:"🔒"};
  list.innerHTML=w.vacaciones.map((v,i)=>`
    <div class="vac-item">
      <div class="vac-item-info">
        <div class="vac-item-dates">${formatVacDate(v.desde)} → ${formatVacDate(v.hasta)}</div>
        <div class="vac-item-type">${TIPO_ICON[v.tipo]||"📅"} ${v.tipo.charAt(0).toUpperCase()+v.tipo.slice(1)}</div>
      </div>
      <button class="vac-del" onclick="delVacaciones(${i})">&#215;</button>
    </div>
  `).join("");
}

function openVacPopup(){
  document.getElementById("vac-desde").value="";
  document.getElementById("vac-hasta").value="";
  document.getElementById("vac-tipo").value="vacaciones";
  showOv("ov-vac-popup");
}

function formatVacDate(dateStr){
  if(!dateStr)return"—";
  const d=new Date(dateStr+"T00:00:00");
  return d.toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"});
}

function addVacaciones(){
  const w=getW(_previewName); if(!w)return;
  const desde=document.getElementById("vac-desde").value;
  const hasta=document.getElementById("vac-hasta").value;
  const tipo=document.getElementById("vac-tipo").value;
  if(!desde||!hasta){showToast("Selecciona fecha de inicio y fin");return;}
  if(desde>hasta){showToast("La fecha de inicio debe ser anterior al fin");return;}
  if(!w.vacaciones)w.vacaciones=[];
  const overlap=vacDatesOverlap(w.vacaciones,desde,hasta,-1);
  const newVac={desde,hasta,tipo};
  w.vacaciones.push(newVac);
  w.vacaciones.sort((a,b)=>a.desde.localeCompare(b.desde));
  closeOv("ov-vac-popup");
  renderVacList();
  document.querySelectorAll("#prof-sg .sg-cell").forEach(c=>{
    c.classList.remove("on-vac");c.removeAttribute("data-vac-icon");
    const col=parseInt(c.dataset.col);
    const vacIcon=getDayVacacion(_previewName,col);
    if(vacIcon){c.classList.add("on-vac");c.setAttribute("data-vac-icon",vacIcon);}
  });
  updateAlert();
  showToast(overlap?"⚠️ Solapamiento detectado — revisa las fechas":"Periodo añadido ✓");
  if(w._sbId){
    _sb?.from('vacaciones').insert({trabajador_id:w._sbId,desde,hasta,tipo}).select('id').single()
      .then(({data,error})=>{
        if(error){console.error('[SB] insert vac:',error.message); return;}
        if(data) newVac._sbId=data.id;
      });
  }
}

function delVacaciones(idx){
  const w=getW(_previewName); if(!w)return;
  const item=w.vacaciones[idx];
  w.vacaciones.splice(idx,1);
  renderVacList();
  document.querySelectorAll("#prof-sg .sg-cell").forEach(c=>{
    c.classList.remove("on-vac");c.removeAttribute("data-vac-icon");
    const col=parseInt(c.dataset.col);
    const vacIcon=getDayVacacion(_previewName,col);
    if(vacIcon){c.classList.add("on-vac");c.setAttribute("data-vac-icon",vacIcon);}
  });
  updateAlert();
  if(w._sbId && item?._sbId){
    _sb?.from('vacaciones').delete().eq('id',item._sbId)
      .then(({error})=>{if(error) console.error('[SB] delete vac:',error.message);});
  }
}

function showToast(msg){
  const t=document.getElementById("toast");
  if(!t)return;
  t.textContent=msg;t.classList.add("show");
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),2200);
}


/* Check if a column (day index in current week) is in vacaciones for a worker */
function getDayVacacion(workerName, dayCol) {
  const w = getW(workerName);
  if (!w || !w.vacaciones || !w.vacaciones.length) return null;
  const dayDate=new Date(curMonday+'T00:00:00Z');
  dayDate.setUTCDate(dayDate.getUTCDate()+dayCol);
  const dayStr=dayDate.toISOString().split('T')[0];
  const TIPO_ICON = {vacaciones:'🌴', baja:'🤒', libre:'📅', personal:'🔒'};
  for (const v of w.vacaciones) {
    if (dayStr >= v.desde && dayStr <= v.hasta) {
      return TIPO_ICON[v.tipo] || '📅';
    }
  }
  return null;
}


/* ── ROLES ── */
const ROLES_COCINA=[
  {id:'raciones',      icon:'🍽️', label:'Raciones'},
  {id:'plancha',       icon:'🍳', label:'Plancha / Freidora'},
  {id:'pase',          icon:'📋', label:'Pase'},
  {id:'preparacion',   icon:'🥗', label:'Preparación'},
  {id:'apoyo_cocina',  icon:'🤝', label:'Apoyo Cocina'},
  {id:'stock_cocina',  icon:'📦', label:'Stock Cocina'},
];
const ROLES_SALA=[
  {id:'barra',         icon:'🍺', label:'Barra'},
  {id:'tostas',        icon:'🍞', label:'Tostas'},
  {id:'camarero',      icon:'🪑', label:'Camarero'},
  {id:'runner',        icon:'🏃', label:'Runner'},
  {id:'reservas',      icon:'📅', label:'Reservas'},
  {id:'apoyo_sala',    icon:'🤝', label:'Apoyo Sala'},
  {id:'stock_sala',    icon:'📦', label:'Stock Sala'},
];

/* Init skills/prioridad on staff if missing */
function ensureWorkerExtras(w){
  if(!w.prioridad) w.prioridad='eventual';
  if(!w.skills){
    w.skills={};
    const defaults=w.sec==='sala'?{barra:'puede',camarero_salon:'domina',camarero_terraza:'puede',camarero_sala:'puede'}
      :w.sec==='cocina'?{plancha:'puede',pase:'domina',raciones:'puede'}:{};
    Object.assign(w.skills,defaults);
  }
}




/* ── SKILLS MODAL ── */
function ensureSkills(w){
  if(!w.skills) w.skills={};
}

function openSkillsModal(){
  const w=getW(_previewName); if(!w) return;
  ensureSkills(w);
  document.getElementById('skills-modal-sub').textContent=
    w.name+' · '+(w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos');
  const showC=true;
  const showS=true;
  const mkRow=(r)=>{
    const cur=w.skills[r.id]||'none';
    const mkBtn=(lv,lbl)=>`<button class="skill-pill sp-${lv==='none'?'none':lv}${cur===lv?' sp-'+lv:''}" style="${cur===lv&&lv!=='none'?'':'opacity:.5'}" onclick="setSkillLive('${r.id}','${lv}',this)">${lbl}</button>`;
    return`<div class="skill-row"><span class="skill-icon">${r.icon}</span><span class="skill-name">${r.label}</span><div class="skill-pill-group">${mkBtn('none','—')}${mkBtn('puede','🟡 Puede')}${mkBtn('domina','🟢 Domina')}</div></div>`;
  };
  let h='';
  if(showC){h+='<div class="skill-dept-lbl">Cocina</div>';ROLES_COCINA.forEach(r=>{h+=mkRow(r);});}
  if(showS){h+='<div class="skill-dept-lbl">Sala</div>';ROLES_SALA.forEach(r=>{h+=mkRow(r);});}
  document.getElementById('skills-modal-body').innerHTML=h;
  showOv('ov-skills');
}

function setSkillLive(roleId,level,btn){
  const w=getW(_previewName); if(!w) return;
  ensureSkills(w);
  w.skills[roleId]=level;
  const row=btn.closest('.skill-row');
  if(row) row.querySelectorAll('.skill-pill').forEach(b=>{b.style.opacity='.5';});
  btn.style.opacity='1';
  if(w._sbId){
    const skillUUID=_skillLocalToUUID[roleId];
    if(!skillUUID){ console.warn('[SB] setSkillLive: sin UUID para',roleId); return; }
    if(level==='none'){
      _sb?.from('trabajador_skill').delete().eq('trabajador_id',w._sbId).eq('skill_id',skillUUID)
        .then(({error})=>{if(error) console.error('[SB] delete skill:',error.message);});
    } else {
      _sb?.from('trabajador_skill').upsert({trabajador_id:w._sbId,skill_id:skillUUID,nivel:level},{onConflict:'trabajador_id,skill_id'})
        .then(({error})=>{if(error) console.error('[SB] upsert skill:',error.message);});
    }
  }
}

function applySkills(){
  const w=getW(_previewName);
  if(w){
    ensureSkills(w);
    const hasCocina=ROLES_COCINA.some(r=>(w.skills[r.id]||'none')!=='none');
    const hasSala  =ROLES_SALA.some(r=>(w.skills[r.id]||'none')!=='none');
    if(hasCocina&&hasSala) w.sec='ambos';
    else if(hasCocina)     w.sec='cocina';
    else if(hasSala)       w.sec='sala';
    const sub=document.getElementById('prev-sub');
    if(sub) sub.textContent=(w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos')+' · '+(curLocal==='galeria'?'La Galería':'La Sala');
    if(w._sbId) sbUpdateTrabajador(w._sbId,{seccion:w.sec});
  }
  renderSkillsSummary();
  closeOv('ov-skills');
  showToast('Skills actualizados');
}

function renderSkillsSummary(){
  const w=getW(_previewName); if(!w) return;
  const cont=document.getElementById('skills-body'); if(!cont) return;
  ensureSkills(w);
  const ALL=[...ROLES_COCINA,...ROLES_SALA];
  const ICON={puede:'🟡',domina:'🟢'};
  const active=ALL.filter(r=>(w.skills[r.id]||'none')!=='none');
  if(!active.length){
    cont.innerHTML='<div style="font-size:11px;color:var(--faint);padding:4px 0;font-style:italic">Sin skills configurados</div>';
    return;
  }
  cont.innerHTML=active.map(r=>`<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:5px;background:var(--acc-bg);border:1px solid var(--acc-bd);color:var(--acc);margin:2px">${r.icon} ${r.label} ${ICON[w.skills[r.id]]||''}</span>`).join('');
}


/* ── SLOT TIMES (editable) ── */
function editTime(slot){
  const el = document.getElementById('t-time-'+slot);
  if(!el || el.contentEditable==='true') return;
  el.contentEditable = 'true';
  el.style.outline = '1px solid var(--acc-bd)';
  el.style.borderRadius = '4px';
  el.style.padding = '1px 3px';
  el.style.minWidth = '36px';
  el.focus();
  // Select all text
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  function save(){
    const val = el.textContent.trim();
    slotTimes[slot] = val || slotTimes[slot];
    el.textContent = slotTimes[slot];
    el.contentEditable = 'false';
    el.style.outline = '';
    el.style.padding = '';
    el.style.minWidth = '';
    el.removeEventListener('blur', save);
    el.removeEventListener('keydown', onKey);
  }
  function onKey(e){
    if(e.key==='Enter'){e.preventDefault();el.blur();}
    if(e.key==='Escape'){el.textContent=slotTimes[slot];el.blur();}
  }
  el.addEventListener('blur', save);
  el.addEventListener('keydown', onKey);
}


/* ── WEEK CONFIG ── */

const SLOT_ROLES = {
  sm: ROLES_SALA, sn: ROLES_SALA,
  cm: ROLES_COCINA, cn: ROLES_COCINA
};
const DAYS_SHORT = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

var weekNeeds = {
  sm:{barra:1,camarero_salon:2,camarero_terraza:1,camarero_sala:0,jefe_sala:0,plancha:0,pase:0,raciones:0,jefe_cocina:0},
  sn:{barra:1,camarero_salon:2,camarero_terraza:1,camarero_sala:1,jefe_sala:1,plancha:0,pase:0,raciones:0,jefe_cocina:0},
  cm:{plancha:1,pase:1,raciones:1,jefe_cocina:1,barra:0,camarero_salon:0,camarero_terraza:0,camarero_sala:0,jefe_sala:0},
  cn:{plancha:1,pase:1,raciones:0,jefe_cocina:1,barra:0,camarero_salon:0,camarero_terraza:0,camarero_sala:0,jefe_sala:0},
};

var weekConfig = (function(){
  /* Leer desde localStorage compartido con inicio.html (misma origin) */
  try {
    var raw = localStorage.getItem('lg_weekconfig_v1');
    if (raw) { console.log('[weekConfig] cargado desde inicio.html (localStorage)'); return JSON.parse(raw); }
  } catch(e) { console.warn('[weekConfig] error leyendo localStorage:', e); }
  /* Fallback: generar desde weekNeeds locales */
  console.log('[weekConfig] generado desde weekNeeds (sin datos de inicio.html)');
  const cfg = {};
  for(let d=0;d<7;d++){
    cfg[d]={};
    ['sm','sn','cm','cn'].forEach(slot=>{
      const needs = weekNeeds[slot];
      const roles = SLOT_ROLES[slot];
      cfg[d][slot] = [];
      roles.forEach(r=>{
        const n = needs[r.id]||0;
        for(let i=0;i<n;i++) cfg[d][slot].push({roleId:r.id, level:'domina'});
      });
    });
  }
  return cfg;
})();

function getNeedsFromConfig(slot, day){
  const entries = (weekConfig[day]||{})[slot]||[];
  const result = {};
  SLOT_ROLES[slot].forEach(r=>result[r.id]=0);
  entries.forEach(e=>{ result[e.roleId]=(result[e.roleId]||0)+1; });
  return result;
}

/* ── AUTOGENERADOR ── */
function openAutoModal(){
  const res = document.getElementById('auto-result');
  if(res){ res.style.display='none'; res.innerHTML=''; }
  document.getElementById('auto-sub').textContent =
    document.getElementById('wlabel').textContent + ' · ' +
    (curLocal==='galeria'?'La Galería':'La Sala');
  showOv('ov-auto');
}

function limpiarSemana(){
  if(!confirm('¿Vaciar todos los turnos de esta semana?')) return;
  ROWS.forEach(r=>{ for(let d=0;d<7;d++) L().data[r][d]=[]; });
  buildGrid(); renderW(); updateStats();
  showToast('Semana limpiada ✓');
  scheduleAutosave();
}

function runAutoGen(){
  // Show loading
  const loadEl = document.getElementById('autogen-loading');
  if(loadEl) loadEl.classList.add('show');
  setTimeout(()=>{
  _runAutoGenCore();
  if(loadEl) loadEl.classList.remove('show');
  }, 50);
}
function _runAutoGenCore(){
  const z = L();
  const DAYS7 = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const SLOT_LBL = {sm:'Sala med',sn:'Sala noche',cm:'Cocina med',cn:'Cocina noche'};
  const isMed = {sm:true,sn:false,cm:true,cn:false};
  const assigned = [];
  const alerts = [];
  const runMap = {}; // slot-day → [names assigned this run]

  function alreadyIn(slot,day){
    return (z.data[slot][day]||[]).map(n=>parse(n).name);
  }
  function alreadyInRun(name,slot,day){
    return ((runMap[slot+'-'+day])||[]).includes(name);
  }
  function markAssign(w,slot,day){
    const key=slot+'-'+day;
    if(!runMap[key]) runMap[key]=[];
    runMap[key].push(w.name);
    if(!z.data[slot][day]) z.data[slot][day]=[];
    z.data[slot][day].push(w.name);
    assigned.push({name:w.name,slot,day});
  }
  function isAvail(w,slot,day){
    if(w.activo===false) return false;
    if(w.disponible===false||w.visible===false) return false;
    if(alreadyIn(slot,day).includes(w.name)) return false;
    if(alreadyInRun(w.name,slot,day)) return false;
    const med=isMed[slot];
    const unavail=med?(w.unavailMed||[]):(w.unavailNoch||[]);
    if(unavail.includes(day)) return false;
    if(getDayVacacion(w.name,day)) return false;
    if(w.maxT && cntT(w.name)>=w.maxT) return false;
    return true;
  }
  function skillLv(w,roleId){
    return (w.skills&&w.skills[roleId])||'none';
  }
  function workerSatisfies(w,entry){
    const lv=skillLv(w,entry.roleId);
    if(lv==='none') return false;
    if(entry.level==='domina') return lv==='domina';
    return true;
  }

  // Count how many workers CAN satisfy an entry for a given slot+day
  // (used to sort entries by scarcity — rarest first)
  function countCandidates(entry,slot,day){
    return z.staff.filter(w=>isAvail(w,slot,day)&&workerSatisfies(w,entry)).length;
  }

  // Get ordered candidate list: fijo+domina → fijo+puede → eventual+domina → eventual+puede
  function getCandidates(entry,slot,day){
    const passes=[
      w=>(w.prioridad||'eventual')==='fijo'    && skillLv(w,entry.roleId)==='domina',
      w=>(w.prioridad||'eventual')==='fijo'    && skillLv(w,entry.roleId)==='puede' && entry.level==='puede',
      w=>(w.prioridad||'eventual')==='eventual' && skillLv(w,entry.roleId)==='domina',
      w=>(w.prioridad||'eventual')==='eventual' && skillLv(w,entry.roleId)==='puede' && entry.level==='puede',
    ];
    const result=[];
    passes.forEach(pass=>{
      z.staff.filter(w=>pass(w)&&isAvail(w,slot,day)&&!result.includes(w))
             .forEach(w=>result.push(w));
    });
    return result;
  }

  ROWS.forEach(slot=>{
    for(let day=0;day<7;day++){
      const entries=(weekConfig[day]||{})[slot]||[];
      if(!entries.length) return;

      // ── MARK ALREADY SATISFIED ──
      const satisfied=new Array(entries.length).fill(false);
      alreadyIn(slot,day).forEach(name=>{
        const w=z.staff.find(x=>x.name===name); if(!w) return;
        for(let i=0;i<entries.length;i++){
          if(!satisfied[i]&&workerSatisfies(w,entries[i])){
            satisfied[i]=true; break;
          }
        }
      });

      // ── SORT UNSATISFIED BY SCARCITY (fewest candidates first) ──
      // Build index array of unsatisfied entries, sorted by candidate count asc
      const unsatisfiedIdx = entries
        .map((e,i)=>({i,e,count:satisfied[i]?Infinity:countCandidates(e,slot,day)}))
        .filter(x=>!satisfied[x.i])
        .sort((a,b)=>a.count-b.count)
        .map(x=>x.i);

      // ── FILL IN SCARCITY ORDER ──
      unsatisfiedIdx.forEach(i=>{
        const entry=entries[i];
        const candidates=getCandidates(entry,slot,day);
        let found=false;
        for(const w of candidates){
          if(!isAvail(w,slot,day)) continue; // re-check after previous assignments
          markAssign(w,slot,day);
          satisfied[i]=true;
          found=true;
          break;
        }
        if(!found){
          const role=SLOT_ROLES[slot].find(r=>r.id===entry.roleId);
          alerts.push('⚠ '+DAYS7[day]+' '+SLOT_LBL[slot]+
            ' — '+(role?(role.icon||'')+' '+role.label:entry.roleId)+
            ' ('+entry.level+'): sin candidato disponible');
        }
      });
    }
  });

  // ── SHOW RESULT ──
  const res=document.getElementById('auto-result');
  res.style.display='block';
  let h='';
  if(!assigned.length&&!alerts.length){
    h='<div style="color:var(--acc);font-size:13px;font-weight:600">✓ La semana ya cumple todos los requisitos</div>';
  } else {
    if(assigned.length){
      const groups={};
      assigned.forEach(a=>{
        const k=a.slot+'-'+a.day;
        if(!groups[k]) groups[k]={slot:a.slot,day:a.day,names:[]};
        groups[k].names.push(a.name);
      });
      h+='<div style="color:#5ab870;font-size:12px;font-weight:700;margin-bottom:6px">✓ '+assigned.length+' asignaciones realizadas</div>';
      Object.values(groups).forEach(g=>{
        h+='<div style="font-size:11px;color:var(--muted);padding:2px 0">'+
          SLOT_LBL[g.slot]+' '+DAYS7[g.day]+': '+g.names.join(', ')+'</div>';
      });
    }
    if(alerts.length){
      h+='<div style="color:#cc6060;font-size:12px;font-weight:700;margin-top:8px;margin-bottom:4px">Sin cobertura:</div>';
      alerts.forEach(a=>{h+='<div style="font-size:11px;color:#cc8080;padding:2px 0">'+a+'</div>';});
    }
  }
  res.innerHTML=h;
  buildGrid(); renderW(); updateStats();
  scheduleAutosave();
} // end _runAutoGenCore


/* ── FUNCIONES WEEK CONFIG ── */
function openWeekConfig(){
  document.getElementById('wc-sub').textContent =
    document.getElementById('wlabel').textContent;
  renderWeekConfig();
  showOv('ov-week-cfg');
}

function renderWeekConfig(){
  const body = document.getElementById('wc-body'); if(!body) return;
  const SLOT_INFO = [
    {id:'sm', label:'Sala mediodía',   icon:'🍺', color:'var(--sm-bd)', text:'var(--sm-text)'},
    {id:'sn', label:'Sala noche',      icon:'🍺', color:'var(--sn-bd)', text:'var(--sn-text)'},
    {id:'cm', label:'Cocina mediodía', icon:'🍳', color:'var(--cm-bd)', text:'var(--cm-text)'},
    {id:'cn', label:'Cocina noche',    icon:'🍳', color:'var(--cn-bd)', text:'var(--cn-text)'},
  ];
  const DAY_NAMES = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  const DAY_NUMS  = ['18','19','20','21','22','23','24'];

  let h = '';
  for(let d=0;d<7;d++){
    h += `<div class="wc-day-block">
      <div class="wc-day-title">
        ${DAY_NAMES[d]}
        <span class="wc-day-num">· ${DAY_NUMS[d]} mayo</span>
      </div>`;

    SLOT_INFO.forEach(sl=>{
      const entries = (weekConfig[d]||{})[sl.id]||[];
      const roles   = SLOT_ROLES[sl.id];

      h += `<div class="wc-slot-block" style="border-left:3px solid ${sl.color}">
        <div class="wc-slot-title" style="color:${sl.text}">
          <span style="font-size:13px">${sl.icon}</span>
          ${sl.label}
        </div>`;

      if(!entries.length){
        h += `<div class="wc-empty-slot">Sin requisitos — pulsa + para añadir</div>`;
      } else {
        entries.forEach((entry, idx)=>{
          const role = roles.find(r=>r.id===entry.roleId)||{icon:'?',label:entry.roleId};
          h += `<div class="wc-role-row" id="wcr-${d}-${sl.id}-${idx}">
            <span class="wc-role-icon">${role.icon}</span>
            <span class="wc-role-name">${role.label}</span>
            <div class="wc-level-btns">
              <button class="wc-lvl wc-puede${entry.level==='puede'?' active':''}"
                onclick="setWcLevel(${d},'${sl.id}',${idx},'puede',this)">🟡 Puede</button>
              <button class="wc-lvl wc-domina${entry.level==='domina'?' active':''}"
                onclick="setWcLevel(${d},'${sl.id}',${idx},'domina',this)">🟢 Domina</button>
            </div>
            <button class="wc-del" onclick="removeWcEntry(${d},'${sl.id}',${idx})">&#215;</button>
          </div>`;
        });
      }

      // Add role buttons
      h += `<div class="wc-add-role">`;
      roles.forEach(r=>{
        h += `<button class="wc-add-role-btn" onclick="addWcEntry(${d},'${sl.id}','${r.id}')">
          + ${r.icon} ${r.label}
        </button>`;
      });
      h += `</div></div>`;  // close slot-block
    });

    h += `</div>`;  // close day-block
  }
  body.innerHTML = h;
}

function setWcLevel(day, slot, idx, level, btn){
  if(!weekConfig[day]) return;
  const entries = weekConfig[day][slot];
  if(!entries||!entries[idx]) return;
  entries[idx].level = level;
  // Update buttons in same row
  const row = btn.closest('.wc-role-row');
  if(row) row.querySelectorAll('.wc-lvl').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

function addWcEntry(day, slot, roleId){
  if(!weekConfig[day]) weekConfig[day]={};
  if(!weekConfig[day][slot]) weekConfig[day][slot]=[];
  weekConfig[day][slot].push({roleId, level:'domina'});
  renderWeekConfig();
  // Scroll to this day
  const dayBlocks = document.querySelectorAll('.wc-day-block');
  if(dayBlocks[day]) dayBlocks[day].scrollIntoView({behavior:'smooth',block:'nearest'});
}

function removeWcEntry(day, slot, idx){
  if(!weekConfig[day]||!weekConfig[day][slot]) return;
  weekConfig[day][slot].splice(idx,1);
  renderWeekConfig();
}

function saveWeekConfig(){
  closeOv('ov-week-cfg');
  showToast('Configuración guardada ✓');
}


/* ── MODAL SKILLS GLOBAL ── */
function openSkillsModalGlobal(){
  // Open skills modal in global edit mode (not tied to a specific worker)
  const modal = document.getElementById('ov-skills');
  if(!modal) return;
  document.getElementById('skills-modal-sub').textContent='Editar roles globales del local';
  const ALL=[...ROLES_COCINA,...ROLES_SALA];
  const mkRow=(r)=>`<div class="skill-row">
    <span class="skill-icon">${r.icon}</span>
    <span class="skill-name">${r.label}</span>
    <span style="font-size:10px;color:var(--dim);margin-left:auto">${ROLES_COCINA.includes(r)?'Cocina':'Sala'}</span>
  </div>`;
  let h='<div class="skill-dept-lbl">Cocina</div>'+ROLES_COCINA.map(mkRow).join('');
  h+='<div class="skill-dept-lbl">Sala</div>'+ROLES_SALA.map(mkRow).join('');
  h+='<div style="font-size:11px;color:var(--faint);padding:10px 0;font-style:italic">Los roles se gestionarán desde Antigravity con Supabase.</div>';
  document.getElementById('skills-modal-body').innerHTML=h;
  // Override apply button to just close
  const applyBtn=modal.querySelector('.btn-confirm');
  if(applyBtn){applyBtn.textContent='Cerrar';applyBtn.onclick=()=>closeOv('ov-skills');}
  showOv('ov-skills');
}

