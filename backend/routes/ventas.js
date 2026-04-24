const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');

router.use(auth);

// GET /api/ventas
// JOIN: Venta + Usuario + Cliente (consulta con JOIN múltiple visible en UI)
router.get('/', async (req, res, next) => {
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

// GET /api/ventas/:id  — detalle completo de una venta
// JOIN: Venta + Detalle + Producto (segundo JOIN múltiple visible en UI)
router.get('/:id', async (req, res, next) => {
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

// POST /api/ventas
// Transacción explícita: inserta Venta + Detalle y descuenta stock.
// Hace ROLLBACK si el stock es insuficiente o cualquier INSERT falla.
// Body: { id_Cliente, detalle: [{ id_Producto, cantidad }] }
router.post('/', async (req, res, next) => {
  const { id_Cliente, detalle } = req.body;
  const id_Usuario = req.usuario.id_Usuario;

  if (!id_Cliente || !detalle || detalle.length === 0) {
    return res.status(400).json({ error: 'id_Cliente y al menos un producto son requeridos' });
  }

  const conn = await req.app.locals.db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insertar la venta
    const [ventaResult] = await conn.query(
      `INSERT INTO Venta (Fecha, id_Usuario, id_Cliente) VALUES (CURDATE(), ?, ?)`,
      [id_Usuario, id_Cliente]
    );
    const id_Venta = ventaResult.insertId;

    // 2. Por cada producto en el detalle
    for (const item of detalle) {
      const { id_Producto, cantidad } = item;

      if (!id_Producto || !cantidad || cantidad <= 0) {
        throw Object.assign(new Error('Producto o cantidad inválidos'), { status: 400 });
      }

      // 2a. Verificar stock disponible
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

      // 2b. Insertar detalle con el precio actual del producto
      await conn.query(
        `INSERT INTO Detalle (cantidad, precio_actual, id_Venta, id_Producto)
         VALUES (?, ?, ?, ?)`,
        [cantidad, prod[0].precio_Producto, id_Venta, id_Producto]
      );

      // 2c. Descontar stock
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

// DELETE /api/ventas/:id — elimina venta y restaura stock
router.delete('/:id', async (req, res, next) => {
  const conn = await req.app.locals.db.getConnection();
  try {
    await conn.beginTransaction();

    // Restaurar stock de cada producto en el detalle
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