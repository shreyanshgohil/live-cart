import React from 'react';
import { useStatusCheck } from '../hooks/useStatusCheck';
import Onboarding from '../pages/Onboarding';
import { Spinner } from '@shopify/polaris';

export const OnboardingGuard = ({ children }) => {
  const { showOnboarding, isLoading } = useStatusCheck();

  // Show loading spinner while checking status
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", paddingTop: "20%" }}>
        <Spinner accessibilityLabel="Loading" size="large" />
      </div>
    );
  }

  // Only show onboarding if explicitly required
  if (showOnboarding) {
    return <Onboarding />;
  }

  return children;
};
