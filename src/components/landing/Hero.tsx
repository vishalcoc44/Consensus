
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <section 
      ref={containerRef} 
      className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-50"></div>
      <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-30"></div>
      
      {/* Decorative Elements */}
      <div 
        className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-consensus-blue/10 rounded-full blur-3xl parallax-element" 
        data-speed-x="0.5" 
        data-speed-y="0.7"
      ></div>
      <div 
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-consensus-teal/10 rounded-full blur-3xl parallax-element" 
        data-speed-x="0.7" 
        data-speed-y="0.5"
      ></div>
      
      {/* Floating Elements */}
      <div 
        className="hidden lg:block absolute top-1/3 right-[10%] w-20 h-20 bg-white/50 backdrop-blur-md rounded-xl shadow-lg rotate-12 parallax-element animate-float" 
        data-speed-x="1.5" 
        data-speed-y="1.2"
      ></div>
      <div 
        className="hidden lg:block absolute bottom-1/4 left-[20%] w-14 h-14 bg-white/50 backdrop-blur-md rounded-xl shadow-lg -rotate-12 parallax-element animate-float" 
        style={{ animationDelay: '1s' }}
        data-speed-x="1.2" 
        data-speed-y="1.5"
      ></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-6 animate-fade-in">
            <span className="text-sm font-medium text-consensus-grey-600">Revolutionizing Decision-Making</span>
          </div>
          
          <h1 className="font-sf text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-fade-in">
            <span>Make Better Decisions with </span>
            <span className="hero-text-gradient">Collective Intelligence</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-consensus-grey-600 mb-8 max-w-3xl mx-auto animate-fade-in animate-delay-1">
            ConsensusAI combines human wisdom and artificial intelligence to help teams make smarter, faster, and more inclusive decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in animate-delay-2">
            <Link to="/register">
              <Button size="lg" className="rounded-full px-8 py-6 bg-consensus-blue hover:bg-consensus-blue/90 hover:scale-105 transition-all shadow-lg shadow-consensus-blue/20">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/#features">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 border-consensus-grey-300 hover:bg-consensus-blue/5 transition-all">
                See how it works
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="mt-20 max-w-5xl mx-auto animate-fade-in animate-delay-3">
          <div className="glass-panel rounded-xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80" 
              alt="Team using ConsensusAI to make decisions" 
              className="w-full h-auto object-cover shadow-lg transform hover:scale-[1.01] transition-transform duration-500"
            />
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-8 h-12 border-2 border-consensus-grey-400 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-consensus-grey-400 rounded-full mt-2 animate-float"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
