-- ═══════════════════════════════════════════════════
-- ANTIGRAVITY — Seed data para demo
-- La Galería Neotaberna
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- IDs fijos del local
-- local_id: 3fd1108c-1c7b-4a0e-9141-8527db4e5ccc

-- ── TRABAJADORES ──
INSERT INTO public.trabajadores (local_id, nombre, seccion, tel, prioridad, min_turnos, max_turnos, activo)
VALUES
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Lorenzo',    'ambos',  '666 123 456', 'fijo',     4, 8,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Manu',       'sala',   '677 234 567', 'fijo',     3, 6,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Luis',       'sala',   '688 345 678', 'eventual', 3, 6,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Mayte',      'sala',   '699 456 789', 'fijo',     3, 5,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Bryan',      'sala',   '611 567 890', 'eventual', 3, 5,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Antonio',    'ambos',  '622 678 901', 'eventual', 2, 5,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Alejandro',  'sala',   '633 789 012', 'fijo',     3, 6,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Sara',       'sala',   '644 890 123', 'eventual', 2, 5,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Noa',        'sala',   '655 901 234', 'eventual', 2, 5,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Josep',      'sala',   '666 012 345', 'eventual', 2, 5,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Israel',     'ambos',  '611 987 654', 'fijo',     5, 10, true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Noemi',      'ambos',  '622 876 543', 'fijo',     4, 8,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'JL',         'cocina', '633 765 432', 'fijo',     3, 6,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Ruben',      'cocina', '644 654 321', 'eventual', 3, 6,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'JI',         'cocina', '655 543 210', 'eventual', 3, 6,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Noa C',      'cocina', '666 432 109', 'eventual', 2, 5,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Josep C',    'cocina', '677 321 098', 'eventual', 2, 5,  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Refuerzo X', 'ambos',  '',            'eventual', 0, 5,  true);

-- ── RESERVAS (datos demo para hoy) ──
INSERT INTO public.reservas (local_id, zona_id, nombre, tel, fecha, hora, pax, mesas, estado, nota)
VALUES
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', '5f632d5a-8499-4a80-a8c9-bc0a0c8ae2af', 'Familia Rodríguez', '634 123 456', CURRENT_DATE, '14:30', 6,  2, 'confirmada', ''),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', '56390bb2-e2ec-4376-80c8-598165670c95', 'Mesa García',       '612 234 567', CURRENT_DATE, '21:00', 4,  1, 'pendiente',  ''),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'bc13e84e-35a2-4e9b-8eb7-9e23d97e485b', 'Cumple Laura',      '699 345 678', CURRENT_DATE, '20:00', 10, 3, 'confirmada', 'Tarta de cumpleaños'),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'bc13e84e-35a2-4e9b-8eb7-9e23d97e485b', 'Ana Torres',        '677 456 789', CURRENT_DATE, '21:30', 2,  1, 'pendiente',  ''),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'ff3c77e4-153f-42a0-a0d5-482e1e5f0fcd', 'Almuerzo Pérez',    '611 222 333', CURRENT_DATE, '13:30', 3,  1, 'confirmada', ''),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', '5f632d5a-8499-4a80-a8c9-bc0a0c8ae2af', 'Grupo Empresa',     '655 111 222', CURRENT_DATE + 1, '14:00', 8, 3, 'confirmada', 'Menú degustación');

-- ── EVENTOS (demo) ──
INSERT INTO public.eventos (local_id, tipo, descripcion, fecha, hora, precio)
VALUES
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'cata',     'Cata de vinos Ribera del Duero', CURRENT_DATE + 3, '20:00', '25€'),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'birthday', 'Cumpleaños privado — Salón',      CURRENT_DATE,     '21:00', NULL),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'menu',     'Menú especial San Juan',          CURRENT_DATE + 7, '13:00', '35€');

-- ── PRODUCTOS / STOCK ──
INSERT INTO public.productos (local_id, nombre, categoria, ubicacion, cantidad, minimo, unidad, activo)
VALUES
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Estrella',      'beb', 'Nevera barra',  8,  24, 'bot', true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino tinto Arrocal',    'beb', 'Bodega',        36, 12, 'bot', true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Agua mineral 1.5L',     'beb', 'Almacén',       48, 24, 'bot', true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Refresco Coca-Cola',    'beb', 'Almacén',       4,  12, 'caja',true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pan de molde',          'ali', 'Cocina',        3,  10, 'ud',  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Aceite oliva virgen',   'ali', 'Cocina',        2,  4,  'bot', true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Servilletas',           'mat', 'Almacén',       8,  20, 'paq', true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Detergente lavavajillas','lim','Cocina',        1,  3,  'bot', true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Bayetas cocina',        'lim', 'Cocina',        4,  10, 'ud',  true),
  ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Papel de cocina',       'lim', 'Almacén',       2,  5,  'rollo',true);

-- ── VERIFICAR ──
SELECT 'trabajadores' as tabla, count(*) FROM public.trabajadores WHERE local_id='3fd1108c-1c7b-4a0e-9141-8527db4e5ccc'
UNION ALL
SELECT 'reservas',  count(*) FROM public.reservas  WHERE local_id='3fd1108c-1c7b-4a0e-9141-8527db4e5ccc'
UNION ALL
SELECT 'eventos',   count(*) FROM public.eventos   WHERE local_id='3fd1108c-1c7b-4a0e-9141-8527db4e5ccc'
UNION ALL
SELECT 'productos', count(*) FROM public.productos WHERE local_id='3fd1108c-1c7b-4a0e-9141-8527db4e5ccc'
UNION ALL
SELECT 'zonas',     count(*) FROM public.zonas     WHERE local_id='3fd1108c-1c7b-4a0e-9141-8527db4e5ccc';
