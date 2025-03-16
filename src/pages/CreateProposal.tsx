
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProposalWizard from '@/components/proposals/ProposalWizard';

const CreateProposal = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Create Proposal - ConsensusAI';
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-sf font-bold mb-2">Create New Decision Proposal</h1>
        <p className="text-consensus-grey-600">
          Define your proposal details, options, and criteria to start the decision-making process
        </p>
      </div>
      
      <ProposalWizard />
    </DashboardLayout>
  );
};

export default CreateProposal;
