<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />
    <div class="w-[98%] max-w-[1400px] mx-auto my-[10px] p-[10px_15px] bg-white shadow-md rounded-lg flex flex-col md:p-[15px]">
      <h2 class="text-center mt-[5px] mb-[10px] text-gray-700 text-[1.3rem] font-semibold md:text-[1.2rem]">
        Listado de Productos
      </h2>

      <!-- Formulario para filtrar por categoría y búsqueda -->
      <div class="mb-[10px] flex items-center gap-[15px] text-[13px]">
        <div class="flex items-center gap-[8px]">
          <label for="categoria" class="font-medium text-gray-600 whitespace-nowrap">Categoría:</label>
          <select 
            v-model="filtroCategoria" 
            id="categoria" 
            @change="resetAndLoad"
            class="p-[4px_8px] rounded-[5px] border border-gray-300 text-[12.5px] bg-white outline-none focus:ring-2 focus:ring-blue-500 w-[150px]"
          >
            <option value="">Todas las categorías</option>
            <option
              v-for="cat in categorias"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.nombre }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-[8px] flex-1">
          <label for="buscar" class="font-medium text-gray-600 whitespace-nowrap">Buscar:</label>
          <input 
            type="text" 
            id="buscar" 
            v-model="queryBusqueda" 
            placeholder="Nombre del producto..."
            class="p-[4px_12px] rounded-[5px] border border-gray-300 text-[12.5px] bg-white outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
        </div>
      </div>

      <!-- Tabla de productos -->
      <div class="w-full overflow-x-auto scrolling-touch mb-[10px]">
        <table id="productosTable" class="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <th class="w-[50px] whitespace-nowrap text-center p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">ID</th>
              <th class="p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">Nombre</th>
              <th class="p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">Proveedor</th>
              <th class="p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">Categoría</th>
              <th class="p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">Costo</th>
              <th class="p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">PVP</th>
              <th class="p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">Bs.</th>
              <th class="w-[130px] whitespace-nowrap text-center p-[6px_8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold align-middle">Opciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productosPaginados" :key="producto.id" class="hover:bg-gray-50 transition-colors">
              <td class="w-[50px] whitespace-nowrap text-center p-[6px_8px] border border-gray-200 bg-white align-middle">{{ producto.id }}</td>
              <td class="p-[6px_8px] border border-gray-200 bg-white align-middle">{{ producto.nombre }}</td>
              <td class="p-[6px_8px] border border-gray-200 bg-white align-middle">{{ producto.proveedor?.nombre || 'N/A' }}</td>
              <td class="p-[6px_8px] border border-gray-200 bg-white align-middle">{{ producto.categoria?.nombre || 'N/A' }}</td>
              <td class="p-[6px_8px] border border-gray-200 bg-white align-middle">${{ producto.costo.toFixed(2) }}</td>
              <td class="p-[6px_8px] border border-gray-200 bg-white align-middle">${{ producto.pvp.toFixed(2) }}</td>
              <td class="p-[6px_8px] border border-gray-200 bg-white align-middle">
                <template v-if="ultimoPrecioDolar">
                  Bs. {{ (producto.pvp * ultimoPrecioDolar).toFixed(2) }}
                </template>
                <template v-else>
                  <span class="text-gray-400 italic">Cargando...</span>
                </template>
              </td>
              <td class="w-[130px] whitespace-nowrap text-center p-[6px_8px] border border-gray-200 bg-white align-middle">
                <button 
                  v-if="authStore.isAdmin"
                  @click="eliminarProducto(producto.id)" 
                  class="inline-block p-[4px_10px] font-semibold text-white tracking-[0.5px] rounded-[25px] border border-white/10 cursor-pointer transition-all duration-300 text-[11px] outline-none bg-red-600 shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:scale-[1.03] m-[0_2px]"
                >
                  Eliminar
                </button>
                <button 
                  @click="editarProducto(producto)" 
                  class="inline-block p-[4px_10px] font-semibold text-white tracking-[0.5px] rounded-[25px] border border-white/10 cursor-pointer transition-all duration-300 text-[11px] outline-none bg-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:scale-[1.03] m-[0_2px]"
                >
                  Editar
                </button>
              </td>
            </tr>
            <tr v-if="productos.length === 0">
              <td colspan="8" class="text-center p-[20px] text-gray-500 italic bg-white border border-gray-200">
                No hay productos registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="flex justify-center items-center gap-[15px] mb-[15px] p-[6px] bg-gray-50 rounded-[12px] md:gap-[10px]" v-if="productos.length > 0">
        <button 
          @click="paginaActual--" 
          :disabled="paginaActual === 1"
          class="p-[5px_12px] bg-white border border-gray-200 rounded-[8px] text-gray-700 font-semibold cursor-pointer transition-all duration-200 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-100 hover:enabled:border-gray-400 md:p-[6px_12px] md:text-[13px]"
        >
          Anterior
        </button>
        <span class="text-[14px] text-gray-500 font-medium">
          Página {{ paginaActual }} de {{ totalPaginas }}
        </span>
        <button 
          @click="paginaActual++" 
          :disabled="paginaActual === totalPaginas"
          class="p-[5px_12px] bg-white border border-gray-200 rounded-[8px] text-gray-700 font-semibold cursor-pointer transition-all duration-200 text-[12px] disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-gray-100 hover:enabled:border-gray-400 md:p-[6px_12px] md:text-[13px]"
        >
          Siguiente
        </button>
      </div>

      <!-- Botones para registrar nuevos productos y generar reportes -->
      <div class="flex items-center gap-[10px] mt-[5px]">
        <button 
          @click="abrirNuevoProducto" 
          class="inline-block p-[4px_10px] font-semibold text-white tracking-[0.3px] rounded-[25px] border border-white/10 cursor-pointer transition-all duration-300 text-[11px] outline-none bg-gradient-to-br from-[#b57e10] to-[#975f0c] shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:translate-y-[-1px]"
        >
          Registrar Producto
        </button>
        <button 
          @click="generarReporte" 
          :disabled="generandoReporte"
          class="inline-block p-[4px_10px] font-semibold text-white tracking-[0.3px] rounded-[25px] border border-white/10 cursor-pointer transition-all duration-300 text-[11px] outline-none bg-gradient-to-br from-[#b57e10] to-[#975f0c] shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ generandoReporte ? 'Generando...' : 'Generar Reporte' }}
        </button>
      </div>

      <!-- Modal de Producto -->
      <div
        v-if="mostrarModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="cerrarModal"
      >
        <div class="w-full max-w-xl">
          <DynamicForm
            :fields="fieldsConfig"
            :initial-values="formProducto"
            :title="productoEditando ? 'Actualizar Producto' : 'Registro de Nuevo Producto'"
            :submit-label="productoEditando ? 'Confirmar Cambios' : 'Registrar Producto'"
            :loading="loadingGuardar"
            @save="guardarProducto"
            @cancel="cerrarModal"
          >
            <template #extra="{ values }">
              <div v-if="values.costo" class="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-2">
                <div class="flex justify-between items-center text-left">
                  <div>
                    <p class="text-[10px] uppercase font-black text-amber-600 tracking-wider">Precio Sugerido (PVP)</p>
                    <p class="text-xl font-black text-amber-700">Bs. {{ (values.costo / 0.7 * (ultimoPrecioDolar || 0)).toFixed(2) }}</p>
                    <p class="text-[10px] text-amber-500 font-bold">$ {{ (values.costo / 0.7).toFixed(2) }} USD</p>
                  </div>
                  <p class="text-[11px] text-amber-600/70 italic max-w-[150px] text-right">
                    Basado en margen del 30%
                  </p>
                </div>
              </div>
            </template>
          </DynamicForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import offlineService from '../services/offline'
import NavBar from '../components/NavBar.vue'
import DynamicForm from '../components/DynamicForm.vue'

const authStore = useAuthStore()
const productos = ref([])
const categorias = ref([])
const proveedores = ref([])
const filtroCategoria = ref('')
const generandoReporte = ref(false)
const loadingGuardar = ref(false)
const mostrarModal = ref(false)
const productoEditando = ref(null)
const queryBusqueda = ref('')
const ultimoPrecioDolar = ref(null)

const formProducto = ref({
  nombre: '',
  costo: '',
  idCategoria: '',
  idProveedor: ''
})

const fieldsConfig = computed(() => [
  {
    name: 'nombre',
    label: 'Nombre del Producto',
    type: 'text',
    required: true,
    placeholder: 'Ej. Arroz Blanco 1kg'
  },
  {
    name: 'costo',
    label: 'Costo (USD)',
    type: 'number',
    step: '0.01',
    min: '0',
    required: true,
    placeholder: '0.00'
  },
  {
    name: 'idCategoria',
    label: 'Categoría',
    type: 'select',
    required: true,
    placeholder: 'Seleccione una categoría',
    options: categorias.value.map(c => ({ value: c.id, label: c.nombre }))
  },
  {
    name: 'idProveedor',
    label: 'Proveedor',
    type: 'select',
    required: true,
    placeholder: 'Seleccione un proveedor',
    options: proveedores.value.map(p => ({ value: p.id, label: p.nombre }))
  }
])

// Paginación
const paginaActual = ref(1)
const productosPorPagina = 10

// Productos filtrados por búsqueda y categoría
const productosFiltrados = computed(() => {
  let resultado = productos.value

  if (queryBusqueda.value) {
    const query = queryBusqueda.value.toLowerCase()
    resultado = resultado.filter(p => p.nombre.toLowerCase().includes(query))
  }

  return resultado
})

const totalPaginas = computed(() => {
  return Math.ceil(productosFiltrados.value.length / productosPorPagina) || 1
})

const productosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * productosPorPagina
  const fin = inicio + productosPorPagina
  return productosFiltrados.value.slice(inicio, fin)
})

const resetAndLoad = () => {
  paginaActual.value = 1
  cargarProductos()
}

const cargarCategorias = async () => {
  try {
    const response = await api.get('/categorias')
    if (response.data.success) {
      categorias.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
}

const cargarProveedores = async () => {
  try {
    const response = await api.get('/proveedores')
    if (response.data.success) {
      proveedores.value = response.data.data
    }
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
  }
}

const cargarDolar = async () => {
  try {
    const response = await api.get('/dolar/ultimo')
    if (response.data.success) {
      ultimoPrecioDolar.value = parseFloat(response.data.data.precio)
    }
  } catch (error) {
    console.warn('Error al cargar precio del dólar real, intentando caché...')
    const cached = await offlineService.get('dolar')
    if (cached) {
      ultimoPrecioDolar.value = parseFloat(cached.precio)
    }
  }
}

const cargarProductos = async () => {
  try {
    const params = filtroCategoria.value ? { categoria: filtroCategoria.value } : {}
    const response = await api.get('/productos', { params })
    if (response.data.success) {
      productos.value = response.data.data
      await offlineService.save('productos', response.data.data)
    }
  } catch (error) {
    console.error('Error al cargar productos:', error)
    const cached = await offlineService.get('productos')
    if (cached) productos.value = cached
  }
}

const eliminarProducto = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este producto?')) return

  try {
    const response = await api.delete(`/productos/${id}`)
    if (response.data.success) {
      await cargarProductos()
    } else {
      alert(response.data.message || 'Error al eliminar producto')
    }
  } catch (error) {
    alert('Error al conectar con el servidor')
  }
}

const abrirNuevoProducto = () => {
  productoEditando.value = null
  formProducto.value = {
    nombre: '',
    costo: '',
    idCategoria: '',
    idProveedor: ''
  }
  mostrarModal.value = true
}

const editarProducto = (producto) => {
  productoEditando.value = producto
  formProducto.value = {
    nombre: producto.nombre,
    costo: producto.costo,
    idCategoria: producto.idCategoria,
    idProveedor: producto.idProveedor
  }
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  productoEditando.value = null
  formProducto.value = {
    nombre: '',
    costo: '',
    idCategoria: '',
    idProveedor: ''
  }
}

const guardarProducto = async (formData) => {
  loadingGuardar.value = true
  try {
    if (productoEditando.value) {
      await api.put(`/productos/${productoEditando.value.id}`, formData)
    } else {
      await api.post('/productos', formData)
    }
    await cargarProductos()
    cerrarModal()
  } catch (error) {
    alert('Error al guardar producto')
  } finally {
    loadingGuardar.value = false
  }
}

const generarReporte = async () => {
  generandoReporte.value = true
  try {
    const params = filtroCategoria.value ? { categoria: filtroCategoria.value } : {}
    const response = await api.get('/reportes/productos', {
      params,
      responseType: 'blob'
    })
    
    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'reporte_productos.pdf')
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

onMounted(async () => {
  await offlineService.init()
  await cargarCategorias()
  await cargarProveedores()
  await cargarDolar()
  await cargarProductos()
})
</script>




