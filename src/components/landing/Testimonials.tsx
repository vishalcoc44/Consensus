import { Star } from 'lucide-react';

const testimonials = [
	{
		content: "ConsensusAI has completely transformed how our product team makes decisions. We're moving 3x faster now.",
		author: "Sarah Chen",
		role: "Product Director at TechFlow",
		avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
	},
	{
		content: "The ability to gather unbiased insights from the entire organization is a game-changer for our culture.",
		author: "Michael Rodriguez",
		role: "VP of People at ScaleUp",
		avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
	},
	{
		content: "Finally, a tool that helps us escape the HIPPO effect. The best ideas win, regardless of who they come from.",
		author: "Emily Watson",
		role: "CTO at FutureSystems",
		avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
	}
];

const Testimonials = () => {
	return (
		<section className="py-24 bg-background relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

			<div className="container mx-auto px-6">
				<div className="text-center mb-16 animate-on-scroll">
					<h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Trusted by innovative teams</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						See how leading organizations are using collective intelligence to make better decisions.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<div
							key={index}
							className={`glass-panel p-8 animate-on-scroll animate-delay-${index + 1}`}
						>
							<div className="flex space-x-1 mb-6 text-primary">
								{[...Array(5)].map((_, i) => (
									<Star key={i} size={16} fill="currentColor" />
								))}
							</div>

							<blockquote className="text-lg text-foreground mb-6 leading-relaxed">
								"{testimonial.content}"
							</blockquote>

							<div className="flex items-center">
								<img
									src={testimonial.avatar}
									alt={testimonial.author}
									className="w-10 h-10 rounded-full mr-4 border border-border"
								/>
								<div>
									<div className="font-medium text-foreground">{testimonial.author}</div>
									<div className="text-sm text-muted-foreground">{testimonial.role}</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Testimonials;
