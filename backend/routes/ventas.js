const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/authMiddleware');
const requireRole  = require('../middleware/roleMiddleware');

// Roles:  1=Admin  2=Vendedor  4=Supervisor
const SOLO_LECTURA    = [1, 2, 4];   // pueden ver ventas
const PUEDE_ESCRIBIR  = [1, 2];      // pueden crear / eliminar

router.use(auth);

// GET /api/ventas  — Admin, Vendedor, Supervisor
router.get('/', requireRole(SOLO_LECTURA), async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT v.id_Venta, v.Fecha,
              u.nombre_Usuario,
              c.nombre_Cliente,
              SUM(d.cantidad * d.precio_actual) AS total
       FROM Venta v
       JOIN Usuario u ON v.id_Usuario = u.id_Usuario
       JOIN Cliente c ON v.id_Cliente = c.id_Cliente
       LEFT JOIN Detalle d ON v.id_Venta = d.id_Venta
       GROUP BY v.id_Venta
       ORDER BY v.Fecha DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/ventas/:id  — Admin, Vendedor, Supervisor
router.get('/:id', requireRole(SOLO_LECTURA), async (req, res, next) => {
  try {
    const db = req.app.locals.db;

    const [venta] = await db.query(
      `SELECT v.id_Venta, v.Fecha,
              u.id_Usuario, u.nombre_Usuario,
              c.id_Cliente, c.nombre_Cliente, c.telefono, c.email
       FROM Venta v
       JOIN Usuario u ON v.id_Usuario = u.id_Usuario
       JOIN Cliente c ON v.id_Cliente = c.id_Cliente
       WHERE v.id_Venta = ?`,
      [req.params.id]
    );
    if (venta.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });

    const [detalle] = await db.query(
      `SELECT d.id_Detalle, d.cantidad, d.precio_actual,
              p.id_Producto, p.nombre_Producto,
              (d.cantidad * d.precio_actual) AS subtotal
       FROM Detalle d
       JOIN Producto p ON d.id_Producto = p.id_Producto
       WHERE d.id_Venta = ?`,
      [req.params.id]
    );

    res.json({ ...venta[0], detalle });
  } catch (err) {
    next(err);
  }
});

// POST /api/ventas  — solo Admin y Vendedor
router.post('/', requireRole(PUEDE_ESCRIBIR), async (req, res, next) => {
  const { id_Cliente, detalle } = req.body;
  const id_Usuario = req.usuario.id_Usuario;

  if (!id_Cliente || !detalle || detalle.length === 0) {
    return res.status(400).json({ error: 'id_Cliente y al menos un producto son requeridos' });
  }

  const conn = await req.app.locals.db.getConnection();
  try {
    await conn.beginTransaction();

    const [ventaResult] = await conn.query(
      `INSERT INTO Venta (Fecha, id_Usuario, id_Cliente) VALUES (CURDATE(), ?, ?)`,
      [id_Usuario, id_Cliente]
    );
    const id_Venta = ventaResult.insertId;

    for (const item of detalle) {
      const { id_Producto, cantidad } = item;

      if (!id_Producto || !cantidad || cantidad <= 0) {
        throw Object.assign(new Error('Producto o cantidad inválidos'), { status: 400 });
      }

      const [prod] = await conn.query(
        `SELECT stock, precio_Producto FROM Producto WHERE id_Producto = ? FOR UPDATE`,
        [id_Producto]
      );
      if (prod.length === 0) {
        throw Object.assign(new Error(`Producto ${id_Producto} no existe`), { status: 404 });
      }
      if (prod[0].stock < cantidad) {
        throw Object.assign(
          new Error(`Stock insuficiente para el producto ${id_Producto} (disponible: ${prod[0].stock})`),
          { status: 400 }
        );
      }

      await conn.query(
        `INSERT INTO Detalle (cantidad, precio_actual, id_Venta, id_Producto)
         VALUES (?, ?, ?, ?)`,
        [cantidad, prod[0].precio_Producto, id_Venta, id_Producto]
      );

      await conn.query(
        `UPDATE Producto SET stock = stock - ? WHERE id_Producto = ?`,
        [cantidad, id_Producto]
      );
    }

    await conn.commit();
    res.status(201).json({ id_Venta, mensaje: 'Venta registrada correctamente' });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// DELETE /api/ventas/:id  — solo Admin y Vendedor
router.delete('/:id', requireRole(PUEDE_ESCRIBIR), async (req, res, next) => {
  const conn = await req.app.locals.db.getConnection();
  try {
    await conn.beginTransaction();

    const [detalle] = await conn.query(
      `SELECT id_Producto, cantidad FROM Detalle WHERE id_Venta = ?`,
      [req.params.id]
    );
    for (const item of detalle) {
      await conn.query(
        `UPDATE Producto SET stock = stock + ? WHERE id_Producto = ?`,
        [item.cantidad, item.id_Producto]
      );
    }

    await conn.query(`DELETE FROM Detalle WHERE id_Venta = ?`, [req.params.id]);
    const [result] = await conn.query(
      `DELETE FROM Venta WHERE id_Venta = ?`, [req.params.id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    await conn.commit();
    res.json({ mensaje: 'Venta eliminada y stock restaurado' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;