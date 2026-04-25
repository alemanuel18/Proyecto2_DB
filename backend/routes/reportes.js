const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');

router.use(auth);

// ─────────────────────────────────────────────────────────────
// GET /api/reportes/ventas-por-mes
// GROUP BY + HAVING + función de agregación (visible en UI)
// Muestra meses con ventas totales superiores a Q0
// ─────────────────────────────────────────────────────────────
router.get('/ventas-por-mes', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(v.Fecha, '%Y-%m') AS mes,
              COUNT(DISTINCT v.id_Venta)    AS cantidad_ventas,
              SUM(d.cantidad * d.precio_actual) AS total_ventas
       FROM Venta v
       JOIN Detalle d ON v.id_Venta = d.id_Venta
       GROUP BY mes
       HAVING total_ventas > 0
       ORDER BY mes DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/reportes/productos-mas-vendidos
// Subquery en FROM (visible en UI)
// Muestra los 10 productos con mayor cantidad vendida
// ─────────────────────────────────────────────────────────────
router.get('/productos-mas-vendidos', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT resumen.id_Producto,
              resumen.nombre_Producto,
              resumen.total_vendido,
              resumen.ingresos_generados
       FROM (
         SELECT p.id_Producto,
                p.nombre_Producto,
                SUM(d.cantidad)                   AS total_vendido,
                SUM(d.cantidad * d.precio_actual) AS ingresos_generados
         FROM Detalle d
         JOIN Producto p ON d.id_Producto = p.id_Producto
         GROUP BY p.id_Producto
       ) AS resumen
       ORDER BY resumen.total_vendido DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/reportes/clientes-sin-compras
// Subquery con NOT IN (visible en UI)
// ─────────────────────────────────────────────────────────────
router.get('/clientes-sin-compras', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT id_Cliente, nombre_Cliente, email, telefono
       FROM Cliente
       WHERE id_Cliente NOT IN (
         SELECT DISTINCT id_Cliente FROM Venta
       )
       ORDER BY nombre_Cliente`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/reportes/top-clientes
// CTE (WITH) — visible en UI
// Muestra los clientes con mayor gasto total
// ─────────────────────────────────────────────────────────────
router.get('/top-clientes', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `WITH gasto_cliente AS (
         SELECT c.id_Cliente,
                c.nombre_Cliente,
                c.email,
                COUNT(DISTINCT v.id_Venta)            AS total_compras,
                SUM(d.cantidad * d.precio_actual)      AS gasto_total
         FROM Cliente c
         JOIN Venta v   ON c.id_Cliente  = v.id_Cliente
         JOIN Detalle d ON v.id_Venta    = d.id_Venta
         GROUP BY c.id_Cliente
       )
       SELECT *
       FROM gasto_cliente
       ORDER BY gasto_total DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/reportes/resumen-inventario
// Usa el VIEW vista_inventario (definido en 04_views.sql)
// ─────────────────────────────────────────────────────────────
router.get('/resumen-inventario', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(`SELECT * FROM vista_inventario ORDER BY stock ASC`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/reportes/vendedores-activos
// Subquery correlacionado con EXISTS (visible en UI)
// Muestra usuarios que han registrado al menos 1 venta
// ─────────────────────────────────────────────────────────────
router.get('/vendedores-activos', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT u.id_Usuario, u.nombre_Usuario, r.nombre_Rol
       FROM Usuario u
       JOIN Rol r ON u.id_Rol = r.id_Rol
       WHERE EXISTS (
         SELECT 1 FROM Venta v WHERE v.id_Usuario = u.id_Usuario
       )
       ORDER BY u.nombre_Usuario`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;