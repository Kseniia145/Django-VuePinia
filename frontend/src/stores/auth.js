import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    userName: (state) => {
      return state.user?.username || ''
    },
    userId: (state) => {
      return state.user?.id || null
    },
  },

  actions: {
    // Реєстрація
    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.post('/auth/register/', userData)
        // Після реєстрації автоматично логінимо користувача
        await this.login({
          username: userData.username,
          password: userData.password,
        })
        return response.data
      } catch (error) {
        this.error = error.response?.data || error.message || 'Помилка реєстрації'
        console.error('Error registering:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Логін
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.post('/auth/login/', credentials)
        this.user = response.data.user
        this.isAuthenticated = true
        // Зберігаємо в localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        return response.data
      } catch (error) {
        this.error = error.response?.data || error.message || 'Помилка входу'
        console.error('Error logging in:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Вихід
    async logout() {
      this.loading = true
      try {
        await apiClient.post('/auth/logout/')
      } catch (error) {
        console.error('Error logging out:', error)
      } finally {
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('user')
        this.loading = false
        router.push('/')
      }
    },

    // Отримати поточного користувача
    async fetchCurrentUser() {
      try {
        const response = await apiClient.get('/auth/current-user/')
        this.user = response.data.user
        this.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(this.user))
        return response.data
      } catch (error) {
        // Якщо не авторизований, очищаємо стан
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('user')
        return null
      }
    },

    // Ініціалізація з localStorage
    async initAuth() {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          this.user = JSON.parse(savedUser)
          this.isAuthenticated = true
          // Перевіряємо, чи користувач ще дійсний
          await this.fetchCurrentUser()
        } catch (error) {
          localStorage.removeItem('user')
          this.user = null
          this.isAuthenticated = false
        }
      }
    },
  },
})

