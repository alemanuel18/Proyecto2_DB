import { useEffect, useState } from 'react';
import api from '../../api';

export default function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [topProd, setTopProd]   = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ventasMes, productos, clientes, inventario] = await Promise.all([
          api.get('/api/reportes/ventas-por-mes'),
          api.get('/api/reportes/productos-mas-vendidos'),
          api.get('/api/reportes/top-clientes'),
          api.get('/api/reportes/resumen-inventario'),
        ]);

        const ventas = ventasMes.data;
        const totalVentas  = ventas.reduce((s, r) => s + Number(r.total_ventas), 0);
        const totalPedidos = ventas.reduce((s, r) => s + Number(r.cantidad_ventas), 0);
        const stockBajo    = inventario.data.filter(p => p.stock < 20).length;

        setStats({ totalVentas, totalPedidos, stockBajo, totalProductos: inventario.data.length });
        setTopProd(productos.data.slice(0, 5));
        setTopClientes(clientes.data.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <span className="spinner" />;

  const fmt = n => `Q ${Number(n).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header">
        <h1>📊 Dashboard</h1>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Ventas totales</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{fmt(stats.totalVentas)}</div>
            <div className="stat-sub">Histórico acumulado</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Órdenes registradas</div>
            <div className="stat-value">{stats.totalPedidos}</div>
            <div className="stat-sub">Total de ventas</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Productos</div>
            <div className="stat-value">{stats.totalProductos}</div>
            <div className="stat-sub">En catálogo</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Stock bajo</div>
            <div className="stat-value" style={{ color: stats.stockBajo > 0 ? 'var(--warning)' : 'var(--success)' }}>
              {stats.stockBajo}
            </div>
            <div className="stat-sub">Productos con menos de 20 unidades</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top productos */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>🏆 Productos más vendidos</h3>
          {topProd.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>Sin datos</p>
            : topProd.map((p, i) => (
              <div key={p.id_Producto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < topProd.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: 12, width: 16 }}>{i + 1}</span>
                  {p.nombre_Producto}
                </span>
                <span className="badge badge-blue">{p.total_vendido} uds</span>
              </div>
            ))
          }
        </div>

        {/* Top clientes */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>⭐ Mejores clientes</h3>
          {topClientes.length === 0
            ? <p style={{ color: 'var(--text-muted)' }}>Sin datos</p>
            : topClientes.map((c, i) => (
              <div key={c.id_Cliente} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < topClientes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: 12, width: 16 }}>{i + 1}</span>
                  {c.nombre_Cliente}
                </span>
                <span className="badge badge-green">{fmt(c.gasto_total)}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}