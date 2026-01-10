import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, FileText, Users, Crown } from 'lucide-react';

interface TeamRoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

const TeamRoleSelector = ({ currentRole, onRoleChange }: TeamRoleSelectorProps) => {
  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'owner':
        return 'text-amber-600';
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
      case 'owner':
        return <Crown size={14} className="mr-2 text-amber-600" />;
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
    <Select defaultValue={currentRole.toLowerCase()} onValueChange={onRoleChange} disabled={currentRole.toLowerCase() === 'owner'}>
      <SelectTrigger className={`w-[140px] h-9 text-sm ${getRoleColor(currentRole)} disabled:opacity-100 disabled:cursor-default`}>
        <div className="flex items-center">
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {currentRole.toLowerCase() === 'owner' && (
          <SelectItem value="owner" className="text-sm cursor-pointer focus:bg-amber-100 focus:text-amber-900 dark:focus:bg-amber-900/40 dark:focus:text-amber-100" textValue="Owner">
            <div className="flex items-center">
              <Crown size={14} className="mr-2 text-amber-600 group-hover:text-amber-700" />
              <span>Owner</span>
            </div>
          </SelectItem>
        )}
        <SelectItem value="admin" className="text-sm cursor-pointer focus:bg-purple-100 focus:text-purple-900 dark:focus:bg-purple-900/40 dark:focus:text-purple-100" textValue="Admin">
          <div className="flex items-center">
            <Shield size={14} className="mr-2 text-purple-600 group-hover:text-purple-700" />
            <span>Admin</span>
          </div>
        </SelectItem>
        {/* Proposer role not strictly in DB check constraint but might be needed. 
            Default constraint is ('owner', 'admin', 'member'). 
            Mapping "Contributor" to "member" for now to satisfy DB. 
        */}
        <SelectItem value="member" className="text-sm cursor-pointer focus:bg-emerald-100 focus:text-emerald-900 dark:focus:bg-emerald-900/40 dark:focus:text-emerald-100" textValue="Contributor">
          <div className="flex items-center">
            <Users size={14} className="mr-2 text-emerald-600 group-hover:text-emerald-700" />
            <span>Contributor</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default TeamRoleSelector;
