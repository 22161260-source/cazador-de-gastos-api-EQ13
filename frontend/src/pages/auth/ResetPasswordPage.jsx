import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qToken = searchParams.get('token');
    
    if (qEmail) setEmail(qEmail);
    if (qToken) setToken(qToken);
    
    if (!qEmail || !qToken) {
      setError('Enlace inválido o incompleto.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !passwordConfirmation) { 
      setError('Todos los campos son obligatorios.'); 
      return; 
    }
    if (password !== passwordConfirmation) { 
      setError('Las contraseñas no coinciden.'); 
      return; 
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <h1>Nueva contraseña</h1>
          <p style={{ color: 'var(--navy-400)', fontSize: 14, marginTop: 4 }}>
            Ingresa tu nueva contraseña para {email}
          </p>
        </div>

        {success ? (
          <div className="alert-banner success">
            ✅ Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input type="password"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirmar contraseña</label>
              <input type="password"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={e => { setPasswordConfirmation(e.target.value); setError(''); }}
              />
              {error && <div className="form-error">⚠ {error}</div>}
              <div style={{ fontSize: 12, color: 'var(--navy-400)', marginTop: 8 }}>
                Mínimo 8 caracteres, incluir mayúscula, número y símbolo.
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || !token || !email}>
              {loading ? <><div className="spinner"/> Guardando...</> : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--navy-400)' }}>
          <Link to="/login" style={{ color: 'var(--green-400)', textDecoration: 'none' }}>← Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}
