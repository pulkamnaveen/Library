import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { API_BASE_URL } from "../config";

const MaterialRequestForm = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: "", authors: "", resourceType: "", publisherOrJournal: "",
    year: "", doi: "", url: "", description: "", priority: "", reasonForRequest: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const token = localStorage.getItem("token");
    
    // Validation
    if (!user?._id) {
      setError("You must be logged in to submit a request. Please log out and log back in.");
      setLoading(false);
      return;
    }
    if (!token) {
      setError("Authentication token missing. Please log out and log back in.");
      setLoading(false);
      return;
    }
    if (!formData.priority) {
      setError("❌ Please select a priority level.");
      setLoading(false);
      return;
    }
    if (!formData.title || !formData.authors || !formData.resourceType || !formData.description || !formData.reasonForRequest) {
      setError("❌ Please fill all required fields marked with *");
      setLoading(false);
      return;
    }
    
    try {
      const body = {
        ...formData,
        authors: formData.authors.split(',').map(a => a.trim()).filter(a => a),
        year: formData.year ? parseInt(formData.year) : undefined,
        requestedById: user._id,
        requestedByName: user.name
      };
      const response = await axios.post(`${API_BASE_URL}/api/user/resource-request`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if it's actually a success (not a validation error)
      if (response.data.message && response.data.message.includes('validation failed')) {
        throw new Error(response.data.message);
      }
      
      setSuccess(true);
      setFormData({ title: "", authors: "", resourceType: "", publisherOrJournal: "", year: "", doi: "", url: "", description: "", priority: "", reasonForRequest: "" });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Submission failed";
      setError(msg);
      console.error("Request submission error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = "text", placeholder, required = false, autoComplete = "off" }) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input name={name} value={formData[name]} onChange={handleChange} type={type}
        autoComplete={autoComplete}
        className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition"
        placeholder={placeholder} required={required} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Request Material</h2>
        <p className="text-xs text-gray-500 mt-0.5">Fill out details about the material you need.</p>
      </div>
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-5 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs text-emerald-400">Request submitted successfully.</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-[#12121a] border border-gray-800/40 rounded-xl p-6 space-y-4">
        <InputField label="Title" name="title" placeholder="Material title" required autoComplete="off" />
        <InputField label="Authors" name="authors" placeholder="Author names, separated by commas" required autoComplete="name" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">
              Resource Type <span className="text-red-400">*</span>
            </label>
            <select name="resourceType" value={formData.resourceType} onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-gray-300 outline-none focus:border-indigo-500/40 transition" required>
              <option value="">Select type</option>
              {["Book", "Journal", "Article", "Report", "Thesis", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <InputField label="Publisher / Journal" name="publisherOrJournal" placeholder="Publisher name" required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Year" name="year" placeholder="YYYY" required />
          <InputField label="DOI" name="doi" placeholder="10.xxxx/xxxxx" />
          <InputField label="URL" name="url" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Description *</label>
          <textarea name="description" value={formData.description} onChange={handleChange}
            className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none resize-none h-20 focus:border-indigo-500/40 transition"
            placeholder="Brief description of the material" required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Priority *</label>
          <div className="flex gap-3">
            {[["Low", "Not urgent"], ["Medium", "Needed soon"], ["High", "Urgent"]].map(([val, hint]) => (
              <label key={val} className={`flex-1 text-center py-2 rounded-lg border cursor-pointer transition text-xs ${
                formData.priority === val
                  ? val === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : val === 'Medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'border-gray-800/60 text-gray-500 hover:border-gray-700'
              }`}>
                <input type="radio" name="priority" value={val} checked={formData.priority === val} onChange={handleChange} className="hidden" />
                <div className="font-medium">{val}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{hint}</div>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">
            Reason for Request <span className="text-red-400">*</span>
          </label>
          <textarea name="reasonForRequest" value={formData.reasonForRequest} onChange={handleChange}
            className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none resize-none h-16 focus:border-indigo-500/40 transition"
            placeholder="Why do you need this material?" required />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition">
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

const MyRequests = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/user/resource-request/${user?._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data.payload || []);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchRequests();
  }, [user]);

  const statusColor = {
    Pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">My Requests</h2>
        <p className="text-xs text-gray-500 mt-0.5">Track the status of your material requests.</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-[#12121a] border border-gray-800/40 rounded-xl">
          <p className="text-gray-600 text-sm">No requests submitted yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req._id} className="bg-[#12121a] border border-gray-800/40 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-white">{req.title}</h3>
                    {req.fulfilledByResourceId && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        ✓ Resource Added
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span>{req.resourceType}</span>
                    <span>{(req.authors || []).join(', ')}</span>
                    <span>{new Date(req.createdTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusColor[req.status] || 'text-gray-500 border-gray-700'}`}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchApp = () => {
  const [activeTab, setActiveTab] = useState("form");

  return (
    <div className="p-6">
      <div className="flex justify-center gap-1 mb-6 bg-[#12121a] border border-gray-800/40 rounded-lg p-1 max-w-xs mx-auto">
        {[["form", "New Request"], ["requests", "My Requests"]].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === key ? 'bg-[#1e1e2e] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
            }`}>
            {label}
          </button>
        ))}
      </div>
      {activeTab === "form" ? <MaterialRequestForm /> : <MyRequests />}
    </div>
  );
};

export default SearchApp;
