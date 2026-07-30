import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirmar', variant = 'danger', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: variant === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            {variant === 'danger'
              ? <AlertTriangle size={28} color="var(--danger)" />
              : <CheckCircle size={28} color="var(--green-500)" />
            }
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
          <p style={{ color: 'var(--navy-400)', fontSize: 14 }}>{message}</p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            style={variant === 'danger' ? { background: 'var(--danger)', color: 'white' } : {}}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
