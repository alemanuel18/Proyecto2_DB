/**
 * Hook de permisos centralizado.
 *
 * Roles en la BD:
 *   1 = Administrador
 *   2 = Vendedor
 *   3 = Bodeguero
 *   4 = Supervisor
 *   5 = Cajero
 */
import { useMemo } from 'react';

export function usePermisos() {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || '{}');
    } catch {
      return {};
    }
  }, []);

  const rol = Number(usuario.id_Rol);

  return {
    usuario,
    rol,
    esAdmin:       rol === 1,
    esVendedor:    rol === 2,
    esBodeguero:   rol === 3,
    esSupervisor:  rol === 4,
    esCajero:      rol === 5,

    // Navegación: qué secciones puede ver
    verVentas:      [1, 2, 4, 5].includes(rol),
    verClientes:    [1, 2, 4, 5].includes(rol),
    verProductos:   [1, 2, 3, 4, 5].includes(rol),
    verProveedores: [1, 3, 4].includes(rol),
    verReportes:    [1, 4].includes(rol),

    // Acciones de escritura
    puedeCrearVenta:         [1, 2, 5].includes(rol),
    puedeModificarVenta:     [1, 2, 5].includes(rol),
    puedeEliminarVenta:      [1].includes(rol),
    puedeModificarCliente:   [1, 2, 4].includes(rol),
    puedeModificarProducto:  [1, 3].includes(rol),
    puedeModificarProveedor: [1, 4].includes(rol),
    puedeModificarCategoria: [1, 4].includes(rol),
  };
}