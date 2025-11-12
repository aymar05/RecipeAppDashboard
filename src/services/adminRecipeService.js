// Fichier : src/services/adminRecipeService.js

import { apiGet, apiPost, apiDelete } from './apiService.js';

// ===================================================================
// ==        GESTION DES RECETTES PUBLIÉES (DASHBOARD)            ==
// ===================================================================

/**
 * [ADMIN] Récupère la liste paginée de toutes les recettes pour le tableau de bord.
 * @param {object} params - Paramètres pour la pagination et le filtrage.
 * @returns {Promise<object>} La réponse paginée de l'API.
 */
export const getDashboardRecipes = (params = {}) => {
  return apiGet('/dashboard/recipes', params);
};

/**
 * [ADMIN] Crée une nouvelle recette directement depuis le tableau de bord.
 * @param {FormData} recipeData - Les données de la recette (doit être FormData pour l'image).
 * @returns {Promise<object>} La nouvelle recette créée.
 */
export const createRecipe = (recipeData) => {
  return apiPost('/dashboard/recipes', recipeData);
};

/**
 * [ADMIN] Met à jour une recette existante.
 * @param {number|string} id - L'ID de la recette à mettre à jour.
 * @param {FormData} recipeData - Les nouvelles données (doit être FormData pour l'image et _method).
 * @returns {Promise<object>} La recette mise à jour.
 */
export const updateRecipe = (id, recipeData) => {
  recipeData.append('_method', 'PUT');
  return apiPost(`/dashboard/recipes/${id}`, recipeData);
};

/**
 * [ADMIN] Supprime une recette.
 * @param {number|string} id - L'ID de la recette à supprimer.
 * @returns {Promise<void>}
 */
export const deleteRecipe = (id) => {
  return apiDelete(`/dashboard/recipes/${id}`);
};


// ===================================================================
// ==                GESTION DES INGRÉDIENTS                      ==
// ===================================================================

/**
 * [ADMIN] Ajoute un nouvel ingrédient à une recette spécifique.
 * @param {number|string} recipeId - L'ID de la recette parente.
 * @param {object} ingredientData - Les données du nouvel ingrédient (ex: { name, quantity, measure }).
 * @returns {Promise<object>} Le nouvel ingrédient créé.
 */
export const addIngredientToRecipe = (recipeId, ingredientData) => {
  return apiPost(`/dashboard/recipes/${recipeId}/ingredients`, ingredientData);
};

/**
 * [ADMIN] Met à jour un ingrédient spécifique.
 * @param {number|string} ingredientId - L'ID de l'ingrédient à mettre à jour.
 * @param {object} ingredientData - Les nouvelles données de l'ingrédient.
 * @returns {Promise<object>} L'ingrédient mis à jour.
 */
export const updateIngredient = (ingredientId, ingredientData) => {
  // apiService doit pouvoir gérer un body JSON pour les requêtes PUT/PATCH
  // Si ce n'est pas le cas, il faudra simuler avec apiPost et _method
  const formData = new FormData();
  formData.append('_method', 'PUT');
  Object.keys(ingredientData).forEach(key => formData.append(key, ingredientData[key]));
  return apiPost(`/dashboard/recipes/ingredients/${ingredientId}`, formData);
};

/**
 * [ADMIN] Supprime un ingrédient spécifique.
 * @param {number|string} ingredientId - L'ID de l'ingrédient à supprimer.
 * @returns {Promise<void>}
 */
export const deleteIngredient = (ingredientId) => {
  return apiDelete(`/dashboard/recipes/ingredients/${ingredientId}`);
};


// ===================================================================
// ==                   GESTION DES ÉTAPES                          ==
// ===================================================================

/**
 * [ADMIN] Ajoute une nouvelle étape à une recette spécifique.
 * @param {number|string} recipeId - L'ID de la recette parente.
 * @param {object} stepData - Les données de la nouvelle étape (ex: { name, description, duration }).
 * @returns {Promise<object>} La nouvelle étape créée.
 */
export const addStepToRecipe = (recipeId, stepData) => {
  return apiPost(`/dashboard/recipes/${recipeId}/steps`, stepData);
};

/**
 * [ADMIN] Met à jour une étape spécifique.
 * @param {number|string} stepId - L'ID de l'étape à mettre à jour.
 * @param {object} stepData - Les nouvelles données de l'étape.
 * @returns {Promise<object>} L'étape mise à jour.
 */
export const updateStep = (stepId, stepData) => {
  const formData = new FormData();
  formData.append('_method', 'PUT');
  Object.keys(stepData).forEach(key => formData.append(key, stepData[key]));
  return apiPost(`/dashboard/recipes/steps/${stepId}`, formData);
};

/**
 * [ADMIN] Supprime une étape spécifique.
 * @param {number|string} stepId - L'ID de l'étape à supprimer.
 * @returns {Promise<void>}
 */
export const deleteStep = (stepId) => {
  return apiDelete(`/dashboard/recipes/steps/${stepId}`);
};


// ===================================================================
// ==     GESTION DES PROPOSITIONS DE RECETTES (RECIPE REQUESTS)    ==
// ===================================================================

/**
 * [ADMIN] Récupère la liste de toutes les propositions de recettes.
 * @param {object} params - Paramètres pour la pagination et le filtrage.
 * @returns {Promise<object>} La liste paginée des propositions.
 */
export const getAdminRecipeRequests = (params = {}) => {
  return apiGet('/dashboard/recipe-requests', params);
};

/**
 * [ADMIN] Récupère les détails d'une proposition de recette spécifique.
 * @param {number|string} id - L'ID de la proposition.
 * @returns {Promise<object>} Les détails de la proposition.
 */
export const getAdminRecipeRequestDetails = (id) => {
  return apiGet(`/dashboard/recipe-requests/${id}`);
};

/**
 * [ADMIN] Approuve une proposition de recette.
 * @param {number|string} id - L'ID de la proposition à approuver.
 * @returns {Promise<object>}
 */
export const approveRecipeRequest = (id) => {
  const formData = new FormData();
  formData.append('_method', 'PUT');
  return apiPost(`/dashboard/recipe-requests/${id}/approve`, formData);
};

/**
 * [ADMIN] Rejette une proposition de recette.
 * @param {number|string} id - L'ID de la proposition à rejeter.
 * @returns {Promise<object>}
 */
export const rejectRecipeRequest = (id) => {
  const formData = new FormData();
  formData.append('_method', 'PUT');
  return apiPost(`/dashboard/recipe-requests/${id}/reject`, formData);
};

/**
 * [ADMIN] Supprime une proposition de recette.
 * @param {number|string} id - L'ID de la proposition à supprimer.
 * @returns {Promise<void>}
 */
export const deleteAdminRecipeRequest = (id) => {
  return apiDelete(`/dashboard/recipe-requests/${id}`);
};
