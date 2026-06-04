import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple session-expired alerts firing at once
let isSessionExpiredShown = false;

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = error.config?.url || '';
    const hasAuthHeader = Boolean(error.config?.headers?.Authorization);
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    // Jangan redirect untuk endpoint yang support guest access atau request auth publik
    const isGuestScanEndpoint = requestUrl.includes('/detection/scan');
    
    if (error.response?.status === 401 && !isSessionExpiredShown && hasAuthHeader && !isGuestScanEndpoint && !isAuthEndpoint) {
      isSessionExpiredShown = true;

      // Clear token and user cookie
      Cookies.remove('access_token');
      Cookies.remove('user');

      // Show session expired alert
      await Swal.fire({
        icon: 'warning',
        title: 'Sesi Telah Berakhir',
        text: 'Maaf, sesi Anda telah habis. Silakan login kembali untuk melanjutkan.',
        confirmButtonText: 'Login Kembali',
        confirmButtonColor: '#48bb78',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      isSessionExpiredShown = false;
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
