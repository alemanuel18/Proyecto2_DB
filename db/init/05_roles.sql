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

-- ------------------------------------------------------------
-- 4. Crear Usuarios Reales de Base de Datos y Asignar Roles
-- ------------------------------------------------------------
DELIMITER //
CREATE PROCEDURE GenerarUsuariosDB()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_user VARCHAR(100);
    DECLARE v_rol VARCHAR(50);
    DECLARE cur CURSOR FOR 
        SELECT u.nombre_Usuario, r.nombre_Rol 
        FROM Usuario u 
        JOIN Rol r ON u.id_Rol = r.id_Rol;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_user, v_rol;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Eliminar usuario si existe
        SET @drop_user = CONCAT('DROP USER IF EXISTS ''', v_user, '''@''%''');
        PREPARE stmt_drop FROM @drop_user;
        EXECUTE stmt_drop;
        DEALLOCATE PREPARE stmt_drop;

        -- Crear usuario (contraseña por defecto 'Pass1234')
        SET @create_user = CONCAT('CREATE USER ''', v_user, '''@''%'' IDENTIFIED BY ''Pass1234''');
        PREPARE stmt_create FROM @create_user;
        EXECUTE stmt_create;
        DEALLOCATE PREPARE stmt_create;

        -- Asignar rol
        SET @grant_role = CONCAT('GRANT ''', v_rol, ''' TO ''', v_user, '''@''%''');
        PREPARE stmt_grant FROM @grant_role;
        EXECUTE stmt_grant;
        DEALLOCATE PREPARE stmt_grant;

        -- Aplicar rol por defecto
        SET @default_role = CONCAT('SET DEFAULT ROLE ''', v_rol, ''' TO ''', v_user, '''@''%''');
        PREPARE stmt_default FROM @default_role;
        EXECUTE stmt_default;
        DEALLOCATE PREPARE stmt_default;
    END LOOP;

    CLOSE cur;
    FLUSH PRIVILEGES;
END //
DELIMITER ;

-- Ejecutar y limpiar
CALL GenerarUsuariosDB();
DROP PROCEDURE IF EXISTS GenerarUsuariosDB;
