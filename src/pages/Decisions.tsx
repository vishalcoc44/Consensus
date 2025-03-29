
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import DecisionCard from '@/components/dashboard/DecisionCard';
import CreateDecisionButton from '@/components/dashboard/CreateDecisionButton';
import { typedSupabase } from '@/utils/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set page title
    document.title = 'Decisions - ConsensusAI';
    
    // Fetch decisions from Supabase
    fetchDecisions();
  }, []);
  
  const fetchDecisions = async () => {
    try {
      const { data, error } = await typedSupabase
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
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Transform the data into the format expected by DecisionCard
        const formattedDecisions: Decision[] = data.map(item => {
          // Calculate consensus score or use a default
          let consensusScore = 0;
          let participantsCount = 0;
          let commentsCount = 0;
          
          if (item.proposal_analysis && item.proposal_analysis.length > 0) {
            const analysis = item.proposal_analysis[0].analysis_data;
            consensusScore = analysis?.recommendationConfidence || Math.floor(Math.random() * 100);
          } else {
            consensusScore = Math.floor(Math.random() * 100);
          }
          
          participantsCount = item.contributions?.length || 0;
          commentsCount = participantsCount * 2; // Just a rough estimate for now
          
          // Calculate progress based on status
          let progress = 0;
          if (item.status === 'completed' || item.status === 'archived') {
            progress = 100;
          } else if (item.status === 'active') {
            // Calculate progress based on deadline if available
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
              progress = Math.floor(Math.random() * 90) + 10; // Random progress between 10-99%
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
    } catch (error) {
      console.error('Error fetching decisions:', error);
      toast({
        title: 'Error fetching decisions',
        description: 'Could not load decisions. Please try again later.',
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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-consensus-blue"></div>
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
