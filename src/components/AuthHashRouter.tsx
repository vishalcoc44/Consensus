import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthHashRouter = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash || '';
    // Supabase appends tokens like #access_token=...&type=recovery
    const looksLikeRecovery = hash.includes('type=recovery') || hash.includes('access_token');
    if (looksLikeRecovery && location.pathname !== '/reset-password') {
      navigate(`/reset-password${hash}`, { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
};

export default AuthHashRouter; 