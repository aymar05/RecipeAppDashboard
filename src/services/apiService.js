// Fichier : services/apiService.js

const BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * @param {Response} response
 * @returns {Promise<any>}
 * @throws {Error}
 */
const handleResponse = async (response) => {

  if (response.status === 401) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';

    return Promise.reject(new Error("Session expirée. Veuillez vous reconnecter."));
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Une erreur est survenue.' }));
    throw new Error(errorData.message || `Erreur API: ${response.statusText}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

/**
 * @returns {Headers} L'objet Headers.
 */
const createHeaders = () => {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  const token = localStorage.getItem('token');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  return headers;
};


/**
 * @param {string} endpoint
 * @param {object} [params]
 * @returns {Promise<any>}
 */
export const apiGet = async (endpoint, params = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });

  const options = {
    method: 'GET',
    headers: createHeaders(),
  };

  try {
    const response = await fetch(url.toString(), options);
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur dans la requête GET:', error);
    throw error;
  }
};

/**
 * @param {string} endpoint
 * @param {object|FormData} body
 * @returns {Promise<any>}
 */
export const apiPost = async (endpoint, body) => {
  const headers = createHeaders();
  const options = {
    method: 'POST',
    headers,
    body,
  };

  if (!(body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur dans la requête POST:', error);
    throw error;
  }
};


/**
 * @param {string} endpoint
 * @returns {Promise<any>}
 */
export const apiDelete = async (endpoint) => {
  const options = {
    method: 'DELETE',
    headers: createHeaders(),
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur dans la requête DELETE:', error);
    throw error;
  }
};


