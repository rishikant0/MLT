import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRouteGuard } from './components/AdminRouteGuard';

// Public pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { CoursesPage } from './pages/public/CoursesPage';
import { CourseDetailPage } from './pages/public/CourseDetailPage';
import { StudyMaterialPage } from './pages/public/StudyMaterialPage';
import { BlogPage } from './pages/public/BlogPage';
import { BlogDetailPage } from './pages/public/BlogDetailPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { PaymentStatusPage } from './pages/public/PaymentStatusPage';
import { LegalPage } from './pages/public/LegalPage';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';

// Admin pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage';
import { AdminSemestersPage } from './pages/admin/AdminSemestersPage';
import { AdminSubjectsPage } from './pages/admin/AdminSubjectsPage';
import { AdminMaterialsPage } from './pages/admin/AdminMaterialsPage';
import { AdminPricingPage } from './pages/admin/AdminPricingPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminPurchasesPage } from './pages/admin/AdminPurchasesPage';
import { AdminEntitlementsPage } from './pages/admin/AdminEntitlementsPage';
import { AdminBlogPage } from './pages/admin/AdminBlogPage';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* PUBLIC & STUDENT ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/study-material" element={<StudyMaterialPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
          <Route path="/privacy-policy" element={<LegalPage />} />
          <Route path="/refund-policy" element={<LegalPage />} />
          <Route path="/terms-of-service" element={<LegalPage />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard initialTab="overview" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute>
                <StudentDashboard initialTab="courses" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/materials"
            element={
              <ProtectedRoute>
                <StudentDashboard initialTab="materials" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/purchases"
            element={
              <ProtectedRoute>
                <StudentDashboard initialTab="purchases" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/payments"
            element={
              <ProtectedRoute>
                <StudentDashboard initialTab="payments" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute>
                <StudentDashboard initialTab="profile" />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ADMIN PROTECTED ROUTES (One Vite App at http://localhost:5173/admin/*) */}
        <Route
          element={
            <AdminRouteGuard>
              <AdminLayout />
            </AdminRouteGuard>
          }
        >
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/semesters" element={<AdminSemestersPage />} />
          <Route path="/admin/subjects" element={<AdminSubjectsPage />} />
          <Route path="/admin/materials" element={<AdminMaterialsPage />} />
          <Route path="/admin/pricing" element={<AdminPricingPage />} />
          <Route path="/admin/students" element={<AdminStudentsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/purchases" element={<AdminPurchasesPage />} />
          <Route path="/admin/entitlements" element={<AdminEntitlementsPage />} />
          <Route path="/admin/blog" element={<AdminBlogPage />} />
          <Route path="/admin/enquiries" element={<AdminEnquiriesPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
