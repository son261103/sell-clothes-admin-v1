// authHooks.tsx
import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks.tsx';
import {
    login,
    register,
    logout,
    sendOtp,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    clearError,
    clearRegistrationData,
    resetOtpStatus
} from '../store/features/auth/authSlice.tsx';
import {
    selectAuthStatus,
    selectUser,
    selectUserRoles,
    selectUserPermissions,
    selectRegistrationSuccess,
    selectRegistrationData,
    selectOtpVerified,
    selectOtpSent
} from '../store/features/auth/authSelector.tsx';
import type {
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SendOtpRequest,
    OtpVerificationRequest
} from '../types';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const {isAuthenticated, isLoading, error} = useAppSelector(selectAuthStatus);
    const roles = useAppSelector(selectUserRoles);
    const permissions = useAppSelector(selectUserPermissions);

    const handleLogin = useCallback(
        async (credentials: LoginRequest): Promise<boolean> => {
            try {

                const result = await dispatch(login(credentials)).unwrap();

                if (!result?.accessToken) {
                    return false;
                }

                if (credentials.rememberMe) {
                    sessionStorage.setItem('accessToken', result.accessToken.trim());
                } else {
                    sessionStorage.setItem('accessToken', result.accessToken.trim());
                    if (result.refreshToken) {
                        sessionStorage.setItem('refreshToken', result.refreshToken.trim());
                    }
                }

                return true;
            } catch (error) {
                console.error('Hook: Error during login process:', error);
                return false;
            }
        },
        [dispatch]
    );

    const handleLogout = useCallback(
        async () => {
            try {
                await dispatch(logout()).unwrap();
                // Xóa tất cả tokens và user data
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('rememberMe');
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    const hasRole = useCallback(
        (role: string) => roles.includes(role),
        [roles]
    );

    const hasPermission = useCallback(
        (permission: string) => permissions.includes(permission),
        [permissions]
    );

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        roles,
        permissions,
        login: handleLogin,
        logout: handleLogout,
        hasRole,
        hasPermission
    };
};

export const useRegistration = () => {
    const dispatch = useAppDispatch();
    const registrationSuccess = useAppSelector(selectRegistrationSuccess);
    const registrationData = useAppSelector(selectRegistrationData);
    const {isLoading, error} = useAppSelector(selectAuthStatus);

    const handleRegister = useCallback(
        async (data: RegisterRequest, otp?: string) => {
            try {
                await dispatch(register({data, otp})).unwrap();
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    const handleClearRegistration = useCallback(
        () => {
            dispatch(clearRegistrationData());
        },
        [dispatch]
    );

    return {
        registrationSuccess,
        registrationData,
        isLoading,
        error,
        register: handleRegister,
        clearRegistration: handleClearRegistration
    };
};

export const useOtp = () => {
    const dispatch = useAppDispatch();
    const otpVerified = useAppSelector(selectOtpVerified);
    const otpSent = useAppSelector(selectOtpSent);
    const {isLoading, error} = useAppSelector(selectAuthStatus);


    const handleSendOtp = useCallback(
        async (data: SendOtpRequest) => {
            try {
                await dispatch(sendOtp(data)).unwrap();
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    const handleVerifyOtp = useCallback(
        async (data: OtpVerificationRequest) => {
            try {
                await dispatch(verifyOtp(data)).unwrap();
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    const handleResendOtp = useCallback(
        async (data: SendOtpRequest) => {
            try {
                await dispatch(resendOtp(data)).unwrap();
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    const handleResetOtp = useCallback(
        () => {
            dispatch(resetOtpStatus());
        },
        [dispatch]
    );


    return {
        otpVerified,
        otpSent,
        isLoading,
        error,
        sendOtp: handleSendOtp,
        verifyOtp: handleVerifyOtp,
        resendOtp: handleResendOtp,
        resetOtp: handleResetOtp
    };
};

export const usePasswordReset = () => {
    const dispatch = useAppDispatch();
    const {isLoading, error} = useAppSelector(selectAuthStatus);

    const handleForgotPassword = useCallback(
        async (data: ForgotPasswordRequest) => {
            try {
                await dispatch(forgotPassword(data)).unwrap();
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    const handleResetPassword = useCallback(
        async (data: ResetPasswordRequest) => {
            try {
                await dispatch(resetPassword(data)).unwrap();
                return true;
            } catch {
                return false;
            }
        },
        [dispatch]
    );

    return {
        isLoading,
        error,
        forgotPassword: handleForgotPassword,
        resetPassword: handleResetPassword
    };
};

export const useAuthError = () => {
    const dispatch = useAppDispatch();
    const {error} = useAppSelector(selectAuthStatus);

    const handleClearError = useCallback(
        () => {
            dispatch(clearError());
        },
        [dispatch]
    );

    return {
        error,
        clearError: handleClearError
    };
};