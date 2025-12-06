<template>
  <div class="register-page">
    <div class="register-container">
      <h1>Реєстрація</h1>
      
      <div v-if="error" class="error-message">
        <div v-if="typeof error === 'string'">{{ error }}</div>
        <div v-else>
          <div v-for="(messages, field) in error" :key="field">
            <strong>{{ field }}:</strong> {{ Array.isArray(messages) ? messages[0] : messages }}
          </div>
        </div>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">Ім'я користувача:</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            required
            placeholder="Введіть ім'я користувача"
          />
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="Введіть email"
          />
        </div>

        <div class="form-group">
          <label for="first_name">Ім'я:</label>
          <input
            type="text"
            id="first_name"
            v-model="form.first_name"
            placeholder="Введіть ім'я (необов'язково)"
          />
        </div>

        <div class="form-group">
          <label for="last_name">Прізвище:</label>
          <input
            type="text"
            id="last_name"
            v-model="form.last_name"
            placeholder="Введіть прізвище (необов'язково)"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль:</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="Введіть пароль"
          />
        </div>

        <div class="form-group">
          <label for="password2">Підтвердження пароля:</label>
          <input
            type="password"
            id="password2"
            v-model="form.password2"
            required
            placeholder="Підтвердіть пароль"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Реєстрація...' : 'Зареєструватися' }}
        </button>
      </form>

      <div class="register-footer">
        <p>Вже є обліковий запис? <router-link to="/login">Увійти</router-link></p>
        <router-link to="/" class="back-link">← Повернутися на головну</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password2: '',
})

const loading = computed(() => authStore.loading)
const error = computed(() => authStore.error)

const handleRegister = async () => {
  try {
    await authStore.register(form.value)
    router.push('/articles')
  } catch (err) {
    // Помилка вже оброблена в store
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.register-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

h1 {
  color: #5a67d8;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2em;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #5a67d8;
}

.btn-primary {
  padding: 12px 24px;
  background: #5a67d8;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(90, 103, 216, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: #4c51bf;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(90, 103, 216, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-footer {
  margin-top: 20px;
  text-align: center;
}

.register-footer p {
  margin-bottom: 10px;
  color: #666;
}

.register-footer a {
  color: #5a67d8;
  text-decoration: none;
  font-weight: 600;
}

.register-footer a:hover {
  text-decoration: underline;
}

.back-link {
  display: block;
  margin-top: 15px;
  color: #5a67d8;
  text-decoration: none;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #c33;
  font-size: 14px;
}
</style>

