
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
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2"
          aria-label="ConsensusAI Home"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-consensus-blue to-consensus-teal flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="font-sf font-bold text-xl">ConsensusAI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/#features" 
            className="text-consensus-grey-600 hover:text-consensus-blue transition-colors duration-200"
          >
            Features
          </Link>
          <Link 
            to="/#pricing" 
            className="text-consensus-grey-600 hover:text-consensus-blue transition-colors duration-200"
          >
            Pricing
          </Link>
          <Link 
            to="/#about" 
            className="text-consensus-grey-600 hover:text-consensus-blue transition-colors duration-200"
          >
            About
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="outline" className="rounded-full px-6 transition-all hover:bg-consensus-blue/5">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button className="rounded-full px-6 bg-consensus-blue hover:bg-consensus-blue/90 hover:scale-105 transition-all">
              Sign up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-consensus-grey-800 hover:text-consensus-blue transition-colors"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-fade-in">
          <nav className="container mx-auto px-6 py-6 flex flex-col space-y-4">
            <Link 
              to="/#features" 
              className="text-consensus-grey-600 hover:text-consensus-blue transition-colors px-4 py-2 rounded-md hover:bg-consensus-grey-100"
            >
              Features
            </Link>
            <Link 
              to="/#pricing" 
              className="text-consensus-grey-600 hover:text-consensus-blue transition-colors px-4 py-2 rounded-md hover:bg-consensus-grey-100"
            >
              Pricing
            </Link>
            <Link 
              to="/#about" 
              className="text-consensus-grey-600 hover:text-consensus-blue transition-colors px-4 py-2 rounded-md hover:bg-consensus-grey-100"
            >
              About
            </Link>
            <div className="pt-4 flex flex-col space-y-3">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full rounded-full">
                  Log in
                </Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button className="w-full rounded-full bg-consensus-blue hover:bg-consensus-blue/90">
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
