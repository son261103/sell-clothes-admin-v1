import { RouteObject } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import VerifyOTPPage from "../pages/Auth/VerifyOTPPage";
import AuthGuard from "./authguard.routes.tsx";

export const authRoutes: RouteObject = {
    path: '/auth',
    element: <AuthLayout />,
    children: [
        {
            path: 'login',
            element: (
                <AuthGuard>
                    <LoginPage />
                </AuthGuard>
            ),
        },
        {
            path: 'register',
            element: (
                <AuthGuard>
                    <RegisterPage />
                </AuthGuard>
            ),
        },
        {
            path: 'forgot-password',
            element: (
                <AuthGuard>
                    <ForgotPasswordPage />
                </AuthGuard>
            ),
        },
        {
            path: 'verify-otp',
            element: (
                <AuthGuard>
                    <VerifyOTPPage />
                </AuthGuard>
            ),
        },
    ],
};
