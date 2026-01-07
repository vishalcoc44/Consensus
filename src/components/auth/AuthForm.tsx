import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import AuthButton from './components/AuthButton';
import EmailInput from './components/EmailInput';
import PasswordInput from './components/PasswordInput';
import NameInput from './components/NameInput';
import ErrorDisplay from './components/ErrorDisplay';
import { loginUser, registerUser } from '@/components/auth/services/authService';
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-6 ">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{type === 'login' ? 'Login to your account' : 'Create an account'}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {type === 'login' ? 'Enter your email below to login to your account' : 'Enter your details below to create your account'}
        </p>
      </div>

      <div className="grid gap-6">
        <ErrorDisplay error={error} />
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
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
          </div>
        </form>


      </div>

      <div className="text-center text-sm">
        {type === 'login' ? (
          <>
            Don&apos;t have an account?{" "}
            <Link to="/register" className="underline underline-offset-4">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/login" className="underline underline-offset-4">
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
