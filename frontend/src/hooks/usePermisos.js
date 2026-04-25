/**
 * Hook de permisos centralizado.
 *
 * Roles en la BD:
 *   1 = Administrador  → acceso total
 *   2 = Vendedor       → solo Ventas (ver + crear)
 *   4 = Supervisor     → ver todo, sin modificar
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

  const rol = usuario.id_Rol;

  return {
    usuario,
    rol,
    esAdmin:       rol === 1,
    esVendedor:    rol === 2,
    esSupervisor:  rol === 4,

    // Navegación: qué secciones puede ver
    verVentas:      [1, 2, 4].includes(rol),
    verClientes:    [1, 4].includes(rol),
    verProductos:   [1, 4].includes(rol),
    verProveedores: [1, 4].includes(rol),
    verReportes:    [1, 4].includes(rol),

    // Acciones de escritura
    puedeCrearVenta:    [1, 2].includes(rol),
    puedeEliminarVenta: [1].includes(rol),
    puedeModificar:     rol === 1,   // clientes, productos, proveedores, categorías
  };
}