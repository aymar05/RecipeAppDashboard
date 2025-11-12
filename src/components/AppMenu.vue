<template>
  <div>
    <!-- Le Sidebar lui-même -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out',
        'w-64 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-300 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">R</span>
          </div>
          <span class="text-xl font-semibold text-gray-800">RecipeApp</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4">
        <ul class="space-y-1">
          <li v-for="item in menuItems" :key="item.path">
            <!-- Menu item sans sous-menu -->
            <router-link
              v-if="!item.children"
              :to="item.path"
              :class="[
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200',
                'hover:bg-green-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                isActiveRoute(item.path)
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'text-gray-700'
              ]"
            >
              <component :is="item.icon" class="w-5 h-5" v-if="item.icon" />
              <span class="font-medium">{{ item.name }}</span>
            </router-link>

            <!-- Menu item avec sous-menu -->
            <div v-else>
              <button
                @click="toggleSubmenu(item.path)"
                :class="[
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200',
                  'hover:bg-green-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                  isActiveParent(item.path) ? 'bg-gray-100 text-gray' : 'text-gray-700'
                ]"
              >
                <div class="flex items-center space-x-3">
                  <component :is="item.icon" class="w-5 h-5" />
                  <span class="font-medium">{{ item.name }}</span>
                </div>
                <svg
                  :class="['w-4 h-4 transition-transform', openSubmenus[item.path] ? 'rotate-180' : '']"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Sous-menu -->
              <ul
                v-show="openSubmenus[item.path]"
                class="mt-1 ml-4 space-y-1"
              >
                <li v-for="child in item.children" :key="child.path">
                  <router-link
                    :to="child.path"
                    :class="[
                      'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200',
                      'hover:bg-green-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                      isActiveRoute(child.path)
                        ? 'bg-green-300 text-white font-medium'
                        : 'text-gray-600'
                    ]"
                  >
                    <span class="w-5 h-5 flex items-center justify-center">•</span>
                    <span>{{ child.name }}</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>

      <!-- Footer action (SECTION RESTAURÉE) -->
      <div class="p-4 border-t border-gray-200">
        <button
          @click="handleLogout"
          class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { menuItems } from '@/navigation/menu' // Import centralisé
import { useAuth } from '@/services/useAuth'

// Reçoit l'état d'ouverture en tant que prop depuis le parent
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const route = useRoute()
const openSubmenus = ref({})

const isActiveRoute = (path) => {
  return route.path === path
}

const isActiveParent = (path) => {
  return route.path.startsWith(path)
}

const toggleSubmenu = (path) => {
  openSubmenus.value[path] = !openSubmenus.value[path]
}
const { logout } = useAuth();
const handleLogout = async () => {
  await logout();
}
</script>
