import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { getAuth, clearAuth, getUserName, getAvatarUrl } from '../utils/auth';
import ChatBox from './ChatBox';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/portal',            label: 'Dashboard',  icon: 'grid_view' },
      { to: '/portal/live-map',   label: 'Live Map',    icon: 'location_on' },
      { to: '/portal/schedule',   label: 'Schedule',    icon: 'calendar_month' },
      { to: '/portal/buy-pass',   label: 'Buy Pass',    icon: 'confirmation_number' },
    ],
  },
  {
    label: 'Campus',
    items: [
      { to: '/portal/fleet',       label: 'Fleet',       icon: 'directions_bus' },
      { to: '/portal/maintenance', label: 'Maintenance', icon: 'construction' },
      { to: '/portal/alerts',      label: 'Alerts',      icon: 'notifications' },
      { to: '/portal/chat',        label: 'Support',     icon: 'chat_bubble' },
    ],
  },
];

const PAGE_META = {
  '/portal':               { title: 'Dashboard',    sub: 'Your transit overview', icon: 'grid_view' },
  '/portal/live-map':      { title: 'Live Map',     sub: 'Real-time tracking',    icon: 'location_on' },
  '/portal/schedule':      { title: 'Schedule',     sub: 'Routes & timetables',   icon: 'calendar_month' },
  '/portal/buy-pass':      { title: 'Buy Pass',     sub: 'Purchase transit pass', icon: 'confirmation_number' },
  '/portal/fleet':         { title: 'Fleet',        sub: 'Bus management',        icon: 'directions_bus' },
  '/portal/maintenance':   { title: 'Maintenance',  sub: 'Service & repair logs', icon: 'construction' },
  '/portal/alerts':        { title: 'Alerts',       sub: 'System notifications',  icon: 'notifications' },
  '/portal/chat':          { title: 'Support',      sub: 'Chat with team',        icon: 'chat_bubble' },
  '/portal/settings':      { title: 'Settings',     sub: 'Account & preferences', icon: 'settings' },
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [clock, setClock] = useState('--:--:--');
  const [scrolled, setScrolled] = useState(false);
  const ddRef = useRef(null);

  const auth = getAuth();
  const userName = getUserName();
  const avatarUrl = getAvatarUrl(userName);
  const isAdmin = auth?.role === 'admin';

  const currentPage = PAGE_META[location.pathname] || { title: 'VIT Shuttle', sub: 'Campus Transit', icon: 'directions_bus' };

  // Theme
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('vit-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  });
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('vit-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll detection for topbar shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Click-outside dropdown
  useEffect(() => {
    const h = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close mobile on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const doLogout = () => { clearAuth(); navigate('/'); };

  const adminItems = isAdmin ? [{ to: '/admin', label: 'Admin', icon: 'admin_panel_settings', admin: true }] : [];

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ SIDEBAR */}
      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>

        {/* Brand */}
        <div className="sidebar-brand" onClick={() => navigate(isAdmin ? '/admin' : '/portal')}>
          <div className="sidebar-logo">
            <span className="material-symbols-outlined">directions_bus</span>
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">VIT Shuttle</span>
            <span className="sidebar-brand-sub">{isAdmin ? 'Admin Panel' : 'Campus Transit'}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {adminItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `nav-item admin-tab${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}>
              <span className="material-symbols-outlined nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
          {adminItems.length > 0 && <div className="divider" style={{ margin: '.4rem 0' }} />}

          {NAV_GROUPS.map(group => (
            <div key={group.label} className="nav-group">
              <div className="sidebar-section-label">{group.label}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="material-symbols-outlined nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Settings quick link */}
          <NavLink to="/portal/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} style={{ marginBottom: '.25rem' }}>
            <span className="material-symbols-outlined nav-icon">settings</span>
            <span className="nav-label">Settings</span>
          </NavLink>

          <div className="sidebar-profile" onClick={() => navigate('/portal/settings')}>
            <img src={avatarUrl} alt="" className="sidebar-profile-avatar" />
            <div className="sidebar-profile-info">
              <div className="sidebar-profile-name">{userName}</div>
              <div className="sidebar-profile-role">{isAdmin ? '⚡ Admin' : '🎓 Student'}</div>
            </div>
          </div>

          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
            style={{ width: '100%', marginTop: '.4rem', borderRadius: 'var(--radius-md)', height: 34, justifyContent: 'center' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.05rem', transition: 'transform .3s', transform: collapsed ? 'rotate(180deg)' : '' }}>
              keyboard_double_arrow_left
            </span>
            {!collapsed && <span className="nav-label" style={{ fontSize: '.75rem', marginLeft: '.3rem' }}>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', zIndex: 199 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ TOPBAR */}
      <header className={`topbar${collapsed ? ' collapsed' : ''}${scrolled ? ' topbar-scrolled' : ''}`}>
        <div className="topbar-left">
          <button className="hamburger" onClick={() => setMobileOpen(m => !m)} style={{ display: 'flex' }}>
            <i /><i /><i />
          </button>

          {/* Page icon + breadcrumb */}
          <div className="topbar-breadcrumb">
            <div className="topbar-page-icon">
              <span className="material-symbols-outlined">{currentPage.icon}</span>
            </div>
            <div>
              <div className="topbar-title">{currentPage.title}</div>
              <div className="topbar-sub">{currentPage.sub}</div>
            </div>
          </div>
        </div>

        <div className="topbar-right">
          {/* Live IST clock */}
          <div className="clock-chip">
            <span className="clock-label">IST</span>
            <span className="clock-time">{clock}</span>
          </div>

          {/* Notifications */}
          <button className="topbar-icon-btn" title="Alerts" onClick={() => navigate('/portal/alerts')}>
            <span className="material-symbols-outlined">notifications</span>
            <span className="notif-dot" />
          </button>

          {/* Settings */}
          <button className="topbar-icon-btn" title="Settings" onClick={() => navigate('/portal/settings')}>
            <span className="material-symbols-outlined">settings</span>
          </button>

          {/* Theme toggle */}
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>

          {/* Profile dropdown */}
          <div ref={ddRef} style={{ position: 'relative' }}>
            <div className={`profile-chip${ddOpen ? ' open' : ''}`} onClick={() => setDdOpen(!ddOpen)}>
              <img src={avatarUrl} alt="" className="profile-avatar" />
              <span className="profile-name">{userName.split(' ')[0]}</span>
              {isAdmin && <span className="badge badge-red" style={{ fontSize: '.55rem', padding: '0 .3rem' }}>ADMIN</span>}
              <span className="material-symbols-outlined chevron">expand_more</span>
            </div>

            {ddOpen && (
              <div className="profile-dd">
                <div className="dd-header">
                  <div className="dd-avatar"><img src={avatarUrl} alt="" /></div>
                  <div>
                    <div className="dd-name">{userName}</div>
                    <div className="dd-role">{auth?.email}</div>
                  </div>
                </div>
                <div className="dd-body">
                  <button className="dd-item" onClick={() => { setDdOpen(false); navigate('/portal/settings'); }}>
                    <span className="material-symbols-outlined">manage_accounts</span> My Profile
                  </button>
                  {isAdmin && (
                    <button className="dd-item" onClick={() => { setDdOpen(false); navigate('/admin'); }}>
                      <span className="material-symbols-outlined">admin_panel_settings</span> Admin Panel
                    </button>
                  )}
                  <button className="dd-item" onClick={() => { setDdOpen(false); navigate('/portal/buy-pass'); }}>
                    <span className="material-symbols-outlined">confirmation_number</span> Buy Pass
                  </button>
                  <div className="dd-divider" />
                  <button className="dd-item danger" onClick={doLogout}>
                    <span className="material-symbols-outlined">logout</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ MAIN */}
      <div className={`app-main${collapsed ? ' collapsed' : ''}`}>
        <div className="page-content">
          <Outlet />
        </div>
      </div>

      <ChatBox />
    </>
  );
}
