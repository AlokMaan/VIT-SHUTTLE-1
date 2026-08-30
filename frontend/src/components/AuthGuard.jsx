import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

/**
 * Wraps dashboard routes — redirects to /signin if not authenticated.
 */
export default function AuthGuard({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return children;
}
