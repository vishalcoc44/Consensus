
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import ProposalBasicInfo from './ProposalBasicInfo';
import ProposalOptions from './ProposalOptions';
import ProposalCriteria from './ProposalCriteria';
import ProposalReview from './ProposalReview';
import { useToast } from '@/components/ui/use-toast';

interface ProposalData {
  title: string;
  description: string;
  deadline: string;
  options: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  criteria: Array<{
    id: number;
    name: string;
    weight: number;
    description: string;
  }>;
}

const ProposalWizard = () => {
  const [activeTab, setActiveTab] = useState('basic-info');
  const [proposalData, setProposalData] = useState<ProposalData>({
    title: '',
    description: '',
    deadline: '',
    options: [{ id: 1, title: '', description: '' }],
    criteria: [{ id: 1, name: '', weight: 5, description: '' }],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateProposalData = (data: Partial<ProposalData>) => {
    setProposalData(prev => ({ ...prev, ...data }));
  };

  const validateBasicInfo = () => {
    const errors: Record<string, string> = {};
    
    if (!proposalData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!proposalData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!proposalData.deadline) {
      errors.deadline = 'Deadline is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOptions = () => {
    const errors: Record<string, string> = {};
    
    if (proposalData.options.length < 2) {
      errors.options = 'At least 2 options are required';
    } else {
      const hasEmptyTitle = proposalData.options.some(option => !option.title.trim());
      if (hasEmptyTitle) {
        errors.options = 'All options must have a title';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCriteria = () => {
    const errors: Record<string, string> = {};
    
    if (proposalData.criteria.length < 1) {
      errors.criteria = 'At least 1 criterion is required';
    } else {
      const hasEmptyName = proposalData.criteria.some(criterion => !criterion.name.trim());
      if (hasEmptyName) {
        errors.criteria = 'All criteria must have a name';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextTab = () => {
    let isValid = false;
    
    switch (activeTab) {
      case 'basic-info':
        isValid = validateBasicInfo();
        if (isValid) setActiveTab('options');
        break;
      
      case 'options':
        isValid = validateOptions();
        if (isValid) setActiveTab('criteria');
        break;
      
      case 'criteria':
        isValid = validateCriteria();
        if (isValid) setActiveTab('review');
        break;
        
      default:
        break;
    }
  };

  const handlePrevTab = () => {
    switch (activeTab) {
      case 'options':
        setActiveTab('basic-info');
        break;
      
      case 'criteria':
        setActiveTab('options');
        break;
      
      case 'review':
        setActiveTab('criteria');
        break;
        
      default:
        break;
    }
  };

  const handleSubmitProposal = () => {
    // Here you would normally send the data to your API
    console.log('Submitting proposal:', proposalData);
    
    // Show success toast
    toast({
      title: "Proposal Created",
      description: "Your decision proposal has been successfully created.",
      duration: 5000,
    });
    
    // Navigate to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <Card className="animate-fade-in p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="basic-info" className="data-[state=active]:text-consensus-blue data-[state=active]:shadow">Basic Info</TabsTrigger>
          <TabsTrigger value="options" className="data-[state=active]:text-consensus-blue data-[state=active]:shadow">Options</TabsTrigger>
          <TabsTrigger value="criteria" className="data-[state=active]:text-consensus-blue data-[state=active]:shadow">Criteria</TabsTrigger>
          <TabsTrigger value="review" className="data-[state=active]:text-consensus-blue data-[state=active]:shadow">Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic-info">
          <ProposalBasicInfo
            proposalData={proposalData}
            updateProposalData={updateProposalData}
            errors={formErrors}
          />
        </TabsContent>
        
        <TabsContent value="options">
          <ProposalOptions
            options={proposalData.options}
            updateOptions={(options) => updateProposalData({ options })}
            errors={formErrors}
          />
        </TabsContent>
        
        <TabsContent value="criteria">
          <ProposalCriteria
            criteria={proposalData.criteria}
            updateCriteria={(criteria) => updateProposalData({ criteria })}
            errors={formErrors}
          />
        </TabsContent>
        
        <TabsContent value="review">
          <ProposalReview proposalData={proposalData} />
        </TabsContent>
        
        <div className="flex justify-between mt-8">
          {activeTab !== 'basic-info' ? (
            <Button 
              variant="outline" 
              onClick={handlePrevTab}
              className="rounded-lg"
            >
              <ArrowLeft size={16} className="mr-2" />
              Previous
            </Button>
          ) : (
            <div></div> // Empty div to maintain flex spacing
          )}
          
          {activeTab !== 'review' ? (
            <Button 
              onClick={handleNextTab}
              className="rounded-lg bg-consensus-blue hover:bg-consensus-blue/90"
            >
              Next
              <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitProposal}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
            >
              <Check size={16} className="mr-2" />
              Submit Proposal
            </Button>
          )}
        </div>
      </Tabs>
    </Card>
  );
};

export default ProposalWizard;
