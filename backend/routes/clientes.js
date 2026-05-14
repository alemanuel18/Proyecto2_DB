const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/authMiddleware');
const requireRole  = require('../middleware/roleMiddleware');

// Roles: 1=Admin, 2=Vendedor, 3=Bodeguero, 4=Supervisor, 5=Cajero
const LECTURA   = [1, 2, 4, 5]; // Admin, Vendedor, Supervisor, Cajero
const ESCRITURA = [1, 2, 4];    // Admin, Vendedor, Supervisor

router.use(auth);

// GET /api/clientes
router.get('/', requireRole(LECTURA), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const clientes = await prisma.cliente.findMany({
      orderBy: { nombre_Cliente: 'asc' },
    });
    res.json(clientes);
  } catch (err) {
    next(err);
  }
});

// GET /api/clientes/:id
router.get('/:id', requireRole(LECTURA), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const cliente = await prisma.cliente.findUnique({
      where: { id_Cliente: Number(req.params.id) },
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
});

// POST /api/clientes
router.post('/', requireRole(ESCRITURA), async (req, res, next) => {
  const { nombre_Cliente, telefono, direccion, email, NIT } = req.body;

  if (!nombre_Cliente || !telefono || !direccion || !email || !NIT) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const prisma = req.app.locals.prisma;
    const result = await prisma.cliente.create({
      data: {
        nombre_Cliente,
        telefono,
        direccion,
        email,
        NIT,
      },
    });
    res.status(201).json({ id_Cliente: result.id_Cliente, mensaje: 'Cliente creado' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/clientes/:id
router.put('/:id', requireRole(ESCRITURA), async (req, res, next) => {
  const { nombre_Cliente, telefono, direccion, email, NIT } = req.body;

  if (!nombre_Cliente || !telefono || !direccion || !email || !NIT) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const prisma = req.app.locals.prisma;
    await prisma.cliente.update({
      where: { id_Cliente: Number(req.params.id) },
      data: {
        nombre_Cliente,
        telefono,
        direccion,
        email,
        NIT,
      },
    });
    res.json({ mensaje: 'Cliente actualizado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    next(err);
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', requireRole(ESCRITURA), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    await prisma.cliente.delete({
      where: { id_Cliente: Number(req.params.id) },
    });
    res.json({ mensaje: 'Cliente eliminado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    next(err);
  }
});

module.exports = router;