
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
  image_url?: string | null;
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
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Image (if exists) */}
        {proposal.image_url ? (
          <div className="w-full md:w-64 h-48 md:h-full min-h-[160px] shrink-0 rounded-lg overflow-hidden relative group bg-muted">
            <img
              src={proposal.image_url}
              alt={proposal.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : null}

        {/* Right Side: Content */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{proposal.title}</h1>
            <Badge className={`${getStatusColor(proposal.status)} px-3 py-1`}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
          </div>

          <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line line-clamp-3">
            {proposal.description}
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-500">
            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <span>Deadline: {formatDate(proposal.deadline)}</span>
            </div>

            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <Clock size={14} className="mr-2 text-gray-400" />
              <span>
                {daysRemaining > 0
                  ? `${daysRemaining} days remaining`
                  : 'Deadline passed'}
              </span>
            </div>

            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100">
              <User size={14} className="mr-2 text-gray-400" />
              <span>Created by: {proposal.createdBy}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalHeader;
