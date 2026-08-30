import { Navigate } from 'react-router-dom';
import { getAuth, isLoggedIn } from '../utils/auth';

/**
 * Admin-specific auth guard.
 * Checks both login status AND admin role.
 * Redirects to /admin/login if not an authenticated admin.
 * Uses separate admin session key from student auth.
 */
export default function AdminGuard({ children }) {
  const auth = getAuth();
  if (!isLoggedIn() || auth?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
