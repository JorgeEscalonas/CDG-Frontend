<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />
    <div class="w-[98%] max-w-[1400px] mx-auto my-[10px] p-[10px_15px] bg-white shadow-md rounded-lg flex flex-col md:p-[15px]">
      <h2 class="text-center mt-[5px] mb-[15px] text-gray-700 text-[1.3rem] font-semibold md:text-[1.2rem]">
        Gestión del Tipo de Cambio (Dólar)
      </h2>

      <!-- Indicador de conexión -->
      <div v-if="!isOnline" class="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2">
        <span>Modo Offline: Se grabará localmente y se sincronizará al recuperar conexión.</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Panel de Actualización (Col 1-2) -->
        <div class="lg:col-span-2 flex flex-col gap-5">
          <!-- Último precio (Tarjeta Premium) -->
          <div class="bg-gradient-to-br from-[#b57e10] to-[#975f0c] p-5 rounded-2xl text-white shadow-lg border border-white/10 relative overflow-hidden group">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
            <div class="relative z-10">
              <p class="text-[11px] uppercase tracking-[1px] font-black opacity-80 mb-2">Precio Actual BCV / Oficial</p>
              <div v-if="ultimoPrecio" class="flex flex-col">
                <span class="text-3xl font-black tracking-tighter">
                  Bs. {{ parseFloat(ultimoPrecio.precio).toFixed(2) }}
                </span>
                <p class="text-[10px] mt-2 font-medium opacity-70 flex items-center gap-1.5" :title="new Date(ultimoPrecio.fecha).toLocaleString('es-VE')">
                  <span class="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]"></span>
                  Actualizado: {{ ultimoPrecio.hace_cuanto || new Date(ultimoPrecio.fecha).toLocaleString('es-VE') }}
                </p>
              </div>
              <div v-else class="text-sm font-bold opacity-60">Sincronizando tasa...</div>
            </div>
          </div>

          <!-- Formulario de Actualización -->
          <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
            <h3 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-[#b57e10] rounded-full"></span>
              Actualizar Tasa
            </h3>
            
            <form @submit.prevent="guardarPrecio" class="space-y-5">
              <div class="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <label class="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer text-[12px] font-bold transition-all text-center" 
                       :class="tipoTasa === 'manual' ? 'bg-white text-[#b57e10] shadow-sm border border-[#b57e10]/20' : 'text-gray-400 hover:text-gray-600'">
                  <input type="radio" v-model="tipoTasa" value="manual" class="hidden" />
                  Manual
                </label>
                <label class="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer text-[12px] font-bold transition-all text-center"
                       :class="tipoTasa === 'api' ? 'bg-white text-[#b57e10] shadow-sm border border-[#b57e10]/20' : 'text-gray-400 hover:text-gray-600'">
                  <input type="radio" v-model="tipoTasa" value="api" class="hidden" />
                  API BCV
                </label>
              </div>

              <div class="space-y-1.5">
                <label for="precio" class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nuevo Valor (Bs.)</label>
                <div class="relative group">
                  <input
                    id="precio"
                    v-model.number="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-full p-[12px_15px] rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#b57e10]/30 focus:border-[#b57e10] transition-all text-base font-black text-gray-800 disabled:bg-gray-50 disabled:text-gray-300 shadow-inner"
                    :disabled="tipoTasa === 'api' || loading"
                    required
                  />
                  <div class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-black tracking-widest uppercase">VEF / USD</div>
                </div>
              </div>

              <button
                v-if="authStore.isAdmin"
                type="submit"
                class="w-full p-[12px] font-black text-white tracking-[0.5px] rounded-[15px] border border-white/10 cursor-pointer transition-all duration-300 text-[13px] outline-none bg-gradient-to-br from-[#b57e10] to-[#975f0c] shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] hover:translate-y-[-2px] hover:shadow-[0_6px_15px_rgba(0,0,0,0.2)] disabled:opacity-50"
                :disabled="loading"
              >
                {{ loading ? 'Actualizando...' : 'confirmar cambio' }}
              </button>
              <p v-else class="text-xs text-center text-gray-400 italic py-2">
                Solo administradores pueden cambiar la tasa del dólar.
              </p>
            </form>
          </div>
        </div>

        <!-- Historial (Col 3-5) -->
        <div class="lg:col-span-3 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[450px]">
          <div class="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center px-5">
            <h3 class="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-[#b57e10] rounded-full"></span>
              Historial de Variación
            </h3>
            <button 
              @click="generarReporte" 
              :disabled="generandoReporte"
              class="inline-block p-[4px_12px] font-bold text-white tracking-[0.3px] rounded-[25px] border border-white/10 cursor-pointer transition-all duration-300 text-[10.5px] outline-none bg-gradient-to-br from-[#b57e10] to-[#975f0c] shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:scale-[1.03] disabled:opacity-50 uppercase"
            >
              {{ generandoReporte ? 'Cargando...' : 'Generar Reporte' }}
            </button>
          </div>

          <div class="flex-1 overflow-x-auto">
            <table class="w-full border-collapse text-[12.5px]">
              <thead class="sticky top-0 z-10">
                <tr>
                  <th class="p-[8px_15px] border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm text-gray-800 font-bold text-left uppercase tracking-tighter">Precio (Bolívares)</th>
                  <th class="p-[8px_15px] border-b border-gray-200 bg-gray-50/80 backdrop-blur-sm text-gray-800 font-bold text-right uppercase tracking-tighter">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="h in historialPaginado" :key="h.id" class="hover:bg-amber-50/30 transition-colors group">
                  <td class="p-[8px_15px] font-bold text-[#b57e10] transition-colors">
                    <span class="text-[10px] text-gray-400 font-medium mr-1">Bs.</span>
                    {{ parseFloat(h.precio).toFixed(2) }}
                  </td>
                  <td class="p-[8px_15px] text-right text-gray-600 font-medium tabular-nums text-[11px]">
                    {{ h.hace_cuanto || new Date(h.fecha).toLocaleString('es-VE') }}
                  </td>
                </tr>
                <tr v-if="historialPaginado.length === 0">
                  <td colspan="2" class="text-center p-12 text-gray-400 italic font-medium">No se registran cambios previos</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación Historial -->
          <div v-if="historial.length > 0" class="p-[8px_15px] bg-gray-50/50 border-t border-gray-100 flex justify-center items-center gap-[15px]">
            <button 
              @click="paginaActual--" 
              :disabled="paginaActual === 1"
              class="p-[4px_12px] bg-white border border-gray-200 rounded-[8px] text-[11px] font-black text-gray-700 cursor-pointer transition-all duration-200 disabled:opacity-40 hover:enabled:bg-gray-100 shadow-sm uppercase tracking-tighter"
            >
              Anterior
            </button>
            <span class="text-[12px] text-gray-500 font-black tabular-nums">
              {{ paginaActual }} / {{ totalPages }}
            </span>
            <button 
              @click="paginaActual++" 
              :disabled="paginaActual === totalPages"
              class="p-[4px_12px] bg-white border border-gray-200 rounded-[8px] text-[11px] font-black text-gray-700 cursor-pointer transition-all duration-200 disabled:opacity-40 hover:enabled:bg-gray-100 shadow-sm uppercase tracking-tighter"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import offlineService from '../services/offline'
import NavBar from '../components/NavBar.vue'

const authStore = useAuthStore()
const ultimoPrecio = ref(null)
const historial = ref([])
const precio = ref('')
const tipoTasa = ref('manual')
const loading = ref(false)
const generandoReporte = ref(false)
const isOnline = ref(navigator.onLine)

// Paginación
const paginaActual = ref(1)
const itemsPorPagina = 10

const totalPages = computed(() => Math.ceil(historial.value.length / itemsPorPagina))

const historialPaginado = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  return historial.value.slice(inicio, fin)
})

const cargarDatos = async () => {
  try {
    if (isOnline.value) {
      const [ultimoRes, historialRes] = await Promise.all([
        api.get('/dolar/ultimo'),
        api.get('/dolar/historial')
      ])

      if (ultimoRes.data.success && ultimoRes.data.data) {
        ultimoPrecio.value = ultimoRes.data.data
        precio.value = ultimoPrecio.value.precio
        const dolarData = {
          id: ultimoPrecio.value.id || Date.now(),
          precio: ultimoPrecio.value.precio,
          fecha: ultimoPrecio.value.fecha || new Date().toISOString(),
          hace_cuanto: ultimoPrecio.value.hace_cuanto
        }
        await offlineService.save('dolar', dolarData)
      }

      if (historialRes.data.success) {
        historial.value = historialRes.data.data
      }
    } else {
      const cached = await offlineService.getUltimoPrecioDolar()
      if (cached) {
        ultimoPrecio.value = cached
        precio.value = cached.precio
      }
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    const cached = await offlineService.getUltimoPrecioDolar()
    if (cached) {
      ultimoPrecio.value = cached
      precio.value = cached.precio
    }
  }
}

watch(tipoTasa, async (newValue) => {
  if (newValue === 'api' && isOnline.value) {
    try {
      loading.value = true
      const response = await api.get('/dolar/api')
      if (response.data.success) {
        precio.value = response.data.data.precio
      }
    } catch (error) {
      console.error('Error al obtener tasa externa:', error)
      const mensaje = error.response?.data?.message || error.message || 'Error de conexión'
      alert('Error al obtener tasa desde la API: ' + mensaje)
      tipoTasa.value = 'manual'
    } finally {
      loading.value = false
    }
  }
})

const guardarPrecio = async () => {
  if (!precio.value) return

  loading.value = true

  try {
    if (isOnline.value) {
      await api.post('/dolar', { precio: precio.value })
      await cargarDatos()
    } else {
      await offlineService.addToSyncQueue({
        type: 'dolar',
        method: 'POST',
        url: '/dolar',
        data: { precio: precio.value }
      })
      const nuevoPrecio = {
        id: Date.now(),
        precio: precio.value,
        fecha: new Date().toISOString(),
        hace_cuanto: 'Recién actualizado'
      }
      await offlineService.save('dolar', nuevoPrecio)
      ultimoPrecio.value = nuevoPrecio
      alert('Precio guardado localmente. Se sincronizará cuando se restaure la conexión.')
    }
  } catch (error) {
    console.error('Error al guardar precio:', error)
    const mensaje = error.response?.data?.message || error.message || 'Error desconocido'
    alert('Error al guardar precio: ' + mensaje)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await offlineService.init()
  await cargarDatos()

  window.addEventListener('online', () => {
    isOnline.value = true
    cargarDatos()
    offlineService.syncQueue()
  })
  window.addEventListener('offline', () => {
    isOnline.value = false
  })
})

const generarReporte = async () => {
  generandoReporte.value = true
  try {
    const response = await api.get('/reportes/precios-dolar', {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'reporte_precios_dolar.pdf')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al generar reporte:', error)
    alert('Error al generar el reporte')
  } finally {
    generandoReporte.value = false
  }
}
</script>


