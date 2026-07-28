import { useState, useEffect } from 'react';
import api from '../../lib/api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Plus, Trash2, Target, X } from 'lucide-react';

function formatMXN(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

function BudgetModal({ categories, onSave, onClose }) {
  const now = new Date();
  const [form, setForm] = useState({ category_id: '', amount: '', month: now.getMonth() + 1, year: now.getFullYear() });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.category_id) errs.category_id = 'Selecciona una categoría.';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'El monto debe ser mayor a 0.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await api.post('/budgets', form);
      onSave();
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🎯 Nuevo presupuesto</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Categoría *</label>
            <select className={`form-input ${errors.category_id ? 'error' : ''}`}
              value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
              <option value="">Selecciona una categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            {errors.category_id && <div className="form-error">⚠ {errors.category_id}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Límite mensual (MXN) *</label>
            <input type="number" min="1" step="0.01" className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            {errors.amount && <div className="form-error">⚠ {errors.amount}</div>}
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Mes</label>
              <select className="form-input" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Año</label>
              <input type="number" className="form-input" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner"/> Guardando...</> : 'Crear presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BudgetsPage() {
  const [budgets, setBudgets]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDelete] = useState(null);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets', { params: { month, year } });
      setBudgets(data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, [month, year]);
  useEffect(() => {
    api.get('/categories', { params: { type: 'expense', per_page: 100 } })
      .then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const handleDelete = async () => {
    await api.delete(`/budgets/${deleteTarget.id}`);
    setDelete(null);
    fetchBudgets();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🎯 Presupuestos</h1>
          <p className="page-subtitle">Controla cuánto puedes gastar por categoría</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={16}/> Nuevo presupuesto</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'var(--navy-400)', fontSize: 14 }}>Periodo:</span>
          <select className="form-input" style={{ width: 150 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <input type="number" className="form-input" style={{ width: 90 }} value={year} onChange={e => setYear(Number(e.target.value))} />
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner"/><span>Cargando presupuestos...</span></div>
      ) : budgets.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="emoji">🎯</div>
          <h3>Sin presupuestos configurados</h3>
          <p>Crea presupuestos por categoría para controlar tus gastos</p>
        </div></div>
      ) : (
        <div className="grid-2">
          {budgets.map(b => {
            const pct = Math.min(b.percentage || 0, 100);
            const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';
            return (
              <div key={b.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{b.category?.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.category?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--navy-500)' }}>Límite: {formatMXN(b.amount)}</div>
                    </div>
                  </div>
                  <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDelete(b)}><Trash2 size={14}/></button>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--navy-400)' }}>Gastado: {formatMXN(b.spent)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <div style={{ background: 'var(--navy-900)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                      borderRadius: 99,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--navy-500)' }}>
                  Disponible: {formatMXN(Math.max(0, b.amount - (b.spent || 0)))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && <BudgetModal categories={categories} onSave={() => { setModalOpen(false); fetchBudgets(); }} onClose={() => setModalOpen(false)} />}
      <ConfirmModal open={!!deleteTarget} title="Eliminar presupuesto" message="¿Eliminar este presupuesto?" confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} onCancel={() => setDelete(null)} />
    </div>
  );
}
