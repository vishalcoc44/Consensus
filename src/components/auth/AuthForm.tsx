
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
        // Add more detailed logging for debugging
        console.log(`Attempting login with email: ${email.substring(0, 3)}...`);
        const authData = await loginUser(email, password);
        
        if (authData && authData.user) {
          console.log("Login successful, user ID:", authData.user.id);
          
          toast({
            title: "Successfully signed in",
            description: "Welcome back!",
          });
          
          navigate('/dashboard');
        } else {
          throw new Error("Login successful but no user data returned");
        }
      } else {
        // Registration flow
        console.log(`Attempting registration with email: ${email.substring(0, 3)}...`);
        const authData = await registerUser(email, password, name);
        
        if (authData && authData.user) {
          console.log("Registration successful, user ID:", authData.user.id);
          
          toast({
            title: "Account created",
            description: "Welcome to ConsensusAI!",
          });
          
          // For new accounts, check if email confirmation is required
          if (authData.session) {
            navigate('/dashboard');
          } else {
            toast({
              title: "Email verification required",
              description: "Please check your email to verify your account before logging in.",
            });
            navigate('/login');
          }
        } else {
          throw new Error("Registration successful but no user data returned");
        }
      }
    } catch (err) {
      console.error("Authentication error:", err);
      
      // Provide more user-friendly error messages
      let errorMessage = "An unknown error occurred";
      
      if (err instanceof Error) {
        // Handle specific error codes from Supabase
        if (err.message.includes("invalid_credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (err.message.includes("email already exists")) {
          errorMessage = "This email is already registered. Please use a different email or try logging in.";
        } else if (err.message.includes("weak password")) {
          errorMessage = "Password is too weak. Please use a stronger password.";
        } else {
          errorMessage = err.message;
        }
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

      <div className="bg-consensus-dark-300 p-8 rounded-2xl border border-consensus-dark-100 shadow-lg animate-scale-in">
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
