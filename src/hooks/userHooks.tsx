import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    fetchAllUsers,
    fetchUserById,
    getUserByUsername,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    checkUsername,
    checkEmail,
    updateLastLogin,
    clearError,
    clearCurrentUser,
    clearSearchedUser,
    resetUserCheckStatus
} from '../store/features/user/userSlice';
import {
    selectUsers,
    selectCurrentUser,
    selectSearchedUser,
    selectError,
    selectUserCheckStatus,
    selectUserOperationStatus,
    selectFilteredUsers,
    selectUsersCountByStatus,
    selectUserById,
    selectUserByUsername,
    selectUserByEmail,
    selectUsersByStatus,
    selectActiveUsers,
    selectInactiveUsers,
    selectPendingUsers,
    selectBlockedUsers,
    selectUsersByRole,
    selectCurrentUserRoles,
    selectUsersCount,
    selectUsernameAvailability,
    selectEmailAvailability,
    selectSortedUsers,
    selectRecentlyActiveUsers
} from '../store/features/user/userSelectors';
import type {
    UserCreateRequest,
    UserUpdateRequest,
    UserStatus,
    UserResponse
} from '../types';

interface UserFilters {
    status?: UserStatus;
    role?: string;
    searchTerm?: string;
}

// Main user management hook
export const useUsers = () => {
    const dispatch = useAppDispatch();
    const users = useAppSelector(selectUsers);
    const { isLoading, error } = useAppSelector(selectUserOperationStatus);
    const usersCountByStatus = useAppSelector(selectUsersCountByStatus);

    const handleFetchAllUsers = useCallback(async () => {
        try {
            await dispatch(fetchAllUsers()).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateUser = useCallback(async (
        userData: UserCreateRequest,
        avatarFile?: File,
        onProgress?: (progress: number) => void
    ) => {
        try {
            await dispatch(createUser({ userData, avatarFile, onProgress })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleUpdateUser = useCallback(async (
        id: number,
        userData: UserUpdateRequest,
        avatarFile?: File,
        onProgress?: (progress: number) => void
    ) => {
        try {
            await dispatch(updateUser({ id, userData, avatarFile, onProgress })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteUser = useCallback(async (id: number) => {
        try {
            await dispatch(deleteUser(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleUpdateUserStatus = useCallback(async (
        id: number,
        status: UserStatus
    ) => {
        try {
            await dispatch(updateUserStatus({ id, status })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        users,
        isLoading,
        error,
        usersCountByStatus,
        fetchAllUsers: handleFetchAllUsers,
        createUser: handleCreateUser,
        updateUser: handleUpdateUser,
        deleteUser: handleDeleteUser,
        updateUserStatus: handleUpdateUserStatus
    };
};

// Hook for finding specific users
export const useUserFinder = (userId?: number, username?: string, email?: string) => {
    const foundById = useAppSelector(userId ? (state => selectUserById(state, userId)) : () => null);
    const foundByUsername = useAppSelector(username ? (state => selectUserByUsername(state, username)) : () => null);
    const foundByEmail = useAppSelector(email ? (state => selectUserByEmail(state, email)) : () => null);

    return {
        foundById,
        foundByUsername,
        foundByEmail
    };
};

// Hook for user status filtering
export const useUserStatusFilters = (status?: UserStatus) => {
    const filteredByStatus = useAppSelector(status ? (state => selectUsersByStatus(state, status)) : selectUsers);
    const activeUsers = useAppSelector(selectActiveUsers);
    const inactiveUsers = useAppSelector(selectInactiveUsers);
    const pendingUsers = useAppSelector(selectPendingUsers);
    const blockedUsers = useAppSelector(selectBlockedUsers);

    return {
        filteredByStatus,
        activeUsers,
        inactiveUsers,
        pendingUsers,
        blockedUsers
    };
};

// Hook for role-based operations
export const useUserRoles = (roleName?: string) => {
    const usersByRole = useAppSelector(roleName ? (state => selectUsersByRole(state, roleName)) : selectUsers);
    const currentUserRoles = useAppSelector(selectCurrentUserRoles);

    return {
        usersByRole,
        currentUserRoles
    };
};

// Hook for user statistics
export const useUserStats = () => {
    const totalUsers = useAppSelector(selectUsersCount);
    const usernameAvailable = useAppSelector(selectUsernameAvailability);
    const emailAvailable = useAppSelector(selectEmailAvailability);

    return {
        totalUsers,
        usernameAvailable,
        emailAvailable
    };
};

// Hook for sorted user lists
export const useSortedUsers = (sortBy?: keyof UserResponse, sortOrder: 'asc' | 'desc' = 'asc') => {
    const sortedUsers = useAppSelector(
        sortBy ? (state => selectSortedUsers(state, sortBy, sortOrder)) : selectUsers
    );
    const recentlyActiveUsers = useAppSelector(selectRecentlyActiveUsers);

    return {
        sortedUsers,
        recentlyActiveUsers
    };
};

// Hook for current user management
export const useCurrentUser = () => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);
    const { isLoading, error } = useAppSelector(selectUserOperationStatus);

    const handleFetchUserById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchUserById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleClearCurrentUser = useCallback(() => {
        dispatch(clearCurrentUser());
    }, [dispatch]);

    const handleUpdateLastLogin = useCallback(async (userId: number) => {
        try {
            await dispatch(updateLastLogin(userId)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        currentUser,
        isLoading,
        error,
        fetchUserById: handleFetchUserById,
        clearCurrentUser: handleClearCurrentUser,
        updateLastLogin: handleUpdateLastLogin
    };
};

// Hook for user search functionality
export const useUserSearch = () => {
    const dispatch = useAppDispatch();
    const searchedUser = useAppSelector(selectSearchedUser);
    const { isLoading, error } = useAppSelector(selectUserOperationStatus);

    const handleGetUserByUsername = useCallback(async (username: string) => {
        try {
            await dispatch(getUserByUsername(username)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleGetUserByEmail = useCallback(async (email: string) => {
        try {
            await dispatch(getUserByEmail(email)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleClearSearchedUser = useCallback(() => {
        dispatch(clearSearchedUser());
    }, [dispatch]);

    return {
        searchedUser,
        isLoading,
        error,
        getUserByUsername: handleGetUserByUsername,
        getUserByEmail: handleGetUserByEmail,
        clearSearchedUser: handleClearSearchedUser
    };
};

// Hook for user filtering
export const useUserFilters = (filters: UserFilters = {}) => {
    const filteredUsers = useAppSelector(state => selectFilteredUsers(state, filters));

    return {
        filteredUsers
    };
};

// Hook for username/email availability checking
export const useUserAvailability = () => {
    const dispatch = useAppDispatch();
    const userCheckStatus = useAppSelector(selectUserCheckStatus);
    const { isLoading, error } = useAppSelector(selectUserOperationStatus);

    const handleCheckUsername = useCallback(async (username: string) => {
        try {
            await dispatch(checkUsername(username)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCheckEmail = useCallback(async (email: string) => {
        try {
            await dispatch(checkEmail(email)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleResetCheckStatus = useCallback(() => {
        dispatch(resetUserCheckStatus());
    }, [dispatch]);

    return {
        isLoading,
        error,
        userCheckStatus,
        checkUsername: handleCheckUsername,
        checkEmail: handleCheckEmail,
        resetCheckStatus: handleResetCheckStatus
    };
};

// Hook for error handling
export const useUserError = () => {
    const dispatch = useAppDispatch();
    const error = useAppSelector(selectError);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        error,
        clearError: handleClearError
    };
};