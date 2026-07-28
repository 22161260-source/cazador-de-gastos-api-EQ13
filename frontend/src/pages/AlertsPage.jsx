import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import Pagination from '../components/ui/Pagination';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Bell, BellOff, Trash2, CheckCheck } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [deleteTarget, setDelete]   = useState(null);
  const [markAllModal, setMarkAll]  = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/alerts', { params: { page, per_page: 10 } });
      setAlerts(data.data || []);
      setPagination(data.pagination);
      setUnread(data.unread_count || 0);
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleMarkRead = async (alert) => {
    await api.put(`/alerts/${alert.id}/read`);
    fetchAlerts();
  };

  const handleMarkAll = async () => {
    await api.put('/alerts/read-all');
    setMarkAll(false);
    fetchAlerts();
  };

  const handleDelete = async () => {
    await api.delete(`/alerts/${deleteTarget.id}`);
    setDelete(null);
    fetchAlerts();
  };

  const typeIcon = { warning: '⚠️', danger: '🚨', info: '💡', success: '✅' };
  const typeClass = { warning: 'warning', danger: 'danger', info: 'info', success: 'success' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔔 Alertas {unread > 0 && <span className="badge badge-red" style={{ fontSize: 14 }}>{unread}</span>}</h1>
          <p className="page-subtitle">Notificaciones del sistema sobre tu salud financiera</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary" onClick={() => setMarkAll(true)}>
            <CheckCheck size={16}/> Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-screen" style={{ height: 200 }}><div className="spinner"/><span>Cargando alertas...</span></div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">🔕</div>
            <h3>Sin alertas</h3>
            <p>¡Todo en orden! No tienes alertas pendientes.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-banner ${typeClass[alert.type] || 'info'}`}
                  style={{ opacity: alert.is_read ? 0.6 : 1, marginBottom: 0 }}>
                  <span style={{ fontSize: 20 }}>{typeIcon[alert.type] || '💬'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{alert.title}</div>
                    <div style={{ fontSize: 13 }}>{alert.message}</div>
                    <div style={{ fontSize: 11, marginTop: 6, opacity: 0.7 }}>{alert.created_at}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!alert.is_read && (
                      <button className="btn btn-icon btn-secondary btn-sm" onClick={() => handleMarkRead(alert)} title="Marcar como leída">
                        <BellOff size={14}/>
                      </button>
                    )}
                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDelete(alert)}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmModal open={!!deleteTarget} title="Eliminar alerta" message="¿Eliminar esta alerta?" confirmLabel="Eliminar" variant="danger" onConfirm={handleDelete} onCancel={() => setDelete(null)} />
      <ConfirmModal open={markAllModal} title="Marcar todas como leídas" message="¿Marcar todas las alertas como leídas?" confirmLabel="Confirmar" variant="success" onConfirm={handleMarkAll} onCancel={() => setMarkAll(false)} />
    </div>
  );
}
