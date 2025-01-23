import { RouteObject } from 'react-router-dom';
import AuthLayout from "../layouts/AuthLayout.tsx";
import LoginPage from "../pages/Auth/LoginPage.tsx";
import RegisterPage from "../pages/Auth/RegisterPage.tsx";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage.tsx";

export const authRoutes: RouteObject = {
    path: '/auth',
    element: <AuthLayout />,
    children: [
        {
            path: 'login',
            element: <LoginPage />
        },
        {
            path: 'register',
            element: <RegisterPage />
        },
        {
            path: 'forgot-password',
            element: <ForgotPasswordPage />
        }
    ]
};