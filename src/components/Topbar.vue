<!-- src/components/Topbar.vue -->
<template>
  <header class="bg-white shadow-md p-4 flex items-center justify-between z-30">
    <!-- Bouton Hamburger pour mobile -->
    <button
      @click="$emit('toggle-sidebar')"
      class="text-gray-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Titre de la page (dynamique) -->
    <h1 class="text-xl font-semibold text-gray-800">{{ pageTitle }}</h1>

    <div></div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { menuItems } from '@/navigation/menu' // Assurez-vous que le chemin est correct

// Événement pour communiquer avec le parent
defineEmits(['toggle-sidebar'])

const route = useRoute()

// Propriété calculée pour trouver le titre de la page actuelle
const pageTitle = computed(() => {
  const findItem = (items, path) => {
    for (const item of items) {
      if (item.path === path) {
        return item.name
      }
      if (item.children) {
        const childMatch = findItem(item.children, path)
        if (childMatch) return childMatch
      }
    }
    return null
  }
  return findItem(menuItems, route.path) || 'Bienvenue' // Titre par défaut
})
</script>
