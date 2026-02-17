import React from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "Browse Resources",
    desc: "Explore our extensive collection of academic materials",
    path: "/browse-resource",
    btn: "Browse Now",
    gradient: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/20",
    icon: (
      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "Advanced Search",
    desc: "Find exactly what you need with powerful search tools",
    path: "/search",
    btn: "Search",
    gradient: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/20",
    icon: (
      <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: "Request Materials",
    desc: "Can't find what you need? Request new materials",
    path: "/request-material",
    btn: "Make Request",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/20",
    icon: (
      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    title: "Discussion Forums",
    desc: "Join academic discussions and share knowledge",
    path: "/discussion-forums",
    btn: "Join Now",
    gradient: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/20",
    icon: (
      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

const HomeContent = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0a0a0f] text-white w-full px-6 py-6">
      <h1 className="text-lg font-bold mb-0.5">Welcome back</h1>
      <p className="text-xs text-gray-500 mb-5">
        Access thousands of academic resources, research papers, and books from top publishers.
      </p>

      <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-4 mb-5">
        <p className="text-xs font-semibold text-indigo-300 mb-0.5">New collections available</p>
        <p className="text-[11px] text-gray-400">
          IEEE and Springer journals have been added. Check out the latest research papers in Computer Science and Engineering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {features.map((f) => (
          <div key={f.title}
            className={`bg-gradient-to-br ${f.gradient} border ${f.border} rounded-xl p-4 hover:scale-[1.02] transition-transform cursor-pointer`}
            onClick={() => navigate(f.path)}>
            <div className="mb-3">{f.icon}</div>
            <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">{f.desc}</p>
            <button className="text-[11px] font-medium text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition">
              {f.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeContent;
