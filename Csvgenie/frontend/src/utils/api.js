import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Error Data:', error.response.data);
      console.error('Error Status:', error.response.status);
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Process an order file by uploading it to the backend
 * @param {FormData} formData - Form data containing the file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} Processing results
 */
export const processOrderFile = async (formData, onProgress) => {
  try {
    // Simulate progress for better UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 90) progress = 90;
      onProgress(Math.min(progress, 90));
    }, 200);

    const response = await api.post('/upload-order-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(uploadProgress);
        }
      },
    });

    clearInterval(progressInterval);
    onProgress(100);

    return response.data;
  } catch (error) {
    console.error('Error processing order file:', error);
    throw error;
  }
};

/**
 * Get catalog information from the backend
 * @returns {Promise<Object>} Catalog statistics
 */
export const getCatalogInfo = async () => {
  try {
    const response = await api.get('/catalog/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching catalog info:', error);
    throw error;
  }
};

/**
 * Reload the catalog from Excel files
 * @returns {Promise<Object>} Reload results
 */
export const reloadCatalog = async () => {
  try {
    const response = await api.post('/catalog/reload');
    return response.data;
  } catch (error) {
    console.error('Error reloading catalog:', error);
    throw error;
  }
};

/**
 * Get the full catalog data
 * @returns {Promise<Object>} Full catalog data
 */
export const getFullCatalog = async () => {
  try {
    const response = await api.get('/catalog');
    return response.data;
  } catch (error) {
    console.error('Error fetching full catalog:', error);
    throw error;
  }
};

/**
 * Check backend health status
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

export default api;
