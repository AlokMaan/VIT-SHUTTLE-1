import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';
import { Bus, MapPin, Route, HelpCircle, Info, Mail, Menu, X, Sun, Moon } from 'lucide-react';

/**
 * PublicLayout - Layout for unauthenticated public-facing pages.
 * Minimal navbar (logo, route links, CTA, sign-in) + footer.
 * No sidebar. Clean, modern, ride-hailing app aesthetic.
 */
export default function PublicLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem('vit-theme') || 'dark'
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('vit-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const navLinks = [
    { to: '/routes', label: 'Routes', icon: Route },
    { to: '/track', label: 'Live Map', icon: MapPin },
    { to: '/faq', label: 'FAQ', icon: HelpCircle },
    { to: '/about', label: 'About', icon: Info },
    { to: '/contact', label: 'Contact', icon: Mail },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(8, 12, 20, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 no-underline group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110"
                style={{ background: 'var(--grad-primary)' }}
              >
                <Bus size={20} color="#080c14" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                Shuttle<span style={{ color: 'var(--primary)' }}>AI</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline"
                  style={{
                    color: isActive(to) ? 'var(--primary)' : 'var(--text-3)',
                    background: isActive(to) ? 'var(--primary-bg)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 cursor-pointer border-0"
                style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {isLoggedIn() ? (
                <Link
                  to="/portal"
                  className="px-5 py-2 rounded-xl text-sm font-semibold no-underline transition-all duration-200"
                  style={{
                    background: 'var(--grad-primary)',
                    color: '#080c14',
                  }}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/"
                  className="px-5 py-2 rounded-xl text-sm font-semibold no-underline transition-all duration-200"
                  style={{
                    background: 'var(--grad-primary)',
                    color: '#080c14',
                  }}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center border-0 cursor-pointer"
              style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t"
            style={{
              background: 'rgba(8, 12, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-colors"
                  style={{
                    color: isActive(to) ? 'var(--primary)' : 'var(--text-2)',
                    background: isActive(to) ? 'var(--primary-bg)' : 'transparent',
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <Link
                  to={isLoggedIn() ? '/portal' : '/'}
                  className="block text-center px-4 py-2.5 rounded-xl text-sm font-semibold no-underline"
                  style={{ background: 'var(--grad-primary)', color: '#080c14' }}
                >
                  {isLoggedIn() ? 'Dashboard' : 'Sign In'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16 min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="border-t"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2.5 no-underline mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--grad-primary)' }}
                >
                  <Bus size={16} color="#080c14" />
                </div>
                <span className="text-base font-bold" style={{ color: 'var(--text)' }}>
                  Shuttle<span style={{ color: 'var(--primary)' }}>AI</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-3)' }}>
                Real-time campus shuttle tracking for VIT Vellore.
                Never miss your shuttle again.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-2)' }}>Navigation</h4>
              <div className="space-y-2">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="block text-sm no-underline transition-colors"
                    style={{ color: 'var(--text-3)' }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-2)' }}>Resources</h4>
              <div className="space-y-2">
                <Link to="/faq" className="block text-sm no-underline" style={{ color: 'var(--text-3)' }}>FAQ</Link>
                <Link to="/contact" className="block text-sm no-underline" style={{ color: 'var(--text-3)' }}>Support</Link>
                <a href="https://vit.ac.in" target="_blank" rel="noopener noreferrer" className="block text-sm no-underline" style={{ color: 'var(--text-3)' }}>VIT Vellore</a>
              </div>
            </div>

            {/* Credits */}
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-2)' }}>Built by</h4>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>
                VIT Vellore Students
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-4)' }}>
                IEEE PELS VIT Student Chapter
              </p>
            </div>
          </div>

          <div
            className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: 'var(--border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-4)' }}>
              &copy; {new Date().getFullYear()} VIT ShuttleAI. All rights reserved.
            </p>
            <p className="text-sm text-center md:text-right" style={{ color: 'var(--text-4)' }}>
              Made with ❤️ by Alok Maan, Arshdeep Singh, Ankush, Saksham & Aviral
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
