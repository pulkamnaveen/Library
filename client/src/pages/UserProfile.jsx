import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { API_BASE_URL } from "../config";

export default function UserProfile() {
  const { user, login, logout } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [tab, setTab] = useState("profile"); // "profile" | "bookmarks"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "success"|"error", text }

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.payload);
        setName(res.data.payload.name || "");
        setBookmarks(res.data.payload.bookmarks || []);
      } catch {
        // failed
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (newPassword && newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "New passwords do not match" });
      return;
    }
    setSaving(true);
    try {
      const body = { name };
      if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
      await axios.put(`${API_BASE_URL}/api/user/profile`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update user context name
      login({ ...user, name });
      setMsg({ type: "success", text: "Profile updated successfully" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    }
    setSaving(false);
  };

  const removeBookmark = async (resourceId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/user/bookmark/${resourceId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(prev => prev.filter(b => b._id !== resourceId));
    } catch { /* non-critical */ }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white">
          {profile?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="text-base font-bold text-white">{profile?.name}</h1>
          <p className="text-xs text-gray-500">{profile?.email}</p>
        </div>
        <button onClick={logout} className="ml-auto text-xs text-gray-500 hover:text-red-400 transition">Sign out</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[#12121a] border border-gray-800/40 rounded-lg p-1 w-fit">
        {["profile", "bookmarks"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition capitalize ${tab === t ? "bg-indigo-500/15 text-indigo-400" : "text-gray-500 hover:text-gray-300"}`}>
            {t}{t === "bookmarks" ? ` (${bookmarks.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={handleSave} className="bg-[#12121a] border border-gray-800/40 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">Edit Profile</h2>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white outline-none focus:border-indigo-500/40 transition" />
          </div>

          <div className="border-t border-gray-800/40 pt-4">
            <h3 className="text-xs font-semibold text-gray-400 mb-3">Change Password <span className="text-gray-600 font-normal">(leave blank to keep current)</span></h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white outline-none focus:border-indigo-500/40 transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white outline-none focus:border-indigo-500/40 transition" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white outline-none focus:border-indigo-500/40 transition" />
                </div>
              </div>
            </div>
          </div>

          {msg && (
            <p className={`text-xs px-3 py-2 rounded-lg ${msg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
              {msg.text}
            </p>
          )}

          <button type="submit" disabled={saving}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {tab === "bookmarks" && (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-8 text-center">
              <p className="text-sm text-gray-600">No bookmarks yet</p>
              <p className="text-xs text-gray-700 mt-1">Bookmark resources by clicking the bookmark icon on any resource page</p>
            </div>
          ) : bookmarks.map(bm => (
            <div key={bm._id} className="bg-[#12121a] border border-gray-800/40 rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/view-details/${bm._id}`)}>
                <h3 className="text-sm font-medium text-white hover:text-indigo-300 transition truncate">{bm.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{bm.authorName || "Unknown"} &middot; {bm.category || "N/A"} &middot; {bm.resourceType || "N/A"}</p>
                {bm.abstract && <p className="text-xs text-gray-600 mt-1.5 line-clamp-1">{bm.abstract}</p>}
              </div>
              <button onClick={() => removeBookmark(bm._id)} title="Remove bookmark"
                className="p-1.5 text-gray-600 hover:text-red-400 border border-gray-800/60 hover:border-red-500/30 rounded-lg transition flex-shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
