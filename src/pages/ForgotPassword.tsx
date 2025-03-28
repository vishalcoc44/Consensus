
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
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-consensus-grey-100">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-consensus-blue">Reset Password</h2>
          <p className="mt-2 text-consensus-grey-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg animate-scale-in">
          {isSuccess ? (
            <div className="text-center py-4">
              <h3 className="text-xl font-medium text-green-600 mb-2">Email Sent!</h3>
              <p className="text-gray-600 mb-6">
                If an account exists with this email, you'll receive a password reset link shortly.
              </p>
              <Link 
                to="/login" 
                className="inline-block text-consensus-blue hover:underline mt-4"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="py-5 px-4 rounded-xl"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-consensus-blue hover:bg-blue-700 py-5 rounded-xl"
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
                className="text-consensus-blue hover:underline"
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
