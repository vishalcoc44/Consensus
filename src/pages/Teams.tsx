
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Bell } from 'lucide-react';
import TeamMemberCard from '@/components/teams/TeamMemberCard';
import AddTeamMemberDialog from '@/components/teams/AddTeamMemberDialog';
import { useToast } from '@/components/ui/use-toast';
import { useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useTeam } from '@/contexts/TeamContext';
import CreateTeamDialog from '@/components/teams/CreateTeamDialog';
import EditTeamDialog from '@/components/teams/EditTeamDialog';
import { Globe, MapPin, Twitter, Github, Tag, Trash2, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,

} from "@/components/ui/select";
import ShimmerText from '@/components/ui/effects/ShimmerText';
import PageTransition from '@/components/animations/PageTransition';


const ensureAbsoluteUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

// Type definition for team member
interface TeamMember {
  id: number | string;
  user_id: string; // Added for removal logic
  name: string;
  email: string;
  role: string;
  avatar: string;
  dateAdded: string;
}

const Teams = () => {
  const {
    teams,
    currentTeam,
    setCurrentTeam,
    myInvites,
    isLoading: loading,
    error,
    refreshTeams,
    removeTeamMember,
    acceptInvite,
    declineInvite
  } = useTeam();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  // Local currentTeam state removed - using context
  const [showMembers, setShowMembers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = 'Team Management - ConsensusAI';

    // No need for additional fetching as useTeams hook handles it
  }, []);

  useEffect(() => {
    // When currentTeam updates (handled by context), update members list
    if (currentTeam) {
      // Format team members for display
      const formattedMembers = (currentTeam.members || []).map(member => ({
        id: member.id,
        user_id: member.user_id,
        name: member.profile?.full_name || 'Unknown User',
        email: 'Email hidden',
        role: member.role || 'Member',
        avatar: member.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`,
        dateAdded: member.joined_at ? new Date(member.joined_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : 'Recent'
      }));

      setTeamMembers(formattedMembers);
    } else {
      setTeamMembers([]);
    }
  }, [currentTeam]);

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
    // Logic is handled in AddTeamMemberDialog, just refresh the list here
    refreshTeams();
  };

  const handleRemoveMember = async (memberUserId: string) => {
    if (!currentTeam) return;

    // In a real app you might want a confirmation dialog here
    await removeTeamMember(currentTeam.id, memberUserId);
  };

  const handleAcceptInvite = async (invite: any) => {
    await acceptInvite(invite);
  };

  const handleDeclineInvite = async (inviteId: string) => {
    await declineInvite(inviteId);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteTeam = async () => {
    if (!currentTeam) return;

    try {
      console.log(`Attempting to delete team ${currentTeam.id}...`);

      // 1. Delete Invites (Cascade manually)
      const { error: invitesError } = await supabase
        .from('team_invites')
        .delete()
        .eq('team_id', currentTeam.id);

      if (invitesError) {
        console.error("Error deleting team invites:", invitesError);
        // Continue anyway? Usually yes, or throw. Let's throw to be safe.
        // But if RLS prevents viewing invites, this might fail? 
        // Assuming Owner has access.
        throw new Error(`Failed to delete team invites: ${invitesError.message}`);
      }

      // 2. Delete Members (Cascade manually)
      // Note: This removes even the owner, so we should be careful. 
      // But we are deleting the team, so it's fine.
      const { error: membersError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', currentTeam.id);

      if (membersError) {
        console.error("Error deleting team members:", membersError);
        throw new Error(`Failed to delete team members: ${membersError.message}`);
      }

      // 3. Delete Team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', currentTeam.id);

      if (error) {
        // Check for specific FK error regarding proposals
        if (error.code === '23503' && error.details?.includes('proposals')) {
          throw new Error("Cannot delete team because it has active decisions/proposals. Please delete all decisions first.");
        }
        throw error;
      }

      toast({
        title: "Team deleted",
        description: "The team has been successfully deleted.",
      });

      setIsDeleteDialogOpen(false);
      // Reset current team and refresh
      setCurrentTeam(null);
      refreshTeams();
    } catch (error: any) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error deleting team",
        description: error.message || "Failed to delete team",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-7xl animate-fade-in">
        <PageTransition>
          <div className="p-8 text-center text-destructive border border-dashed border-destructive/50 rounded-lg">
            Error loading teams: {error}
          </div>
        </PageTransition>
      </div>
    );
  }

  // Determine what to show: My Invitations, or Teams view, or Empty state
  // Even if no teams, but invites exist, we should show invites.
  const showEmptyState = teams.length === 0 && (!myInvites || myInvites.length === 0);

  if (showEmptyState) {
    return (
      <div className="space-y-8 animate-fade-in pb-10">
        <PageTransition>
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-sf font-bold mb-2 text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <ShimmerText className="inline-block">Team Management</ShimmerText>
            </h1>
            <p className="text-muted-foreground">You don't have any teams yet</p>
          </div>
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-muted/30">
            <div className="mb-6">
              <UserPlus size={48} className="mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Join or create a team</h3>
              <p className="text-muted-foreground mb-6">You are not a member of any team yet.</p>
              <CreateTeamDialog>
                <button className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  Create a New Team
                </button>
              </CreateTeamDialog>
            </div>
            <p className="text-sm">Or wait for an invitation from an administrator.</p>
          </div>
        </PageTransition>
      </div>
    );
  }

  // If we have invites but no teams (or even if we have teams), show invites at the top
  // Guard: If currentTeam is null (e.g., teams loading or none selected), show a simple state
  if (!currentTeam) {
    return (
      <div className="space-y-6">
        <PageTransition>
          <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-sf font-bold mb-2 text-foreground flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <ShimmerText className="inline-block">Team Management</ShimmerText>
              </h1>
              <p className="text-muted-foreground">Select or create a team to get started</p>
            </div>
            <CreateTeamDialog />
          </div>
          {/* Show invites if any */}
          {myInvites && myInvites.length > 0 && (
            <div className="glass-panel p-6 rounded-xl border border-border mb-6 bg-card">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Your Invitations ({myInvites.length})
              </h2>
              <ul className="space-y-3">
                {myInvites.map((invite: any) => (
                  <li key={invite.id} className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                    <div>
                      <span className="font-medium text-foreground">{invite.team?.name || 'Unknown Team'}</span>
                      <span className="text-muted-foreground text-sm ml-2">as {invite.role}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptInvite(invite)} className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md font-medium hover:bg-primary/90">Accept</button>
                      <button onClick={() => handleDeclineInvite(invite.id)} className="px-3 py-1 bg-destructive/10 text-destructive text-sm rounded-md font-medium hover:bg-destructive/20">Decline</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </PageTransition>

      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <PageTransition>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-sf font-bold mb-2 text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <ShimmerText className="inline-block">Team Management</ShimmerText>
            </h1>
            <p className="text-muted-foreground">Manage your team members and collaborate effectively</p>
          </div>
          <CreateTeamDialog />
        </div>

        {/* Team Banner Section */}
        <div className="mb-6">
          {/* Modern Glassmorphic Banner */}
          <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-xl group border border-white/10 transition-all duration-500 hover:shadow-primary/5">
            {/* Background Image with Parallax-like feel */}
            <div className="absolute inset-0 bg-background">
              {currentTeam.banner_url ? (
                <img
                  src={currentTeam.banner_url}
                  alt="Cover"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black animate-gradient-xy" />
              )}

              {/* Multi-layer Gradient Overlay for Depth and Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent opacity-60" />
            </div>

            {/* Top Bar: Navigation & Actions */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-20">
              {/* Team Switcher - Glass Pill */}
              <div className="relative">
                {teams.length > 1 && (
                  <Select
                    value={currentTeam?.id}
                    onValueChange={(value) => {
                      const selected = teams.find(t => t.id === value);
                      if (selected) setCurrentTeam(selected);
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-9 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border-white/10 text-white shadow-lg transition-all focus:bg-white/10 ring-0 focus:ring-0">
                      <SelectValue placeholder="Switch Team" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
                      {teams.map(t => (
                        <SelectItem key={t.id} value={t.id} className="focus:bg-white/10 focus:text-white cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{t.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Action Buttons - Floating Glass Group */}
              <div className="flex items-center gap-2 p-1 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
                <EditTeamDialog
                  team={currentTeam}
                  onUpdate={refreshTeams}
                >
                  <Button variant="ghost" size="sm" className="h-7 rounded-full bg-transparent hover:bg-white/10 text-white/90 hover:text-white transition-all font-medium text-xs px-2.5">
                    <Settings size={12} className="mr-1.5" /> Settings
                  </Button>
                </EditTeamDialog>

                <div className="w-px h-3 bg-white/10 mx-0.5"></div>

                <CreateTeamDialog>
                  <Button variant="ghost" size="sm" className="h-7 rounded-full bg-primary/20 hover:bg-primary/30 text-primary-foreground hover:text-white transition-all font-medium text-xs px-2.5 border border-primary/20">
                    <Plus size={12} className="mr-1.5" /> New Team
                  </Button>
                </CreateTeamDialog>

                {currentTeam.role === 'owner' && (
                  <>
                    <div className="w-px h-3 bg-white/10 mx-0.5"></div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-destructive/20 text-white/70 hover:text-destructive transition-all"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      title="Delete Team"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Main Hero Content */}
            <div className="absolute bottom-0 left-0 w-full p-5 z-20">
              <div className="flex items-end gap-4">
                {/* Avatar - Elevated */}
                <div className="relative group/avatar">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-background/50 shadow-xl bg-muted/20 backdrop-blur-sm relative z-10 transition-transform duration-500 group-hover/avatar:scale-105 group-hover/avatar:-rotate-2">
                    {currentTeam.avatar_url ? (
                      <img src={currentTeam.avatar_url} alt={currentTeam.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary via-purple-500 to-indigo-600 text-white text-2xl font-black tracking-tighter">
                        {currentTeam.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Decorative Glow behind Avatar */}
                  <div className="absolute inset-0 bg-primary/30 blur-xl -z-10 rounded-full scale-110 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700"></div>
                </div>

                {/* Team Details */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight [text-shadow:_0_2px_8px_rgba(0,0,0,0.8),_0_4px_16px_rgba(0,0,0,0.6)]">
                      {currentTeam.name}
                    </h1>
                    {currentTeam.is_public && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider font-bold backdrop-blur-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        Public Team
                      </span>
                    )}
                  </div>

                  <p className="text-white text-sm max-w-2xl font-light leading-relaxed mb-3 [text-shadow:_0_1px_4px_rgba(0,0,0,0.7),_0_2px_8px_rgba(0,0,0,0.5)] line-clamp-1">
                    {currentTeam.description || "Building something amazing, together."}
                  </p>

                  {/* Modern Stats Chips */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-white/20 backdrop-blur-sm hover:bg-black/40 transition-colors shadow-lg">
                      <Users size={14} className="text-white [filter:_drop-shadow(0_1px_2px_rgba(0,0,0,0.5))]" />
                      <span className="text-xs font-medium text-white [text-shadow:_0_1px_3px_rgba(0,0,0,0.6)]">{teamMembers.length} <span className="font-normal">members</span></span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-white/20 backdrop-blur-sm hover:bg-black/40 transition-colors shadow-lg">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center text-[7px] font-bold text-white [filter:_drop-shadow(0_1px_2px_rgba(0,0,0,0.5))]">D</div>
                      <span className="text-xs font-medium text-white [text-shadow:_0_1px_3px_rgba(0,0,0,0.6)]">{currentTeam.total_decisions || 0} <span className="font-normal">decisions</span></span>
                    </div>

                    {currentTeam.location && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-white/20 backdrop-blur-sm hover:bg-black/40 transition-colors shadow-lg">
                        <MapPin size={14} className="text-white [filter:_drop-shadow(0_1px_2px_rgba(0,0,0,0.5))]" />
                        <span className="text-xs font-medium text-white [text-shadow:_0_1px_3px_rgba(0,0,0,0.6)]">{currentTeam.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the team "{currentTeam?.name}" and all its data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Team
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Social Links & Mission - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 slide-in-from-bottom-4 duration-700 animate-fade-in">
          <div className="md:col-span-2">
            {/* Mission Statement */}
            {currentTeam.mission_statement && (
              <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-card/50 relative overflow-hidden group h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                <h4 className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                  <Tag size={14} /> Our Mission
                </h4>
                <p className="text-lg text-foreground/90 font-light leading-relaxed italic">
                  "{currentTeam.mission_statement}"
                </p>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            {/* Quick Links Card */}
            {(currentTeam.website_url || currentTeam.twitter_handle || currentTeam.github_url) && (
              <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-card/50 h-full flex flex-col justify-center">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                  Connect
                </h4>
                <div className="space-y-3">
                  {currentTeam.website_url && (
                    <a href={ensureAbsoluteUrl(currentTeam.website_url)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/50 group">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Globe size={16} />
                      </div>
                      <span className="font-medium">Website</span>
                    </a>
                  )}
                  {currentTeam.twitter_handle && (
                    <a href={`https://twitter.com/${currentTeam.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/50 group">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
                        <Twitter size={16} />
                      </div>
                      <span className="font-medium">@{currentTeam.twitter_handle}</span>
                    </a>
                  )}
                  {currentTeam.github_url && (
                    <a href={ensureAbsoluteUrl(currentTeam.github_url)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/50 group">
                      <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                        <Github size={16} />
                      </div>
                      <span className="font-medium">GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Received Invitations Section */}
        {
          myInvites && myInvites.length > 0 && (
            <div className="mb-8 animate-fade-in">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
                <Bell size={18} className="text-primary" />
                Your Invitations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myInvites.map((invite: any) => (
                  <div key={invite.id} className="glass-panel p-4 rounded-lg border border-primary/30 relative overflow-hidden bg-card">
                    <div className="absolute top-0 right-0 p-1.5 bg-primary/10 rounded-bl-lg text-[10px] text-primary font-bold">
                      PENDING
                    </div>
                    <div className="mb-2">
                      <h3 className="text-base font-semibold text-foreground">{invite.team?.name || 'Unknown Team'}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">
                        Invited as <span className="text-emerald-500 capitalize font-medium">{invite.role}</span>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvite(invite)}
                        className="flex-1 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(invite.id)}
                        className="flex-1 py-1.5 bg-transparent border border-border text-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* Only show Team Dashboard if user has teams */}
        {
          teams.length > 0 && (
            <>

              <div className="animate-fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="glass-panel p-4 rounded-xl animate-fade-in bg-card">
                    <div className="pb-2 mb-3 border-b border-border">
                      <h3 className="text-base font-semibold text-foreground">Team Members</h3>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold text-foreground">{teamMembers.length}</p>
                          <p className="text-[10px] text-muted-foreground">Total members</p>
                        </div>
                        <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
                          <Users size={16} className="text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel p-4 rounded-xl animate-fade-in animate-delay-1 bg-card">
                    <div className="pb-2 mb-3 border-b border-border">
                      <h3 className="text-base font-semibold text-foreground">Role Distribution</h3>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Admins</span>
                            <span className="text-[10px] font-medium text-foreground">{roleStats.admin}</span>
                          </div>
                          <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                              style={{ width: `${teamMembers.length ? (roleStats.admin / teamMembers.length) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Proposers</span>
                            <span className="text-[10px] font-medium text-foreground">{roleStats.proposer}</span>
                          </div>
                          <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                              style={{ width: `${teamMembers.length ? (roleStats.proposer / teamMembers.length) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground">Contributors</span>
                            <span className="text-[10px] font-medium text-foreground">{roleStats.contributor}</span>
                          </div>
                          <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary shadow-[0_0_10px_rgba(74,222,128,0.4)]"
                              style={{ width: `${teamMembers.length ? (roleStats.contributor / teamMembers.length) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(currentTeam.role === 'admin' || currentTeam.role === 'owner') && (
                    <div className="glass-panel p-4 rounded-xl animate-fade-in animate-delay-2 flex flex-col justify-center items-center text-center bg-card">
                      <div className="p-2 rounded-full bg-muted mb-2 border border-border">
                        <UserPlus size={20} className="text-emerald-500" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mb-0.5">Grow Your Team</h3>
                      <p className="text-[10px] text-muted-foreground mb-3">Invite new members to collaborate.</p>
                      <AddTeamMemberDialog
                        onAddMember={handleAddTeamMember}
                        teamId={currentTeam?.id}
                      />
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="px-6 py-2 rounded-full bg-muted border border-border hover:bg-muted/80 hover:border-primary/50 transition-all font-medium text-sm flex items-center gap-2 text-foreground group"
                >
                  <Users size={16} className={`text-primary transition-transform duration-300 ${showMembers ? 'scale-110' : ''}`} />
                  {showMembers ? 'Hide Members List' : 'View All Members'}
                </button>
              </div>

              {showMembers && (
                <>
                  <div className="flex justify-between items-center mb-4 animate-fade-in animate-delay-3">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Users size={18} className="text-primary" />
                      <ShimmerText className="inline-block">All Team Members</ShimmerText>
                    </h2>

                    <div className="md:hidden">
                      {(currentTeam.role === 'admin' || currentTeam.role === 'owner') && (
                        <AddTeamMemberDialog
                          onAddMember={handleAddTeamMember}
                          teamId={currentTeam?.id}
                        />
                      )}
                    </div>
                  </div>

                  {/* Pending Invites Section - Only visible to admins */}
                  {currentTeam?.role === 'admin' && currentTeam?.pendingInvites && currentTeam.pendingInvites.length > 0 && (
                    <div className="mb-6 animate-fade-in animate-delay-2">
                      <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
                        <UserPlus size={18} className="text-emerald-500" />
                        Pending Invitations
                      </h2>
                      <div className="grid grid-cols-1 gap-3">
                        {currentTeam.pendingInvites.map((invite: any) => (
                          <div key={invite.id} className="glass-panel p-3 rounded-lg flex items-center justify-between border border-border bg-card">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                                <Users size={14} />
                              </div>
                              <div>
                                <p className="text-foreground font-medium text-sm">{invite.email}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground capitalize">{invite.role}</span>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                  <span className="text-[10px] text-emerald-500">Pending</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(invite.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in animate-delay-3 pb-8">
                    {teamMembers.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/30">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                          <Users size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-1">No team members yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">Add your first team member to get started.</p>
                        <AddTeamMemberDialog
                          onAddMember={handleAddTeamMember}
                          teamId={currentTeam?.id}
                        />
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
                          onRemove={() => handleRemoveMember(member.user_id)}
                        />
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )
        }
      </PageTransition >
    </div >
  );
};

export default Teams;
