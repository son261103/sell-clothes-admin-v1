import {configureStore} from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice.tsx';
import userReducer from './features/user/userSlice.tsx';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
