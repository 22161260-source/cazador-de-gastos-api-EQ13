import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function formatMXN(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

export default function AdminReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [monthly, setMonthly] = useState(null);
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [mRes, sRes] = await Promise.all([
          api.get('/reports/monthly', { params: { month, year } }),
          api.get('/reports/savings'),
        ]);
        setMonthly(mRes.data);
        setSavings(sRes.data.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [month, year]);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">📊 Reportes globales</h1><p className="page-subtitle">Análisis financiero del sistema</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="form-input" style={{ width: 130 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <input type="number" className="form-input" style={{ width: 90 }} value={year} onChange={e => setYear(Number(e.target.value))} />
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner"/><span>Cargando reportes...</span></div>
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total ingresos', value: formatMXN(monthly?.total_income), color: 'green' },
              { label: 'Total gastos', value: formatMXN(monthly?.total_expenses), color: 'red' },
              { label: 'Balance global', value: formatMXN(monthly?.balance), color: (monthly?.balance || 0) >= 0 ? 'green' : 'red' },
              { label: 'Gastos innecesarios', value: formatMXN(monthly?.unnecessary_total), color: 'amber' },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.color}`}>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ fontSize: 18 }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Tendencia últimos 6 meses — Todos los usuarios</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }}/>
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
                  <Tooltip formatter={(v, n) => [formatMXN(v), n === 'income' ? 'Ingresos' : n === 'expenses' ? 'Gastos' : 'Ahorro']}
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  <Legend formatter={v => v === 'income' ? 'Ingresos' : v === 'expenses' ? 'Gastos' : 'Ahorro'}/>
                  <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]}/>
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]}/>
                  <Bar dataKey="savings" fill="#3b82f6" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {monthly?.by_category?.length > 0 && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Gastos por categoría del mes</h3>
              <div className="table-container">
                <table>
                  <thead><tr><th>Categoría</th><th>Total</th><th>Transacciones</th><th>%</th></tr></thead>
                  <tbody>
                    {monthly.by_category.map((c, i) => {
                      const pct = monthly.total_expenses > 0 ? ((c.total / monthly.total_expenses) * 100).toFixed(1) : 0;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{c.category}</td>
                          <td style={{ fontWeight: 600, color: 'var(--danger)' }}>{formatMXN(c.total)}</td>
                          <td><span className="badge badge-gray">{c.count}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, background: 'var(--navy-900)', borderRadius: 99, height: 6 }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: '#10b981', borderRadius: 99 }}/>
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--navy-400)', minWidth: 36 }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
