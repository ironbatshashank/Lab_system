import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Dashboard } from './pages/Dashboard';
import { Unauthorized } from './pages/Unauthorized';
import { Notifications } from './pages/Notifications';
import { Users } from './pages/Users';
import { CreateUser } from './pages/CreateUser';
import { CreateProject } from './pages/CreateProject';
import { EditProject } from './pages/EditProject';
import { ProjectDetail } from './pages/ProjectDetail';
import { SupervisorReview } from './pages/SupervisorReview';
import { HSMReview } from './pages/HSMReview';
import { TechnicianReview } from './pages/TechnicianReview';
import { AllProjects } from './pages/AllProjects';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['lab_director']}>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users/new"
              element={
                <ProtectedRoute allowedRoles={['lab_director']}>
                  <Layout>
                    <CreateUser />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/new"
              element={
                <ProtectedRoute allowedRoles={['engineer']}>
                  <Layout>
                    <CreateProject />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['engineer']}>
                  <Layout>
                    <EditProject />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProjectDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects"
              element={
                <ProtectedRoute allowedRoles={['lab_director', 'quality_manager']}>
                  <Layout>
                    <AllProjects />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reviews/supervisor/:id"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <Layout>
                    <SupervisorReview />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reviews/hsm/:id"
              element={
                <ProtectedRoute allowedRoles={['hsm']}>
                  <Layout>
                    <HSMReview />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reviews/technician/:id"
              element={
                <ProtectedRoute allowedRoles={['lab_technician']}>
                  <Layout>
                    <TechnicianReview />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
