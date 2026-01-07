
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MailIcon } from 'lucide-react';

interface EmailInputProps {
  email: string;
  setEmail: (email: string) => void;
}

const EmailInput = ({ email, setEmail }: EmailInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-medium text-foreground">
        Email Address
      </Label>
      <div className="relative">
        <MailIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-10 py-6 rounded-xl bg-background border-input text-foreground"
          required
        />
      </div>
    </div>
  );
};

export default EmailInput;
