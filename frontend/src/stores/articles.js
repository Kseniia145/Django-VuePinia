import { defineStore } from 'pinia'
import apiClient from '../api/axios'

export const useArticlesStore = defineStore('articles', {
  state: () => ({
    articles: [],
    currentArticle: null,
    comments: [],
    categories: [],
    tags: [],
    loading: false,
    error: null,
    pagination: {
      count: 0,
      next: null,
      previous: null,
    },
  }),

  getters: {
    publishedArticles: (state) => {
      return state.articles.filter(article => article.is_published)
    },
    
    getArticleById: (state) => {
      return (id) => {
        return state.articles.find(article => article.id === id) || state.currentArticle
      }
    },
  },

  actions: {
    // Отримати список статей
    async fetchArticles(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.get('/articles/', { params })
        this.articles = response.data.results || response.data
        if (response.data.count !== undefined) {
          this.pagination = {
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
          }
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || error.message || 'Помилка завантаження статей'
        console.error('Error fetching articles:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Отримати деталі статті
    async fetchArticle(id) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.get(`/articles/${id}/`)
        this.currentArticle = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || error.message || 'Помилка завантаження статті'
        console.error('Error fetching article:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Отримати коментарі для статті
    async fetchArticleComments(articleId) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.get(`/articles/${articleId}/comments/`)
        this.comments = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || error.message || 'Помилка завантаження коментарів'
        console.error('Error fetching comments:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Додати коментар до статті
    async addComment(articleId, commentData) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.post(`/articles/${articleId}/add_comment/`, commentData)
        // Оновлюємо список коментарів
        await this.fetchArticleComments(articleId)
        return response.data
      } catch (error) {
        this.error = error.response?.data || error.message || 'Помилка додавання коментаря'
        console.error('Error adding comment:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Оновити коментар
    async updateComment(commentId, commentData) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.patch(`/comments/${commentId}/`, commentData)
        return response.data
      } catch (error) {
        this.error = error.response?.data || error.message || 'Помилка оновлення коментаря'
        console.error('Error updating comment:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Видалити коментар
    async deleteComment(commentId) {
      this.loading = true
      this.error = null
      try {
        await apiClient.delete(`/comments/${commentId}/`)
      } catch (error) {
        this.error = error.response?.data || error.message || 'Помилка видалення коментаря'
        console.error('Error deleting comment:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Отримати категорії
    async fetchCategories() {
      try {
        const response = await apiClient.get('/categories/')
        this.categories = response.data.results || response.data
        return response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
        throw error
      }
    },

    // Отримати теги
    async fetchTags() {
      try {
        const response = await apiClient.get('/tags/')
        this.tags = response.data.results || response.data
        return response.data
      } catch (error) {
        console.error('Error fetching tags:', error)
        throw error
      }
    },

    // Очистити поточну статтю
    clearCurrentArticle() {
      this.currentArticle = null
      this.comments = []
    },
  },
})

