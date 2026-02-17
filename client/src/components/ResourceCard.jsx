import React from "react";
import { useNavigate } from "react-router-dom";

const ResourceCard = ({ resource }) => {
  const navigate = useNavigate();

  // Function to handle navigation to the view details page
  const handleViewDetails = () => {
    navigate(`/view-details/${resource._id}`);
  };

  return (
    <div className="bg-black text-white p-6 rounded-xl max-w-4xl mx-auto shadow-lg">
      {/* Title Section */}
      <h1 className="text-2xl font-bold mb-2">{resource?.title || "Advances in Machine Learning: A Comprehensive Survey"}</h1>
      <p className="text-gray-400">
        {resource?.authorName || "John Smith, Alice Johnson"} • {resource?.publisher || "IEEE Transactions on Neural Networks"} • {
          resource?.createdAt ? new Date(resource.createdAt).toLocaleDateString() : "2023-04-15"
        }
      </p>
      
      {/* Abstract Section */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Abstract</h2>
        <p className="text-gray-300">
          {resource?.abstract || 
            "This paper provides a comprehensive survey of recent advances in machine learning, focusing on deep learning, reinforcement learning, and their applications."}
        </p>
      </div>
      
      {/* Keywords Section */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Keywords</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {(resource?.keywords || ["Machine Learning", "Deep Learning", "Reinforcement Learning", "Survey", "Applications"]).map((keyword) => (
            <span key={keyword} className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm">{keyword}</span>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button 
          className="bg-blue-600 p-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          onClick={handleViewDetails}
        >
          👁️ View Details
        </button>
        <button className="bg-gray-800 p-2 rounded-lg flex items-center gap-2 hover:bg-gray-600">
          ⬇ Download PDF
        </button>
        <button className="bg-gray-800 p-2 rounded-lg flex items-center gap-2 hover:bg-gray-600">
          🔗 Share
        </button>
      </div>
      
      {/* Tabs Section */}
      <div className="flex mt-6 border-b border-gray-700">
        {["Details", "Citation", "Related"].map((tab, index) => (
          <button key={index} className={`py-2 px-4 ${index === 0 ? "border-b-2 border-white" : "text-gray-400"}`}>
            {tab}
          </button>
        ))}
      </div>
      
      {/* Publication Details */}
      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
        <h2 className="text-lg font-semibold">Publication Details</h2>
        <p><strong>Authors:</strong> {resource?.authorName || "John Smith, Alice Johnson"}</p>
        <p><strong>Journal:</strong> {resource?.publisher || "IEEE Transactions on Neural Networks"}</p>
        <p><strong>Category:</strong> {resource?.category || "Machine Learning"}</p>
        <p><strong>Resource Type:</strong> {resource?.resourceType || "Article"}</p>
      </div>
      
      {/* Right Panel: Metrics & Access */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Resource Metrics</h2>
          <p>Citations: <strong>45</strong></p>
          <p>Views: <strong>1245</strong></p>
          <p>Downloads: <strong>876</strong></p>
        </div>
        <div className="bg-gray-900 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Access Options</h2>
          <button className="w-full bg-white text-black py-2 rounded-lg mb-2">📖 Read Online</button>
          <button className="w-full bg-gray-700 py-2 rounded-lg">Check Availability</button>
          <p className="mt-2 text-sm text-gray-400">Can't access this resource? <a href="#" className="text-blue-400">Request access</a></p>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;