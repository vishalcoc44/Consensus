
import { CalendarDays, Users, MessageSquare, CircleCheck, Clock, MoreVertical, Trash } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface DecisionCardProps {
  title: string;
  description: string;
  dueDate: string;
  participants: number;
  comments: number;
  progress: number;
  status: 'active' | 'completed' | 'archived';
  consensus: number;
  onDelete?: () => void;
  onEdit?: () => void;
  imageUrl?: string | null;
  createdBy?: {
    name: string | null;
    avatarUrl: string | null;
  };
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
  onDelete,
  onEdit,
  imageUrl,
  createdBy,
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
    <div className="glass-panel relative rounded-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-primary/30 hover-green-glow group bg-card border-border flex flex-col h-full">
      {imageUrl ? (
        <div className="w-full h-24 bg-muted relative overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        </div>
      ) : (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-500 opacity-60"></div>
      )}

      <div className={`p-3 flex-1 flex flex-col ${imageUrl ? '' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-2">
            <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${getStatusColor()} capitalize`}>
              {status}
            </span>
            {(onDelete || onEdit) && (
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 bg-transparent hover:bg-muted/50">
                      <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit}>
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[32px]">{description}</p>

        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center text-muted-foreground">
            <CalendarDays size={12} className="mr-1" />
            <span>{dueDate}</span>
          </div>

          <div className="flex space-x-3">
            <div className="flex items-center text-muted-foreground">
              <Users size={12} className="mr-1" />
              <span>{participants}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MessageSquare size={12} className="mr-1" />
              <span>{comments}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Progress</span>
          <span className="text-[10px] text-muted-foreground">{progress}%</span>
        </div>

        <Progress value={progress} className="h-1 bg-secondary mb-auto">
          <div className={`h-full ${getProgressColor()} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
        </Progress>

        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center">
            {status === 'completed' ? (
              <CircleCheck size={14} className="text-emerald-500 mr-1.5" />
            ) : (
              <Clock size={14} className="text-blue-500 mr-1.5" />
            )}
            <span className="text-[10px] text-muted-foreground">
              {status === 'completed' ? 'Completed' : 'In progress'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {createdBy && (
              <div className="flex items-center text-[10px] text-muted-foreground">
                <span className="mr-1 opacity-70">by</span>
                <span className="font-medium text-foreground max-w-[80px] truncate">{createdBy.name || 'Unknown'}</span>
              </div>
            )}

            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full flex items-center justify-center border border-border bg-muted font-semibold text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${getConsensusColor()} text-primary-foreground text-[10px]`}>
                  {consensus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionCard;
