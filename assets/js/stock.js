const STORAGE_KEY = 'lagaleria_stock_data'
let prods = []
let pedido = []
let movements = []
let activeTab = 'inv'
let activeCat = 'all'
let editProdId = null
let invMode = false
let editOpen = false
let oneoffOpen = false

const el = {
  prodList: document.getElementById('prod-list'),
  invBanner: document.getElementById('inv-banner'),
  repCount: document.getElementById('rep-count'),
  invStatusLbl: document.getElementById('inv-status-lbl'),
  invDot: document.getElementById('inv-dot'),
  btnInv: document.getElementById('btn-inv'),
  pedContent: document.getElementById('ped-content'),
  regTotalLbl: document.getElementById('reg-total-lbl'),
  regList: document.getElementById('reg-list'),
  toast: document.getElementById('toast'),
  modalBg: document.getElementById('modal-bg'),
  editSheetBg: document.getElementById('edit-sheet-bg'),
  oneoffModalBg: document.getElementById('oneoff-modal-bg'),
}

const inputs = {
  npName: document.getElementById('np-n'),
  npCat: document.getElementById('np-c'),
  npLoc: document.getElementById('np-l'),
  npQty: document.getElementById('np-q'),
  npUnit: document.getElementById('np-u'),
  npMin: document.getElementById('np-m'),
  npNote: document.getElementById('np-no'),

  epName: document.getElementById('ep-n'),
  epCat: document.getElementById('ep-c'),
  epLoc: document.getElementById('ep-l'),
  epMin: document.getElementById('ep-m'),
  epUnit: document.getElementById('ep-u'),
  epNote: document.getElementById('ep-no'),

  ooName: document.getElementById('oo-n'),
  ooQty: document.getElementById('oo-q'),
  ooUnit: document.getElementById('oo-u'),
}

const prefs = {
  categories: {
    beb: { label: 'Bebidas', emoji: '🍺', color: 'beb' },
    ali: { label: 'Alimentación', emoji: '🥩', color: 'ali' },
    lim: { label: 'Limpieza', emoji: '🧴', color: 'lim' },
    mat: { label: 'Material', emoji: '📦', color: 'mat' },
  },
  locations: {
    d: { label: 'Despensa', color: 'loc-d' },
    g: { label: 'Garaje', color: 'loc-g' },
    a: { label: 'Ambos', color: 'loc-a' },
  },
}

function initStock() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed.prods)) {
        prods = parsed.prods
      }
      if (Array.isArray(parsed.movements)) {
        movements = parsed.movements
      }
      if (Array.isArray(parsed.pedido)) {
        pedido = parsed.pedido
      }
    } catch (error) {
      console.warn('Invalid stock storage', error)
      prods = []
      movements = []
      pedido = []
    }
  } else {
    prods = [
      { id: 'p1', name: 'Cerveza Estrella', cat: 'beb', loc: 'd', qty: 24, min: 8, unit: 'bot', note: 'Fría en el mueble', updated: Date.now() - 2e5 },
      { id: 'p2', name: 'Aceite AOVE', cat: 'ali', loc: 'a', qty: 4, min: 2, unit: 'bot', note: 'Despensa alta', updated: Date.now() - 6e5 },
      { id: 'p3', name: 'Detergente', cat: 'lim', loc: 'g', qty: 1, min: 2, unit: 'bot', note: 'Reponer antes del fin de semana', updated: Date.now() - 1.2e6 },
    ]
    movements = []
  }

  renderTab(activeTab)
  setCat(activeCat)
  updateInventoryStatus()
}

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

function setTab(tab) {
  renderTab(tab)
}

function setCat(cat, button) {
  activeCat = cat
  document.querySelectorAll('.cpill').forEach(el => el.classList.remove('act'))
  if (button) button.classList.add('act')
  renderInventory()
}

function renderInventory() {
  const filtered = prods.filter(prod => activeCat === 'all' || prod.cat === activeCat)
  const html = filtered.map(prod => renderProduct(prod)).join('')
  el.prodList.innerHTML = html || '<div class="ped-empty"><div class="ped-empty-icon">📦</div><div class="ped-empty-title">No hay productos</div><div class="ped-empty-sub">Usa el botón + para agregar un producto.</div></div>'
  updateReorderCount()
}

function renderProduct(prod) {
  const category = prefs.categories[prod.cat]
  const location = prefs.locations[prod.loc]
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

function adjustQty(id, delta) {
  const prod = prods.find(item => item.id === id)
  if (!prod) return
  prod.qty = Math.max(0, prod.qty + delta)
  prod.updated = Date.now()
  movements.push({ id: prod.id, name: prod.name, delta, qty: prod.qty, when: Date.now() })
  saveState()
  renderInventory()
}

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
  saveState()
  showToast('Inventario guardado')
}

function updateReorderCount() {
  const count = prods.filter(prod => prod.qty <= prod.min).length
  el.repCount.textContent = count || ''
  el.repCount.classList.toggle('show', count > 0)
}

function updateInventoryStatus() {
  if (prods.length === 0) {
    el.invStatusLbl.textContent = 'Aún no hay inventario'
    el.invDot.classList.remove('active')
    return
  }
  const lastUpdate = new Date(Math.max(...prods.map(p => p.updated || 0)))
  const formatted = lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  el.invStatusLbl.textContent = `Último inventario: hoy ${formatted}`
  el.invDot.classList.add('active')
}

function showModal() {
  el.modalBg.classList.add('show')
}

function hideModal() {
  el.modalBg.classList.remove('show')
  resetNewProductForm()
}

function resetNewProductForm() {
  inputs.npName.value = ''
  inputs.npCat.value = 'beb'
  inputs.npLoc.value = 'd'
  inputs.npQty.value = ''
  inputs.npUnit.value = ''
  inputs.npMin.value = ''
  inputs.npNote.value = ''
}

function addProd() {
  const name = inputs.npName.value.trim()
  const qty = Number(inputs.npQty.value)
  const min = Number(inputs.npMin.value)
  const unit = inputs.npUnit.value.trim()
  if (!name || !unit || Number.isNaN(qty)) {
    showToast('Completa nombre, cantidad y unidad')
    return
  }
  const prod = {
    id: `p_${Date.now()}`,
    name,
    cat: inputs.npCat.value,
    loc: inputs.npLoc.value,
    qty,
    min: Number.isNaN(min) ? 0 : min,
    unit,
    note: inputs.npNote.value.trim(),
    updated: Date.now(),
  }
  prods.unshift(prod)
  saveState()
  renderInventory()
  hideModal()
  showToast('Producto agregado')
}

function openEdit(id) {
  const prod = prods.find(item => item.id === id)
  if (!prod) return
  editProdId = id
  inputs.epName.value = prod.name
  inputs.epCat.value = prod.cat
  inputs.epLoc.value = prod.loc
  inputs.epMin.value = prod.min
  inputs.epUnit.value = prod.unit
  inputs.epNote.value = prod.note
  el.editSheetBg.classList.add('show')
}

function closeEditSheet() {
  editProdId = null
  el.editSheetBg.classList.remove('show')
}

function saveEditProd() {
  const prod = prods.find(item => item.id === editProdId)
  if (!prod) return
  const name = inputs.epName.value.trim()
  const min = Number(inputs.epMin.value)
  const unit = inputs.epUnit.value.trim()
  if (!name || !unit) {
    showToast('Completa nombre y unidad')
    return
  }
  prod.name = name
  prod.cat = inputs.epCat.value
  prod.loc = inputs.epLoc.value
  prod.min = Number.isNaN(min) ? 0 : min
  prod.unit = unit
  prod.note = inputs.epNote.value.trim()
  prod.updated = Date.now()
  saveState()
  renderInventory()
  closeEditSheet()
  showToast('Producto actualizado')
}

function deleteProd() {
  if (!editProdId) return
  prods = prods.filter(item => item.id !== editProdId)
  saveState()
  renderInventory()
  closeEditSheet()
  showToast('Producto eliminado')
}

function renderPedido() {
  if (pedido.length === 0) {
    el.pedContent.innerHTML = '<div class="ped-empty"><div class="ped-empty-icon">🛒</div><div class="ped-empty-title">No hay artículos en el pedido</div><div class="ped-empty-sub">Toca el + en cualquier producto para agregarlo.</div></div>'
    return
  }
  const html = pedido.map(item => `
    <div class="ped-item ${item.qty <= item.min ? 'red' : 'amb'}">
      <div class="ped-item-left">
        <div class="ped-name">${item.name}</div>
        <div class="ped-detail">${item.qty} ${item.unit} · ${prefs.categories[item.cat]?.label || 'Otro'}</div>
      </div>
      <div class="ped-tag ${item.qty <= item.min ? 'red' : 'amb'}">${item.qty} ${item.unit}</div>
    </div>
  `).join('')
  el.pedContent.innerHTML = html
}

function renderRegistro() {
  if (movements.length === 0) {
    el.regList.innerHTML = '<div class="reg-empty"><div class="reg-empty-icon">📝</div><div class="reg-empty-title">Sin registro</div><div class="reg-empty-sub">Los movimientos del inventario aparecerán aquí.</div></div>'
    el.regTotalLbl.textContent = '0 movimientos recientes'
    return
  }
  const items = movements.slice().reverse()
  el.regList.innerHTML = items.map(mov => `
    <div class="reg-person">
      <div class="reg-person-hdr">
        <div class="reg-person-info">
          <div class="reg-person-name">${mov.name}</div>
          <div class="reg-person-time">${new Date(mov.when).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div class="reg-mov-delta ${mov.delta >= 0 ? 'pos' : 'neg'}">${mov.delta > 0 ? '+' : ''}${mov.delta}</div>
      </div>
      <div class="reg-mov">
        <div class="reg-mov-prod">Cantidad ahora: ${mov.qty} ${mov.unit || ''}</div>
      </div>
    </div>
  `).join('')
  el.regTotalLbl.textContent = `${items.length} movimientos recientes`
}

function clearReg() {
  movements = []
  saveState()
  renderRegistro()
  showToast('Registro borrado')
}

function addOneoff() {
  const name = inputs.ooName.value.trim()
  const qty = Number(inputs.ooQty.value)
  const unit = inputs.ooUnit.value.trim()
  if (!name || !unit || Number.isNaN(qty) || qty <= 0) {
    showToast('Completa nombre, cantidad y unidad')
    return
  }
  pedido.push({ id: `o_${Date.now()}`, name, qty, unit, cat: 'ali', min: 0 })
  el.oneoffModalBg.classList.remove('show')
  inputs.ooName.value = ''
  inputs.ooQty.value = ''
  inputs.ooUnit.value = ''
  renderPedido()
  showToast('Artículo agregado al pedido')
}

function closeOneoffModal() {
  el.oneoffModalBg.classList.remove('show')
}

function showToast(message) {
  el.toast.textContent = message
  el.toast.classList.add('show')
  clearTimeout(showToast.timeout)
  showToast.timeout = setTimeout(() => el.toast.classList.remove('show'), 1600)
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ prods, pedido, movements }))
  updateInventoryStatus()
}

window.addEventListener('DOMContentLoaded', initStock)
