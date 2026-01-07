
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
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'text-purple-600';
      case 'proposer':
        return 'text-blue-600';
      case 'contributor':
      case 'member':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Shield size={14} className="mr-2 text-purple-600" />;
      case 'proposer':
        return <FileText size={14} className="mr-2 text-blue-600" />;
      case 'contributor':
      case 'member':
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
        <SelectItem value="admin" className="text-sm cursor-pointer">
          <div className="flex items-center">
            <Shield size={14} className="mr-2 text-purple-600" />
            <span>Admin</span>
          </div>
        </SelectItem>
        {/* Proposer role not strictly in DB check constraint but might be needed. 
            Default constraint is ('owner', 'admin', 'member'). 
            Mapping "Contributor" to "member" for now to satisfy DB. 
        */}
        <SelectItem value="member" className="text-sm cursor-pointer">
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
