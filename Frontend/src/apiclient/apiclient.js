import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const useApiClient = (navigate) => {

  const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
  });

  // Function to get a new access token using the refresh token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      const response = await apiClient.post('/api/token/refresh/', {
       refresh:refreshToken,
      });
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      return access;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  };

  apiClient.interceptors.request.use(
    async (config) => {
      let accessToken = localStorage.getItem('access_token')
      if (config.url === '/api/token/refresh/') {
        return config;
      }
      if (accessToken) {
        const { exp } = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (exp < currentTime) {
          console.log('Access Token Expired. Attempting to refresh...');
          try {
            accessToken = await refreshAccessToken();
          } catch (error) {
            console.log('Unable to refresh token. Logging you out...');
            localStorage.clear();
            navigate('/login');
            throw error;
          }
        }
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return apiClient;
};

export default useApiClient;
