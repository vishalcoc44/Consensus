import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  joined_at: string;
  profile?: {
    id: string;
    full_name: string | null;
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
  pendingInvites?: any[];
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [myInvites, setMyInvites] = useState<any[]>([]);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user || !user.email) {
        setTeams([]);
        setMyInvites([]);
        setLoading(false);
        return;
      }

      // 0. Fetch invites sent to current user
      const { data: myInvitesData, error: myInvitesError } = await supabase
        .from('team_invites')
        .select(`
          *,
          team:teams (
            id,
            name,
            description
          ),
          inviter:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('email', user.email)
        .eq('status', 'pending');

      if (!myInvitesError) {
        setMyInvites(myInvitesData || []);
      }

      // Fetch teams where the user is a member
      const { data: memberTeams, error: memberError } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams:team_id (
            id,
            name,
            description,
            created_at,
            created_by
          )
        `)
        .eq('user_id', user.id);

      if (memberError) {
        throw memberError;
      }

      if (!memberTeams || memberTeams.length === 0) {
        setTeams([]);
        return;
      }

      // Extract unique team IDs
      const teamIds = memberTeams.map(mt => mt.team_id);

      // Fetch full details for these teams including all members and their profiles
      // Using Promise.all to fetch members and invites in parallel for better Control/Granularity

      const teamsWithDetails = await Promise.all(teamIds.map(async (teamId) => {
        // Get Team Info (we have it from memberTeams but need to match ID, easier to just re-fetch or find from array. 
        // Actually best to query 'teams' list with IDs as before, but then we need to iterate that list.
        // Let's keep the single query for teams if possible? 
        // No, to fetch invites per team efficiently we might want to just do one big query or parallel queries.
        // Let's stick to the previous pattern of fetching teams first, then enriching them.

        // Let's fetch the base team data for all IDs first (as before) to ensure we have valid objects
        // inner logic changed to mapping
      }));

      // Re-implementing:
      // 1. Get Team Data & Members
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            id,
            user_id,
            team_id,
            role,
            joined_at,
            profile:profiles(
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      // 2. Fetch Invites for these teams
      const { data: invitesData, error: invitesError } = await supabase
        .from('team_invites')
        .select('*')
        .in('team_id', teamIds)
        .eq('status', 'pending');

      if (invitesError) console.error("Error fetching invites:", invitesError);

      // 3. Merge data
      const formattedTeams: Team[] = (teamsData || []).map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        created_at: team.created_at,
        created_by: team.created_by,
        members: (team.members || []).map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          team_id: m.team_id,
          role: m.role,
          joined_at: m.joined_at,
          profile: m.profile
        })),
        pendingInvites: (invitesData || []).filter(invite => invite.team_id === team.id)
      }));

      setTeams(formattedTeams);
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
  }, [toast]);

  const createTeam = async (name: string, description: string) => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // 1. Create the team
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          created_by: user.id
        })
        .select()
        .single();

      if (teamError) throw teamError;
      if (!newTeam) throw new Error("Failed to create team");

      // 2. The database trigger 'add_creator_as_admin' automatically adds the creator as admin.
      // We don't need to manually insert into team_members here.

      // Wait a brief moment for the trigger to complete (optional but safer for immediate fetch)
      // await new Promise(resolve => setTimeout(resolve, 500)); 
      // Actually usually it's same transaction or fast enough. Let's just create and fetch.

      await fetchTeams();

      toast({
        title: "Team created",
        description: `Team "${name}" has been created successfully`,
      });

      // Return a temporary partial team object locally if needed, 
      // but fetchTeams update is better source of truth
      return newTeam;
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

      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role
        });

      if (error) throw error;

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

  const removeTeamMember = async (teamId: string, userId: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('team_members')
        .delete()
        .match({ team_id: teamId, user_id: userId });

      if (error) throw error;

      await fetchTeams();

      toast({
        title: "Team member removed",
        description: "The team member has been successfully removed.",
      });

      return true;
    } catch (err) {
      console.error("Error in removeTeamMember:", err);
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Error removing team member",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateTeam = async (teamId: string, updates: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId);

      if (error) throw error;

      toast({
        title: "Team updated",
        description: "Team settings have been saved successfully.",
      });

      await fetchTeams();
      return true;
    } catch (err) {
      console.error("Error updating team:", err);
      toast({
        title: "Error updating team",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const leaveTeam = async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      return await removeTeamMember(teamId, user.id);
    } catch (err) {
      console.error("Error in leaveTeam:", err);
      return false;
    }
  };

  const acceptInvite = async (invite: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Update invite status
      const { error: updateError } = await supabase
        .from('team_invites')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      if (updateError) throw updateError;

      // 2. Add to team members
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: invite.team_id,
          user_id: user.id,
          role: invite.role,
          joined_at: new Date().toISOString()
        });

      if (memberError) throw memberError;

      toast({
        title: "Welcome to the team!",
        description: `You have joined ${invite.team?.name || 'the team'}.`,
      });

      await fetchTeams();
      return true;
    } catch (err) {
      console.error("Error accepting invite:", err);
      toast({
        title: "Error accepting invitation",
        description: "Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const declineInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('team_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: "Invitation declined",
        description: "You have declined the invitation.",
      });

      await fetchTeams(); // Refresh to remove from list
      return true;
    } catch (err) {
      console.error("Error declining invite:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    myInvites,
    loading,
    error,
    refreshTeams: fetchTeams,
    createTeam,
    addTeamMember,
    removeTeamMember,
    updateTeam,
    leaveTeam,
    acceptInvite,
    declineInvite
  };
}
