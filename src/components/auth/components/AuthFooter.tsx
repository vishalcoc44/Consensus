
import { Link } from 'react-router-dom';

interface AuthFooterProps {
  type: 'login' | 'register';
}

const AuthFooter = ({ type }: AuthFooterProps) => {
  return (
    <div className="mt-8 text-center">
      <p className="text-consensus-grey-400">
        {type === 'login' 
          ? "Don't have an account? " 
          : "Already have an account? "}
        <Link 
          to={type === 'login' ? '/register' : '/login'} 
          className="text-consensus-green hover:text-consensus-teal transition-colors font-medium hover:underline"
        >
          {type === 'login' ? 'Sign up' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
};

export default AuthFooter;
