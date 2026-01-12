import { ArrowRight, BrainCircuit, Users, BarChart3, ShieldCheck, Zap, MessageSquare, Target, Video, Calendar, Copy, Play, Bell, FileText, Upload, Clock, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DecisionCard from '@/components/dashboard/DecisionCard';
import OptionSupportChart from '@/components/analytics/charts/OptionSupportChart';
import TeamMemberCard from '@/components/teams/TeamMemberCard';
import { Link } from 'react-router-dom';

const Features = () => {
	// Mock Data
	const mockDecision = {
		title: "Q3 Product Roadmap Strategy",
		description: "Decide on the key features and priorities for the upcoming quarter to align engineering and marketing efforts.",
		dueDate: "2 days left",
		participants: 12,
		comments: 34,
		progress: 65,
		status: 'active' as const,
		consensus: 78
	};

	const mockChartData = [
		{ option: 'Feature A', score: 85, votes: 45, percentage: 45, sentiment: 0.85 },
		{ option: 'Feature B', score: 65, votes: 30, percentage: 30, sentiment: 0.60 },
		{ option: 'Feature C', score: 45, votes: 20, percentage: 25, sentiment: 0.40 },
	];

	const mockMember = {
		name: "Sarah Miller",
		email: "sarah@consensus.ai",
		role: "admin",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
		dateAdded: "Oct 24, 2023"
	};

	// Mock Components for Phase 3 Features (Goals, Meetings, AI Insights)
	// Goal Card Mock
	const MockGoalCard = () => (
		<div className="group relative flex flex-col rounded-2xl border bg-card/80 backdrop-blur-xl shadow-lg border-primary/10 w-full max-w-md mx-auto transform hover:scale-[1.02] transition-transform duration-500">
			<div className="absolute top-0 left-6 right-6 h-1 rounded-full bg-muted overflow-hidden opacity-100 mt-[-2px]">
				<div className="h-full bg-gradient-to-r from-emerald-500 to-green-600" style={{ width: '75%' }} />
			</div>
			<div className="p-5 flex-1 flex flex-col">
				<div className="flex items-start justify-between gap-3 mb-4">
					<div className="flex items-start gap-3">
						<div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600 shadow-inner shrink-0">
							<Zap className="h-5 w-5" />
						</div>
						<div className="min-w-0">
							<div className="flex items-center gap-2 mb-1">
								<h3 className="font-bold text-base leading-tight truncate">Increase Market Share</h3>
								<span className="text-[10px] uppercase font-bold tracking-wider h-5 px-1.5 shrink-0 bg-emerald-500/10 text-emerald-600 rounded-md flex items-center">Active</span>
							</div>
							<p className="text-xs text-muted-foreground line-clamp-2">Expand our presence in the enterprise sector by Q4.</p>
						</div>
					</div>
					<div className="flex flex-col items-end gap-1 shrink-0">
						<div className="text-xl font-black bg-gradient-to-br from-emerald-500 to-green-600 bg-clip-text text-transparent">75%</div>
					</div>
				</div>
				<div className="mt-auto space-y-3 pt-4 border-t border-dashed border-border/50">
					<div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
						<span>Key Results</span>
						<span>3 Total</span>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
							<div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
								<ShieldCheck className="h-3.5 w-3.5 text-white" />
							</div>
							<span className="flex-1 text-sm font-medium truncate text-muted-foreground line-through decoration-emerald-500/50">Secure 5 Fortune 500 Clients</span>
							<span className="text-xs font-semibold text-muted-foreground">100%</span>
						</div>
						<div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
							<div className="relative h-5 w-5 shrink-0 flex items-center justify-center">
								<div className="h-5 w-5 rounded-full border-2 border-emerald-500/30" />
								<div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-l-transparent border-b-transparent -rotate-45" />
							</div>
							<span className="flex-1 text-sm font-medium truncate">Grow Enterprise Revenue to $2M</span>
							<span className="text-xs font-semibold text-muted-foreground">60%</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	// Insight Card Mock
	const MockInsightCard = () => (
		<div className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-background to-muted/30 shadow-xl w-full max-w-md mx-auto transform hover:-translate-y-2 transition-transform duration-500">
			<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-600" />
			<div className="p-4 pb-3">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-4">
						<div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg text-white">
							<BrainCircuit className="h-5 w-5" />
						</div>
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<span className="text-xs capitalize bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md font-medium text-amber-700 dark:text-amber-400">Recommendation</span>
								<span className="text-xs text-muted-foreground">Just now</span>
							</div>
						</div>
					</div>
					<div className="text-right shrink-0">
						<div className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">92%</div>
						<p className="text-xs text-muted-foreground">confidence</p>
					</div>
				</div>
			</div>
			<div className="px-4 pb-4">
				<div className="p-4 rounded-lg mb-4 bg-amber-50 dark:bg-amber-500/10">
					<p className="text-sm leading-relaxed text-foreground">
						Based on recent voting patterns, team alignment is highest on Option B. Consider resolving the deadlock by focusing discussion on implementation details of B.
					</p>
				</div>
				<div className="space-y-1">
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>AI Confidence</span>
						<span>92%</span>
					</div>
					<div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
						<div className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" style={{ width: '92%' }} />
					</div>
				</div>
			</div>
		</div>
	);

	// Meeting Room Mock
	const MockMeetingCard = () => (
		<div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg w-full max-w-md mx-auto transform hover:-translate-y-1 transition-all duration-300">
			{/* Status indicator bar */}
			<div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

			{/* Live badge */}
			<div className="absolute top-4 right-4 z-10">
				<div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-xs font-medium shadow-lg shadow-emerald-500/20 animate-pulse">
					<span className="relative flex h-2 w-2">
						<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
						<span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
					</span>
					Live
				</div>
			</div>

			<div className="p-5 space-y-4">
				<div className="flex items-start gap-4">
					<div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg text-white">
						<Video className="h-5 w-5" />
					</div>
					<div className="flex-1 space-y-1 pr-12">
						<h3 className="text-lg font-semibold leading-tight line-clamp-1">Sprint Planning</h3>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span className="font-mono opacity-70">#MTG-8294</span>
							<span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px]">Host</span>
						</div>
					</div>
				</div>

				<p className="text-sm text-muted-foreground line-clamp-2 pl-1">
					Weekly sync to align on goals and distribute tasks for the upcoming sprint.
				</p>

				<div className="grid grid-cols-2 gap-2 text-xs">
					<div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
						<Users className="h-3.5 w-3.5 text-sky-500" />
						<span>Max 50</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
						<Calendar className="h-3.5 w-3.5 text-violet-500" />
						<span>Now</span>
					</div>
				</div>
			</div>

			<div className="p-4 pt-0 mt-auto flex gap-2">
				<Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 border-0 h-9 text-sm">
					<Play className="h-3.5 w-3.5 mr-2 fill-current" />
					Join Session
				</Button>
				<Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted">
					<Copy className="h-4 w-4 text-muted-foreground" />
				</Button>
			</div>
		</div>
	);

	// Calendar Mock
	const MockCalendarCard = () => (
		<div className="group relative rounded-2xl border bg-card/80 backdrop-blur-xl shadow-lg border-primary/10 w-full max-w-md mx-auto transform hover:scale-[1.02] transition-transform duration-500 overflow-hidden">
			<div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-border/50">
				<div className="flex items-center justify-between">
					<h3 className="font-bold text-lg flex items-center gap-2">
						<CalendarDays className="h-5 w-5 text-violet-500" />
						January 2026
					</h3>
					<div className="flex gap-1">
						<div className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center cursor-pointer">←</div>
						<div className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center cursor-pointer">→</div>
					</div>
				</div>
			</div>
			<div className="p-4">
				<div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
					{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
						<div key={i} className="py-1">{d}</div>
					))}
				</div>
				<div className="grid grid-cols-7 gap-1 text-center text-sm">
					{[...Array(31)].map((_, i) => (
						<div
							key={i}
							className={`py-1.5 rounded-lg ${i === 11 ? 'bg-violet-500 text-white font-bold' :
								i === 14 || i === 20 ? 'bg-emerald-500/20 text-emerald-600 font-medium' :
									i === 7 ? 'bg-amber-500/20 text-amber-600 font-medium' : 'hover:bg-muted/50'}`}
						>
							{i + 1}
						</div>
					))}
				</div>
				<div className="mt-4 space-y-2">
					<div className="flex items-center gap-2 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
						<div className="w-2 h-2 rounded-full bg-violet-500"></div>
						<span className="text-xs font-medium">Q1 Budget Review</span>
						<span className="text-xs text-muted-foreground ml-auto">Today</span>
					</div>
					<div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
						<div className="w-2 h-2 rounded-full bg-emerald-500"></div>
						<span className="text-xs font-medium">Sprint Demo - Due</span>
						<span className="text-xs text-muted-foreground ml-auto">Jan 15</span>
					</div>
				</div>
			</div>
		</div>
	);

	// Notification Mock
	const MockNotificationCard = () => (
		<div className="group relative rounded-2xl border bg-card/80 backdrop-blur-xl shadow-lg border-primary/10 w-full max-w-md mx-auto transform hover:scale-[1.02] transition-transform duration-500">
			<div className="p-4 border-b border-border/50">
				<div className="flex items-center justify-between">
					<h3 className="font-bold flex items-center gap-2">
						<Bell className="h-5 w-5 text-rose-500" />
						Notifications
						<span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500 text-white">3</span>
					</h3>
					<span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>
				</div>
			</div>
			<div className="p-3 space-y-2">
				{[
					{ type: 'vote', title: 'New vote on "Q4 Marketing Budget"', time: '2m ago', read: false, color: 'emerald' },
					{ type: 'proposal', title: 'Team Expansion proposal is closing', time: '1h ago', read: false, color: 'blue' },
					{ type: 'mention', title: 'Sarah mentioned you in a comment', time: '3h ago', read: false, color: 'purple' },
				].map((n, i) => (
					<div key={i} className={`flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 ${!n.read ? 'border-l-2 border-l-' + n.color + '-500' : ''}`}>
						<div className={`p-2 rounded-lg bg-${n.color}-500/10`}>
							{n.type === 'vote' ? <ShieldCheck className={`h-4 w-4 text-${n.color}-500`} /> :
								n.type === 'proposal' ? <Calendar className={`h-4 w-4 text-${n.color}-500`} /> :
									<MessageSquare className={`h-4 w-4 text-${n.color}-500`} />}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">{n.title}</p>
							<p className="text-xs text-muted-foreground">{n.time}</p>
						</div>
						{!n.read && <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2"></div>}
					</div>
				))}
			</div>
		</div>
	);

	// Resources Mock
	const MockResourceCard = () => (
		<div className="group relative rounded-2xl border bg-card/80 backdrop-blur-xl shadow-lg border-primary/10 w-full max-w-md mx-auto transform hover:scale-[1.02] transition-transform duration-500">
			<div className="p-4 border-b border-border/50">
				<div className="flex items-center justify-between">
					<h3 className="font-bold flex items-center gap-2">
						<FileText className="h-5 w-5 text-cyan-500" />
						Resources Hub
					</h3>
					<Button size="sm" className="h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
						<Upload className="h-3.5 w-3.5 mr-1" />
						Upload
					</Button>
				</div>
			</div>
			<div className="p-3 space-y-2">
				{[
					{ name: 'Q4_Budget_Analysis.pdf', size: '2.4 MB', time: '2h ago', type: 'pdf', color: 'rose' },
					{ name: 'Team_Roadmap_2026.docx', size: '1.8 MB', time: '1d ago', type: 'doc', color: 'blue' },
					{ name: 'Product_Screenshots.zip', size: '15.2 MB', time: '3d ago', type: 'zip', color: 'amber' },
				].map((f, i) => (
					<div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors cursor-pointer">
						<div className={`p-2.5 rounded-xl bg-gradient-to-br from-${f.color}-500/20 to-${f.color}-600/10`}>
							<FileText className={`h-5 w-5 text-${f.color}-500`} />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate">{f.name}</p>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>{f.size}</span>
								<span>•</span>
								<span>{f.time}</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<section id="features" className="py-24 bg-background relative overflow-hidden">
			<div className="container mx-auto px-6">
				{/* Header */}
				<div className="mb-20 text-center">
					<h2 className="text-3xl md:text-5xl font-sf font-bold text-foreground mb-6">
						Intelligence built for <span className="text-primary">modern teams</span>
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto text-xl">
						Reimagine how decisions happen. Move from clarity to consensus with tools designed for high-performance organizations.
					</p>
				</div>

				<div className="space-y-32">
					{/* Feature 1: Decision Making */}
					<div className="flex flex-col lg:flex-row items-center gap-16 animate-on-scroll">
						<div className="lg:w-1/2 relative">
							<div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-30"></div>
							<div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
								<DecisionCard {...mockDecision} />
							</div>
							{/* Decorative subtle elements */}
							<div className="absolute -z-10 -bottom-10 -right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
						</div>
						<div className="lg:w-1/2 space-y-6">
							<div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
								<BrainCircuit className="text-blue-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">Democratic Decision Making</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Empower your team to weigh in on critical choices without the chaos. Our structured proposal framework ensures every voice is heard while filtering out the noise.
							</p>
							<ul className="space-y-3 text-muted-foreground">
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center"><ShieldCheck size={14} className="text-green-500" /></div>
									Bias-free voting mechanisms
								</li>
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center"><Zap size={14} className="text-green-500" /></div>
									Rapid consensus visualization
								</li>
							</ul>
						</div>
					</div>

					{/* Feature 2: Analytics */}
					<div className="flex flex-col lg:flex-row-reverse items-center gap-16 animate-on-scroll">
						<div className="lg:w-1/2 relative bg-card/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
							<h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
								<BarChart3 size={20} className="text-primary" /> Real-time Sentiment
							</h4>
							<OptionSupportChart data={mockChartData} />
						</div>
						<div className="lg:w-1/2 space-y-6">
							<div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
								<BarChart3 className="text-purple-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">Deep Impact Analytics</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Go beyond simple votes. Understand the *why* behind every decision with sentiment analysis and engagement tracking.
							</p>
							<div className="pt-4">
								<Link to="/register">
									<Button variant="outline" className="rounded-full gap-2">
										Explore Analytics <ArrowRight size={16} />
									</Button>
								</Link>
							</div>
						</div>
					</div>

					{/* Feature 3: Goals & OKRs (New) */}
					<div className="flex flex-col lg:flex-row items-center gap-16 animate-on-scroll">
						<div className="lg:w-1/2 relative">
							<div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full opacity-20"></div>
							<MockGoalCard />
						</div>
						<div className="lg:w-1/2 space-y-6">
							<div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
								<Target className="text-emerald-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">Strategic Goals & OKRs</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Align every decision with your high-level objectives. Track progress on Key Results automatically as your team executes.
							</p>
							<ul className="space-y-3 text-muted-foreground">
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center"><ShieldCheck size={14} className="text-emerald-500" /></div>
									Objective-driven alignment
								</li>
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center"><Zap size={14} className="text-emerald-500" /></div>
									Real-time progress tracking
								</li>
							</ul>
						</div>
					</div>

					{/* Feature 4: AI Insights (New) */}
					<div className="flex flex-col lg:flex-row-reverse items-center gap-16 animate-on-scroll">
						<div className="lg:w-1/2 relative">
							<div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full opacity-20"></div>
							<MockInsightCard />
						</div>
						<div className="lg:w-1/2 space-y-6">
							<div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
								<Zap className="text-amber-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">AI-Powered Insights</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Break deadlocks and spot bias before it affects your outcome. Our AI analyzes voting patterns to suggest the optimal path forward.
							</p>
						</div>
					</div>

					{/* Feature 5: Virtual Meeting Rooms */}
					<div className="flex flex-col lg:flex-row items-center gap-16 animate-on-scroll">
						<div className="lg:w-1/2 relative">
							<div className="absolute inset-0 bg-sky-500/20 blur-[100px] rounded-full opacity-20"></div>
							<MockMeetingCard />
						</div>
						<div className="lg:w-1/2 space-y-6">
							<div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center">
								<Video className="text-sky-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">Virtual Meeting Rooms</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Gather context and reach consensus in real-time. Link meetings directly to proposals so every discussion drives a decision.
							</p>
							<ul className="space-y-3 text-muted-foreground">
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center"><ShieldCheck size={14} className="text-sky-500" /></div>
									Linked to decisions
								</li>
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-sky-500/10 flex items-center justify-center"><Zap size={14} className="text-sky-500" /></div>
									Real-time collaboration
								</li>
							</ul>
						</div>
					</div>

					{/* Feature 6: Team Management */}
					<div className="flex flex-col lg:flex-row items-center gap-16 animate-on-scroll">
						<div className="lg:w-1/2 relative">
							<div className="glass-panel p-8 rounded-2xl border-border bg-card/30 relative overflow-hidden">
								<div className="space-y-4">
									<TeamMemberCard {...mockMember} />
									<div className="opacity-60 scale-95 origin-top">
										<TeamMemberCard {...{ ...mockMember, name: "David Chen", email: "david@consensus.ai", avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=David` }} />
									</div>
								</div>
							</div>
						</div>
						<div className="lg:w-1/2 space-y-6">
							<div className="w-12 h-12 rounded-lg bg-slate-500/10 flex items-center justify-center">
								<Users className="text-slate-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">Seamless Collaboration</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Manage roles, track participation, and grow your organization. Everything you need to scale your decision-making culture.
							</p>
						</div>
					</div>

					{/* Feature 7: Decision Calendar */}
					<div className="flex flex-col lg:flex-row-reverse items-center gap-16 animate-on-scroll">
						<div className="lg:w-1/2 relative">
							<div className="absolute inset-0 bg-violet-500/20 blur-[100px] rounded-full opacity-20"></div>
							<MockCalendarCard />
						</div>
						<div className="lg:w-1/2 space-y-6">
							<div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
								<CalendarDays className="text-violet-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">Decision Calendar</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Visualize deadlines, meetings, and milestones in one unified calendar. Never miss a critical decision window again.
							</p>
							<ul className="space-y-3 text-muted-foreground">
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center"><ShieldCheck size={14} className="text-violet-500" /></div>
									Proposal deadline tracking
								</li>
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center"><Zap size={14} className="text-violet-500" /></div>
									Meeting integration
								</li>
							</ul>
						</div>
					</div>

					{/* Feature 8: Real-time Notifications */}
					<div className="flex flex-col lg:flex-row items-center gap-16 animate-on-scroll">
						<div className="lg:w-1/2 relative">
							<div className="absolute inset-0 bg-rose-500/20 blur-[100px] rounded-full opacity-20"></div>
							<MockNotificationCard />
						</div>
						<div className="lg:w-1/2 space-y-6">
							<div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center">
								<Bell className="text-rose-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">Real-time Notifications</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Stay informed about votes, mentions, and proposal updates as they happen. Customizable alerts keep you in the loop.
							</p>
							<ul className="space-y-3 text-muted-foreground">
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center"><ShieldCheck size={14} className="text-rose-500" /></div>
									Instant push notifications
								</li>
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center"><Zap size={14} className="text-rose-500" /></div>
									Categorized by type
								</li>
							</ul>
						</div>
					</div>

					{/* Feature 9: Resources Hub */}
					<div className="flex flex-col lg:flex-row-reverse items-center gap-16 animate-on-scroll">
						<div className="lg:w-1/2 relative">
							<div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full opacity-20"></div>
							<MockResourceCard />
						</div>
						<div className="lg:w-1/2 space-y-6">
							<div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
								<FileText className="text-cyan-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">Resources Hub</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Centralize all supporting documents, reports, and files. Drag and drop uploads with automatic file type detection.
							</p>
							<ul className="space-y-3 text-muted-foreground">
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center"><ShieldCheck size={14} className="text-cyan-500" /></div>
									Secure file storage
								</li>
								<li className="flex items-center gap-3">
									<div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center"><Zap size={14} className="text-cyan-500" /></div>
									Drag-and-drop uploads
								</li>
							</ul>
						</div>
					</div>

				</div>
			</div>
		</section>
	);
};

export default Features;
