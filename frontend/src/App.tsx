import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PoleDetailPage } from './pages/PoleDetailPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPage } from './pages/AdminPage';
import { CommunityReportPage } from './pages/CommunityReportPage';
import { AboutPage } from './pages/AboutPage';
import { SettingsPage } from './pages/SettingsPage';
import { fetchAlerts } from './services/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function MainLayout() {
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    fetchAlerts({ status: 'active' })
      .then(alerts => {
        const count = alerts.filter(a => a.alert_level === 'Critical' || a.alert_level === 'Warning').length;
        setCriticalCount(count);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1320] text-[#dde2f5] flex flex-col font-body">
      <Header activeCriticalCount={criticalCount} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nodes/:id"
            element={
              <ProtectedRoute>
                <PoleDetailPage />
              </ProtectedRoute>
            }
          />

          <Route path="/map" element={<RiskMapPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          <Route path="/report-incident" element={<CommunityReportPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <MainLayout />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
