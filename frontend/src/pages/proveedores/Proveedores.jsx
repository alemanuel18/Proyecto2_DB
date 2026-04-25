import { useEffect, useState } from 'react';
import api from '../api';

const EMPTY = { nombre_Proveedor: '', telefono: '', email: '' };

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [detModal,    setDetModal]    = useState(null);
  const [form,        setForm]        = useState(EMPTY);
  const [editId,      setEditId]      = useState(null);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');

  async function cargar() {
    setLoading(true);
    try { const { data } = await api.get('/api/proveedores'); setProveedores(data); }
    finally { setLoading(false); }
  }
  useEffect(() => { cargar(); }, []);

  function abrirCrear() { setForm(EMPTY); setEditId(null); setError(''); setModal(true); }
  function abrirEditar(p) {
    setForm({ nombre_Proveedor: p.nombre_Proveedor, telefono: p.telefono, email: p.email });
    setEditId(p.id_Proveedor); setError(''); setModal(true);
  }

  async function verDetalle(p) {
    const { data } = await api.get(`/api/proveedores/${p.id_Proveedor}`);
    setDetModal(data);
  }

  async function guardar(e) {
    e.preventDefault(); setError('');
    try {
      if (editId) await api.put(`/api/proveedores/${editId}`, form);
      else        await api.post('/api/proveedores', form);
      setModal(false);
      setSuccess(editId ? 'Proveedor actualizado' : 'Proveedor creado');
      cargar(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este proveedor?')) return;
    try {
      await api.delete(`/api/proveedores/${id}`);
      setSuccess('Proveedor eliminado'); cargar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar');
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>🏭 Proveedores</h1>
        <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo proveedor</button>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {loading ? <span className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Productos</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {proveedores.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Sin proveedores</td></tr>
              )}
              {proveedores.map(p => (
                <tr key={p.id_Proveedor}>
                  <td><strong>{p.nombre_Proveedor}</strong></td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{p.telefono}</td>
                  <td>{p.email}</td>
                  <td><span className="badge badge-blue">{p.total_productos}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => verDetalle(p)}>Ver</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminar(p.id_Proveedor)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal form */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-grid cols-1">
                <div className="form-group">
                  <label>Nombre</label>
                  <input value={form.nombre_Proveedor} onChange={e => setForm({ ...form, nombre_Proveedor: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{detModal.nombre_Proveedor}</h2>
              <button className="modal-close" onClick={() => setDetModal(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              {detModal.telefono} · {detModal.email}
            </p>
            <h3 style={{ marginBottom: 12 }}>Productos suministrados</h3>
            {detModal.productos.length === 0
              ? <p style={{ color: 'var(--text-muted)' }}>Sin productos asignados</p>
              : <div className="table-wrap">
                  <table>
                    <thead><tr><th>Producto</th><th>Precio</th><th>Stock</th></tr></thead>
                    <tbody>
                      {detModal.productos.map(p => (
                        <tr key={p.id_Producto}>
                          <td>{p.nombre_Producto}</td>
                          <td style={{ fontFamily: 'var(--mono)' }}>Q {p.precio_Producto}</td>
                          <td style={{ fontFamily: 'var(--mono)' }}>{p.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}