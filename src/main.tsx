import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {BrowserRouter} from "react-router-dom";
import {Toaster} from 'react-hot-toast';
import {store} from './store/store';
import App from './App';
import './index.css';
import LoadingProvider from "./components/loading/LoadingProvider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <LoadingProvider>
                    <App/>
                    <Toaster
                        position="top-right"
                        reverseOrder={false}
                        gutter={8}
                        toastOptions={{
                            className: '',
                            duration: 3000,
                            style: {
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--border)',
                                padding: '12px',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            },
                            success: {
                                duration: 3000,
                                className: '!bg-green-50 dark:!bg-green-950 !text-green-800 dark:!text-green-200 !border-green-200 dark:!border-green-900',
                                iconTheme: {
                                    primary: '#22c55e',
                                    secondary: '#ffffff',
                                },
                            },
                            error: {
                                duration: 3000,
                                className: '!bg-red-50 dark:!bg-red-950 !text-red-800 dark:!text-red-200 !border-red-200 dark:!border-red-900',
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#ffffff',
                                },
                            },
                            loading: {
                                duration: Infinity,
                                className: '!bg-gray-50 dark:!bg-gray-900 !text-gray-800 dark:!text-gray-200 !border-gray-200 dark:!border-gray-800',
                            },
                        }}
                    />
                </LoadingProvider>
            </BrowserRouter>
        </Provider>
    </StrictMode>
);