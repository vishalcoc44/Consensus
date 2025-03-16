
import { useState } from 'react';
import { Users, Calendar, MoreVertical, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

interface DecisionCardProps {
  title: string;
  description: string;
  dueDate: string;
  participants: number;
  comments: number;
  progress: number;
  status: 'active' | 'completed' | 'archived';
  consensus: number;
}

const DecisionCard = ({
  title,
  description,
  dueDate,
  participants,
  comments,
  progress,
  status,
  consensus
}: DecisionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
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
  
  const getConsensusColor = (consensus: number) => {
    if (consensus >= 75) return 'text-emerald-600';
    if (consensus >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg line-clamp-1">{title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-consensus-grey-100 text-consensus-grey-500">
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">View details</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Edit decision</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-rose-600">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className={`text-consensus-grey-600 text-sm mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
          {description}
        </p>
        
        {description.length > 120 && (
          <button
            onClick={toggleExpand}
            className="text-xs text-consensus-blue hover:underline mb-4 inline-block"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
        
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center text-xs text-consensus-grey-600">
            <Calendar size={14} className="mr-1" />
            <span>Due {dueDate}</span>
          </div>
          
          <div className="flex items-center text-xs text-consensus-grey-600">
            <Users size={14} className="mr-1" />
            <span>{participants} participants</span>
          </div>
          
          <div className="flex items-center text-xs text-consensus-grey-600">
            <MessageCircle size={14} className="mr-1" />
            <span>{comments} comments</span>
          </div>
          
          <div className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-consensus-grey-600">Progress</span>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-consensus-grey-600">Consensus Level</span>
              <span className={`text-xs font-medium ${getConsensusColor(consensus)}`}>
                {consensus}%
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <ThumbsUp size={14} className="text-emerald-500" />
              <div className="bg-consensus-grey-200 h-1.5 rounded-full w-20 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${consensus}%` }}
                ></div>
              </div>
              <ThumbsDown size={14} className="text-rose-500" />
            </div>
          </div>
          
          <Button 
            size="sm" 
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-consensus-blue hover:bg-consensus-blue/90"
          >
            Contribute
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DecisionCard;
