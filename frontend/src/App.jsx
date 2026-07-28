import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';

// Auth
import LoginPage       from './pages/auth/LoginPage';
import RegisterPage    from './pages/auth/RegisterPage';
import ForgotPassword  from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Protected Layout
import AppLayout from './components/layout/AppLayout';

// User Pages
import DashboardPage        from './pages/DashboardPage';
import ExpensesPage         from './pages/expenses/ExpensesPage';
import IncomesPage          from './pages/incomes/IncomesPage';
import BudgetsPage          from './pages/budgets/BudgetsPage';
import AlertsPage           from './pages/AlertsPage';
import RecommendationsPage  from './pages/RecommendationsPage';
import ProfilePage          from './pages/ProfilePage';

// Admin Pages
import AdminUsersPage       from './pages/admin/UsersPage';
import AdminCategoriesPage  from './pages/admin/CategoriesPage';
import AdminReportsPage     from './pages/admin/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<GuestRoute />}>
            <Route path="/login"           element={<LoginPage />} />
            <Route path="/register"        element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
          </Route>

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"        element={<DashboardPage />} />
              <Route path="/expenses"         element={<ExpensesPage />} />
              <Route path="/incomes"          element={<IncomesPage />} />
              <Route path="/budgets"          element={<BudgetsPage />} />
              <Route path="/alerts"           element={<AlertsPage />} />
              <Route path="/recommendations"  element={<RecommendationsPage />} />
              <Route path="/profile"          element={<ProfilePage />} />

              {/* Admin + Advisor */}
              <Route element={<ProtectedRoute requiredRole={['admin', 'advisor']} />}>
                <Route path="/admin/reports"     element={<AdminReportsPage />} />
              </Route>

              {/* Solo Admin */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin/users"       element={<AdminUsersPage />} />
                <Route path="/admin/categories"  element={<AdminCategoriesPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
