<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />
    <div class="w-[98%] max-w-[1400px] mx-auto my-[10px] p-[10px_15px] bg-white shadow-md rounded-lg flex flex-col md:p-[15px]">
      <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-gray-700 text-[1.4rem] font-bold md:text-[1.6rem] leading-tight">Panel de Control</h2>
          <p class="text-[13px] text-gray-500 font-medium">Bienvenido, <span class="text-[#b57e10] font-bold">{{ authStore.user?.nombre }}</span></p>
        </div>

        <div class="flex flex-col items-end leading-none text-gray-800 self-start md:self-center">
          <span class="text-gray-700 text-[1.4rem] font-bold md:text-[1.6rem] leading-tight tabular-nums">{{ currentDateTime.split('|')[1] }}</span>
          <span class="text-[13px] text-gray-500 font-medium uppercase tracking-wider opacity-60">{{ currentDateTime.split('|')[0] }}</span>
        </div>
      </div>

        <!-- Indicador de conexión -->
        <div v-if="!isOnline" class="bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 rounded-lg text-xs font-semibold flex items-center gap-2 mt-[-10px] mb-4 self-start">
          <span>MODO OFFLINE</span>
        </div>

      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Productos"
          :value="stats.totalProductos"
          :icon="icons.box"
          color="gold"
          :to="{ name: 'Productos' }"
          class="hover:scale-[1.02] transition-transform cursor-pointer"
        />
        <StatCard
          title="Categorías"
          :value="stats.totalCategorias"
          :icon="icons.tag"
          color="green"
          :to="{ name: 'Categorias' }"
          class="hover:scale-[1.02] transition-transform cursor-pointer"
        />
        <StatCard
          title="Proveedores"
          :value="stats.totalProveedores"
          :icon="icons.truck"
          color="green"
          :to="{ name: 'Proveedores' }"
          class="hover:scale-[1.02] transition-transform cursor-pointer"
        />
        <StatCard
          title="Tipo de Cambio"
          :value="ultimoPrecioDolar"
          :icon="icons.dollar"
          color="yellow"
          :to="{ name: 'Dolar' }"
          class="hover:scale-[1.02] transition-transform cursor-pointer"
        />
      </div>

      <!-- Sección de Acceso Rápido o Info Extra -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
          <h3 class="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
            Estado del Sistema
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
              <p class="text-[11px] text-gray-500 font-bold uppercase">Base de Datos</p>
              <p class="text-sm font-bold text-green-600 flex items-center gap-1">
                Conectado
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </p>
            </div>
            <div class="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
              <p class="text-[11px] text-gray-500 font-bold uppercase">Sincronización Offline</p>
              <p class="text-sm font-bold text-amber-600">Activa</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-[#b57e10] to-[#975f0c] p-4 rounded-xl text-white shadow-lg flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold mb-1">Acceso Rápido</h3>
            <p class="text-[11px] opacity-90">Gestiona tus productos de forma eficiente.</p>
          </div>
          <router-link 
            to="/productos" 
            class="mt-4 bg-white/20 hover:bg-white/30 p-2 rounded-lg text-center text-xs font-bold transition-colors border border-white/10"
          >
            Ir al Inventario
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import offlineService from '../services/offline'
import NavBar from '../components/NavBar.vue'
import StatCard from '../components/StatCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const icons = {
  box: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#975f0c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-box-icon lucide-box"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  tag: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#975f0c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tag-icon lucide-tag"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>`,
  truck: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#975f0c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck-icon lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
  dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#975f0c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dollar-sign-icon lucide-circle-dollar-sign"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>`
}

const stats = ref({
  totalProductos: 0,
  totalCategorias: 0,
  totalProveedores: 0
})

const ultimoPrecioDolar = ref('N/A')
const isOnline = ref(navigator.onLine)
const currentDateTime = ref('')

let timerInterval = null

const updateClock = () => {
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-VE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  }).replace('.', '')
  
  const timeStr = now.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
  
  currentDateTime.value = `${dateStr} | ${timeStr}`
}

const loadDashboard = async () => {
  try {
    if (isOnline.value) {
      console.log('Cargando dashboard online...')
      const response = await api.get('/dashboard')
      console.log('Respuesta dashboard:', response.data)
      
      if (response.data.success) {
        // Si el servidor devuelve 0 pero tenemos datos locales, preferimos los locales para evitar sustos
        // solo si estamos en desarrollo o sospechamos de sincronización parcial
        stats.value = response.data.data
        
        if (response.data.data.ultimoPrecioDolar) {
          const precioNum = parseFloat(response.data.data.ultimoPrecioDolar.precio)
          ultimoPrecioDolar.value = `Bs. ${precioNum.toFixed(2)}`
          
          const dolarData = {
            id: response.data.data.ultimoPrecioDolar.id || Date.now(),
            precio: precioNum,
            fecha: response.data.data.ultimoPrecioDolar.fecha || new Date().toISOString(),
            hace_cuanto: response.data.data.ultimoPrecioDolar.hace_cuanto
          }
          await offlineService.save('dolar', dolarData)
        }
      }
    } else {
      console.log('Cargando dashboard offline...')
      const offlineStats = await offlineService.getCounts()
      stats.value = offlineStats

      const cachedDolar = await offlineService.getUltimoPrecioDolar()
      if (cachedDolar) {
        ultimoPrecioDolar.value = `Bs. ${parseFloat(cachedDolar.precio).toFixed(2)}`
      }
    }
  } catch (error) {
    console.error('Error al cargar dashboard:', error)
    const offlineStats = await offlineService.getCounts()
    stats.value = offlineStats
    
    const cachedDolar = await offlineService.getUltimoPrecioDolar()
    if (cachedDolar) {
      ultimoPrecioDolar.value = `Bs. ${parseFloat(cachedDolar.precio).toFixed(2)}`
    }
  }
}

const handleOnline = () => {
  isOnline.value = true
  loadDashboard()
  offlineService.syncQueue()
}

const handleOffline = () => {
  isOnline.value = false
}

onMounted(async () => {
  await offlineService.init()
  await loadDashboard()
  updateClock()
  
  timerInterval = setInterval(updateClock, 1000)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>


