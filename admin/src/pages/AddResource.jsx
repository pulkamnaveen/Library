import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Upload, X } from "lucide-react";

const categories = ["Computer Science", "Electronics", "Mechanical", "Civil", "Mathematics", "Physics", "Chemistry", "Biology", "Other"];
const types = ["Article", "Book", "Thesis", "Journal", "Conference Paper", "Report", "Other"];
const publishers = ["IEEE", "Springer", "Elsevier", "Wiley", "ACM", "Other"];
const accessOptions = ["Public"];

const InputField = ({ label, value, onChange, area, placeholder, required, autoComplete }) => (
  <div>
    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {area ? (
      <textarea value={value} onChange={onChange} placeholder={placeholder} required={required}
        autoComplete={autoComplete || "off"}
        className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-indigo-500/50 resize-none h-24" />
    ) : (
      <input value={value} onChange={onChange} placeholder={placeholder} required={required}
        autoComplete={autoComplete || "off"}
        className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-indigo-500/50" />
    )}
  </div>
);

const SelectField = ({ label, value, onChange, options, required }) => (
  <div>
    <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <select value={value} onChange={onChange} required={required}
      className="w-full bg-[#0a0a0f] border border-gray-800/40 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50">
      <option value="">Select {label.toLowerCase()}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const AddResource = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", authorName: "", abstract: "", content: "", keywords: "",
    category: "", resourceType: "", publisher: "", access: ["Public"], fileUrl: ""
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [toast, setToast] = useState("");
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    const req = location.state?.fromRequest;
    if (req) {
      setForm({
        title: req.title || "",
        authorName: (req.authors || []).join(", ") || "",
        abstract: req.description || "",
        content: req.url || "",
        keywords: "",
        category: "",
        resourceType: req.resourceType || "",
        publisher: req.publisherOrJournal || "",
        access: [],
        fileUrl: req.url || ""
      });
      setRequestId(req._id);
    }
  }, [location.state]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

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
      setToast("Please select a PDF file");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('[AddResource] Form data:', form);
    console.log('[AddResource] PDF file:', pdfFile);
    
    // Validate required fields
    if (!form.title || !form.authorName || !form.category || !form.resourceType) {
      console.error('[AddResource] Missing required fields');
      setToast("❌ Please fill all required fields (Title, Author, Category, Type)");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    
    console.log('[AddResource] Validation passed, submitting...');
    setToast("⏳ Adding resource...");
    
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("authorName", form.authorName);
      formData.append("abstract", form.abstract);
      formData.append("content", form.content);
      formData.append("keywords", JSON.stringify(form.keywords.split(",").map(k => k.trim()).filter(Boolean)));
      formData.append("category", form.category);
      formData.append("resourceType", form.resourceType);
      formData.append("publisher", form.publisher);
      formData.append("access", JSON.stringify(form.access));
      formData.append("fileUrl", form.fileUrl);
      
      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      if (requestId) {
        formData.append("requestId", requestId);
      }

      console.log('[AddResource] Sending request to API...');
      const response = await axios.post("http://localhost:4000/api/admin/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log('[AddResource] API response:', response);
      if (response.status === 200 || response.status === 201) {
        setToast("✓ Resource added successfully!" + (requestId ? " User has been notified." : ""));
        setForm({ title: "", authorName: "", abstract: "", content: "", keywords: "", category: "", resourceType: "", publisher: "", access: [], fileUrl: "" });
        setPdfFile(null);
        setRequestId(null);
        
        setTimeout(() => {
          setToast("");
          if (location.state?.fromRequest) {
            navigate("/materialRequest");
          } else {
            navigate("/resource");
          }
        }, 2000);
      }
    } catch (e) {
      console.error('Add resource error:', e);
      setToast("❌ " + (e.response?.data?.message || "Failed to add resource"));
      setTimeout(() => setToast(""), 4000);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold text-white">Add Resource</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {location.state?.fromRequest ? "Adding resource from user request" : "Add a new resource to the digital library"}
        </p>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-xs ${toast.includes("success") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#12121a] border border-gray-800/40 rounded-xl p-6 space-y-4">
        <InputField label="Title" value={form.title} onChange={set("title")} placeholder="Resource title" required autoComplete="off" />
        <InputField label="Author" value={form.authorName} onChange={set("authorName")} placeholder="Author name" required autoComplete="name" />

        <div className="grid grid-cols-3 gap-3">
          <SelectField label="Category" value={form.category} onChange={set("category")} options={categories} required />
          <SelectField label="Type" value={form.resourceType} onChange={set("resourceType")} options={types} required />
          <SelectField label="Publisher" value={form.publisher} onChange={set("publisher")} options={publishers} />
        </div>

        <InputField label="Keywords" value={form.keywords} onChange={set("keywords")} placeholder="Comma separated keywords" />
        <InputField label="Abstract" value={form.abstract} onChange={set("abstract")} area placeholder="Brief description" />
        <InputField label="Content or URL" value={form.content} onChange={set("content")} area placeholder="Full content or external URL" />

        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Upload PDF</label>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-800/60 hover:border-indigo-500/40 bg-[#0a0a0f] cursor-pointer transition text-xs text-gray-500 hover:text-gray-300"
            >
              <Upload size={14} />
              {pdfFile ? pdfFile.name : "Click to upload PDF file"}
            </label>
            {pdfFile && (
              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <p className="text-[10px] text-gray-600 mt-1">Optional: Upload the resource as a PDF file (max 50MB)</p>
        </div>

        <div className="pt-2 flex gap-3">
          {location.state?.fromRequest && (
            <button type="button" onClick={() => navigate("/materialRequest")}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition">
              Cancel
            </button>
          )}
          <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition">
            Add Resource {location.state?.fromRequest && "& Notify User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddResource;
