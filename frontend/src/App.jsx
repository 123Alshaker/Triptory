import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import TripDetail from './pages/TripDetail';
import Dashboard from './pages/Dashboard';
import CreatePlan from './pages/CreatePlan';
import EditPlan from './pages/EditPlan';
import MyPlans from './pages/MyPlans';
import SavedPlans from './pages/SavedPlans';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPlans from './pages/admin/AdminPlans';

function NotFound() {
  return (
    <div className="empty-state" style={{ paddingTop: '6rem' }}>
      <div className="empty-state__icon">🗺️</div>
      <h3>404 — Page Not Found</h3>
      <p>The page you're looking for doesn't exist.</p>
      <a className="btn btn--primary mt-2" href="/">Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ flex: 1 }}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/trips/:id" element={<TripDetail />} />

                {/* Authenticated */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/create-plan" element={<ProtectedRoute><CreatePlan /></ProtectedRoute>} />
                <Route path="/edit-plan/:id" element={<ProtectedRoute><EditPlan /></ProtectedRoute>} />
                <Route path="/my-plans" element={<ProtectedRoute><MyPlans /></ProtectedRoute>} />
                <Route path="/saved" element={<ProtectedRoute><SavedPlans /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/plans" element={<AdminRoute><AdminPlans /></AdminRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
