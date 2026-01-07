import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import AuthHeader from './components/AuthHeader';
import EmailInput from './components/EmailInput';
import PasswordInput from './components/PasswordInput';
import NameInput from './components/NameInput';
import AuthButton from './components/AuthButton';
import AuthFooter from './components/AuthFooter';
import ErrorDisplay from './components/ErrorDisplay';
import { loginUser, registerUser } from '@/components/auth/services/authService';

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
        // Simple validation
        if (!email || !password) {
          throw new Error("Please enter both email and password");
        }

        await loginUser(email, password);

        toast({
          title: "Successfully signed in",
          description: "Welcome back!",
        });

        navigate('/dashboard');
      } else {
        // Registration flow
        // Simple validation
        if (!email || !password || !name) {
          throw new Error("Please fill in all fields");
        }

        await registerUser(email, password, name);

        toast({
          title: "Account created",
          description: "Welcome to ConsensusAI! Please check your email to verify your account.",
        });

        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Authentication error:", err);

      let errorMessage = "An unknown error occurred";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthHeader type={type} />

      <div className="glass-panel p-8 rounded-2xl animate-scale-in">
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
