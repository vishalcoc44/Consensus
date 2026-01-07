
import { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import AuthLayout from '@/components/auth/AuthLayout';

const Login = () => {
  useEffect(() => {
    // Scroll to top when the page loads
    window.scrollTo(0, 0);
    // Set page title
    document.title = 'Login - ConsensusAI';
  }, []);

  return (
    <AuthLayout
      imageSrc="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80"
      quote="ConsensusAI has transformed our decision-making process into something truly collaborative."
      author="Michael Chen, Product Director"
    >
      <AuthForm type="login" />
    </AuthLayout>
  );
};

export default Login;
