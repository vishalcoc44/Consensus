import { useState, useEffect } from 'react';
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
import {
	Settings,
	Image as ImageIcon,
	Globe,
	Twitter,
	Github,
	MapPin,
	Tag,
	Lock,
	Unlock
} from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditTeamDialogProps {
	team: any;
	children?: React.ReactNode;
}

const EditTeamDialog = ({ team, children }: EditTeamDialogProps) => {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const { updateTeam } = useTeams();

	// Form States
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		avatar_url: '',
		banner_url: '',
		website_url: '',
		twitter_handle: '',
		github_url: '',
		location: '',
		mission_statement: '',
		join_policy: 'invite_only',
		is_public: false,
		tags: '' // stored as comma separated string for editing
	});

	useEffect(() => {
		if (team) {
			setFormData({
				name: team.name || '',
				description: team.description || '',
				avatar_url: team.avatar_url || '',
				banner_url: team.banner_url || '',
				website_url: team.website_url || '',
				twitter_handle: team.twitter_handle || '',
				github_url: team.github_url || '',
				location: team.location || '',
				mission_statement: team.mission_statement || '',
				join_policy: team.join_policy || 'invite_only',
				is_public: team.is_public || false,
				tags: Array.isArray(team.tags) ? team.tags.join(', ') : (team.tags || '')
			});
		}
	}, [team, open]);

	const handleChange = (field: string, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Process tags
			const processedTags = formData.tags
				.split(',')
				.map(t => t.trim())
				.filter(t => t.length > 0);

			const updates = {
				...formData,
				tags: processedTags
			};

			const success = await updateTeam(team.id, updates);
			if (success) {
				setOpen(false);
			}
		} catch (error) {
			console.error("Failed to update team", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children || (
					<Button variant="outline" size="sm" className="gap-2 border-consensus-grey-500 text-consensus-grey-300 hover:text-white hover:border-white">
						<Settings size={16} />
						Edit Team
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto glass-panel border-white/10 text-white">
				<DialogHeader>
					<DialogTitle>Edit Team Settings</DialogTitle>
					<DialogDescription>
						Update your team's profile, branding, and settings.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6 pt-4">
					<Tabs defaultValue="general" className="w-full">
						<TabsList className="grid w-full grid-cols-4 bg-consensus-dark-300">
							<TabsTrigger value="general">General</TabsTrigger>
							<TabsTrigger value="branding">Branding</TabsTrigger>
							<TabsTrigger value="social">Social</TabsTrigger>
							<TabsTrigger value="settings">Settings</TabsTrigger>
						</TabsList>

						{/* General Tab */}
						<TabsContent value="general" className="space-y-4 pt-4">
							<div className="space-y-2">
								<Label htmlFor="name">Team Name</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) => handleChange('name', e.target.value)}
									className="bg-consensus-dark-300 border-white/10"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) => handleChange('description', e.target.value)}
									className="bg-consensus-dark-300 border-white/10"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="mission">Mission Statement</Label>
								<Textarea
									id="mission"
									placeholder="What is your team's core mission?"
									value={formData.mission_statement}
									onChange={(e) => handleChange('mission_statement', e.target.value)}
									className="bg-consensus-dark-300 border-white/10 min-h-[100px]"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="location" className="flex items-center gap-2">
										<MapPin size={14} /> Location
									</Label>
									<Input
										id="location"
										placeholder="e.g. San Francisco, CA"
										value={formData.location}
										onChange={(e) => handleChange('location', e.target.value)}
										className="bg-consensus-dark-300 border-white/10"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="tags" className="flex items-center gap-2">
										<Tag size={14} /> Tags
									</Label>
									<Input
										id="tags"
										placeholder="DeFi, DAO, Governance (comma separated)"
										value={formData.tags}
										onChange={(e) => handleChange('tags', e.target.value)}
										className="bg-consensus-dark-300 border-white/10"
									/>
								</div>
							</div>
						</TabsContent>

						{/* Branding Tab */}
						<TabsContent value="branding" className="space-y-4 pt-4">
							<div className="space-y-2">
								<Label htmlFor="avatar" className="flex items-center gap-2">
									<ImageIcon size={14} /> Avatar URL
								</Label>
								<div className="flex gap-4 items-center">
									<div className="w-12 h-12 rounded-full overflow-hidden bg-consensus-dark-300 flex-shrink-0 border border-white/10">
										{formData.avatar_url ? (
											<img src={formData.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center text-xs text-consensus-grey-500">No Img</div>
										)}
									</div>
									<Input
										id="avatar"
										placeholder="https://..."
										value={formData.avatar_url}
										onChange={(e) => handleChange('avatar_url', e.target.value)}
										className="bg-consensus-dark-300 border-white/10 flex-1"
									/>
								</div>
								<p className="text-xs text-consensus-grey-400">Public URL for your team logo.</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="banner" className="flex items-center gap-2">
									<ImageIcon size={14} /> Banner URL
								</Label>
								<div className="w-full h-24 rounded-lg overflow-hidden bg-consensus-dark-300 border border-white/10 mb-2 relative group">
									{formData.banner_url ? (
										<img src={formData.banner_url} alt="Banner Preview" className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center text-sm text-consensus-grey-500">No Banner Image</div>
									)}
								</div>
								<Input
									id="banner"
									placeholder="https://..."
									value={formData.banner_url}
									onChange={(e) => handleChange('banner_url', e.target.value)}
									className="bg-consensus-dark-300 border-white/10"
								/>
								<p className="text-xs text-consensus-grey-400">Recommended size: 1200x300px.</p>
							</div>
						</TabsContent>

						{/* Social Tab */}
						<TabsContent value="social" className="space-y-4 pt-4">
							<div className="space-y-2">
								<Label htmlFor="website" className="flex items-center gap-2">
									<Globe size={14} /> Website
								</Label>
								<Input
									id="website"
									placeholder="https://yourteam.com"
									value={formData.website_url}
									onChange={(e) => handleChange('website_url', e.target.value)}
									className="bg-consensus-dark-300 border-white/10"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="twitter" className="flex items-center gap-2">
									<Twitter size={14} /> Twitter Handle
								</Label>
								<div className="relative">
									<span className="absolute left-3 top-2.5 text-consensus-grey-500">@</span>
									<Input
										id="twitter"
										placeholder="username"
										value={formData.twitter_handle}
										onChange={(e) => handleChange('twitter_handle', e.target.value)}
										className="bg-consensus-dark-300 border-white/10 pl-7"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="github" className="flex items-center gap-2">
									<Github size={14} /> GitHub Organization/Repo
								</Label>
								<Input
									id="github"
									placeholder="https://github.com/org"
									value={formData.github_url}
									onChange={(e) => handleChange('github_url', e.target.value)}
									className="bg-consensus-dark-300 border-white/10"
								/>
							</div>
						</TabsContent>

						{/* Settings Tab */}
						<TabsContent value="settings" className="space-y-4 pt-4">
							<div className="flex items-center justify-between p-4 rounded-lg bg-consensus-dark-300 border border-white/5">
								<div className="space-y-0.5">
									<Label className="text-base flex items-center gap-2">
										{formData.is_public ? <Unlock size={16} className="text-green-500" /> : <Lock size={16} className="text-amber-500" />}
										Public Visibility
									</Label>
									<p className="text-sm text-consensus-grey-400">
										Allow anyone to view your team page and public proposals.
									</p>
								</div>
								<Switch
									checked={formData.is_public}
									onCheckedChange={(checked) => handleChange('is_public', checked)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="join_policy">Join Policy</Label>
								<Select
									value={formData.join_policy}
									onValueChange={(value) => handleChange('join_policy', value)}
								>
									<SelectTrigger className="bg-consensus-dark-300 border-white/10">
										<SelectValue placeholder="Select a policy" />
									</SelectTrigger>
									<SelectContent className="bg-consensus-dark-300 border-white/10 text-white">
										<SelectItem value="open">Open (Anyone can join)</SelectItem>
										<SelectItem value="application">Application (Requires approval)</SelectItem>
										<SelectItem value="invite_only">Invite Only</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-xs text-consensus-grey-400">Control how new members can join your team.</p>
							</div>
						</TabsContent>
					</Tabs>

					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setOpen(false)}
							className="text-consensus-grey-300 hover:text-white"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-consensus-green text-black hover:bg-consensus-green/90"
							disabled={loading}
						>
							{loading ? 'Saving...' : 'Save Changes'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditTeamDialog;
