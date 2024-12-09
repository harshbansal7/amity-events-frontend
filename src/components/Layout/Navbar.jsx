import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User } from 'lucide-react';
import { getCurrentUserId } from '../../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const userEnrollment = getCurrentUserId();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/events" className="text-xl font-bold text-indigo-600">
              Amity Events
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="/events" 
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              All Events
            </a>
            <a 
              href="/my-events" 
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              My Events
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <span className="text-gray-700 text-sm">
                {userEnrollment}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a 
              href="/events"
              className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              All Events
            </a>
            <a 
              href="/my-events"
              className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-md text-base font-medium"
            >
              My Events
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 