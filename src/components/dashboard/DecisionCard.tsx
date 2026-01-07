
import { CalendarDays, Users, MessageSquare, CircleCheck, Clock } from 'lucide-react';
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
  consensus,
}: DecisionCardProps) => {
  // Calculate progress color based on progress value
  const getProgressColor = () => {
    if (progress < 30) return 'bg-amber-500';
    if (progress < 70) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  // Calculate consensus indicator color
  const getConsensusColor = () => {
    if (consensus < 40) return 'bg-red-500';
    if (consensus < 70) return 'bg-amber-500';
    return 'bg-consensus-green';
  };

  // Get status badge color
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="glass-panel relative rounded-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-consensus-green/30 hover-green-glow group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-consensus-green to-consensus-teal opacity-60"></div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-white line-clamp-1 group-hover:text-consensus-green transition-colors duration-300">{title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ml-2 border ${getStatusColor()} capitalize`}>
            {status}
          </span>
        </div>

        <p className="text-sm text-consensus-grey-300 mb-4 line-clamp-2 min-h-[40px]">{description}</p>

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center text-consensus-grey-400">
            <CalendarDays size={14} className="mr-1" />
            <span>{dueDate}</span>
          </div>

          <div className="flex space-x-3">
            <div className="flex items-center text-consensus-grey-400">
              <Users size={14} className="mr-1" />
              <span>{participants}</span>
            </div>
            <div className="flex items-center text-consensus-grey-400">
              <MessageSquare size={14} className="mr-1" />
              <span>{comments}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-consensus-grey-400">Progress</span>
          <span className="text-xs text-consensus-grey-300">{progress}%</span>
        </div>

        <Progress value={progress} className="h-1.5 bg-consensus-dark-200">
          <div className={`h-full ${getProgressColor()} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
        </Progress>

        <div className="mt-4 pt-4 border-t border-consensus-dark-200 flex items-center justify-between">
          <div className="flex items-center">
            {status === 'completed' ? (
              <CircleCheck size={16} className="text-emerald-500 mr-2" />
            ) : (
              <Clock size={16} className="text-blue-400 mr-2" />
            )}
            <span className="text-xs text-consensus-grey-400">
              {status === 'completed' ? 'Completed' : 'In progress'}
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-xs mr-2 text-consensus-grey-400">Consensus</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-consensus-dark-200 bg-consensus-dark-400 font-semibold text-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getConsensusColor()} text-consensus-dark-800`}>
                {consensus}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionCard;
