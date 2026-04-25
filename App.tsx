
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { DataProvider } from './DataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthFlow } from './screens/AuthFlow';
import { StudentDashboard } from './screens/StudentScreens';
import { TeacherDashboard } from './screens/TeacherScreens';
import { ParentDashboard } from './screens/ParentScreens';

// Root component that handles initial redirects
const AppRoot: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      const search = window.location.search;
      if (!user) {
        navigate(`/auth${search}`);
      } else {
        navigate(`/${user.role}/dashboard${search}`);
      }
    }
  }, [user, loading, navigate]);

  return null;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/" element={<AppRoot />} />
            <Route path="/auth" element={<AuthFlow />} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            
            {/* Parent Routes */}
            <Route path="/parent/dashboard" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
