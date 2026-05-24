import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    // Unwrap {success,message,data} style payloads so callers get resp.data directly as the payload
    if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
        
        ElMessage.error('Session expired. Please login again.')
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      if (status === 403) {
        ElMessage.error(data.message || 'You do not have permission to perform this action.')
      }

      if (status === 422) {
        const messages = Object.values(data.errors || {}).flat()
        ElMessage.error(messages[0] || 'Validation failed.')
      }

      if (status === 500) {
        ElMessage.error('Server error. Please try again later.')
      }
    } else if (error.request) {
      ElMessage.error('Network error. Please check your connection.')
    } else {
      ElMessage.error(error.message || 'An unexpected error occurred.')
    }

    return Promise.reject(error)
  }
)

export default api