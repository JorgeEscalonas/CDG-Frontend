<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Encabezado del Formulario -->
    <div class="p-5 bg-gray-50/50 border-b border-gray-100">
      <h3 class="text-sm font-bold text-gray-700 flex items-center gap-2">
        <span class="w-1.5 h-1.5 bg-[#b57e10] rounded-full"></span>
        {{ title }}
      </h3>
    </div>

    <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
      <div v-for="field in fields" :key="field.name" class="space-y-1.5">
        <label :for="field.name" class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
          {{ field.label }} <span v-if="field.required" class="text-red-400">*</span>
        </label>
        
        <!-- Input de Texto / Número -->
        <template v-if="field.type === 'text' || field.type === 'number'">
          <div class="relative">
            <input
              :id="field.name"
              v-model="internalValues[field.name]"
              :type="field.type"
              :step="field.step || '1'"
              :min="field.min"
              :placeholder="field.placeholder"
              class="w-full p-[10px_15px] rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#b57e10]/30 focus:border-[#b57e10] transition-all text-[13.5px] font-medium text-gray-800 shadow-inner"
              :required="field.required"
              :disabled="loading"
            />
          </div>
        </template>

        <!-- Select -->
        <template v-else-if="field.type === 'select'">
          <select
            :id="field.name"
            v-model="internalValues[field.name]"
            class="w-full p-[10px_15px] rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#b57e10]/30 focus:border-[#b57e10] transition-all text-[13.5px] font-medium text-gray-800 shadow-sm bg-white"
            :required="field.required"
            :disabled="loading"
          >
            <option value="" disabled>{{ field.placeholder || 'Seleccione una opción' }}</option>
            <option
              v-for="opt in field.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </template>

        <!-- Texto de ayuda -->
        <p v-if="field.helpText" class="mt-1 text-[11px] text-gray-500 italic ml-1">
          {{ field.helpText }}
        </p>
      </div>

      <!-- Info adicional (Costo/PVP) -->
      <slot name="extra" :values="internalValues"></slot>

      <!-- Botones -->
      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          class="flex-1 p-[12px] font-black text-white tracking-[0.5px] rounded-[15px] border border-white/10 cursor-pointer transition-all duration-300 text-[13px] outline-none bg-gradient-to-br from-[#b57e10] to-[#975f0c] shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.3)] hover:translate-y-[-2px] hover:shadow-[0_6px_15px_rgba(0,0,0,0.2)] disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Procesando...' : submitLabel }}
        </button>
        <button
          v-if="showCancel"
          type="button"
          @click="$emit('cancel')"
          class="flex-1 p-[12px] font-black text-gray-600 tracking-[0.5px] rounded-[15px] border border-gray-200 cursor-pointer transition-all duration-300 text-[13px] outline-none bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  fields: {
    type: Array,
    required: true
  },
  initialValues: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: 'Formulario'
  },
  submitLabel: {
    type: String,
    default: 'Guardar'
  },
  loading: {
    type: Boolean,
    default: false
  },
  showCancel: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const internalValues = ref({ ...props.initialValues })

// Sincronizar si las props cambian (útil para edición)
watch(() => props.initialValues, (newVal) => {
  internalValues.value = { ...newVal }
}, { deep: true })

const handleSubmit = () => {
  emit('save', internalValues.value)
}
</script>
