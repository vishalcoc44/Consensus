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
					<Button className="bg-consensus-green text-black hover:bg-consensus-green/90 font-medium">
						<Plus className="mr-2 h-4 w-4" />
						Create Team
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] glass-panel border-white/10 text-white">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Users className="h-5 w-5 text-consensus-green" />
						Create New Team
					</DialogTitle>
					<DialogDescription className="text-consensus-grey-400">
						Create a new team to collaborate with others. You will be the admin.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name" className="text-consensus-grey-300">
							Team Name
						</Label>
						<Input
							id="name"
							placeholder="e.g. Engineering, Marketing"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="bg-consensus-dark-300 border-white/10 text-white placeholder:text-consensus-grey-500 focus-visible:ring-consensus-green"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description" className="text-consensus-grey-300">
							Description (Optional)
						</Label>
						<Textarea
							id="description"
							placeholder="Briefly describe what this team is for..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="bg-consensus-dark-300 border-white/10 text-white placeholder:text-consensus-grey-500 focus-visible:ring-consensus-green resize-none"
							rows={3}
						/>
					</div>
					<DialogFooter className="pt-4">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setOpen(false)}
							className="text-consensus-grey-300 hover:text-white hover:bg-white/10"
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-consensus-green text-black hover:bg-consensus-green/90"
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
