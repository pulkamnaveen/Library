import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { API_BASE_URL } from "../config";

const AuthForm = () => {
  const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5179";
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user", adminCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, login_token } = useUser();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE_URL}/api/user/login`, {
          email: formData.email,
          password: formData.password,
        });
        const { token, user } = res.data;
        login(user);
        login_token(token);

        // If admin, redirect to admin panel with token
        if (user.role === "admin") {
          window.location.href = `${adminUrl}?token=${encodeURIComponent(token)}`;
          return;
        }
        navigate("/");
      } else {
        const body = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        if (formData.role === "admin") body.adminCode = formData.adminCode;
        const res = await axios.post(`${API_BASE_URL}/api/user/register`, body);
        // Register response: { payload: { _id, userId, name, email, role, token } }
        const payload = res.data.payload || {};
        const token = payload.token;
        if (!token) throw new Error("Registration failed");
        const user = { _id: payload._id, userId: payload.userId, name: payload.name, email: payload.email, role: payload.role };
        login(user);
        login_token(token);

        if (user.role === "admin") {
          window.location.href = `${adminUrl}?token=${encodeURIComponent(token)}`;
          return;
        }
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[#0a0a0f]">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <div className="bg-[#12121a] border border-gray-800/40 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white text-center mb-1">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-xs text-gray-500 text-center mb-5">
            {isLogin ? "Sign in to access the library" : "Register for a new account"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Name</label>
                <input name="name" value={formData.name} onChange={handleChange}
                  className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition"
                  placeholder="Full name" required />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange}
                className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition"
                placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange}
                className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition"
                placeholder="Enter password" required />
            </div>

            {isLogin && (
              <div className="-mt-1">
                <Link to="/forgot-password" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition">
                  Forgot password?
                </Link>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Account Type</label>
                <div className="flex gap-2">
                  {[
                    { value: "user", label: "User", desc: "Browse & request resources" },
                    { value: "admin", label: "Admin", desc: "Manage the library" },
                  ].map(({ value, label, desc }) => (
                    <button key={value} type="button"
                      onClick={() => setFormData({ ...formData, role: value, adminCode: "" })}
                      className={`flex-1 p-2.5 rounded-lg border text-left transition ${
                        formData.role === value
                          ? "border-indigo-500/60 bg-indigo-500/10"
                          : "border-gray-800/60 bg-[#0a0a0f] hover:border-gray-700"
                      }`}>
                      <p className={`text-xs font-medium ${formData.role === value ? "text-indigo-400" : "text-gray-400"}`}>{label}</p>
                      <p className="text-[10px] text-gray-600 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLogin && formData.role === "admin" && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Admin Secret Code</label>
                <input name="adminCode" type="password" value={formData.adminCode} onChange={handleChange}
                  className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition"
                  placeholder="Enter the admin authorization code" required />
                <p className="text-[10px] text-gray-600 mt-1">Contact the system administrator for this code</p>
              </div>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition">
              {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => { 
              setIsLogin(!isLogin); 
              setError(""); 
              setFormData({ name: "", email: "", password: "", role: "user", adminCode: "" });
            }}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
