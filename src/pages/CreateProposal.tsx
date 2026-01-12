
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProposalWizard from '@/components/proposals/ProposalWizard';
import { useTeam } from '@/contexts/TeamContext';
import type { DecisionTemplate } from '@/types/phase2';
import ShimmerText from '@/components/ui/effects/ShimmerText';

const CreateProposal = () => {
  const location = useLocation();
  const { currentTeam } = useTeam();

  const template = (location.state as { template?: DecisionTemplate } | null)?.template;

  useEffect(() => {
    // Set page title
    document.title = 'Create Proposal - ConsensusAI';
  }, []);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto pb-10">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-foreground">
            <ShimmerText className="inline-block">Create New Proposal</ShimmerText>
          </h1>
          <p className="text-lg text-muted-foreground/80 max-w-2xl">
            Define your proposal details, set up options, and establish criteria to guide your team's decision-making process.
          </p>
        </div>

        <ProposalWizard initialTemplate={template} initialTeamId={currentTeam?.id} />
      </div>
    </PageTransition>
  );
};

export default CreateProposal;
