import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { router } from 'expo-router';
import { Platform } from 'react-native';

const API_BASE_URL = 'https://bnu-api-staging.knownlege.com/api/';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const getAccessToken = async () => {
  return await AsyncStorage.getItem('access_token');
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshTheToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
); 

export const refreshTheToken = async () => {
  const refreshToken = await AsyncStorage.getItem('refresh_token');
  console.log('Refresh token from AsyncStorage:', refreshToken);

  if (!refreshToken) {
    console.error('No refresh token available');
    throw new Error('No refresh token available');
  }

  try {
    console.log('Attempting to refresh token...');
    const response = await axios.post('https://bnu-api-staging.knownlege.com/api/v1/auth/students/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      }
    });
    console.log('Token refresh response:', response.data);
    
    const newToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;

    console.log('New tokens received:', { newToken, newRefreshToken });

    await AsyncStorage.setItem('access_token', newToken);
    await AsyncStorage.setItem('refresh_token', newRefreshToken);

    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    return newToken;
  } catch (error: any) {
    console.error('Error during token refresh:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
};

export async function fetchUser(token: string | null): Promise<User | undefined> {
  
  if (token) {
    try {
      const response = await axiosInstance.get('v1/auth/students/me');
      console.log('User data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  } else {
    console.error('There is no token');
  }
}



// Function to send the token to your backend


export const initializeApp = async () => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    console.log('Setting authorization header with token:', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    console.log('No access token found, redirecting to login');
    router.push('/login');
  }
};

export default axiosInstance;
