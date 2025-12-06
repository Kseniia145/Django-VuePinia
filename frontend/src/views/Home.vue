<template>
  <div class="home">
    <h1>Ласкаво просимо до блогу!</h1>
    <p>Це головна сторінка блогу на Vue 3 + Pinia + Django REST Framework</p>
    <router-link to="/articles" class="btn-primary">
      Переглянути статті
    </router-link>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.home h1 {
  color: #5a67d8;
  margin-bottom: 20px;
}

.btn-primary {
  display: inline-block;
  padding: 12px 24px;
  background-color: #5a67d8;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  margin-top: 20px;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(90, 103, 216, 0.2);
}

.btn-primary:hover {
  background-color: #4c51bf;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(90, 103, 216, 0.3);
}
</style>

