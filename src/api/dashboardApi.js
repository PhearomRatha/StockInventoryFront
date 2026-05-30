import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

const getResponseData = (response) => {
  if (response.data?.data !== undefined) {
    return response.data.data;
  }
  return response.data;
};

const getResponse = async (promise) => {
  try {
    const response = await promise;
    return {
      success: true,
      data: getResponseData(response),
      message: response.data?.message || '',
      status: response.status,
    };
  } catch (error) {
    const errorData = error.response?.data || {};
    return {
      success: false,
      data: null,
      message: errorData.message || errorData.error || 'An error occurred',
      errors: errorData.errors || null,
      status: error.response?.status || 500,
    };
  }
};

export const dashboardApi = {
  getOverview: () => getResponse(api.get(ENDPOINTS.DASHBOARD.INDEX)),
};

export default dashboardApi;
