import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './../styles/TeamDetails.css';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface TeamDetailsData {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
}

const TeamDetails = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    const fetchTeamDetails = async () => {
      console.log('Fetching team details...'); // Force cache invalidation
      if (!teamId || !supabase) return;

      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw new Error("Could not authenticate user.");
        }
        const currentUserId = userData.user.id;

        const { data, error } = await supabase
          .from('teams')
          .select(`
            id,
            name,
            description,
            team_members (
              role,
              profiles (
                id,
                full_name,
                email
              )
            )
          `)
          .eq('id', teamId)
          .single();

        if (error) throw error;
        
        if (data) {
          const formattedData = {
            id: data.id,
            name: data.name,
            description: data.description,
            members: data.team_members.map((m: any) => ({
                ...m.profiles,
                role: m.role
            }))
          };
          setTeam(formattedData);

          const currentUserMember = formattedData.members.find(m => m.id === currentUserId);
          setCurrentUserRole(currentUserMember ? currentUserMember.role : null);
        }

      } catch (err: any) {
        console.error("Error fetching team details:", err);
        setError(err.message || "Could not load team details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !teamId || !supabase) return;

    try {
        // Note: Supabase handles the invitation flow. 
        // You need to configure the email template in your Supabase project settings.
        const { error } = await supabase.auth.admin.inviteUserByEmail(newMemberEmail, {
            data: { team_id: teamId } // Pass team_id in metadata
        });

        if (error) throw error;
        alert('Invitation sent successfully!');
        setNewMemberEmail('');
    } catch (err: any) {
        console.error("Error inviting member:", err);
        setError(err.message || 'Failed to send invitation.');
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!teamId || !supabase) return;

    try {
        const { error } = await supabase
            .from('team_members')
            .update({ role: newRole })
            .eq('team_id', teamId)
            .eq('user_id', memberId);

        if (error) throw error;

        setTeam(prevTeam => {
            if (!prevTeam) return null;
            return {
                ...prevTeam,
                members: prevTeam.members.map(m => m.id === memberId ? { ...m, role: newRole } : m)
            };
        });

    } catch (err: any) {
        console.error("Error updating role:", err);
        setError(err.message || "Failed to update member's role.");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!teamId || !supabase) return;

    if (window.confirm("Are you sure you want to remove this member?")) {
        try {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('team_id', teamId)
                .eq('user_id', memberId);
            
            if (error) throw error;

            setTeam(prevTeam => {
                if (!prevTeam) return null;
                return {
                    ...prevTeam,
                    members: prevTeam.members.filter(m => m.id !== memberId)
                };
            });

        } catch (err: any) {
            console.error("Error removing member:", err);
            setError(err.message || "Failed to remove member.");
        }
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamId || !supabase) return;

    if (window.confirm(`Are you sure you want to delete the team "${team?.name}"? This action cannot be undone.`)) {
        try {
            const { error } = await supabase.from('teams').delete().eq('id', teamId);
            if (error) throw error;
            navigate('/teams');
        } catch (err: any) {
            console.error("Error deleting team:", err);
            setError(err.message || "Failed to delete the team.");
        }
    }
  };

  if (loading) return <div>Loading team details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!team) return <div>Team not found.</div>;

  const isAdmin = currentUserRole === 'Admin';

  return (
    <div className="team-details-container">
      <div className="team-details-header">
        <h1>{team.name}</h1>
        <button className="delete-team-btn" onClick={handleDeleteTeam}>Delete Team</button>
      </div>
      <p className="team-description">{team.description}</p>
      
      {isAdmin && (
        <div className="invite-member-section">
            <h3>Invite New Member</h3>
            <form onSubmit={handleInviteMember} className="invite-form">
                <input 
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter email to invite"
                    required
                />
                <button type="submit">Send Invite</button>
            </form>
        </div>
      )}

      <div className="members-section">
        <h2>Members ({team.members.length})</h2>
        <ul className="members-list">
          {team.members.map(member => (
            <li key={member.id} className="member-item">
              <div className="member-avatar" title={member.full_name}>
                {member.full_name.charAt(0)}
              </div>
              <div className="member-info">
                <span className="member-name">{member.full_name}</span>
                <span className="member-email">{member.email}</span>
              </div>
              {isAdmin ? (
                <div className="member-actions">
                    <select 
                        value={member.role} 
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="role-select"
                    >
                        <option value="Admin">Admin</option>
                        <option value="Member">Member</option>
                    </select>
                    <button onClick={() => handleRemoveMember(member.id)} className="remove-member-btn">
                        Remove
                    </button>
                </div>
              ) : (
                <span className="member-role">{member.role}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeamDetails; 