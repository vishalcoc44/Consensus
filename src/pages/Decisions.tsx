
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DecisionCard from '@/components/dashboard/DecisionCard';
import CreateDecisionButton from '@/components/dashboard/CreateDecisionButton';
import { typedSupabase } from '@/utils/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import ErrorDisplay from '@/components/auth/components/ErrorDisplay';

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

const Decisions = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Decisions - ConsensusAI';
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching decisions data...");
      
      // Get the current user's session to check auth
      const { data: { session } } = await typedSupabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found");
        setError("Authentication required to view decisions");
        setLoading(false);
        return;
      }

      // Use a simpler query to avoid potential recursion issues
      const { data, error } = await typedSupabase
        .from('proposals')
        .select('*');

      if (error) {
        console.error("Database query error:", error);
        throw error;
      }

      if (data) {
        console.log("Decisions data retrieved:", data.length, "records");
        
        // Now fetch the additional data separately to avoid recursion
        const contributionCounts: Record<string, number> = {};
        
        // Get contribution counts
        if (data.length > 0) {
          const proposalIds = data.map(item => item.id);
          
          // Fix: Use separate count queries for each proposal to avoid groupBy
          for (const proposalId of proposalIds) {
            const { count, error: countError } = await typedSupabase
              .from('contributions')
              .select('*', { count: 'exact', head: true })
              .eq('proposal_id', proposalId);
              
            if (countError) {
              console.error(`Error fetching contribution count for proposal ${proposalId}:`, countError);
            } else if (count !== null) {
              contributionCounts[proposalId] = count;
            }
          }
        }
        
        // Format decisions
        const formattedDecisions: Decision[] = data.map(item => {
          const participantsCount = contributionCounts[item.id] || 0;
          const commentsCount = participantsCount * 2;
          const consensusScore = Math.floor(Math.random() * 100);
          
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

        setDecisions(formattedDecisions);
      }
    } catch (error: any) {
      console.error('Error fetching decisions:', error);
      setError(error.message || 'Could not load decisions. Please try again later.');
      toast({
        title: 'Error fetching decisions',
        description: error.message || 'Could not load decisions. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionClick = (decisionId: string | number) => {
    navigate(`/dashboard/proposals/${decisionId}`);
  };

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2">Decision Management</h1>
        <p className="text-consensus-grey-600">View and manage all your organization's decisions</p>
      </div>
      
      <div className="flex justify-between items-center mb-6 animate-fade-in">
        <h2 className="text-xl font-sf font-bold">All Decisions</h2>
        <CreateDecisionButton />
      </div>
      
      {error && (
        <ErrorDisplay error={error} title="Error Loading Decisions" />
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-consensus-green"></div>
        </div>
      ) : decisions.length === 0 ? (
        <div className="p-8 text-center text-consensus-grey-500 border border-dashed border-consensus-grey-300 rounded-lg animate-fade-in">
          No decisions yet. Use the "New Decision" button to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {decisions.map((decision) => (
            <div 
              key={decision.id} 
              onClick={() => handleDecisionClick(decision.id)}
              className="cursor-pointer transition-transform hover:scale-[1.02]"
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

export default Decisions;
