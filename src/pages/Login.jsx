import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Login.css';

function TypewriterText({ text, speed = 50 }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setDone(false);
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="typewriter-cursor">|</span>}
    </span>
  );
}

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
  const [lastLogin, setLastLogin] = useState('');
  const [pageLoaded, setPageLoaded] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const passwordInputRef = useRef(null);

  useEffect(() => {
    setPageLoaded(true);
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

    const remembered = localStorage.getItem('rememberMe') === 'true';
    if (remembered) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const savedEmail = localStorage.getItem('rememberedEmail');
      const user = users.find(u => u.email === savedEmail);
      if (user?.lastLogin) {
        const d = new Date(user.lastLogin);
        setLastLogin(`Last login: ${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      }
    }
  }, []);

  const handleKeyPress = (e) => {
    setCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const fillDemo = useCallback(() => {
    setEmail('demo@example.com');
    setPassword('demo123');
    setError('');
    addToast('Demo credentials filled', 'info');
  }, [addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required'); return; }
    if (!email.includes('@') || !email.includes('.')) { setError('Please enter a valid email address'); return; }
    if (!password) { setError('Password is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

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
    addToast(`${provider} login - coming soon!`, 'info');
  };

  return (
    <div className={`login-split-container ${pageLoaded ? 'loaded' : ''}`}>
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
            <h1><TypewriterText text="Ideas take flight" /></h1>
            <p>Capture, organize, and collaborate — your digital workspace, elevated.</p>
            <div className="hero-features">
              <div className="feature-chip">✨ Smart notes</div>
              <div className="feature-chip">🔒 Encrypted</div>
              <div className="feature-chip">⚡ Real-time sync</div>
              <div className="feature-chip">🤝 Team collaboration</div>
            </div>
          </div>
          <div className="hero-quote-row">
            <div className="hero-quote">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 11h-4v-4h4v4zm8 0h-4v-4h4v4zm-8 6h-4v-4h4v4zm8 0h-4v-4h4v4z" />
              </svg>
              <span>Join 10,000+ focused creators</span>
            </div>
            <div className="hero-rating">★★★★★ <span>4.8</span></div>
          </div>
        </div>
        <div className="hero-footer-note">
          <span>© {new Date().getFullYear()} NoteSpace — where clarity lives.</span>
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

            {lastLogin && (
              <div className="last-login-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {lastLogin}
              </div>
            )}

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
              <button type="button" className="forgot-link-split" onClick={() => addToast('Password reset feature coming soon!', 'info')}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="login-split-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-split"></span>
                  Signing in...
                </span>
              ) : (
                <span className="btn-text">Sign in →</span>
              )}
            </button>
          </form>

          <div className="divider-split">
            <span>or continue with</span>
          </div>

          <div className="social-row">
            <button type="button" className="social-split-btn" onClick={() => handleSocialLogin('Google')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
              Google
            </button>
            <button type="button" className="social-split-btn" onClick={() => handleSocialLogin('GitHub')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
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
