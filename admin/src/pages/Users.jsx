import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState(null);

  const token = localStorage.getItem("admin_token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.payload || []);
    } catch {
      setMsg({ type: "error", text: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await axios.delete(`${API_BASE_URL}/api/user/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(u => u._id !== id));
      setMsg({ type: "success", text: `User "${name}" deleted` });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to delete user" });
    }
    setDeleting(null);
  };

  const roleColor = (role) => {
    if (role === "admin") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Users</h1>
          <p className="text-xs text-gray-500 mt-0.5">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {msg && (
        <p className={`text-xs px-3 py-2 rounded-lg ${msg.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
          {msg.text}
        </p>
      )}

      <div className="bg-[#12121a] border border-gray-800/40 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-10">No users found</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/40">
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">Joined</th>
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-800/30 last:border-0 hover:bg-[#0e0e15] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="text-xs text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${roleColor(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== "admin" && (
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        disabled={deleting === u._id}
                        className="text-[10px] px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition">
                        {deleting === u._id ? "..." : "Delete"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Users;
