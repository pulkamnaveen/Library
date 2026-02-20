import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/forgot-password`, { email });
      setMessage(res.data.message || "If this email is registered, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm bg-[#12121a] border border-gray-800/40 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white text-center mb-1">Forgot Password</h2>
        <p className="text-xs text-gray-500 text-center mb-5">Enter your account email to get a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition"
              placeholder="you@example.com"
              required
            />
          </div>

          {message && <p className="text-xs text-emerald-400">{message}</p>}
          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Remembered your password? {" "}
          <Link to="/auth" className="text-indigo-400 hover:text-indigo-300 font-medium transition">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
