<template>
  <div class="article-detail">
    <!-- Завантаження -->
    <div v-if="loading" class="loading">
      Завантаження статті...
    </div>

    <!-- Помилка -->
    <div v-else-if="error" class="error-message">
      {{ error }}
      <router-link to="/articles" class="back-link">Повернутися до списку</router-link>
    </div>

    <!-- Деталі статті -->
    <div v-else-if="article" class="article-content">
      <router-link to="/articles" class="back-link">← Повернутися до списку</router-link>

      <article class="article-main">
        <h1 class="article-title">{{ article.title }}</h1>
        
        <div class="article-meta">
          <div class="meta-item">
            <strong>Автор:</strong> {{ article.author_name }}
          </div>
          <div class="meta-item">
            <strong>Дата публікації:</strong> {{ formatDate(article.publication_date) }}
          </div>
          <div class="meta-item" v-if="article.category">
            <strong>Категорія:</strong> 
            <span class="category-badge">{{ article.category.title }}</span>
          </div>
        </div>

        <div class="article-image" v-if="article.image">
          <img 
            :src="article.image" 
            :alt="article.title"
            @error="handleImageError($event)"
            loading="lazy"
          />
        </div>

        <div class="article-tags" v-if="article.tags && article.tags.length > 0">
          <strong>Теги:</strong>
          <span 
            v-for="tag in article.tags" 
            :key="tag.id" 
            class="tag"
          >
            {{ tag.title }}
          </span>
        </div>

        <div class="article-text" v-html="formatText(article.text)"></div>
      </article>

      <!-- Коментарі -->
      <section class="comments-section">
        <h2>Коментарі ({{ comments.length }})</h2>

        <!-- Форма додавання коментаря -->
        <div class="comment-form">
          <h3>Додати коментар</h3>
          <form @submit.prevent="submitComment">
            <div class="form-group" v-if="!authStore.isAuthenticated">
              <label for="author">Ваше ім'я:</label>
              <input 
                type="text" 
                id="author" 
                v-model="commentForm.author" 
                placeholder="Введіть ваше ім'я"
                required
              />
            </div>
            <div class="form-group" v-else>
              <p class="authenticated-user">Ви коментуєте як: <strong>{{ authStore.userName }}</strong></p>
            </div>
            <div class="form-group">
              <label for="text">Коментар:</label>
              <textarea 
                id="text" 
                v-model="commentForm.text" 
                rows="4" 
                placeholder="Введіть ваш коментар"
                required
              ></textarea>
            </div>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Відправка...' : 'Відправити коментар' }}
            </button>
          </form>
        </div>

        <!-- Список коментарів -->
        <div v-if="comments.length > 0" class="comments-list">
          <div 
            v-for="comment in comments" 
            :key="comment.id" 
            class="comment-item"
          >
            <div class="comment-header">
              <div>
                <strong class="comment-author">{{ comment.author_name }}</strong>
                <span class="comment-date">{{ formatDate(comment.publication_date) }}</span>
              </div>
              <div v-if="canEditComment(comment)" class="comment-actions">
                <button 
                  @click.stop="editComment(comment)" 
                  class="btn-edit"
                  v-if="!editingComment || editingComment.id !== comment.id"
                >
                  Редагувати
                </button>
                <button 
                  @click.stop="deleteComment(comment.id)" 
                  class="btn-delete"
                  v-if="!editingComment || editingComment.id !== comment.id"
                >
                  Видалити
                </button>
              </div>
            </div>
            <div v-if="editingComment && editingComment.id === comment.id" class="comment-edit-form">
              <textarea 
                v-model="editingComment.text" 
                rows="3"
                class="edit-textarea"
              ></textarea>
              <div class="edit-actions">
                <button @click="saveCommentEdit" class="btn-save">Зберегти</button>
                <button @click="cancelCommentEdit" class="btn-cancel">Скасувати</button>
              </div>
            </div>
            <div v-else class="comment-text">{{ comment.text }}</div>
          </div>
        </div>

        <div v-else class="no-comments">
          Поки що немає коментарів. Будьте першим!
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticlesStore } from '../stores/articles'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const articlesStore = useArticlesStore()
const authStore = useAuthStore()

const commentForm = ref({
  author: '',
  text: '',
})

const submitting = ref(false)
const editingComment = ref(null)

const article = computed(() => articlesStore.currentArticle)
const comments = computed(() => articlesStore.comments)
const loading = computed(() => articlesStore.loading)
const error = computed(() => articlesStore.error)

const loadArticle = async () => {
  const articleId = route.params.id
  try {
    await articlesStore.fetchArticle(articleId)
    await articlesStore.fetchArticleComments(articleId)
  } catch (err) {
    console.error('Error loading article:', err)
  }
}

const submitComment = async () => {
  if (!commentForm.value.text.trim()) return

  submitting.value = true
  try {
    const commentData = {
      text: commentForm.value.text,
    }
    // Додаємо author тільки якщо не авторизований
    if (!authStore.isAuthenticated) {
      commentData.author = commentForm.value.author
    }
    
    await articlesStore.addComment(route.params.id, commentData)
    // Очищаємо форму
    commentForm.value = {
      author: '',
      text: '',
    }
  } catch (err) {
    console.error('Error submitting comment:', err)
    alert('Помилка при додаванні коментаря. Спробуйте ще раз.')
  } finally {
    submitting.value = false
  }
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

const formatText = (text) => {
  if (!text) return ''
  // Просте форматування - замінюємо переноси рядків на <br>
  return text.replace(/\n/g, '<br>')
}

const canEditComment = (comment) => {
  // Перевіряємо авторизацію
  if (!authStore.isAuthenticated || !authStore.user) {
    return false
  }
  
  const currentUserId = authStore.userId
  const currentUserName = authStore.userName
  
  // Перевіряємо за user_id (для зареєстрованих користувачів)
  // comment.user_id - це ID користувача, який створив коментар
  if (comment.user_id && currentUserId) {
    // Перетворюємо в числа для порівняння
    if (Number(comment.user_id) === Number(currentUserId)) {
      return true
    }
  }
  
  // Перевіряємо за ім'ям автора (для сумісності)
  // comment.author_name - це обчислюване поле (username або author)
  if (comment.author_name && currentUserName) {
    if (comment.author_name === currentUserName) {
      return true
    }
  }
  
  return false
}

const editComment = (comment) => {
  editingComment.value = { ...comment }
}

const cancelCommentEdit = () => {
  editingComment.value = null
}

const saveCommentEdit = async () => {
  if (!editingComment.value) return
  
  try {
    await articlesStore.updateComment(editingComment.value.id, {
      text: editingComment.value.text,
    })
    editingComment.value = null
    await articlesStore.fetchArticleComments(route.params.id)
  } catch (error) {
    console.error('Error updating comment:', error)
    alert('Помилка при оновленні коментаря')
  }
}

const deleteComment = async (commentId) => {
  if (!confirm('Ви впевнені, що хочете видалити цей коментар?')) return
  
  try {
    await articlesStore.deleteComment(commentId)
    await articlesStore.fetchArticleComments(route.params.id)
  } catch (error) {
    console.error('Error deleting comment:', error)
    alert('Помилка при видаленні коментаря')
  }
}

const handleImageError = (event) => {
  // Якщо зображення не завантажилось, використовуємо placeholder
  event.target.src = 'https://picsum.photos/800/400?random=' + Math.floor(Math.random() * 1000)
}

onMounted(async () => {
  // Переконаємося, що auth ініціалізовано
  if (!authStore.isAuthenticated) {
    await authStore.initAuth()
  }
  // Якщо користувач авторизований, перевіряємо актуальність сесії
  if (authStore.isAuthenticated) {
    await authStore.fetchCurrentUser()
  }
  await loadArticle()
})

onUnmounted(() => {
  articlesStore.clearCurrentArticle()
})
</script>

<style scoped>
.article-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: #5a67d8;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.article-main {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  margin-bottom: 30px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.article-title {
  font-size: 32px;
  color: #333;
  margin-bottom: 20px;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.category-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.article-image {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  margin: 20px 0;
  border-radius: 5px;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-tags {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.article-text {
  margin-top: 30px;
  line-height: 1.8;
  color: #333;
  font-size: 16px;
}

.comments-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.comments-section h2 {
  color: #5a67d8;
  margin-bottom: 20px;
  font-size: 2em;
  font-weight: 700;
}

.comment-form {
  background: rgba(255, 255, 255, 0.6);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 30px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.comment-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
}

.btn-primary {
  padding: 12px 24px;
  background: #5a67d8;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(90, 103, 216, 0.2);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  background: #4c51bf;
  box-shadow: 0 6px 20px rgba(90, 103, 216, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border-left: 4px solid #5a67d8;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.comment-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(90, 103, 216, 0.15);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.comment-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #5a67d8;
  color: white;
}

.btn-edit:hover {
  background: #4c51bf;
}

.btn-delete {
  background: #e53e3e;
  color: white;
}

.btn-delete:hover {
  background: #c53030;
}

.comment-edit-form {
  margin-top: 10px;
}

.edit-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 10px;
}

.edit-actions {
  display: flex;
  gap: 10px;
}

.btn-save, .btn-cancel {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-save {
  background: #5a67d8;
  color: white;
}

.btn-save:hover {
  background: #4c51bf;
}

.btn-cancel {
  background: #999;
  color: white;
}

.btn-cancel:hover {
  background: #777;
}

.authenticated-user {
  color: #5a67d8;
  margin: 0;
  padding: 8px;
  background: rgba(90, 103, 216, 0.1);
  border-radius: 5px;
}

.comment-author {
  color: #5a67d8;
  font-weight: 600;
}

.comment-date {
  color: #666;
  font-size: 12px;
}

.comment-text {
  color: #333;
  line-height: 1.6;
}

.no-comments {
  text-align: center;
  padding: 40px;
  color: #666;
}

.loading, .error-message {
  text-align: center;
  padding: 40px;
}

.error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 20px;
  border-radius: 5px;
}
</style>

