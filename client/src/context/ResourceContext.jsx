import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "./UserContext";

const ResourceContext = createContext();

export const ResourceProvider = ({ children }) => {
  const { user } = useUser();
  const role = user?.role || "public";

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async (userRole) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      let endpoint = "http://localhost:4000/api/resource/public";
      const config = {};

      if (userRole === "student") {
        endpoint = "http://localhost:4000/api/resource/student";
        config.headers = { Authorization: `Bearer ${token}` };
      } else if (userRole === "faculty") {
        endpoint = "http://localhost:4000/api/resource/faculty";
        config.headers = { Authorization: `Bearer ${token}` };
      }

      const res = await axios.get(endpoint, config);
      setResources(res.data.payload || []);
    } catch (error) {
      console.error("Error fetching resources:", error.response?.data || error.message);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources(role);
  }, [role]);

  return (
    <ResourceContext.Provider value={{ resources, loading }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => useContext(ResourceContext);