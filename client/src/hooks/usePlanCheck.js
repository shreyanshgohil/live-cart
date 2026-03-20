import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { GetApiCall } from '../helper/axios';

const CACHE_KEY = 'plan_status';
const CACHE_DURATION = 10 * 1000; // 10 seconds - short cache to prevent flicker but ensure fresh data

export const usePlanCheck = () => {
  const [hasPlan, setHasPlan] = useState(true); // Default to true to prevent redirect loop
  const [isChecking, setIsChecking] = useState(true);
  const [planData, setPlanData] = useState(null);

  const { status, store_data } = useSelector((store) => store.commonData);
  const token = store_data?.token;

  const checkPlan = async () => {
    try {
      if (!token) {
        setIsChecking(false);
        return;
      }

      // Check cache first
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setHasPlan(data.hasPlan);
            setPlanData(data.plan || null);
            setIsChecking(false);
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

      const response = await GetApiCall('GET', `/plan/status`, headers);
      if (response?.data?.data?.hasPlan) {
        setHasPlan(true);
        setPlanData(response?.data?.data?.plan || null);
        // Cache the result
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: { hasPlan: true, plan: response?.data?.data?.plan },
          timestamp: Date.now()
        }));
      } else {
        setHasPlan(false);
        setPlanData(null);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          data: { hasPlan: false, plan: null },
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error checking plan status:', error);
      // On error, assume no plan to show pricing page
      setHasPlan(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check plan when token is available
    if (token && status) {
      checkPlan();
    } else {
      setIsChecking(false);
    }
  }, [token, status]);

  // Function to clear cache (useful after plan selection)
  const clearCache = () => {
    sessionStorage.removeItem(CACHE_KEY);
  };

  return {
    hasPlan,
    isChecking,
    planData,
    refreshPlan: checkPlan,
    clearCache
  };
};
