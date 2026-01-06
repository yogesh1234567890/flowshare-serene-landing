import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Upload, Download, Home, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { monetizationService, UserTier } from '@/services/monetizationService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userTier, setUserTier] = useState<UserTier>(UserTier.FREE);
  const location = useLocation();

  useEffect(() => {
    // const interval = setInterval(loadSubscription, 60000);
    // return () => clearInterval(interval);
    
    // For now, just use local tier
    setUserTier(monetizationService.getUserTier());
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" aria-label="PeerShare home">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-foreground">PeerShare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            {/* {userTier === UserTier.FREE ? (
              <Link
                to="/upgrade"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade</span>
              </Link>
            ) : (
              <Link
                to="/upgrade"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-amber-600 hover:text-amber-700 border border-amber-300 hover:border-amber-400 transition-all"
              >
                <Crown className="w-4 h-4" />
                <span className="capitalize">{userTier}</span>
              </Link>
            )} */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {location.pathname === '/' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection('how-it-works')}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                How it Works
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;