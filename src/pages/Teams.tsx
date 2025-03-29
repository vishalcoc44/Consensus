
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus } from 'lucide-react';
import TeamMemberCard from '@/components/teams/TeamMemberCard';
import AddTeamMemberDialog from '@/components/teams/AddTeamMemberDialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

// Type definition for team member
interface TeamMember {
  id: number | string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  dateAdded: string;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const Teams = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = 'Team Management - ConsensusAI';
    
    // Fetch teams and team members
    fetchTeamsAndMembers();
  }, []);
  
  const fetchTeamsAndMembers = async () => {
    setLoading(true);
    try {
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*');
        
      if (teamsError) throw teamsError;
      
      if (teamsData && teamsData.length > 0) {
        setTeams(teamsData);
        setCurrentTeam(teamsData[0]);
        
        // Fetch team members for the first team
        await fetchTeamMembers(teamsData[0].id);
      } else {
        try {
          // Create a default team if none exists
          const { data: newTeam, error: createError } = await supabase
            .from('teams')
            .insert({ name: 'Default Team', description: 'Your organization\'s default team' })
            .select()
            .single();
            
          if (createError) throw createError;
          
          if (newTeam) {
            setTeams([newTeam]);
            setCurrentTeam(newTeam);
            setTeamMembers([]);
          } else {
            throw new Error('Failed to create default team');
          }
        } catch (createTeamError) {
          console.error('Error creating default team:', createTeamError);
          toast({
            title: 'Error creating team',
            description: 'Could not create a default team. Please try again later.',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error fetching teams',
        description: 'Could not load your teams. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          joined_at,
          user_id,
          profiles:user_id(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId);
        
      if (error) throw error;
      
      if (data) {
        const formattedMembers: TeamMember[] = data.map((member) => {
          // Handle profile data - it might be an array or an object
          let profile: Profile | null = null;
          
          if (member.profiles) {
            if (Array.isArray(member.profiles)) {
              profile = member.profiles[0] as Profile;
            } else {
              profile = member.profiles as unknown as Profile;
            }
          }
          
          return {
            id: member.id,
            name: profile?.full_name || 'Unknown',
            email: `user-${member.user_id.substring(0, 8)}@example.com`, // Placeholder
            role: member.role,
            avatar: profile?.avatar_url || `https://i.pravatar.cc/150?u=${member.user_id}`,
            dateAdded: new Date(member.joined_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })
          };
        });
        
        setTeamMembers(formattedMembers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error fetching team members',
        description: 'Could not load team members. Please try again later.',
        variant: 'destructive'
      });
    }
  };

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
    // The actual database insertion is now handled in the AddTeamMemberDialog component
    // Here we just update the UI
    const newMember: TeamMember = {
      id: Date.now(), // Temporary ID for UI purposes
      name,
      email,
      role,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    
    // Add the new member to the list
    setTeamMembers([...teamMembers, newMember]);
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
            <CardTitle className="text-xl">Inactive Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-consensus-grey-600">No inactive members</p>
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
