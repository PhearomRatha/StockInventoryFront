import { useState, useEffect } from 'react';
import axios from 'axios';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          ...options
        });
        setData(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (url) fetchData();
  }, [url]);

  return { data, loading, error };
};