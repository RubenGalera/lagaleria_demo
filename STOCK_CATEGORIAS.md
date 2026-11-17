# Stock — Taxonomía de Categorías y Subcategorías
Fecha: 2026-11-17

## Estructura actual

### 🍕 ALI — Alimentación
| Slug | Nombre | Orden |
|---|---|---|
| ali-carnes | Carnes y Aves | 1 |
| ali-pescado | Pescado y Marisco | 2 |
| ali-ibericos | Ibéricos y Quesos | 3 |
| ali-frescos | Frescos y Lácteos | 4 |
| ali-despensa | Despensa y Conservas | 5 |
| ali-salsas | Salsas y Especias | 6 |
| ali-otros | Otros | 7 |

### 🍺 BEB — Bebidas
| Slug | Nombre | Orden |
|---|---|---|
| beb-cerveza | Cerveza | 1 |
| beb-refrescos | Refrescos y Agua | 2 |
| beb-destilados | Licores y Coctelería | 3 |

### 🍷 VIN — Vinos
| Slug | Nombre | Orden |
|---|---|---|
| vin-ribera | Ribera del Duero | 1 |
| vin-rioja | Rioja | 2 |
| vin-carta | Vinos Carta | 3 |
| vin-otros | Otros | 4 |

### 🧴 LIM — Limpieza
Sin subcategorías (10 productos).

### 🔧 MAT — Material
| Slug | Nombre | Orden |
|---|---|---|
| mat-papel | Papel y Embalaje | 1 |
| mat-menaje | Menaje y Cocina | 2 |

## Criterios de clasificación
- Precocinados de mar → `ali-pescado`
- Precocinados de carne/aves → `ali-carnes`
- Ibéricos, embutidos y quesos van juntos → `ali-ibericos` (mismo proveedor, mismo espacio físico)
- Vinos de servicio diario (carta) → `vin-carta`, separados de bodega (`vin-ribera`, `vin-rioja`)
- Productos sin subcategoría clara → `ali-otros`