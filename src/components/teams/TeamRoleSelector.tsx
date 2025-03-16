
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, FileText, Users } from 'lucide-react';

interface TeamRoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

const TeamRoleSelector = ({ currentRole, onRoleChange }: TeamRoleSelectorProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'text-purple-600';
      case 'Proposer':
        return 'text-blue-600';
      case 'Contributor':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Shield size={14} className="mr-2 text-purple-600" />;
      case 'Proposer':
        return <FileText size={14} className="mr-2 text-blue-600" />;
      case 'Contributor':
        return <Users size={14} className="mr-2 text-green-600" />;
      default:
        return null;
    }
  };
  
  return (
    <Select defaultValue={currentRole} onValueChange={onRoleChange}>
      <SelectTrigger className={`w-[140px] h-9 text-sm ${getRoleColor(currentRole)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Admin" className="text-sm cursor-pointer">
          <div className="flex items-center">
            <Shield size={14} className="mr-2 text-purple-600" />
            <span>Admin</span>
          </div>
        </SelectItem>
        <SelectItem value="Proposer" className="text-sm cursor-pointer">
          <div className="flex items-center">
            <FileText size={14} className="mr-2 text-blue-600" />
            <span>Proposer</span>
          </div>
        </SelectItem>
        <SelectItem value="Contributor" className="text-sm cursor-pointer">
          <div className="flex items-center">
            <Users size={14} className="mr-2 text-green-600" />
            <span>Contributor</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TeamRoleSelector;
