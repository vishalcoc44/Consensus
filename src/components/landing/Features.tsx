import { ArrowRight, BrainCircuit, Users, BarChart3, ShieldCheck, Zap, MessageSquare } from 'lucide-react';
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

	return (
		<section id="features" className="py-24 bg-background relative overflow-hidden">
			<div className="container mx-auto px-6">
				{/* Header */}
				<div className="mb-20 text-center animate-on-scroll">
					<h2 className="text-3xl md:text-5xl font-sf font-bold text-foreground mb-6">
						Intelligence built for <span className="text-primary">modern teams</span>
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto text-xl">
						Reimagine how decisions happen. Move from clarity to consensus with tools designed for high-performance organizations.
					</p>
				</div>

				<div className="space-y-32">
					{/* Feature 1: Decision Making */}
					<div className="flex flex-col lg:flex-row items-center gap-16">
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
					<div className="flex flex-col lg:flex-row-reverse items-center gap-16">
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

					{/* Feature 3: Team Management */}
					<div className="flex flex-col lg:flex-row items-center gap-16">
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
							<div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
								<Users className="text-emerald-500" size={24} />
							</div>
							<h3 className="text-3xl font-bold text-foreground">Seamless Collaboration</h3>
							<p className="text-lg text-muted-foreground leading-relaxed">
								Manage roles, track participation, and grow your organization. Everything you need to scale your decision-making culture.
							</p>
						</div>
					</div>

				</div>
			</div>
		</section>
	);
};

export default Features;
