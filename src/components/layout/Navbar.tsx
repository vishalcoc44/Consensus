
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-consensus-dark-300/80 backdrop-blur-md shadow-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2 group"
          aria-label="ConsensusAI Home"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-consensus-green to-consensus-teal flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(74,222,128,0.5)]">
            <span className="text-consensus-dark-800 font-bold text-lg">C</span>
          </div>
          <span className="font-sf font-bold text-xl text-white">ConsensusAI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/#features" 
            className="text-consensus-grey-300 hover:text-consensus-green transition-colors duration-200"
          >
            Features
          </Link>
          <Link 
            to="/#pricing" 
            className="text-consensus-grey-300 hover:text-consensus-green transition-colors duration-200"
          >
            Pricing
          </Link>
          <Link 
            to="/#about" 
            className="text-consensus-grey-300 hover:text-consensus-green transition-colors duration-200"
          >
            About
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="outline" className="rounded-full px-6 transition-all border-consensus-grey-600 text-white hover:bg-consensus-green/10 hover:border-consensus-green/50">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button className="rounded-full px-6 bg-consensus-green hover:bg-consensus-green/90 hover:scale-105 transition-all shadow-[0_0_10px_rgba(74,222,128,0.3)] hover:shadow-[0_0_20px_rgba(74,222,128,0.5)] text-consensus-dark-800 font-semibold">
              Sign up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white hover:text-consensus-green transition-colors"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-consensus-dark-300/95 backdrop-blur-md shadow-lg animate-fade-in border-t border-consensus-dark-100">
          <nav className="container mx-auto px-6 py-6 flex flex-col space-y-4">
            <Link 
              to="/#features" 
              className="text-consensus-grey-300 hover:text-consensus-green transition-colors px-4 py-2 rounded-md hover:bg-consensus-dark-200"
            >
              Features
            </Link>
            <Link 
              to="/#pricing" 
              className="text-consensus-grey-300 hover:text-consensus-green transition-colors px-4 py-2 rounded-md hover:bg-consensus-dark-200"
            >
              Pricing
            </Link>
            <Link 
              to="/#about" 
              className="text-consensus-grey-300 hover:text-consensus-green transition-colors px-4 py-2 rounded-md hover:bg-consensus-dark-200"
            >
              About
            </Link>
            <div className="pt-4 flex flex-col space-y-3">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full rounded-full border-consensus-grey-600 text-white hover:bg-consensus-green/10 hover:border-consensus-green/50">
                  Log in
                </Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button className="w-full rounded-full bg-consensus-green hover:bg-consensus-green/90 text-consensus-dark-800 font-semibold shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                  Sign up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
