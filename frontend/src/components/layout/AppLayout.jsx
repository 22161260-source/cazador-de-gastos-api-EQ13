import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';
import {
  LayoutDashboard, TrendingDown, TrendingUp, Target, Bell,
  Lightbulb, User, Users, Tag, BarChart2, LogOut, Menu, X
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout, isAdmin, isAdvisor } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard',       icon: <LayoutDashboard size={18}/>, label: 'Dashboard' },
    { to: '/expenses',        icon: <TrendingDown size={18}/>,    label: 'Gastos' },
    { to: '/incomes',         icon: <TrendingUp size={18}/>,      label: 'Ingresos' },
    { to: '/budgets',         icon: <Target size={18}/>,          label: 'Presupuestos' },
    { to: '/alerts',          icon: <Bell size={18}/>,            label: 'Alertas' },
    { to: '/recommendations', icon: <Lightbulb size={18}/>,       label: 'Recomendaciones' },
  ];

  const adminItems = [
    { to: '/admin/users',      icon: <Users size={18}/>, label: 'Usuarios', role: 'admin' },
    { to: '/admin/categories', icon: <Tag size={18}/>,   label: 'Categorías', role: 'admin' },
    { to: '/admin/reports',    icon: <BarChart2 size={18}/>, label: 'Reportes', role: 'advisor' },
  ];

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo">
        <h2>🎯 Cazador de Gastos</h2>
        <p>Control financiero inteligente</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Principal</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {isAdvisor() && (
          <div className="nav-section">
            <div className="nav-section-title">Administración</div>
            {adminItems
              .filter(item => item.role === 'advisor' ? isAdvisor() : isAdmin())
              .map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))
            }
          </div>
        )}
      </nav>

      <div className="sidebar-user">
        <img
          src={user?.avatar_url}
          alt={user?.name}
          className="user-avatar"
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </div>
          <div className="user-role">{user?.role?.display_name}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <NavLink to="/profile" className="btn btn-icon btn-secondary" onClick={() => setSidebarOpen(false)}>
            <User size={16} />
          </NavLink>
          <button className="btn btn-icon btn-danger" onClick={() => setLogoutModal(true)}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {/* Mobile Navbar */}
      <div className="mobile-navbar">
        <button className="btn btn-icon btn-secondary" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--green-400)' }}>🎯 Cazador de Gastos</span>
        <img src={user?.avatar_url} alt="" className="user-avatar" style={{ width: 32, height: 32 }} />
      </div>

      {/* Sidebar Desktop */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 39 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Confirm logout */}
      <ConfirmModal
        open={logoutModal}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmLabel="Cerrar sesión"
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setLogoutModal(false)}
      />
    </div>
  );
}
