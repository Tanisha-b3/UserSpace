import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Signup.css';

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
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    addToast(`${newTheme ? 'Dark' : 'Light'} mode activated`, 'info');
  };

  const fillDemoSignup = () => {
    setName('Demo User');
    setEmail('demo@notepace.com');
    setPassword('demo123');
    setConfirmPassword('demo123');
    setError('');
    addToast('Demo signup info filled', 'info');
  };

  return (
    <div className="signup-split-container">
      {/* <button className="theme-toggle-split" onClick={toggleTheme}>
        {isDark ? '☀️' : '🌙'}
      </button> */}

      {/* LEFT PANEL — HIDDEN ON MOBILE */}
      <div className="hero-side hero-side-desktop">
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

      {/* RIGHT PANEL — SIGNUP FORM (visible on all devices) */}
      <div className="form-side">
        <div className="form-card">
          {/* Mobile Header - Only visible on mobile */}
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

            <div className={`input-group ${focusedField === 'name' ? 'focused' : ''}`}>
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Full name
              </label>
              <input
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                autoComplete="name"
              />
            </div>

            <div className={`input-group ${focusedField === 'email' ? 'focused' : ''}`}>
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email
              </label>
              <input
                type="email"
                placeholder="hello@notepace.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoComplete="email"
              />
            </div>

            <div className={`input-group ${focusedField === 'password' ? 'focused' : ''}`}>
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
              <div className="password-hint">Minimum 6 characters</div>
            </div>

            <div className={`input-group ${focusedField === 'confirm' ? 'focused' : ''}`}>
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
            </div>

            <button type="submit" className="signup-split-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-split"></span> Creating account...
                </>
              ) : (
                'Create account →'
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