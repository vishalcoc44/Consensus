
import { Calendar, User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  createdBy: string;
  createdAt: string;
}

interface ProposalHeaderProps {
  proposal: Proposal;
}

const ProposalHeader = ({ proposal }: ProposalHeaderProps) => {
  // Format the dates to be more readable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
  // Calculate days remaining
  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining(proposal.deadline);
  
  // Get appropriate status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-2xl font-bold">{proposal.title}</h1>
        <Badge className={getStatusColor(proposal.status)}>
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </Badge>
      </div>
      
      <p className="text-consensus-grey-600 mb-4 whitespace-pre-line">
        {proposal.description}
      </p>
      
      <div className="flex flex-wrap gap-4 text-sm text-consensus-grey-600">
        <div className="flex items-center">
          <Calendar size={16} className="mr-2" />
          <span>Deadline: {formatDate(proposal.deadline)}</span>
        </div>
        
        <div className="flex items-center">
          <Clock size={16} className="mr-2" />
          <span>
            {daysRemaining > 0 
              ? `${daysRemaining} days remaining` 
              : 'Deadline passed'}
          </span>
        </div>
        
        <div className="flex items-center">
          <User size={16} className="mr-2" />
          <span>Created by: {proposal.createdBy}</span>
        </div>
      </div>
    </div>
  );
};

export default ProposalHeader;
