/* turnoAutogen.js — Motor del autogenerador de turnos ("Automático" dentro
   del modal "Generar").
   Extraído de turnos.js (antes _runAutoGenCore, 151 líneas) para mantener
   turnos.js centrado en orquestación de UI. Esta función es lógica pura:
   no toca el DOM ni dispara guardado — el caller (turnos.js/handleAutomatico)
   es quien llama a buildGrid/renderW/updateStats/scheduleAutosave y muestra
   el resultado (toast), después de invocar esto.

   Requiere en el ámbito de página (definidos en turnos.js): L(), ROWS,
   weekConfig, SLOT_ROLES, parse(), cntT(), getDayVacacion(). */

/**
 * runTurnoAutogenCore()
 *
 * Recorre cada slot (sm/sn/cm/cn) y día (0-6) de la semana cargada en L(),
 * calcula qué requisitos de weekConfig ya están cubiertos por asignaciones
 * existentes, y rellena los huecos restantes ordenados por escasez de
 * candidatos (los roles más difíciles de cubrir primero). Para cada hueco
 * busca un candidato disponible priorizando fijo+domina → fijo+puede →
 * eventual+domina → eventual+puede, respetando disponibilidad, vacaciones
 * y el máximo de turnos semanal (maxT) de cada trabajador.
 *
 * Muta L().data directamente (añade los nombres asignados a los slots/días
 * correspondientes) — es la única mutación de estado que hace; no persiste
 * en Supabase ni refresca la UI, eso es responsabilidad del caller.
 *
 * @returns {{assigned: Array<{name:string,slot:string,day:number}>, alerts: string[]}}
 *   assigned — cada asignación realizada en esta ejecución.
 *   alerts   — mensajes legibles de huecos que no se pudieron cubrir por falta de candidato.
 */
function runTurnoAutogenCore(){
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

  // Cuenta cuántos trabajadores PUEDEN satisfacer un requisito para un slot+día
  // dado (se usa para ordenar los requisitos por escasez — los más raros primero).
  function countCandidates(entry,slot,day){
    return z.staff.filter(w=>isAvail(w,slot,day)&&workerSatisfies(w,entry)).length;
  }

  // Lista de candidatos ordenada: fijo+domina → fijo+puede → eventual+domina → eventual+puede
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

      // ── MARCAR LOS YA SATISFECHOS ──
      const satisfied=new Array(entries.length).fill(false);
      alreadyIn(slot,day).forEach(name=>{
        const w=z.staff.find(x=>x.name===name); if(!w) return;
        for(let i=0;i<entries.length;i++){
          if(!satisfied[i]&&workerSatisfies(w,entries[i])){
            satisfied[i]=true; break;
          }
        }
      });

      // ── ORDENAR LOS PENDIENTES POR ESCASEZ (menos candidatos primero) ──
      const unsatisfiedIdx = entries
        .map((e,i)=>({i,e,count:satisfied[i]?Infinity:countCandidates(e,slot,day)}))
        .filter(x=>!satisfied[x.i])
        .sort((a,b)=>a.count-b.count)
        .map(x=>x.i);

      // ── RELLENAR EN ORDEN DE ESCASEZ ──
      unsatisfiedIdx.forEach(i=>{
        const entry=entries[i];
        const candidates=getCandidates(entry,slot,day);
        let found=false;
        for(const w of candidates){
          if(!isAvail(w,slot,day)) continue; // re-comprobar tras asignaciones previas
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

  return {assigned, alerts};
}
