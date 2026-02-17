import React, { useState, useEffect } from "react";
import axios from "axios";

const StatCard = ({ label, value, color }) => (
  <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-5">
    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, articles: 0, books: 0, others: 0 });
  const [recent, setRecent] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAll, reqRes] = await Promise.all([
          axios.get("http://localhost:4000/api/resource/all"),
          axios.get("http://localhost:4000/api/admin/resource-requests"),
        ]);
        const resources = resAll.data.payload || [];
        setStats({
          total: resources.length,
          articles: resources.filter(r => r.resourceType === "Article").length,
          books: resources.filter(r => r.resourceType === "Book").length,
          others: resources.filter(r => !["Article","Book"].includes(r.resourceType)).length,
        });
        setRecent(resources.slice(-5).reverse());
        setRequests((reqRes.data.payload || []).slice(-5).reverse());
      } catch (e) {
        // Failed
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Dashboard</h1>
        <p className="text-xs text-gray-500 mt-0.5">Overview of your digital library</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Resources" value={stats.total} color="text-white" />
        <StatCard label="Articles" value={stats.articles} color="text-indigo-400" />
        <StatCard label="Books" value={stats.books} color="text-violet-400" />
        <StatCard label="Others" value={stats.others} color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-5">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Recently Added</h2>
          {recent.length === 0 ? (
            <p className="text-xs text-gray-600">No resources yet</p>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div key={r._id} className="flex items-center justify-between py-1.5 border-b border-gray-800/30 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300 truncate">{r.title}</p>
                    <p className="text-[10px] text-gray-600">{r.category}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 flex-shrink-0 ml-3">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-5">
          <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">Recent Requests</h2>
          {requests.length === 0 ? (
            <p className="text-xs text-gray-600">No requests yet</p>
          ) : (
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r._id} className="flex items-center justify-between py-1.5 border-b border-gray-800/30 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300 truncate">{r.title}</p>
                    <p className="text-[10px] text-gray-600">{r.userName || "Unknown"}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    r.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                    r.status === "rejected" ? "bg-red-500/10 text-red-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>{r.status || "pending"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
