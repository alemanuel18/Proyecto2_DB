const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/authMiddleware');
const requireRole  = require('../middleware/roleMiddleware');

// Roles: 1=Admin, 2=Vendedor, 3=Bodeguero, 4=Supervisor, 5=Cajero
const LECTURA   = [1, 2, 3, 4, 5]; // Todos para que Productos.jsx no falle
const ESCRITURA = [1, 4];    // Admin, Supervisor

router.use(auth);

// GET /api/categorias
router.get('/', requireRole(LECTURA), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre_Categoria: 'asc' },
    });
    res.json(categorias);
  } catch (err) {
    next(err);
  }
});

// GET /api/categorias/:id
router.get('/:id', requireRole(LECTURA), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const categoria = await prisma.categoria.findUnique({
      where: { id_Categoria: Number(req.params.id) },
    });
    if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (err) {
    next(err);
  }
});

// POST /api/categorias
router.post('/', requireRole(ESCRITURA), async (req, res, next) => {
  const { nombre_Categoria } = req.body;
  if (!nombre_Categoria) return res.status(400).json({ error: 'nombre_Categoria es requerido' });

  try {
    const prisma = req.app.locals.prisma;
    const result = await prisma.categoria.create({
      data: { nombre_Categoria },
    });
    res.status(201).json({ id_Categoria: result.id_Categoria, mensaje: 'Categoría creada' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/categorias/:id
router.put('/:id', requireRole(ESCRITURA), async (req, res, next) => {
  const { nombre_Categoria } = req.body;
  if (!nombre_Categoria) return res.status(400).json({ error: 'nombre_Categoria es requerido' });

  try {
    const prisma = req.app.locals.prisma;
    await prisma.categoria.update({
      where: { id_Categoria: Number(req.params.id) },
      data: { nombre_Categoria },
    });
    res.json({ mensaje: 'Categoría actualizada' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    next(err);
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', requireRole(ESCRITURA), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.categoria.delete({
      where: { id_Categoria: Number(req.params.id) },
    });
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    next(err);
  }
});

module.exports = router;