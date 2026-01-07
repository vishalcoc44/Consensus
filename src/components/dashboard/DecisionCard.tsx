
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
    return 'bg-primary';
  };

  // Get status badge color
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'archived':
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="glass-panel relative rounded-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-primary/30 hover-green-glow group bg-card border-border">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500 opacity-60"></div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">{title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ml-2 border ${getStatusColor()} capitalize`}>
            {status}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">{description}</p>

        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex items-center text-muted-foreground">
            <CalendarDays size={14} className="mr-1" />
            <span>{dueDate}</span>
          </div>

          <div className="flex space-x-3">
            <div className="flex items-center text-muted-foreground">
              <Users size={14} className="mr-1" />
              <span>{participants}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MessageSquare size={14} className="mr-1" />
              <span>{comments}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>

        <Progress value={progress} className="h-1.5 bg-secondary">
          <div className={`h-full ${getProgressColor()} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
        </Progress>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center">
            {status === 'completed' ? (
              <CircleCheck size={16} className="text-emerald-500 mr-2" />
            ) : (
              <Clock size={16} className="text-blue-500 mr-2" />
            )}
            <span className="text-xs text-muted-foreground">
              {status === 'completed' ? 'Completed' : 'In progress'}
            </span>
          </div>

          <div className="flex items-center">
            <span className="text-xs mr-2 text-muted-foreground">Consensus</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center border border-border bg-muted font-semibold text-sm">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getConsensusColor()} text-primary-foreground`}>
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
