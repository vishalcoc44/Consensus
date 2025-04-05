import { useState, useEffect } from 'react';
import { typedSupabase, extractProfileData } from '@/utils/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import ErrorDisplay from '@/components/auth/components/ErrorDisplay';

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
  members: TeamMember[];
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching teams...");
      
      // Get the current user's session
      const { data: { session } } = await typedSupabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found");
        toast({
          title: "Authentication required",
          description: "Please sign in to view your teams",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      // Use simple query to avoid recursion issues
      const { data: teamsData, error: teamsError } = await typedSupabase
        .from('teams')
        .select('*');
        
      if (teamsError) {
        console.error("Error fetching teams data:", teamsError);
        throw teamsError;
      }
      
      if (!teamsData || teamsData.length === 0) {
        console.log("No teams found");
        setTeams([]);
        setLoading(false);
        return;
      }
      
      console.log("Found teams:", teamsData);
      
      // Get all members for these teams
      const teamIds = teamsData.map(team => team.id);
      
      // Use a separate query for members to avoid recursion
      const { data: allMembers, error: membersError } = await typedSupabase
        .from('team_members')
        .select(`
          id, user_id, team_id, role,
          profiles:user_id(id, full_name, avatar_url)
        `)
        .in('team_id', teamIds);
        
      if (membersError) {
        console.error("Error fetching team members:", membersError);
        throw membersError;
      }
      
      // Group members by team
      const membersByTeam: Record<string, TeamMember[]> = {};
      
      allMembers?.forEach(member => {
        if (!membersByTeam[member.team_id]) {
          membersByTeam[member.team_id] = [];
        }
        
        const profileData = extractProfileData(member.profiles);
        
        membersByTeam[member.team_id].push({
          id: member.id,
          user_id: member.user_id,
          team_id: member.team_id,
          role: member.role,
          profile: profileData ? {
            id: profileData.id,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url
          } : null
        });
      });
      
      // Combine teams with their members
      const teamsWithMembers = teamsData.map(team => ({
        ...team,
        members: membersByTeam[team.id] || []
      }));
      
      console.log("Fetched teams with members:", teamsWithMembers);
      setTeams(teamsWithMembers);
    } catch (err) {
      console.error("Error in fetchTeams:", err);
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error fetching teams",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string, description: string) => {
    try {
      setError(null);
      
      // Get the current user's session
      const { data: { session } } = await typedSupabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a team",
          variant: "destructive"
        });
        return null;
      }
      
      // Create the team
      const { data: team, error: teamError } = await typedSupabase
        .from('teams')
        .insert({
          name,
          description,
          created_by: session.user.id
        })
        .select()
        .single();
        
      if (teamError) {
        console.error("Error creating team:", teamError);
        throw teamError;
      }
      
      if (!team) {
        throw new Error("Team created but no data returned");
      }
      
      // Add the creator as an admin
      const { error: memberError } = await typedSupabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: session.user.id,
          role: 'Admin'
        });
        
      if (memberError) {
        console.error("Error adding creator as admin:", memberError);
        throw memberError;
      }
      
      // Refresh teams
      await fetchTeams();
      
      toast({
        title: "Team created",
        description: `Team "${name}" has been created successfully`,
      });
      
      return team;
    } catch (err) {
      console.error("Error in createTeam:", err);
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error creating team",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
      return null;
    }
  };

  const addTeamMember = async (teamId: string, userId: string, role: string) => {
    try {
      setError(null);
      
      console.log(`Adding team member with ID ${userId} to team ${teamId} with role ${role}`);
      
      // Add the team member
      const { error: memberError } = await typedSupabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: role,
          joined_at: new Date().toISOString()
        });
        
      if (memberError) {
        console.error("Error adding team member:", memberError);
        throw memberError;
      }
      
      console.log("Team member added successfully");
      
      // Refresh teams
      await fetchTeams();
      
      toast({
        title: "Team member added",
        description: "The team member has been added successfully",
      });
      
      return true;
    } catch (err) {
      console.error("Error in addTeamMember:", err);
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error adding team member",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    refreshTeams: fetchTeams,
    createTeam,
    addTeamMember
  };
}
