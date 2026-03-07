<template>
  <div id="app" class="min-h-screen">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Verificar si hay token guardado
  const token = localStorage.getItem('token')
  if (token) {
    authStore.setToken(token)
    await authStore.fetchUser()
  }
})
</script>

