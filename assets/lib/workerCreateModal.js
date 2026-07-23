/* workerCreateModal.js — Modal "Nuevo trabajador", componente compartido.
   Antes existían dos implementaciones separadas y con comportamiento
   distinto (Admin creaba el trabajador activo=false pendiente de
   invitación con validación de teléfono/duplicados; Turnos lo creaba
   activo=true sin esas validaciones) — dos formularios casi idénticos
   mantenidos por separado, con el riesgo de que un cambio en uno se
   olvidara en el otro. Este archivo es la única fuente de verdad: ambas
   páginas llaman a openWorkerCreateModal(), nunca construyen su propio
   modal de alta.

   Inyecta su propio HTML/CSS en el DOM al cargar (mismo patrón que
   assets/lib/worker-modal.js — así no hace falta mantener el markup del
   modal duplicado en lagaleria_admin.html y lagaleria_turnos.html).

   Requiere en el ámbito de página: _sb, LOCAL_ID (supabase-client.js),
   showToast (toast.js en Admin, propio en Turnos — ambas firmas aceptan
   showToast(mensaje) con un solo argumento). */

/**
 * openWorkerCreateModal(onSuccess)
 *
 * Abre el modal de alta de trabajador. Al guardar con éxito:
 *   1. Valida que el nombre no esté vacío (toast si falta).
 *   2. Valida que no exista ya un trabajador con ese nombre en L().staff o
 *      _trabWorkers, si alguno de los dos existe en la página — evita el
 *      caso real de dos trabajadores con el mismo nombre, que rompe las
 *      búsquedas por nombre que se usan en todo el resto de la app
 *      (getW(), _nombreToId, etc.). No es parte del formulario original de
 *      ninguna de las dos páginas por separado, pero ambas ya lo hacían.
 *   3. INSERT en `trabajadores` con activo=false, must_change_pin=true,
 *      archivado=false (pendiente de invitación, sea cual sea la página
 *      desde la que se cree).
 *   4. Llama a onSuccess(trabajador) con el trabajador ya mapeado al shape
 *      común que usan tanto _trabWorkers (Admin) como L().staff (Turnos):
 *      {id, _sbId, name, sec, tel, email, photo, prioridad, minT, maxT,
 *       activo, archivado, pinHash, mustChangePin, rol, disponible,
 *       visible, skills, unavailMed, unavailNoch, vacaciones, notas}.
 *   5. Cierra el modal y muestra el toast "Trabajador creado ✓".
 *
 * @param {(trabajador: object) => void} onSuccess - Se llama tras el
 *   INSERT correcto; cada página decide ahí cómo integrar el trabajador
 *   nuevo en su propio estado (empujarlo a una lista, refrescar un grid...).
 */
function openWorkerCreateModal(onSuccess){
  _wcmEnsureDom();
  _wcmOnSuccess = onSuccess;
  document.getElementById('wcm-nombre').value = '';
  document.getElementById('wcm-tel').value = '';
  document.getElementById('wcm-rol').value = 'empleado';
  document.querySelectorAll('.wcm-sec-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.sec==='sala'); });
  document.getElementById('wcm-submit').disabled = false;
  if (typeof showOv === 'function') showOv('ov-worker-create');
  else document.getElementById('ov-worker-create').classList.add('show');
}

var _wcmOnSuccess = null;

function _wcmSetSec(btn){
  document.querySelectorAll('.wcm-sec-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
}

function _wcmClose(){
  var ov = document.getElementById('ov-worker-create');
  if (typeof closeOv === 'function') closeOv('ov-worker-create');
  else if (ov) ov.classList.remove('show');
}

async function _wcmSubmit(){
  var nombre = document.getElementById('wcm-nombre').value.trim();
  var tel = document.getElementById('wcm-tel').value.trim();
  var rol = document.getElementById('wcm-rol').value;
  var secBtn = document.querySelector('.wcm-sec-btn.active');
  var sec = secBtn ? secBtn.dataset.sec : 'sala';

  if (!nombre) { if (typeof showToast==='function') showToast('Introduce el nombre'); return; }

  var existing = (typeof L==='function' && L().staff) ? L().staff : (typeof _trabWorkers!=='undefined' ? _trabWorkers : []);
  var dup = existing.find(function(w){ return w.name.toLowerCase()===nombre.toLowerCase(); });
  if (dup) { if (typeof showToast==='function') showToast('Ya existe un trabajador llamado '+nombre); return; }

  if (typeof _sb==='undefined' || !_sb) { if (typeof showToast==='function') showToast('Sin conexión'); return; }

  var submitBtn = document.getElementById('wcm-submit');
  submitBtn.disabled = true;
  var payload = {
    local_id: LOCAL_ID,
    nombre: nombre,
    tel: tel || null,
    seccion: sec,
    rol: rol,
    activo: false,
    must_change_pin: true,
    archivado: false,
  };
  var res = await _sb.from('trabajadores').insert(payload).select().single();
  submitBtn.disabled = false;
  if (res.error) {
    console.error('[SB] workerCreateModal insert:', res.error.message);
    if (typeof showToast==='function') showToast('Error al crear trabajador');
    return;
  }
  var data = res.data;
  var trabajador = {
    id: data.id, _sbId: data.id,
    name: nombre, sec: sec, tel: tel || '', email: '', photo: null,
    prioridad: 'eventual',
    minT: data.min_turnos != null ? data.min_turnos : 0,
    maxT: data.max_turnos != null ? data.max_turnos : 0,
    activo: false, archivado: false, pinHash: null, mustChangePin: true,
    rol: rol, disponible: true, visible: true,
    skills: {}, unavailMed: [], unavailNoch: [], vacaciones: [], notas: [],
  };
  if (typeof _wcmOnSuccess === 'function') _wcmOnSuccess(trabajador);
  _wcmClose();
  if (typeof showToast==='function') showToast('Trabajador creado ✓');
}

function _wcmEnsureDom(){
  if (!document.getElementById('worker-create-modal-css')) {
    var st = document.createElement('style');
    st.id = 'worker-create-modal-css';
    st.textContent =
      '#ov-worker-create .wcm-fld{margin-bottom:12px}' +
      '#ov-worker-create .wcm-lbl{display:block;font-size:11px;font-weight:600;color:var(--dim);margin-bottom:5px;text-transform:uppercase;letter-spacing:.4px}' +
      '#ov-worker-create .wcm-input{width:100%;background:var(--nav);border:1px solid var(--border2);border-radius:8px;padding:10px 12px;color:var(--text);font-size:13px;outline:none}' +
      '#ov-worker-create .wcm-input:focus{border-color:var(--acc)}' +
      '#ov-worker-create select.wcm-input{cursor:pointer}' +
      '#ov-worker-create .wcm-sec-row{display:flex;gap:6px}' +
      '#ov-worker-create .wcm-sec-btn{flex:1;padding:9px 4px;border-radius:8px;border:1px solid var(--border2);background:var(--nav);color:var(--dim);font-size:12px;font-weight:600;cursor:pointer;text-align:center}' +
      '#ov-worker-create .wcm-sec-btn.active{background:rgba(197,166,105,.15);border-color:var(--acc);color:var(--acc)}' +
      '#ov-worker-create .wcm-submit{width:100%;margin-top:6px;padding:12px;border-radius:10px;border:none;background:var(--acc);color:#1a1810;font-size:13px;font-weight:700;cursor:pointer}' +
      '#ov-worker-create .wcm-submit:disabled{opacity:.6;cursor:default}';
    document.head.appendChild(st);
  }
  if (document.getElementById('ov-worker-create')) return;
  document.body.insertAdjacentHTML('beforeend',
`<div class="overlay" id="ov-worker-create">
  <div class="modal">
    <div class="modal-hdr">
      <div><div class="modal-title">Nuevo trabajador</div></div>
      <button class="mclose" onclick="_wcmClose()">&#215;</button>
    </div>
    <div class="wcm-fld">
      <label class="wcm-lbl">Nombre completo</label>
      <input class="wcm-input" id="wcm-nombre" type="text" placeholder="Nombre...">
    </div>
    <div class="wcm-fld">
      <label class="wcm-lbl">Teléfono <span style="text-transform:none;font-weight:400">(opcional)</span></label>
      <input class="wcm-input" id="wcm-tel" type="tel" placeholder="+34 600 000 000">
    </div>
    <div class="wcm-fld">
      <label class="wcm-lbl">Sección</label>
      <div class="wcm-sec-row">
        <button type="button" class="wcm-sec-btn active" data-sec="sala" onclick="_wcmSetSec(this)">🍺 Sala</button>
        <button type="button" class="wcm-sec-btn" data-sec="cocina" onclick="_wcmSetSec(this)">🍳 Cocina</button>
        <button type="button" class="wcm-sec-btn" data-sec="ambos" onclick="_wcmSetSec(this)">✦ Ambos</button>
      </div>
    </div>
    <div class="wcm-fld" style="margin-bottom:4px">
      <label class="wcm-lbl">Rol</label>
      <select class="wcm-input" id="wcm-rol">
        <option value="empleado">Empleado</option>
        <option value="encargado">Encargado</option>
        <option value="admin">Admin</option>
      </select>
    </div>
    <button type="button" class="wcm-submit" id="wcm-submit" onclick="_wcmSubmit()">Crear trabajador</button>
  </div>
</div>`);
}
