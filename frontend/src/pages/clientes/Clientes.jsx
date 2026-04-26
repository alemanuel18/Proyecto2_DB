import { useEffect, useState } from 'react';
import api from '../../api';
import { usePermisos } from '../../hooks/usePermisos';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/toast/Toast';

const EMPTY = { nombre_Cliente: '', telefono: '', direccion: '', email: '', NIT: '' };

export default function Clientes() {
  const { puedeModificar } = usePermisos();
  const { toasts, removeToast, notify } = useToast();

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [formError, setFormError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  async function cargar() {
    setLoading(true);
    try { const { data } = await api.get('/api/clientes'); setClientes(data); }
    catch { } finally { setLoading(false); }
  }
  useEffect(() => { cargar(); }, []);

  function abrirCrear() { setForm(EMPTY); setEditId(null); setFormError(''); setModal(true); }
  function abrirEditar(c) {
    setForm({ nombre_Cliente: c.nombre_Cliente, telefono: c.telefono, direccion: c.direccion, email: c.email, NIT: c.NIT });
    setEditId(c.id_Cliente); setFormError(''); setModal(true);
  }

  async function guardar(e) {
    e.preventDefault(); setFormError('');
    try {
      if (editId) await api.put(`/api/clientes/${editId}`, form);
      else        await api.post('/api/clientes', form);
      setModal(false);
      notify(editId ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
      cargar();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      await api.delete(`/api/clientes/${id}`);
      notify('Cliente eliminado');
      cargar();
    } catch (err) {
      notify(err.response?.data?.error || 'Error al eliminar', 'error');
    }
  }

  const filtrados = clientes.filter(c =>
    c.nombre_Cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.NIT.includes(busqueda)
  );

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="page-header">
        <h1>👥 Clientes</h1>
        {puedeModificar && (
          <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo cliente</button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <input placeholder="Buscar por nombre, email o NIT…" value={busqueda}
          onChange={e => setBusqueda(e.target.value)} style={{ maxWidth: 340 }} />
      </div>

      {loading ? <span className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Teléfono</th><th>Email</th><th>NIT</th><th>Dirección</th>
                {puedeModificar && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={puedeModificar ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Sin resultados</td></tr>
              )}
              {filtrados.map(c => (
                <tr key={c.id_Cliente}>
                  <td><strong>{c.nombre_Cliente}</strong></td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{c.telefono}</td>
                  <td>{c.email}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{c.NIT}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.direccion}</td>
                  {puedeModificar && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(c)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => eliminar(c.id_Cliente)}>Eliminar</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && puedeModificar && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              {formError && <div className="alert alert-error" style={{ marginBottom: 16 }}>{formError}</div>}
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Nombre</label>
                  <input value={form.nombre_Cliente} onChange={e => setForm({ ...form, nombre_Cliente: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>NIT</label>
                  <input value={form.NIT} onChange={e => setForm({ ...form, NIT: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Dirección</label>
                  <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} required />
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
    </div>
  );
}