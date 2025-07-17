import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiHelpCircle, FiPlus } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import { FiUsers, FiTrendingUp } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';

interface Decision {
  id: string;
  title: string;
  description: string;
  deadline: string;
}

const Dashboard = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionDescription, setNewDecisionDescription] = useState('');
  const [newDecisionDeadline, setNewDecisionDeadline] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found.");
        setUserId(user.id);

        // Fetch user's teams
        const { data: teamMembersData, error: teamMembersError } = await supabase
          .from('team_members')
          .select('teams(*)')
          .eq('user_id', user.id);

        if (teamMembersError) throw teamMembersError;

        if (teamMembersData) {
          const userTeams = teamMembersData.map((tm: { teams: any }) => tm.teams).filter(Boolean);
          setTeams(userTeams);
        }
        
        // Fetch decisions (RLS will filter to user's teams)
        const { data: decisionsData, error: decisionsError } = await supabase
          .from('decisions')
          .select('*');

        if (decisionsError) throw decisionsError;

        if (decisionsData) {
          setDecisions(decisionsData);
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTeams = async (supabaseClient: any) => {
      const { data, error } = await supabaseClient
        .from('teams')
        .select('id, name')
        .eq('created_by', userId);
      if (error) console.error('Error fetching teams', error);
      else setTeams(data);
    };

    const fetchDecisions = async (supabaseClient: any) => {
      const { data, error } = await supabaseClient
        .from('decisions')
        .select('id, title, status')
        .eq('created_by', userId)
        .limit(5);
      if (error) console.error('Error fetching decisions', error);
      else setDecisions(data);
    };

    if (userId && supabase) {
      fetchTeams(supabase);
      fetchDecisions(supabase);
    }
  }, [userId]);

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      console.error("Supabase client not initialized.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      if (teams.length === 0) {
          alert("You must be part of a team to create a decision.");
          return;
      }
      // Using the first team for now. A better approach would be to let the user select a team.
      const teamId = teams[0].id;

      try {
        const { data, error } = await supabase
          .from('decisions')
          .insert([
            {
              title: newDecisionTitle,
              description: newDecisionDescription,
              deadline: newDecisionDeadline,
              team_id: teamId,
              created_by: user.id,
            },
          ])
          .select();

        if (error) throw error;

        if (data) {
          setDecisions([...decisions, ...data]);
        }
        
        setShowModal(false);
        setNewDecisionTitle('');
        setNewDecisionDescription('');
        setNewDecisionDeadline('');

      } catch (error: any) {
        console.error('Error creating decision:', error.message);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <>
      <header className="main-header">
        <div className="search-bar">
          <FiSearch />
          <input type="text" placeholder="Search..." />
        </div>
        <div className="header-actions">
          <button><FiBell /></button>
          <button><FiHelpCircle /></button>
        </div>
      </header>
      <section className="welcome-section">
        <h1>Welcome back</h1>
        <p>Here's an overview of your organization's decision-making activities</p>
      </section>
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Active Decisions</span>
            <FaBrain />
          </div>
          <div className="stat-value">{decisions.length}</div>
          <div className="stat-change">+0 from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Team Members</span>
            <FiUsers />
          </div>
          <div className="stat-value">{teams.reduce((acc, team) => acc + (team.team_members?.length || 0), 0)}</div>
          <div className="stat-change">+0 new this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Avg. Consensus</span>
            <FiTrendingUp />
          </div>
          <div className="stat-value">0%</div>
          <div className="stat-change">+5% improvement</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <span>Decision Velocity</span>
            <FiTrendingUp />
          </div>
          <div className="stat-value">4.2 days</div>
          <div className="stat-change">-1.3 days faster</div>
        </div>
      </section>
      <section className="active-decisions">
        <div className="section-header">
          <h2>Active Decisions</h2>
          <button className="new-decision-btn" onClick={() => setShowModal(true)}><FiPlus /> New Decision</button>
        </div>
        {decisions.length > 0 ? (
          <ul className="decision-list">
            {decisions.map(decision => (
              <li key={decision.id} className="decision-item">
                <h3>{decision.title}</h3>
                <p>{decision.description}</p>
                <span>Deadline: {new Date(decision.deadline).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-decisions">
            <p>No active decisions. Create one to get started!</p>
          </div>
        )}
      </section>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>New Decision</h2>
            <form onSubmit={handleCreateDecision}>
              <div className="form-group">
                <label htmlFor="decision-title">Title</label>
                <input
                  id="decision-title"
                  type="text"
                  value={newDecisionTitle}
                  onChange={(e) => setNewDecisionTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="decision-description">Description</label>
                <textarea
                  id="decision-description"
                  value={newDecisionDescription}
                  onChange={(e) => setNewDecisionDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="decision-deadline">Deadline</label>
                <input
                  id="decision-deadline"
                  type="date"
                  value={newDecisionDeadline}
                  onChange={(e) => setNewDecisionDeadline(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="create-btn">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard; 