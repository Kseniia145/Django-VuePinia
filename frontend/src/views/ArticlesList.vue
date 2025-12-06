<template>
  <div class="articles-list">
    <h1>Список статей</h1>

    <!-- Фільтри -->
    <div class="filters" v-if="categories.length > 0">
      <select v-model="selectedCategory" @change="loadArticles" class="filter-select">
        <option value="">Всі категорії</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.title }}
        </option>
      </select>
      <label class="filter-checkbox">
        <input type="checkbox" v-model="publishedOnly" @change="loadArticles" />
        Тільки опубліковані
      </label>
    </div>

    <!-- Помилка -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Завантаження -->
    <div v-if="loading" class="loading">
      Завантаження статей...
    </div>

    <!-- Список статей -->
    <div v-else-if="articles.length > 0" class="articles-grid">
      <article 
        v-for="article in articles" 
        :key="article.id" 
        class="article-card"
        @click="goToArticle(article.id)"
      >
        <div class="article-image" v-if="article.image">
          <img 
            :src="article.image" 
            :alt="article.title"
            @error="handleImageError($event)"
            loading="lazy"
          />
        </div>
        <div class="article-content">
          <h2 class="article-title">{{ article.title }}</h2>
          <div class="article-meta">
            <span class="article-author">{{ article.author_name }}</span>
            <span class="article-date">{{ formatDate(article.publication_date) }}</span>
          </div>
          <div class="article-category" v-if="article.category">
            <span class="category-badge">{{ article.category.title }}</span>
          </div>
          <div class="article-tags" v-if="article.tags && article.tags.length > 0">
            <span 
              v-for="tag in article.tags" 
              :key="tag.id" 
              class="tag"
            >
              {{ tag.title }}
            </span>
          </div>
        </div>
      </article>
    </div>

    <!-- Немає статей -->
    <div v-else class="no-articles">
      Статті не знайдено
    </div>

    <!-- Пагінація -->
    <div v-if="pagination.count > 0" class="pagination">
      <button 
        v-if="pagination.previous" 
        @click="loadPage(pagination.previous)"
        class="btn-secondary"
      >
        Попередня
      </button>
      <span class="page-info">
        Сторінка {{ currentPage }} з {{ totalPages }}
      </span>
      <button 
        v-if="pagination.next" 
        @click="loadPage(pagination.next)"
        class="btn-secondary"
      >
        Наступна
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useArticlesStore } from '../stores/articles'

const router = useRouter()
const articlesStore = useArticlesStore()

const selectedCategory = ref('')
const publishedOnly = ref(true)

const articles = computed(() => articlesStore.articles)
const categories = computed(() => articlesStore.categories)
const loading = computed(() => articlesStore.loading)
const error = computed(() => articlesStore.error)
const pagination = computed(() => articlesStore.pagination)

const currentPage = computed(() => {
  if (!pagination.value.next && !pagination.value.previous) return 1
  // Простий розрахунок (можна покращити)
  return 1
})

const totalPages = computed(() => {
  const pageSize = 10
  return Math.ceil(pagination.value.count / pageSize)
})

const loadArticles = async () => {
  const params = {}
  if (selectedCategory.value) {
    params.category = selectedCategory.value
  }
  if (publishedOnly.value) {
    params.published = 'true'
  }
  await articlesStore.fetchArticles(params)
}

const loadPage = async (url) => {
  // Витягуємо параметри з URL
  const urlObj = new URL(url)
  const params = Object.fromEntries(urlObj.searchParams)
  await articlesStore.fetchArticles(params)
}

const goToArticle = (id) => {
  router.push(`/articles/${id}`)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleImageError = (event) => {
  // Якщо зображення не завантажилось, використовуємо placeholder
  event.target.src = 'https://picsum.photos/800/400?random=' + Math.floor(Math.random() * 1000)
}

onMounted(async () => {
  await articlesStore.fetchCategories()
  await loadArticles()
})
</script>

<style scoped>
.articles-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

h1 {
  color: #5a67d8;
  margin-bottom: 30px;
  font-size: 2.5em;
  font-weight: 700;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 15px;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.article-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.article-card:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 8px 25px rgba(90, 103, 216, 0.15);
  border-color: rgba(90, 103, 216, 0.3);
}

.article-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-content {
  padding: 15px;
}

.article-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #333;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.article-category {
  margin-bottom: 10px;
}

.category-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #5a67d8;
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(90, 103, 216, 0.2);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.tag {
  display: inline-block;
  padding: 2px 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  font-size: 11px;
  color: #666;
}

.loading, .error-message, .no-articles {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.btn-secondary {
  padding: 12px 24px;
  background: #5a67d8;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(90, 103, 216, 0.2);
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background: #4c51bf;
  box-shadow: 0 6px 20px rgba(90, 103, 216, 0.3);
}

.page-info {
  color: #666;
}
</style>

