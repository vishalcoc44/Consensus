
import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { PreviewMarquee } from '@/components/shared/PreviewMarquee';
import { LightboxModal } from '@/components/shared/LightboxModal';
import { usePreviewImages } from '@/hooks/usePreviewImages';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [marqueeVisible, setMarqueeVisible] = useState(true);
  const [manuallyDismissed, setManuallyDismissed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = usePreviewImages();
  const location = useLocation();
  // Scroll tracking — isScrolled for navbar style
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close marquee when #features section enters the viewport
  useEffect(() => {
    const featuresEl = document.getElementById('features');
    if (!featuresEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMarqueeVisible(false);
          setManuallyDismissed(true);
        }
      },
      // Trigger as soon as 1px of the section is visible
      { threshold: 0, rootMargin: '0px' }
    );

    observer.observe(featuresEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handlePreviewToggle = useCallback(() => {
    const willBeVisible = !marqueeVisible;
    setMarqueeVisible(willBeVisible);
    setManuallyDismissed(!willBeVisible);
  }, [marqueeVisible]);

  const handleImageClick = useCallback((index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-background/80 backdrop-blur-md shadow-md py-4 border-b border-border'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2 group"
          aria-label="ConsensusAI Home"
        >
          <img src="/logo.png" alt="ConsensusAI Logo" className="w-10 h-10 rounded-lg transition-all duration-300 group-hover:scale-105 object-cover" />
          <span className="font-sf font-bold text-xl text-foreground">ConsensusAI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/#features"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            Features
          </Link>

          <Link
            to="/#about"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            About
          </Link>

          {/* Preview Marquee */}
          {images.length > 0 && (
            <PreviewMarquee
              images={images}
              isVisible={marqueeVisible}
              onToggle={handlePreviewToggle}
              onImageClick={handleImageClick}
            />
          )}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="outline" className="rounded-full px-6 transition-all border-input text-foreground hover:bg-primary/10 hover:border-primary/50">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button className="rounded-full px-6 bg-primary hover:bg-primary/90 hover:scale-105 transition-all shadow-[0_0_10px_rgba(74,222,128,0.3)] hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] text-primary-foreground font-semibold">
              Sign up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground hover:text-primary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md shadow-lg animate-fade-in border-t border-border">
          <nav className="container mx-auto px-6 py-6 flex flex-col space-y-4">
            <Link
              to="/#features"
              className="text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-md hover:bg-muted"
            >
              Features
            </Link>

            <Link
              to="/#about"
              className="text-muted-foreground hover:text-primary transition-colors px-4 py-2 rounded-md hover:bg-muted"
            >
              About
            </Link>

            {images.length > 0 && (
              <button
                onClick={() => {
                  handlePreviewToggle();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 rounded-md text-primary font-semibold hover:bg-primary/10 transition-colors"
              >
                {marqueeVisible ? 'Hide Preview' : 'Preview'}
              </button>
            )}

            <div className="pt-4 flex flex-col space-y-3">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full rounded-full border-input text-foreground hover:bg-primary/10 hover:border-primary/50">
                  Log in
                </Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                  Sign up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>

      {/* Lightbox Modal */}
      <LightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={images}
        activeIndex={activeIndex}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  );
};

export default Navbar;
