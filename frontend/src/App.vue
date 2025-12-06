<template>
  <div id="app">
    <header>
      <h1>Blog Application</h1>
      <nav>
        <router-link to="/">Головна</router-link>
        <router-link to="/articles">Статті</router-link>
        <div class="auth-links" v-if="!authStore.isAuthenticated">
          <router-link to="/login">Вхід</router-link>
          <router-link to="/register">Реєстрація</router-link>
        </div>
        <div class="user-menu" v-else>
          <span class="username">Привіт, {{ authStore.userName }}!</span>
          <button @click="handleLogout" class="btn-logout">Вихід</button>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 25%, #e1f5fe 50%, #f1f8e9 75%, #fff3e0 100%);
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
  min-height: 100vh;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  position: relative;
}

header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.1);
  color: #2c3e50;
  padding: 20px 40px;
  margin-bottom: 30px;
  border-radius: 0 0 20px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

header h1 {
  margin: 0;
  color: #5a67d8;
  font-size: 2em;
  font-weight: 700;
}

nav {
  margin-top: 15px;
  display: flex;
  gap: 20px;
}

nav a {
  color: #5a67d8;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
}

nav a:hover {
  background: rgba(90, 103, 216, 0.1);
  transform: translateY(-2px);
}

nav a.router-link-active {
  background: #5a67d8;
  color: white;
}

.auth-links {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
}

.username {
  color: #5a67d8;
  font-weight: 600;
}

.btn-logout {
  padding: 8px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: #c53030;
  transform: translateY(-2px);
}

main {
  padding: 20px 40px;
  max-width: 1400px;
  margin: 0 auto;
}
</style>

