import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import Pagination from '../../components/ui/Pagination';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, X } from 'lucide-react';

function UserModal({ userToEdit, roles, onSave, onClose }) {
  const isEdit = !!userToEdit;
  const [form, setForm] = useState({ name: userToEdit?.name || '', email: userToEdit?.email || '', role_id: userToEdit?.role?.id || '', phone: userToEdit?.phone || '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio.';
    if (!form.email) e.email = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido.';
    if (!form.role_id) e.role_id = 'El rol es obligatorio.';
    if (!isEdit) {
      if (!form.password) e.password = 'La contraseña es obligatoria.';
      else if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password) || !/[^a-zA-Z0-9]/.test(form.password))
        e.password = 'Mín. 8 chars, 1 mayúscula, 1 número, 1 especial.';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) { delete payload.password; delete payload.password_confirmation; }
      if (isEdit) await api.put(`/users/${userToEdit.id}`, payload);
      else await api.post('/users', payload);
      onSave();
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally { setLoading(false); }
  };

  const h = (f, v) => { setForm(x => ({ ...x, [f]: v })); setErrors(er => ({ ...er, [f]: '' })); };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? '✏️ Editar usuario' : '➕ Nuevo usuario'}</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => h('name', e.target.value)} />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" value={form.phone} onChange={e => h('phone', e.target.value)} placeholder="+52..." />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Correo *</label>
            <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={e => h('email', e.target.value)} />
            {errors.email && <div className="form-error">⚠ {errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Rol *</label>
            <select className={`form-input ${errors.role_id ? 'error' : ''}`} value={form.role_id} onChange={e => h('role_id', e.target.value)}>
              <option value="">Selecciona un rol</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.display_name}</option>)}
            </select>
            {errors.role_id && <div className="form-error">⚠ {errors.role_id}</div>}
          </div>
          {!isEdit && (
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Contraseña *</label>
                <input type="password" className={`form-input ${errors.password ? 'error' : ''}`} value={form.password} onChange={e => h('password', e.target.value)} />
                {errors.password && <div className="form-error">⚠ {errors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <input type="password" className="form-input" value={form.password_confirmation} onChange={e => h('password_confirmation', e.target.value)} />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner"/> Guardando...</> : isEdit ? 'Actualizar' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]           = useState([]);
  const [roles, setRoles]           = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ search: '', role_id: '' });
  const [page, setPage]             = useState(1);
  const [modalOpen, setModal]       = useState(false);
  const [editing, setEditing]       = useState(null);
  const [deleteTarget, setDelete]   = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, per_page: 15 };
      Object.keys(params).forEach(k => params[k] === '' && delete params[k]);
      const { data } = await api.get('/users', { params });
      setUsers(data.data || []);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    api.get('/roles').then(r => setRoles(r.data || [])).catch(() => {});
  }, []);

  const handleToggle = async (user) => {
    await api.put(`/users/${user.id}/toggle-active`);
    fetchUsers();
  };

  const handleDelete = async () => {
    await api.delete(`/users/${deleteTarget.id}`);
    setDelete(null);
    fetchUsers();
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">👥 Gestión de usuarios</h1><p className="page-subtitle">Administra los usuarios del sistema</p></div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true); }}><Plus size={16}/> Nuevo usuario</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--navy-500)' }}/>
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Buscar por nombre o correo..."
              value={filters.search} onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }} />
          </div>
          <select className="form-input" style={{ minWidth: 150 }} value={filters.role_id}
            onChange={e => { setFilters(f => ({ ...f, role_id: e.target.value })); setPage(1); }}>
            <option value="">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.display_name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading-screen" style={{ height: 200 }}><div className="spinner"/><span>Cargando usuarios...</span></div> : (
          <>
            <div className="table-container">
              <table>
                <thead><tr><th>Usuario</th><th>Rol</th><th>Teléfono</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={u.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                          <div><div style={{ fontWeight: 500 }}>{u.name}</div><div style={{ fontSize: 12, color: 'var(--navy-500)' }}>{u.email}</div></div>
                        </div>
                      </td>
                      <td><span className="badge badge-blue">{u.role?.display_name}</span></td>
                      <td style={{ color: 'var(--navy-400)', fontSize: 13 }}>{u.phone || '—'}</td>
                      <td>
                        <button className="btn btn-icon btn-secondary btn-sm" onClick={() => handleToggle(u)} title={u.is_active ? 'Desactivar' : 'Activar'}>
                          {u.is_active ? <ToggleRight size={18} color="var(--green-400)"/> : <ToggleLeft size={18} color="var(--navy-500)"/>}
                        </button>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--navy-500)' }}>{u.created_at}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-icon btn-secondary btn-sm" onClick={() => { setEditing(u); setModal(true); }}><Pencil size={14}/></button>
                          <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDelete(u)}><Trash2 size={14}/></button>
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

      {modalOpen && <UserModal userToEdit={editing} roles={roles} onSave={() => { setModal(false); fetchUsers(); }} onClose={() => setModal(false)} />}
      <ConfirmModal open={!!deleteTarget} title="Eliminar usuario" message={`¿Eliminar a "${deleteTarget?.name}"? Esta acción no se puede deshacer.`} confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} onCancel={() => setDelete(null)} />
    </div>
  );
}
