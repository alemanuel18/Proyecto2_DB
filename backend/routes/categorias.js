const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/authMiddleware');
const requireRole  = require('../middleware/roleMiddleware');

const LECTURA   = [1, 2, 4];  // vendedor necesita categorías al crear productos (aunque no pueda crearlos, no hace daño)
const ESCRITURA = [1];

router.use(auth);

router.get('/', requireRole(LECTURA), async (req, res, next) => {
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

router.get('/:id', requireRole(LECTURA), async (req, res, next) => {
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

router.post('/', requireRole(ESCRITURA), async (req, res, next) => {
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

router.put('/:id', requireRole(ESCRITURA), async (req, res, next) => {
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

router.delete('/:id', requireRole(ESCRITURA), async (req, res, next) => {
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