const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/authMiddleware');
const requireRole  = require('../middleware/roleMiddleware');

// Roles: 1=Admin, 2=Vendedor, 3=Bodeguero, 4=Supervisor, 5=Cajero
const LECTURA   = [1, 3, 4]; // Admin, Bodeguero, Supervisor
const ESCRITURA = [1, 4];    // Admin, Supervisor

router.use(auth);

// GET /api/proveedores
router.get('/', requireRole(LECTURA), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const proveedores = await prisma.proveedor.findMany({
      include: {
        _count: {
          select: { productos: true }
        }
      },
      orderBy: { nombre_Proveedor: 'asc' }
    });
    
    // Mapeo para mantener la misma estructura de respuesta que la versión SQL original
    const rows = proveedores.map(p => ({
      id_Proveedor: p.id_Proveedor,
      nombre_Proveedor: p.nombre_Proveedor,
      telefono: p.telefono,
      email: p.email,
      total_productos: p._count.productos
    }));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/proveedores/:id
router.get('/:id', requireRole(LECTURA), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const proveedor = await prisma.proveedor.findUnique({
      where: { id_Proveedor: Number(req.params.id) },
      include: {
        productos: {
          include: {
            producto: true
          }
        }
      }
    });

    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

    // Extraer los productos de la tabla intermedia para la respuesta
    const { productos, ...provInfo } = proveedor;
    const productosFormat = productos.map(pp => pp.producto);

    res.json({ ...provInfo, productos: productosFormat });
  } catch (err) {
    next(err);
  }
});

// POST /api/proveedores
router.post('/', requireRole(ESCRITURA), async (req, res, next) => {
  const { nombre_Proveedor, telefono, email } = req.body;
  if (!nombre_Proveedor || !telefono || !email) {
    return res.status(400).json({ error: 'nombre_Proveedor, telefono y email son requeridos' });
  }

  try {
    const prisma = req.app.locals.prisma;
    const result = await prisma.proveedor.create({
      data: { nombre_Proveedor, telefono, email }
    });
    res.status(201).json({ id_Proveedor: result.id_Proveedor, mensaje: 'Proveedor creado' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/proveedores/:id
router.put('/:id', requireRole(ESCRITURA), async (req, res, next) => {
  const { nombre_Proveedor, telefono, email } = req.body;
  if (!nombre_Proveedor || !telefono || !email) {
    return res.status(400).json({ error: 'nombre_Proveedor, telefono y email son requeridos' });
  }

  try {
    const prisma = req.app.locals.prisma;
    await prisma.proveedor.update({
      where: { id_Proveedor: Number(req.params.id) },
      data: { nombre_Proveedor, telefono, email }
    });
    res.json({ mensaje: 'Proveedor actualizado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    next(err);
  }
});

// DELETE /api/proveedores/:id
router.delete('/:id', requireRole(ESCRITURA), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const idProv = Number(req.params.id);

    // Se ejecuta como una transacción Prisma para eliminar la relación y luego el proveedor
    await prisma.$transaction([
      prisma.proveedor_Producto.deleteMany({
        where: { id_Proveedor: idProv }
      }),
      prisma.proveedor.delete({
        where: { id_Proveedor: idProv }
      })
    ]);

    res.json({ mensaje: 'Proveedor eliminado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }
    next(err);
  }
});

module.exports = router;