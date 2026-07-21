/* stock-status.js — utilidad compartida de estado de stock (semáforo rojo/ámbar/verde).
   Vive en assets/lib/ (no en assets/js/) porque es una utilidad reutilizable,
   no el script principal de ningún iframe/página — lo carga lagaleria_stock.html,
   consumida por assets/js/stock.js. Ver docs/ARCHITECTURE.md. */

function getStockStatus(qty, min) {
  if (!min || min <= 0) return 'grn'
  if (qty < min) return 'red'
  if (qty <= min * 1.2) return 'amb'
  return 'grn'
}

const _pendingSnapshot = new Map()

function isPendingForOrderView(prod) {
  const real = getStockStatus(prod.qty, prod.min)
  const now  = Date.now()
  const snap = _pendingSnapshot.get(prod.id)

  if (real !== 'grn') return true

  if (snap && now < snap.until) return true

  if (snap) _pendingSnapshot.delete(prod.id)
  return false
}

function markStockActivity(prodId) {
  _pendingSnapshot.set(prodId, { until: Date.now() + 2000 })
}
