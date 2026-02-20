import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, ExternalLink, Plus } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function MaterialRequest() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/resource-requests`);
        setRequests(response.data.payload || []);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/resource-requests/${id}`,
        { status: newStatus }
      );
      if (response.data) {
        setRequests((prev) =>
          prev.map((req) => req._id === id ? { ...req, status: newStatus } : req)
        );
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);
  const counts = {
    All: requests.length,
    Pending: requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
  };

  const priorityColor = { High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-emerald-400' };
  const statusIcon = { Pending: <Clock size={14} />, Approved: <CheckCircle size={14} />, Rejected: <XCircle size={14} /> };
  const statusColor = {
    Pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    Approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    Rejected: 'bg-red-500/15 text-red-400 border border-red-500/30',
  };

  return (
    <div className="flex-1 p-8 min-h-screen bg-[#0a0a0f]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Material Requests</h2>
          <p className="text-gray-500 text-sm mt-1">{requests.length} total requests from users</p>
        </div>
        <div className="flex items-center gap-2 bg-[#12121a] border border-gray-800 rounded-lg p-1">
          {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                filter === f ? 'bg-[#1e1e2e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="mx-auto text-gray-700 mb-3" size={40} />
          <p className="text-gray-500">No {filter !== 'All' ? filter.toLowerCase() : ''} requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div key={req._id} className="bg-[#12121a] border border-gray-800/60 rounded-xl overflow-hidden hover:border-gray-700/60 transition">
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer" onClick={() => setExpandedId(expandedId === req._id ? null : req._id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium truncate">{req.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColor[req.status]}`}>
                      {statusIcon[req.status]} {req.status}
                    </span>
                    {req.fulfilledByResourceId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        ✓ Resource Added
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>by {req.requestedByName || 'Unknown'}</span>
                    <span>{req.resourceType || 'N/A'}</span>
                    <span className={priorityColor[req.priority] || 'text-gray-500'}>{req.priority || 'No'} priority</span>
                    <span>{new Date(req.createdTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {req.status === 'Pending' && (
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleStatusChange(req._id, 'Approved')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/15 text-emerald-400 text-xs font-medium hover:bg-emerald-600/25 transition border border-emerald-600/20">
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button onClick={() => handleStatusChange(req._id, 'Rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/15 text-red-400 text-xs font-medium hover:bg-red-600/25 transition border border-red-600/20">
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  )}
                  {expandedId === req._id ? <ChevronUp size={16} className="text-gray-600" /> : <ChevronDown size={16} className="text-gray-600" />}
                </div>
              </div>
              {expandedId === req._id && (
                <div className="px-5 pb-4 pt-1 border-t border-gray-800/40">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {req.authors?.length > 0 && <div><span className="text-gray-600">Authors:</span> <span className="text-gray-300 ml-1">{req.authors.join(', ')}</span></div>}
                    {req.publisherOrJournal && <div><span className="text-gray-600">Publisher:</span> <span className="text-gray-300 ml-1">{req.publisherOrJournal}</span></div>}
                    {req.year && <div><span className="text-gray-600">Year:</span> <span className="text-gray-300 ml-1">{req.year}</span></div>}
                    {req.doi && <div><span className="text-gray-600">DOI:</span> <span className="text-gray-300 ml-1">{req.doi}</span></div>}
                    {req.url && <div><span className="text-gray-600">URL:</span> <a href={req.url} target="_blank" rel="noreferrer" className="text-indigo-400 ml-1 inline-flex items-center gap-1 hover:underline">{req.url.slice(0, 40)}... <ExternalLink size={10} /></a></div>}
                  </div>
                  {req.description && <p className="text-gray-400 text-sm mt-3 leading-relaxed">{req.description}</p>}
                  {req.reasonForRequest && <p className="text-gray-500 text-xs mt-2 italic">Reason: {req.reasonForRequest}</p>}
                  <div className="mt-4 pt-3 border-t border-gray-800/40 flex justify-end">
                    <button
                      onClick={() => navigate('/addResource', { state: { fromRequest: req } })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600/15 text-indigo-400 text-xs font-medium hover:bg-indigo-600/25 transition border border-indigo-600/20">
                      <Plus size={14} /> Add as Resource
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
