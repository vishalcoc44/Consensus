
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import TeamRoleSelector from './TeamRoleSelector';
import { useToast } from '@/components/ui/use-toast';
import { typedSupabase, extractProfileData } from "@/utils/supabaseClient";

interface AddTeamMemberDialogProps {
  onAddMember: (email: string, name: string, role: string) => void;
  teamId?: string;
}

const AddTeamMemberDialog = ({ onAddMember, teamId }: AddTeamMemberDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Contributor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!email.trim()) {
        toast({
          title: "Email is required",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      if (!name.trim()) {
        toast({
          title: "Name is required",
          description: "Please enter the team member's name",
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
      
      console.log("Searching for profile with name:", name);
      
      // Check if the profile exists
      const { data: profileData, error: profileQueryError } = await typedSupabase
        .from('profiles')
        .select('id')
        .ilike('full_name', name)
        .maybeSingle();
        
      if (profileQueryError) {
        console.error("Error querying profiles:", profileQueryError);
        throw profileQueryError;
      }

      let userId = profileData?.id;
      console.log("Found profile:", profileData);
      
      if (!userId) {
        console.log("Creating new profile for:", name);
        // Create a dummy profile for demonstration purposes
        const newUserId = crypto.randomUUID();
        const { data: newProfile, error: profileError } = await typedSupabase
          .from('profiles')
          .insert({
            id: newUserId,
            full_name: name,
            avatar_url: `https://i.pravatar.cc/150?u=${email}`
          })
          .select()
          .single();
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
          throw profileError;
        }
        
        if (!newProfile) {
          throw new Error('Failed to create user profile');
        }
        
        userId = newProfile.id;
        console.log("Created new profile with ID:", userId);
      }
      
      console.log("Adding team member with user ID:", userId, "to team:", teamId, "with role:", role);
      
      // Add the team member to the team
      const { error: teamMemberError } = await typedSupabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: role
        });
          
      if (teamMemberError) {
        console.error("Error adding team member:", teamMemberError);
        throw teamMemberError;
      }
      
      console.log("Team member added successfully");
      
      // Call the onAddMember callback (this will update the UI)
      onAddMember(email, name, role);
      
      // Reset form and close dialog
      setEmail('');
      setName('');
      setRole('Contributor');
      setOpen(false);
      
      toast({
        title: "Team member added",
        description: `${name} has been added to your team as a ${role}`,
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error adding team member",
        description: "There was an error adding the team member. Please try again.",
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
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
