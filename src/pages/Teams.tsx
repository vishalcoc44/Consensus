import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './../styles/Teams.css';
import CreateTeamModal from './../components/CreateTeamModal';
import AddMemberModal from './../components/AddMemberModal';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
}
interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
}

const Teams = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const fetchTeams = async () => {
    if (!supabase) {
      setError("Supabase client is not initialized.");
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/signin');
      return;
    }

    try {
      // Step 1: Get the team IDs the user is a member of
      const { data: teamIdsData, error: teamIdsError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', session.user.id);

      if (teamIdsError) throw teamIdsError;

      const teamIds = teamIdsData.map(item => item.team_id);

      if (teamIds.length === 0) {
        setTeams([]);
        setLoading(false);
        return;
      }

      // Step 2: Fetch the teams and their members using the retrieved IDs
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          team_members (
            user_id,
            profiles (
              full_name,
              email
            )
          )
        `)
        .in('id', teamIds);
      
      if (teamsError) throw teamsError;

      if (teamsData) {
        const formattedTeams = teamsData.map(team => ({
          ...team,
          members: team.team_members.map((m: any) => m.profiles).filter(Boolean),
        }));
        setTeams(formattedTeams);
      } else {
        setTeams([]);
      }

    } catch (err: any) {
      console.error("Error loading teams:", err);
      setError(`Error loading teams: ${err.message || JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [navigate]);

  const handleOpenAddMemberModal = (team: Team) => {
    setSelectedTeam(team);
    setIsAddMemberModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsAddMemberModalOpen(false);
    setSelectedTeam(null);
  };

  const handleTeamDataChanged = () => {
    handleCloseModals();
    fetchTeams(); // Re-fetch all data
  }

  if (loading) {
    return <div>Loading teams...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="teams-container">
      <header className="teams-header">
        <h1>Teams</h1>
        <button className="create-team-btn" onClick={() => setIsCreateModalOpen(true)}>Create Team</button>
      </header>
      <div className="teams-list">
        {teams.map(team => (
          <div key={team.id} className="team-card clickable" onClick={() => navigate(`/team/${team.id}`)}>
            <div className="team-card-header">
              <h2>{team.name}</h2>
              <button className="add-member-btn" onClick={(e) => { e.stopPropagation(); handleOpenAddMemberModal(team); }}>+ Add Member</button>
            </div>
            <div className="team-card-body">
              <p>{team.description}</p>
            </div>
            <div className="team-card-footer">
              <h3>Members ({team.members.length})</h3>
              <div className="team-members">
                {team.members.map((member) => (
                  <div key={member.email} className="team-member-avatar" title={`${member.full_name} (${member.email})`}>
                    {member.full_name.charAt(0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onTeamCreated={handleTeamDataChanged}
      />

      {selectedTeam && (
        <AddMemberModal
            isOpen={isAddMemberModalOpen}
            onClose={handleCloseModals}
            onMembersAdded={handleTeamDataChanged}
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            currentMembers={selectedTeam.members.map(m => m.id)}
        />
      )}
    </div>
  );
};

export default Teams; 