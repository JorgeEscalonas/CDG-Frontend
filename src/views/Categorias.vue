<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />
    <div class="w-[98%] max-w-[1400px] mx-auto my-[10px] p-[10px_15px] bg-white shadow-md rounded-lg flex flex-col md:p-[15px]">
      <h2 class="text-center mt-[5px] mb-[10px] text-gray-700 text-[1.3rem] font-semibold md:text-[1.2rem]">
        Listado de Categorías
      </h2>

      <!-- Filtros y Búsqueda -->
      <div class="mb-[10px] flex items-center gap-[15px] text-[13px]">
        <div class="flex items-center gap-[8px] flex-1">
          <label for="buscar" class="font-medium text-gray-600 whitespace-nowrap">Buscar:</label>
          <input 
            type="text" 
            id="buscar" 
            v-model="queryBusqueda" 
            placeholder="Nombre de la categoría..."
            class="p-[4px_12px] rounded-[5px] border border-gray-300 text-[12.5px] bg-white outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
        </div>
      </div>

      <!-- Tabla de categorías -->
      <div class="w-full overflow-x-auto scrolling-touch mb-[10px]">
        <table class="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <th class="w-[60px] whitespace-nowrap text-center p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">ID</th>
              <th class="p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">Nombre</th>
              <th class="p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle text-center">Productos</th>
              <th class="w-[150px] whitespace-nowrap text-center p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">Opciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categoriasPaginadas" :key="cat.id" class="hover:bg-gray-50 transition-colors">
              <td class="w-[60px] whitespace-nowrap text-center p-[6px_8px] border border-gray-200 bg-white align-middle">{{ cat.id }}</td>
              <td class="p-[6px_8px] border border-gray-200 bg-white align-middle font-medium">{{ cat.nombre }}</td>
              <td class="p-[6px_8px] border border-gray-200 bg-white align-middle text-center">{{ cat.productos_count || 0 }}</td>
              <td class="w-[150px] whitespace-nowrap text-center p-[6px_8px] border border-gray-200 bg-white align-middle">
                <button 
                  v-if="authStore.isAdmin"
                  @click="eliminarCategoria(cat.id)" 
                  class="inline-block p-[4px_10px] font-semibold text-white tracking-[0.5px] rounded-[25px] border border-white/10 cursor-pointer transition-all duration-300 text-[11px] outline-none bg-red-600 shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:scale-[1.03] m-[0_2px]"
                >
                  Eliminar
                </button>
                <button 
                  @click="editarCategoria(cat)" 
                  class="inline-block p-[4px_10px] font-semibold text-white tracking-[0.5px] rounded-[25px] border border-white/10 cursor-pointer transition-all duration-300 text-[11px] outline-none bg-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:scale-[1.03] m-[0_2px]"
                >
                  Editar
                </button>
              </td>
            </tr>
            <tr v-if="categoriasPaginadas.length === 0">
              <td colspan="4" class="text-center p-[20px] text-gray-500 italic bg-white border border-gray-200">
                No se encontraron categorías
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="flex justify-center items-center gap-[15px] mb-[15px] p-[6px] bg-gray-50 rounded-[12px] md:gap-[10px]" v-if="categoriasFiltradas.length > 0">
        <button 
          @click="paginaActual--" 
          :disabled="paginaActual === 1"
          class="p-[5px_12px] bg-white border border-gray-300 rounded-[8px] text-gray-700 font-semibold cursor-pointer transition-all duration-200 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-100 hover:enabled:border-gray-400 md:p-[6px_12px] md:text-[13px]"
        >
          Anterior
        </button>
        <span class="text-[14px] text-gray-500 font-medium">
          Página {{ paginaActual }} de {{ totalPages }}
        </span>
        <button 
          @click="paginaActual++" 
          :disabled="paginaActual === totalPages"
          class="p-[5px_12px] bg-white border border-gray-300 rounded-[8px] text-gray-700 font-semibold cursor-pointer transition-all duration-200 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-100 hover:enabled:border-gray-400 md:p-[6px_12px] md:text-[13px]"
        >
          Siguiente
        </button>
      </div>

      <!-- Botones de Acción -->
      <div class="flex items-center gap-[10px] mt-[5px]">
        <button 
          @click="mostrarModal = true" 
          class="inline-block p-[4px_10px] font-semibold text-white tracking-[0.3px] rounded-[25px] border border-white/10 cursor-pointer transition-all duration-300 text-[11px] outline-none bg-gradient-to-br from-[#b57e10] to-[#975f0c] shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:translate-y-[-1px]"
        >
          Nueva Categoría
        </button>
        <button 
          @click="generarReporte" 
          :disabled="generandoReporte"
          class="inline-block p-[4px_10px] font-semibold text-white tracking-[0.3px] rounded-[25px] border border-white/10 cursor-pointer transition-all duration-300 text-[11px] outline-none bg-gradient-to-br from-[#b57e10] to-[#975f0c] shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:translate-y-[-1px] disabled:opacity-50"
        >
          {{ generandoReporte ? 'Generando...' : 'Generar Reporte' }}
        </button>
      </div>

      <!-- Modal -->
      <div
        v-if="mostrarModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="cerrarModal"
      >
        <div class="w-full max-w-md">
          <DynamicForm
            :fields="fieldsConfig"
            :initial-values="formCategoria"
            :title="categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'"
            :submit-label="categoriaEditando ? 'Actualizar' : 'Guardar'"
            :loading="loadingGuardar"
            @save="guardarCategoria"
            @cancel="cerrarModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import offlineService from '../services/offline'
import NavBar from '../components/NavBar.vue'
import DynamicForm from '../components/DynamicForm.vue'

const authStore = useAuthStore()
const categorias = ref([])
const mostrarModal = ref(false)
const categoriaEditando = ref(null)
const generandoReporte = ref(false)
const loadingGuardar = ref(false)
const queryBusqueda = ref('')

const fieldsConfig = [
  {
    name: 'nombre',
    label: 'Nombre de la Categoría',
    type: 'text',
    required: true,
    placeholder: 'Ej. Granos, Cereales, Harinas...'
  }
]

// Paginación
const paginaActual = ref(1)
const itemsPorPagina = 10

const formCategoria = ref({
  nombre: ''
})

const categoriasFiltradas = computed(() => {
  if (!queryBusqueda.value) return categorias.value
  const query = queryBusqueda.value.toLowerCase()
  return categorias.value.filter(c => c.nombre.toLowerCase().includes(query))
})

const totalPages = computed(() => Math.ceil(categoriasFiltradas.value.length / itemsPorPagina))

const categoriasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  const fin = inicio + itemsPorPagina
  return categoriasFiltradas.value.slice(inicio, fin)
})

// Resetear página al buscar
watch(queryBusqueda, () => {
  paginaActual.value = 1
})

const cargarCategorias = async () => {
  try {
    const response = await api.get('/categorias')
    if (response.data.success) {
      categorias.value = response.data.data
      await offlineService.save('categorias', response.data.data)
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    const cached = await offlineService.get('categorias')
    if (cached) categorias.value = cached
  }
}

const editarCategoria = (categoria) => {
  categoriaEditando.value = categoria
  formCategoria.value = {
    nombre: categoria.nombre
  }
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  categoriaEditando.value = null
  formCategoria.value = {
    nombre: ''
  }
}

const guardarCategoria = async (formData) => {
  loadingGuardar.value = true
  try {
    if (categoriaEditando.value) {
      await api.put(`/categorias/${categoriaEditando.value.id}`, formData)
    } else {
      await api.post('/categorias', formData)
    }
    await cargarCategorias()
    cerrarModal()
  } catch (error) {
    alert('Error al guardar categoría')
  } finally {
    loadingGuardar.value = false
  }
}

const eliminarCategoria = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta categoría?')) return

  try {
    await api.delete(`/categorias/${id}`)
    await cargarCategorias()
  } catch (error) {
    alert('Error al eliminar categoría')
  }
}

const generarReporte = async () => {
  generandoReporte.value = true
  try {
    const response = await api.get('/reportes/categorias', {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'reporte_categorias.pdf')
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

onMounted(() => {
  cargarCategorias()
})
</script>


