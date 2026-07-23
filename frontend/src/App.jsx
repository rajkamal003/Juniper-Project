// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'sonner';

import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import GuestRequestPage from './pages/GuestRequestPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import UserManagementPage from './pages/UserManagementPage';
import UserDetailsPage from './pages/UserDetailsPage';
import AdminCreateUserPage from './pages/AdminCreateUserPage';
import LoadingSpinner from './components/feedback/LoadingSpinner';

// Stage 3 dashboards & pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import FacultyDashboardPage from './pages/FacultyDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import GuestDashboardPage from './pages/GuestDashboardPage';
import ForbiddenPage from './pages/ForbiddenPage';
import ComingSoonPage from './pages/ComingSoonPage';

// Stage 4 module pages
import DevicesPage from './pages/DevicesPage';
import NetworkPage from './pages/NetworkPage';
import FirewallPage from './pages/FirewallPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import FacultyCoursesPage from './pages/FacultyCoursesPage';
import StudentCoursesPage from './pages/StudentCoursesPage';
import CampusAccessPage from './pages/CampusAccessPage';
import ExamModePage from './pages/ExamModePage';
import StudentStatusPage from './pages/StudentStatusPage';
import VisitorRequestsPage from './pages/VisitorRequestsPage';
import VisitorAccessPage from './pages/VisitorAccessPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import SecurityAlertsPage from './pages/SecurityAlertsPage';

// Route guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const RoleGuard = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  const role = user?.role?.role_name || 'Guest';
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }
  
  return children;
};

const DashboardRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  const role = user?.role?.role_name || 'Guest';
  if (role === 'Super Admin') return <Navigate to="/admin" replace />;
  if (role === 'Faculty') return <Navigate to="/faculty" replace />;
  if (role === 'Student') return <Navigate to="/student" replace />;
  if (role === 'Parent Visitor') return <Navigate to="/parent" replace />;
  if (role === 'Guest') return <Navigate to="/guest" replace />;
  
  return <Navigate to="/403" replace />;
};

const CourseRouteResolver = () => {
  const { user } = useAuth();
  if (user?.role?.role_name === 'Faculty') {
    return <FacultyCoursesPage />;
  }
  return <StudentCoursesPage />;
};

// Route wrapper content
const AppContent = () => {
  return (
    <Routes>
      {/* Root Route loads LandingPage Portal */}
      <Route path="/" element={
        <PublicOnlyRoute>
          <AuthLayout>
            <LandingPage />
          </AuthLayout>
        </PublicOnlyRoute>
      } />

      {/* Role Selection Route (Step 2) */}
      <Route path="/select-role" element={
        <PublicOnlyRoute>
          <AuthLayout>
            <RoleSelectionPage />
          </AuthLayout>
        </PublicOnlyRoute>
      } />

      {/* Role-Specific Sign In Routes */}
      <Route path="/faculty/signin" element={
        <PublicOnlyRoute>
          <AuthLayout>
            <LoginPage roleContext="Faculty" />
          </AuthLayout>
        </PublicOnlyRoute>
      } />

      <Route path="/student/signin" element={
        <PublicOnlyRoute>
          <AuthLayout>
            <LoginPage roleContext="Student" />
          </AuthLayout>
        </PublicOnlyRoute>
      } />

      <Route path="/parent/signin" element={
        <PublicOnlyRoute>
          <AuthLayout>
            <LoginPage roleContext="Parent" />
          </AuthLayout>
        </PublicOnlyRoute>
      } />

      <Route path="/guest/request" element={
        <PublicOnlyRoute>
          <AuthLayout>
            <GuestRequestPage />
          </AuthLayout>
        </PublicOnlyRoute>
      } />

      <Route path="/guest/signin" element={<Navigate to="/guest/request" replace />} />

      {/* General Sign In Route */}
      <Route path="/signin" element={
        <PublicOnlyRoute>
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        </PublicOnlyRoute>
      } />
      
      <Route path="/register" element={
        <PublicOnlyRoute>
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        </PublicOnlyRoute>
      } />
      
      <Route path="/forgot-password" element={
        <PublicOnlyRoute>
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        </PublicOnlyRoute>
      } />
      
      <Route path="/reset-password" element={
        <AuthLayout>
          <ResetPasswordPage />
        </AuthLayout>
      } />

      {/* Auto-redirect route based on user roles */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardRedirect />
        </ProtectedRoute>
      } />
      
      {/* Role-specific dashboards */}
      <Route path="/admin" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <AdminDashboardPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/faculty" element={
        <RoleGuard allowedRoles={['Faculty']}>
          <DashboardLayout>
            <FacultyDashboardPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/student" element={
        <RoleGuard allowedRoles={['Student']}>
          <DashboardLayout>
            <StudentDashboardPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/parent" element={
        <RoleGuard allowedRoles={['Parent Visitor']}>
          <DashboardLayout>
            <ParentDashboardPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/guest" element={
        <RoleGuard allowedRoles={['Guest']}>
          <DashboardLayout>
            <GuestDashboardPage />
          </DashboardLayout>
        </RoleGuard>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ProfilePage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <UserManagementPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/users/create" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <AdminCreateUserPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/users/:id" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <UserDetailsPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      {/* Admin Modules */}
      <Route path="/devices" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <DevicesPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/network" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <NetworkPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/firewall" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <FirewallPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/analytics" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <AnalyticsDashboardPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/security-alerts" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <SecurityAlertsPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/reports" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <ReportsPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/settings" element={
        <RoleGuard allowedRoles={['Super Admin']}>
          <DashboardLayout>
            <SettingsPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      {/* Faculty Modules */}
      <Route path="/students" element={
        <RoleGuard allowedRoles={['Faculty']}>
          <DashboardLayout>
            <StudentsPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/attendance" element={
        <RoleGuard allowedRoles={['Faculty']}>
          <DashboardLayout>
            <AttendancePage />
          </DashboardLayout>
        </RoleGuard>
      } />

      {/* Shared Courses Module Route */}
      <Route path="/courses" element={
        <RoleGuard allowedRoles={['Faculty', 'Student']}>
          <DashboardLayout>
            <CourseRouteResolver />
          </DashboardLayout>
        </RoleGuard>
      } />

      {/* Student Modules */}
      <Route path="/campus-access" element={
        <RoleGuard allowedRoles={['Student']}>
          <DashboardLayout>
            <CampusAccessPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/exam-mode" element={
        <RoleGuard allowedRoles={['Super Admin', 'Faculty', 'Student']}>
          <DashboardLayout>
            <ExamModePage />
          </DashboardLayout>
        </RoleGuard>
      } />

      {/* Parent Modules */}
      <Route path="/student-status" element={
        <RoleGuard allowedRoles={['Parent Visitor']}>
          <DashboardLayout>
            <StudentStatusPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      <Route path="/visitor-requests" element={
        <RoleGuard allowedRoles={['Parent Visitor']}>
          <DashboardLayout>
            <VisitorRequestsPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      {/* Guest Modules */}
      <Route path="/visitor-access" element={
        <RoleGuard allowedRoles={['Guest']}>
          <DashboardLayout>
            <VisitorAccessPage />
          </DashboardLayout>
        </RoleGuard>
      } />

      {/* Forbidden Access Route */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Redirects */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/coming-soon" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard-preview" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster 
            theme="dark" 
            position="top-right" 
            toastOptions={{
              style: {
                background: 'rgba(30, 41, 59, 0.9)',
                color: '#f8fafc',
                border: '1px solid #334155',
                backdropFilter: 'blur(10px)',
              }
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
