import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/assets/amity-logo.png" 
                alt="Amity Events" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Amity Events
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Your one-stop platform for discovering, managing, and participating in 
              campus events at Amity University.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/events" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  All Events
                </a>
              </li>
              <li>
                <a href="/my-events" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  My Events
                </a>
              </li>
              <li>
                <a href="/external-register" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  External Registration
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-600 text-sm flex items-center space-x-2">
              <span>Created with</span>
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>by Harsh Bansal</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 