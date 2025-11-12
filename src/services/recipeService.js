import { apiGet, apiPost, apiDelete } from './apiService.js';

/**
 * Récupère la liste paginée des propositions de recettes de l'utilisateur.
 * @param {object} params - Paramètres pour la pagination et le filtrage.
 * @returns {Promise<object>} La réponse paginée de l'API.
 */
export const getRecipeRequests = (params) => {
  // Spatie Query Builder attend des clés comme 'filter[name]'
  const queryParams = {
    page: params.page,
    per_page: params.per_page,
    sort: params.sort,
    'filter[name]': params['filter[name]'],
    'filter[status]': params['filter[status]'],
  };
  return apiGet('/recipe-requests', queryParams);
};

/**
 * Crée une nouvelle proposition de recette.
 * @param {FormData} recipeData - Les données de la recette sous forme de FormData (pour l'image).
 * @returns {Promise<object>} La nouvelle proposition de recette créée.
 */
export const createRecipeRequest = (recipeData) => {
  return apiPost('/recipe-requests', recipeData);
};

/**
 * Met à jour une proposition de recette.
 * @param {number} id - L'ID de la recette à mettre à jour.
 * @param {FormData} recipeData - Les nouvelles données.
 * @returns {Promise<object>} La proposition mise à jour.
 */
export const updateRecipeRequest = (id, recipeData) => {
  // Laravel simule les méthodes PUT/PATCH via un champ _method dans une requête POST avec FormData
  recipeData.append('_method', 'PUT');
  return apiPost(`/recipe-requests/${id}`, recipeData);
};

/**
 * Supprime une proposition de recette.
 * @param {number} id - L'ID de la proposition à supprimer.
 * @returns {Promise<void>}
 */
export const deleteRecipeRequest = (id) => {
  return apiDelete(`/recipe-requests/${id}`);
};
