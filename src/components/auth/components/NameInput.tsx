
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface NameInputProps {
  name: string;
  setName: (name: string) => void;
}

const NameInput = ({ name, setName }: NameInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="name" className="text-sm font-medium text-foreground">
        Full Name
      </Label>
      <div className="relative">
        <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="pl-10 py-6 rounded-xl bg-background border-input text-foreground"
          required
        />
      </div>
    </div>
  );
};

export default NameInput;
