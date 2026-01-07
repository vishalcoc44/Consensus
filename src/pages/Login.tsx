
import { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';

const Login = () => {
  useEffect(() => {
    // Scroll to top when the page loads
    window.scrollTo(0, 0);
    // Set page title
    document.title = 'Login - ConsensusAI';
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background animate-fade-in">
      <AuthForm type="login" />
    </div>
  );
};

export default Login;
