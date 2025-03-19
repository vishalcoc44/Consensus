
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface AuthHeaderProps {
  type: 'login' | 'register';
}

const AuthHeader = ({ type }: AuthHeaderProps) => {
  return (
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
  );
};

export default AuthHeader;
