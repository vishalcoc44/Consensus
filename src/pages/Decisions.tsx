import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './../styles/Decisions.css';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import CreateDecisionModal from './../components/CreateDecisionModal';

interface Decision {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  team_id: string; // Keep track of team_id for delete policy
  teams: { name: string } | null;
  decision_options: { option_text: string }[]; // Add this
  decision_criteria: { criterion_text: string, weight: number }[]; // Add this
}

const Decisions = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchDecisions = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('decisions')
        .select(`
          id,
          title,
          description,
          status,
          deadline,
          team_id,
          teams ( name ),
          decision_options ( option_text ),
          decision_criteria ( criterion_text, weight )
        `);

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      // Apply status filter
      if (filterStatus !== 'All') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedData = data.map((d: any) => ({
          ...d,
          teams: Array.isArray(d.teams) ? d.teams[0] : d.teams
        }));
        setDecisions(formattedData);
      } else {
        setDecisions([]);
      }
    } catch (err: any) {
      console.error("Error fetching decisions:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const handleDelete = async (decisionId: string) => {
    if (!supabase) return;
    if (window.confirm('Are you sure you want to delete this decision?')) {
      try {
        const { error } = await supabase.from('decisions').delete().eq('id', decisionId);
        if (error) throw error;
        // Refresh the list after deletion
        fetchDecisions();
      } catch (err: any) {
        console.error("Error deleting decision:", err);
        setError(`Failed to delete decision: ${err.message}`);
      }
    }
  };

  return (
    <div className="decisions-container">
      <div className="decisions-header">
        <h1>Decision Management</h1>
        <p>View and manage all your organization's decisions</p>
      </div>

      <div className="decisions-toolbar">
        <div className="search-bar">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search decisions by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <FiFilter />
          <select 
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <button className="new-decision-btn" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> New Decision
        </button>
      </div>

      <div className="decisions-content">
        {loading && <p>Loading decisions...</p>}
        {error && <div className="error-message">Error Loading Decisions<br/>{error}</div>}
        {!loading && !error && decisions.length === 0 && (
          <div className="no-decisions-placeholder">
            <p>No decisions yet. Use the "New Decision" button to create one.</p>
          </div>
        )}
        {!loading && !error && decisions.length > 0 && (
          <div className="decisions-grid">
            {decisions.map(decision => (
              <Link to={`/decision/${decision.id}`} key={decision.id} className="decision-card-link">
                <div className="decision-card">
                  <div className="decision-card-header">
                    <h3>{decision.title}</h3>
                    <span className={`status-badge status-${decision.status.toLowerCase()}`}>{decision.status}</span>
                  </div>
                  <p className="decision-card-team">{decision.teams?.name || 'No Team'}</p>
                  <p className="decision-card-description">{decision.description}</p>
                  
                  <div className="decision-card-details">
                    <div className="card-options">
                      <h4>Options</h4>
                      <ul>
                        {decision.decision_options.map((opt, i) => <li key={i}>{opt.option_text}</li>)}
                      </ul>
                    </div>
                    <div className="card-criteria">
                      <h4>Criteria</h4>
                      <ul>
                        {decision.decision_criteria.map((crit, i) => (
                          <li key={i}>
                            {crit.criterion_text} <span>(Weight: {crit.weight})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="decision-card-footer">
                    <span>Deadline: {new Date(decision.deadline).toLocaleDateString()}</span>
                    <button onClick={(e) => { e.preventDefault(); handleDelete(decision.id); }} className="delete-decision-btn">Delete</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateDecisionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDecisionCreated={() => {
          setIsModalOpen(false);
          fetchDecisions();
        }}
      />
    </div>
  );
};

export default Decisions; 