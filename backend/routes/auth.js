const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const router   = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  const { nombre_Usuario, password } = req.body;

  if (!nombre_Usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  try {
    const db = req.app.locals.db;

    const [rows] = await db.query(
      `SELECT u.id_Usuario, u.nombre_Usuario, u.password, u.id_Rol, r.nombre_Rol
       FROM Usuario u
       JOIN Rol r ON u.id_Rol = r.id_Rol
       WHERE u.nombre_Usuario = ?`,
      [nombre_Usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];

    // Los datos de prueba usan SHA2; para nuevos usuarios usaremos bcrypt.
    // Comparamos con bcrypt; si falla intentamos SHA2 (datos semilla).
    let passwordValido = false;

    try {
      passwordValido = await bcrypt.compare(password, usuario.password);
    } catch {
      passwordValido = false;
    }

    // Fallback SHA2 para los usuarios sembrados con SHA2('Pass1234', 256)
    if (!passwordValido) {
      const db2 = req.app.locals.db;
      const [sha] = await db2.query(
        'SELECT SHA2(?, 256) AS hash',
        [password]
      );
      passwordValido = sha[0].hash === usuario.password;
    }

    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      {
        id_Usuario    : usuario.id_Usuario,
        nombre_Usuario: usuario.nombre_Usuario,
        id_Rol        : usuario.id_Rol,
        nombre_Rol    : usuario.nombre_Rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id_Usuario    : usuario.id_Usuario,
        nombre_Usuario: usuario.nombre_Usuario,
        id_Rol        : usuario.id_Rol,
        nombre_Rol    : usuario.nombre_Rol
      }
    });

  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout  (el cliente simplemente descarta el token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Sesión cerrada' });
});

module.exports = router;