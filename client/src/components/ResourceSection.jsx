import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const ResourceSection = () => {
  const [recent, setRecent] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/resource/stats`);
        setRecent(res.data.payload?.recentResources || []);
        setPopular(res.data.payload?.popularResources || []);
      } catch {
        // fetch failed
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const Section = ({ title, items, linkTo }) => (
    <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <button onClick={() => navigate(linkTo)} className="text-[10px] text-indigo-400 hover:text-indigo-300 transition">View all</button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-4">No resources yet</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item._id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#0e0e15] transition cursor-pointer"
              onClick={() => navigate(`/view-details/${item._id}`)}>
              <div className="w-8 h-8 rounded-lg bg-[#0a0a0f] border border-gray-800/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-200 truncate">{item.title}</p>
                <p className="text-[10px] text-gray-600">{item.category || "N/A"} &middot; {item.resourceType || "N/A"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="px-6 pb-6 grid grid-cols-2 gap-4">
      <Section title="Recently Added" items={recent} linkTo="/browse-resource" />
      <Section title="Popular Resources" items={popular} linkTo="/browse-resource" />
    </div>
  );
};

export default ResourceSection;
