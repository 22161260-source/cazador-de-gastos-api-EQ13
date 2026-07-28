import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { X } from 'lucide-react';

export default function ExpenseModal({ expense, categories, onSave, onClose }) {
  const isEdit = !!expense;
  const [form, setForm] = useState({
    description: expense?.description || '',
    amount: expense?.amount || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    category_id: expense?.category?.id || '',
    recurrence: expense?.recurrence || 'none',
    is_unnecessary: expense?.is_unnecessary || false,
    notes: expense?.notes || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'La descripción es obligatoria.';
    else if (form.description.length < 3) e.description = 'Mínimo 3 caracteres.';
    if (!form.amount) e.amount = 'El monto es obligatorio.';
    else if (isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'El monto debe ser mayor a 0.';
    if (!form.date) e.date = 'La fecha es obligatoria.';
    return e;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = { ...form, category_id: form.category_id || null };
      if (isEdit) {
        await api.put(`/expenses/${expense.id}`, payload);
      } else {
        await api.post('/expenses', payload);
      }
      onSave();
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      setErrors(apiErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Editar gasto' : '💸 Nuevo gasto'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Descripción *</label>
            <input className={`form-input ${errors.description ? 'error' : ''}`}
              placeholder="Ej: Comida en restaurante" value={form.description}
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

          <div className="form-group">
            <label className="form-label">Notas (opcional)</label>
            <textarea className="form-input" rows={2} placeholder="Observaciones..."
              value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_unnecessary}
                onChange={e => handleChange('is_unnecessary', e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--danger)' }} />
              <span className="form-label" style={{ margin: 0 }}>Marcar como gasto innecesario</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner"/> Guardando...</> : isEdit ? 'Actualizar' : 'Registrar gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
