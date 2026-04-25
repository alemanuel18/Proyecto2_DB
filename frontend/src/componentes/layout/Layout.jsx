import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Layout.css';

const NAV = [
  { to: '/',            icon: '▦',  label: 'Dashboard'   },
  { to: '/ventas',      icon: '🛒', label: 'Ventas'       },
  { to: '/productos',   icon: '📦', label: 'Productos'    },
  { to: '/clientes',    icon: '👥', label: 'Clientes'     },
  { to: '/proveedores', icon: '🏭', label: 'Proveedores'  },
  { to: '/reportes',    icon: '📊', label: 'Reportes'     },
];

export default function Layout() {
  const navigate  = useNavigate();
  const usuario   = JSON.parse(localStorage.getItem('usuario') || '{}');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🏪</span>
          <span className="brand-name">Tienda<strong>GT</strong></span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{usuario.nombre_Usuario?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className="user-name">{usuario.nombre_Usuario}</div>
              <div className="user-role">{usuario.nombre_Rol}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm logout-btn" onClick={logout}>
            Salir
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}