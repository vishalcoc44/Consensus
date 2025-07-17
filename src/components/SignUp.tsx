import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const SignUp: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      console.error("Supabase client not initialized. Cannot sign up.");
      return;
    }
    try {
      // Step 1: Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Sign up successful, but no user data returned.");

      // Step 2: Create the organization/team
      const { error: teamError } = await supabase.from('teams').insert({
        name: organizationName,
        created_by: authData.user.id,
      });

      if (teamError) {
        // Note: In a real-world scenario, you might want to handle this more gracefully.
        // For example, by deleting the created user if the team creation fails.
        // For now, we will log the error and show it to the user.
        throw teamError;
      }

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
      console.error('Error during sign up process:', error.message);
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
        console.error('Error signing in with provider:', error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to home
        </Link>

        <div className="auth-content">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            {showEmailForm ? 'Get started with ConsensusAI today' : 'Sign up to get started'}
          </p>
          
          {showEmailForm ? (
            <form className="auth-form" onSubmit={handleSignUp}>
              <div className="form-group">
                <label htmlFor="organizationName">Organization Name</label>
                <div className="input-group">
                  {/* You can add an icon here if you like */}
                  <input type="text" id="organizationName" placeholder="Enter your organization's name" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Your Full Name</label>
                <div className="input-group">
                  <span className="input-icon-wrapper">
                      <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                  </span>
                  <input type="text" id="fullName" placeholder="Enter your name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
              </div>

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
                <label htmlFor="password">Password</label>
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
              </div>

              <button type="submit" className="auth-button">Create account</button>
              <button type="button" className="back-button" onClick={() => setShowEmailForm(false)}>
                Back to sign up options
              </button>
            </form>
          ) : (
            <div className="auth-options">
                <button type="button" className="social-auth-button" onClick={() => setShowEmailForm(true)}>
                  Sign up with Email
                </button>
                <div className="auth-separator">
                    <span>OR</span>
                </div>
                <button type="button" className="social-auth-button google" onClick={() => handleSignInWithProvider('google')}>
                  Sign up with Google
                </button>
            </div>
          )}

          {error && (
            <div className="auth-error-popup">
                {error}
                <button onClick={() => setError(null)} className="close-popup-button">&times;</button>
            </div>
          )}

          <div className="auth-footer">
            <p>Already have an account? <Link to="/signin" className="auth-link">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 