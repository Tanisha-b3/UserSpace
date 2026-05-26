import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState(() => {
    const savedRemember = localStorage.getItem('rememberMe') === 'true';
    return savedRemember ? localStorage.getItem('rememberedEmail') || '' : '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberMe') === 'true');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const passwordInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, []);

  const handleKeyPress = (e) => {
    setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const fillDemo = () => {
    setEmail('demo@example.com');
    setPassword('demo123');
    setError('');
    addToast('Demo credentials filled', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', user.name);

    const updatedUsers = users.map((u) =>
      u.email === email ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    addToast(`Welcome back, ${user.name}!`, 'success');

    setTimeout(() => {
      navigate('/dashboard');
    }, 400);
  };

  const handleSocialLogin = (provider) => {
    addToast(`${provider} login demo - OAuth integration ready`, 'info');
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    addToast(`${newTheme ? 'Dark' : 'Light'} mode activated`, 'info');
  };

  return (
    <div className="login-split-container">
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
            <h1>Ideas take flight</h1>
            <p>Capture, organize, and collaborate — your digital notebook, elevated.</p>
            <div className="hero-features">
              <div className="feature-chip">✨ Smart notes</div>
              <div className="feature-chip">🔒 Encrypted</div>
              <div className="feature-chip">⚡ Real-time sync</div>
            </div>
          </div>
          <div className="hero-quote">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 11h-4v-4h4v4zm8 0h-4v-4h4v4zm-8 6h-4v-4h4v4zm8 0h-4v-4h4v4z" />
            </svg>
            <span>Join 10,000+ focused creators</span>
          </div>
        </div>
        <div className="hero-footer-note">
          <span>© 2025 NoteSpace — where clarity lives.</span>
        </div>
      </div>

      {/* RIGHT PANEL — LOGIN FORM (visible on all devices) */}
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
            <h2>Welcome back</h2>
            <p>Sign in to continue your journey</p>
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
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyUp={handleKeyPress}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="current-password"
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
            </div>

            <div className="form-actions-row">
              <label className="remember-split">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="check-custom"></span>
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link-split">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-split-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-split"></span> Signing in...
                </>
              ) : (
                'Sign in →'
              )}
            </button>
          </form>

          <div className="divider-split">
            <span>or continue with</span>
          </div>

          <div className="social-row">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="social-split-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              className="social-split-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="demo-split-card">
            <div className="demo-flex">
             
              <div className="demo-cred">
                <code>demo@example.com</code>
                <span className="dot-sep">•</span>
                <code>demo123</code>
              </div>
              <button type="button" className="demo-fill-split" onClick={fillDemo}>
                Auto-fill
              </button>
            </div>
          </div>

          <p className="signup-cta">
            New to NoteSpace? <Link to="/signup">Create free account →</Link>
          </p>

          <div className="secure-footnote">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>End-to-end encrypted workspace</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;