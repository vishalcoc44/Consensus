import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Brain, Sparkles, AlertTriangle, Lightbulb, TrendingUp, RefreshCw, ChevronRight, Zap, Target, Shield, Info, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { fetchInsightsByTeam, generateInsight } from '@/services/aiService';
import type { AIInsight } from '@/types/phase3';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import ShimmerText from '@/components/ui/effects/ShimmerText';
import { TeamSelector } from '@/components/teams/TeamSelector';

const AIInsights = () => {
	const [insights, setInsights] = useState<AIInsight[]>([]);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState('all');
	const { currentTeam, isInitializing } = useTeam();
	const { toast } = useToast();

	useEffect(() => {
		if (!currentTeam) {
			setLoading(false);
			return;
		}
		loadInsights();
	}, [currentTeam]);

	const loadInsights = async () => {
		if (!currentTeam) return;

		try {
			const data = await fetchInsightsByTeam(currentTeam.id);
			setInsights(data);
		} catch (error) {
			console.error('Failed to load insights:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleGenerateInsight = async () => {
		if (!currentTeam) return;

		setGenerating(true);
		try {
			// Demo insight generation
			const demoInsight = await generateInsight(currentTeam.id, null, 'general');
			if (demoInsight) {
				setInsights([demoInsight, ...insights]);
				toast({ title: 'New insight generated' });
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to generate insight',
				variant: 'destructive',
			});
		} finally {
			setGenerating(false);
		}
	};

	const getInsightTypeConfig = (type: string) => {
		switch (type) {
			case 'recommendations':
			case 'suggestion':
				return {
					icon: Lightbulb,
					gradient: 'from-amber-500 to-orange-600',
					bgLight: 'bg-amber-50 dark:bg-amber-500/10',
					label: 'Recommendation',
				};
			case 'bias':
			case 'bias_detection':
				return {
					icon: AlertTriangle,
					gradient: 'from-rose-500 to-red-600',
					bgLight: 'bg-rose-50 dark:bg-rose-500/10',
					label: 'Bias Alert',
				};
			case 'pattern_analysis':
			case 'prediction':
				return {
					icon: TrendingUp,
					gradient: 'from-emerald-500 to-teal-600',
					bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
					label: 'Pattern',
				};
			case 'consensus_prediction':
				return {
					icon: Target,
					gradient: 'from-violet-500 to-purple-600',
					bgLight: 'bg-violet-50 dark:bg-violet-500/10',
					label: 'Consensus',
				};
			case 'sentiment':
				return {
					icon: Brain,
					gradient: 'from-pink-500 to-rose-600',
					bgLight: 'bg-pink-50 dark:bg-pink-500/10',
					label: 'Sentiment',
				};
			default:
				return {
					icon: Brain,
					gradient: 'from-sky-500 to-blue-600',
					bgLight: 'bg-sky-50 dark:bg-sky-500/10',
					label: 'Insight',
				};
		}
	};

	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 0.8) return 'from-emerald-500 to-green-600';
		if (confidence >= 0.6) return 'from-amber-500 to-orange-600';
		return 'from-rose-500 to-red-600';
	};

	const stats = useMemo(() => ({
		total: insights.length,
		recommendations: insights.filter(i => i.insight_type === 'recommendations' || i.insight_type === 'suggestion').length,
		risks: insights.filter(i => i.insight_type === 'bias' || i.insight_type === 'bias_detection').length,
		avgConfidence: insights.length > 0
			? Math.round((insights.reduce((sum, i) => sum + (i.confidence_score || 0), 0) / insights.length) * 100)
			: 0,
	}), [insights]);

	const filteredInsights = selectedCategory === 'all'
		? insights
		: selectedCategory === 'recommendations'
			? insights.filter(i => i.insight_type === 'recommendations' || i.insight_type === 'suggestion')
			: selectedCategory === 'bias'
				? insights.filter(i => i.insight_type === 'bias' || i.insight_type === 'bias_detection')
				: selectedCategory === 'pattern'
					? insights.filter(i => i.insight_type === 'pattern_analysis' || i.insight_type === 'prediction')
					: insights.filter(i => i.insight_type === selectedCategory);

	const categories = [
		{ value: 'all', label: 'All Insights', icon: Sparkles },
		{ value: 'recommendations', label: 'Recommendations', icon: Lightbulb },
		{ value: 'bias', label: 'Bias Alerts', icon: AlertTriangle },
		{ value: 'pattern', label: 'Patterns', icon: TrendingUp },
		{ value: 'consensus_prediction', label: 'Consensus', icon: Target },
		{ value: 'sentiment', label: 'Sentiment', icon: Brain },
	];

	if (isInitializing) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!currentTeam) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<div className="p-6 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 mb-6">
					<Brain className="h-12 w-12 text-violet-500" />
				</div>
				<h3 className="text-xl font-semibold mb-2">No Team Selected</h3>
				<p className="text-muted-foreground mb-4">Please select a team to view AI insights</p>
				<TeamSelector variant="full" />
			</div>
		);
	}

	return (
		<div className="space-y-8 animate-in fade-in duration-500 pb-10">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
						<div className="relative p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25">
							<Brain className="h-6 w-6" />
							<Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-pulse" />
						</div>
						<ShimmerText className="inline-block">AI Insights</ShimmerText>
					</h1>
					<p className="text-muted-foreground">
						Intelligent analysis powered by machine learning
					</p>
				</div>
				<div className="flex items-center gap-3">
					<TeamSelector variant="full" />
					<Button
						onClick={handleGenerateInsight}
						disabled={generating}
						className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
					>
						{generating ? (
							<>
								<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
								Analyzing...
							</>
						) : (
							<>
								<Zap className="h-4 w-4 mr-2" />
								Generate Insight
							</>
						)}
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{[
					{ label: 'Total Insights', value: stats.total, icon: Brain, gradient: 'from-violet-500 to-purple-600' },
					{ label: 'Recommendations', value: stats.recommendations, icon: Lightbulb, gradient: 'from-amber-500 to-orange-600' },
					{ label: 'Risk Alerts', value: stats.risks, icon: Shield, gradient: 'from-rose-500 to-red-600' },
					{ label: 'Avg. Confidence', value: `${stats.avgConfidence}%`, icon: BarChart3, gradient: 'from-emerald-500 to-teal-600' },
				].map((stat, index) => (
					<Card key={index} className="relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 shadow-md hover:shadow-lg transition-all duration-300">
						<div className={cn("absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 bg-gradient-to-br", stat.gradient)} />
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
									<p className="text-2xl font-bold mt-0.5">{stat.value}</p>
								</div>
								<div className={cn("p-2 rounded-lg bg-gradient-to-br", stat.gradient)}>
									<stat.icon className="h-4 w-4 text-white" />
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Filters */}
			<Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
				<TabsList className="h-10 p-1 bg-muted/50 rounded-xl w-full md:w-auto flex-wrap">
					{categories.map((cat) => (
						<TabsTrigger
							key={cat.value}
							value={cat.value}
							className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 gap-2"
						>
							<cat.icon className="h-4 w-4" />
							<span className="hidden sm:inline">{cat.label}</span>
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>

			{/* Insights Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{loading ? (
					Array.from({ length: 4 }).map((_, i) => (
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
								<Skeleton className="h-20 w-full" />
							</CardContent>
						</Card>
					))
				) : filteredInsights.length === 0 ? (
					<div className="col-span-full">
						<Card className="border-dashed">
							<CardContent className="flex flex-col items-center justify-center py-16">
								<div className="relative p-4 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 mb-4">
									<Brain className="h-8 w-8 text-violet-500" />
									<Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-500" />
								</div>
								<h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
								<p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
									Generate your first AI insight to get intelligent recommendations
								</p>
								<Button onClick={handleGenerateInsight} disabled={generating} className="rounded-xl">
									<Zap className="h-4 w-4 mr-2" />
									Generate First Insight
								</Button>
							</CardContent>
						</Card>
					</div>
				) : (
					filteredInsights.map((insight, index) => {
						const config = getInsightTypeConfig(insight.insight_type);
						const Icon = config.icon;
						const confidence = insight.confidence_score || 0;
						const confidencePercent = Math.round(confidence * 100);
						const confidenceGradient = getConfidenceColor(confidence);

						return (
							<Card
								key={insight.id}
								className="group relative overflow-hidden border-0 bg-gradient-to-br from-background to-muted/30 shadow-md hover:shadow-xl transition-all duration-500"
								style={{ animationDelay: `${index * 50}ms` }}
							>
								{/* Type indicator bar */}
								<div className={cn(
									"absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b",
									config.gradient
								)} />

								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-4">
										<div className="flex items-start gap-4">
											<div className={cn(
												"p-3 rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110",
												config.gradient
											)}>
												<Icon className="h-5 w-5 text-white" />
											</div>
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<Badge variant="secondary" className={cn("text-xs capitalize", config.bgLight)}>
														{config.label}
													</Badge>
													<span className="text-xs text-muted-foreground flex items-center gap-1">
														<Clock className="h-3 w-3" />
														{formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
													</span>
												</div>
											</div>
										</div>

										{/* Confidence Score */}
										<div className="text-right shrink-0">
											<div className={cn(
												"text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
												confidenceGradient
											)}>
												{confidencePercent}%
											</div>
											<p className="text-xs text-muted-foreground">confidence</p>
										</div>
									</div>
								</CardHeader>

								<CardContent className="pb-4">
									{/* Insight Content */}
									<div className={cn(
										"p-4 rounded-lg mb-4",
										config.bgLight
									)}>
										<p className="text-sm leading-relaxed">{insight.content}</p>
									</div>

									{/* Confidence Bar */}
									<div className="space-y-1">
										<div className="flex justify-between text-xs text-muted-foreground">
											<span>AI Confidence</span>
											<span>{confidencePercent}%</span>
										</div>
										<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
											<div
												className={cn("h-full transition-all duration-700 ease-out bg-gradient-to-r rounded-full", confidenceGradient)}
												style={{ width: `${confidencePercent}%` }}
											/>
										</div>
									</div>

									{/* Metadata */}
									{insight.metadata && Object.keys(insight.metadata).length > 0 && (
										<div className="mt-4 pt-3 border-t border-border/50">
											<div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
												<Info className="h-3 w-3" />
												Additional Context
											</div>
											<div className="flex flex-wrap gap-1.5">
												{Object.entries(insight.metadata).slice(0, 3).map(([key, value]) => (
													<Badge key={key} variant="outline" className="text-xs font-normal">
														{key}: {String(value)}
													</Badge>
												))}
											</div>
										</div>
									)}
								</CardContent>

								<CardFooter className="pt-0">
									<Button variant="ghost" className="w-full justify-between group/btn rounded-lg hover:bg-primary/5">
										<span className="text-sm">View Details</span>
										<ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
									</Button>
								</CardFooter>
							</Card>
						);
					})
				)}
			</div>

			{/* AI Disclaimer */}
			<Card className="border-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
				<CardContent className="p-4">
					<div className="flex items-start gap-3">
						<div className="p-2 rounded-lg bg-violet-500/10">
							<Info className="h-4 w-4 text-violet-500" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium">AI-Generated Insights</p>
							<p className="text-xs text-muted-foreground">
								These insights are generated by machine learning models and should be used as suggestions,
								not definitive conclusions. Always validate important decisions with human judgment.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default AIInsights;
