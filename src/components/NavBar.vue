<template>
  <div class="h-[60px] md:h-[70px] lg:h-[80px]"> <!-- Espaciador para el header fixed -->
    <header class="fixed top-0 left-0 right-0 z-[1000] bg-white shadow-[0_2px_5px_rgba(0,0,0,0.1)] p-[5px_20px] flex justify-between items-center transition-all duration-300">
      <!-- Logo -->
      <div class="flex-shrink-0">
        <router-link to="/">
          <img 
            src="/img/logo.png" 
            alt="logo de La Casa De Los Granos" 
            class="w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] h-auto max-w-full transition-all duration-300"
          >
        </router-link>
      </div>

      <!-- Botón hamburguesa para móviles -->
      <button 
        @click="isMenuOpen = !isMenuOpen"
        class="flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-[5px] z-[1001] md:hidden outline-none"
        aria-label="Toggle menu"
      >
        <span :class="['w-[25px] h-[3px] bg-[#b57e10] rounded-[3px] transition-all duration-300', isMenuOpen ? 'rotate-45 translate-y-[8px]' : '']"></span>
        <span :class="['w-[25px] h-[3px] bg-[#b57e10] rounded-[3px] transition-all duration-300', isMenuOpen ? 'opacity-0' : '']"></span>
        <span :class="['w-[25px] h-[3px] bg-[#b57e10] rounded-[3px] transition-all duration-300', isMenuOpen ? '-rotate-45 -translate-y-[8px]' : '']"></span>
      </button>

      <!-- Menú de navegación -->
      <nav 
        :class="[
          'md:flex items-center transition-all duration-300 ml-auto',
          isMenuOpen ? 'max-h-[500px] mt-[10px] w-full block order-3' : 'max-h-0 overflow-hidden md:max-h-none md:overflow-visible'
        ]"
      >
        <ul 
          :class="[
            'list-none flex m-0 p-0 gap-[10px]',
            isMenuOpen ? 'flex-col w-full bg-white shadow-[0_4px_6px_rgba(0,0,0,0.1)] rounded-[10px] p-[10px_0]' : ''
          ]"
        >
          <li v-for="item in menuItems" :key="item.name" class="w-full md:w-auto">
            <router-link
              :to="item.to"
              @click="isMenuOpen = false"
              class="nav-button"
              :active-class="'nav-button-active'"
              exact-active-class="nav-button-active"
            >
              {{ item.label }}
            </router-link>
          </li>
          <!-- Mobile Logout (inside menu) -->
          <li class="w-full md:hidden border-t border-gray-100 pt-2">
            <div class="flex items-center justify-between px-5 mb-2">
              <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Usuario</span>
              <span class="text-[13px] font-bold text-[#b57e10]">{{ authStore.user?.nombre }}</span>
            </div>
            <button
              @click="handleLogout"
              class="nav-button w-full text-left text-red-600 hover:bg-red-50"
            >
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>

      <!-- Desktop User Info & Logout Dropdown -->
      <div class="hidden md:flex items-center ml-4 border-l border-gray-100 pl-4 relative">
        <button 
          @click="isUserMenuOpen = !isUserMenuOpen"
          v-click-outside="() => isUserMenuOpen = false"
          class="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition-all outline-none"
        >
          <div class="flex flex-col text-right">
            <p class="text-[9px] text-gray-400 font-bold uppercase tracking-tighter leading-none mb-0.5">Usuario</p>
            <p class="text-[13px] font-bold text-[#b57e10] leading-tight flex items-center gap-1">
              {{ authStore.user?.nombre }}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 transition-transform duration-300" :class="isUserMenuOpen ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </p>
          </div>
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#b57e10] to-[#975f0c] shadow-md flex items-center justify-center text-white ring-2 ring-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </button>

        <!-- Dropdown Menu -->
        <div 
          v-if="isUserMenuOpen"
          class="absolute right-0 top-[110%] w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[1100] transform transition-all animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div class="px-4 py-2 border-b border-gray-50 md:hidden lg:block">
            <p class="text-[10px] text-gray-400 font-bold uppercase">Sesión activa</p>
            <p class="text-xs font-semibold text-gray-700 truncate">{{ authStore.user?.nombre }}</p>
          </div>
          <button
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

// Directiva simple para cerrar al hacer clic fuera
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

const menuItems = [
  { name: 'productos', label: 'Productos', to: '/productos' },
  { name: 'categorias', label: 'Categorías', to: '/categorias' },
  { name: 'proveedores', label: 'Proveedores', to: '/proveedores' },
  { name: 'dolar', label: 'Cambio Dólar', to: '/dolar' },
]

const handleLogout = async () => {
  if (confirm('¿Deseas cerrar la sesión?')) {
    isUserMenuOpen.value = false
    isMenuOpen.value = false
    await authStore.logout()
    router.push({ name: 'Login' })
  }
}
</script>

<style scoped>
.nav-button {
  display: block;
  padding: 10px 20px;
  background-color: transparent;
  color: #b57e10;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  font-size: 14px;
  text-decoration: none;
}

.nav-button:hover {
  background: linear-gradient(135deg, #c68e17 0%, #a86b0e 100%);
  color: #fff;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
  z-index: 2;
}

.nav-button-active {
  border-radius: 25px;
  background: linear-gradient(135deg, #c68e17 0%, #a86b0e 100%);
  color: #fff;
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 700;
}

@media (max-width: 1024px) {
  .nav-button {
    padding: 8px 15px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .nav-button {
    width: 100%;
    text-align: left;
    padding: 12px 20px;
    border-radius: 0;
  }
  
  .nav-button:hover {
    transform: none;
    border-radius: 0;
    scale: 1;
  }
  
  .nav-button-active {
    border-radius: 0;
  }
}

@media (max-width: 480px) {
  .nav-button {
    font-size: 12px;
    padding: 10px 15px;
  }
}
</style>


