import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { GetApiCall } from '../helper/axios';

const CACHE_KEY = 'onboarding_status';
const CACHE_DURATION = 10 * 1000; // 10 seconds - short cache to prevent flicker but ensure fresh data

export const useStatusCheck = () => {
  const [showOnboarding, setShowOnboarding] = useState(false); // Changed from true to false
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  const { status, store_data } = useSelector((store) => store.commonData);
  const token = store_data?.token;

  const checkStatus = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check cache first
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setShowOnboarding(!data.show);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Invalid cache, continue to API call
        }
      }

      // Use direct API call with authentication header
      const headers = {
        'authentication': token,
        'Content-Type': 'application/json'
      };

      const response = await GetApiCall('GET', `/check-status`, headers);
      if (response?.data?.data?.show) {
        setShowOnboarding(false);
        // Cache the result
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: { show: true },
          timestamp: Date.now()
        }));
      } else {
        setShowOnboarding(true);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: { show: false },
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error checking app status:', error);
      // On error, don't show onboarding to prevent blocking user
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check status when token is available
    if (token && status) {
      checkStatus();
    } else if (!token) {
      setIsLoading(false);
    }
  }, [token, status]);

  // Function to clear cache (useful after completing onboarding)
  const clearCache = () => {
    sessionStorage.removeItem(CACHE_KEY);
  };

  return {
    showOnboarding,
    isLoading,
    refreshStatus: checkStatus,
    clearCache
  };
};
