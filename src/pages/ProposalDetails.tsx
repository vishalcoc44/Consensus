
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProposalHeader from '@/components/proposals/ProposalHeader';
import ContributionForm from '@/components/proposals/ContributionForm';
import ContributionsOverview from '@/components/proposals/ContributionsOverview';
import IntegrationManager from '@/components/integrations/IntegrationManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { proposalService } from '@/services/proposalService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const ProposalDetails = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contribute');
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const { data: proposal, isLoading, error, refetch } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => proposalService.getProposalById(proposalId!),
    enabled: !!proposalId
  });

  const { data: userContributions } = useQuery({
    queryKey: ['userContributions', proposalId, session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('contributions')
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('user_id', session.user.id);
      return data;
    },
    enabled: !!proposalId && !!session?.user?.id
  });

  const hasContributed = userContributions && userContributions.length > 0;

  useEffect(() => {
    if (proposal) {
      document.title = `${proposal.title} - ConsensusAI`;
    }
  }, [proposal]);

  const handleSubmitContribution = async (contributionData: any) => {
    try {
      await proposalService.addContribution(
        proposal.id,
        contributionData.selectedOptionId,
        contributionData.comment,
        contributionData.ratings
      );

      toast({
        title: "Contribution Submitted",
        description: "Your input has been recorded successfully.",
      });

      refetch();
      setActiveTab('overview');
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was a problem submitting your contribution.",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin h-8 w-8 border-4 border-consensus-blue border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !proposal) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Proposal Not Found</h2>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 animate-fade-in">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>

        <ProposalHeader proposal={proposal} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger
            value="contribute"
            className="data-[state=active]:text-consensus-blue data-[state=active]:shadow"
            disabled={hasContributed}
          >
            Contribute
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="data-[state=active]:text-consensus-blue data-[state=active]:shadow"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:text-consensus-blue data-[state=active]:shadow"
          >
            External Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contribute">
          {hasContributed ? (
            <div className="text-center p-8 bg-slate-50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">You've already contributed</h3>
              <p className="text-consensus-grey-600 mb-4">
                You've already submitted your input for this proposal. You can view the current overview instead.
              </p>
              <Button onClick={() => setActiveTab('overview')}>
                View Overview
              </Button>
            </div>
          ) : (
            <ContributionForm
              proposal={proposal}
              onSubmit={handleSubmitContribution}
            />
          )}
        </TabsContent>

        <TabsContent value="overview">
          <ContributionsOverview proposal={proposal} />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationManager proposalId={proposalId || proposal.id} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ProposalDetails;
