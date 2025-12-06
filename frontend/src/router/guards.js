import { useAuthStore } from '../stores/auth'

export const requireAuth = (to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

export const requireGuest = (to, from, next) => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated) {
    next({ name: 'Home' })
  } else {
    next()
  }
}

