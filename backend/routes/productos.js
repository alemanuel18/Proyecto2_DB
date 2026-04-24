const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/authMiddleware');

router.use(auth);

// GET /api/productos
// JOIN con Categoria_Producto y Categoria para mostrar categorías
router.get('/', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT p.id_Producto, p.nombre_Producto, p.precio_Producto, p.stock,
              GROUP_CONCAT(c.nombre_Categoria ORDER BY c.nombre_Categoria SEPARATOR ', ') AS categorias
       FROM Producto p
       LEFT JOIN Categoria_Producto cp ON p.id_Producto = cp.id_Producto
       LEFT JOIN Categoria c           ON cp.id_Categoria = c.id_Categoria
       GROUP BY p.id_Producto
       ORDER BY p.nombre_Producto`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    const [rows] = await db.query(
      `SELECT p.id_Producto, p.nombre_Producto, p.precio_Producto, p.stock,
              GROUP_CONCAT(c.nombre_Categoria SEPARATOR ', ') AS categorias
       FROM Producto p
       LEFT JOIN Categoria_Producto cp ON p.id_Producto = cp.id_Producto
       LEFT JOIN Categoria c           ON cp.id_Categoria = c.id_Categoria
       WHERE p.id_Producto = ?
       GROUP BY p.id_Producto`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/productos
// Body: { nombre_Producto, precio_Producto, stock, categorias: [id, ...] }
router.post('/', async (req, res, next) => {
  const { nombre_Producto, precio_Producto, stock, categorias = [] } = req.body;

  if (!nombre_Producto || precio_Producto == null || stock == null) {
    return res.status(400).json({ error: 'nombre_Producto, precio_Producto y stock son requeridos' });
  }

  const conn = await req.app.locals.db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO Producto (nombre_Producto, precio_Producto, stock) VALUES (?, ?, ?)`,
      [nombre_Producto, precio_Producto, stock]
    );
    const id_Producto = result.insertId;

    if (categorias.length > 0) {
      const valores = categorias.map(id_cat => [id_cat, id_Producto]);
      await conn.query(
        `INSERT INTO Categoria_Producto (id_Categoria, id_Producto) VALUES ?`,
        [valores]
      );
    }

    await conn.commit();
    res.status(201).json({ id_Producto, mensaje: 'Producto creado' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// PUT /api/productos/:id
router.put('/:id', async (req, res, next) => {
  const { nombre_Producto, precio_Producto, stock, categorias = [] } = req.body;

  if (!nombre_Producto || precio_Producto == null || stock == null) {
    return res.status(400).json({ error: 'nombre_Producto, precio_Producto y stock son requeridos' });
  }

  const conn = await req.app.locals.db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `UPDATE Producto SET nombre_Producto = ?, precio_Producto = ?, stock = ?
       WHERE id_Producto = ?`,
      [nombre_Producto, precio_Producto, stock, req.params.id]
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Reemplazar categorías
    await conn.query(
      `DELETE FROM Categoria_Producto WHERE id_Producto = ?`,
      [req.params.id]
    );
    if (categorias.length > 0) {
      const valores = categorias.map(id_cat => [id_cat, req.params.id]);
      await conn.query(
        `INSERT INTO Categoria_Producto (id_Categoria, id_Producto) VALUES ?`,
        [valores]
      );
    }

    await conn.commit();
    res.json({ mensaje: 'Producto actualizado' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// DELETE /api/productos/:id
router.delete('/:id', async (req, res, next) => {
  const conn = await req.app.locals.db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`DELETE FROM Categoria_Producto WHERE id_Producto = ?`, [req.params.id]);
    await conn.query(`DELETE FROM Proveedor_Producto  WHERE id_Producto = ?`, [req.params.id]);

    const [result] = await conn.query(
      `DELETE FROM Producto WHERE id_Producto = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await conn.commit();
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;