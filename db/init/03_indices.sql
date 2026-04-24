-- ============================================================
--  PROYECTO 2 - Bases de Datos 1
--  Índices explícitos con CREATE INDEX y justificación
-- ============================================================

USE tienda_db;

-- ------------------------------------------------------------
-- ÍNDICE 1: Venta.Fecha
-- ------------------------------------------------------------
-- Justificación:
--   La columna Fecha es utilizada frecuentemente en consultas de
--   reportes de ventas (filtros por rango de fechas, agrupaciones
--   mensuales/anuales). Sin índice, cada consulta de reporte
--   realiza un full table scan sobre toda la tabla Venta.
--   Al indexar Fecha, el motor puede localizar rápidamente las
--   filas dentro de un rango de fechas sin recorrer toda la tabla,
--   lo que mejora significativamente el rendimiento en consultas
--   como: WHERE Fecha BETWEEN '2026-01-01' AND '2026-03-31'
--   o GROUP BY MONTH(Fecha).
-- ------------------------------------------------------------
CREATE INDEX idx_venta_fecha
    ON Venta (Fecha);


-- ------------------------------------------------------------
-- ÍNDICE 2: Producto.nombre_Producto
-- ------------------------------------------------------------
-- Justificación:
--   La columna nombre_Producto es la principal columna de búsqueda
--   cuando los usuarios buscan un producto por nombre en la interfaz
--   (búsquedas tipo LIKE 'Laptop%' o igualdad exacta).
--   Sin índice, cada búsqueda de producto requiere un full scan de
--   la tabla Producto. Con el índice, el motor puede resolver
--   búsquedas por prefijo de nombre de forma eficiente mediante
--   un B-Tree index scan, reduciendo el tiempo de respuesta en la UI
--   especialmente cuando el catálogo de productos crece.
-- ------------------------------------------------------------
CREATE INDEX idx_producto_nombre
    ON Producto (nombre_Producto);


-- ------------------------------------------------------------
-- ÍNDICE 3 (adicional recomendado): Detalle.id_Venta
-- ------------------------------------------------------------
-- Justificación:
--   Las consultas de detalle de venta (JOIN entre Venta y Detalle)
--   son muy frecuentes en la aplicación. La FK id_Venta en Detalle
--   se usa constantemente en cláusulas WHERE id_Venta = ?
--   al consultar el detalle de una venta específica.
--   MySQL no crea automáticamente índices en columnas FK (a diferencia
--   de PostgreSQL), por lo que se define explícitamente para acelerar
--   los JOINs y evitar full scans en la tabla Detalle.
-- ------------------------------------------------------------
CREATE INDEX idx_detalle_venta
    ON Detalle (id_Venta);


-- ------------------------------------------------------------
-- ÍNDICE 4 (adicional recomendado): Usuario.nombre_Usuario
-- ------------------------------------------------------------
-- Justificación:
--   La columna nombre_Usuario es utilizada en el proceso de login
--   para verificar credenciales (WHERE nombre_Usuario = ?).
--   Esta consulta se ejecuta en cada inicio de sesión, por lo que
--   un índice en esta columna garantiza una búsqueda O(log n)
--   en lugar de O(n), lo cual es crítico para el rendimiento
--   del sistema de autenticación.
-- ------------------------------------------------------------
CREATE INDEX idx_usuario_nombre
    ON Usuario (nombre_Usuario);
