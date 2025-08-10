import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { AuthEntry as MandatoryAuth } from './components/AuthEntry';
import config from './config/environment';
import LeadForm from './pages/LeadForm';
import { Dashboard } from './pages/Dashboard';
import { DashboardHome } from './pages/DashboardHome';
import { DashboardBook } from './pages/DashboardBook';
import { DashboardHistory } from './pages/DashboardHistory';
import { DashboardNotifications } from './pages/DashboardNotifications';
import { DashboardProfile } from './pages/DashboardProfile';
import { DashboardMore } from './pages/DashboardMore';
import { DashboardWallet } from './pages/DashboardWallet';
import { BookingStatus } from './pages/BookingStatus';
import { BookingPreview } from './pages/BookingPreview';
import { CustomerHistory } from './pages/CustomerHistory';
import './styles/globals.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    // Store current URL for redirect after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Auth Route Component
const AuthRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <MandatoryAuth />; // Mandatory registration/login flow
};

function App() {
  const { initAuth } = useAuthStore();
  
  React.useEffect(() => {
    initAuth();
  }, [initAuth]);
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <main className="app-main">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AuthRoute />} />
              <Route path="/lead-form" element={<LeadForm />} />
            <Route path="/booking-status" element={<BookingStatus />} />
            <Route path="/booking-status/:id" element={<BookingStatus />} />
            <Route path="/booking-preview" element={<BookingPreview />} />
            <Route path="/customer-history" element={<CustomerHistory />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard/home" replace />} />
              <Route path="home" element={<DashboardHome />} />
              <Route path="book" element={<DashboardBook />} />
              <Route path="wallet" element={<DashboardWallet />} />
              <Route path="history" element={<DashboardHistory />} />
              <Route path="more" element={<DashboardMore />} />
              <Route path="notifications" element={<DashboardNotifications />} />
              <Route path="profile" element={<DashboardProfile />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
