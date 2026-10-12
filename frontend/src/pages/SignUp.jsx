import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth as authApi } from '../services/api';
import './SignUp.css';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', regNo: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const set = (k) => (e) => {
    let val = e.target.value;
    if (k === 'regNo') val = val.toUpperCase();
    setForm(f => ({ ...f, [k]: val }));
    setFieldErrors(fe => ({ ...fe, [k]: '' }));
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.regNo.trim()) errs.regNo = 'Registration number is required';
    else if (!/^[0-9]{2}[A-Z]{3}[0-9]{4,5}$/.test(form.regNo.trim())) errs.regNo = 'Invalid format (e.g., 22BCE1234)';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!form.email.endsWith('@vitstudent.ac.in') && !form.email.endsWith('@vit.ac.in')) errs.email = 'Only @vitstudent.ac.in or @vit.ac.in emails';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const showError = (msg) => {
    setError(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      showError(Object.values(errs)[0]);
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        name: form.name.trim(),
        regNo: form.regNo.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      navigate('/', { state: { signupSuccess: true } });
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-root">
      {/* Background orbs */}
      <div className="su-bg">
        <div className="su-orb su-orb-1" />
        <div className="su-orb su-orb-2" />
        <div className="su-orb su-orb-3" />
      </div>

      <div className={`su-card ${mounted ? 'su-show' : ''}`}>
        {/* Logo */}
        <div className="su-logo">
          <div className="su-logo-icon">
            <span className="material-symbols-outlined">directions_bus</span>
          </div>
          <div>
            <div className="su-logo-name">Shuttle<span>AI</span></div>
            <div className="su-logo-sub">VIT Vellore Campus Transit</div>
          </div>
        </div>

        <h2 className="su-title">Create Student Account</h2>
        <p className="su-subtitle">Join VIT Shuttle network</p>

        <form onSubmit={handleSubmit}>
          <div className="su-field">
            <label className="su-label">Full Name</label>
            <div className={`su-input-wrap ${fieldErrors.name ? 'su-input-error' : ''}`}>
              <span className="material-symbols-outlined su-input-icon">person</span>
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={set('name')}
                className="su-input"
                autoFocus
              />
            </div>
            {fieldErrors.name && <div className="su-field-error">{fieldErrors.name}</div>}
          </div>

          <div className="su-field">
            <label className="su-label">Registration Number</label>
            <div className={`su-input-wrap ${fieldErrors.regNo ? 'su-input-error' : ''}`}>
              <span className="material-symbols-outlined su-input-icon">badge</span>
              <input
                type="text"
                placeholder="22BCE1234"
                value={form.regNo}
                onChange={set('regNo')}
                className="su-input"
              />
            </div>
            {fieldErrors.regNo && <div className="su-field-error">{fieldErrors.regNo}</div>}
          </div>

          <div className="su-field">
            <label className="su-label">Student Email</label>
            <div className={`su-input-wrap ${fieldErrors.email ? 'su-input-error' : ''}`}>
              <span className="material-symbols-outlined su-input-icon">mail</span>
              <input
                type="email"
                placeholder="yourname@vitstudent.ac.in"
                value={form.email}
                onChange={set('email')}
                className="su-input"
              />
            </div>
            <div className="su-hint">
              <span className="material-symbols-outlined">info</span>
              Only @vitstudent.ac.in or @vit.ac.in emails
            </div>
            {fieldErrors.email && <div className="su-field-error">{fieldErrors.email}</div>}
          </div>

          <div className="su-row">
            <div className="su-field">
              <label className="su-label">Password</label>
              <div className={`su-input-wrap ${fieldErrors.password ? 'su-input-error' : ''}`}>
                <span className="material-symbols-outlined su-input-icon">lock</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 chars"
                  value={form.password}
                  onChange={set('password')}
                  className="su-input"
                />
              </div>
              {fieldErrors.password && <div className="su-field-error">{fieldErrors.password}</div>}
            </div>
            <div className="su-field">
              <label className="su-label">Confirm</label>
              <div className={`su-input-wrap ${fieldErrors.confirmPassword ? 'su-input-error' : ''}`}>
                <span className="material-symbols-outlined su-input-icon">lock</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Re-enter"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  className="su-input"
                />
              </div>
              {fieldErrors.confirmPassword && <div className="su-field-error">{fieldErrors.confirmPassword}</div>}
            </div>
          </div>

          <label className="su-show-pw">
            <input type="checkbox" checked={showPw} onChange={() => setShowPw(!showPw)} />
            Show passwords
          </label>

          {error && (
            <div className={`su-error ${shakeError ? 'su-shake' : ''}`}>
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <button className="su-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="material-symbols-outlined su-spin">progress_activity</span>
            ) : (
              <>Create Account <span className="material-symbols-outlined">arrow_forward</span></>
            )}
          </button>
        </form>

        <div className="su-footer-link">
          Already registered? <Link to="/">Sign in</Link>
        </div>

        <div className="su-footer">
          <span className="material-symbols-outlined">verified</span>
          Secure Registration · VIT Shuttle
        </div>
      </div>
    </div>
  );
}
