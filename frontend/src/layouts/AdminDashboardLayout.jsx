import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuth, getAuth, getAvatarUrl } from '../utils/auth';
import {
  LayoutDashboard, Route, MapPin, Bus, Users, Calendar,
  Radio, History, MessageSquare, Bell, Settings, FileText,
  BarChart3, UserCircle, ChevronLeft, ChevronRight, Search,
  LogOut, Menu, X, Shield
} from 'lucide-react';

const sidebarSections = [
  {
    title: 'Overview',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
      { to: '/admin/monitoring', icon: Radio, label: 'Live Monitoring' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/admin/routes', icon: Route, label: 'Routes' },
      { to: '/admin/stops', icon: MapPin, label: 'Stops' },
      { to: '/admin/shuttles', icon: Bus, label: 'Shuttles' },
      { to: '/admin/drivers', icon: Users, label: 'Drivers' },
      { to: '/admin/schedule', icon: Calendar, label: 'Schedule' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/gps-history', icon: History, label: 'GPS History' },
      { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
      { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
      { to: '/admin/audit-log', icon: FileText, label: 'Audit Log' },
      { to: '/admin/profile', icon: UserCircle, label: 'Profile' },
    ],
  },
];

export default function AdminDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clock, setClock] = useState('');

  // Live clock
  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: true, timeZone: 'Asia/Kolkata',
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Close mobile menu on nav
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login');
  };

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = collapsed ? 68 : 260;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed top-0 bottom-0 z-50 flex flex-col border-r transition-all duration-300 overflow-hidden"
        style={{
          width: `${sidebarWidth}px`,
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          transform: mobileOpen ? 'translateX(0)' : undefined,
          ...(typeof window !== 'undefined' && window.innerWidth < 1024
            ? { transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }
            : {}),
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center gap-2.5 px-4 border-b shrink-0"
          style={{ height: 62, borderColor: 'var(--border)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff9d4d)' }}
          >
            <Shield size={16} color="#fff" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight whitespace-nowrap">
              Admin <span style={{ color: 'var(--red)' }}>Panel</span>
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5"
                  style={{ color: 'var(--text-4)' }}
                >
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ to, icon: Icon, label, exact }) => {
                  const active = isActive(to, exact);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 rounded-lg no-underline transition-all duration-200"
                      style={{
                        padding: collapsed ? '10px 0' : '9px 12px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        background: active ? 'var(--primary-bg)' : 'transparent',
                        color: active ? 'var(--primary)' : 'var(--text-3)',
                        borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                      }}
                      title={collapsed ? label : undefined}
                    >
                      <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                      {!collapsed && (
                        <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="hidden lg:block px-2 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-0 cursor-pointer transition-colors text-xs font-medium"
            style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> <span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${sidebarWidth}px` : 0 }}
      >
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 border-b shrink-0"
          style={{
            height: 62,
            background: 'rgba(14, 20, 32, 0.85)',
            backdropFilter: 'blur(20px)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Left: mobile menu + search */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center border-0 cursor-pointer"
              style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle sidebar"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div
              className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <Search size={14} style={{ color: 'var(--text-4)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-none text-sm"
                style={{ color: 'var(--text)', width: 180 }}
              />
            </div>
          </div>

          {/* Right: clock, profile, logout */}
          <div className="flex items-center gap-3">
            <span
              className="hidden sm:block text-xs font-mono tabular-nums"
              style={{ color: 'var(--text-3)' }}
            >
              {clock} IST
            </span>

            <div
              className="flex items-center gap-2.5 pl-3 border-l"
              style={{ borderColor: 'var(--border)' }}
            >
              <img
                src={getAvatarUrl(auth?.name || 'Admin')}
                alt="Admin avatar"
                className="w-8 h-8 rounded-full"
                style={{ border: '2px solid var(--border)' }}
              />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  {auth?.name || 'Admin'}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-4)' }}>Administrator</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center border-0 cursor-pointer transition-colors"
              style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
