import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const ResourceContext = createContext();

export const ResourceProvider = ({ children }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/resource/public`);
      setResources(res.data.payload || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <ResourceContext.Provider value={{ resources, loading }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => useContext(ResourceContext);