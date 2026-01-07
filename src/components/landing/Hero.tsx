
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollPosition, setScrollPosition] = useState(0);
	const [hasScrolled, setHasScrolled] = useState(false);

	useEffect(() => {
		// Handle mouse movement for parallax effect
		const handleMouseMove = (e: MouseEvent) => {
			if (!containerRef.current) return;

			const { left, top, width, height } = containerRef.current.getBoundingClientRect();
			const x = (e.clientX - left) / width;
			const y = (e.clientY - top) / height;

			const move = 30; // max movement in pixels
			const xMove = (x - 0.5) * move;
			const yMove = (y - 0.5) * move;

			const elements = containerRef.current.querySelectorAll('.parallax-element');

			elements.forEach((el) => {
				const speedX = Number(el.getAttribute('data-speed-x') || 1);
				const speedY = Number(el.getAttribute('data-speed-y') || 1);

				(el as HTMLElement).style.transform = `translate(${xMove * speedX}px, ${yMove * speedY}px)`;
			});
		};

		// Handle scroll effects
		const handleScroll = () => {
			if (!hasScrolled && window.scrollY > 10) {
				setHasScrolled(true);
			}

			setScrollPosition(window.scrollY);
		};

		document.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('scroll', handleScroll);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('scroll', handleScroll);
		};
	}, [hasScrolled]);

	// Calculate opacity for fade effect on scroll
	const getScrollOpacity = () => {
		return Math.max(0, Math.min(1, 1 - scrollPosition / 500));
	};

	// Calculate scale for zoom effect on scroll
	const getScrollScale = () => {
		return Math.max(1, Math.min(1.2, 1 + scrollPosition / 1000));
	};

	return (
		<section
			ref={containerRef}
			className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-background"
			style={{
				perspective: "1000px"
			}}
		>
			{/* Background Elements */}
			<div className="absolute inset-0 bg-mesh-gradient opacity-50"></div>
			<div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-30"></div>

			{/* Decorative Elements with improved animation */}
			<div
				className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl parallax-element"
				data-speed-x="0.5"
				data-speed-y="0.7"
				style={{
					opacity: 0.5 + Math.sin(Date.now() / 4000) * 0.2,
					transform: `scale(${1 + Math.sin(Date.now() / 5000) * 0.1})`
				}}
			></div>
			<div
				className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl parallax-element"
				data-speed-x="0.7"
				data-speed-y="0.5"
				style={{
					opacity: 0.5 + Math.cos(Date.now() / 4000) * 0.2,
					transform: `scale(${1 + Math.cos(Date.now() / 5000) * 0.1})`
				}}
			></div>

			{/* Floating Elements with improved animation */}
			<div
				className="hidden lg:block absolute top-1/3 right-[10%] w-20 h-20 bg-muted/50 backdrop-blur-md rounded-xl shadow-lg rotate-12 parallax-element animate-float border border-primary/20"
				data-speed-x="1.5"
				data-speed-y="1.2"
				style={{
					transform: `rotate(${12 + Math.sin(Date.now() / 2000) * 5}deg)`,
				}}
			></div>
			<div
				className="hidden lg:block absolute bottom-1/4 left-[20%] w-14 h-14 bg-muted/50 backdrop-blur-md rounded-xl shadow-lg -rotate-12 parallax-element animate-float border border-emerald-500/20"
				style={{
					animationDelay: '1s',
					transform: `rotate(${-12 + Math.cos(Date.now() / 2000) * 5}deg)`,
				}}
				data-speed-x="1.2"
				data-speed-y="1.5"
			></div>

			<div
				className="container mx-auto px-6 relative z-10"
				style={{
					opacity: getScrollOpacity(),
					transform: `translateY(${scrollPosition * 0.3}px)`
				}}
			>
				<div className="max-w-4xl mx-auto text-center">
					<div
						className="inline-block px-4 py-1.5 bg-muted/80 backdrop-blur-sm rounded-full shadow-sm mb-6 animate-fade-in border border-border transform transition-transform hover:scale-105"
					>
						<span className="text-sm font-medium text-muted-foreground">Revolutionizing Decision-Making</span>
					</div>

					<h1 className="font-sf text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-fade-in text-foreground">
						<span>Make Better Decisions with </span>
						<span
							className="hero-text-gradient"
							style={{
								backgroundSize: `${100 + Math.sin(Date.now() / 2000) * 10}% ${100 + Math.sin(Date.now() / 2000) * 10}%`,
								animation: "pulse 3s infinite"
							}}
						>
							Collective Intelligence
						</span>
					</h1>

					<p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in animate-delay-1">
						ConsensusAI combines human wisdom and artificial intelligence to help teams make smarter, faster, and more inclusive decisions.
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animate-delay-2">

						<Link to="/#features">
							<Button
								size="lg"
								variant="outline"
								className="rounded-full px-8 py-6 border-input text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all"
								onMouseEnter={(e) => {
									const btn = e.currentTarget;
									btn.style.borderColor = 'rgba(74, 222, 128, 0.5)';
									btn.style.backgroundColor = 'rgba(74, 222, 128, 0.1)';
								}}
								onMouseLeave={(e) => {
									const btn = e.currentTarget;
									btn.style.borderColor = '';
									btn.style.backgroundColor = '';
								}}
							>
								See how it works
							</Button>
						</Link>
					</div>
				</div>

				{/* Hero Image with parallax effect */}
				<div
					className="mt-20 max-w-5xl mx-auto animate-fade-in animate-delay-3"
					style={{
						transform: `scale(${getScrollScale()}) translateY(${-scrollPosition * 0.1}px)`
					}}
				>
					<div
						className="glass-panel rounded-xl overflow-hidden border border-border shadow-[0_0_30px_rgba(74,222,128,0.1)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(74,222,128,0.2)]"
						onMouseEnter={(e) => {
							const panel = e.currentTarget;
							panel.style.transform = 'scale(1.02)';
							panel.style.boxShadow = '0 0 50px rgba(74, 222, 128, 0.2)';
						}}
						onMouseLeave={(e) => {
							const panel = e.currentTarget;
							panel.style.transform = '';
							panel.style.boxShadow = '';
						}}
					>
						<img
							src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80"
							alt="Team using ConsensusAI to make decisions"
							className="w-full h-auto object-cover shadow-lg transform hover:scale-[1.01] transition-transform duration-500 brightness-[0.9] contrast-[1.05]"
						/>
					</div>
				</div>

				{/* Scroll Indicator with animated pulse */}
				<div
					className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block"
					style={{
						opacity: hasScrolled ? 0 : 1,
						transition: 'opacity 0.5s ease-out'
					}}
				>
					<div className="w-8 h-12 border-2 border-primary/40 rounded-full flex justify-center">
						<div
							className="w-1.5 h-3 bg-primary/70 rounded-full mt-2"
							style={{
								animation: 'float 1.5s ease-in-out infinite',
								opacity: 0.7 + Math.sin(Date.now() / 500) * 0.3
							}}
						></div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
