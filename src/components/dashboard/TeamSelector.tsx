
import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTeams } from '@/hooks/useTeams';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamSelectorProps {
  selectedTeamId: string | 'all';
  onTeamChange: (teamId: string | 'all') => void;
  className?: string;
}

const TeamSelector = ({ selectedTeamId, onTeamChange, className }: TeamSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { teams, loading } = useTeams();
  const [selectedTeamName, setSelectedTeamName] = useState<string>('All Teams');

  useEffect(() => {
    if (selectedTeamId === 'all') {
      setSelectedTeamName('All Teams');
    } else {
      const team = teams.find(team => team.id === selectedTeamId);
      if (team) {
        setSelectedTeamName(team.name);
      }
    }
  }, [selectedTeamId, teams]);

  if (loading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between w-[200px]", className)}
        >
          <span className="truncate">{selectedTeamName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onTeamChange('all');
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedTeamId === 'all' ? "opacity-100" : "opacity-0"
                  )}
                />
                All Teams
              </CommandItem>
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  value={team.name}
                  onSelect={() => {
                    onTeamChange(team.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTeamId === team.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {team.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TeamSelector;
