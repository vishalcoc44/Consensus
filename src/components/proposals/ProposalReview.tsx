
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, ListFilter, Target, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface ProposalReviewProps {
  proposalData: ProposalData;
}

const ProposalReview = ({ proposalData }: ProposalReviewProps) => {
  // Format the date to be more readable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Review Proposal</h2>
        <p className="text-muted-foreground mt-1">
          Review all the details of your decision proposal before submitting.
        </p>
      </div>

      <div className="rounded-2xl border border-border/40 overflow-hidden bg-background/50 backdrop-blur-sm shadow-sm">
        {/* Header */}
        <div className="bg-muted/30 p-8 border-b border-border/40">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold tracking-tight">{proposalData.title || 'Untitled Proposal'}</h3>
              <Badge className="bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg border-0 h-6">Draft</Badge>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed">
              {proposalData.description || 'No description provided.'}
            </p>

            <div className="flex items-center gap-2 mt-2 text-sm font-medium text-muted-foreground bg-background/50 py-2 px-3 self-start rounded-lg border border-border/50">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Deadline: <span className="text-foreground">{formatDate(proposalData.deadline) || 'Not set'}</span></span>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Options Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ListFilter className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-lg">Defined Options</h4>
              <Badge variant="secondary" className="ml-auto">{proposalData.options.length}</Badge>
            </div>

            <div className="space-y-3">
              {proposalData.options.length > 0 ? (
                proposalData.options.map((option, index) => (
                  <div key={option.id} className="group p-4 rounded-xl bg-background/50 border border-border/40 hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{option.title || 'Untitled Option'}</span>
                    </div>
                    {option.description && (
                      <p className="text-sm text-muted-foreground pl-9 mt-1 line-clamp-2">{option.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm italic p-4 border border-dashed rounded-xl text-center">No options defined.</p>
              )}
            </div>
          </div>

          {/* Criteria Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-lg">Evaluation Criteria</h4>
              <Badge variant="secondary" className="ml-auto">{proposalData.criteria.length}</Badge>
            </div>

            <div className="space-y-3">
              {proposalData.criteria.length > 0 ? (
                proposalData.criteria.map((criterion, index) => (
                  <div key={criterion.id} className="group p-4 rounded-xl bg-background/50 border border-border/40 hover:border-purple-500/30 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="font-medium">{criterion.name || 'Untitled Criterion'}</span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-backgorund">{criterion.weight}/10</Badge>
                    </div>
                    {criterion.description && (
                      <p className="text-sm text-muted-foreground pl-9 mt-1 line-clamp-2">{criterion.description}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm italic p-4 border border-dashed rounded-xl text-center">No criteria defined.</p>
              )}
            </div>
          </div>
        </div>

        {/* What Happens Next - Footer */}
        <div className="bg-primary/5 p-6 border-t border-primary/10 flex gap-4">
          <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-primary">What happens next?</h5>
            <p className="text-sm text-muted-foreground">
              Once submitted, this proposal will be available for your team to contribute input.
              They can vote on options and provide comments until the deadline. After the deadline,
              ConsensusAI will analyze all inputs and generate insights to help finalize the decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalReview;
