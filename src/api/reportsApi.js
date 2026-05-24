import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

const getResponse = async (promise) => {
  try {
    const response = await promise;
    return {
      success: true,
      data: response.data?.data !== undefined ? response.data.data : response.data,
      message: response.data?.message || '',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Network error',
    };
  }
};

export const getStockReport = async () => {
  const response = await getResponse(api.get(ENDPOINTS.REPORTS.STOCK));
  if (!response.success || !response.data) {
    return { total_low_stock: 0, total_out_of_stock: 0 };
  }
  return response.data;
};