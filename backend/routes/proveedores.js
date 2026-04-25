const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/authMiddleware');
const requireRole  = require('../middleware/roleMiddleware');

const LECTURA   = [1, 4];
const ESCRITURA = [1];

router.use(auth);

// GET /api/proveedores
router.get('/', requireRole(LECTURA), async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT p.id_Proveedor, p.nombre_Proveedor, p.telefono, p.email,
              COUNT(pp.id_Producto) AS total_productos
       FROM Proveedor p
       LEFT JOIN Proveedor_Producto pp ON p.id_Proveedor = pp.id_Proveedor
       GROUP BY p.id_Proveedor
       ORDER BY p.nombre_Proveedor`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/proveedores/:id
router.get('/:id', requireRole(LECTURA), async (req, res, next) => {
  try {
    const db = req.app.locals.db;

    const [proveedor] = await db.query(
      `SELECT id_Proveedor, nombre_Proveedor, telefono, email
       FROM Proveedor WHERE id_Proveedor = ?`,
      [req.params.id]
    );
    if (proveedor.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });

    const [productos] = await db.query(
      `SELECT p.id_Producto, p.nombre_Producto, p.precio_Producto, p.stock
       FROM Producto p
       JOIN Proveedor_Producto pp ON p.id_Producto = pp.id_Producto
       WHERE pp.id_Proveedor = ?`,
      [req.params.id]
    );

    res.json({ ...proveedor[0], productos });
  } catch (err) {
    next(err);
  }
});

// POST /api/proveedores  — solo Admin
router.post('/', requireRole(ESCRITURA), async (req, res, next) => {
  const { nombre_Proveedor, telefono, email } = req.body;
  if (!nombre_Proveedor || !telefono || !email) {
    return res.status(400).json({ error: 'nombre_Proveedor, telefono y email son requeridos' });
  }

  try {
    const db = req.app.locals.db;
    const [result] = await db.query(
      `INSERT INTO Proveedor (nombre_Proveedor, telefono, email) VALUES (?, ?, ?)`,
      [nombre_Proveedor, telefono, email]
    );
    res.status(201).json({ id_Proveedor: result.insertId, mensaje: 'Proveedor creado' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/proveedores/:id  — solo Admin
router.put('/:id', requireRole(ESCRITURA), async (req, res, next) => {
  const { nombre_Proveedor, telefono, email } = req.body;
  if (!nombre_Proveedor || !telefono || !email) {
    return res.status(400).json({ error: 'nombre_Proveedor, telefono y email son requeridos' });
  }

  try {
    const db = req.app.locals.db;
    const [result] = await db.query(
      `UPDATE Proveedor SET nombre_Proveedor = ?, telefono = ?, email = ?
       WHERE id_Proveedor = ?`,
      [nombre_Proveedor, telefono, email, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ mensaje: 'Proveedor actualizado' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/proveedores/:id  — solo Admin
router.delete('/:id', requireRole(ESCRITURA), async (req, res, next) => {
  const conn = await req.app.locals.db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM Proveedor_Producto WHERE id_Proveedor = ?`, [req.params.id]);
    const [result] = await conn.query(
      `DELETE FROM Proveedor WHERE id_Proveedor = ?`, [req.params.id]
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    await conn.commit();
    res.json({ mensaje: 'Proveedor eliminado' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;