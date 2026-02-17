import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  {
    path: "/",
    label: "Home",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: "/browse-resource",
    label: "Browse",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    path: "/search",
    label: "Search",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    path: "/request-material",
    label: "Request",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    path: "/discussion-forums",
    label: "Forums",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-52 h-full bg-[#0a0a0f] border-r border-gray-800/40 flex flex-col justify-between flex-shrink-0">
      <div className="p-4 pt-5">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium mb-3 px-3">Navigation</p>
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition ${
                  isActive
                    ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                    : "text-gray-500 hover:bg-[#12121a] hover:text-gray-300"
                }`}
                onClick={() => navigate(item.path)}>
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-3">
          <p className="text-[11px] font-semibold text-indigo-300 mb-0.5">Need help?</p>
          <p className="text-[10px] text-gray-500 leading-relaxed">Check our guides or contact support for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
