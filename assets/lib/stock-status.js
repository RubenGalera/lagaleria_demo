/* stock-status.js — utilidad compartida de estado de stock (semáforo rojo/ámbar/verde).
   Vive en assets/lib/ (no en assets/js/) porque es una utilidad reutilizable,
   no el script principal de ningún iframe/página — lo carga lagaleria_stock.html,
   consumida por assets/js/stock.js. Ver docs/ARCHITECTURE.md. */

/**
 * Semáforo de stock — única fuente de verdad del color/urgencia de un
 * producto en toda la app (Productos, Pedido por categoría, Pedido por
 * proveedor, alertas de Inicio: todos llaman a esta misma función, nunca
 * recalculan el umbral por su cuenta).
 *   - min = 0                           → siempre 'grn'
 *   - qty > min                         → 'grn'
 *   - qty en [mitad de min, min]        → 'amb'
 *   - qty por debajo de la mitad de min → 'red'
 * La "mitad" se compara sin división en punto flotante (qty*2 < min) para
 * que el resultado coincida exacto con el redondeo hacia arriba de min/2 —
 * con min=10 el corte rojo/ámbar cae en qty=5 (5*2=10, no <10 → ámbar) y con
 * min=1 cae en qty=0 (0*2=0 <1 → rojo; qty=1 → 1*2=2, no <1 → ámbar).
 * @param {number} qty — cantidad actual
 * @param {number} min — cantidad mínima configurada
 * @returns {'grn'|'amb'|'red'}
 */
function getStockStatus(qty, min) {
  if (!min || min <= 0) return 'grn'
  if (qty > min) return 'grn'
  if (qty * 2 < min) return 'red'
  return 'amb'
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
