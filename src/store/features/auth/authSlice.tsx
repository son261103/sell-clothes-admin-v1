// authSlice.tsx
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import AuthService from '../../../services/authService.tsx';
import type {
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    RegisterResponse,
    SendOtpRequest,
    OtpVerificationRequest
} from '../../../types';

interface AuthState {
    user: TokenResponse | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    registrationSuccess: boolean;
    registrationData: RegisterResponse | null;
    otpVerified: boolean;
    otpSent: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    registrationSuccess: false,
    registrationData: null,
    otpVerified: false,
    otpSent: false,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await AuthService.login(credentials);

            if (!response?.accessToken) {
                return rejectWithValue('Missing access token in response');
            }
            return response;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async ({data, otp}: { data: RegisterRequest; otp?: string }) => {
        const response = await AuthService.register(data, otp);
        return response.data;
    }
);

export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async (data: SendOtpRequest) => {
        const response = await AuthService.sendOtp(data);
        return response;
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (data: OtpVerificationRequest) => {
        const response = await AuthService.verifyOtp(data);
        return response.data;
    }
);

export const resendOtp = createAsyncThunk(
    'auth/resendOtp',
    async (data: SendOtpRequest) => {
        const response = await AuthService.resendOtp(data);
        return response;
    }
);

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (data: ForgotPasswordRequest) => {
        const response = await AuthService.forgotPassword(data);
        return response;
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (data: ResetPasswordRequest) => {
        const response = await AuthService.resetPassword(data);
        return response;
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, {rejectWithValue}) => {
        try {
            const response = await AuthService.logout();
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearRegistrationData: (state) => {
            state.registrationData = null;
            state.registrationSuccess = false;
        },
        resetOtpStatus: (state) => {
            state.otpSent = false;
            state.otpVerified = false;
        },
        setUser: (state, action: PayloadAction<TokenResponse>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string || 'Login failed';
            })

            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.registrationSuccess = true;
                state.registrationData = action.payload;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.registrationSuccess = false;
                state.error = action.error.message || 'Registration failed';
            })

            // Send OTP
            .addCase(sendOtp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendOtp.fulfilled, (state) => {
                state.isLoading = false;
                state.otpSent = true;
                state.error = null;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.otpSent = false;
                state.error = action.error.message || 'Failed to send OTP';
            })

            // Verify OTP
            .addCase(verifyOtp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state) => {
                state.isLoading = false;
                state.otpVerified = true;
                state.error = null;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.otpVerified = false;
                state.error = action.error.message || 'OTP verification failed';
            })

            // Resend OTP
            .addCase(resendOtp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resendOtp.fulfilled, (state) => {
                state.isLoading = false;
                state.otpSent = true;
                state.error = null;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to resend OTP';
            })

            // Forgot Password
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Password reset request failed';
            })

            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Password reset failed';
            })

            // Logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, () => {
                return {
                    ...initialState,
                    isLoading: false
                };
            })
            .addCase(logout.rejected, (_, action) => {
                return {
                    ...initialState,
                    error: action.payload ? String(action.payload) : 'Logout failed'
                };
            });
    }
});

export const {
    clearError,
    clearRegistrationData,
    resetOtpStatus,
    setUser
} = authSlice.actions;

export default authSlice.reducer;