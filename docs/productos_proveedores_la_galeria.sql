-- =====================================================================
-- INSERT de productos únicos extraídos de los albaranes de proveedores
-- La Galería (Asociados Robel 2015 S.L.) - Junio 2026
-- Generado automáticamente a partir de los PDFs de facturas/albaranes
-- =====================================================================

-- NOTA: la factura 'GALERIA JUNIO 2026.pdf' (Elias Ortiz Polo) no contiene
-- productos desglosados (solo totales por albarán diario), por lo que no
-- se han podido extraer artículos de ese proveedor.


-- ======================================================================
-- Proveedor: Tostasol Frutos Secos
-- Tel: 950554134
-- Email: info@tostasolfrutossecos.com
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '950554134', email = 'info@tostasolfrutossecos.com'
WHERE nombre = 'Tostasol Frutos Secos';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cóctel de gominolas', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Patatas artesanas (Tostasol)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '600g x4', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Ketchup en sobres (Cosami)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '200 x 12g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Picos camperos', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '185g x20', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Almendra piel cruda', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa tacos garrafa (Cosami)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '2kg x4', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa césar (Cosami)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '1kg x8', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pulpa de pimiento choricero', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '650g x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Picadillo en cubito', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '2,2 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Ajo granulado', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '910 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa de soja sin gluten (Kikkoman)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '1L x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa tartufata negra', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '580g x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa Worcestershire (Lea & Perrins Heinz)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '150ml x12', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Concentrado de carne Bovril (Knorr)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '500g x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa barbacoa garrafa (Cosami)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '2kg x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Wasabi en pasta', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '43g, 6x10', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Almendra repelada frita', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pasas sultanas', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Boquerones en vinagre', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '100g x10', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tortilla de trigo 15cm', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '18 uds x16', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Perejil hoja', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '125 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Miel de caña antigoteo', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '1,2kg x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Mostaza Dijon antigua (Maille)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '210g x12', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pimienta negra en grano', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '810 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vinagre de vino 6º', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '2L x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Nueces USA 80%', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '900 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Rosquilla blanca liada', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, 'caja 2kg, 200 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Sirope de fresa (Cosami)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '1200g x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa sweet chilli', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '800g x12', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tomillo hoja', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '275 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa sriracha', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '440ml x12', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa chipotle (Amazon)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Tostasol Frutos Secos'), 0, 0, NULL, NULL, true, '155ml x6', 'Almacén');


-- ======================================================================
-- Proveedor: Cafés Candelas
-- Tel: 902996500
-- Email: clientes@cafescandelas.com
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '902996500', email = 'clientes@cafescandelas.com'
WHERE nombre = 'Cafés Candelas';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Café en grano Selectum', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Cafés Candelas'), 0, 0, NULL, '8412007120179', true, 'lata 6 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Leche condensada', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Cafés Candelas'), 0, 0, NULL, NULL, true, 'bote 900g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tapas para vaso Essential M', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Cafés Candelas'), 0, 0, NULL, '8412866002340', true, NULL, 'Almacén');


-- ======================================================================
-- Proveedor: Bebidas Alhabía
-- Email: admon@bebidasalhabia.es
-- ======================================================================

UPDATE public.stock_proveedores SET email = 'admon@bebidasalhabia.es'
WHERE nombre = 'Bebidas Alhabía';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Casera tinto limón retornable 275cl', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '24 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Casera tinto limón 0% retornable 275cl', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '24 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Casera gaseosa 1L PET', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '12 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Casera limón 1L PET', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '12 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Mosto Vida Batuka 200ml NR', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Agua Lanjarón con gas 33cl', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '24 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza sin alcohol hostelería 1,5L', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pepsi Max lata 330ml', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '24 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Bitter Kas sin alcohol 200ml', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '24 uds bandeja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Mantequilla en bloque', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Nata para montar 35,1%', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '1 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Panceta en dados (Sariego)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, 'caja 6 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Atún en bolsa (Aiko)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Gyoza de marisco', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '600g bolsa', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Secreto de cerdo blanco', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Callos de vacuno a la madrileña', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '2,5kg bandeja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cigala de Escocia', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '2kg estuche paella', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Gallo Pedro con piel 200/300 (Marba)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '1kg bolsa', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Atún lomo en trozo al vacío (Campos)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '1kg aprox', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Queso Edam en barra', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '3kg aprox', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tortilla de trigo 20cm', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Bebidas Alhabía'), 0, 0, NULL, NULL, true, '12 bolsas', 'Almacén');


-- ======================================================================
-- Proveedor: Dimoba Suministros
-- Tel: 950223603
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '950223603'
WHERE nombre = 'Dimoba Suministros';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cobertura de chocolate blanco (Chocdelit)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Dimoba Suministros'), 0, 0, NULL, NULL, true, '5kg bolsa', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cobertura de chocolate negro (Nestlé)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Dimoba Suministros'), 0, 0, NULL, NULL, true, '10kg caja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Crema nocciolata blanca (IRCA Joycream)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Dimoba Suministros'), 0, 0, NULL, NULL, true, '5 kg', 'Almacén');


-- ======================================================================
-- Proveedor: Distribuciones Macar
-- Tel: 950459040
-- Email: info@distribucionesmacar.es
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '950459040', email = 'info@distribucionesmacar.es'
WHERE nombre = 'Distribuciones Macar';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Ginebra Chapter Langley''s', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, '70cl, caja 6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Aguardiente de orujo (El Afilador)', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, 'caja 6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Ginebra Martin Miller''s', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, '70cl', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Licor Gressy', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, '3/4', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Ramón Bilbao Crianza Magnum', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Sirope flor de saúco (Monin)', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, '70cl, caja 6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cremiorujo (Lial)', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, '3L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Orujo de hierbas (Lial)', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, '3L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Sirope spicy mango (Monin)', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, '70cl, caja 6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Ron Bermúdez blanco superior', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Distribuciones Macar'), 0, 0, NULL, NULL, true, '70cl, caja 12', 'Almacén');


-- ======================================================================
-- Proveedor: Exclusivas Seygo
-- Tel: 950221309
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '950221309'
WHERE nombre = 'Exclusivas Seygo';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pan rallado (Gallo)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '500 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Queso San Millán cubo hostelería', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '3 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Mayonesa original (Chovi)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '5 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Atún claro en trozos al aceite (Pingüino)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '1kg bolsa', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Queso Edam barra (Corona de Oro)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Nata para cocinar (President)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '1L UHT 18% M.G.', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tomate frito (Gallina Blanca)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '3 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Queso fresco barra', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Aceite alto oleico 80% (Frimasol)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '25 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Callos de ternera (Rogusa)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '2,5kg barra', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Ventresca al vegetal (Corbeta)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, 'lata RO-900', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Morcilla en bolas (Portocarrero)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Chistorra casera (Bricio)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Arroz (SOS)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '1kg x12', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Salsa cheddar (Chovi)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '840 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Fideo perla para fideuá (El Pavo)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '5 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Presa ibérica extra', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Lagarto ibérico congelado al vacío', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pulpo patas cocido al vacío', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '300/400g individual', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Atún solomillo natural', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pluma ibérica extra', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Secreto de bellota 100% ibérico congelado', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Harina de trigo extra (Gallo)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino blanco brick', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '1 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Leche semidesnatada (President)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '1L x12', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Mermelada de arándanos (Hero)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '1kg x2', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Buñuelos de bacalao y picaeta (QBO)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '50 uds 35/40g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Conejo joven troceado', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, 'interfolliado', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Riñones de cerdo', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Garbanzo cocido extra (Penelas)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '570 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Arroz Brillante Sabroz', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Aceite alto rendimiento (Jobellán)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '25 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Aceitunas verdes sin hueso (Hersán)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Seygo'), 0, 0, NULL, NULL, true, '5kg lata', 'Almacén');


-- ======================================================================
-- Proveedor: Exclusivas Almería
-- Tel: 950624112
-- Email: almacen@exclusivasalmeria.com
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '950624112', email = 'almacen@exclusivasalmeria.com'
WHERE nombre = 'Exclusivas Almería';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Canelón de bogavante', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Almería'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Canelón de pollo con trufa', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Almería'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Atún fresco lomo (Fuentes)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Almería'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Alioli', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Almería'), 0, 0, NULL, NULL, true, '130 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Brandada de bacalao ajoarriero', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Almería'), 0, 0, NULL, NULL, true, '130 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Queso tetilla', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Almería'), 0, 0, NULL, NULL, true, '0,6kg x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Queso de oveja trufado curado (gourmet)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Almería'), 0, 0, NULL, NULL, true, '1/2 pieza', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Queso Gouda con pesto verde (Holland Mill)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Almería'), 0, 0, NULL, NULL, true, '4,5 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pintura de gamba', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Exclusivas Almería'), 0, 0, NULL, NULL, true, '250 g', 'Almacén');


-- ======================================================================
-- Proveedor: Antonio Rueda Distribuciones
-- Tel: 690676999
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '690676999'
WHERE nombre = 'Antonio Rueda Distribuciones';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Jamón ibérico de cebo', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Jamón 100% ibérico de bellota D.O.', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Flor Innata Verdejo', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Frizzante Flor Innata', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Gran Bazán Contrapunto', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vermut Casa Alberto', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Izadi Piparra garrafa', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '3,8L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Torrezno Sierra de Toranzo Nº2', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '1,5 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Aliön 2022', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Gallinita Ciega Magnum', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Conde de Valdemar Crianza Magnum', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cava Torremilanos Brut Nature', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cabezada de cerdo extra ibérico', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Lomo doblado 100% ibérico de bellota', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Queso manchego Herencia 7 meses', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '3 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Copa promocional', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino K-Naia', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Naia', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Cenit FB Bonales', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Cenit FB Las Contiesas', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pedro Ximénez Viña 98', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Aceite de oliva virgen marca propia (La Galería)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '500ml PET', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Fuet ibérico de bellota', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Coppa de bellota 100% ibérica', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vino Almirez', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Antonio Rueda Distribuciones'), 0, 0, NULL, NULL, true, '0,75L', 'Almacén');


-- ======================================================================
-- Proveedor: Congelados Hecomar
-- Tel: 950300139
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '950300139'
WHERE nombre = 'Congelados Hecomar';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pulpo en bandeja (Decamar)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '4-5 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tortillitas de camarón extra (Molinero)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '10 uds x12', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Anchoas extra en lata', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '500 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Filete de gallo Pedro grande', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '+300g x6', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Helado granel vainilla (Kalise)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '5 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Helado granel chocolate (Kalise)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '5 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Croqueta pollo/curry Tressoro (Frinca)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '4x500g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Croqueta gastrobar de setas (Frinca)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '4x480g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cola de gambón pelada premium (Hecomar)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '4x900g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Surtido de ahumados', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '1kg tarrina', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Caracola bocina', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '10x1', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Calamar nacional M bordo', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '600/800g x7', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Croqueta gastrobar mar-gambón (Frinca)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '4x480g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Puntilla sin pluma (Marbamar)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '6x1', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Calamar 6/10 (Inter Gold)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '6x2', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Mojama de atún 1ª', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '500g aprox', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Hueva de maruca al vacío', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '300/3000', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Atún rojo extra 1ª centro (Hecomar)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '+3kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cola de gambón extra nº1', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '6x2', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Albóndigas mixtas (Carnia/Ica Food)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '4x1,25kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cola de gambón pelado GG (Pescanova)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '5x1', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Lomos de merluza extra (Del Cabo)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '+200g x5', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tarta tocino de cielo en plancha (La Campiña)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '4,5 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pulpo solomillo premium (Decamar)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Congelados Hecomar'), 0, 0, NULL, NULL, true, '+300g x2', 'Almacén');


-- ======================================================================
-- Proveedor: Panadería Javier Guerrero
-- Tel: 679976657
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '679976657'
WHERE nombre = 'Panadería Javier Guerrero';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pan artesano cocido Sevilla (Rústica Rapid)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Panadería Javier Guerrero'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Barra de pan Omega', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Panadería Javier Guerrero'), 0, 0, NULL, NULL, true, '240g x24', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pan cuadrado en rebanadas', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Panadería Javier Guerrero'), 0, 0, NULL, NULL, true, '1500 g', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pan sin gluten', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Panadería Javier Guerrero'), 0, 0, NULL, NULL, true, '25 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tortas de aceite (Salaillas)', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Panadería Javier Guerrero'), 0, 0, NULL, NULL, true, '80 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pulga redonda', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Panadería Javier Guerrero'), 0, 0, NULL, NULL, true, '150 uds', 'Almacén');


-- ======================================================================
-- Proveedor: Pescadería El Faro
-- Tel: 661205810
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '661205810'
WHERE nombre = 'Pescadería El Faro';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Almeja', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Pescadería El Faro'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Boquerón', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Pescadería El Faro'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Brótola', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Pescadería El Faro'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Bacaladilla', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Pescadería El Faro'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vieiras', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Pescadería El Faro'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Langosta', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Pescadería El Faro'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Gallo Pedro', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Pescadería El Faro'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Sardina', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Pescadería El Faro'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Gamba roja', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Pescadería El Faro'), 0, 0, NULL, NULL, true, NULL, 'Almacén');


-- ======================================================================
-- Proveedor: Manuel Sánchez Rodríguez (Limpieza)
-- Tel: 950140979
-- Email: jualba99@hotmail.com
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '950140979', email = 'jualba99@hotmail.com'
WHERE nombre = 'Manuel Sánchez Rodríguez (Limpieza)';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Gel de manos y ducha dermoprotector', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '5 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Servilleta Kanguro negra punta', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '30 servicios', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Bobina de celulosa laminada', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Papel higiénico industrial laminado', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Detergente lavavajillas industrial (Ponsmatic A/D)', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '6 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Abrillantador de lavavajillas (Ponsdry A/D)', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '5 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Desengrasante multiusos (Asevi Ponkit)', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '5 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Fregasuelos neutro manzana', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '5 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Lavavajillas manual (Extrapon)', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '5 L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Lejía (Continental)', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, 'garrafa 4L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Film transparente 30cm', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, 'rollo 300m', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Film transparente 45cm', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, 'rollo 300m', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Guantes de nitrilo negro', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, 'caja 100 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Bolsa de basura comunidad 85x105', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, 'rollo 10, galga 140, gris', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Fregona de algodón industrial', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Palillos para pinchos 25cm', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '100 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Palillos de papel', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '1000 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Palillos redondos', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '800 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Bolsa con asa 40x50', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '1 kg', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cepillo de buque de raíces', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Servilletas 20x20 tisú negra', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '6000 servicios', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Rollo registradora térmico 80x80', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Bobina secamanos laminada', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Mantel individual 30x40 bioeco', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '1000 uds', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Ambientador V82 Deluxe', 'lim', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '750 ml', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Papel siliconado', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Manuel Sánchez Rodríguez (Limpieza)'), 0, 0, NULL, NULL, true, '40x100m', 'Almacén');


-- ======================================================================
-- Proveedor: Cárnicas del Guadalentín
-- Tel: 968460811
-- Email: carnicas@carnicasguadalentin.com
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '968460811', email = 'carnicas@carnicasguadalentin.com'
WHERE nombre = 'Cárnicas del Guadalentín';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Lomo alto Angus selección USA añojo', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Cárnicas del Guadalentín'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Costillas de hembra centro 6 palos', 'ali', (SELECT id FROM stock_proveedores WHERE nombre='Cárnicas del Guadalentín'), 0, 0, NULL, NULL, true, 'caja 4kg', 'Almacén');


-- ======================================================================
-- Proveedor: Suministros Hosteleros Rueda
-- Tel: 637020553
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '637020553'
WHERE nombre = 'Suministros Hosteleros Rueda';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Pinzas para marisco (inox)', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tenacillas para marisco extra (inox)', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Saca bolas racionador 6cm', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Molde para tarta de queso extra', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Bombona de gas baja', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cartucho de gas 190', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vaso de bombón', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, 'docena', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vaso media pinta 36cl', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, 'docena', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Tenedor lunch', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cuchillo postre (inox)', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cuchillo postre Síntesis', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, 'docena', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Porta hamburguesas kraft', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Suministros Hosteleros Rueda'), 0, 0, NULL, NULL, true, NULL, 'Almacén');


-- ======================================================================
-- Proveedor: Estrellaindal Services (Estrella Damm)
-- Tel: 950600657
-- Email: estrellaindal@euroestrellas.com
-- ======================================================================

UPDATE public.stock_proveedores SET tel = '950600657', email = 'estrellaindal@euroestrellas.com'
WHERE nombre = 'Estrellaindal Services (Estrella Damm)';

INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Estrella Damm 1/3 RET', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'caja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Estrella Daura sin gluten 1/3', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'caja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Voll Damm 1/3 RET', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'caja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Victoria 1/3 RET', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'caja 24u', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Levante tostada sin alcohol 1/3 RET', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'caja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Estrella Levante 60 aniversario', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'caja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Turia Märzen 1/3 RET', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'caja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Vaso de caña Victoria 20cl', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'caja', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Estrella Levante clásica barril', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'barril 50L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza tostada barril', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'barril 30L', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Cerveza Levante sin alcohol 1/3', 'beb', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, 'caja 24', 'Almacén');
INSERT INTO public.stock_productos (local_id, nombre, categoria, proveedor_id, cantidad, minimo, unidad, ean, activo, nota, ubicacion)
VALUES ('3fd1108c-1c7b-4a0e-9141-8527db4e5ccc', 'Balón promocional Mundial FIFA 26', 'mat', (SELECT id FROM stock_proveedores WHERE nombre='Estrellaindal Services (Estrella Damm)'), 0, 0, NULL, NULL, true, NULL, 'Almacén');
