import {configureStore} from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice.tsx';
import userReducer from './features/user/userSlice.tsx';
import avatarReducer from './features/user/avatarSlice.tsx';
import permissionReducer from './features/permission/permissionSlice.tsx';
import roleReducer from './features/role/roleSlice.tsx';
import categoryReducer from './features/category/categorySlice.tsx';
import brandReducer from './features/brand/brandSlice.tsx'
import brandLogoReducer from './features/brand/brandLogoSlice.tsx'


export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        avatar: avatarReducer,
        permission: permissionReducer,
        role: roleReducer,
        category: categoryReducer,
        brand: brandReducer,
        brandLogo: brandLogoReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
