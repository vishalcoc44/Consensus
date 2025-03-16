
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Review Your Proposal</h2>
        <p className="text-consensus-grey-600 text-sm">
          Review all the details of your decision proposal before submitting.
        </p>
      </div>
      
      <Card className="overflow-hidden mb-6">
        <CardHeader className="bg-slate-50 pb-4">
          <CardTitle className="text-xl">{proposalData.title || 'Untitled Proposal'}</CardTitle>
          <div className="flex items-center text-sm text-consensus-grey-600 mt-2">
            <Calendar size={16} className="mr-2" />
            <span>Deadline: {formatDate(proposalData.deadline) || 'Not set'}</span>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-consensus-grey-700 mb-4 whitespace-pre-line">
            {proposalData.description || 'No description provided.'}
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle size={18} className="mr-2 text-green-600" />
              Options ({proposalData.options.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {proposalData.options.length > 0 ? (
              <div className="space-y-4">
                {proposalData.options.map((option, index) => (
                  <div key={option.id} className="p-3 rounded-lg bg-slate-50">
                    <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-200">Option {index + 1}</Badge>
                    <h4 className="font-medium">{option.title || 'Untitled Option'}</h4>
                    {option.description && (
                      <p className="text-sm text-consensus-grey-600 mt-1">{option.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-consensus-grey-500">No options defined.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle size={18} className="mr-2 text-green-600" />
              Criteria ({proposalData.criteria.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {proposalData.criteria.length > 0 ? (
              <div className="space-y-4">
                {proposalData.criteria.map((criterion, index) => (
                  <div key={criterion.id} className="p-3 rounded-lg bg-slate-50">
                    <Badge className="mb-2 bg-purple-100 text-purple-800 hover:bg-purple-200">Criterion {index + 1}</Badge>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{criterion.name || 'Untitled Criterion'}</h4>
                      <Badge variant="outline">Weight: {criterion.weight}/10</Badge>
                    </div>
                    {criterion.description && (
                      <p className="text-sm text-consensus-grey-600 mt-1">{criterion.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-consensus-grey-500">No criteria defined.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          <strong>What happens next?</strong> Once submitted, this proposal will be available for your team to contribute input. 
          They can vote on options and provide comments until the deadline. After the deadline, 
          ConsensusAI will analyze all inputs and generate insights to help finalize the decision.
        </p>
      </div>
    </div>
  );
};

export default ProposalReview;
