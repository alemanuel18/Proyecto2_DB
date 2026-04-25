import { useEffect, useState } from 'react';
import api from '../../api';

export default function Ventas() {
  const [ventas,    setVentas]    = useState([]);
  const [clientes,  setClientes]  = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [detModal,  setDetModal]  = useState(null); // venta seleccionada para ver detalle
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  // Form nueva venta
  const [idCliente,  setIdCliente]  = useState('');
  const [detalle,    setDetalle]    = useState([{ id_Producto: '', cantidad: 1 }]);

  async function cargar() {
    setLoading(true);
    try {
      const [v, c, p] = await Promise.all([
        api.get('/api/ventas'),
        api.get('/api/clientes'),
        api.get('/api/productos'),
      ]);
      setVentas(v.data);
      setClientes(c.data);
      setProductos(p.data);
    } finally { setLoading(false); }
  }
  useEffect(() => { cargar(); }, []);

  function addLinea() { setDetalle([...detalle, { id_Producto: '', cantidad: 1 }]); }
  function removeLinea(i) { setDetalle(detalle.filter((_, idx) => idx !== i)); }
  function setLinea(i, key, val) {
    setDetalle(detalle.map((d, idx) => idx === i ? { ...d, [key]: val } : d));
  }

  async function guardar(e) {
    e.preventDefault(); setError('');
    const lineas = detalle.filter(d => d.id_Producto && d.cantidad > 0);
    if (!idCliente || lineas.length === 0) {
      return setError('Selecciona un cliente y al menos un producto');
    }
    try {
      await api.post('/api/ventas', {
        id_Cliente: parseInt(idCliente),
        detalle: lineas.map(d => ({ id_Producto: parseInt(d.id_Producto), cantidad: parseInt(d.cantidad) })),
      });
      setModal(false);
      setIdCliente(''); setDetalle([{ id_Producto: '', cantidad: 1 }]);
      setSuccess('Venta registrada correctamente');
      cargar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar venta');
    }
  }

  async function verDetalle(v) {
    try {
      const { data } = await api.get(`/api/ventas/${v.id_Venta}`);
      setDetModal(data);
    } catch { setError('No se pudo cargar el detalle'); }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar esta venta? Se restaurará el stock.')) return;
    try {
      await api.delete(`/api/ventas/${id}`);
      setSuccess('Venta eliminada y stock restaurado'); cargar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar');
    }
  }

  // Exportar ventas a CSV (reporte exportable)
  function exportarCSV() {
    const header = 'ID,Fecha,Vendedor,Cliente,Total\n';
    const rows = ventas.map(v =>
      `${v.id_Venta},${v.Fecha},${v.nombre_Usuario},${v.nombre_Cliente},${v.total}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'ventas.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const fmt = n => `Q ${Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
  const precioProducto = id => productos.find(p => p.id_Producto === parseInt(id))?.precio_Producto || 0;
  const totalEstimado  = detalle.reduce((s, d) => s + (precioProducto(d.id_Producto) * (parseInt(d.cantidad) || 0)), 0);

  return (
    <div>
      <div className="page-header">
        <h1>🛒 Ventas</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={exportarCSV}>⬇ Exportar CSV</button>
          <button className="btn btn-primary" onClick={() => { setError(''); setModal(true); }}>+ Nueva venta</button>
        </div>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

      {loading ? <span className="spinner" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Fecha</th><th>Vendedor</th><th>Cliente</th><th>Total</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {ventas.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Sin ventas registradas</td></tr>
              )}
              {ventas.map(v => (
                <tr key={v.id_Venta}>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>#{v.id_Venta}</td>
                  <td>{new Date(v.Fecha).toLocaleDateString('es-GT')}</td>
                  <td>{v.nombre_Usuario}</td>
                  <td>{v.nombre_Cliente}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmt(v.total)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => verDetalle(v)}>Ver</button>
                      <button className="btn btn-danger btn-sm" onClick={() => eliminar(v.id_Venta)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nueva venta */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{ maxWidth: 620 }}>
            <div className="modal-header">
              <h2>Nueva venta</h2>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={guardar}>
              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Cliente</label>
                <select value={idCliente} onChange={e => setIdCliente(e.target.value)} required>
                  <option value="">— Seleccionar cliente —</option>
                  {clientes.map(c => <option key={c.id_Cliente} value={c.id_Cliente}>{c.nombre_Cliente}</option>)}
                </select>
              </div>

              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Productos</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8, marginBottom: 8 }}>
                {detalle.map((d, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 32px', gap: 8, alignItems: 'center' }}>
                    <select value={d.id_Producto} onChange={e => setLinea(i, 'id_Producto', e.target.value)}>
                      <option value="">— Producto —</option>
                      {productos.map(p => <option key={p.id_Producto} value={p.id_Producto}>{p.nombre_Producto} (Q{p.precio_Producto})</option>)}
                    </select>
                    <input type="number" min="1" value={d.cantidad} onChange={e => setLinea(i, 'cantidad', e.target.value)} placeholder="Cant." />
                    <button type="button" onClick={() => removeLinea(i)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={addLinea} style={{ alignSelf: 'flex-start' }}>+ Agregar producto</button>
              </div>

              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px', marginTop: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Total estimado: </span>
                <strong style={{ fontFamily: 'var(--mono)' }}>{fmt(totalEstimado)}</strong>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar venta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle venta */}
      {detModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>Venta #{detModal.id_Venta}</h2>
              <button className="modal-close" onClick={() => setDetModal(null)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, fontSize: 13 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Fecha: </span>{new Date(detModal.Fecha).toLocaleDateString('es-GT')}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Vendedor: </span>{detModal.nombre_Usuario}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Cliente: </span>{detModal.nombre_Cliente}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Email: </span>{detModal.email}</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {detModal.detalle.map(d => (
                    <tr key={d.id_Detalle}>
                      <td>{d.nombre_Producto}</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{d.cantidad}</td>
                      <td style={{ fontFamily: 'var(--mono)' }}>{fmt(d.precio_actual)}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontWeight: 500 }}>{fmt(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'right', marginTop: 14, fontSize: 15, fontWeight: 600 }}>
              Total: <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
                {fmt(detModal.detalle.reduce((s, d) => s + Number(d.subtotal), 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}