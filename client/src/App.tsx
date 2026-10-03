import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { StudyMaterialPage } from './pages/StudyMaterialPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentStatusPage } from './pages/PaymentStatusPage';
import { LegalPage } from './pages/LegalPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Website Routes */}
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
          <Route path="/terms" element={<LegalPage />} />
          <Route path="/refund-policy" element={<LegalPage />} />

          {/* Student Protected Portal Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard initialTab="courses" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/materials"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard initialTab="materials" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/purchases"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard initialTab="purchases" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/payments"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard initialTab="payments" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard initialTab="profile" />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;
