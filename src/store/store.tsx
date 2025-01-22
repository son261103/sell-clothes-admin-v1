import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';

// Store configuration
export const store = configureStore({
    reducer: {
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'auth/login/fulfilled',
                    'auth/register/fulfilled',
                    'auth/verifyOtp/fulfilled'
                ],
                ignoredPaths: ['auth.user'],
            },
        }),
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;