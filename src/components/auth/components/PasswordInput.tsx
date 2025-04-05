
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LockIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PasswordInputProps {
  password: string;
  setPassword: (password: string) => void;
  showForgotPassword?: boolean;
}

const PasswordInput = ({ 
  password, 
  setPassword, 
  showForgotPassword = false 
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="password" className="text-sm font-medium text-white">
          Password
        </Label>
        {showForgotPassword && (
          <Link 
            to="/forgot-password" 
            className="text-sm text-consensus-green hover:text-consensus-teal transition-colors hover:underline"
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
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pl-10 py-6 pr-10 rounded-xl bg-consensus-dark-200 border-consensus-dark-100 text-white"
          required
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-consensus-grey-400 hover:text-white"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
