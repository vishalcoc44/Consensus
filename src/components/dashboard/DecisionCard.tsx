
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
  status: 'draft' | 'active' | 'paused' | 'closed' | 'archived';
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
      case 'closed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'archived':
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
      case 'paused':
        return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'draft':
        return 'bg-slate-500/10 text-slate-600 border-slate-200';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="group relative rounded-xl overflow-hidden transition-all duration-300 h-full">
      {/* Gradient Overlay - appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>

      <div className="glass-panel relative rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm flex flex-col h-full shadow-sm hover:shadow-xl">
        {/* Card Header Image or Top Bar */}
        {imageUrl ? (
          <div className="w-full h-24 bg-muted relative overflow-hidden">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>

            {/* Status Badge on Image */}
            <div className="absolute top-2 right-2">
              <span className={`text-[9px] px-2 py-0.5 rounded-full border backdrop-blur-md font-semibold ${getStatusColor()} capitalize shadow-lg`}>
                {status}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-indigo-500"></div>
          </div>
        )}

        <div className={`p-3 flex-1 flex flex-col ${imageUrl ? '-mt-4 relative z-10' : ''}`}>
          {/* Title Row */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                {title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {!imageUrl && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getStatusColor()} capitalize font-semibold`}>
                  {status}
                </span>
              )}
              {(onDelete || onEdit) && (
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg bg-transparent hover:bg-muted transition-colors">
                        <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-lg">
                      {onEdit && (
                        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
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

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[32px] leading-relaxed">
            {description}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-colors">
              <CalendarDays size={12} className="text-primary" />
              <span className="font-medium text-[11px]">{dueDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users size={12} className="text-purple-500" />
                <span className="font-medium text-[11px]">{participants}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare size={12} className="text-blue-500" />
                <span className="font-medium text-[11px]">{comments}</span>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Progress</span>
              <span className="text-[10px] font-bold text-foreground">{progress}%</span>
            </div>

            <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${getProgressColor()} rounded-full transition-all duration-700 shadow-sm`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {status === 'closed' ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10">
                  <CircleCheck size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600">Closed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10">
                  <Clock size={12} className="text-blue-500" />
                  <span className="text-[10px] font-semibold text-blue-600">In progress</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {createdBy && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="opacity-70">by</span>
                  <span className="font-semibold text-foreground max-w-[80px] truncate">{createdBy.name || 'Unknown'}</span>
                </div>
              )}

              {/* Consensus Badge */}
              <div className="flex items-center">
                <div className={`px-2 py-0.5 rounded-lg ${getConsensusColor()} text-white font-bold text-[10px] shadow-lg flex items-center gap-1`}>
                  <span>{consensus}%</span>
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
