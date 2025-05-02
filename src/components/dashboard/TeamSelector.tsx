
import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Users } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

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

  const handleTeamChange = (teamId: string | 'all') => {
    onTeamChange(teamId);
    const teamName = teamId === 'all' ? 'All Teams' : teams.find(t => t.id === teamId)?.name || 'Unknown Team';
    toast({
      title: "Team Selected",
      description: `Switched to ${teamName}`,
      duration: 2000,
    });
  };

  // Generate initials for team avatar
  const getTeamInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a deterministic color based on team name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-amber-500', 'bg-rose-500', 'bg-teal-500',
      'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

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
          className={cn("justify-between w-[200px] transition-all hover:border-primary", className)}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedTeamId === 'all' ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                <Users className="h-3.5 w-3.5" />
              </div>
            ) : (
              <Avatar className="h-6 w-6">
                <AvatarFallback className={getAvatarColor(selectedTeamName)}>
                  {getTeamInitials(selectedTeamName)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="truncate">{selectedTeamName}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                No team found.
              </div>
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  handleTeamChange('all');
                  setOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Users className="h-4 w-4" />
                  </div>
                  <span>All Teams</span>
                </div>
                <Check
                  className={cn(
                    "ml-2 h-4 w-4",
                    selectedTeamId === 'all' ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              {teams.map((team) => (
                <CommandItem
                  key={team.id}
                  value={team.name}
                  onSelect={() => {
                    handleTeamChange(team.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={getAvatarColor(team.name)}>
                        {getTeamInitials(team.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{team.name}</span>
                      {team.members && (
                        <span className="text-xs text-muted-foreground">
                          {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      selectedTeamId === team.id ? "opacity-100" : "opacity-0"
                    )}
                  />
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
