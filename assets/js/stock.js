const STORAGE_KEY = 'lagaleria_stock_data'
let prods = []

function getStockUser() {
  if (typeof currentUser !== 'undefined') return currentUser
  if (window.parent && window.parent.currentUser) return window.parent.currentUser
  return null
}

function normCat(v) {
  if (!v) return 'ali'
  const map = { bebidas:'beb', alimentacion:'ali', 'alimentación':'ali', limpieza:'lim', material:'mat' }
  return map[v.toLowerCase()] || v
}
function normLoc(v) {
  if (!v) return 'd'
  const map = { despensa:'d', almacen:'d', 'almacén':'d', garaje:'g', ambos:'a' }
  return map[v.toLowerCase()] || v
}

let pedido = []
let activeTab = 'inv'
let activeCat = 'all'
let editProdId = null
let invMode = false

const el = {
  prodList:      document.getElementById('prod-list'),
  invBanner:     document.getElementById('inv-banner'),
  repCount:      document.getElementById('rep-count'),
  invStatusLbl:  document.getElementById('inv-status-lbl'),
  invDot:        document.getElementById('inv-dot'),
  btnInv:        document.getElementById('btn-inv'),
  pedContent:    document.getElementById('ped-content'),
  regTotalLbl:   document.getElementById('reg-total-lbl'),
  regList:       document.getElementById('reg-list'),
  toast:         document.getElementById('toast'),
  modalBg:       document.getElementById('modal-bg'),
  editSheetBg:   document.getElementById('edit-sheet-bg'),
  oneoffModalBg: document.getElementById('oneoff-modal-bg'),
  confirmDelBg:  document.getElementById('confirm-del-bg'),
  confirmDelName:document.getElementById('confirm-del-name'),
  btnClearReg:   document.getElementById('btn-clear-reg'),
  confirmRegBg:  document.getElementById('confirm-reg-bg'),
}

const inputs = {
  npName: document.getElementById('np-n'),
  npCat:  document.getElementById('np-c'),
  npLoc:  document.getElementById('np-l'),
  npQty:  document.getElementById('np-q'),
  npUnit: document.getElementById('np-u'),
  npMin:  document.getElementById('np-m'),
  npNote: document.getElementById('np-no'),

  epName: document.getElementById('ep-n'),
  epCat:  document.getElementById('ep-c'),
  epLoc:  document.getElementById('ep-l'),
  epMin:  document.getElementById('ep-m'),
  epUnit: document.getElementById('ep-u'),
  epNote: document.getElementById('ep-no'),

  ooName: document.getElementById('oo-n'),
  ooQty:  document.getElementById('oo-q'),
  ooUnit: document.getElementById('oo-u'),
}

const prefs = {
  categories: {
    beb: { label: 'Bebidas',       emoji: '🍺' },
    ali: { label: 'Alimentación',  emoji: '🥩' },
    lim: { label: 'Limpieza',      emoji: '🧴' },
    mat: { label: 'Material',      emoji: '📦' },
  },
  locations: {
    d: { label: 'Almacén', color: 'loc-d' },
    g: { label: 'Garaje',   color: 'loc-g' },
    a: { label: 'Ambos',    color: 'loc-a' },
  },
}

/* ─── Supabase ↔ local field mapping ─── */
function sbToLocal(r) {
  return {
    id:      r.id,
    name:    r.nombre,
    cat:     normCat(r.categoria),
    loc:     normLoc(r.ubicacion),
    qty:     r.cantidad  ?? 0,
    min:     r.minimo    ?? 0,
    unit:    r.unidad    || '',
    note:    r.nota      || '',
    updated: Date.now(),
  }
}

/* ─── Init ─── */
async function initStock() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed.pedido)) pedido = parsed.pedido
    }
  } catch(e) {}

  try {
    const { data, error } = await _sb.from('productos')
      .select('*')
      .eq('local_id', LOCAL_ID)
      .eq('activo', true)
      .order('categoria').order('nombre')
    if (error) throw error
    prods = (data || []).map(sbToLocal)
  } catch(e) {
    console.error('[stock] initStock:', e)
    showToast('Error al cargar productos')
  }

  applyRolePermissions()
  renderTab(activeTab)
  setCat(activeCat)
  updateInventoryStatus()
}

/* ─── Permisos por rol ─── */
function applyRolePermissions() {
  const rol = getStockUser()?.rol
  if (rol === 'empleado') {
    const tabReg = document.getElementById('tab-reg')
    if (tabReg) tabReg.style.display = 'none'
  }
  if (rol !== 'admin' && rol !== 'superadmin') {
    if (el.btnClearReg) el.btnClearReg.style.display = 'none'
  }
}

/* ─── Tab / Cat ─── */
function renderTab(tab) {
  activeTab = tab
  document.getElementById('tab-inv').classList.toggle('act', tab === 'inv')
  document.getElementById('tab-ped').classList.toggle('act', tab === 'ped')
  document.getElementById('tab-reg').classList.toggle('act', tab === 'reg')
  document.getElementById('view-inv').style.display = tab === 'inv' ? 'block' : 'none'
  document.getElementById('view-ped').style.display = tab === 'ped' ? 'block' : 'none'
  document.getElementById('view-reg').style.display = tab === 'reg' ? 'block' : 'none'
  if (tab === 'inv') renderInventory()
  if (tab === 'ped') renderPedido()
  if (tab === 'reg') renderRegistro()
}

function setTab(tab) { renderTab(tab) }

function setCat(cat, button) {
  activeCat = cat
  document.querySelectorAll('.cpill').forEach(el => el.classList.remove('act'))
  if (button) button.classList.add('act')
  renderInventory()
}

/* ─── Inventory render ─── */
function renderInventory() {
  const filtered = activeCat === 'rep'
    ? prods.filter(p => p.qty <= p.min)
    : prods.filter(p => activeCat === 'all' || p.cat === activeCat)
  el.prodList.innerHTML = filtered.map(renderProduct).join('') ||
    '<div class="ped-empty"><div class="ped-empty-icon">📦</div><div class="ped-empty-title">No hay productos</div><div class="ped-empty-sub">Usa el botón + para agregar un producto.</div></div>'
  updateReorderCount()
}

function renderProduct(prod) {
  const category   = prefs.categories[prod.cat]
  const location   = prefs.locations[prod.loc]
  const statusClass = prod.qty <= prod.min ? 'red' : prod.qty <= prod.min * 2 ? 'amb' : 'grn'
  return `
    <div class="prod ${statusClass}">
      <div class="prod-sema-col">
        <span class="sema ${statusClass}"></span>
        <span class="cat-emoji">${category?.emoji || '❓'}</span>
      </div>
      <div class="prod-info">
        <div class="prod-name prod-name-link" onclick="openEdit('${prod.id}')">${prod.name}</div>
        <div class="prod-meta">
          <span class="cat-badge">${category?.label || 'Sin cat.'}</span>
          <span class="loc-badge ${location?.color || 'loc-a'}">${location?.label || 'Otro'}</span>
          <span class="prod-min">Mín ${prod.min} ${prod.unit}</span>
          ${prod.note ? `<span class="prod-note">${prod.note}</span>` : ''}
        </div>
      </div>
      <div class="stepper">
        <button class="sbtn" onclick="adjustQty('${prod.id}', -1)">−</button>
        <div class="sval">
          <span class="sval-num">${prod.qty}</span>
          <span class="sval-unit">${prod.unit}</span>
        </div>
        <button class="sbtn" onclick="adjustQty('${prod.id}', 1)">+</button>
      </div>
    </div>
  `
}

/* ─── adjustQty — persiste cantidad + registra movimiento en Supabase ─── */
async function adjustQty(id, delta) {
  const prod = prods.find(item => item.id === id)
  if (!prod) return
  const newQty = Math.max(0, prod.qty + delta)
  prod.qty = newQty
  prod.updated = Date.now()
  saveState()
  renderInventory()
  const quien = getStockUser()?.nombre || 'Sistema'
  const tipo  = invMode ? 'inventario' : 'ajuste'
  try {
    await Promise.all([
      _sb.from('productos').update({ cantidad: newQty }).eq('id', id),
      _sb.from('stock_movimientos').insert({ producto_id: id, delta, tipo, quien }),
    ])
  } catch(e) {
    console.error('[stock] adjustQty:', e)
    showToast('Error al guardar')
  }
}

/* ─── Inventory mode ─── */
function toggleInv() {
  invMode = !invMode
  el.invBanner.classList.toggle('show', invMode)
  el.btnInv.classList.toggle('active', invMode)
}
function cancelInv() {
  invMode = false
  el.invBanner.classList.remove('show')
  el.btnInv.classList.remove('active')
}
function saveInv() {
  invMode = false
  el.invBanner.classList.remove('show')
  el.btnInv.classList.remove('active')
  showToast('Inventario guardado')
}

function updateReorderCount() {
  const count = prods.filter(p => p.qty <= p.min).length
  el.repCount.textContent = count || ''
  el.repCount.classList.toggle('show', count > 0)
}

function updateInventoryStatus() {
  if (!prods.length) { el.invStatusLbl.textContent = 'Aún no hay inventario'; el.invDot.classList.remove('active'); return }
  const lastUpdate = new Date(Math.max(...prods.map(p => p.updated || 0)))
  el.invStatusLbl.textContent = `Último inventario: hoy ${lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
  el.invDot.classList.add('active')
}

/* ─── Add product modal ─── */
function showModal() { el.modalBg.classList.add('show') }
function hideModal()  { el.modalBg.classList.remove('show'); resetNewProductForm() }
function resetNewProductForm() {
  inputs.npName.value = ''
  inputs.npCat.value  = 'beb'
  inputs.npLoc.value  = 'd'
  inputs.npQty.value  = ''
  inputs.npUnit.value = ''
  inputs.npMin.value  = ''
  inputs.npNote.value = ''
}

async function addProd() {
  const name = inputs.npName.value.trim()
  const qty  = Number(inputs.npQty.value)
  const min  = Number(inputs.npMin.value)
  const unit = inputs.npUnit.value.trim()
  if (!name || !unit || Number.isNaN(qty)) { showToast('Completa nombre, cantidad y unidad'); return }
  const payload = {
    local_id:  LOCAL_ID,
    nombre:    name,
    categoria: inputs.npCat.value,
    ubicacion: inputs.npLoc.value,
    cantidad:  qty,
    minimo:    Number.isNaN(min) ? 0 : min,
    unidad:    unit,
    nota:      inputs.npNote.value.trim(),
    activo:    true,
  }
  try {
    const { data, error } = await _sb.from('productos').insert(payload).select('*').single()
    if (error) throw error
    prods.unshift(sbToLocal(data))
    renderInventory()
    hideModal()
    showToast('Producto añadido')
  } catch(e) {
    console.error('[stock] addProd:', e)
    showToast('Error al añadir producto')
  }
}

/* ─── Edit product sheet ─── */
function openEdit(id) {
  const prod = prods.find(item => item.id === id)
  if (!prod) return
  editProdId = id
  inputs.epName.value = prod.name
  inputs.epCat.value  = prod.cat
  inputs.epLoc.value  = prod.loc
  inputs.epMin.value  = prod.min
  inputs.epUnit.value = prod.unit
  inputs.epNote.value = prod.note
  el.editSheetBg.classList.add('show')
}
function closeEditSheet() { editProdId = null; el.editSheetBg.classList.remove('show') }

async function saveEditProd() {
  const prod = prods.find(item => item.id === editProdId)
  if (!prod) return
  const name = inputs.epName.value.trim()
  const min  = Number(inputs.epMin.value)
  const unit = inputs.epUnit.value.trim()
  if (!name || !unit) { showToast('Completa nombre y unidad'); return }
  const payload = {
    nombre:    name,
    categoria: inputs.epCat.value,
    ubicacion: inputs.epLoc.value,
    minimo:    Number.isNaN(min) ? 0 : min,
    unidad:    unit,
    nota:      inputs.epNote.value.trim(),
  }
  try {
    const { error } = await _sb.from('productos').update(payload).eq('id', editProdId)
    if (error) throw error
    Object.assign(prod, { name: payload.nombre, cat: payload.categoria, loc: payload.ubicacion, min: payload.minimo, unit: payload.unidad, note: payload.nota, updated: Date.now() })
    renderInventory()
    closeEditSheet()
    showToast('Producto actualizado')
  } catch(e) {
    console.error('[stock] saveEditProd:', e)
    showToast('Error al guardar cambios')
  }
}

/* ─── Delete product (soft delete via activo=false) ─── */
function deleteProd() {
  if (!editProdId) return
  const prod = prods.find(p => p.id === editProdId)
  if (el.confirmDelBg && el.confirmDelName) {
    el.confirmDelName.textContent = prod?.name || ''
    el.confirmDelBg.classList.add('show')
  } else {
    confirmDelProd()
  }
}
function closeConfirmDel() { el.confirmDelBg?.classList.remove('show') }
async function confirmDelProd() {
  closeConfirmDel()
  closeEditSheet()
  if (!editProdId) return
  const id = editProdId
  editProdId = null
  try {
    const { error } = await _sb.from('productos').update({ activo: false }).eq('id', id)
    if (error) throw error
    prods = prods.filter(item => item.id !== id)
    renderInventory()
    showToast('Producto eliminado')
  } catch(e) {
    console.error('[stock] deleteProd:', e)
    showToast('Error al eliminar producto')
  }
}

/* ─── Pedido — auto-detecta críticos + one-offs manuales ─── */
function renderPedido() {
  const critical = prods.filter(p => p.qty <= p.min)
  const allItems = [...critical, ...pedido]
  if (!allItems.length) {
    el.pedContent.innerHTML = '<div class="ped-empty"><div class="ped-empty-icon">🛒</div><div class="ped-empty-title">Todo en orden</div><div class="ped-empty-sub">Los productos por debajo de su mínimo aparecerán aquí automáticamente.</div></div>'
    return
  }
  el.pedContent.innerHTML = allItems.map(item => `
    <div class="ped-item red">
      <div class="ped-item-left">
        <div class="ped-name">${item.name}</div>
        <div class="ped-detail">${item.qty} ${item.unit} · Mín ${item.min} ${item.unit}</div>
      </div>
      <div class="ped-tag red">${item.qty}/${item.min} ${item.unit}</div>
    </div>
  `).join('')
}

/* ─── Registro — carga desde Supabase, agrupa por quien + día ─── */
async function renderRegistro() {
  const rol       = getStockUser()?.rol
  const canDelete = rol === 'admin' || rol === 'superadmin'

  el.regList.innerHTML = '<div class="reg-loading">Cargando registro...</div>'
  el.regTotalLbl.textContent = ''

  if (!prods.length) {
    el.regList.innerHTML = '<div class="reg-empty"><div class="reg-empty-icon">📝</div><div class="reg-empty-title">Sin registro</div><div class="reg-empty-sub">Los ajustes de inventario aparecerán aquí.</div></div>'
    return
  }

  let rows = []
  try {
    const prodIds = prods.map(p => p.id)
    const { data, error } = await _sb
      .from('stock_movimientos')
      .select('id, producto_id, delta, tipo, quien, created_at, productos(nombre, unidad)')
      .in('producto_id', prodIds)
      .order('created_at', { ascending: false })
    if (error) throw error
    rows = data || []
  } catch(e) {
    console.error('[stock] renderRegistro:', e)
    el.regList.innerHTML = '<div class="reg-empty"><div class="reg-empty-icon">⚠</div><div class="reg-empty-title">Error al cargar</div><div class="reg-empty-sub">No se pudo conectar con el servidor.</div></div>'
    return
  }

  if (!rows.length) {
    el.regList.innerHTML = '<div class="reg-empty"><div class="reg-empty-icon">📝</div><div class="reg-empty-title">Sin movimientos</div><div class="reg-empty-sub">Los ajustes de inventario aparecerán aquí.</div></div>'
    el.regTotalLbl.textContent = '0 movimientos'
    return
  }

  /* Agrupar por fecha + quien */
  const groups = new Map()
  for (const row of rows) {
    const date = row.created_at.slice(0, 10)
    const key  = `${date}|||${row.quien}`
    if (!groups.has(key)) groups.set(key, { quien: row.quien, date, ids: [], movs: [] })
    const g = groups.get(key)
    g.ids.push(row.id)
    g.movs.push(row)
  }

  const sortedGroups = [...groups.values()].sort((a, b) => {
    if (b.date !== a.date) return b.date > a.date ? 1 : -1
    return a.quien.localeCompare(b.quien, 'es')
  })

  el.regList.innerHTML = sortedGroups.map(g => {
    const initials  = g.quien.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
    const dateLabel = formatDateLabel(g.date)
    const delBtn    = canDelete
      ? `<button class="reg-del-card" data-ids="${g.ids.join(',')}" onclick="deleteRegCard(this)" title="Borrar esta card">✕</button>`
      : ''
    const movLines  = g.movs.map(m => {
      const time  = new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      const pname = m.productos?.nombre || 'Producto'
      const unit  = m.productos?.unidad || ''
      const sign  = m.delta > 0 ? '+' : ''
      const cls   = m.delta >= 0 ? 'pos' : 'neg'
      return `<div class="reg-mov">
        <span class="reg-mov-time">${time}</span>
        <span class="reg-mov-prod">${pname}</span>
        <span class="reg-mov-delta ${cls}">${sign}${m.delta} ${unit}</span>
      </div>`
    }).join('')

    return `<div class="reg-person">
      <div class="reg-person-hdr">
        <div class="reg-av">${initials}</div>
        <div class="reg-person-info">
          <div class="reg-person-name">${g.quien}</div>
          <div class="reg-person-time">${dateLabel} · ${g.movs.length} mov.</div>
        </div>
        ${delBtn}
      </div>
      ${movLines}
    </div>`
  }).join('')

  el.regTotalLbl.textContent = `${rows.length} movimientos`
}

function formatDateLabel(dateStr) {
  const today     = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (dateStr === today)     return 'Hoy'
  if (dateStr === yesterday) return 'Ayer'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
}

/* ─── Borrar una card (persona + día) ─── */
async function deleteRegCard(btn) {
  const ids = btn.dataset.ids.split(',').filter(Boolean)
  if (!ids.length) return
  btn.disabled = true
  try {
    const { error } = await _sb.from('stock_movimientos').delete().in('id', ids)
    if (error) throw error
    showToast('Movimientos eliminados')
    await renderRegistro()
  } catch(e) {
    console.error('[stock] deleteRegCard:', e)
    btn.disabled = false
    showToast('Error al borrar')
  }
}

/* ─── Borrar todo el registro ─── */
function clearReg() {
  if (el.confirmRegBg) el.confirmRegBg.classList.add('show')
}
function closeClearRegConfirm() {
  if (el.confirmRegBg) el.confirmRegBg.classList.remove('show')
}
async function confirmClearReg() {
  closeClearRegConfirm()
  const prodIds = prods.map(p => p.id)
  if (!prodIds.length) { showToast('No hay movimientos que borrar'); return }
  try {
    const { error } = await _sb.from('stock_movimientos').delete().in('producto_id', prodIds)
    if (error) throw error
    showToast('Registro borrado')
    await renderRegistro()
  } catch(e) {
    console.error('[stock] confirmClearReg:', e)
    showToast('Error al borrar el registro')
  }
}

/* ─── One-off pedido ─── */
function addOneoff() {
  const name = inputs.ooName.value.trim()
  const qty  = Number(inputs.ooQty.value)
  const unit = inputs.ooUnit.value.trim()
  if (!name || !unit || Number.isNaN(qty) || qty <= 0) { showToast('Completa nombre, cantidad y unidad'); return }
  pedido.push({ id: `o_${Date.now()}`, name, qty, min: 0, unit, cat: 'ali' })
  el.oneoffModalBg.classList.remove('show')
  inputs.ooName.value = ''
  inputs.ooQty.value  = ''
  inputs.ooUnit.value = ''
  saveState()
  renderPedido()
  showToast('Artículo añadido al pedido')
}
function closeOneoffModal() { el.oneoffModalBg.classList.remove('show') }

/* ─── Toast ─── */
function showToast(message) {
  el.toast.textContent = message
  el.toast.classList.add('show')
  clearTimeout(showToast.timeout)
  showToast.timeout = setTimeout(() => el.toast.classList.remove('show'), 1600)
}

/* ─── saveState — solo persiste pedido (productos y movimientos van a Supabase) ─── */
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ pedido })) } catch(e) {}
  updateInventoryStatus()
}

window.addEventListener('DOMContentLoaded', initStock)
