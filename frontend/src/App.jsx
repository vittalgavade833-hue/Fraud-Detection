import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AddTransactionPage from './pages/AddTransactionPage';
import TransactionResultPage from './pages/TransactionResultPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import FraudAlertsPage from './pages/FraudAlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MainLayout from './layouts/MainLayout';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0a0e27]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
      <Route path="/transactions/new" element={<ProtectedRoute><MainLayout><AddTransactionPage /></MainLayout></ProtectedRoute>} />
      <Route path="/transactions/result/:id" element={<ProtectedRoute><MainLayout><TransactionResultPage /></MainLayout></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><MainLayout><TransactionHistoryPage /></MainLayout></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><MainLayout><FraudAlertsPage /></MainLayout></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><MainLayout><AnalyticsPage /></MainLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><MainLayout><AdminDashboardPage /></MainLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1a1f3a', color: '#e2e8f0', border: '1px solid #252a4a' } }} />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
