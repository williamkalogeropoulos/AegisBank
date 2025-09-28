import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { AccountsPage } from './pages/AccountsPage'
import { TransfersPage } from './pages/TransfersPage'
import { CardsPage } from './pages/CardsPage'
import { LoansPage } from './pages/LoansPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { NewAdminDashboardPage } from './pages/NewAdminDashboardPage'
import { AdminRequestsPage } from './pages/AdminRequestsPage'
import { AdminUserHistoryPage } from './pages/AdminUserHistoryPage'
import { AdminUserManagementPage } from './pages/AdminUserManagementPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { ProfilePage } from './pages/ProfilePage'

function App() {
  console.log('App component rendering')
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/accounts" element={
          <ProtectedRoute>
            <Layout>
              <AccountsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/transfers" element={
          <ProtectedRoute>
            <Layout>
              <TransfersPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/cards" element={
          <ProtectedRoute>
            <Layout>
              <CardsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/loans" element={
          <ProtectedRoute>
            <Layout>
              <LoansPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Layout>
                <NewAdminDashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
        <Route path="/admin/requests" element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <AdminRequestsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <UserManagementPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/history" element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <AdminUserHistoryPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <AdminUserManagementPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App



