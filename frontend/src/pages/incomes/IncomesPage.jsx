import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import Pagination from '../../components/ui/Pagination';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

function formatMXN(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

function IncomeModal({ income, categories, onSave, onClose }) {
  const isEdit = !!income;
  const [form, setForm] = useState({
    description: income?.description || '',
    amount: income?.amount || '',
    date: income?.date || new Date().toISOString().split('T')[0],
    category_id: income?.category?.id || '',
    recurrence: income?.recurrence || 'none',
    notes: income?.notes || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'La descripción es obligatoria.';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'El monto debe ser mayor a 0.';
    if (!form.date) e.date = 'La fecha es obligatoria.';
    return e;
  };

  const handleChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { ...form, category_id: form.category_id || null };
      if (isEdit) await api.put(`/incomes/${income.id}`, payload);
      else await api.post('/incomes', payload);
      onSave();
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Editar ingreso' : '💰 Nuevo ingreso'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Descripción *</label>
            <input className={`form-input ${errors.description ? 'error' : ''}`}
              placeholder="Ej: Sueldo quincenal" value={form.description}
              onChange={e => handleChange('description', e.target.value)} />
            {errors.description && <div className="form-error">⚠ {errors.description}</div>}
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Monto (MXN) *</label>
              <input type="number" min="0.01" step="0.01"
                className={`form-input ${errors.amount ? 'error' : ''}`}
                placeholder="0.00" value={form.amount}
                onChange={e => handleChange('amount', e.target.value)} />
              {errors.amount && <div className="form-error">⚠ {errors.amount}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Fecha *</label>
              <input type="date" className={`form-input ${errors.date ? 'error' : ''}`}
                value={form.date} onChange={e => handleChange('date', e.target.value)} />
              {errors.date && <div className="form-error">⚠ {errors.date}</div>}
            </div>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select className="form-input" value={form.category_id}
                onChange={e => handleChange('category_id', e.target.value)}>
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Recurrencia</label>
              <select className="form-input" value={form.recurrence}
                onChange={e => handleChange('recurrence', e.target.value)}>
                <option value="none">Sin recurrencia</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner"/> Guardando...</> : isEdit ? 'Actualizar' : 'Registrar ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IncomesPage() {
  const [incomes, setIncomes]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ search: '', category_id: '' });
  const [page, setPage]             = useState(1);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleteTarget, setDelete]   = useState(null);

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, per_page: 10 };
      Object.keys(params).forEach(k => params[k] === '' && delete params[k]);
      const { data } = await api.get('/incomes', { params });
      setIncomes(data.data || []);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);
  useEffect(() => {
    api.get('/categories', { params: { type: 'income', per_page: 100 } })
      .then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const handleDelete = async () => {
    await api.delete(`/incomes/${deleteTarget.id}`);
    setDelete(null);
    fetchIncomes();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Ingresos</h1>
          <p className="page-subtitle">Registra todos tus fuentes de ingresos</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={16}/> Nuevo ingreso
        </button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--navy-500)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Buscar ingreso..."
              value={filters.search} onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }} />
          </div>
          <select className="form-input" style={{ minWidth: 180 }} value={filters.category_id}
            onChange={e => { setFilters(f => ({ ...f, category_id: e.target.value })); setPage(1); }}>
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-screen" style={{ height: 200 }}><div className="spinner"/><span>Cargando ingresos...</span></div>
        ) : incomes.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">💰</div>
            <h3>Sin ingresos registrados</h3>
            <p>Agrega tus fuentes de ingreso para calcular tu balance</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Descripción</th><th>Categoría</th><th>Monto</th><th>Fecha</th><th>Recurrencia</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {incomes.map(inc => (
                    <tr key={inc.id}>
                      <td style={{ fontWeight: 500 }}>{inc.description}</td>
                      <td>{inc.category ? <span>{inc.category.icon} {inc.category.name}</span> : <span className="text-muted">—</span>}</td>
                      <td><span style={{ fontWeight: 600, color: 'var(--green-400)' }}>{formatMXN(inc.amount)}</span></td>
                      <td style={{ color: 'var(--navy-400)' }}>{new Date(inc.date).toLocaleDateString('es-MX')}</td>
                      <td>
                        <span className="badge badge-gray">
                          {inc.recurrence === 'none' ? 'Único' : inc.recurrence === 'weekly' ? 'Semanal' : inc.recurrence === 'biweekly' ? 'Quincenal' : 'Mensual'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-icon btn-secondary btn-sm" onClick={() => { setEditing(inc); setModalOpen(true); }}><Pencil size={14}/></button>
                          <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDelete(inc)}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      {modalOpen && <IncomeModal income={editing} categories={categories} onSave={() => { setModalOpen(false); setEditing(null); fetchIncomes(); }} onClose={() => { setModalOpen(false); setEditing(null); }} />}
      <ConfirmModal open={!!deleteTarget} title="Eliminar ingreso" message={`¿Eliminar "${deleteTarget?.description}"?`} confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} onCancel={() => setDelete(null)} />
    </div>
  );
}
