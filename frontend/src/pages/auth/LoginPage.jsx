import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Ingresa un correo válido.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
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
    const res = await login(form.email, form.password);
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
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎯</div>
          <h1>Cazador de Gastos</h1>
          <p style={{ fontSize: 16, color: 'var(--navy-400)' }}>
            Inicia sesión 
          </p>
        </div>

        {apiError && (
          <div className="alert-banner danger" style={{ marginBottom: 20 }}>
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <Mail size={14} style={{ marginRight: 4 }} /> Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="tu@correo.com"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              autoComplete="email"
            />
            {errors.email && <div className="form-error">⚠ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <Lock size={14} style={{ marginRight: 4 }} /> Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Tu contraseña"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                         background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy-500)' }}
                onClick={() => setShowPwd(v => !v)}
              >
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
            {errors.password && <div className="form-error">⚠ {errors.password}</div>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--green-400)', textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><div className="spinner"/> Iniciando sesión...</> : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--navy-400)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--green-400)', fontWeight: 600, textDecoration: 'none' }}>
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
