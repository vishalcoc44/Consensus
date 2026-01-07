
import { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import AuthLayout from '@/components/auth/AuthLayout';

const Register = () => {
  useEffect(() => {
    // Scroll to top when the page loads
    window.scrollTo(0, 0);
    // Set page title
    document.title = 'Register - ConsensusAI';
  }, []);

  return (
    <AuthLayout
      imageSrc="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80"
      quote="The best decisions are made when everyone has a voice. Join us today."
      author="Sarah Miller, VP of Engineering"
    >
      <AuthForm type="register" />
    </AuthLayout>
  );
};

export default Register;
