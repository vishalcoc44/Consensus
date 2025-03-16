
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProposalHeader from '@/components/proposals/ProposalHeader';
import ContributionForm from '@/components/proposals/ContributionForm';
import ContributionsOverview from '@/components/proposals/ContributionsOverview';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';

// Mock data - in a real app, this would come from an API
const mockProposal = {
  id: '1',
  title: 'New Office Location',
  description: 'We need to decide on a new office location that balances cost, accessibility, and amenities.',
  deadline: '2023-12-31',
  status: 'active',
  createdBy: 'Jane Smith',
  createdAt: '2023-11-15',
  options: [
    { id: 1, title: 'Downtown Office', description: 'Central location with good transit links but higher rent.' },
    { id: 2, title: 'Suburban Office Park', description: 'More space and parking, but requires longer commutes for most staff.' },
    { id: 3, title: 'Hybrid Solution', description: 'Smaller downtown office plus flexible remote work arrangement.' }
  ],
  criteria: [
    { id: 1, name: 'Cost', weight: 8, description: 'Monthly expenses including rent, utilities, and maintenance.' },
    { id: 2, name: 'Accessibility', weight: 6, description: 'How easily can employees and clients reach the office.' },
    { id: 3, name: 'Amenities', weight: 4, description: 'Available facilities like meeting rooms, cafeteria, and wellness areas.' }
  ]
};

const ProposalDetails = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contribute');
  const [proposal, setProposal] = useState(mockProposal);
  const [hasContributed, setHasContributed] = useState(false);

  useEffect(() => {
    // Set page title
    document.title = `${proposal.title} - ConsensusAI`;
    
    // In a real app, fetch the proposal details based on proposalId
    // For now, we'll use mock data
    console.log(`Fetching proposal with ID: ${proposalId}`);
    
    // Check if user has already contributed to this proposal
    // This would typically be a server-side check
    const mockHasContributed = false;
    setHasContributed(mockHasContributed);
  }, [proposalId, proposal.title]);

  const handleSubmitContribution = (contributionData) => {
    console.log('Submitting contribution:', contributionData);
    // In a real app, this would send the data to an API
    setHasContributed(true);
    // Show overview tab after submission
    setActiveTab('overview');
  };

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
        <TabsList className="grid grid-cols-2 mb-8">
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
      </Tabs>
    </DashboardLayout>
  );
};

export default ProposalDetails;
