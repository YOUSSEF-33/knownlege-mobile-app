import { useEffect } from 'react';
import { refreshTheToken } from '@/utils/apiServises';

const useTokenRefresh = () => {
  useEffect(() => {
    const refreshToken = async () => {
      try {
        await refreshTheToken();
      } catch (error) {
        console.error('Silent token refresh failed:', error);
      }
    };

    const intervalId = setInterval(refreshToken, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(intervalId);
  }, []);
};

export default useTokenRefresh;
