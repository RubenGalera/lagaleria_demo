/* turnoPlantilla.js — Gestión de plantillas de turno ("Cargar plantilla" /
   "Guardar plantilla" dentro del modal "Generar" de turnos.js).
   Exporta savePlantilla()/loadPlantilla() al scope global (window) para
   uso desde turnos.js — mismo patrón sin-módulos que el resto del proyecto.

   Tabla real en Supabase: turno_plantillas
     id, local_id, nombre (default 'Principal'), slot, dia, trabajador_id, created_at
   Solo existe una plantilla por local ('Principal') — guardar siempre
   reemplaza la anterior por completo (DELETE + INSERT), no hay versionado.

   Requiere en el ámbito de página: _sb (supabase-client.js). */

/**
 * savePlantilla(localId, gridData)
 *
 * Guarda el estado actual del grid como la plantilla 'Principal' de este
 * local en Supabase. Sustituye siempre la plantilla completa (borra todas
 * las filas de turno_plantillas de este local antes de insertar las nuevas)
 * — no es un merge ni versiona plantillas anteriores, a propósito: solo
 * existe UN "estado guardado" por local, el más reciente.
 *
 * @param {string} localId - LOCAL_ID del local activo.
 * @param {Array<{slot:string, dia:number, trabajadorId:string}>} gridData
 *   Una entrada por cada asignación del grid actual (turnos.js la construye
 *   recorriendo L().data y resolviendo cada nombre a su _sbId real —
 *   los trabajadores sin _sbId, ej. datos mock locales, se omiten).
 * @returns {Promise<{ok:boolean, count?:number}>}
 */
async function savePlantilla(localId, gridData){
  if (typeof _sb === 'undefined' || !_sb) { console.warn('[SB] savePlantilla: sin conexión'); return {ok:false}; }
  try{
    const del = await _sb.from('turno_plantillas').delete().eq('local_id', localId).eq('nombre', 'Principal');
    if (del.error) { console.error('[SB] savePlantilla (delete):', del.error.message); return {ok:false}; }
    if (!gridData || !gridData.length) return {ok:true, count:0};
    const rows = gridData.map(function(g){
      return {local_id: localId, nombre: 'Principal', slot: g.slot, dia: g.dia, trabajador_id: g.trabajadorId};
    });
    const ins = await _sb.from('turno_plantillas').insert(rows);
    if (ins.error) { console.error('[SB] savePlantilla (insert):', ins.error.message); return {ok:false}; }
    return {ok:true, count: rows.length};
  }catch(e){
    console.error('[SB] savePlantilla:', e);
    return {ok:false};
  }
}

/**
 * loadPlantilla(localId, semanaInicio, workers)
 *
 * Carga la plantilla 'Principal' de este local desde Supabase y filtra cada
 * fila contra el estado real de la semana que se va a rellenar (semanaInicio,
 * el lunes de esa semana en formato 'YYYY-MM-DD'):
 *   - Trabajador no encontrado en `workers` → ignorado (cubre tanto
 *     archivados como trabajadores borrados: turnos.js ya excluye los
 *     archivados de L().staff, así que "no aparece en workers" y
 *     "está archivado" son la misma condición vista desde aquí — no hace
 *     falta comprobar un campo `archivado` aparte).
 *   - Trabajador de vacaciones ese día concreto de esa semana → ignorado.
 *   - Trabajador con ese día/turno marcado como no disponible → ignorado.
 *
 * `workers` es la misma lista que expone L().staff en turnos.js: cada
 * trabajador ya trae `.vacaciones` y `.unavailMed`/`.unavailNoch` propios,
 * así que no hace falta pasar `vacaciones`/`disponibilidad` como
 * parámetros aparte — sería la misma información duplicada dos veces.
 *
 * @param {string} localId
 * @param {string} semanaInicio - Lunes de la semana destino, 'YYYY-MM-DD'.
 * @param {Array<Object>} workers - L().staff: cada uno con _sbId, name,
 *   vacaciones, unavailMed, unavailNoch.
 * @returns {Promise<{ok:boolean, empty?:boolean, added?:Array<{slot:string,dia:number,trabajadorId:string,name:string}>, ignored?:number}>}
 *   empty=true si no había ninguna plantilla guardada todavía.
 */
async function loadPlantilla(localId, semanaInicio, workers){
  if (typeof _sb === 'undefined' || !_sb) { console.warn('[SB] loadPlantilla: sin conexión'); return {ok:false}; }
  try{
    const r = await _sb.from('turno_plantillas').select('slot,dia,trabajador_id').eq('local_id', localId).eq('nombre', 'Principal');
    if (r.error) { console.error('[SB] loadPlantilla:', r.error.message); return {ok:false}; }
    const rows = r.data || [];
    if (!rows.length) return {ok:true, empty:true, added:[], ignored:0};

    const monday = new Date(semanaInicio + 'T00:00:00Z');
    const added = [];
    let ignored = 0;

    rows.forEach(function(row){
      const w = workers.find(function(x){ return x._sbId === row.trabajador_id; });
      if (!w) { ignored++; return; } // archivado o ya no existe

      const dayDate = new Date(monday);
      dayDate.setUTCDate(monday.getUTCDate() + row.dia);
      const dayStr = dayDate.toISOString().split('T')[0];
      const onVac = (w.vacaciones || []).some(function(v){ return dayStr >= v.desde && dayStr <= v.hasta; });
      if (onVac) { ignored++; return; }

      const isMed = row.slot === 'sm' || row.slot === 'cm';
      const unavail = isMed ? (w.unavailMed || []) : (w.unavailNoch || []);
      if (unavail.includes(row.dia)) { ignored++; return; }

      added.push({slot: row.slot, dia: row.dia, trabajadorId: row.trabajador_id, name: w.name});
    });

    return {ok:true, added, ignored};
  }catch(e){
    console.error('[SB] loadPlantilla:', e);
    return {ok:false};
  }
}
