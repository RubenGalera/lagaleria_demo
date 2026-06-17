
const DAYS_S=["Lun","Mar","MiÃ©","Jue","Vie","SÃ¡b","Dom"];
const DAYS_L=["Lunes 18","Martes 19","MiÃ©rcoles 20","Jueves 21","Viernes 22","SÃ¡bado 23","Domingo 24"];
const ROWS=["sm","sn","cm","cn"];
const CONFLICTS={sm:"cm",cm:"sm",sn:"cn",cn:"sn"};
const ROW_LBL={sm:"Sala Med",sn:"Sala Noche",cm:"Cocina Med",cn:"Cocina Noche"};
const EV_ICONS={birthday:"ðŸŽ‚",cata:"ðŸ·",menu:"ðŸ½ï¸",evento:"ðŸ“…"};
const EV_NAMES={birthday:"CumpleaÃ±os",cata:"Cata",menu:"MenÃº especial",evento:"Evento"};
const EV_COLS={birthday:"#e880c0",cata:"#b880e0",menu:"#60c888",evento:"#60aaee"};

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
    eventos:[
      {tipo:"cata",desc:"Cata Vinos Rioja",dia:3,hora:"20:30",precio:"100â‚¬ p.p.",img:null},
      {tipo:"birthday",desc:"CumpleaÃ±os grupo 8 pax",dia:5,hora:"14:00",precio:"",img:null},
    ]
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
    eventos:[{tipo:"menu",desc:"MenÃº especial degustaciÃ³n",dia:2,hora:"13:00",precio:"45â‚¬ p.p.",img:null}]
  }
};

let curLocal="galeria",_previewName="",curSort="td",curSec="all",curSearch="",_evPhotoIdx=null,_horaRows=[],curPage="turnos";
function L(){return locals[curLocal];}
function ini(n){return n.split(":")[0].trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();}
function parse(raw){const p=raw.split(":");return{name:p[0].trim(),hour:p.length>1?p[1]+":"+p[2]:""};}
function getW(n){return L().staff.find(w=>w.name===n)||null;}
function cntT(name){let c=0;ROWS.forEach(r=>L().data[r].forEach(d=>{if(d.some(n=>parse(n).name===name))c++;}));return c;}
function getHour(name,d){let h="";ROWS.forEach(r=>{const f=(L().data[r][d]||[]).find(n=>parse(n).name===name);if(f&&parse(f).hour)h=parse(f).hour;});return h;}

/* PAGE NAV */
function setPage(p){
  curPage=p;
  document.querySelectorAll(".page").forEach(el=>el.classList.remove("active"));
  document.getElementById("page-"+p).classList.add("active");
  document.querySelectorAll(".bnav-item").forEach(el=>el.classList.remove("active"));
  document.getElementById("bnav-"+p).classList.add("active");
}

/* LOCAL */
function setLocal(local){
  curLocal=local;const isG=local==="galeria";
  document.getElementById("navbar").style.background=isG?"#22292D":"#A32B2A";
  document.getElementById("logo-area").innerHTML=isG?
    `<div class="logo-g"><div class="logo-g-neo">â€” NEOTABERNA â€”</div><div class="logo-g-main">LA GALERÃA</div><div class="logo-g-deco"><div class="logo-g-line"></div><div class="logo-g-sub">â€” Y ALGO MÃS â€”</div><div class="logo-g-line"></div></div></div>`:
    `<div class="logo-s"><div class="logo-s-main">LA SALA</div><div class="logo-s-sub">VUELTA AL ORIGEN Â· BAR</div></div>`;
  document.getElementById("btn-g").className="lbtn"+(isG?" active-g":"");
  document.getElementById("btn-s").className="lbtn"+(isG?"":" active-s");
  document.documentElement.style.setProperty("--acc",isG?"#C5A669":"#A32B2A");
  document.documentElement.style.setProperty("--acc-bg",isG?"rgba(197,166,105,0.12)":"rgba(163,43,42,0.1)");
  document.documentElement.style.setProperty("--acc-bd",isG?"rgba(197,166,105,0.35)":"rgba(163,43,42,0.3)");
  document.body.classList.toggle("sala-theme",!isG);
  buildGrid();renderW();updateStats();
}

function updateStats(){
  const sw=document.getElementById("st-w");
  if(sw) sw.textContent=L().staff.length;
  const swm=document.getElementById("st-w-m");
  if(swm) swm.textContent=L().staff.length;
  const sev=document.getElementById("st-ev");
  if(sev) sev.textContent=L().eventos.length;
}

/* GRID */
function buildGrid(){
  const dh=document.getElementById("day-headers");
  // Keep label corner cell, rebuild day headers
  dh.innerHTML=`<div class="row-label-corner"></div>`;
  for(let d=0;d<7;d++){
    const el=document.createElement("div");el.className="day-head"+(d===1?" today":"");
    el.innerHTML=`<div class="dname">${DAYS_S[d]}</div><div class="dnum">${18+d}</div>${d===1?"<div class='today-dot'></div>":""}`;
    dh.appendChild(el);
  }
  const er=document.getElementById("ev-row");
  er.innerHTML='<div class="row-label-ev"></div>';
  for(let d=0;d<7;d++){
    const div=document.createElement("div");div.className="ev-day";
    L().eventos.filter(e=>e.dia===d).forEach(ev=>{
      const b=document.createElement("div");b.className=`ev-badge ev-${ev.tipo}`;
      b.innerHTML=`<div class="ev-dot"></div><span style="overflow:hidden;text-overflow:ellipsis">${EV_NAMES[ev.tipo]}</span>`;
      b.onclick=()=>showEvDetail(ev);div.appendChild(b);
    });
    er.appendChild(div);
  }
  const SLOT_INFO={sm:['t-time-sm','Sala'],sn:['t-time-sn','Sala'],cm:['t-time-cm','Cocina'],cn:['t-time-cn','Cocina']};
  ROWS.forEach(r=>{
    const rowEl=document.getElementById(`row-${r}`);
    const timeVal=document.getElementById(SLOT_INFO[r][0])?.textContent||slotTimes[r]||'';
    rowEl.innerHTML=`<div class="row-label" onclick="editTime('${r}')"><div class="t-time" id="${SLOT_INFO[r][0]}">${timeVal}</div><div class="t-sect">${SLOT_INFO[r][1]}</div></div>`;
    for(let d=0;d<7;d++){
      const cell=document.createElement("div");cell.className=`cell cell-${r}`;
      (L().data[r][d]||[]).forEach(raw=>{
        const {name,hour}=parse(raw);const w=getW(name);
        const isMed=r==="sm"||r==="cm";
        const unavail=w&&(isMed?w.unavailMed:w.unavailNoch)&&(isMed?w.unavailMed:w.unavailNoch).includes(d);
        const onVac=w&&w.vacaciones&&(()=>{
          const baseDate=new Date('2026-05-18');
          const dayDate=new Date(baseDate);dayDate.setDate(baseDate.getDate()+(curWeek-1)*7+d);
          const dayStr=dayDate.toISOString().split('T')[0];
          return w.vacaciones.some(v=>dayStr>=v.desde&&dayStr<=v.hasta);
        })();
        const chip=document.createElement("div");chip.className=`chip chip-${r}`;chip.draggable=true;
        if(unavail)chip.style.cssText="border-color:rgba(200,60,60,.5);background:rgba(200,60,60,.08)";
        chip.innerHTML=`<div class="dh"><span></span><span></span><span></span></div><span class="chip-name">${name}</span>${hour?`<span class="chip-tag">${hour}</span>`:""}${(unavail||onVac)?`<span style="font-size:9px;color:#cc4444;margin-left:auto">âš </span>`:""}`;
        chip.onclick=()=>openPreview(name);setupDrag(chip,cell);cell.appendChild(chip);
      });
      const add=document.createElement("div");add.className="add-chip";add.textContent="+ aÃ±adir";
      add.onclick=()=>openAddModal(r,d);cell.appendChild(add);
      rowEl.appendChild(cell);
    }
  });
}

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

/* PREVIEW */
function openPreview(name){
  _previewName=name;
  const w=getW(name)||{name,sec:"?",photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[]};
  const t=cntT(name);
  document.getElementById("prev-title").textContent=name;
  document.getElementById("prev-sub").textContent=(w.sec==="sala"?"Sala":w.sec==="cocina"?"Cocina":"Ambos")+" Â· "+(curLocal==="galeria"?"La GalerÃ­a":"La Sala");
  document.getElementById("prev-avatar").innerHTML=w.photo?`<img src="${w.photo}" alt="${name}">`:`${ini(name)}`;
  document.getElementById("prev-name").textContent=name;
  document.getElementById("prev-sect").textContent=w.sec==="sala"?"Sala":w.sec==="cocina"?"Cocina":"Ambos";
  document.getElementById("prev-min").value=w.minT!=null?String(w.minT):"";
  document.getElementById("prev-max").value=w.maxT!=null?String(w.maxT):"";
  document.getElementById("prev-turnos-count").textContent=t+" turno"+(t!==1?"s":"");
  const td=document.getElementById("prev-tel-display"),ti=document.getElementById("prev-tel-input");
  ti.style.display="none";
  if(w.tel){td.textContent=w.tel;td.className="w-tel-display";}
  else{td.textContent="+ Tel";td.className="w-tel-display empty";}
  td.style.display="";
  document.querySelectorAll("#prof-sg .sg-cell").forEach(c=>{
    ROWS.forEach(r=>c.classList.remove("on-"+r,"unavail","on-vac"));
    c.removeAttribute("data-vac-icon");
    c.removeAttribute("title");
    const col=parseInt(c.dataset.col);const r=c.dataset.row;
    if((L().data[r][col]||[]).some(n=>parse(n).name===name))c.classList.add("on-"+r);
    const isMed=r==="sm"||r==="cm";
    if((isMed?w.unavailMed:w.unavailNoch).includes(col))c.classList.add("unavail");
    // Check vacaciones
    const vacIcon=getDayVacacion(name, col);
    if(vacIcon){
      c.classList.add("on-vac");
      c.setAttribute("data-vac-icon", vacIcon);
      c.setAttribute("title", "DÃ­a de vacaciones");
    }
  });
  document.querySelectorAll("#unavail-med .unavail-chip-h").forEach(el=>{
    el.classList.toggle("active",w.unavailMed.includes(parseInt(el.dataset.d)));
  });
  document.querySelectorAll("#unavail-noch .unavail-chip-h").forEach(el=>{
    el.classList.toggle("active",w.unavailNoch.includes(parseInt(el.dataset.d)));
  });
  _horaRows=[];
  for(let d=0;d<7;d++){const h=getHour(name,d);if(h)_horaRows.push({d,h});}
  renderHoraList();renderVacList();updateAlert();
  // AcordeÃ³n siempre cerrado al abrir perfil
  const accBody=document.getElementById("acc-body-cfg");
  const accArrow=document.getElementById("acc-arrow-cfg");
  if(accBody){accBody.classList.remove("open");}
  if(accArrow){accArrow.style.transform="";}
  renderSkillsSummary();
  showOv("ov-preview");
}

function updateAlert(){
  const w=getW(_previewName); if(!w) return;
  const t=cntT(_previewName);
  const min=parseInt(document.getElementById("prev-min").value)||0;
  const max=parseInt(document.getElementById("prev-max").value)||0;
  const msgs=[];

  // Min/Max turnos
  if(max>0&&t>max) msgs.push(`Exceso de turnos â€” lleva ${t}, mÃ¡ximo ${max}`);
  if(min>0&&t<min) msgs.push(`Faltan turnos â€” lleva ${t}, mÃ­nimo ${min}`);

  // DÃ­as no disponibles con turno asignado
  const SLOTS={sm:'unavailMed',sn:'unavailNoch',cm:'unavailMed',cn:'unavailNoch'};
  const DAYS=['Lun','Mar','MiÃ©','Jue','Vie','SÃ¡b','Dom'];
  const SLOT_LBL={sm:'Sala med',sn:'Sala noche',cm:'Cocina med',cn:'Cocina noche'};
  Object.entries(SLOTS).forEach(([slot,unavailKey])=>{
    const unavail=w[unavailKey]||[];
    for(let d=0;d<7;d++){
      if(!unavail.includes(d)) continue;
      const assigned=(L().data[slot][d]||[]).some(n=>n.split(':')[0].trim()===w.name);
      if(assigned) msgs.push(`Turno en dÃ­a no disponible â€” ${SLOT_LBL[slot]} ${DAYS[d]}`);
    }
  });

  // Vacaciones con turno asignado
  if(w.vacaciones&&w.vacaciones.length){
    const baseDate=new Date('2026-05-18');
    for(let d=0;d<7;d++){
      const dayDate=new Date(baseDate);
      dayDate.setDate(baseDate.getDate()+(curWeek-1)*7+d);
      const dayStr=dayDate.toISOString().split('T')[0];
      const onVac=w.vacaciones.some(v=>dayStr>=v.desde&&dayStr<=v.hasta);
      if(!onVac) continue;
      const hasShift=['sm','sn','cm','cn'].some(slot=>
        (L().data[slot][d]||[]).some(n=>n.split(':')[0].trim()===w.name)
      );
      if(hasShift) msgs.push(`Turno en periodo de vacaciones â€” ${DAYS[d]}`);
    }
  }

  const alertEl=document.getElementById("prev-alert");
  if(msgs.length){
    alertEl.className="w-alert alert-err";
    alertEl.innerHTML=msgs.map(m=>`âš  ${m}`).join('<br>');
    alertEl.style.display="block";
  } else {
    alertEl.style.display="none";
  }
}

function toggleSg(cell){
  const row=cell.dataset.row,col=parseInt(cell.dataset.col),conf=CONFLICTS[row];
  if(!cell.classList.contains("on-"+row)){
    // Removing conflict slot
    document.querySelector(`#prof-sg .sg-cell[data-row="${conf}"][data-col="${col}"]`)?.classList.remove("on-"+conf);
    // Remove from data
    if(L().data[conf][col]) L().data[conf][col]=L().data[conf][col].filter(n=>parse(n).name!==_previewName);
  }
  cell.classList.toggle("on-"+row);
  // Sync to data
  if(!L().data[row][col]) L().data[row][col]=[];
  if(cell.classList.contains("on-"+row)){
    if(!L().data[row][col].some(n=>parse(n).name===_previewName)) L().data[row][col].push(_previewName);
  } else {
    L().data[row][col]=L().data[row][col].filter(n=>parse(n).name!==_previewName);
  }
  updateAlert();
}

function toggleUnavail(el){
  el.classList.toggle("active");
  const d=parseInt(el.dataset.d);const t=el.dataset.t;
  const rows=t==="med"?["sm","cm"]:["sn","cn"];
  rows.forEach(r=>{
    document.querySelector(`#prof-sg .sg-cell[data-row="${r}"][data-col="${d}"]`)?.classList.toggle("unavail",el.classList.contains("active"));
  });
  updateAlert();
}

function renderHoraList(){
  const list=document.getElementById("hora-list");list.innerHTML="";
  _horaRows.forEach((hr,i)=>{
    const row=document.createElement("div");row.className="hora-row";
    const displayVal=hr.h||"--:--";
    row.innerHTML=`<select class="hora-sel" onchange="_horaRows[${i}].d=parseInt(this.value)">${DAYS_S.map((d,di)=>`<option value="${di}" ${hr.d===di?"selected":""}>${d} ${18+di}</option>`).join("")}</select><span style="font-size:11px;color:var(--dim)">â°</span><button class="hora-display" onclick="openTp('hora',this,${i})">${displayVal}</button><button class="hora-del" onclick="_horaRows.splice(${i},1);renderHoraList()">&#215;</button>`;
    list.appendChild(row);
  });
}
function addHoraRow(){_horaRows.push({d:0,h:""});renderHoraList();}

/* â”€â”€ TIME PICKER (reutilizable) â”€â”€ */
let _tpIdx=-1,_tpH=8,_tpM=0,_tpBtn=null,_tpCtx=null,_tpCb=null;
const TP_MINS=[0,15,30,45];

function openTp(ctx,btn,idx,initVal){
  _tpCtx=ctx;_tpBtn=btn;_tpIdx=idx!=null?idx:-1;
  const cur=initVal||(btn?btn.textContent:"");
  const parts=(cur||"").split(":");
  _tpH=parseInt(parts[0]);if(isNaN(_tpH))_tpH=8;
  _tpM=TP_MINS.includes(parseInt(parts[1]))?parseInt(parts[1]):0;
  // TÃ­tulo contextual
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
  // PosiciÃ³n junto al botÃ³n
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
    // el botÃ³n ya muestra el valor; addEvento lo leerÃ¡ de _evHora
    _evHora=val;
  }
  closeTp();
}

function saveProfile(){
  const w=getW(_previewName);if(!w)return;
  w.minT=parseInt(document.getElementById("prev-min").value)||0;
  w.maxT=parseInt(document.getElementById("prev-max").value)||0;
  w.unavailMed=Array.from(document.querySelectorAll("#unavail-med .unavail-chip-h.active")).map(el=>parseInt(el.dataset.d));
  w.unavailNoch=Array.from(document.querySelectorAll("#unavail-noch .unavail-chip-h.active")).map(el=>parseInt(el.dataset.d));
  ROWS.forEach(r=>L().data[r].forEach((da,di)=>{L().data[r][di]=da.filter(n=>parse(n).name!==_previewName);}));
  document.querySelectorAll("#prof-sg .sg-cell").forEach(c=>{
    ROWS.forEach(r=>{if(c.dataset.row===r&&c.classList.contains("on-"+r)){
      const d=parseInt(c.dataset.col);
      const hour=_horaRows.find(hr=>hr.d===d);
      const raw=_previewName+(hour&&hour.h?":"+hour.h:"");
      if(!L().data[r][d])L().data[r][d]=[];
      if(!L().data[r][d].some(n=>parse(n).name===_previewName))L().data[r][d].push(raw);
    }});
  });
  // Preservar scroll del grid
  const gs=document.querySelector(".grid-scroll");
  const scrollLeft=gs?gs.scrollLeft:0;
  const scrollTop=window.scrollY||document.documentElement.scrollTop;
  closeOv("ov-preview");buildGrid();renderW();updateStats();
  // Restaurar scroll
  if(gs)gs.scrollLeft=scrollLeft;
  window.scrollTo(0,scrollTop);
}

function startEditTel(){
  const td=document.getElementById("prev-tel-display"),ti=document.getElementById("prev-tel-input");
  td.style.display="none";ti.value=getW(_previewName)?.tel||"";ti.style.display="";ti.focus();
}
function saveTel(){
  const w=getW(_previewName);const v=document.getElementById("prev-tel-input").value.trim();if(w)w.tel=v;
  const td=document.getElementById("prev-tel-display"),ti=document.getElementById("prev-tel-input");
  ti.style.display="none";if(v){td.textContent=v;td.className="w-tel-display";}else{td.textContent="+ Tel";td.className="w-tel-display empty";}td.style.display="";
}
function callWorker(){const w=getW(_previewName);if(w&&w.tel)window.location.href=`tel:${w.tel.replace(/\s/g,"")}`;}
function waWorker(){const w=getW(_previewName);if(w&&w.tel)window.open(`https://wa.me/34${w.tel.replace(/\D/g,"")}`);}

let _photoTarget=null;
function triggerPhoto(){
  const w=getW(_previewName);
  if(w&&w.photo){
    const win=window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><body style="margin:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:12px"><img src="${w.photo}" style="max-width:100%;max-height:80vh;object-fit:contain"><div style="display:flex;gap:10px"><button onclick="document.getElementById('fi').click()" style="background:#C5A669;color:#222;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer">Cambiar</button><button onclick="window.opener.removeWorkerPhoto();window.close()" style="background:rgba(200,60,60,.8);color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer">Quitar</button></div><input type="file" id="fi" accept="image/*" style="display:none" onchange="const r=new FileReader();r.onload=e=>{window.opener.setWorkerPhoto(e.target.result);window.close();};r.readAsDataURL(this.files[0])"></body></html>`);
  }else{_photoTarget=_previewName;document.getElementById("photo-input").click();}
}
window.removeWorkerPhoto=()=>{const w=getW(_previewName);if(w){w.photo=null;openPreview(_previewName);buildGrid();renderTrabajadores();}};
window.setWorkerPhoto=src=>{const w=getW(_previewName);if(w){w.photo=src;openPreview(_previewName);buildGrid();renderTrabajadores();}};
document.getElementById("photo-input").addEventListener("change",function(){
  const file=this.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{const w=L().staff.find(s=>s.name===_photoTarget);if(w){w.photo=e.target.result;buildGrid();renderTrabajadores();if(document.getElementById("ov-preview").classList.contains("show"))openPreview(_photoTarget);}};
  reader.readAsDataURL(file);this.value="";_photoTarget=null;
});

function confirmDelete(){
  document.getElementById("confirm-body").textContent=`Vas a eliminar a ${_previewName} de la plantilla. Esta acciÃ³n es permanente â€” se borrarÃ¡ del plan semanal y no podrÃ¡s recuperar sus datos.`;
  closeOv("ov-preview");showOv("ov-confirm");
}
function doDeleteWorker(){
  const idx=L().staff.findIndex(w=>w.name===_previewName);if(idx>-1)L().staff.splice(idx,1);
  ROWS.forEach(r=>L().data[r].forEach((d,i)=>{L().data[r][i]=d.filter(n=>parse(n).name!==_previewName);}));
  closeOv("ov-confirm");buildGrid();renderTrabajadores();renderW();updateStats();
}

let _addRow="",_addCol=0;
function openAddModal(row,col){
  _addRow=row;_addCol=col;
  document.getElementById("add-sub").textContent=`${ROW_LBL[row]} Â· ${DAYS_L[col]}`;
  const assigned=(L().data[row][col]||[]).map(n=>parse(n).name);
  const list=document.getElementById("add-worker-list");list.innerHTML="";
  L().staff.forEach(w=>{
    const isAssigned=assigned.includes(w.name);
    const item=document.createElement("div");item.className="aw-item"+(isAssigned?" assigned":"");
    item.innerHTML=`<div class="aw-av">${w.photo?`<img src="${w.photo}">`:`${ini(w.name)}`}</div><div class="aw-name">${w.name}</div><span class="aw-tag">${w.sec}</span>${isAssigned?`<span class="aw-assigned-badge">ya asignado</span>`:""}`;
    if(!isAssigned)item.onclick=()=>{closeOv("ov-add");openPreview(w.name);};
    list.appendChild(item);
  });
  showOv("ov-add");
}
function addNewFromShift(){
  const n=document.getElementById("add-new-name").value.trim();
  if(!n)return;L().staff.push({name:n,sec:'ambos',photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],skills:{}});
  document.getElementById("add-new-name").value="";closeOv("ov-add");openPreview(n);
}

function openTrabajadores(){
  document.getElementById("trab-sub").textContent=curLocal==="galeria"?"La GalerÃ­a":"La Sala";
  renderTrabajadores();showOv("ov-trabajadores");
}
function renderTrabajadores(){
  updateStats();
  document.getElementById("plist").innerHTML=L().staff.map(w=>`
    <div class="pitem" onclick="closeOv('ov-trabajadores');openPreview('${w.name}')">
      <div class="p-av">${w.photo?`<img src="${w.photo}" alt="${w.name}">`:`${ini(w.name)}`}</div>
      <div class="p-info"><div class="p-name">${w.name}</div><div class="p-sect">${w.sec==="sala"?"Sala":w.sec==="cocina"?"Cocina":"Ambos"} Â· ${cntT(w.name)} turnos</div></div>
      <div class="p-chevron">&#8250;</div>
    </div>`).join("");
}
function addWorker(){
  const n=document.getElementById("pnew-name").value.trim();
  if(!n)return;L().staff.push({name:n,sec:'ambos',photo:null,tel:"",minT:0,maxT:0,unavailMed:[],unavailNoch:[],vacaciones:[],skills:{}});
  document.getElementById("pnew-name").value="";closeOv("ov-trabajadores");openPreview(n);
}

let _evHora="--:--", _evImgNew=null;

function openEventos(){
  document.getElementById("eventos-sub").textContent=curLocal==="galeria"?"La GalerÃ­a":"La Sala";
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
      ${ev.img
        ?`<img src="${ev.img}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;flex-shrink:0;border:1px solid var(--border)">`
        :`<div style="font-size:20px;width:36px;text-align:center;flex-shrink:0;color:${EV_COLS[ev.tipo]};padding-top:2px">${EV_ICONS[ev.tipo]}</div>`
      }
      <div class="vac-item-info">
        <div class="vac-item-dates">${ev.desc}</div>
        <div class="vac-item-type">${DAYS_L[ev.dia]} Â· ${ev.hora}${ev.precio?" Â· "+ev.precio:""}</div>
      </div>
      <button class="vac-del" onclick="event.stopPropagation();delEv(${i})">&#215;</button>
    </div>`).join("");
}
function delEv(i){L().eventos.splice(i,1);renderEventos();buildGrid();}
function addEvento(){
  const desc=document.getElementById("ev-desc").value.trim();
  if(!desc){showToast("Escribe un nombre para el evento");return;}
  const hora=(_evHora&&_evHora!=="--:--")?_evHora:"â€”";
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
  showToast("Evento aÃ±adido âœ“");
}
function showEvDetail(ev){
  document.getElementById("evd-title").textContent=EV_ICONS[ev.tipo]+" "+EV_NAMES[ev.tipo];
  document.getElementById("evd-body").innerHTML=`
    <div style="font-size:14px;color:var(--text);font-weight:600;margin-top:8px">${ev.desc}</div>
    <div style="font-size:12px;color:var(--dim);margin-top:8px">ðŸ“… ${DAYS_L[ev.dia]}</div>
    <div style="font-size:12px;color:var(--dim);margin-top:4px">ðŸ• ${ev.hora}</div>
    ${ev.precio?`<div style="font-size:13px;color:var(--acc);margin-top:6px;font-weight:600">ðŸ’¶ ${ev.precio}</div>`:""}
    ${ev.img?`<img src="${ev.img}" style="width:100%;border-radius:8px;margin-top:10px;max-height:180px;object-fit:contain">`:""}`;
  showOv("ov-evd");
}

function buildPersonaHeader(){
  let html=`<tr><th class="th-n">Trabajador</th>`;
  for(let d=0;d<7;d++)html+=`<th class="th-dg${d===1?" tday":""}">${DAYS_S[d]}<br><b style="font-size:13px;color:${d===1?"var(--acc)":"var(--text)"}">${18+d}</b></th>`;
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
    ${hour?`<div class="day-slot-hr"><span class="ws-hour">â°${hour}</span></div>`:""}
  </div>`;
}
function renderW(){
  buildPersonaHeader();
  let f=L().staff.filter(w=>(curSec==="all"||w.sec===curSec||w.sec==="ambos")&&w.name.toLowerCase().includes(curSearch.toLowerCase()));
  if(curSort==="td")f.sort((a,b)=>cntT(b.name)-cntT(a.name));
  else if(curSort==="ta")f.sort((a,b)=>cntT(a.name)-cntT(b.name));
  else if(curSort==="na")f.sort((a,b)=>a.name.localeCompare(b.name));
  else f.sort((a,b)=>b.name.localeCompare(a.name));
  document.getElementById("wtbody").innerHTML=f.map(w=>{
    const t=cntT(w.name);const hasAlert=((w.minT&&t<w.minT)||(w.maxT&&t>w.maxT));
    return`<tr class="wr" onclick="openPreview('${w.name}')">
      <td class="td-mid" style="padding:8px 10px;vertical-align:middle"><div style="display:flex;align-items:center;gap:8px">
        <div class="row-av">${w.photo?`<img src="${w.photo}" alt="${w.name}">`:`${ini(w.name)}`}</div>
        <div><div class="rname">${w.name}${hasAlert?` <span style="color:#e09600;font-size:11px">âš </span>`:""}</div><div class="rsec">${w.sec}</div></div>
      </div></td>
      ${[0,1,2,3,4,5,6].map(d=>`<td class="td-mid" style="padding:3px 2px">${wDayCell(w.name,d)}</td>`).join("")}
      <td style="vertical-align:middle;border:1px solid var(--border);border-left:none;border-radius:0 8px 8px 0;padding:6px 8px;text-align:center"><div class="tot-n">${t}</div></td>
    </tr>`;
  }).join("");
}

function setView(v){
  document.getElementById("view-semana").style.display=v==="semana"?"":"none";
  document.getElementById("view-persona").style.display=v==="persona"?"":"none";
  document.getElementById("vtab-s").classList.toggle("active",v==="semana");
  document.getElementById("vtab-p").classList.toggle("active",v==="persona");
  if(v==="persona")renderW();
}

const wkLbls=[["11â€“17 mayo","Sem 20"],["18â€“24 mayo","Sem 21"],["25â€“31 mayo","Sem 22"]];
let curWeek=1;
function changeWeek(d){curWeek=Math.max(0,Math.min(2,curWeek+d));document.getElementById("wlabel").textContent=wkLbls[curWeek][0];document.getElementById("wsub").textContent=wkLbls[curWeek][1];}

function toggleAccCfg(){
  const b=document.getElementById("acc-body-cfg");
  const a=document.getElementById("acc-arrow-cfg");
  if(!b)return;
  b.classList.toggle("open");
  a.style.transform=b.classList.contains("open")?"rotate(90deg)":"";
}

function showOv(id){document.getElementById(id).classList.add("show");}
/* â”€â”€ EXPORT: WhatsApp / PDF / Enlace â”€â”€ */
const TURNO_LABEL={sm:"â˜€ï¸ Sala mediodÃ­a",sn:"ðŸŒ™ Sala noche",cm:"ðŸ”´ Cocina mediodÃ­a",cn:"ðŸŸ  Cocina noche"};

function buildWeekText(){
  const label=document.getElementById("wlabel").textContent;
  const loc=curLocal==="galeria"?"La GalerÃ­a":"La Sala";
  let txt=`ðŸ“‹ *${loc} â€” Turnos ${label}*\n\n`;
  const dl=["Lun","Mar","MiÃ©","Jue","Vie","SÃ¡b","Dom"];
  for(let d=0;d<7;d++){
    const hasTurno=["sm","sn","cm","cn"].some(r=>L().data[r][d]&&L().data[r][d].length>0);
    if(!hasTurno)continue;
    txt+=`ðŸ“… *${dl[d]} ${18+d}*\n`;
    ["sm","sn","cm","cn"].forEach(r=>{
      const arr=L().data[r][d];
      if(arr&&arr.length){
        const names=arr.map(n=>parse(n).name).join(", ");
        txt+=`  ${TURNO_LABEL[r]}: ${names}\n`;
      }
    });
    // Eventos del dÃ­a
    const evs=L().eventos.filter(e=>e.dia===d);
    if(evs.length)txt+=`  ðŸŽ‰ ${evs.map(e=>e.desc+(e.hora&&e.hora!=="â€”"?" "+e.hora:"")).join(" Â· ")}\n`;
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
  const loc=curLocal==="galeria"?"La GalerÃ­a":"La Sala";
  const dl=["Lunes","Martes","MiÃ©rcoles","Jueves","Viernes","SÃ¡bado","Domingo"];
  const ROWS_ALL=["sm","sn","cm","cn"];
  const TLBL={sm:"Sala mediodÃ­a",sn:"Sala noche",cm:"Cocina mediodÃ­a",cn:"Cocina noche"};
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
  <body><h1>${loc} â€” Turnos semana</h1><p>${label}</p>
  <table><thead><tr><th>DÃ­a</th><th>Turno</th><th>Trabajadores</th></tr></thead><tbody>${rows||"<tr><td colspan='3' style='padding:12px;color:#999;text-align:center'>Sin turnos asignados</td></tr>"}</tbody></table>
  <script>window.onload=()=>{window.print();}<\/script></body></html>`;

  const win=window.open("","_blank");
  win.document.write(html);
  win.document.close();
}

function buildReadonlyHTML(){
  const label=document.getElementById("wlabel").textContent;
  const dl=["Lunes","Martes","MiÃ©rcoles","Jueves","Viernes","SÃ¡bado","Domingo"];
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
      html+=`<div class="ro-row"><span class="ro-turno" style="background:rgba(197,166,105,.1);color:var(--acc)">EVT</span><span class="ro-names">${EV_ICONS[ev.tipo]} ${ev.desc}${ev.hora&&ev.hora!=="â€”"?" Â· "+ev.hora:""}</span></div>`;
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
    navigator.clipboard.writeText(url).then(()=>showCopyToast("ðŸ”— Enlace copiado"));
  } else {
    // Fallback
    const ta=document.createElement("textarea");
    ta.value=url;ta.style.position="fixed";ta.style.opacity="0";
    document.body.appendChild(ta);ta.select();
    document.execCommand("copy");document.body.removeChild(ta);
    showCopyToast("ðŸ”— Enlace copiado");
  }
  // TambiÃ©n abre la vista de solo lectura en este mismo overlay para previsualizar
  document.getElementById("ro-body").innerHTML=buildReadonlyHTML();
  showOv("ov-readonly");
}

function showCopyToast(msg){
  const t=document.getElementById("copy-toast");
  t.textContent=msg;t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2500);
}

/* â”€â”€ VACACIONES: warning de solapamiento â”€â”€ */
function vacDatesOverlap(vacaciones,desde,hasta,excludeIdx){
  return vacaciones.some((v,i)=>{
    if(i===excludeIdx)return false;
    if(!v.desde||!v.hasta)return false;
    return desde<=v.hasta&&hasta>=v.desde;
  });
}

function closeOv(id){document.getElementById(id).classList.remove("show");}
document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click",e=>{if(e.target===o)o.classList.remove("show");}));

buildGrid();renderW();updateStats();




/* â”€â”€ VACACIONES â”€â”€ */
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
  if(totalEl)totalEl.textContent=days+" dÃ­a"+(days!==1?"s":"");
  if(!w.vacaciones||!w.vacaciones.length){
    list.innerHTML='<div class="vac-empty">Sin periodos registrados</div>';
    return;
  }
  const TIPO_ICON={vacaciones:"ðŸŒ´",baja:"ðŸ¤’",libre:"ðŸ“…",personal:"ðŸ”’"};
  list.innerHTML=w.vacaciones.map((v,i)=>`
    <div class="vac-item">
      <div class="vac-item-info">
        <div class="vac-item-dates">${formatVacDate(v.desde)} â†’ ${formatVacDate(v.hasta)}</div>
        <div class="vac-item-type">${TIPO_ICON[v.tipo]||"ðŸ“…"} ${v.tipo.charAt(0).toUpperCase()+v.tipo.slice(1)}</div>
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
  if(!dateStr)return"â€”";
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
  w.vacaciones.push({desde,hasta,tipo});
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
  showToast(overlap?"âš ï¸ Solapamiento detectado â€” revisa las fechas":"Periodo aÃ±adido âœ“");
}

function delVacaciones(idx){
  const w=getW(_previewName); if(!w)return;
  w.vacaciones.splice(idx,1);
  renderVacList();
  // Refresh sg-cell vacation markers
  document.querySelectorAll("#prof-sg .sg-cell").forEach(c=>{
    c.classList.remove("on-vac");c.removeAttribute("data-vac-icon");
    const col=parseInt(c.dataset.col);
    const vacIcon=getDayVacacion(_previewName,col);
    if(vacIcon){c.classList.add("on-vac");c.setAttribute("data-vac-icon",vacIcon);}
  });
  updateAlert();
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
  // Current week starts on weekLabels â€” use actual dates
  // Week starts Monday of the displayed week
  // weekOffset: curWeek relative to base week (18 may 2026 = Monday)
  const baseDate = new Date('2026-05-18'); // Monday of week 21
  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() + (curWeek - 1) * 7);
  const dayDate = new Date(weekStart);
  dayDate.setDate(weekStart.getDate() + dayCol);
  const dayStr = dayDate.toISOString().split('T')[0];
  const TIPO_ICON = {vacaciones:'ðŸŒ´', baja:'ðŸ¤’', libre:'ðŸ“…', personal:'ðŸ”’'};
  for (const v of w.vacaciones) {
    if (dayStr >= v.desde && dayStr <= v.hasta) {
      return TIPO_ICON[v.tipo] || 'ðŸ“…';
    }
  }
  return null;
}


/* â”€â”€ ROLES â”€â”€ */
const ROLES_COCINA=[
  {id:'raciones',      icon:'ðŸ½ï¸', label:'Raciones'},
  {id:'plancha',       icon:'ðŸ³', label:'Plancha / Freidora'},
  {id:'pase',          icon:'ðŸ“‹', label:'Pase'},
  {id:'preparacion',   icon:'ðŸ¥—', label:'PreparaciÃ³n'},
  {id:'apoyo_cocina',  icon:'ðŸ¤', label:'Apoyo Cocina'},
  {id:'stock_cocina',  icon:'ðŸ“¦', label:'Stock Cocina'},
];
const ROLES_SALA=[
  {id:'barra',         icon:'ðŸº', label:'Barra'},
  {id:'tostas',        icon:'ðŸž', label:'Tostas'},
  {id:'camarero',      icon:'ðŸª‘', label:'Camarero'},
  {id:'runner',        icon:'ðŸƒ', label:'Runner'},
  {id:'reservas',      icon:'ðŸ“…', label:'Reservas'},
  {id:'apoyo_sala',    icon:'ðŸ¤', label:'Apoyo Sala'},
  {id:'stock_sala',    icon:'ðŸ“¦', label:'Stock Sala'},
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

/* PRIORIDAD */
function setPrioridad(nivel){
  const w=getW(_previewName);if(!w)return;
  w.prioridad=nivel;
  renderPrioridad();
}
function renderPrioridad(){
  const w=getW(_previewName);if(!w)return;
  ensureWorkerExtras(w);
  const btns=document.querySelectorAll('#prio-btns .prio-btn');
  btns.forEach(b=>b.className='prio-btn');
  if(w.prioridad==='fijo'&&btns[0]) btns[0].classList.add('prio-fijo');
  else if(btns[1]) btns[1].classList.add('prio-eventual');
}

/* SKILLS */
function renderSkills(){
  const w=getW(_previewName);if(!w)return;
  ensureWorkerExtras(w);
  const cont=document.getElementById('skills-body');if(!cont)return;
  const showC=w.sec==='cocina'||w.sec==='ambos';
  const showS=w.sec==='sala'||w.sec==='ambos';
  const mkRow=(r)=>{
    const cur=(w.skills[r.id]||'none');
    const mkP=(lv,lbl)=>`<button class="skill-pill${cur===lv?' sp-'+lv:''}" onclick="setSkill('${r.id}','${lv}')">${lbl}</button>`;
    return`<div class="skill-row"><span class="skill-icon">${r.icon}</span><span class="skill-name">${r.label}</span><div class="skill-pill-group">${mkP('none','â€”')}${mkP('puede','ðŸŸ¡')}${mkP('domina','ðŸŸ¢')}</div></div>`;
  };
  let h='';
  if(showC){h+=`<div class="skill-dept-lbl">ðŸ³ Cocina</div>`;ROLES_COCINA.forEach(r=>{h+=mkRow(r);});}
  if(showS){h+=`<div class="skill-dept-lbl">ðŸº Sala</div>`;ROLES_SALA.forEach(r=>{h+=mkRow(r);});}
  cont.innerHTML=h;
}
function setSkill(roleId,level){
  const w=getW(_previewName);if(!w)return;
  ensureWorkerExtras(w);
  w.skills[roleId]=level;
  renderSkills();
}


/* â”€â”€ READONLY FLAG â”€â”€ */
const RO = new URLSearchParams(location.search).has('readonly');

/* â”€â”€ SAVE IMAGE â”€â”€ */
async function saveImage(){
  const btn=document.getElementById('btn-save-img');
  const orig=btn.textContent; btn.textContent='â³...'; btn.disabled=true;
  if(!window.html2canvas){
    await new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload=res;s.onerror=rej;document.head.appendChild(s);
    });
  }
  const header=document.createElement('div');
  header.style.cssText='background:#22292D;padding:12px 16px;display:flex;align-items:center;justify-content:space-between';
  header.innerHTML=`<div style="display:flex;flex-direction:column"><span style="font-size:8px;letter-spacing:2.5px;color:#C5A669;font-family:Georgia,serif">â€” NEOTABERNA â€”</span><span style="font-size:18px;color:#C5A669;font-family:Georgia,serif;letter-spacing:4px">LA GALERÃA</span></div><div style="text-align:right"><div style="font-size:11px;font-weight:700;color:#f0ece4">${document.getElementById('wlabel').textContent}</div><div style="font-size:10px;color:#7a8f96">${document.getElementById('wsub').textContent}</div></div>`;
  const legend=document.createElement('div');
  legend.style.cssText='background:#1a2226;padding:8px 16px;display:flex;flex-wrap:wrap;gap:10px;border-top:1px solid rgba(255,255,255,.07)';
  [{l:'Sala mediodÃ­a ~12:30',c:'var(--sm-bg)',b:'var(--sm-bd)'},{l:'Sala noche ~20:00',c:'var(--sn-bg)',b:'var(--sn-bd)'},{l:'Cocina mediodÃ­a ~12:00',c:'var(--cm-bg)',b:'var(--cm-bd)'},{l:'Cocina noche ~20:00',c:'var(--cn-bg)',b:'var(--cn-bd)'}].forEach(sl=>{
    legend.innerHTML+=`<span style="display:flex;align-items:center;gap:5px;font-size:10px;color:#7a8f96"><span style="width:10px;height:10px;border-radius:2px;background:${sl.c};border:1px solid ${sl.b};display:inline-block"></span>${sl.l}</span>`;
  });
  const wrap=document.createElement('div');
  wrap.style.cssText='position:fixed;left:-9999px;top:0;background:#111417;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';
  document.body.appendChild(wrap);
  wrap.appendChild(header);
  const gi=document.querySelector('.grid-inner');
  const gc=gi.cloneNode(true);
  gc.style.cssText='width:'+gi.scrollWidth+'px;overflow:visible';
  const gw=document.createElement('div');
  gw.style.cssText='background:#111417;padding:10px 16px';
  gw.appendChild(gc);
  wrap.appendChild(gw);
  wrap.appendChild(legend);
  try{
    const canvas=await html2canvas(wrap,{backgroundColor:'#111417',scale:2,useCORS:true,logging:false});
    const a=document.createElement('a');
    a.download='turnos_'+document.getElementById('wlabel').textContent.replace(/\s/g,'_')+'.png';
    a.href=canvas.toDataURL('image/png');a.click();
  }catch(e){alert('Error: '+e.message);}
  document.body.removeChild(wrap);
  btn.textContent=orig;btn.disabled=false;
}

/* â”€â”€ SHARE LINK â”€â”€ */
function shareLink(){
  const url=location.href.split('?')[0]+'?readonly';
  if(navigator.share){navigator.share({title:'Turnos La GalerÃ­a',url});}
  else{navigator.clipboard.writeText(url).then(()=>showToast('Enlace copiado âœ“'));}
}


/* â”€â”€ SKILLS MODAL â”€â”€ */
function ensureSkills(w){
  if(!w.skills) w.skills={};
}

function openSkillsModal(){
  const w=getW(_previewName); if(!w) return;
  ensureSkills(w);
  document.getElementById('skills-modal-sub').textContent=
    w.name+' Â· '+(w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos');
  const showC=true;
  const showS=true;
  const mkRow=(r)=>{
    const cur=w.skills[r.id]||'none';
    const mkBtn=(lv,lbl)=>`<button class="skill-pill sp-${lv==='none'?'none':lv}${cur===lv?' sp-'+lv:''}" style="${cur===lv&&lv!=='none'?'':'opacity:.5'}" onclick="setSkillLive('${r.id}','${lv}',this)">${lbl}</button>`;
    return`<div class="skill-row"><span class="skill-icon">${r.icon}</span><span class="skill-name">${r.label}</span><div class="skill-pill-group">${mkBtn('none','â€”')}${mkBtn('puede','ðŸŸ¡ Puede')}${mkBtn('domina','ðŸŸ¢ Domina')}</div></div>`;
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
}

function applySkills(){
  const w=getW(_previewName);
  if(w){
    ensureSkills(w);
    // Derive sec from skills
    const hasCocina=ROLES_COCINA.some(r=>(w.skills[r.id]||'none')!=='none');
    const hasSala  =ROLES_SALA.some(r=>(w.skills[r.id]||'none')!=='none');
    if(hasCocina&&hasSala) w.sec='ambos';
    else if(hasCocina)     w.sec='cocina';
    else if(hasSala)       w.sec='sala';
    // Update subtitle in profile
    const sub=document.getElementById('prev-sub');
    if(sub) sub.textContent=(w.sec==='sala'?'Sala':w.sec==='cocina'?'Cocina':'Ambos')+' Â· '+(curLocal==='galeria'?'La GalerÃ­a':'La Sala');
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
  const ICON={puede:'ðŸŸ¡',domina:'ðŸŸ¢'};
  const active=ALL.filter(r=>(w.skills[r.id]||'none')!=='none');
  if(!active.length){
    cont.innerHTML='<div style="font-size:11px;color:var(--faint);padding:4px 0;font-style:italic">Sin skills configurados</div>';
    return;
  }
  cont.innerHTML=active.map(r=>`<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:5px;background:var(--acc-bg);border:1px solid var(--acc-bd);color:var(--acc);margin:2px">${r.icon} ${r.label} ${ICON[w.skills[r.id]]||''}</span>`).join('');
}


/* â”€â”€ SLOT TIMES (editable) â”€â”€ */
var slotTimes = {sm:'12:30', sn:'20:00', cm:'12:00', cn:'20:00'};
const SLOT_NAMES = {sm:'Sala mediodÃ­a', sn:'Sala noche', cm:'Cocina mediodÃ­a', cn:'Cocina noche'};

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


/* â”€â”€ WEEK CONFIG â”€â”€ */

const SLOT_ROLES = {
  sm: ROLES_SALA, sn: ROLES_SALA,
  cm: ROLES_COCINA, cn: ROLES_COCINA
};
const DAYS_SHORT = ['Lun','Mar','MiÃ©','Jue','Vie','SÃ¡b','Dom'];

var weekNeeds = {
  sm:{barra:1,camarero_salon:2,camarero_terraza:1,camarero_sala:0,jefe_sala:0,plancha:0,pase:0,raciones:0,jefe_cocina:0},
  sn:{barra:1,camarero_salon:2,camarero_terraza:1,camarero_sala:1,jefe_sala:1,plancha:0,pase:0,raciones:0,jefe_cocina:0},
  cm:{plancha:1,pase:1,raciones:1,jefe_cocina:1,barra:0,camarero_salon:0,camarero_terraza:0,camarero_sala:0,jefe_sala:0},
  cn:{plancha:1,pase:1,raciones:0,jefe_cocina:1,barra:0,camarero_salon:0,camarero_terraza:0,camarero_sala:0,jefe_sala:0},
};

var weekConfig = (function(){
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

function openAutoModal(){
  const res = document.getElementById('auto-result');
  if(res){ res.style.display='none'; res.innerHTML=''; }
  document.getElementById('auto-sub').textContent =
    document.getElementById('wlabel').textContent + ' Â· ' +
    (curLocal==='galeria'?'La GalerÃ­a':'La Sala');
  showOv('ov-auto');
}

function limpiarSemana(){
  if(!confirm('Â¿Vaciar todos los turnos de esta semana?')) return;
  ROWS.forEach(r=>{ for(let d=0;d<7;d++) L().data[r][d]=[]; });
  buildGrid(); renderW(); updateStats();
  showToast('Semana limpiada âœ“');
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
  const DAYS7 = ['Lun','Mar','MiÃ©','Jue','Vie','SÃ¡b','Dom'];
  const SLOT_LBL = {sm:'Sala med',sn:'Sala noche',cm:'Cocina med',cn:'Cocina noche'};
  const isMed = {sm:true,sn:false,cm:true,cn:false};
  const assigned = [];
  const alerts = [];
  const runMap = {}; // slot-day â†’ [names assigned this run]

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
  // (used to sort entries by scarcity â€” rarest first)
  function countCandidates(entry,slot,day){
    return z.staff.filter(w=>isAvail(w,slot,day)&&workerSatisfies(w,entry)).length;
  }

  // Get ordered candidate list: fijo+domina â†’ fijo+puede â†’ eventual+domina â†’ eventual+puede
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

      // â”€â”€ MARK ALREADY SATISFIED â”€â”€
      const satisfied=new Array(entries.length).fill(false);
      alreadyIn(slot,day).forEach(name=>{
        const w=z.staff.find(x=>x.name===name); if(!w) return;
        for(let i=0;i<entries.length;i++){
          if(!satisfied[i]&&workerSatisfies(w,entries[i])){
            satisfied[i]=true; break;
          }
        }
      });

      // â”€â”€ SORT UNSATISFIED BY SCARCITY (fewest candidates first) â”€â”€
      // Build index array of unsatisfied entries, sorted by candidate count asc
      const unsatisfiedIdx = entries
        .map((e,i)=>({i,e,count:satisfied[i]?Infinity:countCandidates(e,slot,day)}))
        .filter(x=>!satisfied[x.i])
        .sort((a,b)=>a.count-b.count)
        .map(x=>x.i);

      // â”€â”€ FILL IN SCARCITY ORDER â”€â”€
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
          alerts.push('âš  '+DAYS7[day]+' '+SLOT_LBL[slot]+
            ' â€” '+(role?(role.icon||'')+' '+role.label:entry.roleId)+
            ' ('+entry.level+'): sin candidato disponible');
        }
      });
    }
  });

  // â”€â”€ SHOW RESULT â”€â”€
  const res=document.getElementById('auto-result');
  res.style.display='block';
  let h='';
  if(!assigned.length&&!alerts.length){
    h='<div style="color:var(--acc);font-size:13px;font-weight:600">âœ“ La semana ya cumple todos los requisitos</div>';
  } else {
    if(assigned.length){
      const groups={};
      assigned.forEach(a=>{
        const k=a.slot+'-'+a.day;
        if(!groups[k]) groups[k]={slot:a.slot,day:a.day,names:[]};
        groups[k].names.push(a.name);
      });
      h+='<div style="color:#5ab870;font-size:12px;font-weight:700;margin-bottom:6px">âœ“ '+assigned.length+' asignaciones realizadas</div>';
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
} // end _runAutoGenCore


function openWeekConfig(){
  document.getElementById('wc-sub').textContent =
    document.getElementById('wlabel').textContent;
  renderWeekConfig();
  showOv('ov-week-cfg');
}

function renderWeekConfig(){
  const body = document.getElementById('wc-body'); if(!body) return;
  const SLOT_INFO = [
    {id:'sm', label:'Sala mediodÃ­a',   icon:'ðŸº', color:'var(--sm-bd)', text:'var(--sm-text)'},
    {id:'sn', label:'Sala noche',      icon:'ðŸº', color:'var(--sn-bd)', text:'var(--sn-text)'},
    {id:'cm', label:'Cocina mediodÃ­a', icon:'ðŸ³', color:'var(--cm-bd)', text:'var(--cm-text)'},
    {id:'cn', label:'Cocina noche',    icon:'ðŸ³', color:'var(--cn-bd)', text:'var(--cn-text)'},
  ];
  const DAY_NAMES = ['Lunes','Martes','MiÃ©rcoles','Jueves','Viernes','SÃ¡bado','Domingo'];
  const DAY_NUMS  = ['18','19','20','21','22','23','24'];

  let h = '';
  for(let d=0;d<7;d++){
    h += `<div class="wc-day-block">
      <div class="wc-day-title">
        ${DAY_NAMES[d]}
        <span class="wc-day-num">Â· ${DAY_NUMS[d]} mayo</span>
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
        h += `<div class="wc-empty-slot">Sin requisitos â€” pulsa + para aÃ±adir</div>`;
      } else {
        entries.forEach((entry, idx)=>{
          const role = roles.find(r=>r.id===entry.roleId)||{icon:'?',label:entry.roleId};
          h += `<div class="wc-role-row" id="wcr-${d}-${sl.id}-${idx}">
            <span class="wc-role-icon">${role.icon}</span>
            <span class="wc-role-name">${role.label}</span>
            <div class="wc-level-btns">
              <button class="wc-lvl wc-puede${entry.level==='puede'?' active':''}"
                onclick="setWcLevel(${d},'${sl.id}',${idx},'puede',this)">ðŸŸ¡ Puede</button>
              <button class="wc-lvl wc-domina${entry.level==='domina'?' active':''}"
                onclick="setWcLevel(${d},'${sl.id}',${idx},'domina',this)">ðŸŸ¢ Domina</button>
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
  showToast('ConfiguraciÃ³n guardada âœ“');
}


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
  h+='<div style="font-size:11px;color:var(--faint);padding:10px 0;font-style:italic">Los roles se gestionarÃ¡n desde Antigravity con Supabase.</div>';
  document.getElementById('skills-modal-body').innerHTML=h;
  // Override apply button to just close
  const applyBtn=modal.querySelector('.btn-confirm');
  if(applyBtn){applyBtn.textContent='Cerrar';applyBtn.onclick=()=>closeOv('ov-skills');}
  showOv('ov-skills');
}


