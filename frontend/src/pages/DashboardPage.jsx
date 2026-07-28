import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { TrendingDown, TrendingUp, DollarSign, AlertTriangle, ArrowRight } from 'lucide-react';

function formatMXN(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [savings, setSavings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, savingsRes, alertsRes] = await Promise.all([
          api.get('/expenses-stats'),
          api.get('/reports/savings'),
          api.get('/alerts', { params: { per_page: 3 } }),
        ]);
        setStats(statsRes.data);
        setSavings(savingsRes.data.data || []);
        setAlerts(alertsRes.data.data || []);
      } catch (err) {
        setError('Error al cargar los datos del dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert-banner danger">{error}</div>;
  }

  const now = new Date();
  const monthName = now.toLocaleString('es-MX', { month: 'long' });

  const COLORS = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16'];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Hola, {user?.name?.split(' ')[0]}</h1>
          <p className="page-subtitle">Resumen financiero de {monthName} {now.getFullYear()}</p>
        </div>
        <Link to="/expenses" className="btn btn-primary">
          <TrendingDown size={16}/> Registrar gasto
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card green">
          <div className="stat-icon green"><TrendingUp size={20}/></div>
          <div>
            <div className="stat-label">Ingresos del mes</div>
            <div className="stat-value">{formatMXN(stats?.total_income)}</div>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><TrendingDown size={20}/></div>
          <div>
            <div className="stat-label">Gastos del mes</div>
            <div className="stat-value">{formatMXN(stats?.total_expenses)}</div>
          </div>
        </div>
        <div className={`stat-card ${(stats?.balance || 0) >= 0 ? 'green' : 'red'}`}>
          <div className={`stat-icon ${(stats?.balance || 0) >= 0 ? 'green' : 'red'}`}>
            <DollarSign size={20}/>
          </div>
          <div>
            <div className="stat-label">Balance</div>
            <div className="stat-value">{formatMXN(stats?.balance)}</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><AlertTriangle size={20}/></div>
          <div>
            <div className="stat-label">Gastos innecesarios</div>
            <div className="stat-value">{formatMXN(stats?.unnecessary_total)}</div>
            <div className="stat-sub">Detectados este mes</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Donut - Gastos por categoría */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Gastos por categoría</h3>
          {(stats?.by_category?.length || 0) === 0 ? (
            <div className="empty-state">
              <div className="emoji">📊</div>
              <h3>Sin gastos registrados</h3>
              <p>Registra tu primer gasto para ver la distribución</p>
            </div>
          ) : (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.by_category}
                    dataKey="total"
                    nameKey="category"
                    cx="50%" cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={3}
                  >
                    {stats.by_category.map((entry, index) => (
                      <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatMXN(v)}
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Bar Chart - Tendencia 6 meses */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tendencia últimos 6 meses</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savings} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v, name) => [formatMXN(v), name === 'income' ? 'Ingresos' : name === 'expenses' ? 'Gastos' : 'Ahorro']}
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                />
                <Legend formatter={(v) => v === 'income' ? 'Ingresos' : v === 'expenses' ? 'Gastos' : 'Ahorro'} />
                <Bar dataKey="income"   fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4,4,0,0]} />
                <Bar dataKey="savings"  fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Alertas recientes</h3>
          <Link to="/alerts" className="btn btn-secondary btn-sm">
            Ver todas <ArrowRight size={14}/>
          </Link>
        </div>
        {alerts.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}>
            <div className="emoji">🔔</div>
            <h3>Sin alertas</h3>
            <p>¡Todo en orden! No tienes alertas pendientes.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`alert-banner ${alert.type === 'danger' ? 'danger' : alert.type === 'warning' ? 'warning' : 'info'}`}
                style={{ marginBottom: 0, opacity: alert.is_read ? 0.6 : 1 }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{alert.title}</div>
                  <div style={{ fontSize: 13, opacity: 0.85 }}>{alert.message}</div>
                </div>
                <span style={{ fontSize: 11, opacity: 0.6, flexShrink: 0 }}>{alert.created_at}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
