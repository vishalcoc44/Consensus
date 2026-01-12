
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DecisionCard from '@/components/dashboard/DecisionCard';
import CreateDecisionButton from '@/components/dashboard/CreateDecisionButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { LineChart, BarChart, Users, Brain, LayoutDashboard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTeam } from '@/contexts/TeamContext';
import ShimmerText from '@/components/ui/effects/ShimmerText';
import PageTransition from '@/components/animations/PageTransition';
import MotionCard from '@/components/animations/MotionCard';
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer';

interface DashboardStats {
  activeDecisions: number;
  teamMembers: number;
  avgConsensus: number;
  decisionVelocity: number;
}

interface Decision {
  id: string | number;
  title: string;
  description: string;
  dueDate: string;
  participants: number;
  comments: number;
  progress: number;
  status: 'draft' | 'active' | 'paused' | 'closed' | 'archived';
  consensus: number;
  image_url?: string | null;
  created_by?: string;
  team_id?: string;
  created_by_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Dashboard = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeDecisions: 0,
    teamMembers: 0,
    avgConsensus: 0,
    decisionVelocity: 4.2,
  });
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [teamRoles, setTeamRoles] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentTeam } = useTeam();

  useEffect(() => {
    document.title = 'Dashboard - ConsensusAI';
    if (currentTeam) {
      fetchDashboardData();
    } else {
      // Clear data if no team selected
      setDecisions([]);
      setStats({
        activeDecisions: 0,
        teamMembers: 0,
        avgConsensus: 0,
        decisionVelocity: 0
      });
      setLoading(false);
    }
  }, [currentTeam]); // Re-fetch when team changes

  // Helper functions defined before usage in fetchDashboardData
  const getActiveDecisionsCount = async (): Promise<number> => {
    if (!currentTeam) return 0;
    try {
      const { count, error } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('team_id', currentTeam.id);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting active decisions:', error);
      return 0;
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);

        // Fetch user's team roles for permission checks
        const { data: teamMembersData } = await supabase
          .from('team_members')
          .select('team_id, role')
          .eq('user_id', session.user.id);

        if (teamMembersData) {
          const rolesMap: Record<string, string> = {};
          teamMembersData.forEach(tm => {
            if (tm.team_id) rolesMap[tm.team_id] = tm.role;
          });
          setTeamRoles(rolesMap);
        }
      }

      // Get active decisions
      const { data: decisionsData, error: decisionsError } = await supabase
        .from('proposals')
        .select(`
          id, 
          title, 
          description, 
          deadline, 
          status, 
          created_at,
          created_by,
          team_id,
          image_url,
          contributions(count),
          proposal_analysis(analysis_data)
        `)
        .eq('status', 'active')
        .eq('team_id', currentTeam?.id) // Filter by current team
        .order('created_at', { ascending: false })
        .limit(6);

      if (decisionsError) {
        console.error("Error fetching proposals:", decisionsError);
        throw decisionsError;
      }

      // Get team members count
      // Get team members count for current team
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', currentTeam?.id);

      if (teamMembersError && teamMembersError.code !== '42P17') throw teamMembersError;

      // Count unique members
      const teamMembersCount = new Set(teamMembersData?.map(m => m.user_id)).size;

      const activeCount = await getActiveDecisionsCount();

      if (decisionsData) {
        const formattedDecisions: Decision[] = decisionsData.map(item => {
          let consensusScore = 0;
          let participantsCount = 0;
          let commentsCount = 0;

          if (item.proposal_analysis && item.proposal_analysis.length > 0) {
            const analysisData = item.proposal_analysis[0].analysis_data;

            if (
              typeof analysisData === 'object' &&
              analysisData !== null &&
              'recommendation' in analysisData &&
              typeof analysisData.recommendation === 'object' &&
              analysisData.recommendation !== null &&
              'confidenceScore' in analysisData.recommendation
            ) {
              // Ensure we convert to number and handle any non-numeric values
              const confidenceScore = analysisData.recommendation.confidenceScore;
              consensusScore = typeof confidenceScore === 'number' ?
                confidenceScore :
                (typeof confidenceScore === 'string' ?
                  parseInt(confidenceScore, 10) || 0 :
                  Math.floor(Math.random() * 100));
            } else {
              consensusScore = Math.floor(Math.random() * 100);
            }
          } else {
            consensusScore = Math.floor(Math.random() * 100);
          }

          participantsCount = item.contributions?.length || 0;
          commentsCount = participantsCount * 2;

          let progress = 0;
          if (item.status === 'closed' || item.status === 'archived') {
            progress = 100;
          } else if (item.status === 'active') {
            if (item.deadline) {
              const now = new Date();
              const deadline = new Date(item.deadline);
              const created = new Date(item.created_at);

              if (now > deadline) {
                progress = 100;
              } else {
                const totalTime = deadline.getTime() - created.getTime();
                const elapsedTime = now.getTime() - created.getTime();
                progress = Math.min(100, Math.ceil((elapsedTime / totalTime) * 100));
              }
            } else {
              progress = Math.floor(Math.random() * 90) + 10;
            }
          }

          return {
            id: item.id,
            title: item.title,
            description: item.description || 'No description provided',
            dueDate: item.deadline ? new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline',
            participants: participantsCount,
            comments: commentsCount,
            progress: progress,
            status: (item.status as 'draft' | 'active' | 'paused' | 'closed' | 'archived') || 'draft',
            consensus: consensusScore,
            created_by: item.created_by,
            team_id: item.team_id,
            image_url: item.image_url
          } as Decision & { created_by?: string; team_id?: string; image_url?: string };
        });

        // Fetch creator profiles
        const creatorIds = [...new Set(formattedDecisions.map(d => d.created_by).filter(Boolean))];
        if (creatorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', creatorIds);

          if (profiles) {
            const profilesMap = Object.fromEntries(profiles.map(p => [p.id, p]));
            formattedDecisions.forEach(d => {
              if (d.created_by && profilesMap[d.created_by]) {
                d.created_by_profile = profilesMap[d.created_by];
              }
            });
          }
        }

        const totalConsensus = formattedDecisions.reduce((sum, decision) => sum + decision.consensus, 0);
        const avgConsensus = formattedDecisions.length > 0 ?
          Math.round(totalConsensus / formattedDecisions.length) : 0;

        setDecisions(formattedDecisions);
        setStats({
          activeDecisions: activeCount,
          teamMembers: teamMembersCount || 0,
          avgConsensus: avgConsensus,
          decisionVelocity: 4.2,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error loading dashboard',
        description: 'Could not load dashboard data. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCanDelete = (decision: Decision & { created_by?: string; team_id?: string }) => {
    if (!currentUserId) return false;
    // Creator can always delete
    if (decision.created_by === currentUserId) return true;

    // Team admins/owners can delete
    if (decision.team_id && teamRoles[decision.team_id]) {
      const role = teamRoles[decision.team_id];
      if (role === 'admin' || role === 'owner' || role === 'Admin' || role === 'Owner') return true;
    }
    return false;
  };

  const handleDecisionClick = (decisionId: string | number) => {
    navigate(`/dashboard/proposals/${decisionId}`);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [decisionToDelete, setDecisionToDelete] = useState<Decision | null>(null);

  const confirmDelete = (decision: Decision) => {
    setDecisionToDelete(decision);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!decisionToDelete) return;

    try {
      console.log(`Attempting to delete decision ${decisionToDelete.id} from Dashboard...`);

      // 1. Fetch contributions to find their IDs for deleting ratings
      const { data: contributions } = await supabase
        .from('contributions')
        .select('id')
        .eq('proposal_id', decisionToDelete.id);

      // 2. Delete dependent data manually (safe fallback)
      const deletePromises = [
        supabase.from('proposal_options').delete().eq('proposal_id', decisionToDelete.id),
        supabase.from('proposal_criteria').delete().eq('proposal_id', decisionToDelete.id),
        supabase.from('proposal_analysis').delete().eq('proposal_id', decisionToDelete.id)
      ];

      // If there are contributions, delete their ratings first, then the contributions
      if (contributions && contributions.length > 0) {
        const contributionIds = contributions.map(c => c.id);
        await supabase.from('contribution_ratings').delete().in('contribution_id', contributionIds);
        deletePromises.push(supabase.from('contributions').delete().eq('proposal_id', decisionToDelete.id));
      } else {
        deletePromises.push(supabase.from('contributions').delete().eq('proposal_id', decisionToDelete.id));
      }

      await Promise.allSettled(deletePromises);

      // 3. Delete the proposal
      const { data, error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', decisionToDelete.id)
        .select(); // Select to verify it was actually deleted

      if (error) {
        console.error("Supabase delete error:", error);
        throw error;
      }

      // Check if any row was actually deleted
      if (!data || data.length === 0) {
        throw new Error("Deletion failed. You may not have permission to delete this decision, or it doesn't exist.");
      }

      toast({
        title: "Decision deleted",
        description: "The decision has been permanently removed.",
      });

      // 3. Optimistic update
      setDecisions(prev => prev.filter(d => d.id !== decisionToDelete.id));
      setStats(prev => ({
        ...prev,
        activeDecisions: Math.max(0, prev.activeDecisions - 1)
      }));

      fetchDashboardData();
    } catch (error: any) {
      console.error('Error deleting decision:', error);
      toast({
        title: "Error deleting decision",
        description: error.message || "Failed to delete decision",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDecisionToDelete(null);
    }
  };

  return (
    <PageTransition>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2 text-foreground flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          <ShimmerText className="inline-block" shimmerColor="rgba(0, 0, 0, 0.2)">Welcome back</ShimmerText>
        </h1>
        <p className="text-muted-foreground">Here's an overview of {currentTeam?.name ? `${currentTeam.name}'s` : "your team's"} decision-making activities</p>
      </div>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" delay={0.2}>
        {/* Active Decisions Card */}
        <MotionCard delay={0.1} className="group relative overflow-hidden bg-card/50 border-border hover:border-blue-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Active Decisions</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.activeDecisions}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <Brain size={20} className="text-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-500 font-semibold">+{Math.floor(stats.activeDecisions * 0.2)}</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </div>
        </MotionCard>

        {/* Team Members Card */}
        <MotionCard delay={0.2} className="group relative overflow-hidden bg-card/50 border-border hover:border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Team Members</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.teamMembers}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <Users size={20} className="text-purple-500" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-500 font-semibold">+{Math.floor(stats.teamMembers * 0.15)}</span>
              <span className="text-muted-foreground">new this month</span>
            </div>
          </div>
        </MotionCard>

        {/* Avg Consensus Card */}
        <MotionCard delay={0.3} className="group relative overflow-hidden bg-card/50 border-border hover:border-emerald-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Avg. Consensus</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.avgConsensus}%</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <LineChart size={20} className="text-emerald-500" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-500 font-semibold">+5%</span>
              <span className="text-muted-foreground">improvement</span>
            </div>
          </div>
        </MotionCard>

        {/* Decision Velocity Card */}
        <MotionCard delay={0.4} className="group relative overflow-hidden bg-card/50 border-border hover:border-amber-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Decision Velocity</p>
                <h3 className="text-3xl font-bold text-foreground">{stats.decisionVelocity} <span className="text-lg text-muted-foreground font-normal">days</span></h3>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                <BarChart size={20} className="text-amber-500" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-emerald-500 font-semibold">-1.3 days</span>
              <span className="text-muted-foreground">faster</span>
            </div>
          </div>
        </MotionCard>
      </StaggerContainer>

      <div className="flex justify-between items-center mb-6 animate-fade-in animate-delay-5">
        <h2 className="text-xl font-sf font-bold text-foreground">Active Decisions</h2>
        <CreateDecisionButton />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : decisions.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg animate-fade-in bg-muted/30">
          No active decisions yet. Use the "New Decision" button to create one.
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" delay={0.4}>
          {decisions.map((decision) => (
            <StaggerItem
              key={decision.id}
              className="cursor-pointer"
            >
              <div
                onClick={() => handleDecisionClick(decision.id)}
                className="h-full transition-transform hover:scale-[1.02] transform-gpu"
              >
                <DecisionCard
                  title={decision.title}
                  description={decision.description}
                  dueDate={decision.dueDate}
                  participants={decision.participants}
                  comments={decision.comments}
                  progress={decision.progress}
                  status={decision.status}
                  consensus={decision.consensus}
                  imageUrl={decision.image_url}
                  onDelete={getCanDelete(decision as any) ? () => confirmDelete(decision) : undefined}
                  createdBy={decision.created_by_profile ? {
                    name: decision.created_by_profile.full_name,
                    avatarUrl: decision.created_by_profile.avatar_url
                  } : undefined}
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the decision
              "{decisionToDelete?.title}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </PageTransition >

  );
};

export default Dashboard;
