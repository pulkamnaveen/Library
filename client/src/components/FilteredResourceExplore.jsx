import React, { useState } from "react";
import { useResources } from "../context/ResourceContext";
import { useNavigate } from "react-router-dom";

const FilteredResourceExplorer = () => {
  const { resources } = useResources();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ category: [], type: [], publisher: [] });
  const [sortBy, setSortBy] = useState("newest");

  const categories = ["Computer Science", "Environmental Science", "Physics", "Economics", "Healthcare", "Biology", "Mathematics", "Engineering", "Electronics", "Mechanical", "Civil", "Chemistry", "Other"];
  const types = ["Research Paper", "Book", "Textbook", "Thesis", "Conference Paper", "Article", "Journal", "Report", "Other"];
  const publishers = ["IEEE", "Springer", "Elsevier", "Nature", "Science", "ACM", "Wiley", "MIT Press", "Other"];

  const toggleFilter = (group, value) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value) ? prev[group].filter((v) => v !== value) : [...prev[group], value],
    }));
  };

  const filtered = resources
    .filter((r) => r.isActive !== false)
    .filter((r) => filters.category.length === 0 || filters.category.includes(r.category))
    .filter((r) => filters.type.length === 0 || filters.type.includes(r.resourceType))
    .filter((r) => filters.publisher.length === 0 || filters.publisher.includes(r.publisher))
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return (a.title || "").localeCompare(b.title || "");
    });

  const FilterGroup = ({ title, items, group }) => (
    <div className="mb-4">
      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" checked={filters[group].includes(item)}
              onChange={() => toggleFilter(group, item)}
              className="w-3 h-3 accent-indigo-500" />
            <span className="text-xs text-gray-500 group-hover:text-gray-300 transition">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-60 bg-[#0e0e15] border-r border-gray-800/40 p-4 overflow-y-auto flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-white">Filters</p>
          <button onClick={() => setFilters({ category: [], type: [], publisher: [] })}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 transition">Clear all</button>
        </div>
        <FilterGroup title="Category" items={categories} group="category" />
        <FilterGroup title="Resource Type" items={types} group="type" />
        <FilterGroup title="Publisher" items={publishers} group="publisher" />
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</p>
          <div className="flex gap-1.5">
            {["newest", "oldest", "title"].map((s) => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`text-[10px] px-2.5 py-1 rounded-full transition ${
                  sortBy === s ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-gray-500 border border-gray-800/40 hover:text-gray-300"
                }`}>
                {s === "title" ? "A-Z" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-600">No resources match your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item._id}
                className="bg-[#12121a] border border-gray-800/40 rounded-xl p-4 hover:border-gray-700/60 transition cursor-pointer"
                onClick={() => navigate(`/view-details/${item._id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.authorName || "Unknown"} &middot; {item.publisher || "N/A"} &middot; {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    {item.abstract && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.abstract}</p>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {item.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{item.category}</span>}
                    {item.resourceType && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">{item.resourceType}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilteredResourceExplorer;
