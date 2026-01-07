
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import TeamRoleSelector from './TeamRoleSelector';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface AddTeamMemberDialogProps {
  onAddMember: (email: string, name: string, role: string) => void;
  teamId?: string;
}

const AddTeamMemberDialog = ({ onAddMember, teamId }: AddTeamMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('member'); // Default to member (valid enum value)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!email.trim() || !email.includes('@')) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (!teamId) {
        toast({
          title: "Team not found",
          description: "No team is selected. Please refresh the page and try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Get current user for invited_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to invite members.");
      }

      console.log("Creating invite for:", email, "to team:", teamId, "role:", role);

      // Create invite in Supabase
      const { error: inviteError } = await supabase
        .from('team_invites')
        .insert({
          team_id: teamId,
          email: email.trim(),
          role: role,
          invited_by: user.id,
          invited_by_email: user.email
        });

      if (inviteError) {
        console.error("Error creating invite:", inviteError);
        throw inviteError;
      }

      console.log("Invite sent successfully");

      // Reset form and close dialog
      setEmail('');
      setName(''); // Name might be used for email template later, but strictly speaking we invite by email
      setRole('member');
      setOpen(false);

      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${email}`,
      });

      // Notify parent to refresh list (optional, maybe to show pending invites)
      // We might want to update the signature of onAddMember to reflect it's an invite now, 
      // or just call it with dummy name/role to trigger a refresh if the parent fetches invites.
      // For now, we'll keep the signature but maybe the parent needs update too.
      onAddMember(email, name || email, role);

    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error sending invitation",
        description: error instanceof Error ? error.message : "There was an error sending the invitation.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-consensus-blue hover:bg-consensus-blue/90 rounded-lg">
          <UserPlus size={18} className="mr-2" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Invite a new member to join your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name field removed as we are inviting by email */}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <TeamRoleSelector currentRole={role} onRoleChange={setRole} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMemberDialog;
