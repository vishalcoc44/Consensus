
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, HelpCircle } from 'lucide-react';
import ProposalBasicInfo from './ProposalBasicInfo';
import ProposalOptions from './ProposalOptions';
import ProposalCriteria from './ProposalCriteria';
import ProposalReview from './ProposalReview';
import { useToast } from '@/components/ui/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { proposalService } from '@/services/proposalService';

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

const steps = [
  {
    id: 'basic-info',
    title: 'Basic Info',
    description: 'Define the scope and timeframe for your decision'
  },
  {
    id: 'options',
    title: 'Options',
    description: 'Add the various choices to be considered'
  },
  {
    id: 'criteria',
    title: 'Criteria',
    description: 'Set evaluation criteria and weights'
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Confirm all details before submitting'
  }
];

const ProposalWizard = () => {
  const [activeTab, setActiveTab] = useState('basic-info');
  const [isLoading, setIsLoading] = useState(false);
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

  // Calculate current step index
  const currentStepIndex = steps.findIndex(step => step.id === activeTab);

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

  const handleSubmitProposal = async () => {
    try {
      setIsLoading(true);
      await proposalService.createProposal({
        title: proposalData.title,
        description: proposalData.description,
        deadline: proposalData.deadline,
        options: proposalData.options.map((opt, index) => ({
          title: opt.title,
          description: opt.description,
          order_index: index
        })),
        criteria: proposalData.criteria.map((crit, index) => ({
          name: crit.name,
          description: crit.description,
          weight: crit.weight,
          order_index: index
        }))
      });

      toast({
        title: "Proposal Created",
        description: "Your decision proposal has been successfully created.",
        duration: 5000,
      });

      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "There was a problem creating your proposal. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="glass-panel p-6 animate-fade-in">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-consensus-grey-600">Progress</span>
          <span className="text-sm font-medium text-consensus-blue">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-consensus-grey-200 rounded-full h-2">
          <div
            className="bg-consensus-blue h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          {steps.map(step => (
            <TooltipProvider key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value={step.id}
                    className="data-[state=active]:text-consensus-blue data-[state=active]:shadow"
                  >
                    {step.title}
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{step.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
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
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Check size={16} className="mr-2" />
                  Submit Proposal
                </>
              )}
            </Button>
          )}
        </div>

        {/* Help text */}
        <div className="mt-6 p-4 bg-consensus-blue/5 border border-consensus-blue/10 rounded-lg flex items-start">
          <HelpCircle size={20} className="text-consensus-blue mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-sm font-medium mb-1">Help with {steps[currentStepIndex].title}</h5>
            <p className="text-sm text-consensus-grey-600">{steps[currentStepIndex].description}</p>
            {activeTab === 'basic-info' && (
              <p className="text-sm text-consensus-grey-600 mt-2">
                Start by naming your decision and adding a clear description. Set a deadline to ensure timely inputs from all participants.
              </p>
            )}
            {activeTab === 'options' && (
              <p className="text-sm text-consensus-grey-600 mt-2">
                Add all possible options you want the team to consider. Each option should be distinct and well-described.
              </p>
            )}
            {activeTab === 'criteria' && (
              <p className="text-sm text-consensus-grey-600 mt-2">
                Define clear criteria against which all options will be evaluated. Set weights to indicate importance.
              </p>
            )}
            {activeTab === 'review' && (
              <p className="text-sm text-consensus-grey-600 mt-2">
                Review all information before finalizing. You can go back to previous steps if you need to make changes.
              </p>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default ProposalWizard;
