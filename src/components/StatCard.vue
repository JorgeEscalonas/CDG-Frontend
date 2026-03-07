<template>
  <router-link :to="to" class="block">
    <div class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600 mb-1">{{ title }}</p>
          <p class="text-2xl font-bold" :class="colorClass">{{ value }}</p>
        </div>
        <div class="text-2xl" v-html="icon"></div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: {
    type: String,
    default: 'blue'
  },
  to: Object
})

const colorClass = computed(() => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-amber-600',
    gold: 'text-[#b57e10]'
  }
  return colors[props.color] || colors.gold
})
</script>

