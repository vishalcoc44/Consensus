import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const JoinTeam: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Joining team...');

  useEffect(() => {
    const join = async () => {
      if (!teamId || !supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Redirect to sign in, then come back
        navigate(`/signin`);
        return;
      }
      const { data, error } = await supabase.functions.invoke('join-team', {
        body: { team_id: teamId },
      });
      if (error || data?.error) {
        setMessage(data?.error || error?.message || 'Failed to join team');
        return;
      }
      setMessage('Successfully joined the team! Redirecting...');
      setTimeout(() => navigate(`/team/${teamId}`), 1200);
    };
    join();
  }, [teamId, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <h1 className="auth-title">Join Team</h1>
          <p className="auth-subtitle">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default JoinTeam; 