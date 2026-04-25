import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ nombre_Usuario: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-icon">🏪</span>
          <h1>TiendaGT</h1>
          <p>Sistema de inventario y ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              placeholder="nombre_usuario"
              value={form.nombre_Usuario}
              onChange={e => setForm({ ...form, nombre_Usuario: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="login-hint">Usuario de prueba: <code>carlos.mendez</code> / <code>Pass1234</code></p>
      </div>
    </div>
  );
}