import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const ViewResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/resource/${id}`);
        setResource(res.data.payload);
      } catch {
        // Failed to fetch
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!resource) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
      <p className="text-gray-500 text-sm">Resource not found</p>
      <button onClick={() => navigate(-1)} className="text-xs text-indigo-400 hover:text-indigo-300 transition">Go back</button>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-5 transition">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-white leading-tight">{resource.title}</h1>
          <div className="flex gap-1.5 flex-shrink-0">
            {resource.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{resource.category}</span>}
            {resource.resourceType && <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">{resource.resourceType}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-5">
          {resource.authorName && <span>By {resource.authorName}</span>}
          {resource.publisher && <span>&middot; {resource.publisher}</span>}
          <span>&middot; Added {new Date(resource.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          {resource.access && <span>&middot; {(resource.access || []).join(', ')} access</span>}
        </div>
        {(resource.keywords || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {resource.keywords.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/60 text-gray-400">{tag}</span>
            ))}
          </div>
        )}
        {resource.abstract && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Abstract</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{resource.abstract}</p>
          </div>
        )}
        {resource.content && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Content</h2>
            <div className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap bg-[#0a0a0f] border border-gray-800/40 rounded-lg p-4">
              {resource.content}
            </div>
          </div>
        )}
        {resource.fileUrl && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Download PDF</h2>
            <a
              href={`${API_BASE_URL}${resource.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </a>
          </div>
        )}
        <div className="border-t border-gray-800/40 pt-4">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Publication Details</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Author", resource.authorName],
              ["Publisher", resource.publisher],
              ["Category", resource.category],
              ["Type", resource.resourceType],
              ["Access", (resource.access || []).join(", ")],
              ["Added", new Date(resource.createdAt).toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label}>
                <span className="text-[10px] text-gray-600 uppercase">{label}</span>
                <p className="text-xs text-gray-400">{value || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewResource;


