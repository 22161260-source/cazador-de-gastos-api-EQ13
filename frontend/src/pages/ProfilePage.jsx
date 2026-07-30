import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [pwdErrors, setPwdErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await api.put('/profile', form);
      updateUser(data.data);
      showToast('✅ Perfil actualizado correctamente.');
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally { setLoading(false); }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwdForm.password) errs.password = 'La contraseña es obligatoria.';
    else {
      if (pwdForm.password.length < 8) errs.password = 'Mínimo 8 caracteres.';
      else if (!/[A-Z]/.test(pwdForm.password)) errs.password = 'Debe contener una mayúscula.';
      else if (!/[0-9]/.test(pwdForm.password)) errs.password = 'Debe contener un número.';
      else if (!/[^a-zA-Z0-9]/.test(pwdForm.password)) errs.password = 'Debe contener un carácter especial.';
    }
    if (pwdForm.password !== pwdForm.password_confirmation) errs.password_confirmation = 'Las contraseñas no coinciden.';
    if (Object.keys(errs).length) { setPwdErrors(errs); return; }

    setPwdLoading(true);
    try {
      await api.put('/profile', pwdForm);
      setPwdForm({ password: '', password_confirmation: '' });
      showToast('✅ Contraseña actualizada correctamente.');
    } catch (err) {
      setPwdErrors(err.response?.data?.errors || {});
    } finally { setPwdLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 Mi perfil</h1>
          <p className="page-subtitle">Gestiona tu información personal</p>
        </div>
      </div>

      {toast && <div className={`alert-banner ${toast.startsWith('✅') ? 'success' : 'danger'}`} style={{ marginBottom: 20 }}>{toast}</div>}

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Info básica */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <img src={user?.avatar_url} alt={user?.name} style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--green-500)' }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</div>
              <div style={{ color: 'var(--navy-400)', fontSize: 14 }}>{user?.role?.display_name}</div>
              <div style={{ color: 'var(--navy-500)', fontSize: 13 }}>{user?.email}</div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} noValidate>
            <div className="form-group">
              <label className="form-label"><User size={13}/> Nombre completo</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`}
                value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }} />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label"><Mail size={13}/> Correo electrónico</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
              <div className="form-error" style={{ color: 'var(--navy-500)' }}>El correo no puede modificarse</div>
            </div>

            <div className="form-group">
              <label className="form-label"><Phone size={13}/> Teléfono</label>
              <input className="form-input" placeholder="+52 123 456 7890"
                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <div style={{ fontSize: 12, color: 'var(--navy-500)', marginTop: 4 }}>
                * Necesario para recibir alertas por SMS y WhatsApp
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><div className="spinner"/> Guardando...</> : 'Actualizar perfil'}
            </button>
          </form>
        </div>

        {/* Cambiar contraseña */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={16}/> Cambiar contraseña
          </h3>

          <form onSubmit={handlePwdSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'}
                  className={`form-input ${pwdErrors.password ? 'error' : ''}`}
                  placeholder="Nueva contraseña segura"
                  value={pwdForm.password}
                  onChange={e => { setPwdForm(f => ({ ...f, password: e.target.value })); setPwdErrors(er => ({ ...er, password: '' })); }}
                  style={{ paddingRight: 44 }} />
                <button type="button" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy-500)' }}
                  onClick={() => setShowPwd(v => !v)}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {pwdErrors.password && <div className="form-error">⚠ {pwdErrors.password}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar nueva contraseña</label>
              <input type={showPwd ? 'text' : 'password'}
                className={`form-input ${pwdErrors.password_confirmation ? 'error' : ''}`}
                placeholder="Repite la contraseña"
                value={pwdForm.password_confirmation}
                onChange={e => { setPwdForm(f => ({ ...f, password_confirmation: e.target.value })); setPwdErrors(er => ({ ...er, password_confirmation: '' })); }} />
              {pwdErrors.password_confirmation && <div className="form-error">⚠ {pwdErrors.password_confirmation}</div>}
            </div>

            <div className="alert-banner info" style={{ marginBottom: 20, fontSize: 12 }}>
              La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={pwdLoading}>
              {pwdLoading ? <><div className="spinner"/> Cambiando...</> : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
