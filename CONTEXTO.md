# ANTIGRAVITY — La Galería Neotaberna
## Contexto para nueva conversación

---

## PROYECTO
App de gestión para La Galería Neotaberna (bar en Almería).
Stack actual: **Vanilla HTML/CSS/JS** con Supabase JS CDN.
Stack futuro: React + Next.js + Tailwind + shadcn/ui + Supabase.

---

## SUPABASE
- URL: `https://nnmaedehqeeogmhzqzji.supabase.co`
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubWFlZGVocWVlb2dtaHpxemppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTA0MzAsImV4cCI6MjA2NTA2NjQzMH0.gh7aVMzKQP6mMTMBaZ18M8_L6xCVESnzTiE1GAfMvtA`
- LOCAL_ID: `3fd1108c-1c7b-4a0e-9141-8527db4e5ccc`
- CDN: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js`

### Tablas existentes en Supabase:
```
locales, usuarios, usuario_local, zonas, skills,
trabajadores, trabajador_skill, disponibilidad,
vacaciones, turnos, reservas, eventos,
productos, stock_movimientos
```

### IDs zonas reales:
```
Terraza:  5f632d5a-8499-4a80-a8c9-bc0a0c8ae2af  (8 mesas)
Entrada:  cda56db3-9dac-4258-aaf6-cb80a1216145  (4 mesas)
Barra:    ff3c77e4-153f-42a0-a0d5-482e1e5f0fcd  (6 mesas)
Sala:     56390bb2-e2ec-4376-80c8-598165670c95  (10 mesas)
Salón:    bc13e84e-35a2-4e9b-8eb7-9e23d97e485b  (6 mesas)
```

### Diferencias schema vs mock:
- `trabajadores`: sin columna `rol` (está en `usuario_local`), sin `estado`, tiene `activo` boolean
- `productos` (no `stock`): columnas `cantidad`/`minimo` (no `qty`/`min_qty`)
- `eventos`: columna `descripcion` (no `nombre`), `img_url` (no `foto`)
- `reservas`: `zona_id` UUID (no `zonaId` numérico)

---

## ARCHIVOS (en el ZIP adjunto)
```
index.html                → login + nav principal (CON Supabase)
lagaleria_inicio_v8.html  → dashboard + editar (CON Supabase)
lagaleria_reservas.html   → reservas + eventos (CON Supabase)
antigravity_seed.sql      → seed data para Supabase
```

### Archivos pendientes (versiones pre-migración, SIN Supabase):
```
lagaleria_stock.html   → stock/productos (PENDIENTE limpiar + conectar)
lagaleria_turnos.html  → cuadrante turnos (PENDIENTE limpiar + conectar)
```

---

## TOKENS DE DISEÑO
```css
--nav: #22292D
--acc: #C5A669
--bg:  #111417
--surf:#1a2226
--txt: #f0ece4
--dim: #7a8f96
--brd: rgba(255,255,255,.07)
Tipografías: Cinzel + Inter
```

---

## ARQUITECTURA DE ARCHIVOS
```
index.html
  └── <iframe> lagaleria_inicio.html    (tab Resumen + tab Editar)
  └── <iframe> lagaleria_turnos.html    (tab Turnos)
  └── <iframe> lagaleria_reservas.html  (tab Reservas)
  └── <iframe> lagaleria_stock.html     (tab Stock)
```

### Comunicación entre iframes:
- `window.parent.currentUser` → rol del usuario logado
- `window.parent.getActiveLocal()` → config del local (zonas, colores)
- `localStorage: lg_session` → sesión guardada
- `localStorage: lg_saved_tel` → teléfono recordado

---

## AUTH (mock — Supabase Auth pendiente)
```
IDENTIFICADOR:  Teléfono
ACCESO:         PIN 4 dígitos (teclado numérico en pantalla)
PRIMER ACCESO:  PIN temporal 1234 → modal onboarding → cambiar PIN
RECUPERACIÓN:   Email verificado → magic link | Sin email → WhatsApp admin
ADMIN TEL:      656187336
```

### Roles mock (escribir en campo teléfono + PIN 1234):
```
superadmin  → Rubén García
admin       → Ana Martínez
encargado   → María López
trabajador  → Carlos Ruiz
```

---

## MÓDULOS Y PERMISOS
```
                    Admin  Encargado  Empleado
Resumen (dashboard) ✅     ✅         ❌
Editar (zonas etc.) ✅     ❌         ❌
Turnos (ver)        ✅     ✅         ✅
Reservas            ✅     ✅         ❌
Eventos             ✅     ✅         ❌
Stock (editar)      ✅     ✅         ❌
Stock (ver qty)     ✅     ✅         ✅
```

---

## ESTADO SUPABASE POR ARCHIVO

### index.html ✅
- `sbLoadLocal()` → carga colores/nombre del local
- `sbVerifyLogin(tel, pin)` → busca trabajador por teléfono
- Fallback a MOCK_PROFILES si RLS bloquea o no encuentra

### lagaleria_inicio_v8.html ✅
- `initSupabase()` → carga zonas, trabajadores, skills, productos
- `sbSaveZona()` → guarda zona en Supabase
- `sbSaveTrabajador()` → guarda trabajador
- `sbUpdateProducto()` → ajusta stock + log en stock_movimientos

### lagaleria_reservas.html ✅
- `initSupabase()` → carga zonas, reservas, eventos
- `sbSaveReserva()` / `sbDeleteReserva()` → CRUD reservas
- `sbSaveEvento()` / `sbDeleteEvento()` → CRUD eventos
- Zonas NO editables aquí (se gestionan desde inicio)

### lagaleria_stock.html ⏳ PENDIENTE
- Limpiar: quitar gestión de categorías/crear productos (→ inicio)
- Conectar: leer/actualizar tabla `productos` en Supabase
- Empleado: solo ver cantidades (readonly)

### lagaleria_turnos.html ⏳ PENDIENTE
- Limpiar: quitar zonas, editar, funciones duplicadas
- Conectar: leer tabla `turnos` y `trabajadores` de Supabase
- Solo cuadrante semanal

---

## PENDIENTE CRÍTICO
```
1. lagaleria_stock.html  → limpiar + conectar Supabase
2. lagaleria_turnos.html → limpiar + conectar Supabase
3. RLS policies Supabase → permitir anon key leer/escribir
4. Vercel deploy         → repo lagaleria_demo en GitHub
5. Renombrar inicio      → lagaleria_inicio_v8.html → lagaleria_inicio.html
```

### RLS temporal para demo (ejecutar en Supabase SQL Editor):
```sql
-- Permitir anon key leer/escribir (temporal para demo)
CREATE POLICY "anon_read" ON public.zonas FOR SELECT USING (true);
CREATE POLICY "anon_read" ON public.trabajadores FOR SELECT USING (true);
CREATE POLICY "anon_all"  ON public.reservas FOR ALL USING (true);
CREATE POLICY "anon_all"  ON public.eventos FOR ALL USING (true);
CREATE POLICY "anon_read" ON public.productos FOR SELECT USING (true);
CREATE POLICY "anon_write" ON public.productos FOR UPDATE USING (true);
CREATE POLICY "anon_read" ON public.locales FOR SELECT USING (true);
CREATE POLICY "anon_write" ON public.stock_movimientos FOR INSERT WITH CHECK (true);
```

---

## TRABAJADORES (18 en mock)
Sala: Lorenzo, Manu, Luis, Mayte, Bryan, Antonio, Alejandro, Sara, Noa, Josep
Cocina: Israel, Noemi, JL, Ruben, JI, Noa C, Josep C
Ambos: Refuerzo X

---

## NOTAS IMPORTANTES
- `lagaleria_inicio_v8.html` se renombra a `lagaleria_inicio.html` en producción
- El iframe de inicio se carga con `src="lagaleria_inicio.html"` (sin ?mock=1)
- Stock usa tabla `productos` (no `stock`) con columnas `cantidad`/`minimo`
- Eventos usa columna `descripcion` (no `nombre`)
- Zonas en reservas/stock/turnos se cargan desde `window.parent.getActiveLocal()` o Supabase, NO se editan en esos iframes
- El autogenerador de turnos usa algoritmo greedy ordenado por escasez
- PIN reset por admin borra `lg_onboarding_done_{initials}` de localStorage
