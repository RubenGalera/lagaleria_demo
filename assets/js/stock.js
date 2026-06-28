let prods   = []
let oneoffs = []

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

let activeTab      = 'inv'
let activeCat      = 'all'
let editProdId     = null
let invMode        = false
let regFilter      = 'all'
let regLoadedCount = 0

const el = {
  prodList:      document.getElementById('prod-list'),
  invBanner:     document.getElementById('inv-banner'),
  repCount:      document.getElementById('rep-count'),
  invStatusLbl:  document.getElementById('inv-status-lbl'),
  invDot:        document.getElementById('inv-dot'),
  btnInv:        document.getElementById('btn-inv'),
  pedContent:    document.getElementById('ped-content'),
  pedDot:        document.getElementById('ped-dot'),
  regTotalLbl:   document.getElementById('reg-total-lbl'),
  regList:       document.getElementById('reg-list'),

  modalBg:       document.getElementById('modal-bg'),
  editSheetBg:   document.getElementById('edit-sheet-bg'),
  oneoffModalBg: document.getElementById('oneoff-modal-bg'),
  confirmDelBg:  document.getElementById('confirm-del-bg'),
  confirmDelName:document.getElementById('confirm-del-name'),
  btnClearReg:   document.getElementById('btn-clear-reg'),
  confirmRegBg:  document.getElementById('confirm-reg-bg'),
  confirmRegMsg: document.getElementById('confirm-reg-msg'),
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
    const { data, error } = await _sb.from('productos')
      .select('*')
      .eq('local_id', LOCAL_ID)
      .eq('activo', true)
      .order('categoria').order('nombre')
    if (error) throw error
    prods = (data || []).map(sbToLocal)
  } catch(e) {
    console.error('[stock] initStock:', e)
    toast('Error al cargar productos')
  }

  await sbLoadProductosPuntuales()
  applyRolePermissions()
  renderTab(activeTab)
  setCat(activeCat)
  updateInventoryStatus()
  updatePedDot()
  updateSinCatChip()
}

/* ─── Permisos por rol ─── */
function applyRolePermissions() {
  const rol = getStockUser()?.rol
  if (rol === 'empleado') {
    const tabReg = document.getElementById('tab-reg')
    if (tabReg) tabReg.style.display = 'none'
  }
  if (el.btnClearReg) {
    el.btnClearReg.style.display = (rol === 'admin' || rol === 'superadmin') ? '' : 'none'
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
  if (tab === 'ped') initPedido()
  if (tab === 'reg') renderRegistro()
}

function setTab(tab) { renderTab(tab) }
function goToSection(section){ if(typeof setTab==='function') setTab(section); }

function setCat(cat, button) {
  activeCat = cat
  document.querySelectorAll('.cpill').forEach(el => el.classList.remove('act'))
  if (button) button.classList.add('act')
  renderInventory()
}

/* ─── Inventory render ─── */
function renderInventory() {
  const EMPTY = '<div class="ped-empty"><div class="ped-empty-icon">📦</div><div class="ped-empty-title">No hay productos</div><div class="ped-empty-sub">Usa el botón + para agregar un producto.</div></div>'
  const knownCats = new Set(Object.keys(prefs.categories))

  if (activeCat === 'rep') {
    const items = prods.filter(isPendingForOrderView)
      .slice().sort((a, b) => a.name.localeCompare(b.name, 'es'))
    el.prodList.innerHTML = items.map(renderProduct).join('') || EMPTY
    updateReorderCount()
    return
  }

  if (activeCat === 'sin-cat') {
    const items = prods.filter(p => !knownCats.has(p.cat))
      .slice().sort((a, b) => a.name.localeCompare(b.name, 'es'))
    el.prodList.innerHTML = items.map(renderProduct).join('') || EMPTY
    updateReorderCount()
    return
  }

  if (activeCat !== 'all') {
    const items = prods.filter(p => p.cat === activeCat)
      .slice().sort((a, b) => a.name.localeCompare(b.name, 'es'))
    el.prodList.innerHTML = items.map(renderProduct).join('') || EMPTY
    updateReorderCount()
    return
  }

  let html = ''
  for (const [cat, catInfo] of Object.entries(prefs.categories)) {
    const items = prods.filter(p => p.cat === cat)
      .slice().sort((a, b) => a.name.localeCompare(b.name, 'es'))
    if (!items.length) continue
    html += `<div class="sec-hdr"><div class="sec-lbl">${catInfo.emoji} ${catInfo.label.toUpperCase()}</div><div class="sec-line"></div></div>`
    html += items.map(renderProduct).join('')
  }
  const sinCatItems = prods.filter(p => !knownCats.has(p.cat))
    .slice().sort((a, b) => a.name.localeCompare(b.name, 'es'))
  if (sinCatItems.length) {
    html += `<div class="sec-hdr"><div class="sec-lbl">❓ SIN CATEGORÍA</div><div class="sec-line"></div></div>`
    html += sinCatItems.map(renderProduct).join('')
  }
  el.prodList.innerHTML = html || EMPTY
  updateReorderCount()
}

function renderProduct(prod) {
  const location    = prefs.locations[prod.loc]
  const statusClass = getStockStatus(prod.qty, prod.min)
  return `
    <div class="prod ${statusClass}">
      <div class="prod-sema-col">
        <span class="sema ${statusClass}"></span>
      </div>
      <div class="prod-info">
        <div class="prod-name prod-name-link" onclick="openEdit('${prod.id}')">${prod.name}</div>
        <div class="prod-meta">
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
  markStockActivity(prod.id)
  updateInventoryStatus()
  renderInventory()
  updatePedDot()
  if (activeTab === 'ped') renderPedido()
  const quien = getStockUser()?.nombre || 'Sistema'
  const tipo  = invMode ? 'inventario' : 'ajuste'
  try {
    await Promise.all([
      _sb.from('productos').update({ cantidad: newQty }).eq('id', id),
      _sb.from('stock_movimientos').insert({ producto_id: id, delta, tipo, quien }),
    ])
  } catch(e) {
    console.error('[stock] adjustQty:', e)
    toast('Error al guardar')
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
  toast('Inventario guardado')
}

function updateSinCatChip() {
  const bar = document.getElementById('cat-bar')
  if (!bar) return
  const knownCats = new Set(Object.keys(prefs.categories))
  const hasSinCat = prods.some(p => !knownCats.has(p.cat))
  let chip = bar.querySelector('[data-cat="sin-cat"]')
  if (hasSinCat && !chip) {
    chip = document.createElement('div')
    chip.className = 'cpill'
    chip.dataset.cat = 'sin-cat'
    chip.innerHTML = '❓ <span class="cpill-lbl">Sin categoría</span>'
    chip.addEventListener('click', () => setCat('sin-cat', chip))
    const repChip = bar.querySelector('.cpill-rep')
    if (repChip) bar.insertBefore(chip, repChip)
    else bar.appendChild(chip)
  } else if (!hasSinCat && chip) {
    chip.remove()
    if (activeCat === 'sin-cat') {
      activeCat = 'all'
      bar.querySelector('.cpill-all')?.classList.add('act')
      renderInventory()
    }
  }
}

function updateReorderCount() {
  const count = prods.filter(isPendingForOrderView).length
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
function showAddProdModal() { el.modalBg.classList.add('show') }
function hideAddProdModal() { el.modalBg.classList.remove('show'); resetNewProductForm() }
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
  if (!name || !unit || Number.isNaN(qty)) { toast('Completa nombre, cantidad y unidad'); return }
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
    updatePedDot()
    updateSinCatChip()
    if (activeTab === 'ped') renderPedido()
    hideAddProdModal()
    toast('Producto añadido')
  } catch(e) {
    console.error('[stock] addProd:', e)
    toast('Error al añadir producto')
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
  if (!name || !unit) { toast('Completa nombre y unidad'); return }
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
    updatePedDot()
    if (activeTab === 'ped') renderPedido()
    closeEditSheet()
    toast('Producto actualizado')
  } catch(e) {
    console.error('[stock] saveEditProd:', e)
    toast('Error al guardar cambios')
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
    updatePedDot()
    updateSinCatChip()
    if (activeTab === 'ped') renderPedido()
    toast('Producto eliminado')
  } catch(e) {
    console.error('[stock] deleteProd:', e)
    toast('Error al eliminar producto')
  }
}

/* ─── Pedido ─── */
async function initPedido() {
  await sbLoadProductosPuntuales()
  renderPedido()
}

function renderPedido() {
  const rol              = getStockUser()?.rol
  const canManageOneoffs = rol === 'encargado' || rol === 'admin' || rol === 'superadmin'
  const needsOrder       = prods.filter(isPendingForOrderView)

  const topButtons = `
    <button class="ped-send" onclick="sendPedidoWhatsApp()"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Enviar pedido por WhatsApp</button>
    ${canManageOneoffs ? `<button class="oneoff-btn" onclick="showOneoffModal()">+ Añadir producto puntual</button>` : ''}
  `

  let oneoffSectionHtml = ''
  if (oneoffs.length) {
    const items = oneoffs.map(o => `
      <div class="oneoff-item">
        <div>
          <div class="oneoff-name">${o.nombre}</div>
          <div class="oneoff-meta">${o.cantidad} ${o.unidad}${o.creado_por ? ` · por ${o.creado_por}` : ''}</div>
        </div>
        ${canManageOneoffs ? `<button class="oneoff-del" onclick="deleteOneoff('${o.id}')">✕</button>` : ''}
      </div>
    `).join('')
    oneoffSectionHtml = `
      <div class="oneoff-section-lbl">Productos puntuales</div>
      ${items}
    `
  }

  if (!needsOrder.length && !oneoffs.length) {
    el.pedContent.innerHTML = topButtons + `
      <div class="ped-empty">
        <div class="ped-empty-icon">🛒</div>
        <div class="ped-empty-title">¡Todo en orden!</div>
        <div class="ped-empty-sub">Los productos por reponer aparecerán aquí automáticamente.</div>
      </div>
    `
    return
  }

  const byCat = {}
  for (const p of needsOrder) {
    if (!byCat[p.cat]) byCat[p.cat] = []
    byCat[p.cat].push(p)
  }

  const catSections = Object.keys(prefs.categories)
    .filter(cat => byCat[cat])
    .map(cat => {
      const catInfo = prefs.categories[cat]
      const header = `
        <div class="sec-hdr">
          <div class="sec-lbl">${catInfo.emoji} ${catInfo.label.toUpperCase()}</div>
          <div class="sec-line"></div>
        </div>
      `
      const items = byCat[cat].slice().sort((a, b) => a.name.localeCompare(b.name, 'es')).map(p => {
        const st  = getStockStatus(p.qty, p.min)
        const loc = prefs.locations[p.loc] || { label: 'Otro' }
        const n   = Math.max(1, p.min - p.qty)
        return `
          <div class="ped-item ${st}">
            <div class="ped-item-left">
              <div class="ped-name">${p.name}</div>
              <div class="ped-detail">Tienes ${p.qty} ${p.unit} · mín. ${p.min} ${p.unit} · ${loc.label}</div>
            </div>
            <div class="ped-tag ${st}">+${n} ${p.unit}</div>
          </div>
        `
      }).join('')
      return header + items
    }).join('')

  el.pedContent.innerHTML = topButtons + oneoffSectionHtml + catSections
}

function updatePedDot() {
  const needsOrder = prods.filter(p => getStockStatus(p.qty, p.min) !== 'grn')
  const hasRed     = needsOrder.some(p => getStockStatus(p.qty, p.min) === 'red')
  const dot        = el.pedDot
  if (!dot) return
  dot.className = 'tab-dot'
  if (hasRed) {
    dot.classList.add('red')
  } else if (needsOrder.length > 0 || oneoffs.length > 0) {
    dot.classList.add('amb')
  }
}

function sendPedidoWhatsApp() {
  const needsOrder = prods.filter(p => getStockStatus(p.qty, p.min) !== 'grn')
  const lines = ['*Pedido La Galería*', '']

  if (oneoffs.length) {
    lines.push('_Puntuales:_')
    for (const o of oneoffs) lines.push(`• ${o.nombre}: ${o.cantidad} ${o.unidad}`)
    lines.push('')
  }

  const byCat = {}
  for (const p of needsOrder) {
    if (!byCat[p.cat]) byCat[p.cat] = []
    byCat[p.cat].push(p)
  }
  for (const cat of Object.keys(prefs.categories)) {
    if (!byCat[cat]) continue
    const catInfo = prefs.categories[cat]
    lines.push(`_${catInfo.emoji} ${catInfo.label}:_`)
    for (const p of byCat[cat]) {
      const n = Math.max(1, p.min - p.qty)
      lines.push(`• ${p.name}: +${n} ${p.unit}`)
    }
    lines.push('')
  }

  window.open(`https://wa.me/?text=${encodeURIComponent(lines.join('\n').trim())}`, '_blank')
}

function showOneoffModal()  { el.oneoffModalBg.classList.add('show') }
function closeOneoffModal() { el.oneoffModalBg.classList.remove('show') }

async function deleteOneoff(id) {
  try {
    await sbDeleteProductoPuntual(id)
    updatePedDot()
    renderPedido()
  } catch(e) {
    console.error('[stock] deleteOneoff:', e)
    toast('Error al eliminar')
  }
}

/* ─── Supabase — productos_puntuales ─── */
async function sbLoadProductosPuntuales() {
  try {
    const { data, error } = await _sb.from('productos_puntuales')
      .select('*')
      .eq('local_id', LOCAL_ID)
      .order('created_at', { ascending: true })
    if (error) throw error
    oneoffs = data || []
  } catch(e) {
    console.error('[stock] sbLoadProductosPuntuales:', e)
    oneoffs = []
  }
}

async function sbAddProductoPuntual(nombre, cantidad, unidad) {
  const quien = getStockUser()?.nombre || null
  const { data, error } = await _sb.from('productos_puntuales')
    .insert({ local_id: LOCAL_ID, nombre, cantidad, unidad, creado_por: quien })
    .select('*')
    .single()
  if (error) throw error
  oneoffs.push(data)
}

async function sbDeleteProductoPuntual(id) {
  const { error } = await _sb.from('productos_puntuales').delete().eq('id', id)
  if (error) throw error
  oneoffs = oneoffs.filter(o => o.id !== id)
}

/* ─── Registro — filtro de tiempo, agrupación día→persona→tipo, agregación ─── */
function setRegFilter(f, btn) {
  regFilter = f
  document.querySelectorAll('.reg-fbtn').forEach(b => b.classList.remove('act'))
  if (btn) btn.classList.add('act')
  renderRegistro()
}

function getRegFilterRange() {
  const now = new Date()
  if (regFilter === 'hoy')  return { from: now.toISOString().slice(0, 10) + 'T00:00:00Z', to: null }
  if (regFilter === '7d')   return { from: new Date(now - 7  * 86400000).toISOString().slice(0, 10) + 'T00:00:00Z', to: null }
  if (regFilter === '30d')  return { from: new Date(now - 30 * 86400000).toISOString().slice(0, 10) + 'T00:00:00Z', to: null }
  if (regFilter === 'year') return { from: now.getUTCFullYear() + '-01-01T00:00:00Z', to: null }
  return { from: null, to: null }
}

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
    const range   = getRegFilterRange()
    let query = _sb
      .from('stock_movimientos')
      .select('id, producto_id, delta, tipo, quien, created_at, productos(nombre, unidad)')
      .in('producto_id', prodIds)
      .order('created_at', { ascending: false })
    if (range.from) query = query.gte('created_at', range.from)
    if (range.to)   query = query.lte('created_at', range.to)
    const { data, error } = await query
    if (error) throw error
    rows = data || []
  } catch(e) {
    console.error('[stock] renderRegistro:', e)
    el.regList.innerHTML = '<div class="reg-empty"><div class="reg-empty-icon">⚠</div><div class="reg-empty-title">Error al cargar</div><div class="reg-empty-sub">No se pudo conectar con el servidor.</div></div>'
    return
  }

  regLoadedCount = rows.length

  if (!rows.length) {
    el.regList.innerHTML = '<div class="reg-empty"><div class="reg-empty-icon">📝</div><div class="reg-empty-title">Sin movimientos</div><div class="reg-empty-sub">Los ajustes de inventario aparecerán aquí.</div></div>'
    el.regTotalLbl.textContent = '0 movimientos'
    return
  }

  /* ── Agrupar: día → persona → tipo → producto (con agregación de delta) ── */
  const dayMap = new Map()
  for (const row of rows) {
    const date = row.created_at.slice(0, 10)
    if (!dayMap.has(date)) dayMap.set(date, { date, persons: new Map(), totalCount: 0 })
    const day = dayMap.get(date)
    day.totalCount++

    if (!day.persons.has(row.quien)) {
      day.persons.set(row.quien, {
        quien: row.quien,
        ids: [],
        lastTime: null,
        types: { ajuste: new Map(), inventario: new Map() },
      })
    }
    const person = day.persons.get(row.quien)
    person.ids.push(row.id)

    const t = new Date(row.created_at)
    if (!person.lastTime || t > person.lastTime) person.lastTime = t

    const typeMap = person.types[row.tipo]
    if (!typeMap) continue
    const pid = row.producto_id
    if (!typeMap.has(pid)) typeMap.set(pid, { delta: 0, nombre: row.productos?.nombre || 'Producto', unidad: row.productos?.unidad || '' })
    typeMap.get(pid).delta += row.delta
  }

  const TIPO_ORDER = ['ajuste', 'inventario']
  const TIPO_LABEL = { ajuste: 'Ajustes', inventario: 'Actualización de inventario' }
  const sortedDays = [...dayMap.values()].sort((a, b) => b.date.localeCompare(a.date))

  el.regList.innerHTML = sortedDays.map(day => {
    const dateLabel     = formatDateLabel(day.date)
    const sortedPersons = [...day.persons.values()].sort((a, b) => a.quien.localeCompare(b.quien, 'es'))

    const personsHtml = sortedPersons.map(person => {
      const initials    = person.quien.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase()
      const lastTimeStr = person.lastTime
        ? person.lastTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        : ''
      const delBtn = canDelete
        ? `<button class="reg-del-card" data-ids="${person.ids.join(',')}" onclick="deleteRegCard(this)" title="Borrar movimientos de esta persona">✕</button>`
        : ''

      const activeTipos  = TIPO_ORDER.filter(t => person.types[t].size > 0)
      const showLabels   = activeTipos.length > 1
      const typeSections = activeTipos.map(tipo => {
        const movLines = [...person.types[tipo].entries()].map(([, agg]) => {
          const sign = agg.delta > 0 ? '+' : ''
          const cls  = agg.delta >= 0 ? 'pos' : 'neg'
          return `<div class="reg-mov">
              <span class="reg-mov-prod">${agg.nombre}</span>
              <span class="reg-mov-delta ${cls}">${sign}${agg.delta} ${agg.unidad}</span>
            </div>`
        }).join('')
        return showLabels
          ? `<div class="reg-type-section"><div class="reg-type-label">${TIPO_LABEL[tipo]}</div>${movLines}</div>`
          : `<div class="reg-type-section">${movLines}</div>`
      }).join('')

      return `<div class="reg-person">
        <div class="reg-person-hdr">
          <div class="reg-av">${initials}</div>
          <div class="reg-person-info">
            <div class="reg-person-name">${person.quien}</div>
            <div class="reg-person-time">Última actividad: ${lastTimeStr}</div>
          </div>
          ${delBtn}
        </div>
        ${typeSections}
      </div>`
    }).join('')

    return `<div class="reg-day-card">
      <div class="reg-day-hdr" onclick="this.closest('.reg-day-card').classList.toggle('open')">
        <div class="reg-day-date">${dateLabel}</div>
        <div class="reg-day-meta">
          <span class="reg-day-count">${day.totalCount} mov.</span>
          <span class="reg-day-chevron">›</span>
        </div>
      </div>
      <div class="reg-day-body">
        ${personsHtml}
      </div>
    </div>`
  }).join('')

  el.regTotalLbl.textContent = `${rows.length} movimientos`
}


/* ─── Borrar una card (persona + día, ambos tipos) ─── */
async function deleteRegCard(btn) {
  const ids = btn.dataset.ids.split(',').filter(Boolean)
  if (!ids.length) return
  btn.disabled = true
  try {
    const { error } = await _sb.from('stock_movimientos').delete().in('id', ids)
    if (error) throw error
    toast('Movimientos eliminados')
    await renderRegistro()
  } catch(e) {
    console.error('[stock] deleteRegCard:', e)
    btn.disabled = false
    toast('Error al borrar')
  }
}

/* ─── Borrar todo el registro (respeta el filtro activo) ─── */
function clearReg() {
  if (!el.confirmRegBg) return
  const filterSuffix = { all: 'en total', hoy: 'de hoy', '7d': 'de los últimos 7 días', '30d': 'de los últimos 30 días', year: 'de este año' }
  if (el.confirmRegMsg) {
    el.confirmRegMsg.textContent = `¿Borrar los ${regLoadedCount} movimientos ${filterSuffix[regFilter] || 'en total'}? Esta acción no se puede deshacer.`
  }
  el.confirmRegBg.classList.add('show')
}
function closeClearRegConfirm() {
  if (el.confirmRegBg) el.confirmRegBg.classList.remove('show')
}
async function confirmClearReg() {
  closeClearRegConfirm()
  const prodIds = prods.map(p => p.id)
  if (!prodIds.length) { toast('No hay movimientos que borrar'); return }
  try {
    const range = getRegFilterRange()
    let query = _sb.from('stock_movimientos').delete().in('producto_id', prodIds)
    if (range.from) query = query.gte('created_at', range.from)
    if (range.to)   query = query.lte('created_at', range.to)
    const { error } = await query
    if (error) throw error
    toast('Registro borrado')
    await renderRegistro()
  } catch(e) {
    console.error('[stock] confirmClearReg:', e)
    toast('Error al borrar el registro')
  }
}

/* ─── One-off pedido ─── */
async function addOneoff() {
  const name = inputs.ooName.value.trim()
  const qty  = Number(inputs.ooQty.value)
  const unit = inputs.ooUnit.value.trim()
  if (!name || !unit || Number.isNaN(qty) || qty <= 0) { toast('Completa nombre, cantidad y unidad'); return }
  try {
    await sbAddProductoPuntual(name, qty, unit)
    el.oneoffModalBg.classList.remove('show')
    inputs.ooName.value = ''
    inputs.ooQty.value  = ''
    inputs.ooUnit.value = ''
    updatePedDot()
    renderPedido()
    toast('Artículo añadido')
  } catch(e) {
    console.error('[stock] addOneoff:', e)
    toast('Error al añadir')
  }
}

window.addEventListener('DOMContentLoaded', initStock)

setInterval(() => {
  const now = Date.now()
  const hasExpired = prods.some(p => {
    const snap = _pendingSnapshot.get(p.id)
    return snap && now >= snap.until && getStockStatus(p.qty, p.min) === 'grn'
  })
  if (!hasExpired) return
  updateReorderCount()
  if (activeCat === 'rep') renderInventory()
  if (activeTab === 'ped') renderPedido()
  updatePedDot()
}, 1000)
