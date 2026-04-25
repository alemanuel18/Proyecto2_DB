const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/authMiddleware');
const requireRole  = require('../middleware/roleMiddleware');

// Reportes: Admin y Supervisor pueden ver todos
const LECTURA = [1, 4];

router.use(auth);

router.get('/ventas-por-mes', requireRole(LECTURA), async (req, res, next) => {
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

router.get('/productos-mas-vendidos', requireRole(LECTURA), async (req, res, next) => {
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

router.get('/clientes-sin-compras', requireRole(LECTURA), async (req, res, next) => {
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

router.get('/top-clientes', requireRole(LECTURA), async (req, res, next) => {
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

router.get('/resumen-inventario', requireRole(LECTURA), async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(`SELECT * FROM vista_inventario ORDER BY stock ASC`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/vendedores-activos', requireRole(LECTURA), async (req, res, next) => {
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