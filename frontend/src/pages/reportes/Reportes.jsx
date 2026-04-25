import { useEffect, useState } from 'react';
import api from '../../api';

const TABS = [
  { key: 'ventas-por-mes',        label: '📅 Ventas por mes'         },
  { key: 'productos-mas-vendidos', label: '🏆 Más vendidos'           },
  { key: 'top-clientes',          label: '⭐ Top clientes'            },
  { key: 'clientes-sin-compras',  label: '⚠ Sin compras'             },
  { key: 'resumen-inventario',    label: '📦 Inventario'              },
  { key: 'vendedores-activos',    label: '👤 Vendedores activos'      },
];

export default function Reportes() {
  const [tab,     setTab]     = useState(TABS[0].key);
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/reportes/${tab}`)
      .then(r => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [tab]);

  function exportarCSV() {
    if (!data.length) return;
    const header = Object.keys(data[0]).join(',') + '\n';
    const rows   = data.map(r => Object.values(r).join(',')).join('\n');
    const blob   = new Blob([header + rows], { type: 'text/csv' });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement('a'); a.href = url; a.download = `${tab}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const fmt  = n => `Q ${Number(n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
  const cols = data.length ? Object.keys(data[0]) : [];

  return (
    <div>
      <div className="page-header">
        <h1>📊 Reportes</h1>
        <button className="btn btn-ghost" onClick={exportarCSV} disabled={!data.length}>⬇ Exportar CSV</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.key}
            className={`btn ${tab === t.key ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Descripción de la consulta */}
      <div className="card" style={{ marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        {tab === 'ventas-por-mes'         && '📌 GROUP BY + HAVING + SUM — Ventas agrupadas por mes con total mayor a 0'}
        {tab === 'productos-mas-vendidos' && '📌 Subquery en FROM — Top 10 productos por unidades vendidas'}
        {tab === 'top-clientes'           && '📌 CTE (WITH) — Clientes con mayor gasto total'}
        {tab === 'clientes-sin-compras'   && '📌 Subquery NOT IN — Clientes que nunca han realizado una compra'}
        {tab === 'resumen-inventario'     && '📌 VIEW vista_inventario — Productos con categorías, proveedores y valor de inventario'}
        {tab === 'vendedores-activos'     && '📌 Subquery EXISTS — Usuarios que han registrado al menos una venta'}
      </div>

      {loading ? <span className="spinner" /> : data.length === 0 ? (
        <div className="empty-state"><div className="icon">📭</div>Sin datos para mostrar</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {cols.map(col => <th key={col}>{col.replace(/_/g, ' ')}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {cols.map(col => (
                    <td key={col} style={{ fontFamily: typeof row[col] === 'number' ? 'var(--mono)' : 'inherit' }}>
                      {typeof row[col] === 'number' && col.includes('total')
                        ? fmt(row[col])
                        : row[col] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}