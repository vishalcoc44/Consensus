
import { useState } from 'react';
import { MoreVertical, Mail, Calendar, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import TeamRoleSelector from './TeamRoleSelector';


interface TeamMemberCardProps {
  name: string;
  email: string;
  role: string;
  avatar: string;
  dateAdded: string;
  onRemove?: () => void;
}

const TeamMemberCard = ({ name, email, role, avatar, dateAdded, onRemove }: TeamMemberCardProps) => {
  const [currentRole, setCurrentRole] = useState(role);

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    console.log(`Changed ${name}'s role to ${newRole}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="glass-panel p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 group bg-card border border-border">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-muted">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-muted text-primary">{getInitials(name)}</AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium text-lg text-foreground group-hover:text-primary transition-colors">{name}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail size={14} className="mr-1" />
              <span>{email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-muted-foreground hidden sm:flex">
            <Calendar size={14} className="mr-1" />
            <span>Added on {dateAdded}</span>
          </div>

          <TeamRoleSelector
            currentRole={currentRole}
            onRoleChange={handleRoleChange}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted hover:text-foreground">
                <MoreVertical size={16} />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">View activity</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Edit details</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Reset password</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer focus:text-destructive" onClick={onRemove}>
                <Trash2 size={14} className="mr-2" />
                Remove member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
