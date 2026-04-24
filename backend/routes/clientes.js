const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');

// Todas las rutas de clientes requieren autenticación
router.use(auth);

// GET /api/clientes
router.get('/', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT id_Cliente, nombre_Cliente, telefono, direccion, email, NIT
       FROM Cliente
       ORDER BY nombre_Cliente`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT id_Cliente, nombre_Cliente, telefono, direccion, email, NIT
       FROM Cliente
       WHERE id_Cliente = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/clientes
router.post('/', async (req, res, next) => {
  const { nombre_Cliente, telefono, direccion, email, NIT } = req.body;

  if (!nombre_Cliente || !telefono || !direccion || !email || !NIT) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const db = req.app.locals.db;
    const [result] = await db.query(
      `INSERT INTO Cliente (nombre_Cliente, telefono, direccion, email, NIT)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre_Cliente, telefono, direccion, email, NIT]
    );
    res.status(201).json({ id_Cliente: result.insertId, mensaje: 'Cliente creado' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res, next) => {
  const { nombre_Cliente, telefono, direccion, email, NIT } = req.body;

  if (!nombre_Cliente || !telefono || !direccion || !email || !NIT) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const db = req.app.locals.db;
    const [result] = await db.query(
      `UPDATE Cliente
       SET nombre_Cliente = ?, telefono = ?, direccion = ?, email = ?, NIT = ?
       WHERE id_Cliente = ?`,
      [nombre_Cliente, telefono, direccion, email, NIT, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ mensaje: 'Cliente actualizado' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [result] = await db.query(
      `DELETE FROM Cliente WHERE id_Cliente = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;