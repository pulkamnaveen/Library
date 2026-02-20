import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Edit, FileText, Download, X, Upload } from "lucide-react";
import { API_BASE_URL } from "../config";

const Resource = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  const categories = ["Computer Science", "Electronics", "Mechanical", "Civil", "Mathematics", "Physics", "Chemistry", "Biology", "Other"];
  const types = ["Article", "Book", "Thesis", "Journal", "Conference Paper", "Report", "Other"];
  const publishers = ["IEEE", "Springer", "Elsevier", "Wiley", "ACM", "Other"];
  const accessOptions = ["Public"];

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resource/all`);
      setResources(res.data.payload || []);
    } catch {
      // Failed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this resource? This action cannot be undone.")) return;
    try {
      await axios.put(`${API_BASE_URL}/api/admin/delete/${id}`, { isActive: false });
      setResources(prev => prev.filter(r => r._id !== id));
      alert("Resource deleted successfully");
    } catch (e) {
      alert("Failed to delete resource: " + (e.response?.data?.message || "Unknown error"));
    }
  };

  const openEdit = (r) => {
    setForm({ 
      ...r,
      keywords: (r.keywords || []).join(", "),
      access: r.access || []
    });
    setEditModal(r._id);
    setPdfFile(null);
  };

  const toggleAccess = (val) => {
    setForm(prev => ({
      ...prev,
      access: prev.access.includes(val) ? prev.access.filter(a => a !== val) : [...prev.access, val],
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleUpdate = async () => {
    try {
      if (pdfFile) {
        const formData = new FormData();
        Object.keys(form).forEach(key => {
          if (key === 'keywords') {
            formData.append(key, JSON.stringify(form[key].split(",").map(k => k.trim()).filter(Boolean)));
          } else if (key === 'access') {
            formData.append(key, JSON.stringify(form[key]));
          } else {
            formData.append(key, form[key] || "");
          }
        });
        formData.append("pdf", pdfFile);
        
        await axios.put(`${API_BASE_URL}/api/admin/resource/${editModal}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        const updateData = {
          ...form,
          keywords: form.keywords.split(",").map(k => k.trim()).filter(Boolean)
        };
        await axios.put(`${API_BASE_URL}/api/admin/resource/${editModal}`, updateData);
      }
      
      setEditModal(null);
      setPdfFile(null);
      fetchResources();
      alert("Resource updated successfully");
    } catch (e) {
      alert("Failed to update: " + (e.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Resources</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage all library resources ({resources.length} total)</p>
        </div>
        <div className="flex gap-2 bg-[#12121a] border border-gray-800/40 rounded-lg p-1">
          <button onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${viewMode === "table" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            Table
          </button>
          <button onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
            Grid
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-[#12121a] border border-gray-800/40 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800/40 text-gray-500 uppercase text-[10px] tracking-wider">
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Author</th>
                <th className="text-left px-4 py-3">File</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r._id} className="border-b border-gray-800/20 hover:bg-gray-800/10 transition">
                  <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate">{r.title}</td>
                  <td className="px-4 py-3 text-gray-500">{r.category}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px]">{r.resourceType}</span></td>
                  <td className="px-4 py-3 text-gray-500">{r.authorName}</td>
                  <td className="px-4 py-3">
                    {r.fileUrl ? (
                      <a href={`${API_BASE_URL}${r.fileUrl}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition">
                        <Download size={12} /> PDF
                      </a>
                    ) : (
                      <span className="text-gray-600 text-[10px]">No file</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => openEdit(r)} 
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(r._id)} 
                      className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 transition">
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-600">No resources found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <div key={r._id} className="bg-[#12121a] border border-gray-800/40 rounded-xl p-4 hover:border-gray-700/60 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate mb-1">{r.title}</h3>
                  <p className="text-xs text-gray-500">{r.authorName}</p>
                </div>
                {r.fileUrl && (
                  <a href={`${API_BASE_URL}${r.fileUrl}`} target="_blank" rel="noreferrer"
                    className="ml-2 p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition">
                    <FileText size={14} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3 text-[10px]">
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{r.resourceType}</span>
                <span className="text-gray-600">{r.category}</span>
              </div>
              {r.abstract && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{r.abstract}</p>
              )}
              <div className="flex gap-2 pt-3 border-t border-gray-800/40">
                <button onClick={() => openEdit(r)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600/25 text-xs font-medium transition">
                  <Edit size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(r._id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-600/15 text-red-400 hover:bg-red-600/25 text-xs font-medium transition">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
          {resources.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-600">No resources found</div>
          )}
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-white">Edit Resource</h2>
              <button onClick={() => { setEditModal(null); setPdfFile(null); }} 
                className="p-1 text-gray-500 hover:text-white transition rounded-lg hover:bg-gray-800/50">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase block mb-1">Title *</label>
                <input value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50" />
              </div>
              
              <div>
                <label className="text-[10px] text-gray-500 uppercase block mb-1">Author *</label>
                <input value={form.authorName || ""} onChange={e => setForm({ ...form, authorName: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase block mb-1">Category</label>
                  <select value={form.category || ""} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50">
                    <option value="">Select</option>
                    {categories.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase block mb-1">Type</label>
                  <select value={form.resourceType || ""} onChange={e => setForm({ ...form, resourceType: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50">
                    <option value="">Select</option>
                    {types.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase block mb-1">Publisher</label>
                  <select value={form.publisher || ""} onChange={e => setForm({ ...form, publisher: e.target.value })}
                    className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50">
                    <option value="">Select</option>
                    {publishers.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase block mb-1">Keywords</label>
                <input value={form.keywords || ""} onChange={e => setForm({ ...form, keywords: e.target.value })}
                  placeholder="Comma separated keywords"
                  className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-indigo-500/50" />
              </div>
              
              <div>
                <label className="text-[10px] text-gray-500 uppercase block mb-1">Abstract</label>
                <textarea value={form.abstract || ""} onChange={e => setForm({ ...form, abstract: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 resize-none h-20" />
              </div>
              
              <div>
                <label className="text-[10px] text-gray-500 uppercase block mb-1">Content or URL</label>
                <textarea value={form.content || ""} onChange={e => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 resize-none h-24" />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Access Level</label>
                <div className="flex gap-3">
                  {accessOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                       <input type="checkbox" checked={(form.access || []).includes(opt)} onChange={() => toggleAccess(opt)}
                        className="w-3 h-3 rounded border-gray-700 bg-[#0a0a0f] text-indigo-500 focus:ring-0 focus:ring-offset-0" />
                      <span className="text-xs text-gray-400">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">
                  {form.fileUrl ? "Replace PDF File" : "Upload PDF File"}
                </label>
                {form.fileUrl && !pdfFile && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
                    <FileText size={14} />
                    <span>Current file available</span>
                    <a href={`${API_BASE_URL}${form.fileUrl}`} target="_blank" rel="noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
                      <Download size={12} /> Download
                    </a>
                  </div>
                )}
                <div className="relative">
                  <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange}
                    className="hidden" id="pdf-upload-edit" />
                  <label htmlFor="pdf-upload-edit"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-800/60 hover:border-indigo-500/40 bg-[#0a0a0f] cursor-pointer transition text-xs text-gray-500 hover:text-gray-300">
                    <Upload size={14} />
                    {pdfFile ? pdfFile.name : form.fileUrl ? "Click to replace PDF file" : "Click to upload PDF file"}
                  </label>
                  {pdfFile && (
                    <button type="button" onClick={() => setPdfFile(null)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Optional: Upload or replace the resource PDF file (max 50MB)</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800/40">
              <button onClick={() => { setEditModal(null); setPdfFile(null); }} 
                className="px-5 py-2 text-xs text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800/50">
                Cancel
              </button>
              <button onClick={handleUpdate} 
                className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resource;
