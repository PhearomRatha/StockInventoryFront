import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export const getStockReport = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_BASE}/reports/stock`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};