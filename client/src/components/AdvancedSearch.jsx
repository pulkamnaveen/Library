import { useState, useEffect } from "react";
import { useResources } from "../context/ResourceContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const SEARCH_PAGE_SIZE = 12;

export default function AdvancedSearch() {
  const { resources } = useResources();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    keywords: "", author: "", resourceType: "", category: "",
    publisher: "", publicationYear: "", searchIn: "all", sortBy: "relevance",
  });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setFilters((prev) => ({ ...prev, keywords: q }));
      setTimeout(() => document.getElementById("search-btn")?.click(), 100);
    }
  }, [searchParams]);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const clearFilters = () => {
    setFilters({ keywords: "", author: "", resourceType: "", category: "", publisher: "", publicationYear: "", searchIn: "all", sortBy: "relevance" });
    setResults([]);
    setSearched(false);
    setPage(1);
  };

  const handleSearch = () => {
    let filtered = resources.filter((res) => {
      const keyword = filters.keywords.toLowerCase();
      const field = (f) => (res[f] || "").toLowerCase();
      const matchKw = () => {
        if (!keyword) return true;
        if (filters.searchIn === "all") return field("title").includes(keyword) || field("abstract").includes(keyword) || field("content").includes(keyword);
        return field(filters.searchIn).includes(keyword);
      };
      return matchKw()
        && (!filters.author || field("authorName").includes(filters.author.toLowerCase()))
        && (!filters.resourceType || res.resourceType === filters.resourceType)
        && (!filters.category || res.category === filters.category)
        && (!filters.publisher || res.publisher === filters.publisher);
    });
    if (filters.sortBy === "newest") filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (filters.sortBy === "oldest") filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (filters.sortBy === "popular") filtered.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    setResults(filtered);
    setSearched(true);
    setPage(1);
  };

  const totalPages = Math.ceil(results.length / SEARCH_PAGE_SIZE);
  const paginated = results.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE);

  const SelectField = ({ name, label, options }) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
      <select name={name} value={filters[name]} onChange={handleChange}
        className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-gray-300 outline-none focus:border-indigo-500/40 transition">
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-bold text-white mb-4">Search Parameters</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Keywords</label>
            <input type="text" name="keywords" placeholder="Enter keywords..." value={filters.keywords} onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Author</label>
            <input type="text" name="author" placeholder="Author name" value={filters.author} onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <SelectField name="resourceType" label="Resource Type" options={["Book","Textbook","Thesis","Research Paper","Conference Paper"]} />
          <SelectField name="category" label="Category" options={["Computer Science","Environmental Science","Physics","Economics","Healthcare","Biology","Mathematics","Engineering"]} />
          <SelectField name="publisher" label="Publisher" options={["IEEE","Springer","Elsevier","Nature","Science","ACM","Wiley","MIT Press"]} />
          <SelectField name="sortBy" label="Sort By" options={["relevance","newest","oldest","popular"]} />
        </div>
        <div className="flex items-center gap-6 mb-4">
          <span className="text-xs text-gray-400 font-medium">Search in:</span>
          <div className="flex gap-4">
            {["all", "title", "abstract", "content"].map((option) => (
              <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="searchIn" value={option} checked={filters.searchIn === option} onChange={handleChange}
                  className="w-3 h-3 accent-indigo-500" />
                <span className="text-xs text-gray-400 capitalize">{option === "all" ? "All fields" : option}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={clearFilters}
            className="px-4 py-2 rounded-lg border border-gray-800/60 text-xs text-gray-400 hover:text-gray-200 hover:border-gray-700 transition">
            Clear Filters
          </button>
          <button id="search-btn" onClick={handleSearch}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </div>
      {searched && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3">
            {results.length > 0 ? `${results.length} result${results.length > 1 ? 's' : ''} found` : 'No results found'}
          </h3>
          <div className="space-y-3">
            {paginated.map((res) => (
              <div key={res._id} className="bg-[#12121a] border border-gray-800/40 rounded-xl p-4 hover:border-gray-700/60 transition cursor-pointer"
                onClick={() => navigate(`/view-details/${res._id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white">{res.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {res.authorName || "Unknown"} &middot; {res.publisher || "N/A"} &middot; {new Date(res.createdAt).toLocaleDateString()}
                      {res.downloadCount > 0 && <span className="ml-2 text-gray-600">&middot; {res.downloadCount} dl</span>}
                    </p>
                    {res.abstract && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{res.abstract}</p>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {res.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{res.category}</span>}
                    {res.resourceType && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">{res.resourceType}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-gray-800/40">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-800/40 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition">
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e${i}`} className="text-xs text-gray-600 px-1">…</span>
                  : <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 text-xs rounded-lg border transition ${p === page ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "border-gray-800/40 text-gray-500 hover:text-white hover:border-gray-700"}`}>
                      {p}
                    </button>
                )}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-800/40 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

