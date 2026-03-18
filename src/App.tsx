import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardRouter from './components/dashboard/DashboardRouter';
import Members from './pages/Members';
import LoansPage from './pages/loans/LoansPage';
import LoanDetailsPage from './pages/loans/LoanDetailsPage';
import LoanRequestPage from './pages/loans/LoanRequestPage';
import PaymentPage from './pages/loans/PaymentPage';
import PendingPaymentsPage from './pages/loans/PendingPaymentsPage';
import PendingLoansPage from './pages/loans/PendingLoansPage';
// import PendingPaymentsPage from './pages/loans/PendingPaymentsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route path="/login" element={<Login />} />

          {/* ===== PROTECTED ROUTES ===== */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* ===== MAIN LAYOUT WITH PROTECTED ROUTES ===== */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard - Role-based routing handled by DashboardRouter */}
            <Route path="dashboard" element={<DashboardRouter />} />

            {/* Member Management */}
            <Route path="members" element={<Members />} />

            {/* Loan Management */}
            <Route path="loans" element={<LoansPage />} />
            <Route path="loans/request" element={<LoanRequestPage />} />
            <Route path="loans/:id" element={<LoanDetailsPage />} />
            <Route path="loans/:id/pay" element={<PaymentPage />} />
            <Route path="pending-loans" element={<PendingLoansPage />} />


            {/* Super Admin Only */}
            <Route path="pending-payments" element={<PendingPaymentsPage />} />

            {/* Profile (to be implemented) */}
            <Route path="profile" element={<div>Profile Page (Coming Soon)</div>} />

            {/* Settings (to be implemented) */}
            <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
          </Route>

          {/* ===== CATCH ALL - REDIRECT TO DASHBOARD ===== */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;