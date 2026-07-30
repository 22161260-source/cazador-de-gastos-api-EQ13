import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Pagination from '../components/ui/Pagination';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Send, X, Lightbulb } from 'lucide-react';

export default function RecommendationsPage() {
  const [recs, setRecs]             = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [dismissTarget, setDismiss] = useState(null);
  const [whatsappTarget, setWhatsApp] = useState(null);
  const [sending, setSending]       = useState(false);
  const [toast, setToast]           = useState('');

  const fetchRecs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/recommendations', { params: { page, per_page: 8 } });
      setRecs(data.data || []);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchRecs(); }, [fetchRecs]);

  const handleDismiss = async () => {
    await api.put(`/recommendations/${dismissTarget.id}/dismiss`);
    setDismiss(null);
    fetchRecs();
  };

  const handleWhatsApp = async () => {
    setSending(true);
    try {
      await api.post(`/recommendations/${whatsappTarget.id}/send-whatsapp`);
      setToast('✅ Recomendación enviada por WhatsApp');
      setWhatsApp(null);
      fetchRecs();
    } catch (err) {
      setToast('❌ ' + (err.response?.data?.message || 'Error al enviar'));
    } finally {
      setSending(false);
      setTimeout(() => setToast(''), 4000);
    }
  };

  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const priorityLabels = { high: '🔴 Alta', medium: '🟡 Media', low: '🟢 Baja' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💡 Recomendaciones</h1>
          <p className="page-subtitle">Sugerencias personalizadas para mejorar tus finanzas</p>
        </div>
      </div>

      {toast && (
        <div className={`alert-banner ${toast.startsWith('✅') ? 'success' : 'danger'}`} style={{ marginBottom: 16 }}>
          {toast}
        </div>
      )}

      {loading ? (
        <div className="loading-screen"><div className="spinner"/><span>Cargando recomendaciones...</span></div>
      ) : recs.length === 0 ? (
        <div className="card"><div className="empty-state">
          <div className="emoji">🏆</div>
          <h3>¡Excelente manejo financiero!</h3>
          <p>No tienes recomendaciones pendientes. Sigue así.</p>
        </div></div>
      ) : (
        <div className="grid-2">
          {recs.map(rec => (
            <div key={rec.id} className="card" style={{ borderLeft: `3px solid ${priorityColors[rec.priority]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className="badge" style={{ background: priorityColors[rec.priority] + '22', color: priorityColors[rec.priority] }}>
                  {priorityLabels[rec.priority]}
                </span>
                <span style={{ fontSize: 11, color: 'var(--navy-500)' }}>{rec.created_at}</span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <Lightbulb size={20} color={priorityColors[rec.priority]} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{rec.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--navy-400)', lineHeight: 1.5 }}>{rec.message}</div>
                </div>
              </div>

              {rec.potential_saving > 0 && (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--green-400)', fontWeight: 600 }}>
                    💰 Ahorro estimado: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(rec.potential_saving)} / mes
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setWhatsApp(rec)}>
                  <Send size={13}/> Enviar por WhatsApp
                </button>
                <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDismiss(rec)} title="Descartar">
                  <X size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && <Pagination pagination={pagination} onPageChange={setPage} />}

      <ConfirmModal open={!!dismissTarget} title="Descartar recomendación" message="¿Descartar esta recomendación? No aparecerá más." confirmLabel="Descartar" variant="danger" onConfirm={handleDismiss} onCancel={() => setDismiss(null)} />
      <ConfirmModal open={!!whatsappTarget} title="Enviar por WhatsApp" message={`¿Enviar "${whatsappTarget?.title}" a tu WhatsApp?`} confirmLabel={sending ? 'Enviando...' : 'Enviar'} variant="success" onConfirm={handleWhatsApp} onCancel={() => setWhatsApp(null)} />
    </div>
  );
}
