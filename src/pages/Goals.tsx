import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Target, Plus, TrendingUp, CheckCircle2, Circle, Trash2, X, ChevronRight, Sparkles, Flag, BarChart3, Trophy, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/components/ui/use-toast';
import {
	fetchObjectivesWithKeyResults,
	createObjective,
	deleteObjective,
} from '@/services/goalsService';
import type { Objective, KeyResult } from '@/types/phase3';
import { cn } from '@/lib/utils';
import ShimmerText from '@/components/ui/effects/ShimmerText';
import { TeamSelector } from '@/components/teams/TeamSelector';

type ObjectiveWithKeyResults = Objective & {
	key_results: KeyResult[];
};

const Goals = () => {
	const [objectives, setObjectives] = useState<ObjectiveWithKeyResults[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newObjective, setNewObjective] = useState({ title: '', description: '' });
	const { currentTeam, isInitializing } = useTeam();
	const { toast } = useToast();

	useEffect(() => {
		if (!currentTeam) {
			setLoading(false);
			return;
		}

		const loadObjectives = async () => {
			setLoading(true);
			try {
				const data = await fetchObjectivesWithKeyResults(currentTeam.id);
				setObjectives(data);
			} catch (error) {
				toast({
					title: 'Error',
					description: 'Failed to load objectives',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		};

		loadObjectives();
	}, [currentTeam]);

	const activeObjectives = objectives.filter(obj => obj.status === 'active');
	const avgProgress = activeObjectives.length > 0
		? Math.round(activeObjectives.reduce((sum, obj) => {
			const progress = calculateProgress(obj.key_results);
			return sum + progress;
		}, 0) / activeObjectives.length)
		: 0;

	const totalKeyResults = objectives.reduce((sum, obj) => sum + obj.key_results.length, 0);
	const completedObjectives = objectives.filter(obj => obj.status === 'completed').length;

	function calculateProgress(keyResults: KeyResult[]): number {
		if (keyResults.length === 0) return 0;

		const totalProgress = keyResults.reduce((sum, kr) => {
			if (kr.metric_type === 'percentage') {
				return sum + (kr.current_value || 0);
			} else if (kr.metric_type === 'number' && kr.target_value) {
				const progress = ((kr.current_value || 0) / kr.target_value) * 100;
				return sum + Math.min(progress, 100);
			} else if (kr.metric_type === 'boolean') {
				return sum + ((kr.current_value || 0) ? 100 : 0);
			}
			return sum;
		}, 0);

		return Math.round(totalProgress / keyResults.length);
	}

	const getProgressColor = (progress: number) => {
		if (progress >= 80) return 'from-emerald-500 to-green-600';
		if (progress >= 50) return 'from-amber-500 to-orange-600';
		return 'from-rose-500 to-red-600';
	};

	const handleCreateObjective = async () => {
		if (!currentTeam || !newObjective.title.trim()) return;

		try {
			const created = await createObjective({
				team_id: currentTeam.id,
				title: newObjective.title,
				description: newObjective.description,
				status: 'active',
				start_date: new Date().toISOString(),
				owner_id: null,
				target_date: null,
				parent_objective_id: null,
			});

			setObjectives([{ ...created, key_results: [] }, ...objectives]);
			setNewObjective({ title: '', description: '' });
			setShowCreateModal(false);
			toast({ title: 'Objective created' });
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to create objective',
				variant: 'destructive',
			});
		}
	};

	const handleDeleteObjective = async (id: string) => {
		try {
			await deleteObjective(id);
			setObjectives(objectives.filter(obj => obj.id !== id));
			toast({ title: 'Objective deleted' });
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to delete objective',
				variant: 'destructive',
			});
		}
	};

	// If initializing, show loading spinner
	if (isInitializing) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	// If not loading and no team selected, show empty state
	if (!loading && !currentTeam) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<div className="p-6 rounded-full bg-muted mb-6">
					<Target className="h-12 w-12 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold mb-2">No team selected</h3>
				<p className="text-muted-foreground mb-4">Please select a team to view goals</p>
				<TeamSelector variant="full" />
			</div>
		);
	}

	return (
		<div className="space-y-8 animate-in fade-in duration-500 pb-10">
			{/* Header */}
			<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
						<Target className="h-8 w-8 text-primary" />
						<ShimmerText className="inline-block">Goals & OKRs</ShimmerText>
					</h1>
					<p className="text-muted-foreground text-lg font-light">
						Align your team with clear, measurable objectives
					</p>
				</div>
				<div className="flex items-center gap-3">
					<TeamSelector variant="full" />
					<Button
						onClick={() => setShowCreateModal(true)}
						className="rounded-full px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
					>
						<Plus className="h-5 w-5 mr-2" />
						New Goal
					</Button>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ label: 'Active Goals', value: activeObjectives.length, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
					{ label: 'Avg. Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
					{ label: 'Key Results', value: totalKeyResults, icon: Flag, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
					{ label: 'Completed', value: completedObjectives, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
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

			{/* Goals List */}
			{loading ? (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-[200px] w-full rounded-2xl" />
					))}
				</div>
			) : objectives.length === 0 ? (
				<div className="rounded-2xl border-2 border-dashed border-muted p-12 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-black/20 backdrop-blur-sm">
					<div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
						<Target className="h-10 w-10 text-emerald-500" />
					</div>
					<h3 className="text-xl font-semibold mb-2">Start with a Goal</h3>
					<p className="text-muted-foreground max-w-sm mb-8">
						Create your first objective to align your team's efforts and track key results effectively.
					</p>
					<Button
						onClick={() => setShowCreateModal(true)}
						size="lg"
						className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25"
					>
						<Plus className="h-5 w-5 mr-2" />
						Create First Goal
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
					{objectives.map((objective, index) => {
						const progress = calculateProgress(objective.key_results);
						const progressColor = getProgressColor(progress);

						return (
							<div
								key={objective.id}
								className="group relative flex flex-col rounded-2xl border bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-4 border-black/5 dark:border-white/10"
								style={{ animationDelay: `${index * 100}ms` }}
							>
								{/* Progress Indicator Line */}
								<div className="absolute top-0 left-6 right-6 h-1 rounded-full bg-muted overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
									<div
										className={cn("h-full bg-gradient-to-r", progressColor)}
										style={{ width: `${progress}%` }}
									/>
								</div>

								<div className="p-5 flex-1 flex flex-col">
									<div className="flex items-start justify-between gap-3 mb-4">
										<div className="flex items-start gap-3">
											<div className={cn(
												"p-2.5 rounded-2xl bg-gradient-to-br shadow-inner shrink-0",
												progress >= 100
													? "from-emerald-500/20 to-teal-500/20 text-emerald-600"
													: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-500"
											)}>
												{progress >= 100 ? (
													<Trophy className="h-5 w-5" />
												) : (
													<Target className="h-5 w-5" />
												)}
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-bold text-base leading-tight truncate">{objective.title}</h3>
													<Badge
														variant="secondary"
														className={cn(
															"text-[10px] uppercase font-bold tracking-wider h-5 px-1.5 shrink-0",
															objective.status === 'active' && "bg-emerald-500/10 text-emerald-600",
															objective.status === 'completed' && "bg-blue-500/10 text-blue-600",
															objective.status === 'archived' && "bg-gray-500/10 text-gray-600"
														)}
													>
														{objective.status}
													</Badge>
												</div>
												{objective.description && (
													<p className="text-xs text-muted-foreground line-clamp-2">{objective.description}</p>
												)}
											</div>
										</div>

										<div className="flex flex-col items-end gap-1 shrink-0">
											<div className={cn(
												"text-xl font-black bg-gradient-to-br bg-clip-text text-transparent",
												progressColor
											)}>
												{progress}%
											</div>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDeleteObjective(objective.id)}
												className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-destructive/10"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</div>
									</div>

									{/* Key Results Section */}
									<div className="mt-auto space-y-3 pt-4 border-t border-dashed border-border/50">
										<div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
											<span>Key Results</span>
											<span>{objective.key_results.length} Total</span>
										</div>

										{objective.key_results.length === 0 ? (
											<div className="py-4 text-center text-sm text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
												No key results yet
											</div>
										) : (
											<div className="space-y-2">
												{objective.key_results.slice(0, 3).map((kr) => {
													const krProgress = kr.metric_type === 'percentage'
														? kr.current_value || 0
														: kr.metric_type === 'number' && kr.target_value
															? ((kr.current_value || 0) / kr.target_value) * 100
															: (kr.current_value || 0) ? 100 : 0;
													const isComplete = krProgress >= 100;

													return (
														<div
															key={kr.id}
															className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
														>
															{isComplete ? (
																<div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
																	<CheckCircle2 className="h-3.5 w-3.5 text-white" />
																</div>
															) : (
																<div className="relative h-5 w-5 shrink-0 flex items-center justify-center">
																	<Circle className="h-5 w-5 text-muted-foreground/30 absolute" />
																	<svg className="h-5 w-5 -rotate-90 transform text-emerald-500">
																		<circle
																			className="text-transparent"
																			strokeWidth="2"
																			strokeDasharray={100}
																			strokeDashoffset={100 - krProgress}
																			strokeLinecap="round"
																			stroke="currentColor"
																			fill="transparent"
																			r="8"
																			cx="10"
																			cy="10"
																		/>
																	</svg>
																</div>
															)}
															<span className={cn(
																"flex-1 text-sm font-medium truncate",
																isComplete && "text-muted-foreground line-through decoration-emerald-500/50"
															)}>
																{kr.title}
															</span>
															<span className="text-xs font-semibold text-muted-foreground">
																{Math.round(krProgress)}%
															</span>
														</div>
													);
												})}
												{objective.key_results.length > 3 && (
													<Button variant="link" className="w-full text-xs text-muted-foreground h-auto p-0 hover:text-foreground">
														+ {objective.key_results.length - 3} more results
													</Button>
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Create Modal */}
			<Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Create New Goal</DialogTitle>
						<DialogDescription>
							Set a team objective and track progress with key results
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="title" className="text-xs font-medium uppercase text-muted-foreground">Goal Title</Label>
							<Input
								id="title"
								value={newObjective.title}
								onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
								placeholder="e.g., Increase Q3 Revenue"
								className="rounded-xl border-border/50 bg-muted/50 focus:bg-background transition-colors"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description" className="text-xs font-medium uppercase text-muted-foreground">Description</Label>
							<Textarea
								id="description"
								value={newObjective.description}
								onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
								placeholder="Add context and details..."
								className="rounded-xl resize-none border-border/50 bg-muted/50 focus:bg-background transition-colors"
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="ghost" onClick={() => setShowCreateModal(false)} className="rounded-xl hover:bg-muted/50">
							Cancel
						</Button>
						<Button
							onClick={handleCreateObjective}
							className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25"
						>
							Create Goal
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Goals;
