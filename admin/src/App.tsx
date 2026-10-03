import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './components/AdminLayout';

import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminCoursesPage } from './pages/AdminCoursesPage';
import { AdminSemestersPage } from './pages/AdminSemestersPage';
import { AdminSubjectsPage } from './pages/AdminSubjectsPage';
import { AdminMaterialsPage } from './pages/AdminMaterialsPage';
import { AdminPricingPage } from './pages/AdminPricingPage';
import { AdminStudentsPage } from './pages/AdminStudentsPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminPaymentsPage } from './pages/AdminPaymentsPage';
import { AdminPurchasesPage } from './pages/AdminPurchasesPage';
import { AdminEntitlementsPage } from './pages/AdminEntitlementsPage';
import { AdminBlogPage } from './pages/AdminBlogPage';
import { AdminEnquiriesPage } from './pages/AdminEnquiriesPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';
import { Loader2 } from 'lucide-react';

const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/" element={<AdminRouteGuard><AdminDashboardPage /></AdminRouteGuard>} />
          <Route path="/dashboard" element={<AdminRouteGuard><AdminDashboardPage /></AdminRouteGuard>} />
          <Route path="/courses" element={<AdminRouteGuard><AdminCoursesPage /></AdminRouteGuard>} />
          <Route path="/semesters" element={<AdminRouteGuard><AdminSemestersPage /></AdminRouteGuard>} />
          <Route path="/subjects" element={<AdminRouteGuard><AdminSubjectsPage /></AdminRouteGuard>} />
          <Route path="/materials" element={<AdminRouteGuard><AdminMaterialsPage /></AdminRouteGuard>} />
          <Route path="/pricing" element={<AdminRouteGuard><AdminPricingPage /></AdminRouteGuard>} />
          <Route path="/students" element={<AdminRouteGuard><AdminStudentsPage /></AdminRouteGuard>} />
          <Route path="/orders" element={<AdminRouteGuard><AdminOrdersPage /></AdminRouteGuard>} />
          <Route path="/payments" element={<AdminRouteGuard><AdminPaymentsPage /></AdminRouteGuard>} />
          <Route path="/purchases" element={<AdminRouteGuard><AdminPurchasesPage /></AdminRouteGuard>} />
          <Route path="/entitlements" element={<AdminRouteGuard><AdminEntitlementsPage /></AdminRouteGuard>} />
          <Route path="/blog" element={<AdminRouteGuard><AdminBlogPage /></AdminRouteGuard>} />
          <Route path="/enquiries" element={<AdminRouteGuard><AdminEnquiriesPage /></AdminRouteGuard>} />
          <Route path="/settings" element={<AdminRouteGuard><AdminSettingsPage /></AdminRouteGuard>} />
          <Route path="/audit-logs" element={<AdminRouteGuard><AdminAuditLogsPage /></AdminRouteGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
