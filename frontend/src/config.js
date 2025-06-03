// API configuration
export const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Ensure trailing slash is consistent
export const getApiUrl = (endpoint) => {
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
}; 