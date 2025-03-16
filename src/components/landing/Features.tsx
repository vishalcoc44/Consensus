
import { useRef, useEffect } from 'react';
import { Users, Brain, LineChart, Shield, Zap, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    title: "Collaborative Input",
    description: "Gather insights from all stakeholders in one centralized platform, ensuring every voice is heard.",
    icon: Users,
    color: "bg-blue-500/10 text-blue-500",
    colorHover: "group-hover:bg-blue-500/20"
  },
  {
    title: "AI-Powered Analysis",
    description: "Harness advanced algorithms to identify patterns, sentiment, and valuable insights from collected input.",
    icon: Brain,
    color: "bg-purple-500/10 text-purple-500",
    colorHover: "group-hover:bg-purple-500/20"
  },
  {
    title: "Data Visualization",
    description: "Transform complex information into intuitive visualizations that make trends and insights immediately clear.",
    icon: LineChart,
    color: "bg-teal-500/10 text-teal-500",
    colorHover: "group-hover:bg-teal-500/20"
  },
  {
    title: "Ethical Guardrails",
    description: "Ensure decisions align with your organization's values and priorities through AI-driven ethical analysis.",
    icon: Shield,
    color: "bg-amber-500/10 text-amber-500",
    colorHover: "group-hover:bg-amber-500/20"
  },
  {
    title: "Enhanced Efficiency",
    description: "Streamline decision processes, saving time while improving quality through structured collaborative workflows.",
    icon: Zap,
    color: "bg-rose-500/10 text-rose-500",
    colorHover: "group-hover:bg-rose-500/20"
  }
];

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.feature-card');
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add('opacity-100', 'translate-y-0');
                el.classList.remove('opacity-0', 'translate-y-10');
              }, index * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  return (
    <section id="features" className="py-20 md:py-32 bg-consensus-grey-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:30px_30px] opacity-30"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-consensus-blue/10 rounded-full text-consensus-blue text-sm font-medium mb-6">
            Features
          </div>
          <h2 className="font-sf text-4xl md:text-5xl font-bold mb-6">
            Transform How Your Team Makes Decisions
          </h2>
          <p className="text-xl text-consensus-grey-600">
            Our platform combines human intuition with artificial intelligence to create a powerful decision-making ecosystem.
          </p>
        </div>
        
        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card group p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 opacity-0 translate-y-10 transform"
            >
              <div className={`w-14 h-14 ${feature.color} ${feature.colorHover} rounded-xl flex items-center justify-center mb-6 transition-colors duration-300`}>
                <feature.icon size={26} />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-consensus-blue transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-consensus-grey-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link to="/register">
            <Button 
              className="rounded-full px-6 py-6 bg-consensus-blue hover:bg-consensus-blue/90 shadow-lg shadow-consensus-blue/20"
            >
              Get started today
              <ArrowUpRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;
