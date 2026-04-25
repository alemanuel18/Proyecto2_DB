const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');

router.use(auth);

// GET /api/categorias
router.get('/', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT id_Categoria, nombre_Categoria FROM Categoria ORDER BY nombre_Categoria`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/categorias/:id
router.get('/:id', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT id_Categoria, nombre_Categoria FROM Categoria WHERE id_Categoria = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/categorias
router.post('/', async (req, res, next) => {
  const { nombre_Categoria } = req.body;
  if (!nombre_Categoria) return res.status(400).json({ error: 'nombre_Categoria es requerido' });

  try {
    const db = req.app.locals.db;
    const [result] = await db.query(
      `INSERT INTO Categoria (nombre_Categoria) VALUES (?)`,
      [nombre_Categoria]
    );
    res.status(201).json({ id_Categoria: result.insertId, mensaje: 'Categoría creada' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/categorias/:id
router.put('/:id', async (req, res, next) => {
  const { nombre_Categoria } = req.body;
  if (!nombre_Categoria) return res.status(400).json({ error: 'nombre_Categoria es requerido' });

  try {
    const db = req.app.locals.db;
    const [result] = await db.query(
      `UPDATE Categoria SET nombre_Categoria = ? WHERE id_Categoria = ?`,
      [nombre_Categoria, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ mensaje: 'Categoría actualizada' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [result] = await db.query(
      `DELETE FROM Categoria WHERE id_Categoria = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;