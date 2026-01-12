
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProposalHeader from '@/components/proposals/ProposalHeader';
import ContributionForm from '@/components/proposals/ContributionForm';
import ContributionsOverview from '@/components/proposals/ContributionsOverview';
import IntegrationManager from '@/components/integrations/IntegrationManager';
import ExportDecisionButton from '@/components/decisions/ExportDecisionButton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs'; // Removed TabsList, TabsTrigger
import {
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
  Database,
  MoreHorizontal,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTeam } from '@/contexts/TeamContext';

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
  const contentRef = useRef<HTMLDivElement>(null);
  const { currentTeam, setCurrentTeam, teams } = useTeam();

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

  // Auto-switch team context if viewing a proposal from another team
  useEffect(() => {
    if (proposal && currentTeam && proposal.team_id && proposal.team_id !== currentTeam.id) {
      const newTeam = teams.find(t => t.id === proposal.team_id);
      if (newTeam) {
        setCurrentTeam(newTeam);
        toast({
          title: "Team Context Switched",
          description: `Switched to ${newTeam.name} to view this proposal.`
        });
      }
    }
  }, [proposal, currentTeam, teams, setCurrentTeam, toast]);

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Proposal Not Found</h2>
        <Button onClick={() => navigate('/dashboard/decisions')}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-fade-in">
      <div className="mb-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/50 transition-all duration-300"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
          <ExportDecisionButton
            decisionId={proposal.id}
            title={proposal.title}
            targetRef={contentRef}
          />
        </div>

        <ProposalHeader proposal={proposal} />
      </div>

      <div ref={contentRef} className="bg-background"> {/* Wrap content in ref div for export */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            {/* Left: Contribute Tab Button */}
            <div className="flex items-center gap-3">
              <Button
                variant={activeTab === 'contribute' ? 'default' : 'outline'}
                onClick={() => setActiveTab('contribute')}
                disabled={hasContributed}
                className={`rounded-xl transition-all duration-300 ${activeTab === 'contribute'
                  ? 'shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground'
                  : 'bg-card/50 backdrop-blur-sm hover:bg-card border-border/50 hover:border-primary/30'
                  }`}
              >
                <Sparkles size={16} className="mr-2" />
                Share Input
              </Button>
              {hasContributed && (
                <span className="text-xs font-semibold text-emerald-600 px-2.5 py-1 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  Contributed
                </span>
              )}
            </div>

            {/* Right: View Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card border-border/50 hover:border-primary/30 transition-all duration-300">
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
            {proposal.is_blind && !hasContributed && proposal.created_by !== session?.user?.id ? (
              <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center animate-fade-in">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <EyeOff size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Blind Voting Active</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  This decision is in <strong>Blind Mode</strong>. Results and analytics are hidden until you submit your contribution to ensure unbiased decision making.
                </p>
                <Button
                  onClick={() => setActiveTab('contribute')}
                  className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  Contribute to See Results
                </Button>
              </div>
            ) : (
              <ContributionsOverview proposal={proposal} />
            )}
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationManager proposalId={proposalId || proposal.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProposalDetails;
