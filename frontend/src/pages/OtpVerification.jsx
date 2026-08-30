import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setAuth } from '../utils/auth';
import { auth } from '../services/api';
import './OtpVerification.css';

export default function OtpVerification() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [result, setResult] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [inputState, setInputState] = useState('');
  const [orbitState, setOrbitState] = useState('idle');

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('verifyEmail');

  useEffect(() => {
    if (!email) { navigate('/'); return; }
    inputRefs[0].current?.focus();
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    setInputState('');
    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 4).split('');
    if (pastedData.some(c => isNaN(c))) return;
    const newOtp = ['', '', '', ''];
    pastedData.forEach((char, i) => { if (i < 4) newOtp[i] = char; });
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 3);
    inputRefs[focusIndex].current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 4) { setError('Please enter all 4 digits'); return; }

    setLoading(true);
    setError('');
    setResult(null);
    setOrbitState('verifying');

    try {
      const data = await auth.verifyOtp(email, code);
      setOrbitState('success');
      setInputState('success');
      setTimeout(() => setResult('success'), 600);
      setTimeout(() => {
        setAuth({
          token: data.token,
          name: data.user?.name,
          email: data.user?.email,
          role: data.user?.role || 'student',
          userId: data.user?.id,
          regNo: data.user?.regNo,
        });
        localStorage.removeItem('verifyEmail');
        navigate('/portal');
      }, 2400);
    } catch (err) {
      setOrbitState('error');
      setInputState('error');
      setShaking(true);
      setTimeout(() => setResult('error'), 400);
      setTimeout(() => {
        setShaking(false);
        setResult(null);
        setInputState('');
        setOrbitState('idle');
        setOtp(['', '', '', '']);
        inputRefs[0].current?.focus();
      }, 2500);
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await auth.sendOtp(email);
      setResendTimer(30);
      setSuccessMsg('New code sent!');
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  const displayEmail = email
    ? email.replace(/(^.{3}).*?(.{2}@)/, '$1***$2')
    : '';

  return (
    <div className="otp-page-wrapper">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="otp-card">
        {result && (
          <div className="otp-result-overlay">
            <div style={{ textAlign: 'center' }}>
              {result === 'success' ? (
                <svg className="result-icon success" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="circle" />
                  <polyline points="30,52 45,65 70,38" className="icon-path" />
                </svg>
              ) : (
                <svg className="result-icon error" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="circle" />
                  <line x1="35" y1="35" x2="65" y2="65" className="icon-path" />
                  <line x1="65" y1="35" x2="35" y2="65" className="icon-path" style={{ animationDelay: '0.7s' }} />
                </svg>
              )}
              <p className={`result-text ${result}`}>
                {result === 'success' ? 'Verified Successfully!' : 'Incorrect Code'}
              </p>
              <p className="result-sub">
                {result === 'success' ? 'Redirecting to your dashboard...' : 'Please try again'}
              </p>
            </div>
          </div>
        )}

        <button className="otp-back-btn" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>
          Back to Sign In
        </button>

        <h2 className="otp-title">Verify Your Email</h2>
        <p className="otp-subtitle">
          Enter the 4-digit code sent to <strong>{displayEmail}</strong>
        </p>

        <div className="orbit-container">
          <svg className="orbit-ring" viewBox="0 0 100 100">
            {/* Dashed track */}
            <circle cx="50" cy="50" r="46" className="orbit-track" />
            {/* Animated progress ring */}
            <circle cx="50" cy="50" r="46"
              className={`orbit-progress ${orbitState}`}
              style={{ transformOrigin: '50px 50px' }}
            />
          </svg>

          <div className={`otp-inputs${shaking ? ' shake' : ''}`} onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`otp-input ${inputState}`}
                disabled={loading || result === 'success'}
              />
            ))}
          </div>
        </div>

        {error && !result && (
          <p className="otp-error-msg">
            <span className="material-symbols-outlined" style={{ fontSize: '.9rem' }}>error</span>
            {error}
          </p>
        )}
        {successMsg && (
          <p className="otp-success-msg">
            <span className="material-symbols-outlined" style={{ fontSize: '.9rem' }}>check_circle</span>
            {successMsg}
          </p>
        )}

        <p className="resend-text">
          Didn't receive the code?{' '}
          <span
            className={`resend-link ${resendTimer > 0 ? 'disabled' : ''}`}
            onClick={handleResend}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend now'}
          </span>
        </p>

        <button
          className="verify-btn"
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 4 || result === 'success'}
        >
          {loading ? (
            <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '1.1rem' }}>progress_activity</span>
          ) : (
            <>Verify & Proceed <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>verified</span></>
          )}
        </button>

        <p className="otp-footer">
          <span className="material-symbols-outlined" style={{ fontSize: '.8rem' }}>lock</span>
          Secured with end-to-end encryption
        </p>
      </div>
    </div>
  );
}
