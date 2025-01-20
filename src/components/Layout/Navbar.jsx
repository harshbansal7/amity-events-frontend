import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Settings } from 'lucide-react';
import { getCurrentUserId, getCurrentUserName, isExternalUser } from '../../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userEnrollment = getCurrentUserId();
  const userName = getCurrentUserName();
  const isExternal = isExternalUser();

  // Handle navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'All Events', path: '/events' },
    { name: 'My Events', path: '/my-events' },
    !isExternal && { 
      name: 'Creator Dashboard', 
      path: '/admin',
      icon: Settings,
      className: 'text-indigo-600 hover:bg-indigo-50'
    }
  ].filter(Boolean);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 
        bg-white/80 backdrop-blur-sm
        ${scrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <a href="/events" className="flex items-center space-x-2">
                <img 
                  src="/assets/amity-logo.png" 
                  alt="Amity Events" 
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Amity Events
                </span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium 
                    transition-all duration-200
                    ${link.className || ''} 
                    ${isActive(link.path)
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }
                  `}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  <span>{link.name}</span>
                </a>
              ))}
            </div>

            {/* User Info & Logout */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-sm font-medium">
                <span className="flex items-center space-x-2">
                  <span className="text-gray-600">Welcome,</span>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                    {userName || userEnrollment}
                  </span>
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 
                          transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 
                          transition-colors duration-200"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden transition-all duration-300 overflow-hidden
            ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-2xl">
              {navLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium 
                    transition-colors duration-200
                    ${link.className || ''} 
                    ${isActive(link.path)
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }
                  `}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  <span>{link.name}</span>
                </a>
              ))}
              <div className="px-3 py-2 text-sm">
                <span className="font-medium text-gray-500">Welcome,</span>
                <span className="block mt-1 font-medium text-indigo-600">
                  {userName || userEnrollment}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-left
                          text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar; 