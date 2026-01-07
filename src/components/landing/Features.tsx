
import { BrainCircuit, Users, BarChart3, ShieldCheck, Zap, MessageSquare } from 'lucide-react';

const features = [
	{
		icon: BrainCircuit,
		title: "AI-Powered Synthesis",
		description: "Our advanced AI analyzes discussion points, identifies consensus, and highlights points of contention automatically."
	},
	{
		icon: Users,
		title: "Collective Intelligence",
		description: "Harness the wisdom of your entire team. Give everyone a voice while avoiding the noise of endless chat threads."
	},
	{
		icon: BarChart3,
		title: "Decision Analytics",
		description: "Track decision quality, participation rates, and alignment scores to improve your organization's decision-making velocity."
	},
	{
		icon: ShieldCheck,
		title: "Bias Detection",
		description: "Built-in safeguards identify potential groupthink, confirmation bias, and authority bias in your decision-making process."
	},
	{
		icon: Zap,
		title: "Rapid Alignment",
		description: "Reach agreement 3x faster than traditional meetings. Asynchronous workflows allow deep thinking and quick resolution."
	},
	{
		icon: MessageSquare,
		title: "Structured Discourse",
		description: "Move beyond chaotic threads. Our structured proposal framework keeps discussions focused and productive."
	}
];

const Features = () => {
	return (
		<section id="features" className="py-24 bg-consensus-dark-500 relative">
			<div className="container mx-auto px-6">
				<div className="mb-16 text-center animate-on-scroll">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Intelligence built for <span className="text-consensus-green">modern teams</span>
					</h2>
					<p className="text-consensus-grey-300 max-w-2xl mx-auto text-lg">
						Reimagine how decisions happen. Move from clarity to consensus with tools designed for high-performance organizations.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className={`dark-card p-8 group hover:border-consensus-green/30 animate-on-scroll animate-delay-${index % 3 + 1}`}
						>
							<div className="w-12 h-12 rounded-lg bg-consensus-dark-300 border border-consensus-dark-100 flex items-center justify-center mb-6 group-hover:bg-consensus-green/10 group-hover:border-consensus-green/30 transition-all duration-300">
								<feature.icon className="text-consensus-green" size={24} />
							</div>

							<h3 className="text-xl font-bold text-white mb-3 group-hover:text-consensus-green transition-colors duration-300">
								{feature.title}
							</h3>

							<p className="text-consensus-grey-400 leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Features;
