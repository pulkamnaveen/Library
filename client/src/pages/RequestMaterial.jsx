import React from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import SearchApp from "../components/SearchForm";

const RequestMaterial = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex-1 bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#12121a] border border-gray-800/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 mb-1">Sign in required</p>
          <p className="text-xs text-gray-600 mb-4">You need to be logged in to request materials.</p>
          <button onClick={() => navigate("/auth")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition">
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0f] overflow-auto">
      <SearchApp />
    </div>
  );
};

export default RequestMaterial;
