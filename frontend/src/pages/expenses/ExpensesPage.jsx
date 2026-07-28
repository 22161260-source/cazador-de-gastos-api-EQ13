import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import Pagination from '../../components/ui/Pagination';
import ConfirmModal from '../../components/ui/ConfirmModal';
import ExpenseModal from './ExpenseModal';
import { Plus, Search, Pencil, Trash2, AlertTriangle } from 'lucide-react';

function formatMXN(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

export default function ExpensesPage() {
  const [expenses, setExpenses]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filters, setFilters]       = useState({ search: '', category_id: '', date_from: '', date_to: '', is_unnecessary: '' });
  const [page, setPage]             = useState(1);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingExpense, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, per_page: 10 };
      Object.keys(params).forEach(k => params[k] === '' && delete params[k]);
      const { data } = await api.get('/expenses', { params });
      setExpenses(data.data || []);
      setPagination(data.pagination);
    } catch {
      setError('Error al cargar gastos.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  useEffect(() => {
    api.get('/categories', { params: { type: 'expense', per_page: 100 } })
      .then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchExpenses();
    } catch {
      setError('No se pudo eliminar el gasto.');
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditing(null);
    fetchExpenses();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💸 Gastos</h1>
          <p className="page-subtitle">Gestiona y analiza tus gastos</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}>
          <Plus size={16}/> Nuevo gasto
        </button>
      </div>

      {error && <div className="alert-banner danger" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Filtros - enviados al servidor */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--navy-500)' }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Buscar..."
              value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
          </div>
          <select className="form-input" value={filters.category_id} onChange={e => handleFilterChange('category_id', e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
          </select>
          <input type="date" className="form-input" value={filters.date_from} onChange={e => handleFilterChange('date_from', e.target.value)} />
          <input type="date" className="form-input" value={filters.date_to} onChange={e => handleFilterChange('date_to', e.target.value)} />
          <select className="form-input" value={filters.is_unnecessary} onChange={e => handleFilterChange('is_unnecessary', e.target.value)}>
            <option value="">Todos</option>
            <option value="true">Innecesarios</option>
            <option value="false">Necesarios</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-screen" style={{ height: 200 }}><div className="spinner"/><span>Cargando gastos...</span></div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">💸</div>
            <h3>Sin gastos registrados</h3>
            <p>Registra tu primer gasto para comenzar el análisis</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModalOpen(true)}>
              <Plus size={16}/> Agregar gasto
            </button>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Descripción</th><th>Categoría</th><th>Monto</th>
                    <th>Fecha</th><th>Estado</th><th>Etiquetas</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{expense.description}</div>
                        {expense.notes && <div style={{ fontSize: 12, color: 'var(--navy-500)' }}>{expense.notes}</div>}
                      </td>
                      <td>
                        {expense.category
                          ? <span>{expense.category.icon} {expense.category.name}</span>
                          : <span className="text-muted">Sin categoría</span>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: expense.is_unnecessary ? 'var(--danger)' : 'var(--navy-100)' }}>
                          {formatMXN(expense.amount)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--navy-400)' }}>
                        {new Date(expense.date).toLocaleDateString('es-MX')}
                      </td>
                      <td>
                        {expense.is_unnecessary
                          ? <span className="badge badge-red"><AlertTriangle size={10}/> Innecesario</span>
                          : <span className="badge badge-green">✓ Necesario</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {expense.tags?.map(tag => (
                            <span key={tag.id} className="badge" style={{ background: tag.color + '22', color: tag.color }}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-icon btn-secondary btn-sm"
                            onClick={() => { setEditing(expense); setModalOpen(true); }}>
                            <Pencil size={14}/>
                          </button>
                          <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDeleteTarget(expense)}>
                            <Trash2 size={14}/>
                          </button>
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

      {modalOpen && (
        <ExpenseModal
          expense={editingExpense}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar gasto"
        message={`¿Eliminar "${deleteTarget?.description}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
