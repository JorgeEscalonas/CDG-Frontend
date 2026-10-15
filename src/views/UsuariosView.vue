<template>
  <div class="min-h-screen bg-gray-100">
    <NavBar />
    <div class="w-[98%] max-w-[1400px] mx-auto my-[10px] p-[10px_15px] bg-white shadow-md rounded-lg flex flex-col md:p-[15px]">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-gray-800 text-[1.4rem] font-bold">Gestión de Usuarios</h2>
          <p class="text-xs text-gray-500">Panel exclusivo para administradores</p>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="w-full overflow-x-auto scrolling-touch mb-[10px]">
        <table class="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <th class="w-[60px] whitespace-nowrap text-center p-[8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold">ID</th>
              <th class="p-[8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold text-left">Nombre</th>
              <th class="p-[8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold text-left">Usuario</th>
              <th class="p-[8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold text-center">Rol</th>
              <th class="p-[8px] border border-gray-200 bg-gray-50 text-gray-800 font-bold text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id" class="hover:bg-gray-50 transition-colors">
              <td class="text-center p-[8px] border border-gray-200 bg-white font-medium">{{ u.id }}</td>
              <td class="p-[8px] border border-gray-200 bg-white font-semibold text-gray-800">{{ u.nombre }}</td>
              <td class="p-[8px] border border-gray-200 bg-white text-gray-600">{{ u.nombreU || u.email }}</td>
              <td class="p-[8px] border border-gray-200 bg-white text-center">
                <span :class="u.role === 'admin' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300'" class="px-2 py-0.5 rounded-full text-xs font-bold border">
                  {{ u.role }}
                </span>
              </td>
              <td class="p-[8px] border border-gray-200 bg-white text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  Activo
                </span>
              </td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="5" class="text-center p-[30px] text-gray-500 italic bg-white border border-gray-200">
                <span v-if="loading">Cargando usuarios...</span>
                <span v-else>No hay usuarios registrados</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import api from '@/services/api'

const usuarios = ref([])
const loading = ref(true)

const cargarUsuarios = async () => {
  loading.value = true
  try {
    const response = await api.get('/usuarios')
    if (response.data && response.data.data) {
      usuarios.value = response.data.data
    }
  } catch (error) {
    console.warn('Endpoint /usuarios no disponible o requiere configuración en backend:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarUsuarios()
})
</script>
