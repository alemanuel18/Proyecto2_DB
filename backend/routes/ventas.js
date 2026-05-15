const express      = require('express');
const router       = express.Router();
const auth         = require('../middleware/authMiddleware');
const requireRole  = require('../middleware/roleMiddleware');

// Roles:  1=Admin  2=Vendedor  4=Supervisor
const SOLO_LECTURA    = [1, 2, 4, 5];  // pueden ver ventas
const PUEDE_CREAR     = [1, 2, 5];     // pueden crear ventas
const PUEDE_EDITAR    = [1, 2, 5];     // pueden editar ventas
const PUEDE_ELIMINAR  = [1];           // solo admin elimina

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

// POST /api/ventas  — Admin, Vendedor, Cajero
router.post('/', requireRole(PUEDE_CREAR), async (req, res, next) => {
  const { id_Cliente, detalle } = req.body;
  const id_Usuario = req.usuario.id_Usuario;

  if (!id_Cliente || !detalle || detalle.length === 0) {
    return res.status(400).json({ error: 'id_Cliente y al menos un producto son requeridos' });
  }

  try {
    const db = req.app.locals.db;
    
    // Convertir el arreglo de detalles a string JSON
    const detallesJSON = JSON.stringify(detalle.map(d => ({
        id_producto: d.id_Producto,
        cantidad: d.cantidad
    })));

    // Invocar el Stored Procedure
    await db.query(`CALL crear_venta(?, ?, ?, @p_id_venta, @p_estado)`, [id_Cliente, id_Usuario, detallesJSON]);
    
    // Obtener los parámetros de salida
    const [[{ p_id_venta, p_estado }]] = await db.query(`SELECT @p_id_venta AS p_id_venta, @p_estado AS p_estado`);

    if (p_estado && p_estado.startsWith('ERROR')) {
      return res.status(400).json({ error: p_estado });
    }

    res.status(201).json({ id_Venta: p_id_venta, mensaje: p_estado });

  } catch (err) {
    next(err);
  }
});

// DELETE /api/ventas/:id  — solo Admin
router.delete('/:id', requireRole(PUEDE_ELIMINAR), async (req, res, next) => {
  try {
    const db = req.app.locals.db;
    
    // Invocar el Stored Procedure
    await db.query(`CALL eliminar_venta_restaurar_stock(?, @p_estado)`, [req.params.id]);
    
    // Obtener los parámetros de salida
    const [[{ p_estado }]] = await db.query(`SELECT @p_estado AS p_estado`);

    if (p_estado && p_estado.startsWith('ERROR')) {
      return res.status(400).json({ error: p_estado });
    }

    res.json({ mensaje: p_estado });
  } catch (err) {
    next(err);
  }
});

// PUT /api/ventas/:id  — Admin, Vendedor, Cajero
router.put('/:id', requireRole(PUEDE_EDITAR), async (req, res, next) => {
  const { id_Cliente, detalle } = req.body;

  if (!id_Cliente || !detalle || detalle.length === 0) {
    return res.status(400).json({ error: 'id_Cliente y al menos un producto son requeridos' });
  }

  try {
    const db = req.app.locals.db;
    
    const detallesJSON = JSON.stringify(detalle.map(d => ({
        id_producto: d.id_Producto,
        cantidad: d.cantidad
    })));

    await db.query(`CALL editar_venta(?, ?, ?, @p_estado)`, [req.params.id, id_Cliente, detallesJSON]);
    const [[{ p_estado }]] = await db.query(`SELECT @p_estado AS p_estado`);

    if (p_estado && p_estado.startsWith('ERROR')) {
      return res.status(400).json({ error: p_estado });
    }

    res.json({ mensaje: p_estado });
  } catch (err) {
    next(err);
  }
});

module.exports = router;