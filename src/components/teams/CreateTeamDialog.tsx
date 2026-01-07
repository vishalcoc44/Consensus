import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';

interface CreateTeamDialogProps {
	children?: React.ReactNode;
}

const CreateTeamDialog = ({ children }: CreateTeamDialogProps) => {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { createTeam } = useTeams();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		setIsSubmitting(true);
		try {
			const result = await createTeam(name, description);
			if (result) {
				setOpen(false);
				setName('');
				setDescription('');
			}
		} catch (error) {
			console.error('Failed to create team:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
						<Plus className="mr-2 h-4 w-4" />
						Create Team
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="h-5 w-5 text-primary" />
						Create New Team
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Create a new team to collaborate with others. You will be the admin.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name" className="text-foreground">
							Team Name
						</Label>
						<Input
							id="name"
							placeholder="e.g. Engineering, Marketing"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description" className="text-foreground">
							Description (Optional)
						</Label>
						<Textarea
							id="description"
							placeholder="Briefly describe what this team is for..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="bg-background border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary resize-none"
							rows={3}
						/>
					</div>
					<DialogFooter className="pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setOpen(false)}
							className="text-muted-foreground hover:text-foreground hover:bg-muted"
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-primary text-primary-foreground hover:bg-primary/90"
							disabled={isSubmitting || !name.trim()}
						>
							{isSubmitting ? 'Creating...' : 'Create Team'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateTeamDialog;
