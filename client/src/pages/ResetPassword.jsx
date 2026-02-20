import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/user/reset-password/${token}`, { password });
      setMessage(res.data.message || "Password reset successful.");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/auth"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-[#0a0a0f] px-4">
      <div className="w-full max-w-sm bg-[#12121a] border border-gray-800/40 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white text-center mb-1">Reset Password</h2>
        <p className="text-xs text-gray-500 text-center mb-5">Set a new password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full p-2.5 rounded-lg bg-[#0a0a0f] border border-gray-800/60 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition"
              placeholder="Re-enter new password"
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Back to {" "}
          <Link to="/auth" className="text-indigo-400 hover:text-indigo-300 font-medium transition">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
