import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu, X } from 'lucide-react';

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button - Now at bottom left */}
      <div className="lg:hidden fixed bottom-4 left-4 z-[200]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 
                   transition-all duration-200 hover:scale-105
                   border border-gray-200"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      <div className="flex">
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-[150]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-[150]
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
        `}>
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 w-full max-w-[1600px] mx-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel; 