import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Sử dụng localStorage
import authReducer from './features/auth/authSlice.tsx';
import userReducer from './features/user/userSlice.tsx';
import avatarReducer from './features/user/avatarSlice.tsx';
import permissionReducer from './features/permission/permissionSlice.tsx';
import roleReducer from './features/role/roleSlice.tsx';
import categoryReducer from './features/category/categorySlice.tsx';
import brandReducer from './features/brand/brandSlice.tsx';
import brandLogoReducer from './features/brand/brandLogoSlice.tsx';
import productReducer from './features/product/productSlice.tsx';
import productImageReducer from './features/product/productImageSlice.tsx';
import productVariantReducer from './features/product/productVariantSlice.tsx';
import orderVariantReducer from './features/order/orderSlice.tsx';
import userAddressReducer from './features/userAddress/userAddressSlice.tsx';
import paymentReducer from './features/payment/paymentSlice.tsx';
import orderItemReducer from './features/orderItem/orderItemSlice.tsx';
import couponReducer from './features/coupon/couponSlice.tsx';

// Persist config riêng cho từng slice nếu cần tùy chỉnh
const productPersistConfig = {
    key: 'product',
    storage,
    whitelist: ['products', 'currentProduct', 'featuredProducts', 'relatedProducts', 'latestProducts', 'saleProducts', 'productHierarchy']
};

const productImagePersistConfig = {
    key: 'productImage',
    storage,
    whitelist: ['images', 'imageHierarchy']
};

// Bọc reducer với persistReducer
const persistedAuthReducer = persistReducer({key: 'auth', storage}, authReducer);
const persistedUserReducer = persistReducer({key: 'user', storage}, userReducer);
const persistedAvatarReducer = persistReducer({key: 'avatar', storage}, avatarReducer);
const persistedPermissionReducer = persistReducer({key: 'permission', storage}, permissionReducer);
const persistedRoleReducer = persistReducer({key: 'role', storage}, roleReducer);
const persistedCategoryReducer = persistReducer({key: 'category', storage}, categoryReducer);
const persistedBrandReducer = persistReducer({key: 'brand', storage}, brandReducer);
const persistedBrandLogoReducer = persistReducer({key: 'brandLogo', storage}, brandLogoReducer);
const persistedProductReducer = persistReducer(productPersistConfig, productReducer);
const persistedProductImageReducer = persistReducer(productImagePersistConfig, productImageReducer);
const persistedProductVariantReducer = persistReducer({key: 'productVariant', storage}, productVariantReducer);
const persistedOrderVariantReducer = persistReducer({key: 'orderVariant', storage}, orderVariantReducer);
const persistedUserAddressReducer = persistReducer({key: 'userAddress', storage}, userAddressReducer);
const persistedPaymentReducer = persistReducer({key: 'payment', storage}, paymentReducer);
const persistedOrderItemReducer = persistReducer({key: 'orderItem', storage}, orderItemReducer);
const persistedCouponReducer = persistReducer({key: 'coupon', storage}, couponReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        user: persistedUserReducer,
        avatar: persistedAvatarReducer,
        permission: persistedPermissionReducer,
        role: persistedRoleReducer,
        category: persistedCategoryReducer,
        brand: persistedBrandReducer,
        brandLogo: persistedBrandLogoReducer,
        product: persistedProductReducer,
        productImage: persistedProductImageReducer,
        productVariant: persistedProductVariantReducer,
        order: persistedOrderVariantReducer,
        userAddress: persistedUserAddressReducer,
        payment: persistedPaymentReducer,
        orderItem: persistedOrderItemReducer,
        coupon: persistedCouponReducer,

    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;