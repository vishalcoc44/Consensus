
import { Button } from '@/components/ui/button';

interface AuthButtonProps {
  loading: boolean;
  type: 'login' | 'register';
}

const AuthButton = ({ loading, type }: AuthButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full py-6 bg-consensus-green hover:bg-consensus-teal text-consensus-dark-800 rounded-xl transition-all duration-300"
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-consensus-dark-800"></div>
          <span className="ml-2">{type === 'login' ? 'Signing in...' : 'Creating account...'}</span>
        </div>
      ) : (
        <>{type === 'login' ? 'Sign in' : 'Create account'}</>
      )}
    </Button>
  );
};

export default AuthButton;
