import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('El correo es obligatorio.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Ingresa un correo válido.'); return; }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
          <h1>Recuperar contraseña</h1>
          <p style={{ color: 'var(--navy-400)', fontSize: 14, marginTop: 4 }}>
            Te enviaremos un enlace a tu correo
          </p>
        </div>

        {success ? (
          <div className="alert-banner success">
            ✅ Correo enviado. Revisa tu bandeja de entrada y sigue las instrucciones.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Correo electrónico</label>
              <input id="forgot-email" type="email"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="tu@correo.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
              />
              {error && <div className="form-error">⚠ {error}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><div className="spinner"/> Enviando...</> : 'Enviar enlace de recuperación'}
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
