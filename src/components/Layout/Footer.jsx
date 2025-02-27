import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t mt-auto relative z-[50]">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Links */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <img 
                src="/assets/amity-logo.png" 
                alt="AUP Events" 
                className="h-6 w-auto"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                AUP Events
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <a href="/events" className="text-gray-600 hover:text-indigo-600 transition-colors">
                All Events
              </a>
              <a href="/my-events" className="text-gray-600 hover:text-indigo-600 transition-colors">
                My Events
              </a>
              <a href="/external-register" className="text-gray-600 hover:text-indigo-600 transition-colors">
                External Registration
              </a>
            </div>
          </div>

          {/* Created By */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <p className="flex items-center space-x-2">
              <span>Created with</span>
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>by Harsh Bansal</span>
              <span className="text-gray-400">•</span>
              <span>© {currentYear}</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 