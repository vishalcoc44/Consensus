
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';

import CTA from '@/components/landing/CTA';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition = {
  ease: [0.43, 0.13, 0.23, 0.96] as const,
  duration: 0.3,
};

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top when the page loads
    window.scrollTo(0, 0);

    // Set up intersection observers for bidirectional scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate in when entering viewport
            entry.target.classList.add('animate-fade-in', 'opacity-100');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          } else {
            // Reset when leaving viewport (enables re-animation on scroll back)
            entry.target.classList.remove('animate-fade-in', 'opacity-100');
            entry.target.classList.add('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px 0px' }
    );

    // Select all sections to animate
    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach((section) => {
      section.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700', 'ease-out');
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden"
    >
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />

        <div className="animate-on-scroll">
          <CTA />
        </div>
      </main>

      <footer className="bg-muted py-12 border-t border-border animate-on-scroll">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.png" alt="ConsensusAI Logo" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-sf font-bold text-lg text-foreground">ConsensusAI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Revolutionizing how organizations make decisions through collaborative intelligence.
              </p>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-medium text-foreground mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Features</a></li>


                </ul>
              </div>



              <div>
                <h4 className="font-medium text-foreground mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Documentation</a></li>
                  <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">Help Center</a></li>

                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} ConsensusAI. All rights reserved.
            </p>


          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default Index;
