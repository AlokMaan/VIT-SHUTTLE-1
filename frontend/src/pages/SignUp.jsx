import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', regNo: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.regNo || !form.password) { setError('All fields are required'); return; }
    if (!form.email.endsWith('@vitstudent.ac.in')) { setError('Only @vitstudent.ac.in emails are allowed'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const data = await auth.signup({ name: form.name, email: form.email, regNo: form.regNo, password: form.password });
      // Remove setAuth here since they need to verify OTP first
      localStorage.setItem('verifyEmail', form.email);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="nav-brand-icon"><span className="material-symbols-outlined">directions_bus</span></div>
          <div className="nav-brand-text">
            <span className="nav-brand-name" style={{ fontSize: '1.15rem' }}>VIT Shuttle</span>
            <span className="nav-brand-sub">Campus Transit System</span>
          </div>
        </div>
        <div className="auth-title">Create Student Account</div>
        <div className="auth-subtitle">Use your VIT student email to register</div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="auth-input-group">
              <div className="auth-input-icon"><span className="material-symbols-outlined">person</span></div>
              <input placeholder="Your full name" value={form.name} onChange={set('name')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Student Email</label>
            <div className="auth-input-group">
              <div className="auth-input-icon"><span className="material-symbols-outlined">school</span></div>
              <input type="email" placeholder="yourname@vitstudent.ac.in" value={form.email} onChange={set('email')} />
            </div>
            <div style={{ fontSize: '.68rem', color: 'var(--text-4)', marginTop: '.15rem' }}>Only @vitstudent.ac.in emails accepted</div>
          </div>
          <div className="form-group">
            <label className="form-label">Registration Number</label>
            <div className="auth-input-group">
              <div className="auth-input-icon"><span className="material-symbols-outlined">badge</span></div>
              <input placeholder="22BCE1234" value={form.regNo} onChange={set('regNo')} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-input-group">
                <div className="auth-input-icon"><span className="material-symbols-outlined">lock</span></div>
                <input type={showPw ? 'text' : 'password'} placeholder="Min. 6 chars" value={form.password} onChange={set('password')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm</label>
              <div className="auth-input-group">
                <div className="auth-input-icon"><span className="material-symbols-outlined">lock</span></div>
                <input type={showPw ? 'text' : 'password'} placeholder="Re-enter" value={form.confirmPassword} onChange={set('confirmPassword')} />
              </div>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.76rem', color: 'var(--text-3)', marginBottom: '1rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={showPw} onChange={() => setShowPw(!showPw)} style={{ accentColor: 'var(--primary)' }} /> Show passwords
          </label>
          {error && <div className="form-error" style={{ marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '.9rem' }}>error</span>{error}
          </div>}
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading
              ? <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '1rem' }}>progress_activity</span>
              : <>Create Account <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_forward</span></>}
          </button>
        </form>
        <div className="auth-footer">Already registered? <Link to="/signin">Sign in</Link></div>
      </div>
    </div>
  );
}
