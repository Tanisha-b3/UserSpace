import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Signup.css';

function FloatingShapes() {
  const shapes = [
    { type: 'circle', size: 60, x: 15, y: 20, delay: 0 },
    { type: 'square', size: 40, x: 75, y: 30, delay: 1.5 },
    { type: 'triangle', size: 50, x: 20, y: 65, delay: 0.8 },
    { type: 'circle', size: 30, x: 80, y: 70, delay: 2.2 },
    { type: 'square', size: 20, x: 50, y: 15, delay: 0.5 },
    { type: 'circle', size: 45, x: 65, y: 55, delay: 1.8 },
  ];

  return (
    <div className="floating-shapes">
      {shapes.map((s, i) => (
        <div
          key={i}
          className={`floating-shape shape-${s.type}`}
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function PasswordStrength({ password }) {
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  if (!password) return null;

  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];
  const pct = ((strength + 1) / 5) * 100;

  return (
    <div className="password-strength">
      <div className="strength-bar-track">
        <div
          className="strength-bar-fill"
          style={{ width: `${pct}%`, background: colors[strength] || colors[0] }}
        />
      </div>
      <span className="strength-label" style={{ color: colors[strength] || colors[0] }}>
        {labels[strength] || ''}
      </span>
    </div>
  );
}

function FieldValidation({ value, rules }) {
  if (!value) return null;
  const allPassed = rules.every(r => r.check(value));
  if (!allPassed) {
    const failing = rules.find(r => !r.check(value));
    return <div className="field-hint error">{failing?.hint}</div>;
  }
  return <div className="field-hint success">Looks good!</div>;
}

function PasswordMatch({ password, confirm }) {
  if (!confirm) return null;
  if (password === confirm) {
    return <div className="field-hint success">✓ Passwords match</div>;
  }
  return <div className="field-hint error">Passwords do not match</div>;
}

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    setPageLoaded(true);
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, []);

  const handleKeyPress = (e) => {
    if (e.target.type === 'password') {
      setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
    }
  };

  const nameRules = [
    { check: v => v.trim().length >= 2, hint: 'Name must be at least 2 characters' },
  ];
  const emailRules = [
    { check: v => v.includes('@') && v.includes('.'), hint: 'Enter a valid email address' },
  ];
  const passwordRules = [
    { check: v => v.length >= 6, hint: 'At least 6 characters' },
    { check: v => /[a-z]/.test(v), hint: 'One lowercase letter' },
    { check: v => /[A-Z]/.test(v), hint: 'One uppercase letter' },
    { check: v => /\d/.test(v), hint: 'One number' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Full name is required'); return; }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (!email.includes('@') || !email.includes('.')) { setError('Please enter a valid email address'); return; }
    if (!password) { setError('Password is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!/[a-z]/.test(password)) { setError('Password needs a lowercase letter'); return; }
    if (!/[A-Z]/.test(password)) { setError('Password needs an uppercase letter'); return; }
    if (!/\d/.test(password)) { setError('Password needs a number'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!agreeTerms) { setError('Please agree to the terms and conditions'); return; }

    setLoading(true);

    setTimeout(() => {
      const existing = JSON.parse(localStorage.getItem('users') || '[]');
      if (existing.find((u) => u.email === email)) {
        setError('An account with this email already exists');
        setLoading(false);
        return;
      }

      const newUser = {
        name: name.trim(),
        email,
        password,
        createdAt: new Date().toISOString(),
      };
      existing.push(newUser);
      localStorage.setItem('users', JSON.stringify(existing));
      addToast(`Welcome ${name.trim()}! Account created successfully.`, 'success');
      setTimeout(() => navigate('/'), 500);
    }, 600);
  };

  const fillDemoSignup = () => {
    setName('Demo User');
    setEmail('demo@notepace.com');
    setPassword('Demo123');
    setConfirmPassword('Demo123');
    setError('');
    addToast('Demo signup info filled', 'info');
  };

  return (
    <div className={`signup-split-container ${pageLoaded ? 'loaded' : ''}`}>

      <div className="hero-side hero-side-desktop">
        <FloatingShapes />
        <div className="hero-bg-glow"></div>
        <div className="hero-content">
          <div className="hero-logo">
            <div className="logo-icon">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6L12 13 2 6" />
                <path d="M12 13v8" />
                <path d="M8 9h8" />
              </svg>
            </div>
            <span>NoteSpace</span>
          </div>
          <div className="hero-text-block">
            <h1>Start your<br />creative journey</h1>
            <p>Join thousands of creators who organize, collaborate, and bring ideas to life with NoteSpace.</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Active users</span>
              </div>
              <div className="stat">
                <span className="stat-number">500k+</span>
                <span className="stat-label">Notes created</span>
              </div>
              <div className="stat">
                <span className="stat-number">99%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>
          </div>
          <div className="hero-quote">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <span>Free forever • No credit card required</span>
          </div>
        </div>
        <div className="hero-footer-note">
          <span>⚡ Sync across all devices</span>
        </div>
      </div>

      <div className="form-side">
        <div className="form-card">
          <div className="mobile-header">
            <div className="mobile-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6L12 13 2 6" />
                <path d="M12 13v8" />
                <path d="M8 9h8" />
              </svg>
              <span>NoteSpace</span>
            </div>
            <h2>Create account</h2>
            <p>Get started in seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="split-form">
            {error && (
              <div className="error-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className={`input-group ${focusedField === 'name' ? 'focused' : ''} ${name ? 'has-value' : ''}`}>
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Full name
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="name"
                />
                {name && <span className="input-checkmark">✓</span>}
              </div>
              {name && <FieldValidation value={name} rules={nameRules} />}
            </div>

            <div className={`input-group ${focusedField === 'email' ? 'focused' : ''} ${email ? 'has-value' : ''}`}>
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="hello@notepace.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="email"
                />
                {email && <span className="input-checkmark">✓</span>}
              </div>
              {email && <FieldValidation value={email} rules={emailRules} />}
            </div>

            <div className={`input-group ${focusedField === 'password' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Password
              </label>
              <div className="password-split-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleKeyPress}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {capsLockOn && focusedField === 'password' && (
                <div className="caps-tip">⚠️ Caps Lock is active</div>
              )}
              <PasswordStrength password={password} />
            </div>

            <div className={`input-group ${focusedField === 'confirm' ? 'focused' : ''} ${confirmPassword ? 'has-value' : ''}`}>
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Confirm password
              </label>
              <div className="password-split-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-pwd"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <PasswordMatch password={password} confirm={confirmPassword} />
            </div>

            <div className="terms-row">
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="terms-check-custom"></span>
                <span>I agree to the <Link to="#" className="terms-link">Terms of Service</Link> & <Link to="#" className="terms-link">Privacy Policy</Link></span>
              </label>
            </div>

            <button type="submit" className="signup-split-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-split"></span>
                  Creating account...
                </span>
              ) : (
                <span className="btn-text">Create account →</span>
              )}
            </button>
          </form>

          <div className="divider-split">
            <span>or</span>
          </div>

          <div className="demo-signup-card">
            <div className="demo-flex">
              <div className="demo-badge">✨ try demo</div>
              <div className="demo-cred">
                <code>Demo User</code>
                <span className="dot-sep">•</span>
                <code>demo@notepace.com</code>
              </div>
              <button type="button" className="demo-fill-split" onClick={fillDemoSignup}>
                Auto-fill
              </button>
            </div>
          </div>

          <p className="login-cta">
            Already have an account? <Link to="/">Sign in →</Link>
          </p>

          <div className="secure-footnote">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>Your data is encrypted and private</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
