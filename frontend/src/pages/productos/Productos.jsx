import { useEffect, useState } from 'react';
import api from '../../api';
import { usePermisos } from '../../hooks/usePermisos';

const EMPTY = { nombre_Producto: '', precio_Producto: '', stock: '', categorias: [] };

export default function Productos() {
  const { puedeModificar } = usePermisos();

  const [productos,   setProductos]   = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState(EMPTY);
  const [editId,      setEditId]      = useState(null);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [busqueda,    setBusqueda]    = useState('');

  async function cargar() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.get('/api/productos'), api.get('/api/categorias')]);
      setProductos(p.data);
      setCategorias(c.data);
    } finally { setLoading(false); }
  }
  useEffect(() => { cargar(); }, []);

  function abrirCrear() { setForm(EMPTY); setEditId(null); setError(''); setModal(true); }
  function abrirEditar(p) {
    setForm({
      nombre_Producto:  p.nombre_Producto,
      precio_Producto:  p.precio_Producto,
      stock:            p.stock,
      categorias:       [],
    });
    setEditId(p.id_Producto); setError(''); setModal(true);
  }

  function toggleCategoria(id) {
    setForm(f => ({
      ...f,
      categorias: f.categorias.includes(id)
        ? f.categorias.filter(c => c !== id)
        : [...f.categorias, id],
    }));
  }

  async function guardar(e) {
    e.preventDefault(); setError('');
    try {
      const payload = {
        ...form,
        precio_Producto: parseFloat(form.precio_Producto),
        stock: parseInt(form.stock),
      };
      if (editId) await api.put(`/api/productos/${editId}`, payload);
      else        await api.post('/api/productos', payload);
      setModal(false);
      setSuccess(editId ? 'Producto actualizado' : 'Producto creado');
      cargar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/api/productos/${id}`);
      setSuccess('Producto eliminado'); cargar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar');
    }
  }

  function stockBadge(stock) {
    if (stock === 0)  return <span className="badge badge-red">Sin stock</span>;
    if (stock < 20)   return <span className="badge badge-yellow">Stock bajo</span>;
    return <span className="badge badge-green">En stock</span>;
  }

  const filtrados = productos.filter(p =>
    p.nombre_Producto.toLowerCase().includes(busqueda.toLowerCase())
  );

  const fmt = n => `Q ${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header">
        <h1>📦 Productos</h1>
        {puedeModificar && (
          <button className="btn btn-primary" onClick={abrirCrear}>+ Nuevo producto</button>
        )}
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      <div style={{ marginBottom: 16 }}>
        <input placeholder="Buscar producto…" value={busqueda}
          onChange={e => setBusqueda(e.target.value)} style={{ maxWidth: 300 }} />
      </div>

      {loading ? <span className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th><th>Categorías</th><th>Precio</th><th>Stock</th><th>Estado</th>
                {puedeModificar && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr><td colSpan={puedeModificar ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Sin resultados</td></tr>
              )}
              {filtrados.map(p => (
                <tr key={p.id_Producto}>
                  <td><strong>{p.nombre_Producto}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.categorias || '—'}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{fmt(p.precio_Producto)}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{p.stock}</td>
                  <td>{stockBadge(p.stock)}</td>
                  {puedeModificar && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => eliminar(p.id_Producto)}>Eliminar</button>
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
              <h2>{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Nombre del producto</label>
                  <input value={form.nombre_Producto} onChange={e => setForm({ ...form, nombre_Producto: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Precio (Q)</label>
                  <input type="number" step="0.01" min="0" value={form.precio_Producto}
                    onChange={e => setForm({ ...form, precio_Producto: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" min="0" value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Categorías</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                    {categorias.map(c => (
                      <label key={c.id_Categoria} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                        <input type="checkbox" style={{ width: 'auto' }}
                          checked={form.categorias.includes(c.id_Categoria)}
                          onChange={() => toggleCategoria(c.id_Categoria)} />
                        {c.nombre_Categoria}
                      </label>
                    ))}
                  </div>
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