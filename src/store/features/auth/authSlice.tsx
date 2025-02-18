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
    OtpVerificationRequest, UserProfile,
    ChangePasswordRequest, ChangePasswordOtpRequest, UpdateProfileRequest
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
    profile: UserProfile | null;
    profileLoading: boolean;
    profileError: string | null;
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
    profile: null,
    profileLoading: false,
    profileError: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, {rejectWithValue}) => {
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

// -------------------------------------------
// Thêm các async thunks mới
export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (data: ChangePasswordRequest, {rejectWithValue}) => {
        try {
            const response = await AuthService.changePassword(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Password change failed');
        }
    }
);

export const changePasswordWithOtp = createAsyncThunk(
    'auth/changePasswordWithOtp',
    async (data: ChangePasswordOtpRequest, {rejectWithValue}) => {
        try {
            const response = await AuthService.changePasswordWithOtp(data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Password change failed');
        }
    }
);

export const fetchProfile = createAsyncThunk(
    'auth/fetchProfile',
    async (_, {rejectWithValue}) => {
        try {
            const response = await AuthService.getProfile();
            return response;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch profile');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (data: UpdateProfileRequest, {rejectWithValue}) => {
        try {
            const response = await AuthService.updateProfile(data);
            return response;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
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
            })
        // Change Password
        builder
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Password change failed';
            })

            // Change Password with OTP
            .addCase(changePasswordWithOtp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changePasswordWithOtp.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(changePasswordWithOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Password change failed';
            })

            // Fetch Profile
            .addCase(fetchProfile.pending, (state) => {
                state.profileLoading = true;
                state.profileError = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.profile = action.payload;
                state.profileError = null;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.profileError = action.payload as string || 'Failed to fetch profile';
            })

            // Update Profile
            .addCase(updateProfile.pending, (state) => {
                state.profileLoading = true;
                state.profileError = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.profile = action.payload;
                state.profileError = null;
                // Cập nhật một số thông tin trong user nếu cần
                if (state.user) {
                    state.user = {
                        ...state.user,
                        fullName: action.payload.fullName,
                        email: action.payload.email,
                    };
                }
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.profileError = action.payload as string || 'Failed to update profile';
            })


        ;
    }
});

export const {
    clearError,
    clearRegistrationData,
    resetOtpStatus,
    setUser
} = authSlice.actions;

export default authSlice.reducer;