
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProposalHeader from '@/components/proposals/ProposalHeader';
import ContributionForm from '@/components/proposals/ContributionForm';
import ContributionsOverview from '@/components/proposals/ContributionsOverview';
import IntegrationManager from '@/components/integrations/IntegrationManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs'; // Removed TabsList, TabsTrigger
import {
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Database,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

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
        contributionData.selectedOption,
        contributionData.comment,
        contributionData.ratings || {}
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
          {error && <p className="text-red-500 mb-4">{error.message}</p>}
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>

        <ProposalHeader proposal={proposal} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Left: Contribute Tab Button */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'contribute' ? 'default' : 'outline'}
              onClick={() => setActiveTab('contribute')}
              disabled={hasContributed}
              className={`rounded-full transition-all ${activeTab === 'contribute'
                  ? 'shadow-md shadow-primary/20 bg-primary text-primary-foreground'
                  : 'bg-white/50 backdrop-blur-sm hover:bg-white/80'
                }`}
            >
              <Sparkles size={16} className="mr-2" />
              Share Input
            </Button>
            {hasContributed && (
              <span className="text-sm text-green-600 font-medium px-2 py-1 bg-green-50 rounded-md border border-green-100">
                Contributed
              </span>
            )}
          </div>

          {/* Right: View Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-white/50 backdrop-blur-sm hover:bg-white/80 border-slate-200/60">
                {activeTab === 'overview' ? (
                  <>
                    <LayoutDashboard size={16} className="text-blue-500" />
                    <span className="font-medium text-slate-700">Overview</span>
                  </>
                ) : activeTab === 'integrations' ? (
                  <>
                    <Database size={16} className="text-purple-500" />
                    <span className="font-medium text-slate-700">External Data</span>
                  </>
                ) : (
                  <>
                    <MoreHorizontal size={16} className="text-slate-500" />
                    <span className="text-slate-600">Views & Data</span>
                  </>
                )}
                <ChevronDown size={14} className="text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1">
              <DropdownMenuItem
                onClick={() => setActiveTab('overview')}
                className={`gap-2 cursor-pointer ${activeTab === 'overview' ? 'bg-slate-50' : ''}`}
              >
                <LayoutDashboard size={16} className={activeTab === 'overview' ? 'text-blue-500' : 'text-slate-500'} />
                <span>Overview</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveTab('integrations')}
                className={`gap-2 cursor-pointer ${activeTab === 'integrations' ? 'bg-slate-50' : ''}`}
              >
                <Database size={16} className={activeTab === 'integrations' ? 'text-purple-500' : 'text-slate-500'} />
                <span>External Data</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
          ) : proposal.options.length === 0 ? (
            <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="text-yellow-600 h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-foreground">No Options Defined</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                This decision doesn't have any options yet. Options must be added before contributions can be made.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setActiveTab('overview')}>
                  Go to Overview
                </Button>
              </div>
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
