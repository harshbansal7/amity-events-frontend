import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings,
  FileSpreadsheet,
  ClipboardList
} from 'lucide-react';

const AdminSidebar = () => {
  const navItems = [
    // { 
    //   name: 'Dashboard', 
    //   path: '/admin', 
    //   icon: LayoutDashboard 
    // },
    { 
      name: 'Events', 
      path: '/admin/events', 
      icon: Calendar 
    },
    { 
      name: 'Participants', 
      path: '/admin/participants', 
      icon: Users 
    },
    { 
      name: 'Reports', 
      path: '/admin/reports', 
      icon: FileSpreadsheet 
    },
    { 
      name: 'Attendance', 
      path: '/admin/attendance', 
      icon: ClipboardList 
    },
    // { 
    //   name: 'Settings', 
    //   path: '/admin/settings', 
    //   icon: Settings 
    // }
  ];

  return (
    <div className="w-64 min-h-screen bg-white border-r border-gray-200">
      <div className="flex items-center space-x-3 px-6 py-4 border-b">
        {/* <img 
          src="/assets/amity-logo.png" 
          alt="Amity Events" 
          className="h-8 w-auto"
        /> */}
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Creator Dashboard
        </span>
      </div>
      
      <nav className="mt-6 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg mb-1
              transition-colors duration-200
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
            `}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar; 