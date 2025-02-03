import { RouteObject } from 'react-router-dom';
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import VerifyOTPPage from "../pages/Auth/VerifyOTPPage";

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
        },
        {
            path: 'verify-otp',
            element: <VerifyOTPPage />
        }
    ]
};