import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';

function PasswordRequirement({ met, label }) {
  return (
    <div className={`pwd-req ${met ? 'met' : ''}`}>
      <span className="dot"/>
      {label}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState('');

  const pwd = form.password;
  const requirements = [
    { met: pwd.length >= 8,              label: 'Al menos 8 caracteres' },
    { met: /[A-Z]/.test(pwd),           label: 'Una letra mayúscula' },
    { met: /[0-9]/.test(pwd),           label: 'Un número' },
    { met: /[^a-zA-Z0-9]/.test(pwd),   label: 'Un carácter especial (!@#$...)' },
  ];

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name = 'El nombre es obligatorio.';
    else if (form.name.trim().length < 2) e.name = 'Mínimo 2 caracteres.';

    if (!form.email)          e.email = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Ingresa un correo válido.';

    if (!form.password)       e.password = 'La contraseña es obligatoria.';
    else if (requirements.some(r => !r.met)) e.password = 'La contraseña no cumple los requisitos.';

    if (form.password !== form.password_confirmation)
      e.password_confirmation = 'Las contraseñas no coinciden.';

    return e;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    const res = await register(form);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setApiError(res.message);
      if (res.errors) setErrors(res.errors);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">
          <div style={{ fontSize: 40, marginBottom: 6 }}>🎯</div>
          <h1>Crea tu cuenta</h1>
          <p style={{ color: 'var(--navy-400)', fontSize: 14, marginTop: 4 }}>
            Comienza a cazar gastos innecesarios
          </p>
        </div>

        {apiError && (
          <div className="alert-banner danger" style={{ marginBottom: 20 }}>⚠️ {apiError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nombre completo</label>
              <input id="name" type="text" className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Tu nombre" value={form.name} onChange={e => handleChange('name', e.target.value)} />
              {errors.name && <div className="form-error">⚠ {errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Teléfono (opcional)</label>
              <input id="phone" type="tel" className="form-input"
                placeholder="+52 123 456 7890" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Correo electrónico</label>
            <input id="reg-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="tu@correo.com" value={form.email} onChange={e => handleChange('email', e.target.value)} />
            {errors.email && <div className="form-error">⚠ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" type={showPwd ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Contraseña segura" value={form.password}
                onChange={e => handleChange('password', e.target.value)} style={{ paddingRight: 44 }} />
              <button type="button" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy-500)' }}
                onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {form.password && (
              <div className="pwd-requirements">
                {requirements.map((r, i) => (
                  <PasswordRequirement key={i} met={r.met} label={r.label} />
                ))}
              </div>
            )}
            {errors.password && <div className="form-error">⚠ {errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirmar contraseña</label>
            <input id="confirm-password" type={showPwd ? 'text' : 'password'}
              className={`form-input ${errors.password_confirmation ? 'error' : ''}`}
              placeholder="Repite tu contraseña" value={form.password_confirmation}
              onChange={e => handleChange('password_confirmation', e.target.value)} />
            {errors.password_confirmation && <div className="form-error">⚠ {errors.password_confirmation}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><div className="spinner"/> Creando cuenta...</> : 'Crear cuenta gratuita'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--navy-400)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--green-400)', fontWeight: 600, textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
