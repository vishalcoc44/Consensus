import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FolderOpen, Upload, FileText, Image, Link as LinkIcon, Video, File, Search, Tag, Trash2, ExternalLink, Download, MoreVertical, Filter, Music, FileSpreadsheet, FileCode, Archive, Database, Monitor, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/contexts/TeamContext';
import { useUser } from '@/contexts/UserContext';
import { fetchResources, createResource, deleteResource } from '@/services/resourcesService';
import type { Resource } from '@/types/phase2';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import ShimmerText from '@/components/ui/effects/ShimmerText';

const Resources = () => {
	const { currentTeam } = useTeam();
	const { user } = useUser();
	const { toast } = useToast();
	const [resources, setResources] = useState<Resource[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [selectedType, setSelectedType] = useState<string>('all');

	// Form state
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const [url, setUrl] = useState('');
	const [tags, setTags] = useState('');
	const [uploadType, setUploadType] = useState<'file' | 'link'>('file');

	useEffect(() => {
		if (currentTeam) {
			loadResources();
		}
	}, [currentTeam]);

	const loadResources = async () => {
		if (!currentTeam) return;

		try {
			const data = await fetchResources(currentTeam.id);
			setResources(data);
		} catch (error) {
			console.error('Failed to load resources:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleUpload = async () => {
		if (!currentTeam || !user) return;
		if (!title.trim()) {
			toast({ title: 'Error', description: 'Please enter a title', variant: 'destructive' });
			return;
		}

		setUploading(true);

		try {
			let fileUrl = url;
			let fileType: 'pdf' | 'doc' | 'image' | 'link' | 'video' | 'audio' | 'spreadsheet' | 'code' | 'archive' | 'presentation' | null = uploadType === 'link' ? 'link' : null;
			let fileSize: number | null = null;

			if (uploadType === 'file' && file) {
				const fileExt = file.name.split('.').pop();
				const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
				const filePath = `${currentTeam.id}/${fileName}`;

				const { error: uploadError } = await supabase.storage
					.from('uploads')
					.upload(filePath, file);

				if (uploadError) throw uploadError;

				const { data: { publicUrl } } = supabase.storage
					.from('uploads')
					.getPublicUrl(filePath);

				fileUrl = publicUrl;
				fileSize = file.size;

				if (file.type.startsWith('image/')) fileType = 'image';
				else if (file.type.startsWith('video/')) fileType = 'video';
				else if (file.type.startsWith('audio/')) fileType = 'audio';
				else if (file.type.includes('pdf')) fileType = 'pdf';
				else if (
					file.type.includes('csv') ||
					file.type.includes('spreadsheet') ||
					file.type.includes('excel')
				) fileType = 'spreadsheet';
				else if (
					file.type.includes('json') ||
					file.type.includes('javascript') ||
					file.type.includes('html') ||
					file.type.includes('css') ||
					file.name.endsWith('.ts') ||
					file.name.endsWith('.tsx')
				) fileType = 'code';
				else if (
					file.type.includes('zip') ||
					file.type.includes('compressed') ||
					file.name.endsWith('.rar') ||
					file.name.endsWith('.7z')
				) fileType = 'archive';
				else if (
					file.type.includes('presentation') ||
					file.type.includes('powerpoint')
				) fileType = 'presentation';
				else fileType = 'doc';
			}

			await createResource({
				title,
				description: description || null,
				file_url: fileUrl || null,
				file_type: fileType,
				file_size: fileSize,
				tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : null,
				team_id: currentTeam.id,
				proposal_id: null,
				uploaded_by: user.id,
			});

			toast({ title: 'Success', description: 'Resource uploaded successfully' });

			setTitle('');
			setDescription('');
			setFile(null);
			setUrl('');
			setTags('');
			setIsDialogOpen(false);

			await loadResources();
		} catch (error) {
			console.error('Upload failed:', error);
			toast({ title: 'Error', description: 'Failed to upload resource', variant: 'destructive' });
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteResource(id);
			setResources(prev => prev.filter(r => r.id !== id));
			toast({ title: 'Success', description: 'Resource deleted' });
		} catch (error) {
			toast({ title: 'Error', description: 'Failed to delete resource', variant: 'destructive' });
		}
	};

	const handleDownload = async (url: string, filename: string) => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = downloadUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(downloadUrl);
		} catch (error) {
			console.error('Download failed:', error);
			window.open(url, '_blank');
		}
	};

	const getFileIcon = (type: string | null) => {
		switch (type) {
			case 'image': return Image;
			case 'video': return Video;
			case 'audio': return Music;
			case 'pdf': return FileText;
			case 'link': return LinkIcon;
			case 'spreadsheet': return FileSpreadsheet;
			case 'code': return FileCode;
			case 'archive': return Archive;
			case 'presentation': return Monitor;
			default: return File;
		}
	};

	const getFileGradient = (type: string | null) => {
		switch (type) {
			case 'image': return 'from-pink-500 to-rose-600';
			case 'video': return 'from-violet-500 to-purple-600';
			case 'audio': return 'from-amber-500 to-orange-600';
			case 'pdf': return 'from-red-500 to-orange-600';
			case 'link': return 'from-sky-500 to-blue-600';
			case 'spreadsheet': return 'from-emerald-500 to-green-600';
			case 'code': return 'from-slate-600 to-zinc-700';
			case 'archive': return 'from-yellow-500 to-amber-600';
			case 'presentation': return 'from-orange-500 to-red-600';
			default: return 'from-slate-500 to-gray-600';
		}
	};

	const formatFileSize = (bytes: number | null) => {
		if (!bytes) return '';
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
	};

	const filteredResources = resources.filter(resource => {
		const matchesSearch =
			resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

		const matchesType = selectedType === 'all' || resource.file_type === selectedType;

		return matchesSearch && matchesType;
	});

	const fileTypes = [
		{ value: 'all', label: 'All Files', icon: FolderOpen },
		{ value: 'pdf', label: 'PDFs', icon: FileText },
		{ value: 'image', label: 'Images', icon: Image },
		{ value: 'video', label: 'Videos', icon: Video },
		{ value: 'audio', label: 'Audio', icon: Music },
		{ value: 'spreadsheet', label: 'Sheets', icon: FileSpreadsheet },
		{ value: 'code', label: 'Code', icon: FileCode },
		{ value: 'archive', label: 'Archives', icon: Archive },
		{ value: 'link', label: 'Links', icon: LinkIcon },
	];

	if (!currentTeam) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<div className="p-6 rounded-full bg-muted mb-6">
					<FolderOpen className="h-12 w-12 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold mb-2">No team selected</h3>
				<p className="text-muted-foreground">Please select a team to view resources</p>
			</div>
		);
	}

	return (
		<div className="space-y-8 animate-fade-in pb-10">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
				<div>
					<h1 className="text-3xl font-bold font-sf mb-2 flex items-center gap-3">
						<FolderOpen className="h-8 w-8 text-primary" />
						<ShimmerText className="inline-block">Resources Hub</ShimmerText>
					</h1>
					<p className="text-muted-foreground text-lg">
						Centralized file and link management for your team
					</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5 whitespace-nowrap">
							<Upload className="h-4 w-4 mr-2" />
							Upload Resource
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle>Upload New Resource</DialogTitle>
							<DialogDescription>
								Add a file or link to your team's resource library
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							<div className="flex gap-2">
								<Button
									variant={uploadType === 'file' ? 'default' : 'outline'}
									onClick={() => setUploadType('file')}
									className="flex-1 rounded-xl"
								>
									<Upload className="h-4 w-4 mr-2" />
									Upload File
								</Button>
								<Button
									variant={uploadType === 'link' ? 'default' : 'outline'}
									onClick={() => setUploadType('link')}
									className="flex-1 rounded-xl"
								>
									<LinkIcon className="h-4 w-4 mr-2" />
									Add Link
								</Button>
							</div>

							<div className="space-y-2">
								<Label htmlFor="title">Title *</Label>
								<Input
									id="title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Resource title"
									className="rounded-xl"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Brief description"
									className="rounded-xl resize-none"
									rows={3}
								/>
							</div>

							{uploadType === 'file' ? (
								<div className="space-y-2">
									<Label htmlFor="file">File *</Label>
									<Input
										id="file"
										type="file"
										onChange={(e) => setFile(e.target.files?.[0] || null)}
										className="rounded-xl"
									/>
								</div>
							) : (
								<div className="space-y-2">
									<Label htmlFor="url">URL *</Label>
									<Input
										id="url"
										type="url"
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										placeholder="https://..."
										className="rounded-xl"
									/>
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="tags">Tags (comma-separated)</Label>
								<Input
									id="tags"
									value={tags}
									onChange={(e) => setTags(e.target.value)}
									placeholder="design, research, docs"
									className="rounded-xl"
								/>
							</div>
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
								Cancel
							</Button>
							<Button onClick={handleUpload} disabled={uploading} className="rounded-xl">
								{uploading ? 'Uploading...' : 'Upload'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>




			{/* Search & Filters */}
			{/* Search & Filters */}
			<div className="flex flex-col gap-6 md:flex-row md:items-center mb-10">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search resources..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 rounded-xl border-muted-foreground/20 bg-muted/50 focus:bg-background transition-colors"
					/>
				</div>
				<Tabs value={selectedType} onValueChange={setSelectedType} className="w-full md:w-auto">
					<TabsList className="h-10 p-1 bg-muted/50 rounded-xl">
						{fileTypes.map((type) => (
							<TabsTrigger
								key={type.value}
								value={type.value}
								className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 gap-2"
							>
								<type.icon className="h-4 w-4" />
								<span className="hidden sm:inline">{type.label}</span>
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			</div >

			{/* Resources Grid */}
			{/* Resources Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
				{
					loading ? (
						Array.from({ length: 6 }).map((_, i) => (
							<Card key={i} className="overflow-hidden">
								<CardHeader className="pb-4">
									<div className="flex items-start gap-4">
										<Skeleton className="h-12 w-12 rounded-xl" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-5 w-3/4" />
											<Skeleton className="h-4 w-1/2" />
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<Skeleton className="h-12 w-full" />
								</CardContent>
							</Card>
						))
					) : filteredResources.length === 0 ? (
						<div className="col-span-full">
							<Card className="border-dashed">
								<CardContent className="flex flex-col items-center justify-center py-16">
									<div className="p-4 rounded-full bg-muted mb-4">
										<FolderOpen className="h-8 w-8 text-muted-foreground" />
									</div>
									<h3 className="text-lg font-semibold mb-2">No resources found</h3>
									<p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
										{searchQuery
											? 'Try adjusting your search or filters'
											: 'Upload your first resource to get started'}
									</p>
									<Button variant="outline" onClick={() => setIsDialogOpen(true)} className="rounded-xl">
										<Upload className="h-4 w-4 mr-2" />
										Upload Resource
									</Button>
								</CardContent>
							</Card>
						</div>
					) : (
						filteredResources.map((resource, index) => {
							const Icon = getFileIcon(resource.file_type);
							const gradient = getFileGradient(resource.file_type);

							return (
								<div
									key={resource.id}
									className="group relative overflow-hidden rounded-xl transition-all duration-500 glass-panel hover:shadow-xl hover:-translate-y-1 min-h-[240px]"
									style={{ animationDelay: `${index * 50}ms` }}
								>
									<div className={cn(
										"absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br pointer-events-none",
										gradient
									)} />

									<div className="p-6 flex flex-col h-full">
										<div className="flex items-start justify-between gap-3 mb-6">
											<div className={cn(
												"p-3 rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110",
												gradient
											)}>
												<Icon className="h-6 w-6 text-white" />
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-50 hover:opacity-100">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="glass-panel border-border/50">
													{resource.file_url && (
														<>
															<DropdownMenuItem asChild>
																<a href={resource.file_url} target="_blank" rel="noopener noreferrer">
																	<ExternalLink className="h-4 w-4 mr-2" />
																	Open
																</a>
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={(e) => {
																	e.preventDefault();
																	if (resource.file_url) {
																		handleDownload(resource.file_url, resource.title);
																	}
																}}
															>
																<Download className="h-4 w-4 mr-2" />
																Download
															</DropdownMenuItem>
															<DropdownMenuSeparator className="bg-border/50" />
														</>
													)}
													<DropdownMenuItem
														onClick={() => handleDelete(resource.id)}
														className="text-destructive focus:text-destructive"
													>
														<Trash2 className="h-4 w-4 mr-2" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>

										<div className="flex-1 space-y-1">
											<h3 className="text-lg font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => resource.file_url && window.open(resource.file_url, '_blank')}>
												{resource.title}
											</h3>
											{resource.description && (
												<p className="text-sm text-muted-foreground line-clamp-2">
													{resource.description}
												</p>
											)}
										</div>

										<div className="mt-6 pt-4 border-t border-border/40 flex flex-col gap-3">
											{resource.tags && resource.tags.length > 0 && (
												<div className="flex flex-wrap gap-1.5 h-6 overflow-hidden">
													{resource.tags.slice(0, 3).map((tag, idx) => (
														<Badge
															key={idx}
															variant="secondary"
															className="text-[10px] font-medium bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 px-1.5 py-0 rounded-md h-5"
														>
															<Tag className="h-3 w-3 mr-1" />
															{tag}
														</Badge>
													))}
													{resource.tags.length > 3 && (
														<Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
															+{resource.tags.length - 3}
														</Badge>
													)}
												</div>
											)}

											<div className="flex items-center justify-between w-full text-xs text-muted-foreground font-medium">
												<span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
												{resource.file_size && (
													<span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{formatFileSize(resource.file_size)}</span>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})
					)
				}
			</div >
		</div >
	);
};

export default Resources;
