-- ============================================================
--  PROYECTO 2 - Bases de Datos 1
--  Views — usadas por el backend para alimentar la UI
-- ============================================================

USE tienda_db;

-- ------------------------------------------------------------
-- VIEW: vista_inventario
-- Justificación: consolida productos con sus categorías y
-- proveedores en una sola vista que el backend usa para el
-- reporte de inventario sin repetir el JOIN en cada consulta.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW vista_inventario AS
SELECT
    p.id_Producto,
    p.nombre_Producto,
    p.precio_Producto,
    p.stock,
    GROUP_CONCAT(DISTINCT c.nombre_Categoria ORDER BY c.nombre_Categoria SEPARATOR ', ') AS categorias,
    GROUP_CONCAT(DISTINCT pr.nombre_Proveedor ORDER BY pr.nombre_Proveedor SEPARATOR ', ') AS proveedores,
    (p.precio_Producto * p.stock) AS valor_inventario
FROM Producto p
LEFT JOIN Categoria_Producto cp  ON p.id_Producto   = cp.id_Producto
LEFT JOIN Categoria c            ON cp.id_Categoria  = c.id_Categoria
LEFT JOIN Proveedor_Producto pp  ON p.id_Producto   = pp.id_Producto
LEFT JOIN Proveedor pr           ON pp.id_Proveedor  = pr.id_Proveedor
GROUP BY p.id_Producto;