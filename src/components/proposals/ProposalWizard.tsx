
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, HelpCircle, Layout, ListChecks, Settings2, FileText } from 'lucide-react';
import ProposalBasicInfo from './ProposalBasicInfo';
import ProposalOptions from './ProposalOptions';
import ProposalCriteria from './ProposalCriteria';
import ProposalReview from './ProposalReview';
import { useToast } from '@/components/ui/use-toast';
import { proposalService } from '@/services/proposalService';
import { supabase } from '@/integrations/supabase/client';
import type { DecisionTemplate } from '@/types/phase2';
import { cn } from '@/lib/utils';
import { getFrameworkStyle, getFrameworkBadge } from '@/utils/templateStyles';

interface ProposalData {
  title: string;
  description: string;
  deadline: string;
  team_id: string;
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
    description: 'Define scope & timeframe',
    icon: Layout
  },
  {
    id: 'options',
    title: 'Options',
    description: 'Choices to consider',
    icon: ListChecks
  },
  {
    id: 'criteria',
    title: 'Criteria',
    description: 'Evaluation metrics',
    icon: Settings2
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Final confirmation',
    icon: FileText
  }
];

interface ProposalWizardProps {
  initialTemplate?: DecisionTemplate;
  initialTeamId?: string;
}

const ProposalWizard = ({ initialTemplate, initialTeamId }: ProposalWizardProps) => {
  const [activeTab, setActiveTab] = useState('basic-info');
  const [isLoading, setIsLoading] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalData>({
    title: '',
    description: '',
    deadline: '',
    team_id: '',
    options: [{ id: 1, title: '', description: '' }],
    criteria: [{ id: 1, name: '', weight: 5, description: '' }],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get aesthetic styles based on template framework
  const frameworkStyle = getFrameworkStyle(initialTemplate?.framework || null);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (!initialTemplate) return;

    const templateOptions = Array.isArray(initialTemplate.options) ? initialTemplate.options : [];
    const templateCriteria = Array.isArray(initialTemplate.criteria) ? initialTemplate.criteria : [];

    setProposalData(prev => ({
      ...prev,
      title: initialTemplate.title || prev.title,
      description: initialTemplate.description || prev.description,
      team_id: initialTeamId || prev.team_id,
      options: templateOptions.length > 0
        ? templateOptions.map((opt: any, idx: number) => ({
          id: idx + 1,
          title: String(opt?.title ?? '').trim(),
          description: String(opt?.description ?? '').trim(),
        }))
        : prev.options,
      criteria: templateCriteria.length > 0
        ? templateCriteria.map((crit: any, idx: number) => ({
          id: idx + 1,
          name: String(crit?.name ?? crit?.title ?? '').trim(),
          weight: typeof crit?.weight === 'number' ? crit.weight : 5,
          description: String(crit?.description ?? '').trim(),
        }))
        : prev.criteria,
    }));

    toast({
      title: "Template loaded",
      description: `Using "${initialTemplate.title}" template with ${getFrameworkBadge(initialTemplate.framework)} styling.`,
    });
  }, [initialTemplate, initialTeamId]);

  const fetchTeams = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('team_members')
        .select('team:teams(id, name)')
        .eq('user_id', session.user.id);

      if (error) throw error;

      if (data) {
        // @ts-ignore - Supabase types are tricky with nested joins
        const formattedTeams = data.map(item => Array.isArray(item.team) ? item.team[0] : item.team).filter(Boolean) as any[];
        setTeams(formattedTeams);
        // Pre-select first team if available
        if (formattedTeams.length > 0 && !proposalData.team_id) {
          setProposalData(prev => ({ ...prev, team_id: formattedTeams[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // Calculate current step index
  const currentStepIndex = steps.findIndex(step => step.id === activeTab);

  const updateProposalData = (data: Partial<ProposalData>) => {
    setProposalData(prev => ({ ...prev, ...data }));
  };

  const validateBasicInfo = () => {
    const errors: Record<string, string> = {};
    if (!proposalData.title.trim()) errors.title = 'Title is required';
    if (!proposalData.description.trim()) errors.description = 'Description is required';
    if (!proposalData.deadline) errors.deadline = 'Deadline is required';
    if (!proposalData.team_id) errors.team_id = 'Team is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOptions = () => {
    const errors: Record<string, string> = {};
    if (proposalData.options.length < 2) errors.options = 'At least 2 options are required';
    else {
      const hasEmptyTitle = proposalData.options.some(option => !option.title.trim());
      if (hasEmptyTitle) errors.options = 'All options must have a title';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCriteria = () => {
    const errors: Record<string, string> = {};
    if (proposalData.criteria.length < 1) errors.criteria = 'At least 1 criterion is required';
    else {
      const hasEmptyName = proposalData.criteria.some(criterion => !criterion.name.trim());
      if (hasEmptyName) errors.criteria = 'All criteria must have a name';
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
      case 'options': setActiveTab('basic-info'); break;
      case 'criteria': setActiveTab('options'); break;
      case 'review': setActiveTab('criteria'); break;
      default: break;
    }
  };

  const handleSubmitProposal = async () => {
    try {
      setIsLoading(true);
      await proposalService.createProposal({
        title: proposalData.title,
        description: proposalData.description,
        deadline: proposalData.deadline,
        team_id: proposalData.team_id,
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

  // Progress percentage
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-8">
      {/* Modern Stepper */}
      <div className="glass-panel p-6 rounded-2xl border-white/20 dark:border-white/10 shadow-lg backdrop-blur-xl relative overflow-hidden">
        {/* Aesthetic background glow based on template */}
        <div className={cn("absolute inset-0 opacity-20 pointer-events-none blur-3xl", frameworkStyle.bg)} />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => {
              const isActive = step.id === activeTab;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.id} className={cn(
                  "flex flex-col items-center gap-2 relative z-10 transition-all duration-300",
                  isActive ? "opacity-100 scale-105" : isCompleted ? "opacity-80" : "opacity-40"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg border",
                    isActive
                      ? cn(frameworkStyle.activeStep, "border-transparent")
                      : isCompleted
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        : "bg-muted/30 border-transparent text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                  </div>
                  <div className="text-center hidden md:block">
                    <p className={cn("text-sm font-semibold", isActive && "text-foreground")}>{step.title}</p>
                    <p className="text-[10px] text-muted-foreground max-w-[80px] leading-tight mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}

            {/* Progress Line Background */}
            <div className="absolute top-6 left-0 w-full h-0.5 bg-muted/30 -z-10" />
            {/* Active Progress Line */}
            <div
              className={cn("absolute top-6 left-0 h-0.5 transition-all duration-500 ease-out -z-10", frameworkStyle.progress)}
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "glass-panel p-8 rounded-3xl min-h-[500px] border-white/40 dark:border-white/10 shadow-xl backdrop-blur-md transition-all duration-500",
        frameworkStyle.bg // Apply subtle background tint
      )}>
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500" key={activeTab}>
          {activeTab === 'basic-info' && (
            <ProposalBasicInfo
              proposalData={proposalData}
              updateProposalData={updateProposalData}
              errors={formErrors}
              teams={teams}
            />
          )}

          {activeTab === 'options' && (
            <ProposalOptions
              options={proposalData.options}
              updateOptions={(options) => updateProposalData({ options })}
              errors={formErrors}
            />
          )}

          {activeTab === 'criteria' && (
            <ProposalCriteria
              criteria={proposalData.criteria}
              updateCriteria={(criteria) => updateProposalData({ criteria })}
              errors={formErrors}
            />
          )}

          {activeTab === 'review' && (
            <ProposalReview proposalData={proposalData} />
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center py-4 px-2">
        <Button
          variant="ghost"
          onClick={handlePrevTab}
          disabled={activeTab === 'basic-info'}
          className="text-muted-foreground hover:text-foreground hover:bg-transparent px-0"
        >
          {activeTab !== 'basic-info' && (
            <>
              <ArrowLeft size={16} className="mr-2" />
              Back to {steps[Math.max(0, currentStepIndex - 1)].title}
            </>
          )}
        </Button>

        {activeTab !== 'review' ? (
          <Button
            onClick={handleNextTab}
            className={cn(
              "rounded-xl px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5",
              frameworkStyle.activeStep
            )}
          >
            Next: {steps[Math.min(steps.length - 1, currentStepIndex + 1)].title}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmitProposal}
            className="rounded-xl px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 bg-emerald-600 hover:bg-emerald-500 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                Creating...
              </div>
            ) : (
              <>
                <Check size={18} className="mr-2" />
                Submit Proposal
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProposalWizard;
