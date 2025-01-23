import { createSelector } from 'reselect';
import { RootState } from '../../store';

// Basic selectors
export const selectAuthState = (state: RootState) => state.auth;
export const selectUser = createSelector(selectAuthState, (auth) => auth.user);
export const selectIsAuthenticated = createSelector(selectAuthState, (auth) => auth.isAuthenticated);
export const selectIsLoading = createSelector(selectAuthState, (auth) => auth.isLoading);
export const selectAuthError = createSelector(selectAuthState, (auth) => auth.error);
export const selectRegistrationSuccess = createSelector(selectAuthState, (auth) => auth.registrationSuccess);
export const selectRegistrationData = createSelector(selectAuthState, (auth) => auth.registrationData);
export const selectOtpVerified = createSelector(selectAuthState, (auth) => auth.otpVerified);
export const selectOtpSent = createSelector(selectAuthState, (auth) => auth.otpSent);

// Compound selectors (memoized)
export const selectUserRoles = createSelector(
    selectUser,
    (user) => user?.roles || []
);

export const selectUserPermissions = createSelector(
    selectUser,
    (user) => user?.permissions || []
);

export const selectUserEmail = createSelector(
    selectUser,
    (user) => user?.email || null
);

export const selectUserFullName = createSelector(
    selectUser,
    (user) => user?.fullName || null
);

export const selectUserId = createSelector(
    selectUser,
    (user) => user?.userId || null
);

// Auth status selector (memoized)
export const selectAuthStatus = createSelector(
    [selectIsAuthenticated, selectIsLoading, selectAuthError],
    (isAuthenticated, isLoading, error) => ({
        isAuthenticated,
        isLoading,
        error,
    })
);
