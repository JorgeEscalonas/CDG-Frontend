import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  function setUser(userData) {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  async function login(credentials) {
    try {
      const response = await api.post('/login', credentials)
      if (response.data.success) {
        setToken(response.data.data.token)
        setUser(response.data.data.user)
        return { success: true }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      }
    }
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const response = await api.get('/me')
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error)
      if (error.response?.status === 401) {
        logout()
      }
    }
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    setUser,
    login,
    logout,
    fetchUser
  }
})

