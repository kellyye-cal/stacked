import axios from 'axios';
import useAuth from '../hooks/useAuth';


const apiClient = axios.create({
    baseURL: process.env.BACKEND_URL || 'http://localhost:4000'
})

export const useAxiosInterceptors = () => {
    const {clearAuthState} = useAuth();

    apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
          if (error.response && error.response.status === 403) {
            clearAuthState(); // Clear auth state and redirect on 403
          }
          return Promise.reject(error);
        }
      );

    return apiClient;
}

export default apiClient; 