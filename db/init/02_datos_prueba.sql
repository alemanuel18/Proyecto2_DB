-- ============================================================
--  PROYECTO 2 - Bases de Datos 1
--  Script de datos de prueba realistas
--  Mínimo 25 registros por tabla
-- ============================================================

USE tienda_db;

-- ------------------------------------------------------------
-- Rol (5 registros)
-- ------------------------------------------------------------
INSERT INTO Rol (nombre_Rol) VALUES
('Administrador'),
('Vendedor'),
('Bodeguero'),
('Supervisor'),
('Cajero');

-- ------------------------------------------------------------
-- Usuario (25 registros)
-- ------------------------------------------------------------
INSERT INTO Usuario (nombre_Usuario, password, id_Rol) VALUES
('carlos.mendez',    SHA2('Pass1234', 256), 1),
('ana.garcia',       SHA2('Pass1234', 256), 2),
('pedro.lopez',      SHA2('Pass1234', 256), 2),
('maria.juarez',     SHA2('Pass1234', 256), 3),
('jose.perez',       SHA2('Pass1234', 256), 4),
('lucia.ramirez',    SHA2('Pass1234', 256), 2),
('roberto.castillo', SHA2('Pass1234', 256), 5),
('sofia.morales',    SHA2('Pass1234', 256), 2),
('diego.herrera',    SHA2('Pass1234', 256), 3),
('valentina.ruiz',   SHA2('Pass1234', 256), 2),
('andres.flores',    SHA2('Pass1234', 256), 5),
('gabriela.reyes',   SHA2('Pass1234', 256), 2),
('miguel.soto',      SHA2('Pass1234', 256), 4),
('isabella.vargas',  SHA2('Pass1234', 256), 2),
('fernando.diaz',    SHA2('Pass1234', 256), 3),
('daniela.ortiz',    SHA2('Pass1234', 256), 2),
('juan.sandoval',    SHA2('Pass1234', 256), 5),
('camila.torres',    SHA2('Pass1234', 256), 2),
('luis.navarro',     SHA2('Pass1234', 256), 1),
('paula.vega',       SHA2('Pass1234', 256), 2),
('hector.rojas',     SHA2('Pass1234', 256), 3),
('natalia.fuentes',  SHA2('Pass1234', 256), 2),
('oscar.delgado',    SHA2('Pass1234', 256), 5),
('andrea.silva',     SHA2('Pass1234', 256), 2),
('kevin.pineda',     SHA2('Pass1234', 256), 4);

-- ------------------------------------------------------------
-- Cliente (25 registros)
-- ------------------------------------------------------------
INSERT INTO Cliente (nombre_Cliente, telefono, direccion, email, NIT) VALUES
('Empresa Textiles SA',      '24561234', '6a Av 12-34 Zona 1, Guatemala',    'textiles@empresa.gt',    '1234567-8'),
('Ferreteria El Martillo',   '22345678', '5a Calle 8-90 Zona 4, Guatemala',  'martillo@ferreteria.gt', '2345678-9'),
('Distribuidora Norte',      '23456789', 'Calzada Roosevelt 45, Mixco',      'norte@distri.gt',        '3456789-0'),
('Comercial Las Flores',     '24567890', '10a Av 15-20 Zona 10, Guatemala',  'flores@comercial.gt',    '4567890-1'),
('Supermercado El Campo',    '25678901', 'Bulevar Los Próceres 50, GT',      'campo@super.gt',         '5678901-2'),
('Restaurante La Fonda',     '26789012', '3a Calle 5-60 Zona 9, Guatemala',  'lafonda@rest.gt',        '6789012-3'),
('Clinica San Rafael',       '27890123', '12a Av 8-15 Zona 11, Guatemala',   'sanrafael@clinica.gt',   '7890123-4'),
('Hotel Las Palmas',         '28901234', '2a Calle 10-50 Zona 14, GT',       'palmas@hotel.gt',        '8901234-5'),
('Farmacia Vida Sana',       '29012345', '1a Av 20-30 Zona 1, Guatemala',    'vidasana@farma.gt',      '9012345-6'),
('Constructora Piedra Verde','20123456', 'Carretera al Atlántico Km 15',     'pverde@const.gt',        '0123456-7'),
('Panaderia El Trigo',       '24123456', '7a Calle 3-45 Zona 3, Guatemala',  'trigo@panad.gt',         '1122334-4'),
('Libreria Minerva',         '24234567', '8a Av 4-56 Zona 1, Guatemala',     'minerva@lib.gt',         '2233445-5'),
('Taller Mecanico Express',  '24345678', 'Calzada San Juan 789, Mixco',      'express@taller.gt',      '3344556-6'),
('Salon de Belleza Glamour', '24456789', '15a Calle 6-78 Zona 10, GT',       'glamour@salon.gt',       '4455667-7'),
('Papeleria El Estudiante',  '24567891', '9a Av 1-23 Zona 1, Guatemala',     'estudiante@pap.gt',      '5566778-8'),
('Tienda Naturista Sol',     '24678902', '4a Calle 7-89 Zona 7, Guatemala',  'sol@naturista.gt',       '6677889-9'),
('Agencia de Viajes Mundo',  '24789013', '16a Av 10-12 Zona 13, Guatemala',  'mundo@viajes.gt',        '7788990-0'),
('Gym Fuerza Total',         '24890124', 'Bulevar Liberación 34, Guatemala', 'total@gym.gt',           '8899001-1'),
('Colegio San Marcos',       '24901235', '11a Calle 2-34 Zona 6, Guatemala', 'sanmarcos@col.gt',       '9900112-2'),
('Bodega Central',           '25012346', '13a Av 5-67 Zona 12, Guatemala',   'central@bodega.gt',      '0011223-3'),
('Veterinaria Animal',       '25123457', '2a Calle 8-90 Zona 5, Guatemala',  'animal@veter.gt',        '1123456-7'),
('Electronica Futuro',       '25234568', '6a Calle 12-34 Zona 4, Guatemala', 'futuro@elect.gt',        '2234567-8'),
('Muebleria El Hogar',       '25345679', '14a Av 9-01 Zona 7, Guatemala',    'hogar@mueble.gt',        '3345678-9'),
('Optica Vision Clara',      '25456780', '5a Av 11-23 Zona 9, Guatemala',    'clara@optica.gt',        '4456789-0'),
('Centro Comercial Plaza',   '25567891', '18a Calle 4-56 Zona 10, GT',       'plaza@centro.gt',        '5567890-1');

-- ------------------------------------------------------------
-- Categoria (5 registros)
-- ------------------------------------------------------------
INSERT INTO Categoria (nombre_Categoria) VALUES
('Electrónica'),
('Ropa y Textiles'),
('Alimentos y Bebidas'),
('Herramientas'),
('Papelería y Oficina');

-- ------------------------------------------------------------
-- Proveedor (25 registros)
-- ------------------------------------------------------------
INSERT INTO Proveedor (nombre_Proveedor, telefono, email) VALUES
('Tech Import SA',           '24100001', 'ventas@techimport.gt'),
('Distribuidora Global',     '24100002', 'info@distriglobal.gt'),
('Industrias Textiles GT',   '24100003', 'pedidos@textilgt.gt'),
('Agro Distribuciones',      '24100004', 'agro@distrib.gt'),
('Papeles y Más',            '24100005', 'ventas@papelesmas.gt'),
('Herramientas Pro',         '24100006', 'pro@herramientas.gt'),
('Bebidas del Sur',          '24100007', 'sur@bebidas.gt'),
('Electro Mayorista',        '24100008', 'mayor@electro.gt'),
('Confecciones Nacionales',  '24100009', 'conf@nacional.gt'),
('Alimentos Frescos SA',     '24100010', 'frescos@alimentos.gt'),
('Importadora Omega',        '24100011', 'omega@import.gt'),
('Ferreteria Central',       '24100012', 'central@ferreteria.gt'),
('Editorial Escolar',        '24100013', 'escolar@editorial.gt'),
('Computación Avanzada',     '24100014', 'avanz@comp.gt'),
('Proveedor Lácteos GT',     '24100015', 'lacteos@provedor.gt'),
('Mayorista del Norte',      '24100016', 'norte@mayorista.gt'),
('Uniformes y Telas',        '24100017', 'telas@uniformes.gt'),
('Cafetería Selecta',        '24100018', 'selecta@cafe.gt'),
('Artículos de Oficina',     '24100019', 'oficina@articulos.gt'),
('Plásticos y Empaques',     '24100020', 'empaques@plastico.gt'),
('Cómputo Total',            '24100021', 'total@computo.gt'),
('Snacks y Dulces SA',       '24100022', 'dulces@snacks.gt'),
('Materiales Eléctricos',    '24100023', 'elect@materiales.gt'),
('Farmacéutica Salud',       '24100024', 'salud@farma.gt'),
('Decoraciones Hogar',       '24100025', 'hogar@decor.gt');

-- ------------------------------------------------------------
-- Producto (25 registros)
-- ------------------------------------------------------------
INSERT INTO Producto (nombre_Producto, precio_Producto, stock) VALUES
('Laptop HP 15"',             4500.00, 30),
('Mouse Inalámbrico',           120.00, 150),
('Teclado Mecánico',            350.00, 80),
('Monitor LED 24"',           1800.00, 40),
('Camisa Polo Talla M',         85.00, 200),
('Pantalón Jean Clásico',      150.00, 120),
('Camiseta Deportiva',          60.00, 300),
('Arroz Integral 1lb',          12.50, 500),
('Aceite Vegetal 1lt',          22.00, 400),
('Café Molido 250g',            35.00, 250),
('Martillo 16oz',               75.00, 60),
('Destornillador Set x10',      95.00, 45),
('Taladro Eléctrico 500W',     450.00, 25),
('Resma de Papel A4 500h',      45.00, 300),
('Bolígrafos Azul x12',         18.00, 500),
('Cuaderno 100 hojas',          15.00, 400),
('Audífonos Bluetooth',        250.00, 70),
('Memoria USB 32GB',            80.00, 180),
('Cargador Universal',         110.00, 100),
('Zapatos Cuero Negro',        350.00, 90),
('Leche Entera 1lt',            14.00, 600),
('Gaseosa 600ml',                8.50, 800),
('Disco Duro 1TB',             650.00, 35),
('Impresora Inyección',       1200.00, 20),
('Silla Ergonómica Oficina',  1500.00, 15);

-- ------------------------------------------------------------
-- Categoria_Producto (relación M:N)
-- ------------------------------------------------------------
INSERT INTO Categoria_Producto (id_Categoria, id_Producto) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),   -- Electrónica
(1, 17),(1, 18),(1, 19),(1, 23),
(1, 24),
(2, 5), (2, 6), (2, 7), (2, 20),  -- Ropa y Textiles
(3, 8), (3, 9), (3, 10),(3, 21),  -- Alimentos y Bebidas
(3, 22),
(4, 11),(4, 12),(4, 13),           -- Herramientas
(5, 14),(5, 15),(5, 16),(5, 25);  -- Papelería y Oficina

-- ------------------------------------------------------------
-- Proveedor_Producto (relación M:N)
-- ------------------------------------------------------------
INSERT INTO Proveedor_Producto (id_Proveedor, id_Producto) VALUES
(1,  1), (1,  2), (1,  3),
(8,  1), (8,  4), (8, 17),
(14, 1), (14,23), (14,24),
(21, 2), (21,18), (21,19),
(3,  5), (3,  6), (3,  7),
(9,  5), (9, 20),
(17, 6), (17, 7),
(4,  8), (4,  9), (4, 10),
(10, 8), (10,21), (10,22),
(15,21), (7, 22), (18,10),
(6, 11), (6, 12), (6, 13),
(12,11), (12,12),
(5, 14), (5, 15), (5, 16),
(13,14), (13,16),
(19,15), (25,25);

-- ------------------------------------------------------------
-- Venta (25 registros)
-- ------------------------------------------------------------
INSERT INTO Venta (Fecha, id_Usuario, id_Cliente) VALUES
('2026-01-05',  2,  1),
('2026-01-08',  3,  2),
('2026-01-10',  6,  3),
('2026-01-12',  8,  4),
('2026-01-15',  2,  5),
('2026-01-18',  3,  6),
('2026-01-20', 10,  7),
('2026-01-22', 12,  8),
('2026-01-25',  6,  9),
('2026-01-28',  8, 10),
('2026-02-01',  2, 11),
('2026-02-03',  3, 12),
('2026-02-05', 14, 13),
('2026-02-08', 16, 14),
('2026-02-10',  6, 15),
('2026-02-12', 20, 16),
('2026-02-15', 22, 17),
('2026-02-18',  2, 18),
('2026-02-20',  8, 19),
('2026-02-22',  3, 20),
('2026-03-01',  6, 21),
('2026-03-05', 12, 22),
('2026-03-08', 14, 23),
('2026-03-10', 10, 24),
('2026-03-15',  2, 25);

-- ------------------------------------------------------------
-- Detalle (25 registros)
-- ------------------------------------------------------------
INSERT INTO Detalle (cantidad, precio_actual, id_Venta, id_Producto) VALUES
(2, 4500.00,  1,  1),
(3,  120.00,  1,  2),
(1, 1800.00,  2,  4),
(5,   85.00,  3,  5),
(2,  150.00,  3,  6),
(10,  12.50,  4,  8),
(5,   22.00,  4,  9),
(2,  450.00,  5, 13),
(3,   75.00,  5, 11),
(20,  45.00,  6, 14),
(15,  18.00,  6, 15),
(1, 4500.00,  7,  1),
(2,  350.00,  7,  3),
(3,  250.00,  8, 17),
(4,   80.00,  8, 18),
(2,  650.00,  9, 23),
(1, 1200.00,  9, 24),
(3,  350.00, 10, 20),
(2,  110.00, 11, 19),
(5,   35.00, 12, 10),
(10,  14.00, 13, 21),
(20,   8.50, 14, 22),
(1, 1500.00, 15, 25),
(3,   95.00, 16, 12),
(2,   60.00, 17,  7);
