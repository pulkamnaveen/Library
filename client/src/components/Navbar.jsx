import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <nav className="h-14 bg-[#0a0a0f] border-b border-gray-800/40 flex items-center justify-between px-5 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center cursor-pointer" onClick={() => navigate("/")}>
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-sm font-bold text-white">Digital Library</span>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#12121a] border border-gray-800/40 text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition" />
        </div>
      </form>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="text-xs text-gray-400">{user.name}</span>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-300 transition ml-1">Sign out</button>
          </>
        ) : (
          <button onClick={() => navigate("/auth")} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition">
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
