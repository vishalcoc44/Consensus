import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Calendar, User, AlignLeft, Flag } from 'lucide-react';

interface ProposalData {
  title: string;
  description: string;
  deadline: string;
  team_id: string;
}

interface ProposalBasicInfoProps {
  proposalData: ProposalData;
  updateProposalData: (data: Partial<ProposalData>) => void;
  errors: Record<string, string>;
  teams: { id: string; name: string }[];
}

const ProposalBasicInfo = ({
  proposalData,
  updateProposalData,
  errors,
  teams
}: ProposalBasicInfoProps) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Basic Information</h2>
        <p className="text-muted-foreground mt-1">
          Provide the fundamental details about your decision proposal.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Flag className="w-4 h-4 text-primary" />
                Team <span className="text-destructive">*</span>
              </Label>
              <Select
                value={proposalData.team_id}
                onValueChange={(value) => updateProposalData({ team_id: value })}
              >
                <SelectTrigger className="h-12 rounded-xl bg-background/50 border-input/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all">
                  <div className="flex items-center gap-2">
                    <SelectValue placeholder="Select a team" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-input/50 backdrop-blur-xl">
                  {teams.length === 0 ? (
                    <SelectItem value="disabled" disabled>No teams found</SelectItem>
                  ) : (
                    teams.map(team => (
                      <SelectItem key={team.id} value={team.id} className="cursor-pointer">{team.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.team_id && <p className="text-xs text-destructive font-medium ml-1">{errors.team_id}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Decision Deadline <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={proposalData.deadline}
                  onChange={(e) => updateProposalData({ deadline: e.target.value })}
                  className="h-12 rounded-xl bg-background/50 border-input/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all pl-4"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {errors.deadline && <p className="text-xs text-destructive font-medium ml-1">{errors.deadline}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Proposal Title <span className="text-destructive">*</span>
            </Label>
            <Input
              value={proposalData.title}
              onChange={(e) => updateProposalData({ title: e.target.value })}
              placeholder="E.g., New Office Location Decision"
              className="h-12 rounded-xl bg-background/50 border-input/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg placeholder:font-normal placeholder:text-muted-foreground/50"
            />
            {errors.title && <p className="text-xs text-destructive font-medium ml-1">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-primary" />
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={proposalData.description}
              onChange={(e) => updateProposalData({ description: e.target.value })}
              placeholder="Provide context and background for this decision..."
              className="min-h-[160px] rounded-xl bg-background/50 border-input/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none p-4"
            />
            {errors.description && <p className="text-xs text-destructive font-medium ml-1">{errors.description}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalBasicInfo;
