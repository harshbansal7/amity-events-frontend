import { NavLink } from "react-router-dom";
import {
  Calendar,
  Users,
  FileSpreadsheet,
  ClipboardList,
  X,
} from "lucide-react";

const AdminSidebar = ({ onClose }) => {
  const navItems = [
    {
      name: "Events",
      path: "/admin/events",
      icon: Calendar,
    },
    {
      name: "Participants",
      path: "/admin/participants",
      icon: Users,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: FileSpreadsheet,
    },
    {
      name: "Attendance",
      path: "/admin/attendance",
      icon: ClipboardList,
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Creator Dashboard
        </span>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <nav className="mt-6 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-lg mb-1
              transition-colors duration-200
              ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }
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
