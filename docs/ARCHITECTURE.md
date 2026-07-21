# Antigravity — Arquitectura y estándar de código

Este documento fija las decisiones de organización y nomenclatura del proyecto.
Es la referencia única: ante cualquier duda de "cómo se llama esto" o "dónde va esto",
se consulta aquí antes de improvisar.

## 1. Idioma del código

- **Funciones, variables, nombres de archivo JS/CSS → inglés.**
- **Esquema de Supabase (tablas, columnas) → se queda en español.** No se migra.
- **Contenido de cara al usuario** (categorías visibles, mensajes de UI, textos de botones) → español,
  porque es el idioma del negocio y de quien usa la app.

Razón: separar la capa de dominio (Supabase, en español, ya estable y con datos reales)
de la capa de ingeniería (código JS, en inglés, coherente con Supabase JS SDK, futura
migración a React/Zustand, y estándar de la industria). No se traduce el esquema de
base de datos — el riesgo de romper RLS/queries existentes no compensa el beneficio.

La traducción de términos de negocio a inglés se hace término a término, verificando
que no se pierda precisión (ver tabla de vocabulario, sección 4).

## 2. Árbol de carpetas (objetivo, aplicado progresivamente)

```
lagaleria_demo/
├── index.html
├── lagaleria_inicio.html
├── lagaleria_stock.html
├── lagaleria_reservas.html
├── lagaleria_turnos.html
└── assets/
    ├── lib/              ← transversal a todos los iframes (auth, conexión, permisos)
    │   ├── supabase-client.js
    │   ├── auth-bridge.js
    │   └── permissions.js
    │
    ├── state/            ← gestores de dominio; nombres ya pensados para el futuro
    │   ├── stock.js          ← state/store de React/Zustand (workers.js, shifts.js...)
    │   ├── workers.js
    │   ├── shifts.js
    │   ├── zones.js
    │   └── events.js
    │
    ├── modules/          ← lógica compleja autocontenida (criterio B, ver auditoría)
    │   ├── turnos-greedy.js
    │   └── image-utils.js
    │
    ├── mock/             ← datos de prueba, aislados de la lógica real
    │   └── profiles.js       ← MOCK_PROFILES, hoy en index.html
    │
    └── styles/
        ├── tokens.css        ← variables compartidas (--bg, --acc, --verde...)
        └── components.css    ← modal, badge, toast, dot, si se repiten
```

Carpetas deliberadamente NO creadas todavía: `components/`, `hooks/`, `store/`.
Son conceptos de React; no tienen sentido sobre vanilla JS y se crearían vacías.
Se crean con contenido real cuando llegue la migración a React, no antes.

Este árbol se actualiza cada vez que se crea un módulo nuevo. Si un módulo no
encaja claramente en ninguna carpeta existente, se discute antes de forzarlo.

### 2.1 Convención real hoy: `assets/js/` vs `assets/lib/`

El árbol de la sección 2 es el objetivo a largo plazo (con `state/`, `modules/`...).
Hoy, con vanilla JS y arquitectura de shell + iframes, la convención que sí está
en vigor y se aplica en cada archivo nuevo es esta:

- **`assets/js/`** → un archivo por iframe/página, el script principal que orquesta
  esa pantalla concreta: `stock.js` (lagaleria_stock.html), `index.js` (index.html,
  el shell), `admin.js` (lagaleria_admin.html), `turnos.js`, `reservas.js`, `inicio.js`.
  Un archivo de `assets/js/` no se carga nunca desde más de un iframe.

- **`assets/lib/`** → utilidades compartidas, importables desde cualquier módulo
  (`assets/js/*.js` u otro archivo de `assets/lib/`). Ejemplos: `utils.js`
  (`cleanTel`, `hashPin`, `normalizeText`), `toast.js` (`showToast`),
  `stock-status.js` (semáforo de stock), `supabase-client.js`, `ui-helpers.js`.
  Los módulos de administración de entidades siguen la convención `admin*.js`
  (`adminStock.js`, `adminContactos.js`, `adminWorkers.js`, `adminZones.js`,
  `adminSkills.js`, `adminWeekConfig.js`) — viven en `assets/lib/` porque, aunque
  cada uno gestiona un dominio distinto, todos son piezas que `lagaleria_admin.html`
  compone, no el script principal de un iframe por sí solos.

Regla práctica: si el archivo es "la pantalla X", va en `assets/js/`. Si el archivo
es "una pieza que varias pantallas podrían usar" o "una sección de la pantalla de
Admin", va en `assets/lib/`.

## 3. Convención de nombres de funciones

Patrón: `prefijo` + `Sustantivo` (camelCase). El prefijo indica QUÉ HACE la función,
no de qué dominio es (el dominio va en el sustantivo).

| Prefijo | Significado | Ejemplo |
|---|---|---|
| `sb` | Toca Supabase directamente (async, red) | `sbLoadOneOffs`, `sbAddOneOff` |
| `render` | Repinta una sección completa del DOM | `renderOrder`, `renderInventory` |
| `update` | Refresca una pieza puntual del DOM (no todo) | `updateReorderCount`, `updateOrderDot` |
| `get` | Cálculo o lectura pura, sin efectos secundarios | `getStockStatus` |
| `is` | Devuelve booleano | `isPendingForOrderView` |
| `apply` | Aplica una regla/efecto sobre estado ya existente | `applyRolePermissions` |
| `mark` | Registra un evento/momento, sin pintar nada | `markStockActivity` |
| `set` | Cambia estado y dispara los cambios derivados | `setTab`, `setCategory` |
| `save` / `confirm` | Acción de guardado disparada por el usuario | `saveProductEdit`, `confirmProductDelete` |
| `show` | Abre/muestra un elemento de UI puntual (modal, toast) | `showOneOffModal`, `showToast` |

Regla de desambiguación `render` vs `update`: si repinta TODA la sección, es `render`;
si solo actualiza un número/badge/clase puntual sin reconstruir el HTML entero, es `update`.
Casos dudosos se revisan uno a uno al migrar, no se fuerza la regla a ciegas.

## 4. Vocabulario de negocio (español → inglés en código)

Traducción decidida término a término, no automática. Esta tabla se ampliará
conforme aparezcan más términos.

| Español (negocio, Supabase, UI) | Inglés (código JS) | Nota |
|---|---|---|
| Pedido | Order | Sin ambigüedad |
| Stock | Stock | Igual en ambos idiomas |
| Registro (histórico de movimientos) | StockLog | Evitar "Log" solo, ambiguo con consola |
| Turno | Shift | Estándar en software de horarios |
| Trabajador | Worker | Ya previsto en memoria de proyecto (workers.js) |
| Producto puntual | OneOff | Ya en uso de forma natural (oneoffs, showOneoffModal) |
| Reponer / necesita reponer | Restock / Reorder | "Reorder" más estándar en apps de inventario |
| Categoría | Category | — |
| Ubicación | Location | — |
| Mínimo | Min / Minimum | `min` ya en uso, mantener |

## 5. Cómo se aplica esto en la práctica

- **No es una reescritura retroactiva masiva.** El código existente no se renombra
  de golpe. Este estándar se aplica:
  - A todo módulo NUEVO que se cree desde ahora.
  - A cualquier archivo que se module/extraiga durante la auditoría ya en curso
    (al moverlo, se renombra siguiendo este estándar).
  - De forma oportunista cuando se edite una función ya existente por otro motivo
    (se aprovecha para alinear el nombre, sin convertirlo en un cambio masivo aparte).
- **Nunca se mezcla un renombrado masivo con un cambio funcional** en el mismo commit/
  prompt — son dos tipos de cambio distintos y se piden por separado.
- **Toda función/módulo nuevo lleva un comentario de cabecera** de 2-3 líneas explicando
  qué es y por qué existe (igual que ya hacen image-utils.js y stock-status.js).
