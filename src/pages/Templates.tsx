import React, { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FileText, Plus, Search, TrendingUp, Users, Briefcase, Lightbulb, Star, Sparkles, Copy, ArrowRight, Eye, Building2, Layers, ArrowUpRight, CheckCircle2, LayoutGrid, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeam } from '@/contexts/TeamContext';
import { createTemplate, fetchTemplates } from '@/services/templatesService';
import type { DecisionTemplate } from '@/types/phase2';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
	getCategoryGradient,
	getFrameworkBadge,
	getFrameworkStyle,
} from '@/utils/templateStyles';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import ShimmerText from '@/components/ui/effects/ShimmerText';

const Templates = () => {
	const { currentTeam } = useTeam();
	const navigate = useNavigate();
	const { toast } = useToast();
	const [templates, setTemplates] = useState<DecisionTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('all');
	const [selectedScope, setSelectedScope] = useState<'all' | 'team' | 'public'>('all');
	const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
	const [previewTemplate, setPreviewTemplate] = useState<DecisionTemplate | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);

	// Create form
	const [newTitle, setNewTitle] = useState('');
	const [newDescription, setNewDescription] = useState('');
	const [newCategory, setNewCategory] = useState<DecisionTemplate['category']>('other');
	const [newFramework, setNewFramework] = useState<DecisionTemplate['framework']>(null);
	const [newIsPublic, setNewIsPublic] = useState(false);

	useEffect(() => {
		loadTemplates();
	}, [currentTeam]);

	const loadTemplates = async () => {
		setLoading(true);
		try {
			const data = await fetchTemplates(currentTeam?.id, true);
			setTemplates(data);
		} catch (error) {
			console.error('Failed to load templates:', error);
			toast({
				title: 'Failed to load templates',
				description: 'Please try again.',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const getCategoryIcon = (category: string | null) => {
		switch (category) {
			case 'hiring': return Users;
			case 'budget': return TrendingUp;
			case 'strategy': return Lightbulb;
			case 'product': return Briefcase;
			case 'vendor': return Building2;
			default: return FileText;
		}
	};



	const getCategoryEmoji = (category: string | null) => {
		switch (category) {
			case 'hiring': return '👥';
			case 'budget': return '💰';
			case 'strategy': return '🎯';
			case 'product': return '🚀';
			case 'vendor': return '🏢';
			default: return '📁';
		}
	};

	const handleUseTemplate = async (template: DecisionTemplate) => {
		navigate('/dashboard/create-proposal', { state: { template } });
	};

	const filteredTemplates = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();

		const scopeFiltered = templates.filter((t) => {
			if (selectedScope === 'public') return t.is_public;
			if (selectedScope === 'team') return Boolean(currentTeam?.id) && t.team_id === currentTeam?.id;
			return true;
		});

		const categoryFiltered = scopeFiltered.filter((t) => {
			return selectedCategory === 'all' || t.category === selectedCategory;
		});

		const searched = categoryFiltered.filter((t) => {
			if (!q) return true;
			return (
				t.title.toLowerCase().includes(q) ||
				(t.description || '').toLowerCase().includes(q)
			);
		});

		const sorted = [...searched].sort((a, b) => {
			if (sortBy === 'popular') return (b.use_count || 0) - (a.use_count || 0);
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		});

		return sorted;
	}, [templates, searchQuery, selectedCategory, selectedScope, sortBy, currentTeam?.id]);

	const categories = [
		{ value: 'all', label: 'All', icon: ListFilter },
		{ value: 'hiring', label: 'Hiring', icon: Users },
		{ value: 'budget', label: 'Budget', icon: TrendingUp },
		{ value: 'strategy', label: 'Strategy', icon: Lightbulb },
		{ value: 'product', label: 'Product', icon: Briefcase },
		{ value: 'vendor', label: 'Vendor', icon: Building2 },
		{ value: 'other', label: 'Other', icon: FileText },
	];

	const publicTemplates = templates.filter(t => t.is_public);
	const teamTemplates = templates.filter(t => t.team_id === currentTeam?.id);
	const totalUses = templates.reduce((sum, t) => sum + (t.use_count || 0), 0);

	const getArrayCount = (value: any) => (Array.isArray(value) ? value.length : 0);

	const getFrameworkPreset = (framework: DecisionTemplate['framework']) => {
		const baseOptions = [
			{ title: 'Option A', description: '' },
			{ title: 'Option B', description: '' },
		];

		if (!framework) {
			return {
				criteria: [
					{ name: 'Impact', weight: 5, description: 'How much does this move the needle?' },
					{ name: 'Effort', weight: 4, description: 'Time/cost to execute.' },
					{ name: 'Risk', weight: 4, description: 'Downside if it goes wrong.' },
				],
				options: baseOptions,
			};
		}

		switch (framework) {
			case 'six-hats':
				return {
					criteria: [
						{ name: 'White Hat (Facts)', weight: 5, description: 'What do we know? What data is missing?' },
						{ name: 'Red Hat (Feelings)', weight: 3, description: 'Gut reactions, concerns, intuition.' },
						{ name: 'Black Hat (Risks)', weight: 5, description: 'What could go wrong? What are the risks?' },
						{ name: 'Yellow Hat (Benefits)', weight: 4, description: 'What are the upsides and opportunities?' },
						{ name: 'Green Hat (Ideas)', weight: 3, description: 'Alternatives, creativity, improvements.' },
						{ name: 'Blue Hat (Process)', weight: 2, description: 'Next steps, decision criteria, facilitation.' },
					],
					options: baseOptions,
				};
			case 'swot':
				return {
					criteria: [
						{ name: 'Strengths', weight: 4, description: 'What advantages do we have?' },
						{ name: 'Weaknesses', weight: 4, description: 'Where are we vulnerable?' },
						{ name: 'Opportunities', weight: 3, description: 'External opportunities we can capture.' },
						{ name: 'Threats', weight: 3, description: 'External risks and competition.' },
					],
					options: baseOptions,
				};
			case 'pros-cons':
				return {
					criteria: [
						{ name: 'Pros', weight: 4, description: 'Benefits and positive outcomes.' },
						{ name: 'Cons', weight: 4, description: 'Costs, downsides, tradeoffs.' },
					],
					options: baseOptions,
				};
			case 'weighted-criteria':
				return {
					criteria: [
						{ name: 'Impact', weight: 5, description: 'Expected value / upside.' },
						{ name: 'Cost', weight: 4, description: 'Money, resources, ongoing costs.' },
						{ name: 'Effort', weight: 4, description: 'Time and complexity.' },
						{ name: 'Risk', weight: 4, description: 'Likelihood × severity of failure.' },
					],
					options: baseOptions,
				};
			default:
				return { criteria: [], options: baseOptions };
		}
	};

	const handleDuplicate = async (template: DecisionTemplate) => {
		try {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('Not authenticated');
			if (!currentTeam?.id) throw new Error('Select a team first');

			const dup = await createTemplate({
				title: `${template.title} (copy)`,
				description: template.description,
				category: template.category,
				framework: template.framework,
				criteria: template.criteria,
				options: template.options,
				created_by: user.id,
				team_id: currentTeam.id,
				is_public: false,
			});

			toast({ title: 'Template duplicated', description: `Created "${dup.title}".` });
			loadTemplates();
		} catch (e: any) {
			toast({
				title: 'Could not duplicate template',
				description: e?.message || 'Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleCreateTemplate = async () => {
		try {
			setCreating(true);
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) throw new Error('Not authenticated');
			if (!newTitle.trim()) throw new Error('Title is required');

			const preset = getFrameworkPreset(newFramework);

			const created = await createTemplate({
				title: newTitle.trim(),
				description: newDescription.trim() || null,
				category: newCategory,
				framework: newFramework,
				criteria: preset.criteria,
				options: preset.options,
				created_by: user.id,
				team_id: currentTeam?.id ?? null,
				is_public: newIsPublic,
			});

			toast({ title: 'Template created', description: `Created "${created.title}".` });
			setIsCreateOpen(false);
			setNewTitle('');
			setNewDescription('');
			setNewCategory('other');
			setNewFramework(null);
			setNewIsPublic(false);
			loadTemplates();
		} catch (e: any) {
			toast({
				title: 'Could not create template',
				description: e?.message || 'Please try again.',
				variant: 'destructive',
			});
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-500 pb-10">
			{/* Header */}
			<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
						<FileText className="h-8 w-8 text-primary" />
						<ShimmerText className="inline-block">Templates Library</ShimmerText>
					</h1>
					<p className="text-muted-foreground text-lg font-light">
						Jumpstart your decisions with proven frameworks
					</p>
				</div>
				<Button
					onClick={() => setIsCreateOpen(true)}
					className="rounded-full px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:scale-105"
				>
					<Plus className="h-5 w-5 mr-2" />
					Create Template
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ label: 'Total Templates', value: templates.length, icon: FileText, color: 'text-[#818cf8]', bg: 'bg-[#818cf8]/10', border: 'border-[#818cf8]/20' },
					{ label: 'Public Templates', value: publicTemplates.length, icon: Star, color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/20' },
					{ label: 'Team Templates', value: teamTemplates.length, icon: Users, color: 'text-[#38bdf8]', bg: 'bg-[#38bdf8]/10', border: 'border-[#38bdf8]/20' },
					{ label: 'Total Uses', value: totalUses, icon: TrendingUp, color: 'text-[#34d399]', bg: 'bg-[#34d399]/10', border: 'border-[#34d399]/20' },
				].map((stat, index) => (
					<div
						key={index}
						className={cn(
							"group relative overflow-hidden rounded-2xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
							stat.border
						)}
					>
						<div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent to-white/5", stat.bg)} />
						<div className="relative p-6">
							<div className="flex items-center justify-between mb-4">
								<div className={cn("p-2.5 rounded-xl", stat.bg)}>
									<stat.icon className={cn("h-5 w-5", stat.color)} />
								</div>
								<ArrowUpRight className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300", stat.color)} />
							</div>
							<div>
								<p className="text-3xl font-bold tracking-tight">{stat.value}</p>
								<p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Search & Filters */}
			<div className="space-y-4">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white/50 dark:bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 dark:border-white/10 shadow-sm">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search templates..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 rounded-xl border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/50 focus:bg-background transition-all"
						/>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<Tabs value={selectedScope} onValueChange={(v) => setSelectedScope(v as any)} className="w-full sm:w-auto">
							<TabsList className="h-10 p-1 bg-muted/50 rounded-xl">
								<TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">All</TabsTrigger>
								<TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">My Team</TabsTrigger>
								<TabsTrigger value="public" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">Public</TabsTrigger>
							</TabsList>
						</Tabs>

						<Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
							<SelectTrigger className="h-10 w-[140px] rounded-xl bg-muted/50 border-transparent focus:border-primary">
								<SelectValue placeholder="Sort" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="newest">Newest</SelectItem>
								<SelectItem value="popular">Most used</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="flex items-center justify-between gap-3 flex-wrap">
					<Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
						<TabsList className="h-10 p-1 bg-transparent gap-2">
							{categories.map((cat) => (
								<TabsTrigger
									key={cat.value}
									value={cat.value}
									className={cn(
										"rounded-full border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 gap-2 transition-all",
										selectedCategory !== cat.value && "bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/40"
									)}
								>
									<cat.icon className="h-4 w-4" />
									<span className="hidden sm:inline">{cat.label}</span>
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
					<div className="text-xs font-medium text-muted-foreground px-2">
						Showing {filteredTemplates.length} template{filteredTemplates.length === 1 ? '' : 's'}
					</div>
				</div>
			</div>

			{/* Templates Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{loading ? (
					Array.from({ length: 6 }).map((_, i) => (
						<Skeleton key={i} className="h-[280px] w-full rounded-3xl" />
					))
				) : filteredTemplates.length === 0 ? (
					<div className="col-span-full">
						<div className="rounded-3xl border-2 border-dashed border-muted p-16 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-black/20 backdrop-blur-sm">
							<div className="h-20 w-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
								<Search className="h-10 w-10 text-violet-500" />
							</div>
							<h3 className="text-xl font-semibold mb-2">No templates found</h3>
							<p className="text-muted-foreground max-w-sm mb-8">
								{searchQuery ? 'Try adjusting your search or filters' : 'Create your first template to get started'}
							</p>
							<Button
								onClick={() => setIsCreateOpen(true)}
								className="rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25"
							>
								<Plus className="h-5 w-5 mr-2" />
								Create Template
							</Button>
						</div>
					</div>
				) : (
					filteredTemplates.map((template, index) => {
						const Icon = getCategoryIcon(template.category);
						const gradient = getCategoryGradient(template.category);
						const frameworkStyle = getFrameworkStyle(template.framework);
						const categoryEmoji = getCategoryEmoji(template.category);

						return (
							<div
								key={template.id}
								className={cn(
									"group relative flex flex-col rounded-3xl border bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-sm hover:shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-50 hover:-translate-y-2",
									frameworkStyle.border
								)}
								style={{ animationDelay: `${index * 50}ms` }}
							>
								{/* Top accent gradient */}
								<div className={cn("absolute top-0 inset-x-0 h-1.5 rounded-t-3xl bg-gradient-to-r opacity-80", gradient)} />

								<div className="p-6 flex-1 flex flex-col">
									<div className="flex items-start justify-between gap-4 mb-4">
										<div className="flex items-center gap-3">
											<div className={cn(
												"p-2.5 rounded-2xl bg-gradient-to-br shadow-inner text-white transform group-hover:scale-110 transition-transform duration-300",
												gradient
											)}>
												<Icon className="h-5 w-5" />
											</div>
											<div className="flex flex-col">
												<div className="flex items-center gap-2">
													{template.is_public && (
														<Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-0 h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider">
															Public
														</Badge>
													)}
													<span className="text-xs text-muted-foreground capitalize">{template.category}</span>
												</div>
											</div>
										</div>
									</div>

									<div className="space-y-2 mb-6">
										<h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors">{template.title}</h3>
										<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
											{template.description || 'No description provided'}
										</p>
									</div>

									<div className="mt-auto space-y-4">
										<div className="flex flex-wrap gap-2">
											{template.framework && (
												<Badge className={cn("text-xs font-medium border-0 px-2.5 py-1", frameworkStyle.badge)}>
													{getFrameworkBadge(template.framework)}
												</Badge>
											)}
										</div>

										<div className="flex items-center justify-between text-xs font-medium text-muted-foreground bg-muted/40 rounded-xl p-3 border border-white/5">
											<div className="flex gap-4">
												<span className="flex items-center gap-1.5">
													<FileText className="h-3.5 w-3.5 text-primary/70" />
													{getArrayCount(template.options)} options
												</span>
												<span className="flex items-center gap-1.5">
													<Layers className="h-3.5 w-3.5 text-primary/70" />
													{getArrayCount(template.criteria)} criteria
												</span>
											</div>
											<span className="flex items-center gap-1.5 text-foreground/80">
												<Copy className="h-3.5 w-3.5" />
												{template.use_count || 0}
											</span>
										</div>

										<div className="grid grid-cols-2 gap-3 pt-2">
											<Button
												variant="outline"
												className="rounded-xl border-muted-foreground/20 hover:bg-muted/50 hover:text-foreground"
												onClick={(e) => {
													e.stopPropagation();
													setPreviewTemplate(template);
												}}
											>
												<Eye className="h-4 w-4 mr-2" />
												Preview
											</Button>
											<Button
												className={cn(
													"rounded-xl bg-gradient-to-r text-white shadow-md hover:shadow-lg hover:brightness-110 border-0",
													gradient
												)}
												onClick={(e) => {
													e.stopPropagation();
													handleUseTemplate(template);
												}}
											>
												Use
												<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
											</Button>
										</div>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>


			{/* Create Template Dialog */}
			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent className="sm:max-w-[600px] border-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl shadow-2xl rounded-3xl">
					<DialogHeader>
						<DialogTitle className="text-2xl font-bold">Create template</DialogTitle>
						<DialogDescription className="text-base">
							Create a reusable decision framework for your team.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<div className="grid gap-2">
							<Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Template Title</Label>
							<Input
								id="title"
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
								placeholder="e.g. Executive Hiring Process"
								className="rounded-xl bg-muted/30 border-muted-foreground/20 focus:bg-background h-11"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Description</Label>
							<Textarea
								id="desc"
								value={newDescription}
								onChange={(e) => setNewDescription(e.target.value)}
								placeholder="Describe when to use this template..."
								className="rounded-xl bg-muted/30 border-muted-foreground/20 focus:bg-background resize-none min-h-[80px]"
							/>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Category</Label>
								<Select value={newCategory ?? 'other'} onValueChange={(v) => setNewCategory(v as any)}>
									<SelectTrigger className="rounded-xl h-11 bg-muted/30 border-muted-foreground/20">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="rounded-xl">
										{categories.filter(c => c.value !== 'all').map(c => (
											<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2">
								<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Framework</Label>
								<Select value={newFramework ?? 'none'} onValueChange={(v) => setNewFramework(v === 'none' ? null : (v as any))}>
									<SelectTrigger className="rounded-xl h-11 bg-muted/30 border-muted-foreground/20">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="rounded-xl">
										<SelectItem value="none">Custom (Empty)</SelectItem>
										<SelectItem value="swot">SWOT Analysis</SelectItem>
										<SelectItem value="six-hats">Six Thinking Hats</SelectItem>
										<SelectItem value="pros-cons">Pros &amp; Cons</SelectItem>
										<SelectItem value="weighted-criteria">Weighted Criteria</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex items-center justify-between rounded-2xl border border-muted-foreground/10 bg-muted/30 p-4">
							<div className="space-y-0.5">
								<div className="text-sm font-semibold">Public template</div>
								<div className="text-xs text-muted-foreground">Make visible to all authenticated users</div>
							</div>
							<Switch checked={newIsPublic} onCheckedChange={setNewIsPublic} />
						</div>
					</div>

					<DialogFooter className="gap-2 sm:gap-0">
						<Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl hover:bg-muted/50">
							Cancel
						</Button>
						<Button
							onClick={handleCreateTemplate}
							disabled={creating}
							className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 px-6"
						>
							{creating ? 'Creating...' : 'Create Template'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Preview Dialog */}
			<Dialog open={Boolean(previewTemplate)} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
				<DialogContent className="sm:max-w-[700px] border-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl shadow-3xl rounded-3xl overflow-hidden p-0 gap-0">
					{previewTemplate && (
						<div className="flex flex-col h-[80vh] sm:h-auto">
							<div className={cn(
								"p-6 pb-8 bg-gradient-to-br text-white",
								getCategoryGradient(previewTemplate.category)
							)}>
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-2">
										<div className="flex flex-wrap gap-2 text-white/90">
											{previewTemplate.is_public && (
												<Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">Public</Badge>
											)}
											<Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm capitalize">
												{previewTemplate.category}
											</Badge>
										</div>
										<h2 className="text-2xl font-bold">{previewTemplate.title}</h2>
										<p className="text-white/80 leading-relaxed font-light">
											{previewTemplate.description || 'No description provided'}
										</p>
									</div>
									<div className="text-5xl opacity-20 filter blur-[1px]">
										{getFrameworkStyle(previewTemplate.framework).accent}
									</div>
								</div>
							</div>

							<div className="flex-1 overflow-hidden bg-background">
								<ScrollArea className="h-[400px] w-full">
									<div className="p-6 space-y-8">
										{/* Options */}
										<div>
											<div className="flex items-center gap-2 mb-4">
												<div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
													<FileText className="h-4 w-4 text-blue-600" />
												</div>
												<h3 className="font-semibold text-lg">Options</h3>
												<Badge variant="secondary" className="rounded-full">{getArrayCount(previewTemplate.options)}</Badge>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
												{(Array.isArray(previewTemplate.options) ? previewTemplate.options : []).map((o: any, i: number) => (
													<div key={i} className="p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10 hover:border-primary/20 transition-colors">
														<div className="font-medium mb-1">{o?.title || `Option ${i + 1}`}</div>
														{o?.description && <div className="text-sm text-muted-foreground">{o.description}</div>}
													</div>
												))}
												{getArrayCount(previewTemplate.options) === 0 && (
													<div className="col-span-full py-8 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
														No preset options in this template
													</div>
												)}
											</div>
										</div>

										{/* Criteria */}
										<div>
											<div className="flex items-center gap-2 mb-4">
												<div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
													<Layers className="h-4 w-4 text-emerald-600" />
												</div>
												<h3 className="font-semibold text-lg">Criteria</h3>
												<Badge variant="secondary" className="rounded-full">{getArrayCount(previewTemplate.criteria)}</Badge>
											</div>
											<div className="space-y-3">
												{(Array.isArray(previewTemplate.criteria) ? previewTemplate.criteria : []).map((c: any, i: number) => (
													<div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-muted-foreground/10">
														<div className="flex flex-col">
															<span className="font-medium">{c?.name || c?.title || `Criterion ${i + 1}`}</span>
															{c?.description && <span className="text-xs text-muted-foreground">{c.description}</span>}
														</div>
														{typeof c?.weight === 'number' && (
															<div className="flex flex-col items-end">
																<Badge variant="outline" className="bg-background">Weight {c.weight}</Badge>
															</div>
														)}
													</div>
												))}
												{getArrayCount(previewTemplate.criteria) === 0 && (
													<div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
														No preset criteria in this template
													</div>
												)}
											</div>
										</div>
									</div>
								</ScrollArea>
							</div>

							<div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
								<Button variant="outline" className="rounded-xl" onClick={() => setPreviewTemplate(null)}>
									Close
								</Button>
								<Button
									className={cn(
										"rounded-xl shadow-lg text-white",
										getCategoryGradient(previewTemplate.category)
									)}
									onClick={() => handleUseTemplate(previewTemplate)}
								>
									Use Template
									<ArrowRight className="h-4 w-4 ml-2" />
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Templates;
