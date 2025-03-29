
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';
import TeamMemberCard from '@/components/teams/TeamMemberCard';
import AddTeamMemberDialog from '@/components/teams/AddTeamMemberDialog';
import { useToast } from '@/components/ui/use-toast';
import { typedSupabase } from "@/utils/supabaseClient";
import { useTeams } from '@/hooks/useTeams';

// Type definition for team member
interface TeamMember {
  id: number | string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  dateAdded: string;
}

const Teams = () => {
  const { teams, loading, error, refreshTeams } = useTeams();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentTeam, setCurrentTeam] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = 'Team Management - ConsensusAI';
    
    // No need for additional fetching as useTeams hook handles it
  }, []);
  
  useEffect(() => {
    // When teams data is loaded, set the current team and its members
    if (teams.length > 0) {
      setCurrentTeam(teams[0]);
      
      // Format team members for display
      const formattedMembers = teams[0].members.map(member => ({
        id: member.id,
        name: member.profile?.full_name || 'Unknown',
        email: `user-${member.user_id.substring(0, 8)}@example.com`, // Placeholder
        role: member.role,
        avatar: member.profile?.avatar_url || `https://i.pravatar.cc/150?u=${member.user_id}`,
        dateAdded: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      }));
      
      setTeamMembers(formattedMembers);
    }
  }, [teams]);

  // Function to calculate role statistics
  const calculateRoleStats = () => {
    const stats = {
      admin: 0,
      proposer: 0,
      contributor: 0,
    };
    
    teamMembers.forEach(member => {
      if (member.role.toLowerCase() === 'admin') stats.admin++;
      if (member.role.toLowerCase() === 'proposer') stats.proposer++;
      if (member.role.toLowerCase() === 'contributor') stats.contributor++;
    });
    
    return stats;
  };
  
  const roleStats = calculateRoleStats();
  
  // Function to add a new team member
  const handleAddTeamMember = (email: string, name: string, role: string) => {
    // This is now a UI-only function as the actual database interaction
    // happens in the AddTeamMemberDialog component
    refreshTeams(); // Refresh teams data after a new member is added
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-consensus-blue"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-500 border border-dashed border-red-300 rounded-lg">
          Error loading teams: {error}
        </div>
      </DashboardLayout>
    );
  }

  if (teams.length === 0) {
    return (
      <DashboardLayout>
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-sf font-bold mb-2">Team Management</h1>
          <p className="text-consensus-grey-600">You don't have any teams yet</p>
        </div>
        <div className="p-8 text-center text-consensus-grey-500 border border-dashed border-consensus-grey-300 rounded-lg">
          No teams found. Please create a team to get started.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2">Team Management</h1>
        <p className="text-consensus-grey-600">
          {currentTeam ? `Manage "${currentTeam.name}" team members and their roles` : 'Manage your organization\'s team members and their roles'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{teamMembers.length}</p>
                <p className="text-sm text-consensus-grey-600">Total members</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in animate-delay-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Admins</span>
                <span className="text-sm font-medium">{roleStats.admin}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500" 
                  style={{ width: `${teamMembers.length ? (roleStats.admin / teamMembers.length) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Proposers</span>
                <span className="text-sm font-medium">{roleStats.proposer}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${teamMembers.length ? (roleStats.proposer / teamMembers.length) * 100 : 0}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Contributors</span>
                <span className="text-sm font-medium">{roleStats.contributor}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${teamMembers.length ? (roleStats.contributor / teamMembers.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in animate-delay-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Team Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-consensus-grey-600">Add new team members</p>
              </div>
              <AddTeamMemberDialog 
                onAddMember={handleAddTeamMember}
                teamId={currentTeam?.id}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6 animate-fade-in animate-delay-3">
        <h2 className="text-xl font-sf font-bold">All Team Members</h2>
        <AddTeamMemberDialog 
          onAddMember={handleAddTeamMember}
          teamId={currentTeam?.id}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 animate-fade-in animate-delay-3">
        {teamMembers.length === 0 ? (
          <div className="p-8 text-center text-consensus-grey-500 border border-dashed border-consensus-grey-300 rounded-lg">
            No team members yet. Add your first team member to get started.
          </div>
        ) : (
          teamMembers.map((member) => (
            <TeamMemberCard
              key={String(member.id)}
              name={member.name}
              email={member.email}
              role={member.role}
              avatar={member.avatar}
              dateAdded={member.dateAdded}
            />
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Teams;
