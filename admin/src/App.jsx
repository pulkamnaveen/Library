import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Resource from "./pages/Resource";
import AddResource from "./pages/AddResource";
import MaterialRequest from "./pages/MaterialRequest";
import { API_BASE_URL, CLIENT_APP_URL } from "./config";

const App = () => {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Check for token in URL (redirected from client login)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("token");
      if (urlToken) {
        localStorage.setItem("admin_token", urlToken);
        // Clean the URL
        window.history.replaceState({}, "", "/");
      }

      const token = localStorage.getItem("admin_token");
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.user?.role === "admin") {
          setAdmin(res.data.user);
        } else {
          // Not admin — clear token
          localStorage.removeItem("admin_token");
        }
      } catch {
        localStorage.removeItem("admin_token");
      } finally {
        setChecking(false);
      }
    };
    init();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAdmin(null);
    window.location.href = `${CLIENT_APP_URL}/auth`;
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-white mb-1">Admin Access Required</h2>
          <p className="text-xs text-gray-500 mb-5">Please sign in with an admin account to access this panel.</p>
          <a href={`${CLIENT_APP_URL}/auth`}
            className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex bg-[#0a0a0f] min-h-screen text-white">
        <Sidebar onLogout={handleLogout} adminName={admin.name} />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/resource" element={<Resource />} />
            <Route path="/addResource" element={<AddResource />} />
            <Route path="/materialRequest" element={<MaterialRequest />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
