import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadFileToSupabase } from '@/utils/fileUpload';
import { Image, Loader2, X, AlertTriangle } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface EditDecisionDialogProps {
	isOpen: boolean;
	onClose: () => void;
	decision: {
		id: string | number;
		title: string;
		description: string;
		dueDate: string; // ISO string or date string
		image_url?: string | null;
		status: 'draft' | 'active' | 'paused' | 'closed' | 'archived';
	};
	onUpdate: () => void;
}

const EditDecisionDialog = ({ isOpen, onClose, decision, onUpdate }: EditDecisionDialogProps) => {
	const [title, setTitle] = useState(decision.title);
	const [description, setDescription] = useState(decision.description);
	const [dueDate, setDueDate] = useState('');
	const [status, setStatus] = useState<'draft' | 'active' | 'paused' | 'closed' | 'archived'>(decision.status);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(decision.image_url || null);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		if (isOpen) {
			setTitle(decision.title);
			setDescription(decision.description);
			setStatus(decision.status);
			// Format date for input type="date"
			if (decision.dueDate && decision.dueDate !== 'No deadline') {
				const date = new Date(decision.dueDate);
				if (!isNaN(date.getTime())) {
					setDueDate(date.toISOString().split('T')[0]);
				}
			} else {
				setDueDate('');
			}
			setImageUrl(decision.image_url || null);
			setImageFile(null);
		}
	}, [isOpen, decision]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			if (file.size > 5 * 1024 * 1024) { // 5MB limit
				toast({
					title: "File too large",
					description: "Image size should be less than 5MB",
					variant: "destructive"
				});
				return;
			}
			setImageFile(file);
			// Create preview URL
			const url = URL.createObjectURL(file);
			setImageUrl(url);
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setImageUrl(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast({ title: "Title required", variant: "destructive" });
			return;
		}

		setLoading(true);
		try {
			let finalImageUrl = imageUrl;

			// Unload new image if selected
			if (imageFile) {
				// Assume 'decision-images' bucket exists, or fallback to 'uploads'
				// Using 'decision-images' as primary choice for organization
				const uploadedUrl = await uploadFileToSupabase(imageFile, 'decision-images', 'covers');
				if (uploadedUrl) {
					finalImageUrl = uploadedUrl;
				} else {
					// Fallback try 'uploads' if specific bucket fails (or handle error)
					const retryUrl = await uploadFileToSupabase(imageFile, 'uploads', 'decision-covers');
					if (retryUrl) finalImageUrl = retryUrl;
					else throw new Error("Failed to upload image");
				}
			}

			// Update proposal
			const { error } = await supabase
				.from('proposals')
				.update({
					title,
					description,
					deadline: dueDate ? new Date(dueDate).toISOString() : null,
					image_url: finalImageUrl,
					status
				})
				.eq('id', decision.id);

			if (error) throw error;

			toast({
				title: "Decision updated",
				description: "Your changes have been saved."
			});
			onUpdate();
			onClose();
		} catch (error: any) {
			console.error('Error updating decision:', error);
			toast({
				title: "Update failed",
				description: error.message || "Could not update decision",
				variant: "destructive"
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
				<DialogHeader>
					<DialogTitle>Edit Decision</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="edit-title">Title</Label>
						<Input
							id="edit-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Decision title"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-desc">Description</Label>
						<Textarea
							id="edit-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Description..."
							className="resize-none min-h-[100px]"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-date">Deadline</Label>
						<Input
							id="edit-date"
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<Label>Status</Label>
						<Select value={status} onValueChange={(val: any) => setStatus(val)}>
							<SelectTrigger>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="draft">Draft - Private, visible only to creators</SelectItem>
								<SelectItem value="active">Active - Open for voting</SelectItem>
								<SelectItem value="paused">Paused - Visible but voting disabled</SelectItem>
								<SelectItem value="closed">Closed - Voting ended, results final</SelectItem>
								<SelectItem value="archived">Archived - Hidden from main lists</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Cover Image</Label>
						<div className="flex flex-col gap-3">
							{imageUrl ? (
								<div className="relative w-full h-40 rounded-lg overflow-hidden border border-border group">
									<img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
									<div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
										<Button
											type="button"
											variant="destructive"
											size="sm"
											className="h-8 text-xs"
											onClick={removeImage}
										>
											<X size={14} className="mr-1" /> Remove Image
										</Button>
									</div>
								</div>
							) : (
								<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/10 transition-colors">
									<Image className="h-8 w-8 text-muted-foreground mb-2" />
									<p className="text-sm text-muted-foreground mb-2">Drag & drop or click to upload</p>
									<Input
										type="file"
										accept="image/*"
										className="hidden"
										id="image-upload"
										onChange={handleImageChange}
									/>
									<Button type="button" variant="outline" size="sm" asChild>
										<label htmlFor="image-upload" className="cursor-pointer">
											Select Image
										</label>
									</Button>
								</div>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
						<Button type="submit" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditDecisionDialog;
