import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './../styles/Teams.css';

interface Profile {
  id: string;
  full_name: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMembersAdded: () => void;
  teamId: string;
  teamName: string;
  currentMembers: string[];
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onMembersAdded, teamId, teamName, currentMembers }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch all user profiles that are not already members of this team
      const fetchProfiles = async () => {
        if (!supabase) return;
        const { data, error } = await supabase.from('profiles').select('id, full_name');

        if (error) {
          console.error("Error fetching profiles:", error);
          setError("Could not load users.");
        } else {
          // Filter out users who are already in the team
          const availableProfiles = data?.filter(p => !currentMembers.includes(p.id)) || [];
          setProfiles(availableProfiles);
        }
      };
      fetchProfiles();
    }
  }, [isOpen, currentMembers]);

  const handleAddMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length === 0) {
      setError("Please select at least one member to add.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Supabase client is not initialized.");

      const membersToInsert = selectedMembers.map(userId => ({
        team_id: teamId,
        user_id: userId,
        role: 'member',
      }));

      const { error: membersError } = await supabase.from('team_members').insert(membersToInsert);

      if (membersError) throw membersError;

      onMembersAdded();
      onClose();

    } catch (err: any) {
      console.error("Error adding members:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Members to "{teamName}"</h2>
        <form onSubmit={handleAddMembers}>
          <div className="form-group">
            <label>Select New Members</label>
            {profiles.length > 0 ? (
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
            ) : (
                <p>No new users available to add to this team.</p>
            )}
            <small>Hold Ctrl/Cmd to select multiple members.</small>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="create-btn" disabled={isLoading || selectedMembers.length === 0}>
              {isLoading ? 'Adding...' : 'Add Members'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal; 