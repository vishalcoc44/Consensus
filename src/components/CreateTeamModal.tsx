import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './../styles/Teams.css';

interface Profile {
  id: string;
  full_name: string;
}

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose, onTeamCreated }) => {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!supabase) return;
      const { data, error } = await supabase.from('profiles').select('id, full_name');
      if (error) {
        console.error("Error fetching profiles:", error);
        setError("Could not load users.");
      } else {
        setProfiles(data || []);
      }
    };

    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setError("Supabase is not initialized.");
      return;
    }

    if (!teamName || selectedMembers.length === 0) {
      setError('Please provide a team name and at least one member.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to create a team.");
      }

      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          description: teamDescription,
          created_by: user.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      const membersToInsert = [
        ...new Set([user.id, ...selectedMembers])
      ].map(userId => ({
        team_id: newTeam.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member',
      }));

      const { error: membersError } = await supabase.from('team_members').insert(membersToInsert);

      if (membersError) throw membersError;

      onTeamCreated();
      onClose();
      
    } catch (err: any) {
      console.error("Error in team creation process:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create a New Team</h2>
        <form onSubmit={handleCreateTeam}>
          <div className="form-group">
            <label htmlFor="team-name">Team Name</label>
            <input
              id="team-name"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="team-description">Team Description</label>
            <textarea
              id="team-description"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Add Members</label>
            <select
              multiple
              value={selectedMembers}
              onChange={(e) => setSelectedMembers(Array.from(e.target.selectedOptions, option => option.value))}
              className="form-multiselect"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
            <small>Hold Ctrl/Cmd to select multiple members.</small>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="create-btn" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal; 