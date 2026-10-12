import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth as authApi } from '../services/api';
import { setAuth } from '../utils/auth';
import './SignIn.css';

const FEATURES = [
  { icon: 'location_on', text: 'Real-time GPS tracking' },
  { icon: 'schedule', text: 'Smart ETA predictions' },
  { icon: 'route', text: '3 campus routes covered' },
  { icon: 'notifications_active', text: 'Instant delay alerts' },
];

const TEAM = ['Alok Maan', 'Arshdeep Singh', 'Ankush', 'Saksham', 'Aviral'];

export default function SignIn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('student');
  const [regNo, setRegNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const showError = (msg) => {
    setError(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!regNo) { showError('Please enter your registration number'); return; }
    if (!password) { showError('Please enter your password'); return; }
    setLoading(true);
    try {
      const data = await authApi.loginById(regNo, password);
      setAuth({
        token: data.token,
        name: data.user?.name,
        email: data.user?.email,
        role: data.user?.role || 'student',
        userId: data.user?.id,
        regNo: data.user?.regNo,
      });
      navigate('/portal');
    } catch (err) {
      const msg = err.message || 'Something went wrong';
      if (msg.includes('Cannot connect') || msg.includes('Failed to fetch')) {
        showError('Server is offline. Please make sure the backend is running.');
      } else {
        showError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { showError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setAuth({
        token: data.token,
        name: data.user?.name || email.split('@')[0],
        email: data.user?.email || email,
        role: data.user?.role || 'student',
        userId: data.user?.id,
        regNo: data.user?.regNo,
      });
      navigate('/admin');
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="si-root">
      {/* ── LEFT PANEL: Branding showcase ── */}
      <div className="si-left">
        <div className="si-left-bg">
          <div className="si-orb si-orb-1" />
          <div className="si-orb si-orb-2" />
          <div className="si-orb si-orb-3" />
          <div className="si-grid-overlay" />
          {/* Animated route lines */}
          <svg className="si-route-lines" viewBox="0 0 400 600" fill="none">
            <path d="M50 0 Q200 150 150 300 T350 600" stroke="rgba(0,212,184,0.12)" strokeWidth="1.5" />
            <path d="M350 0 Q200 200 250 400 T50 600" stroke="rgba(124,109,250,0.1)" strokeWidth="1.5" />
            <path d="M200 0 Q100 100 300 300 T200 600" stroke="rgba(0,212,184,0.07)" strokeWidth="1" />
          </svg>
        </div>

        <div className={`si-left-content ${mounted ? 'si-show' : ''}`}>
          {/* Logo */}
          <div className="si-logo">
            <div className="si-logo-icon">
              <span className="material-symbols-outlined">directions_bus</span>
            </div>
            <div>
              <div className="si-logo-name">Shuttle<span>AI</span></div>
              <div className="si-logo-sub">VIT Vellore Campus Transit</div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="si-headline">
            Never Miss Your<br />
            <span className="si-headline-accent">Campus Shuttle</span>
          </h1>
          <p className="si-tagline">
            Real-time tracking, smart ETAs, and instant alerts for VIT Vellore's shuttle network.
          </p>

          {/* Feature pills */}
          <div className="si-features">
            {FEATURES.map((f, i) => (
              <div className="si-feature" key={i} style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                <span className="material-symbols-outlined si-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Live badge */}
          <div className="si-live-badge">
            <span className="si-live-dot" />
            <span>System Online — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>

          {/* Bottom credits */}
          <div className="si-credits">
            Built by {TEAM.join(', ')}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Auth form ── */}
      <div className="si-right">
        <div className={`si-form-card ${mounted ? 'si-show' : ''}`}>
          {/* Mobile logo */}
          <div className="si-mobile-logo">
            <div className="si-logo-icon">
              <span className="material-symbols-outlined">directions_bus</span>
            </div>
            <div className="si-logo-name">Shuttle<span>AI</span></div>
          </div>

          {/* Mode Toggle */}
          <div className="si-toggle">
            <button
              className={`si-toggle-btn ${mode === 'student' ? 'active' : ''}`}
              onClick={() => { setMode('student'); setError(''); setRegNo(''); setEmail(''); setPassword(''); }}
            >
              <span className="material-symbols-outlined">school</span>
              Student
            </button>
            <button
              className={`si-toggle-btn ${mode === 'admin' ? 'active' : ''}`}
              onClick={() => { setMode('admin'); setEmail('admin@vit.ac.in'); setError(''); setRegNo(''); setPassword(''); }}
            >
              <span className="material-symbols-outlined">shield</span>
              Admin
            </button>
          </div>

          {mode === 'student' ? (
            <>
              <h2 className="si-form-title">Welcome Back</h2>
              <p className="si-form-sub">Sign in with your VIT registration number</p>

              <form onSubmit={handleStudentSubmit}>
                <div className="si-field">
                  <label className="si-label">Registration Number</label>
                  <div className="si-input-wrap">
                    <span className="material-symbols-outlined si-input-icon">badge</span>
                    <input
                      type="text"
                      placeholder="22BCE1234"
                      value={regNo}
                      onChange={e => setRegNo(e.target.value.toUpperCase())}
                      autoComplete="username"
                      autoFocus
                      className="si-input"
                    />
                  </div>
                </div>

                <div className="si-field">
                  <label className="si-label">Password</label>
                  <div className="si-input-wrap">
                    <span className="material-symbols-outlined si-input-icon">lock</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="si-input"
                    />
                    <button type="button" className="si-pw-toggle" onClick={() => setShowPw(!showPw)}>
                      <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={`si-error ${shakeError ? 'si-shake' : ''}`}>
                    <span className="material-symbols-outlined">error</span>
                    {error}
                  </div>
                )}

                <button className="si-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <span className="material-symbols-outlined si-spin">progress_activity</span>
                  ) : (
                    <>Sign In<span className="material-symbols-outlined">arrow_forward</span></>
                  )}
                </button>
              </form>

              <div className="si-signup-link">
                New student? <Link to="/signup">Sign up</Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="si-form-title" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--red)' }}>admin_panel_settings</span>
                Admin Access
              </h2>
              <p className="si-form-sub">Enter admin credentials to access the control panel</p>

              <form onSubmit={handleAdminSubmit}>
                <div className="si-field">
                  <label className="si-label">Admin Email</label>
                  <div className="si-input-wrap">
                    <span className="material-symbols-outlined si-input-icon">person</span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="si-input" autoComplete="email" />
                  </div>
                </div>
                <div className="si-field">
                  <label className="si-label">Password</label>
                  <div className="si-input-wrap">
                    <span className="material-symbols-outlined si-input-icon">lock</span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Enter admin password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="si-input"
                      autoComplete="current-password"
                    />
                    <button type="button" className="si-pw-toggle" onClick={() => setShowPw(!showPw)}>
                      <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={`si-error ${shakeError ? 'si-shake' : ''}`}>
                    <span className="material-symbols-outlined">error</span>
                    {error}
                  </div>
                )}

                <button className="si-submit si-submit-admin" type="submit" disabled={loading}>
                  {loading ? (
                    <span className="material-symbols-outlined si-spin">progress_activity</span>
                  ) : (
                    <>Access Control Panel<span className="material-symbols-outlined">shield</span></>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="si-footer">
            <span className="material-symbols-outlined">verified</span>
            Secure Authentication · VIT Shuttle
          </div>
        </div>
      </div>
    </div>
  );
}
