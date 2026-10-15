import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/productos',
    name: 'productos',
    component: () => import('@/views/ProductosView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/categorias',
    name: 'categorias',
    component: () => import('@/views/Categorias.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/proveedores',
    name: 'proveedores',
    component: () => import('@/views/Proveedores.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dolar',
    name: 'dolar',
    component: () => import('@/views/DolarView.vue'),
    meta: { requiresAuth: true },
  },
  // Vistas exclusivas de administración
  {
    path: '/usuarios',
    name: 'usuarios',
    component: () => import('@/views/UsuariosView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Si hay token pero no se ha cargado el usuario, consultar /me
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch {
      authStore.logout();
      return next({ name: 'login' });
    }
  }

  const isAuthenticated = authStore.isAuthenticated;
  const isAdmin = authStore.isAdmin;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next({ name: 'dashboard' });
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'dashboard' });
  }

  next();
});

export default router;
