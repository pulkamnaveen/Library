import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, PlusCircle, Users, UserCog } from "lucide-react";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/resource", icon: BookOpen, label: "Resources" },
  { to: "/addResource", icon: PlusCircle, label: "Add Resource" },
  { to: "/materialRequest", icon: Users, label: "Requests" },
  { to: "/users", icon: UserCog, label: "Users" },
];

const Sidebar = ({ onLogout, adminName }) => (
  <aside className="w-52 bg-[#0e0e15] border-r border-gray-800/40 flex flex-col min-h-screen">
    <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800/40">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <span className="text-sm font-bold text-white">Admin Panel</span>
    </div>

    <nav className="flex-1 py-3 px-2">
      {links.map((link) => (
        <NavLink key={link.to} to={link.to} end
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition mb-0.5 ${
              isActive ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/30"
            }`
          }>
          <link.icon size={14} />
          {link.label}
        </NavLink>
      ))}
    </nav>

    <div className="px-4 py-4 border-t border-gray-800/40">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
          {(adminName || "A").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-300">{adminName || "Admin"}</p>
          <p className="text-[10px] text-gray-600">Administrator</p>
        </div>
      </div>
      {onLogout && (
        <button onClick={onLogout}
          className="w-full text-[10px] text-gray-500 hover:text-red-400 py-1.5 rounded-lg hover:bg-red-500/5 transition text-center">
          Sign out
        </button>
      )}
    </div>
  </aside>
);

export default Sidebar;
