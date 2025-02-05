import React from 'react';
import NavigationLoading from './NavigationLoading';

interface LoadingProviderProps {
    children: React.ReactNode;
}

const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    return (
        <>
            <NavigationLoading />
            {children}
        </>
    );
};

export default LoadingProvider;