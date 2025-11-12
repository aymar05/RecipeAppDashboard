// Fichier : services/authService.js
import { apiPost } from './apiService.js';

/**
 * Envoie les informations de connexion à l'API.
 * @param {object} credentials - Un objet contenant { email, password }.
 * @returns {Promise<any>} La réponse de l'API (généralement les données de l'utilisateur et un token).
 */
export const login = (credentials) => {
  // NOTE: Assurez-vous que votre API Laravel a une route '/login'
  // qui gère l'authentification et retourne une réponse JSON.
  return apiPost('/login', credentials);
};

/**
 * Déconnecte l'utilisateur.
 * @returns {Promise<any>}
 */
export const logout = () => {
  return apiPost('/logout', {});
};
