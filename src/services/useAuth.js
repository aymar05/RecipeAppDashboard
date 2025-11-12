// src/composables/useAuth.js

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout as apiLogout } from '@/services/authService' // Importer la fonction de déconnexion de l'API
const user = ref(null);
const token = ref(localStorage.getItem('token'));
// ... (logique de récupération depuis le localStorage) ...

// --- NOUVEAU BLOC D'INITIALISATION DE L'UTILISATEUR ---
// Ce code s'exécute une seule fois au démarrage de l'application
const storedUser = localStorage.getItem('user');
if (storedUser) {
  try {
    // On parse le JSON stocké pour retrouver l'objet utilisateur
    user.value = JSON.parse(storedUser);
  } catch (e) {
    // Si les données sont corrompues, on nettoie pour éviter les erreurs
    console.error("Erreur lors de la lecture des données utilisateur du localStorage", e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    user.value = null;
    token.value = null;
  }
}
// --- FIN DU NOUVEAU BLOC ---

export function useAuth() {
  const router = useRouter()

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken)
    localStorage.setItem('user', JSON.stringify(userData))
    token.value = userToken
    user.value = userData
    router.push('/dashboard') // Redirection après stockage
  }

  /**
   * Fonction de déconnexion améliorée
   */
  const logout = async () => {
    try {
        // 1. Appeler l'API pour invalider le token sur le serveur
        await apiLogout();
        console.log("Déconnexion réussie côté serveur.");
    } catch (error) {
        console.error("Erreur lors de la déconnexion sur le serveur:", error);
        // On continue même si l'appel API échoue, pour que l'utilisateur soit
        // au moins déconnecté côté client.
    } finally {
        // 2. Nettoyer le localStorage et l'état local
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        token.value = null
        user.value = null
        // 3. Rediriger vers la page de connexion
        router.push('/login')
    }
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated
  }
}
