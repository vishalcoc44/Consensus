
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { loginUser, registerUser } from './services/authService';
import AuthHeader from './components/AuthHeader';
import EmailInput from './components/EmailInput';
import PasswordInput from './components/PasswordInput';
import NameInput from './components/NameInput';
import AuthButton from './components/AuthButton';
import AuthFooter from './components/AuthFooter';
import ErrorDisplay from './components/ErrorDisplay';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (type === 'login') {
        await loginUser(email, password);
        
        toast({
          title: "Successfully signed in",
          description: "Welcome back!",
        });
        
        navigate('/dashboard');
      } else {
        await registerUser(email, password, name);
        
        toast({
          title: "Account created",
          description: "Welcome to ConsensusAI!",
        });
        
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthHeader type={type} />

      <div className="bg-white p-8 rounded-2xl shadow-lg animate-scale-in">
        <ErrorDisplay error={error} />
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {type === 'register' && (
            <NameInput name={name} setName={setName} />
          )}
          
          <EmailInput email={email} setEmail={setEmail} />
          
          <PasswordInput 
            password={password} 
            setPassword={setPassword} 
            showForgotPassword={type === 'login'} 
          />
          
          <AuthButton loading={loading} type={type} />
        </form>
        
        <AuthFooter type={type} />
      </div>
    </div>
  );
};

export default AuthForm;
