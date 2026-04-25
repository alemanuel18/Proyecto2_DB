import { Routes, Route, Navigate } from 'react-router-dom';
import Layout     from './components/layout/Layout';
import Login      from './pages/login/Login';
import Dashboard  from './pages/dashboard/Dashboard';
import Clientes   from './pages/clientes/Clientes';
import Productos  from './pages/productos/Productos';
import Ventas     from './pages/ventas/Ventas';
import Reportes   from './pages/reportes/Reportes';
import Proveedores from './pages/proveedores/Proveedores';

// Ruta protegida: redirige a /login si no hay token
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="productos" element={<Productos />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="proveedores" element={<Proveedores />} />

      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}