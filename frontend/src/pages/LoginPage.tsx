import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ─── LEFT: Background Image Panel ──────────────────── */}
      <div className="login-image-panel">
        <img
          src="/frontdesk.jpg"
          alt="Hotel Jay Suites Front Desk"
          className="login-bg-image"
        />
        <div className="login-image-overlay" />
      </div>

      {/* ─── RIGHT: Login Form Panel ───────────────────────── */}
      <div className="login-form-panel">
        {/* Branding in top-left */}
        <div className="login-top-branding">
          <div className="login-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/>
              <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16"/>
              <circle cx="12" cy="11" r="2"/>
              <path d="M8 7h.01"/><path d="M16 7h.01"/><path d="M12 7h.01"/>
            </svg>
          </div>
          <div>
            <div className="login-brand-name">Hotel Jay Suites</div>
            <div className="login-brand-tagline">Smart Hotel Operations Platform</div>
          </div>
        </div>

        {/* Centered form */}
        <div className="login-form-container">
          <div className="login-glass-card">
            {/* Header */}
            <div className="login-card-header">
              <h1 className="login-title">Login</h1>
              <p className="login-subtitle">
                Welcome back. Sign in to manage your hotel operations.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" x2="12" y1="8" y2="12"/>
                  <line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label htmlFor="login-email" className="login-label">Email</label>
                <div className="login-input-wrap">
                  <Mail className="login-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    placeholder="admin@jaysuites.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password" className="login-label">Password</label>
                <div className="login-input-wrap">
                  <Lock className="login-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input login-input-password"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-eye-btn"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="login-forgot-row">
                <a href="#" className="login-forgot-link" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? (
                  <span className="login-btn-loading">
                    <svg className="login-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="login-btn-content">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">Or continue with</span>
              <div className="login-divider-line" />
            </div>

            {/* Google */}
            <button type="button" className="login-google-btn" onClick={(e) => e.preventDefault()}>
              <Chrome className="w-4 h-4" />
              Google
            </button>

            {/* Register link */}
            <p className="login-register">
              Don't have an account?{' '}
              <a href="#" className="login-register-link" onClick={(e) => e.preventDefault()}>
                Register here
              </a>
            </p>

            {/* Demo credentials */}
            <div className="login-demo">
              Demo: admin@jaysuites.com / admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
