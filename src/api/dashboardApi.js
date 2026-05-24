import api from '../plugin/axios';
import ENDPOINTS from './endpoints';

export const dashboardApi = {
  getOverview: () => api.get(ENDPOINTS.DASHBOARD.INDEX),
};

export default dashboardApi;
