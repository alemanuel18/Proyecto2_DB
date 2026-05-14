USE tienda_db;

DELIMITER //

-- ============================================================
-- 1. crear_venta
-- ============================================================
DROP PROCEDURE IF EXISTS crear_venta //
CREATE PROCEDURE crear_venta(
    IN p_id_cliente INT,
    IN p_id_usuario INT,
    IN p_detalles_json JSON,
    OUT p_id_venta INT,
    OUT p_estado VARCHAR(200)
)
BEGIN
    DECLARE v_id_venta INT;
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_count INT;
    DECLARE v_id_producto INT;
    DECLARE v_cantidad INT;
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_stock_actual INT;
    
    -- Handler para manejar excepciones SQL
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_estado = 'ERROR: Transacción fallida, cambios revertidos por SQLEXCEPTION.';
        SET p_id_venta = NULL;
    END;

    START TRANSACTION;
    
    -- Validar que el cliente existe
    IF NOT EXISTS (SELECT 1 FROM Cliente WHERE id_Cliente = p_id_cliente) THEN
        SET p_estado = 'ERROR: El cliente no existe.';
        ROLLBACK;
    ELSEIF NOT EXISTS (SELECT 1 FROM Usuario WHERE id_Usuario = p_id_usuario) THEN
        SET p_estado = 'ERROR: El usuario no existe.';
        ROLLBACK;
    ELSE
        -- Insertar la Venta
        INSERT INTO Venta (Fecha, id_Usuario, id_Cliente)
        VALUES (CURDATE(), p_id_usuario, p_id_cliente);
        
        SET v_id_venta = LAST_INSERT_ID();
        
        -- Obtener longitud del array JSON
        SET v_count = JSON_LENGTH(p_detalles_json);
        
        -- Iterar los detalles
        WHILE v_i < v_count DO
            SET v_id_producto = JSON_UNQUOTE(JSON_EXTRACT(p_detalles_json, CONCAT('$[', v_i, '].id_producto')));
            SET v_cantidad = JSON_UNQUOTE(JSON_EXTRACT(p_detalles_json, CONCAT('$[', v_i, '].cantidad')));
            -- Obtener precio actual
            SET v_precio = (SELECT precio_Producto FROM Producto WHERE id_Producto = v_id_producto);
            
            -- Validar stock usando FOR UPDATE para bloquear concurrencia
            SELECT stock INTO v_stock_actual FROM Producto WHERE id_Producto = v_id_producto FOR UPDATE;
            
            IF v_stock_actual < v_cantidad THEN
                -- No hay suficiente stock
                SET p_estado = CONCAT('ERROR: Stock insuficiente para el producto ID ', v_id_producto);
                ROLLBACK;
                -- Terminar ejecución forzando salir del bloque
                LEAVE WHILE; 
            END IF;
            
            -- Insertar detalle
            INSERT INTO Detalle (cantidad, precio_actual, id_Venta, id_Producto)
            VALUES (v_cantidad, v_precio, v_id_venta, v_id_producto);
            
            -- Descontar stock
            UPDATE Producto 
            SET stock = stock - v_cantidad 
            WHERE id_Producto = v_id_producto;
            
            SET v_i = v_i + 1;
        END WHILE;

        -- Si no hubo errores, confirmar transacción
        IF p_estado IS NULL OR p_estado NOT LIKE 'ERROR%' THEN
            COMMIT;
            SET p_id_venta = v_id_venta;
            SET p_estado = 'EXITO: Venta registrada correctamente.';
        END IF;
    END IF;
END //

-- ============================================================
-- 2. eliminar_venta_restaurar_stock
-- ============================================================
DROP PROCEDURE IF EXISTS eliminar_venta_restaurar_stock //
CREATE PROCEDURE eliminar_venta_restaurar_stock(
    IN p_id_venta INT,
    OUT p_estado VARCHAR(200)
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id_producto INT;
    DECLARE v_cantidad INT;
    DECLARE cur CURSOR FOR SELECT id_Producto, cantidad FROM Detalle WHERE id_Venta = p_id_venta;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_estado = 'ERROR: No se pudo eliminar la venta (SQLEXCEPTION).';
    END;

    START TRANSACTION;
    
    IF NOT EXISTS (SELECT 1 FROM Venta WHERE id_Venta = p_id_venta) THEN
        SET p_estado = 'ERROR: La venta no existe.';
        ROLLBACK;
    ELSE
        OPEN cur;
        read_loop: LOOP
            FETCH cur INTO v_id_producto, v_cantidad;
            IF done THEN
                LEAVE read_loop;
            END IF;
            -- Restaurar stock
            UPDATE Producto SET stock = stock + v_cantidad WHERE id_Producto = v_id_producto;
        END LOOP;
        CLOSE cur;
        
        -- Eliminar detalle
        DELETE FROM Detalle WHERE id_Venta = p_id_venta;
        -- Eliminar venta
        DELETE FROM Venta WHERE id_Venta = p_id_venta;
        
        COMMIT;
        SET p_estado = 'EXITO: Venta eliminada y stock restaurado.';
    END IF;
END //

-- ============================================================
-- 3. actualizar_stock_producto
-- ============================================================
DROP PROCEDURE IF EXISTS actualizar_stock_producto //
CREATE PROCEDURE actualizar_stock_producto(
    IN p_id_producto INT,
    IN p_cantidad INT,
    IN p_tipo_movimiento ENUM('ENTRADA', 'SALIDA'),
    OUT p_estado VARCHAR(200)
)
BEGIN
    DECLARE v_stock_actual INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION 
    BEGIN
        ROLLBACK;
        SET p_estado = 'ERROR: Error al actualizar el stock (SQLEXCEPTION).';
    END;
    
    START TRANSACTION;
    
    IF NOT EXISTS (SELECT 1 FROM Producto WHERE id_Producto = p_id_producto) THEN
        SET p_estado = 'ERROR: Producto no existe.';
        ROLLBACK;
    ELSE
        SELECT stock INTO v_stock_actual FROM Producto WHERE id_Producto = p_id_producto FOR UPDATE;
        IF p_tipo_movimiento = 'ENTRADA' THEN
            UPDATE Producto SET stock = stock + p_cantidad WHERE id_Producto = p_id_producto;
            SET p_estado = 'EXITO: Stock incrementado.';
            COMMIT;
        ELSEIF p_tipo_movimiento = 'SALIDA' THEN
            IF v_stock_actual >= p_cantidad THEN
                UPDATE Producto SET stock = stock - p_cantidad WHERE id_Producto = p_id_producto;
                SET p_estado = 'EXITO: Stock decrementado.';
                COMMIT;
            ELSE
                SET p_estado = 'ERROR: Stock insuficiente para salida.';
                ROLLBACK;
            END IF;
        ELSE
            SET p_estado = 'ERROR: Tipo de movimiento inválido.';
            ROLLBACK;
        END IF;
    END IF;
END //

-- ============================================================
-- 4. reporte_ventas_por_fecha
-- ============================================================
DROP PROCEDURE IF EXISTS reporte_ventas_por_fecha //
CREATE PROCEDURE reporte_ventas_por_fecha(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT v.id_Venta, v.Fecha, c.nombre_Cliente, u.nombre_Usuario, SUM(d.cantidad * d.precio_actual) AS Total
    FROM Venta v
    JOIN Cliente c ON v.id_Cliente = c.id_Cliente
    JOIN Usuario u ON v.id_Usuario = u.id_Usuario
    JOIN Detalle d ON v.id_Venta = d.id_Venta
    WHERE v.Fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY v.id_Venta, v.Fecha, c.nombre_Cliente, u.nombre_Usuario
    ORDER BY v.Fecha DESC;
END //

-- ============================================================
-- 5. top_productos_mas_vendidos
-- ============================================================
DROP PROCEDURE IF EXISTS top_productos_mas_vendidos //
CREATE PROCEDURE top_productos_mas_vendidos(
    IN p_limit INT
)
BEGIN
    SELECT p.id_Producto, p.nombre_Producto, SUM(d.cantidad) AS total_vendido
    FROM Detalle d
    JOIN Producto p ON d.id_Producto = p.id_Producto
    GROUP BY p.id_Producto, p.nombre_Producto
    ORDER BY total_vendido DESC
    LIMIT p_limit;
END //

DELIMITER ;
