
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProposalData {
  title: string;
  description: string;
  deadline: string;
  team_id?: string;
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
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
        <p className="text-consensus-grey-600 text-sm">
          Provide the fundamental details about your decision proposal.
        </p>
      </div>

      <div className="space-y-4">
        <FormItem className="space-y-2">
          <FormLabel>
            Team <span className="text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <Select
              value={proposalData.team_id}
              onValueChange={(value) => updateProposalData({ team_id: value })}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.length === 0 ? (
                  <SelectItem value="disabled" disabled>No teams found</SelectItem>
                ) : (
                  teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </FormControl>
          {errors.team_id && <FormMessage>{errors.team_id}</FormMessage>}
        </FormItem>

        <FormItem className="space-y-2">
          <FormLabel>
            Proposal Title <span className="text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <Input
              value={proposalData.title}
              onChange={(e) => updateProposalData({ title: e.target.value })}
              placeholder="E.g., New Office Location Decision"
              className="rounded-lg"
            />
          </FormControl>
          {errors.title && <FormMessage>{errors.title}</FormMessage>}
        </FormItem>

        <FormItem className="space-y-2">
          <FormLabel>
            Description <span className="text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <Textarea
              value={proposalData.description}
              onChange={(e) => updateProposalData({ description: e.target.value })}
              placeholder="Provide context and background for this decision..."
              className="min-h-[150px] rounded-lg"
            />
          </FormControl>
          {errors.description && <FormMessage>{errors.description}</FormMessage>}
        </FormItem>

        <FormItem className="space-y-2">
          <FormLabel>
            Decision Deadline <span className="text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <Input
              type="date"
              value={proposalData.deadline}
              onChange={(e) => updateProposalData({ deadline: e.target.value })}
              className="rounded-lg"
              min={new Date().toISOString().split('T')[0]} // Set min date to today
            />
          </FormControl>
          {errors.deadline && <FormMessage>{errors.deadline}</FormMessage>}
          <p className="text-sm text-consensus-grey-500">
            Contributors can submit input until this date
          </p>
        </FormItem>
      </div>
    </div>
  );
};

export default ProposalBasicInfo;
