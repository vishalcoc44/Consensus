
import { useRef, useEffect } from 'react';

const testimonials = [
  {
    quote: "ConsensusAI has transformed our executive decision-making process. We're making faster, more informed choices with buy-in from the entire team.",
    author: "Sarah Chen",
    position: "CEO, TechVision Inc.",
    image: "https://i.pravatar.cc/150?img=32"
  },
  {
    quote: "The ethical analysis feature ensures our decisions align with our company values. This has been a game-changer for our organizational culture.",
    author: "Marcus Johnson",
    position: "COO, Nexus Partners",
    image: "https://i.pravatar.cc/150?img=59"
  },
  {
    quote: "As a non-profit, inclusive decision-making is core to our mission. ConsensusAI has helped us amplify diverse voices within our organization.",
    author: "Elena Rodriguez",
    position: "Executive Director, Community Forward",
    image: "https://i.pravatar.cc/150?img=47"
  }
];

const Testimonials = () => {
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.testimonial-card');
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add('opacity-100', 'translate-y-0');
                el.classList.remove('opacity-0', 'translate-y-10');
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (testimonialsRef.current) {
      observer.observe(testimonialsRef.current);
    }

    return () => {
      if (testimonialsRef.current) {
        observer.unobserve(testimonialsRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-consensus-blue/5 -skew-x-12 transform origin-top-right z-0"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 bg-consensus-teal/10 rounded-full text-consensus-teal text-sm font-medium mb-6">
            Testimonials
          </div>
          <h2 className="font-sf text-4xl md:text-5xl font-bold mb-6">
            Trusted by Forward-Thinking Teams
          </h2>
          <p className="text-xl text-consensus-grey-600">
            See how organizations like yours are transforming their decision-making processes with ConsensusAI.
          </p>
        </div>
        
        <div 
          ref={testimonialsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="testimonial-card opacity-0 translate-y-10 transform p-8 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="mb-6">
                <svg width="45" height="36" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-consensus-blue/20">
                  <path d="M13.5 36H0V24C0 17.6348 1.575 12.4457 4.725 8.4326C7.875 4.32065 12.15 1.62326 17.55 0.34087L20.25 4.36957C15.75 6.04348 12.6 8.73043 10.8 12.4304C9 16.1304 8.4 20.4 9 25.2H13.5V36ZM38.25 36H24.75V24C24.75 17.6348 26.325 12.4457 29.475 8.4326C32.625 4.32065 36.9 1.62326 42.3 0.34087L45 4.36957C40.5 6.04348 37.35 8.73043 35.55 12.4304C33.75 16.1304 33.15 20.4 33.75 25.2H38.25V36Z" fill="currentColor"/>
                </svg>
              </div>
              
              <p className="text-lg text-consensus-grey-700 mb-8 flex-grow">
                {testimonial.quote}
              </p>
              
              <div className="flex items-center mt-auto">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-bold text-consensus-grey-900">{testimonial.author}</h4>
                  <p className="text-sm text-consensus-grey-600">{testimonial.position}</p>
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
