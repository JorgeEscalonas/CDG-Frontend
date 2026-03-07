import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/productos',
      name: 'Productos',
      component: () => import('../views/Productos.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/categorias',
      name: 'Categorias',
      component: () => import('../views/Categorias.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/proveedores',
      name: 'Proveedores',
      component: () => import('../views/Proveedores.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dolar',
      name: 'Dolar',
      component: () => import('../views/Dolar.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router

