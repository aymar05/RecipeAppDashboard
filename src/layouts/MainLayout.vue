<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="lg:flex">
      <!-- Overlay pour fermer le menu sur mobile -->
      <div
        v-if="isSidebarOpen"
        @click="isSidebarOpen = false"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      ></div>

      <!-- Sidebar -->
      <AppMenu :is-open="isSidebarOpen" />

      <!-- Contenu principal (Topbar + Contenu de la page) -->
      <div class="flex-1 flex flex-col lg:ml-64">
        <!-- Topbar -->
        <Topbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

        <!-- Le contenu de la page spécifique s'affichera ici -->
        <main class="flex-1 p-6">
          <!-- router-view rendra les composants enfants définis dans le router -->
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// Assurez-vous que les chemins d'importation sont corrects depuis le dossier layouts
import AppMenu from '../components/AppMenu.vue'
import Topbar from '../components/Topbar.vue'

// État pour gérer l'ouverture/fermeture de la sidebar sur mobile
const isSidebarOpen = ref(false)
</script>

<style>
/* Pour s'assurer que le layout prend toute la hauteur */
html, body, #app {
  height: 100%;
}
</style>
