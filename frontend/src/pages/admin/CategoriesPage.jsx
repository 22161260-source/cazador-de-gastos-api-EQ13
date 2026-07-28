import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import Pagination from '../../components/ui/Pagination';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

function CategoryModal({ category, onSave, onClose }) {
  const isEdit = !!category;
  const [form, setForm] = useState({ name: category?.name || '', icon: category?.icon || '', color: category?.color || '#10b981', type: category?.type || 'expense', is_system: category?.is_system || false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: 'El nombre es obligatorio.' }); return; }
    setLoading(true);
    try {
      if (isEdit) await api.put(`/categories/${category.id}`, form);
      else await api.post('/categories', form);
      onSave();
    } catch (err) { setErrors(err.response?.data?.errors || {}); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Editar categoría' : '➕ Nueva categoría'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nombre *</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors({}); }} />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Icono (emoji)</label>
              <input className="form-input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🍔" maxLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ width: 40, height: 40, padding: 2, background: 'var(--navy-900)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer' }} />
                <input className="form-input" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="#10b981" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
                <option value="both">Ambos</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingTop: 24 }}>
                <input type="checkbox" checked={form.is_system} onChange={e => setForm(f => ({ ...f, is_system: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--green-500)' }} />
                <span className="form-label" style={{ margin: 0 }}>Categoría del sistema</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner"/> Guardando...</> : isEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [cats, setCats]             = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [modalOpen, setModal]       = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleteTarget, setDelete]   = useState(null);

  const fetchCats = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 15 };
      if (search) params.search = search;
      const { data } = await api.get('/categories', { params });
      setCats(data.data || []);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchCats(); }, [fetchCats]);

  const handleDelete = async () => {
    await api.delete(`/categories/${deleteTarget.id}`);
    setDelete(null);
    fetchCats();
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">🏷️ Categorías</h1><p className="page-subtitle">Administra las categorías de gastos e ingresos</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}><Plus size={16}/> Nueva categoría</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--navy-500)' }}/>
          <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Buscar categoría..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading-screen" style={{ height: 200 }}><div className="spinner"/></div> : (
          <>
            <div className="table-container">
              <table>
                <thead><tr><th>Categoría</th><th>Tipo</th><th>Sistema</th><th>Acciones</th></tr></thead>
                <tbody>
                  {cats.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            {c.icon || '📁'}
                          </div>
                          <span style={{ fontWeight: 500 }}>{c.name}</span>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }} />
                        </div>
                      </td>
                      <td><span className={`badge ${c.type === 'expense' ? 'badge-red' : c.type === 'income' ? 'badge-green' : 'badge-blue'}`}>
                        {c.type === 'expense' ? 'Gasto' : c.type === 'income' ? 'Ingreso' : 'Ambos'}
                      </span></td>
                      <td>{c.is_system ? <span className="badge badge-amber">Sistema</span> : <span className="badge badge-gray">Personal</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-icon btn-secondary btn-sm" onClick={() => { setEditing(c); setModal(true); }}><Pencil size={14}/></button>
                          <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDelete(c)}><Trash2 size={14}/></button>
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

      {modalOpen && <CategoryModal category={editing} onSave={() => { setModal(false); fetchCats(); }} onClose={() => setModal(false)} />}
      <ConfirmModal open={!!deleteTarget} title="Eliminar categoría" message={`¿Eliminar "${deleteTarget?.name}"?`} confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} onCancel={() => setDelete(null)} />
    </div>
  );
}
