
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DecisionCard from '@/components/dashboard/DecisionCard';
import CreateDecisionButton from '@/components/dashboard/CreateDecisionButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, BarChart, Users, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  status: 'active' | 'completed' | 'archived';
  consensus: number;
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Dashboard - ConsensusAI';
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log("Fetching dashboard data with auth status:", await supabase.auth.getSession());

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
          contributions(count),
          proposal_analysis(analysis_data)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (decisionsError) {
        console.error("Error fetching proposals:", decisionsError);
        throw decisionsError;
      }

      // Get team members count
      const { count: teamMembersCount, error: teamMembersError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true });

      if (teamMembersError && teamMembersError.code !== '42P17') throw teamMembersError;

      const activeDecisionsCount = await getActiveDecisionsCount();

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
          if (item.status === 'completed' || item.status === 'archived') {
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
            status: (item.status as 'active' | 'completed' | 'archived') || 'active',
            consensus: consensusScore,
          };
        });

        const totalConsensus = formattedDecisions.reduce((sum, decision) => sum + decision.consensus, 0);
        const avgConsensus = formattedDecisions.length > 0 ?
          Math.round(totalConsensus / formattedDecisions.length) : 0;

        setDecisions(formattedDecisions);
        setStats({
          activeDecisions: activeDecisionsCount,
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

  const getActiveDecisionsCount = async (): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting active decisions:', error);
      return 0;
    }
  };

  const handleDecisionClick = (decisionId: string | number) => {
    navigate(`/dashboard/proposals/${decisionId}`);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2 text-white">Welcome back</h1>
        <p className="text-consensus-grey-400">Here's an overview of your organization's decision-making activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="glass-panel p-0 rounded-xl overflow-hidden animate-fade-in animate-delay-1 hover:shadow-2xl transition-all duration-300 hover:border-consensus-green/30 hover-green-glow group">
          <CardHeader className="pb-2">
            <CardDescription className="text-consensus-grey-400">Active Decisions</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.activeDecisions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-consensus-grey-400">
                <span className="text-emerald-500">+{Math.floor(stats.activeDecisions * 0.2)}</span> from last month
              </div>
              <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Brain size={18} className="text-blue-400" />
              </div>
            </div>
          </CardContent>
        </div>

        <div className="glass-panel p-0 rounded-xl overflow-hidden animate-fade-in animate-delay-2 hover:shadow-2xl transition-all duration-300 hover:border-consensus-green/30 hover-green-glow group">
          <CardHeader className="pb-2">
            <CardDescription className="text-consensus-grey-400">Team Members</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.teamMembers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-consensus-grey-400">
                <span className="text-emerald-500">+{Math.floor(stats.teamMembers * 0.15)}</span> new this month
              </div>
              <div className="p-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Users size={18} className="text-purple-400" />
              </div>
            </div>
          </CardContent>
        </div>

        <div className="glass-panel p-0 rounded-xl overflow-hidden animate-fade-in animate-delay-3 hover:shadow-2xl transition-all duration-300 hover:border-consensus-green/30 hover-green-glow group">
          <CardHeader className="pb-2">
            <CardDescription className="text-consensus-grey-400">Avg. Consensus</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.avgConsensus}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-consensus-grey-400">
                <span className="text-emerald-500">+5%</span> improvement
              </div>
              <div className="p-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <LineChart size={18} className="text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </div>

        <div className="glass-panel p-0 rounded-xl overflow-hidden animate-fade-in animate-delay-4 hover:shadow-2xl transition-all duration-300 hover:border-consensus-green/30 hover-green-glow group">
          <CardHeader className="pb-2">
            <CardDescription className="text-consensus-grey-400">Decision Velocity</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.decisionVelocity} days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-sm text-consensus-grey-400">
                <span className="text-emerald-500">-1.3 days</span> faster
              </div>
              <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                <BarChart size={18} className="text-amber-400" />
              </div>
            </div>
          </CardContent>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6 animate-fade-in animate-delay-5">
        <h2 className="text-xl font-sf font-bold text-white">Active Decisions</h2>
        <CreateDecisionButton />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-consensus-green"></div>
        </div>
      ) : decisions.length === 0 ? (
        <div className="p-8 text-center text-consensus-grey-400 border border-dashed border-consensus-dark-200 rounded-lg animate-fade-in bg-consensus-dark-300/50">
          No active decisions yet. Use the "New Decision" button to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in animate-delay-5">
          {decisions.map((decision) => (
            <div
              key={decision.id}
              onClick={() => handleDecisionClick(decision.id)}
              className="cursor-pointer transition-transform hover:scale-[1.02] transform-gpu"
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
              />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
