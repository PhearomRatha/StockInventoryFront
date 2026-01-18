import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://backend.test
  withCredentials: true, // REQUIRED for Sanctum
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
})

/**
 * Optional: handle global auth errors
 */
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // session expired / not logged in
      // example:
      // authStore.logout()
      // router.push('/login')
    }

    return Promise.reject(error)
  }
)

export default api