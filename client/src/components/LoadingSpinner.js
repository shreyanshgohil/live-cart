import React from 'react';
import { Spinner } from '@shopify/polaris';

export const LoadingSpinner = ({ message = "Loading", size = "large" }) => {
    return (
        <div style={{ textAlign: "center", paddingTop: "20%" }}>
            <Spinner accessibilityLabel={message} size={size} />
        </div>
    );
};

export default LoadingSpinner;
