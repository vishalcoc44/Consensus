import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error before new attempt
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot sign in.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSignInWithProvider = async (provider: 'google') => {
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot sign in.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {error && (
            <div className="auth-error-popup">
                {error}
                <button onClick={() => setError(null)} className="close-popup-button">&times;</button>
            </div>
        )}
        <Link to="/" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to home
        </Link>

        <div className="auth-content">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            {showEmailForm ? 'Enter your credentials to access your account' : 'Sign in to continue'}
          </p>

          {showEmailForm ? (
            <form className="auth-form" onSubmit={handleSignIn}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-group">
                  <span className="input-icon-wrapper">
                      <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                  </span>
                  <input type="email" id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <div className="password-header">
                  <label htmlFor="password">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-icon-wrapper">
                      <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                  </span>
                  <input type="password" id="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" className="toggle-password">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  </button>
                </div>
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="auth-button">Sign in</button>
               <button type="button" className="back-button" onClick={() => setShowEmailForm(false)}>
                Back to sign in options
              </button>
            </form>
          ) : (
            <div className="auth-options">
              <button type="button" className="social-auth-button" onClick={() => setShowEmailForm(true)}>
                Sign in with Email
              </button>
              <div className="auth-separator">
                <span>OR</span>
              </div>
              <button type="button" className="social-auth-button google" onClick={() => handleSignInWithProvider('google')}>
                Sign in with Google
              </button>
            </div>
          )}

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 