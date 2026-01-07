
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { requestPasswordReset } from '@/components/auth/services/authService';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = 'Reset Password - ConsensusAI';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setIsSuccess(true);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for a link to reset your password",
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "Failed to send password reset email",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-consensus-dark-400">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white hero-text-gradient">Reset Password</h2>
          <p className="mt-2 text-consensus-grey-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl animate-scale-in">
          {isSuccess ? (
            <div className="text-center py-4">
              <h3 className="text-xl font-medium text-consensus-green mb-2">Email Sent!</h3>
              <p className="text-consensus-grey-300 mb-6">
                If an account exists with this email, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="inline-block text-consensus-green hover:text-consensus-teal transition-colors hover:underline mt-4"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="py-5 px-4 rounded-xl bg-consensus-dark-200 border-consensus-dark-100 text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-consensus-green hover:bg-consensus-teal text-consensus-dark-800 py-5 rounded-xl transition-all duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          {!isSuccess && (
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-consensus-green hover:text-consensus-teal transition-colors hover:underline"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
