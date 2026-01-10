
import { useState } from 'react';
import { MoreVertical, Mail, Calendar, Trash2, Check, Shield, PenTool, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

const roleThemes: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900",
  proposer: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900",
  contributor: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900",
  member: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800",
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-3 w-3 mr-1" />,
  proposer: <PenTool className="h-3 w-3 mr-1" />,
  contributor: <Check className="h-3 w-3 mr-1" />,
  member: <User className="h-3 w-3 mr-1" />,
};

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

  const normalizedRole = currentRole.toLowerCase();
  const themeClass = roleThemes[normalizedRole] || roleThemes.member;
  const RoleIcon = roleIcons[normalizedRole] || roleIcons.member;

  return (
    <div className="group relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl border border-border/60 rounded-xl bg-card">

      {/* Cover Background - Reduced height */}
      <div className="h-16 bg-gradient-to-br from-muted/50 to-muted w-full relative">
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className={cn("backdrop-blur-md shadow-sm uppercase text-[10px] tracking-wider px-1.5 py-0.5", themeClass)}>
            {RoleIcon}
            {currentRole}
          </Badge>
        </div>

        {/* Actions Menu - Floating top left/right if needed, or keep in content.
            Let's keep the standard 'more' menu but maybe style it fittingly.
            Actually, let's put it on the top left or next to badge?
            Let's put it top left for easy access. */}
        <div className="absolute top-2 left-2 z-10 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-6 w-6 bg-white/90 backdrop-blur-md shadow-sm hover:bg-white text-muted-foreground hover:text-foreground">
                <MoreVertical size={14} />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem className="text-destructive cursor-pointer focus:text-destructive" onClick={onRemove}>
                <Trash2 size={14} className="mr-2" />
                Remove member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-3 pt-0 flex-1 flex flex-col">
        {/* Header Row: Avatar overlaps cover - Reduced size */}
        <div className="flex justify-between items-end -mt-8 mb-2 px-1">
          <Avatar className="h-14 w-14 border-[3px] border-card shadow-md group-hover:scale-105 transition-transform duration-300">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-muted text-primary text-base font-bold">{getInitials(name)}</AvatarFallback>
          </Avatar>
        </div>

        {/* Text Content */}
        <div className="space-y-0.5 mb-3">
          <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors duration-200">
            {name}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground">
            <Mail size={12} className="mr-1 opacity-70" />
            <span className="line-clamp-1">{email}</span>
          </div>
        </div>

        <Separator className="bg-border/60 mb-3" />

        {/* Footer Stats / Controls */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-md">
              <Calendar size={10} className="mr-1 opacity-70" />
              <span>Joined {dateAdded}</span>
            </div>

            {/* Role Selector Compact */}
            <div className="scale-75 origin-right -mr-2">
              <TeamRoleSelector
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberCard;
