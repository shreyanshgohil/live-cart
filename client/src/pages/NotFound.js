import React from 'react';
import { Page, Text } from '@shopify/polaris';

export default function NotFound() {
  return (
    <Page title="Not Found">
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text variant="headingLg">404 - Page Not Found</Text>
        <Text variant="bodyMd">The page you are looking for does not exist.</Text>
      </div>
    </Page>
  );
}
