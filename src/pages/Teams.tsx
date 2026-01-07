
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Bell } from 'lucide-react';
import TeamMemberCard from '@/components/teams/TeamMemberCard';
import AddTeamMemberDialog from '@/components/teams/AddTeamMemberDialog';
import { useToast } from '@/components/ui/use-toast';
import { useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useTeams } from '@/hooks/useTeams';
import CreateTeamDialog from '@/components/teams/CreateTeamDialog';
import EditTeamDialog from '@/components/teams/EditTeamDialog';
import { Globe, MapPin, Twitter, Github, Tag } from 'lucide-react';

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
  const { teams, myInvites, loading, error, refreshTeams, removeTeamMember, acceptInvite, declineInvite } = useTeams();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentTeam, setCurrentTeam] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set page title
    document.title = 'Team Management - ConsensusAI';

    // No need for additional fetching as useTeams hook handles it
  }, []);

  useEffect(() => {
    // When teams data is loaded, set or update the current team and its members
    if (teams.length > 0) {
      // If we already have a currentTeam selected, find its updated version
      const updatedCurrentTeam = currentTeam
        ? teams.find(t => t.id === currentTeam.id) || teams[0]
        : teams[0];

      setCurrentTeam(updatedCurrentTeam);

      // Format team members for display
      const formattedMembers = updatedCurrentTeam.members.map(member => ({
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
      setCurrentTeam(null);
      setTeamMembers([]);
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

  // Determine what to show: My Invitations, or Teams view, or Empty state
  // Even if no teams, but invites exist, we should show invites.
  const showEmptyState = teams.length === 0 && (!myInvites || myInvites.length === 0);

  if (showEmptyState) {
    return (
      <DashboardLayout>
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-sf font-bold mb-2 text-white">Team Management</h1>
          <p className="text-consensus-grey-400">You don't have any teams yet</p>
        </div>
        <div className="p-8 text-center text-consensus-grey-500 border border-dashed border-consensus-grey-300 rounded-lg">
          <div className="mb-6">
            <UserPlus size={48} className="mx-auto text-consensus-grey-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Join or create a team</h3>
            <p className="text-consensus-grey-400 mb-6">You are not a member of any team yet.</p>
            <CreateTeamDialog>
              <button className="px-4 py-2 bg-consensus-green text-black font-semibold rounded-lg hover:bg-consensus-green/90 transition-colors">
                Create a New Team
              </button>
            </CreateTeamDialog>
          </div>
          <p className="text-sm">Or wait for an invitation from an administrator.</p>
        </div>
      </DashboardLayout>
    );
  }

  // If we have invites but no teams (or even if we have teams), show invites at the top
  // Guard: If currentTeam is null (e.g., teams loading or none selected), show a simple state
  if (!currentTeam) {
    return (
      <DashboardLayout>
        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-sf font-bold mb-2 text-white">Team Management</h1>
            <p className="text-consensus-grey-400">Select or create a team to get started</p>
          </div>
          <CreateTeamDialog />
        </div>
        {/* Show invites if any */}
        {myInvites && myInvites.length > 0 && (
          <div className="glass-panel p-6 rounded-xl border border-white/10 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Bell size={20} className="text-consensus-green" />
              Your Invitations ({myInvites.length})
            </h2>
            <ul className="space-y-3">
              {myInvites.map((invite: any) => (
                <li key={invite.id} className="flex items-center justify-between p-3 bg-consensus-dark-300 rounded-lg border border-white/5">
                  <div>
                    <span className="font-medium text-white">{invite.team?.name || 'Unknown Team'}</span>
                    <span className="text-consensus-grey-400 text-sm ml-2">as {invite.role}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptInvite(invite)} className="px-3 py-1 bg-consensus-green text-black text-sm rounded-md font-medium hover:bg-consensus-green/90">Accept</button>
                    <button onClick={() => handleDeclineInvite(invite.id)} className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-md font-medium hover:bg-red-500/30">Decline</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Clean Header Section */}
      <div className="mb-8">
        {/* Banner with overlay gradient */}
        <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-white/10">
          {currentTeam.banner_url ? (
            <img src={currentTeam.banner_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-consensus-green/20 via-consensus-dark-300 to-purple-900/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
        </div>

        {/* Team Info Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 px-6 relative z-10">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl border-4 border-[#121212] overflow-hidden bg-consensus-dark-200 shadow-2xl flex-shrink-0">
              {currentTeam.avatar_url ? (
                <img src={currentTeam.avatar_url} alt={currentTeam.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-consensus-green to-consensus-teal text-black text-xl font-bold">
                  {currentTeam.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="pb-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{currentTeam.name}</h1>
                {currentTeam.is_public && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-wider font-medium">Public</span>
                )}
              </div>
              <p className="text-sm text-consensus-grey-400 max-w-md line-clamp-1">
                {currentTeam.description || `${teamMembers.length} members`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <EditTeamDialog team={currentTeam} />
            <CreateTeamDialog />
          </div>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="flex flex-wrap gap-4 mb-6 px-2">
        {currentTeam.location && (
          <div className="flex items-center gap-2 text-sm text-consensus-grey-400 bg-white/5 px-3 py-1.5 rounded-lg">
            <MapPin size={14} className="text-consensus-grey-500" /> {currentTeam.location}
          </div>
        )}
        {currentTeam.website_url && (
          <a href={currentTeam.website_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-consensus-grey-400 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
            <Globe size={14} /> Website
          </a>
        )}
        {currentTeam.twitter_handle && (
          <a href={`https://twitter.com/${currentTeam.twitter_handle}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-consensus-grey-400 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-blue-400 transition-colors">
            <Twitter size={14} /> @{currentTeam.twitter_handle}
          </a>
        )}
        {currentTeam.github_url && (
          <a href={currentTeam.github_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-consensus-grey-400 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
            <Github size={14} /> GitHub
          </a>
        )}
        {currentTeam.tags && currentTeam.tags.length > 0 && currentTeam.tags.map((tag: string, i: number) => (
          <span key={i} className="flex items-center gap-1.5 text-xs text-consensus-grey-300 bg-consensus-dark-300/80 px-2.5 py-1.5 rounded-lg border border-white/5">
            <Tag size={10} className="text-consensus-grey-500" /> {tag}
          </span>
        ))}
      </div>

      {/* Mission Statement */}
      {currentTeam.mission_statement && (
        <div className="glass-panel p-5 rounded-xl border border-white/5 mb-6 max-w-3xl">
          <h4 className="text-xs uppercase tracking-wider text-consensus-grey-500 font-semibold mb-2 flex items-center gap-2">
            <span className="w-1 h-4 bg-consensus-green rounded-full"></span>
            Our Mission
          </h4>
          <p className="text-consensus-grey-300 leading-relaxed">"{currentTeam.mission_statement}"</p>
        </div>
      )}

      {/* Received Invitations Section */}
      {myInvites && myInvites.length > 0 && (
        <div className="mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Bell size={20} className="text-consensus-green" />
            Your Invitations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myInvites.map((invite: any) => (
              <div key={invite.id} className="glass-panel p-5 rounded-xl border border-consensus-green/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-consensus-green/10 rounded-bl-xl text-xs text-consensus-green font-bold">
                  PENDING
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white">{invite.team?.name || 'Unknown Team'}</h3>
                  <p className="text-consensus-grey-400 text-sm">{invite.team?.description || 'No description provided'}</p>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-full bg-consensus-dark-300 flex items-center justify-center text-[10px] text-white">
                    {invite.inviter?.full_name?.charAt(0) || '?'}
                  </div>
                  <span className="text-sm text-consensus-grey-300">
                    Invited by <span className="text-white">{invite.inviter?.full_name || 'Admin'}</span> as <span className="text-consensus-teal capitalize font-medium">{invite.role}</span>
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAcceptInvite(invite)}
                    className="flex-1 py-2 bg-consensus-green text-black font-semibold rounded-lg hover:bg-consensus-green/90 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(invite.id)}
                    className="flex-1 py-2 bg-transparent border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Only show Team Dashboard if user has teams */}
      {teams.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-panel p-6 rounded-2xl animate-fade-in">
              <div className="pb-2 mb-4 border-b border-white/5">
                <h3 className="text-xl font-semibold text-white">Team Members</h3>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">{teamMembers.length}</p>
                    <p className="text-sm text-consensus-grey-400">Total members</p>
                  </div>
                  <div className="p-3 rounded-full bg-consensus-green/20 border border-consensus-green/30">
                    <Users size={24} className="text-consensus-green" />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl animate-fade-in animate-delay-1">
              <div className="pb-2 mb-4 border-b border-white/5">
                <h3 className="text-xl font-semibold text-white">Role Distribution</h3>
              </div>
              <div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-consensus-grey-300">Admins</span>
                      <span className="text-sm font-medium text-white">{roleStats.admin}</span>
                    </div>
                    <div className="h-2 bg-consensus-dark-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                        style={{ width: `${teamMembers.length ? (roleStats.admin / teamMembers.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-consensus-grey-300">Proposers</span>
                      <span className="text-sm font-medium text-white">{roleStats.proposer}</span>
                    </div>
                    <div className="h-2 bg-consensus-dark-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                        style={{ width: `${teamMembers.length ? (roleStats.proposer / teamMembers.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-consensus-grey-300">Contributors</span>
                      <span className="text-sm font-medium text-white">{roleStats.contributor}</span>
                    </div>
                    <div className="h-2 bg-consensus-dark-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-consensus-green shadow-[0_0_10px_rgba(74,222,128,0.4)]"
                        style={{ width: `${teamMembers.length ? (roleStats.contributor / teamMembers.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl animate-fade-in animate-delay-2 flex flex-col justify-center items-center text-center">
              <div className="p-4 rounded-full bg-consensus-dark-200 mb-4 border border-white/5">
                <UserPlus size={32} className="text-consensus-teal" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Grow Your Team</h3>
              <p className="text-sm text-consensus-grey-400 mb-6">Invite new members to collaborate on proposals.</p>
              <AddTeamMemberDialog
                onAddMember={handleAddTeamMember}
                teamId={currentTeam?.id}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 animate-fade-in animate-delay-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-consensus-green" />
              All Team Members
            </h2>

            {/* Only show top add button on mobile or if list is long */}
            <div className="md:hidden">
              <AddTeamMemberDialog
                onAddMember={handleAddTeamMember}
                teamId={currentTeam?.id}
              />
            </div>
          </div>

          {/* Pending Invites Section - Only visible to admins */}
          {currentTeam?.role === 'admin' && currentTeam?.pendingInvites && currentTeam.pendingInvites.length > 0 && (
            <div className="mb-8 animate-fade-in animate-delay-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <UserPlus size={20} className="text-consensus-teal" />
                Pending Invitations
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {currentTeam.pendingInvites.map((invite: any) => (
                  <div key={invite.id} className="glass-panel p-4 rounded-xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-consensus-teal/20 flex items-center justify-center text-consensus-teal border border-consensus-teal/30">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{invite.email}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-consensus-grey-400 capitalize">{invite.role}</span>
                          <span className="w-1 h-1 rounded-full bg-consensus-grey-600"></span>
                          <span className="text-xs text-consensus-teal">Pending</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-consensus-grey-500">
                        Sent {new Date(invite.created_at).toLocaleDateString()}
                      </span>
                      {/* Future: Add Cancel/Resend buttons here */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 animate-fade-in animate-delay-3 pb-8">
            {teamMembers.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-consensus-dark-100 rounded-2xl bg-consensus-dark-300/50">
                <div className="mx-auto w-16 h-16 bg-consensus-dark-200 rounded-full flex items-center justify-center mb-4">
                  <Users size={32} className="text-consensus-grey-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No team members yet</h3>
                <p className="text-consensus-grey-400 mb-6">Add your first team member to get started.</p>
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
    </DashboardLayout>
  );
};

export default Teams;
