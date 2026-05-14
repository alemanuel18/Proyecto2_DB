USE tienda_db;

-- ------------------------------------------------------------
-- 1. Crear Roles
-- ------------------------------------------------------------
DROP ROLE IF EXISTS 'Administrador', 'Vendedor', 'Bodeguero', 'Supervisor', 'Cajero';

CREATE ROLE 'Administrador';
CREATE ROLE 'Vendedor';
CREATE ROLE 'Bodeguero';
CREATE ROLE 'Supervisor';
CREATE ROLE 'Cajero';

-- ------------------------------------------------------------
-- 2. Asignar Permisos a Roles
-- ------------------------------------------------------------

-- Administrador: Acceso total
GRANT ALL PRIVILEGES ON tienda_db.* TO 'Administrador';

-- Vendedor: SELECT Cliente, Producto. SELECT, INSERT, UPDATE en Venta, Detalle, Cliente.
GRANT SELECT, INSERT, UPDATE ON tienda_db.Cliente TO 'Vendedor';
GRANT SELECT ON tienda_db.Producto TO 'Vendedor';
GRANT SELECT, INSERT, UPDATE ON tienda_db.Venta TO 'Vendedor';
GRANT SELECT, INSERT, UPDATE ON tienda_db.Detalle TO 'Vendedor';

-- Bodeguero: SELECT a Categoria, Proveedor y sus tablas intermedias. SELECT, INSERT, UPDATE en Producto.
GRANT SELECT ON tienda_db.Categoria TO 'Bodeguero';
GRANT SELECT ON tienda_db.Proveedor TO 'Bodeguero';
GRANT SELECT ON tienda_db.Categoria_Producto TO 'Bodeguero';
GRANT SELECT ON tienda_db.Proveedor_Producto TO 'Bodeguero';
GRANT SELECT, INSERT, UPDATE ON tienda_db.Producto TO 'Bodeguero';

-- Supervisor: SELECT en todas las tablas. INSERT, UPDATE en Proveedor, Cliente, Categoria.
GRANT SELECT ON tienda_db.* TO 'Supervisor';
GRANT INSERT, UPDATE ON tienda_db.Proveedor TO 'Supervisor';
GRANT INSERT, UPDATE ON tienda_db.Cliente TO 'Supervisor';
GRANT INSERT, UPDATE ON tienda_db.Categoria TO 'Supervisor';

-- Cajero: SELECT Cliente, Producto. SELECT, INSERT, UPDATE en Venta, Detalle.
GRANT SELECT ON tienda_db.Cliente TO 'Cajero';
GRANT SELECT ON tienda_db.Producto TO 'Cajero';
GRANT SELECT, INSERT, UPDATE ON tienda_db.Venta TO 'Cajero';
GRANT SELECT, INSERT, UPDATE ON tienda_db.Detalle TO 'Cajero';

-- ------------------------------------------------------------
-- 3. Crear Usuario Maestro Obligatorio
-- ------------------------------------------------------------
DROP USER IF EXISTS 'proy3'@'%';
CREATE USER 'proy3'@'%' IDENTIFIED BY 'secret';
-- Se le otorgan todos los privilegios globales con opción de otorgarlos a otros
GRANT ALL PRIVILEGES ON *.* TO 'proy3'@'%' WITH GRANT OPTION;

FLUSH PRIVILEGES;
