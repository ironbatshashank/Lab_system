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
import { ClientRequests } from './pages/ClientRequests';
import { MyProjects } from './pages/MyProjects';
import { ReviewsList } from './pages/ReviewsList';
import { Quality } from './pages/Quality';
import { MyRequests } from './pages/MyRequests';
import { CreateRequest } from './pages/CreateRequest';
import { Messages } from './pages/Messages';

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

            <Route
              path="/reviews/supervisor"
              element={
                <ProtectedRoute allowedRoles={['supervisor']}>
                  <Layout>
                    <ReviewsList role="supervisor" />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reviews/hsm"
              element={
                <ProtectedRoute allowedRoles={['hsm']}>
                  <Layout>
                    <ReviewsList role="hsm" />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reviews/technician"
              element={
                <ProtectedRoute allowedRoles={['lab_technician']}>
                  <Layout>
                    <ReviewsList role="lab_technician" />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/client-requests"
              element={
                <ProtectedRoute allowedRoles={['lab_director', 'account_manager']}>
                  <Layout>
                    <ClientRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-projects"
              element={
                <ProtectedRoute allowedRoles={['engineer']}>
                  <Layout>
                    <MyProjects />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/quality"
              element={
                <ProtectedRoute allowedRoles={['quality_manager']}>
                  <Layout>
                    <Quality />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-requests"
              element={
                <ProtectedRoute allowedRoles={['external_client']}>
                  <Layout>
                    <MyRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/requests/new"
              element={
                <ProtectedRoute allowedRoles={['external_client']}>
                  <Layout>
                    <CreateRequest />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute allowedRoles={['account_manager', 'lab_director']}>
                  <Layout>
                    <Messages />
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
