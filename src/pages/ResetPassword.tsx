
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { resetPassword } from '@/components/auth/services/authService';
import { Eye, EyeOff, LockIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = 'Set New Password - ConsensusAI';
    
    // Check if the user has a valid session after the password reset flow
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setError('Invalid or expired session. Please request a new password reset link.');
        return;
      }
      
      if (data.session) {
        console.log('Valid session detected during password reset');
        setIsAuthenticated(true);
      } else {
        console.log('No session found during password reset');
        setError('Invalid or missing reset token. Please request a new password reset link.');
      }
    };
    
    checkSession();
  }, []);

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!isAuthenticated) {
      setError('You must have a valid password reset session to continue');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword(password.trim());
      
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now login with your new password.",
      });
      
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      console.error('Password reset error:', err);
      
      setError(err instanceof Error 
        ? err.message 
        : 'Failed to reset password. The link may have expired or is invalid.');
        
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: err instanceof Error 
          ? err.message 
          : 'Failed to reset password. The link may have expired or is invalid.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-consensus-grey-100">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-consensus-blue">Set New Password</h2>
          <p className="mt-2 text-consensus-grey-600">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg animate-scale-in">
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
              {error}
              {!isAuthenticated && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-sm"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Request a new reset link
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <LockIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-consensus-grey-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pl-10 py-6 pr-10 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-consensus-grey-400 hover:text-consensus-grey-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <LockIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-consensus-grey-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pl-10 py-6 pr-10 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-consensus-grey-400 hover:text-consensus-grey-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-consensus-blue hover:bg-blue-700 py-5 rounded-xl"
              disabled={isSubmitting || !isAuthenticated}
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-consensus-grey-600">
              Remember your password?{' '}
              <Button 
                variant="link" 
                className="p-0 text-consensus-blue hover:underline"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
