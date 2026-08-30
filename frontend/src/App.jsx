import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { isLoggedIn } from './utils/auth';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';

// Guards
import AuthGuard from './components/AuthGuard';
import AdminGuard from './components/AdminGuard';

// Auth pages (eagerly loaded - small, critical path)
import SignIn from './pages/SignIn';
import OtpVerification from './pages/OtpVerification';

// Public pages (lazy loaded)
const RouteList = lazy(() => import('./pages/public/RouteList'));
const RouteDetail = lazy(() => import('./pages/public/RouteDetail'));
const PublicTracker = lazy(() => import('./pages/public/PublicTracker'));
const FAQ = lazy(() => import('./pages/public/FAQ'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));

// Student portal pages (lazy loaded)
const Portal = lazy(() => import('./pages/Portal'));
const LiveMap = lazy(() => import('./pages/LiveMap'));
const Fleet = lazy(() => import('./pages/Fleet'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Alerts = lazy(() => import('./pages/Alerts'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const Settings = lazy(() => import('./pages/Settings'));
const BuyPass = lazy(() => import('./pages/BuyPass'));

// Admin pages (lazy loaded)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminRouteManager = lazy(() => import('./pages/admin/AdminRouteManager'));
const AdminStopManager = lazy(() => import('./pages/admin/AdminStopManager'));
const AdminShuttleManager = lazy(() => import('./pages/admin/AdminShuttleManager'));
const AdminDriverManager = lazy(() => import('./pages/admin/AdminDriverManager'));
const AdminScheduleManager = lazy(() => import('./pages/admin/AdminScheduleManager'));
const AdminLiveMonitoring = lazy(() => import('./pages/admin/AdminLiveMonitoring'));
const AdminGpsReplay = lazy(() => import('./pages/admin/AdminGpsReplay'));
const AdminFeedbackInbox = lazy(() => import('./pages/admin/AdminFeedbackInbox'));
const AdminNotificationManager = lazy(() => import('./pages/admin/AdminNotificationManager'));
const AdminSiteSettings = lazy(() => import('./pages/admin/AdminSiteSettings'));
const AdminAuditLog = lazy(() => import('./pages/admin/AdminAuditLog'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));

function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--text-3)',
        fontSize: '0.875rem',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }}
        />
        Loading...
      </div>
    </div>
  );
}

/**
 * Home route — show SignIn if not logged in, redirect to portal if logged in.
 */
function HomeRedirect() {
  if (isLoggedIn()) {
    return <Navigate to="/portal" replace />;
  }
  return <SignIn />;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: '#fff' } },
          error: { iconTheme: { primary: 'var(--red)', secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ── Home → Sign In (or redirect to portal if logged in) */}
          <Route index element={<HomeRedirect />} />
          <Route path="signin" element={<HomeRedirect />} />
          <Route path="signup" element={<Navigate to="/" replace />} />
          <Route path="verify-otp" element={<OtpVerification />} />

          {/* ── Public info pages (with navbar/footer layout) ──── */}
          <Route element={<PublicLayout />}>
            <Route path="routes" element={<RouteList />} />
            <Route path="routes/:id" element={<RouteDetail />} />
            <Route path="track" element={<PublicTracker />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* ── Student portal (auth required) ──────────────── */}
          <Route element={<AuthGuard><DashboardLayout /></AuthGuard>}>
            <Route path="portal" element={<Portal />} />
            <Route path="portal/live-map" element={<LiveMap />} />
            <Route path="portal/fleet" element={<Fleet />} />
            <Route path="portal/schedule" element={<Schedule />} />
            <Route path="portal/maintenance" element={<Maintenance />} />
            <Route path="portal/alerts" element={<Alerts />} />
            <Route path="portal/chat" element={<ChatPage />} />
            <Route path="portal/settings" element={<Settings />} />
            <Route path="portal/buy-pass" element={<BuyPass />} />
          </Route>

          {/* ── Admin portal (admin auth required) ──────────── */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route element={<AdminGuard><AdminDashboardLayout /></AdminGuard>}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/routes" element={<AdminRouteManager />} />
            <Route path="admin/stops" element={<AdminStopManager />} />
            <Route path="admin/shuttles" element={<AdminShuttleManager />} />
            <Route path="admin/drivers" element={<AdminDriverManager />} />
            <Route path="admin/schedule" element={<AdminScheduleManager />} />
            <Route path="admin/monitoring" element={<AdminLiveMonitoring />} />
            <Route path="admin/gps-history" element={<AdminGpsReplay />} />
            <Route path="admin/feedback" element={<AdminFeedbackInbox />} />
            <Route path="admin/notifications" element={<AdminNotificationManager />} />
            <Route path="admin/settings" element={<AdminSiteSettings />} />
            <Route path="admin/audit-log" element={<AdminAuditLog />} />
            <Route path="admin/analytics" element={<AdminAnalytics />} />
            <Route path="admin/profile" element={<AdminProfile />} />
          </Route>

          {/* ── Fallback → Sign In ──────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
