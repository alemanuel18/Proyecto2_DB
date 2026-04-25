/**
 * Middleware de autorización por rol.
 * Uso: router.post('/', auth, requireRole([1, 4]), handler)
 *
 * Roles en la BD:
 *   1 = Administrador
 *   2 = Vendedor
 *   3 = Bodeguero
 *   4 = Supervisor
 *   5 = Cajero
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!allowedRoles.includes(req.usuario.id_Rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

module.exports = requireRole;