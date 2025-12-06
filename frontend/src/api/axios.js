import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// Створюємо axios instance з базовим URL
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withCredentials: false,
})

// Додаємо interceptor для обробки помилок
apiClient.interceptors.request.use(
  (config) => {
    // Вимкнути CSRF для API запитів
    config.headers['X-CSRFToken'] = null
    // Додаємо credentials для сесійної аутентифікації
    config.withCredentials = true
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor для обробки помилок авторизації
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Якщо неавторизований, очищаємо auth store
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        authStore.logout()
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

