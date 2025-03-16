
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, MailIcon, LockIcon, User, ArrowLeft } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (type === 'login') {
      // In a real app, you would authenticate with a backend
      console.log('Logging in with:', { email, password });
      navigate('/dashboard');
    } else {
      // In a real app, you would register with a backend
      console.log('Registering with:', { name, email, password });
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center text-consensus-grey-600 hover:text-consensus-blue transition-colors mb-6">
          <ArrowLeft size={16} className="mr-1" />
          Back to home
        </Link>
        <h1 className="font-sf text-3xl font-bold mb-2">
          {type === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-consensus-grey-600">
          {type === 'login' 
            ? 'Enter your credentials to access your account' 
            : 'Get started with ConsensusAI today'}
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg animate-scale-in">
        <form onSubmit={handleSubmit} className="space-y-5">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-consensus-grey-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 py-6 rounded-xl"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <MailIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-consensus-grey-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 py-6 rounded-xl"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              {type === 'login' && (
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-consensus-blue hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <LockIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-consensus-grey-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={type === 'login' ? 'Enter your password' : 'Create a password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            className="w-full py-6 bg-consensus-blue hover:bg-consensus-blue/90 rounded-xl transition-all"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="ml-2">{type === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : (
              <>{type === 'login' ? 'Sign in' : 'Create account'}</>
            )}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-consensus-grey-600">
            {type === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <Link 
              to={type === 'login' ? '/register' : '/login'} 
              className="text-consensus-blue font-medium hover:underline"
            >
              {type === 'login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
