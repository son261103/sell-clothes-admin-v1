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
    resetUserCheckStatus,
    addRoleToUser,
    removeRoleFromUser,
    updateUserRoles,
    removeMultipleRolesFromUser
} from '../store/features/user/userSlice';
import {
    selectUsersPage,
    selectUsersList,
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
    selectLockedUsers,
    selectBannedUsers,
    selectPendingUsers,
    selectUsersByRole,
    selectCurrentUserRoles,
    selectUsersCount,
    selectUsernameAvailability,
    selectEmailAvailability,
    selectSortedUsers,
    selectRecentlyActiveUsers,
    selectPageInfo,
    selectIsFirstPage,
    selectIsLastPage,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectIsUsersEmpty,
    selectUserCheckMessage,
    selectUserRoles,
    selectUserRoleIds,
    selectUserRoleNames,
    selectRoleModificationStatus
} from '../store/features/user/userSelectors';
import type {
    UserCreateRequest,
    UserUpdateRequest,
    UserResponse,
    UserStatus,
    PageRequest,
    UserFilters
} from '../types';

// Main user management hook
export const useUsers = () => {
    const dispatch = useAppDispatch();
    const usersPage = useAppSelector(selectUsersPage);
    const usersList = useAppSelector(selectUsersList);
    const { isLoading, error } = useAppSelector(selectUserOperationStatus);
    const usersCountByStatus = useAppSelector(selectUsersCountByStatus);
    const pageInfo = useAppSelector(selectPageInfo);

    const handleFetchAllUsers = useCallback(async (
        pageRequest: PageRequest = { page: 0, size: 10, sort: 'userId' },
        filters: UserFilters = {}
    ) => {
        try {
            await dispatch(fetchAllUsers({ pageRequest, filters })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateUser = useCallback(async (userData: UserCreateRequest): Promise<UserResponse | null> => {
        try {
            const result = await dispatch(createUser(userData)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateUser = useCallback(async (
        id: number,
        userData: UserUpdateRequest
    ) => {
        try {
            await dispatch(updateUser({ id, userData })).unwrap();
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
        usersPage,
        usersList,
        isLoading,
        error,
        usersCountByStatus,
        pageInfo,
        fetchAllUsers: handleFetchAllUsers,
        createUser: handleCreateUser,
        updateUser: handleUpdateUser,
        deleteUser: handleDeleteUser,
        updateUserStatus: handleUpdateUserStatus
    };
};

// Hook for finding specific users
export const useUserFinder = (userId?: number, username?: string, email?: string) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(selectUserOperationStatus);
    const foundById = useAppSelector(userId ? (state => selectUserById(state, userId)) : () => null);
    const foundByUsername = useAppSelector(username ? (state => selectUserByUsername(state, username)) : () => null);
    const foundByEmail = useAppSelector(email ? (state => selectUserByEmail(state, email)) : () => null);

    const handleFetchUserById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchUserById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

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

    return {
        isLoading,
        error,
        foundById,
        foundByUsername,
        foundByEmail,
        fetchUserById: handleFetchUserById,
        getUserByUsername: handleGetUserByUsername,
        getUserByEmail: handleGetUserByEmail
    };
};

// Hook for user status filtering
export const useUserStatusFilters = (status?: UserStatus) => {
    const filteredByStatus = useAppSelector(status ? (state => selectUsersByStatus(state, status)) : selectUsersList);
    const activeUsers = useAppSelector(selectActiveUsers);
    const lockedUsers = useAppSelector(selectLockedUsers);
    const bannedUsers = useAppSelector(selectBannedUsers);
    const pendingUsers = useAppSelector(selectPendingUsers);

    return {
        filteredByStatus,
        activeUsers,
        lockedUsers,
        bannedUsers,
        pendingUsers
    };
};

// Hook for role-based operations
export const useUserRoles = (roleName?: string) => {
    const usersByRole = useAppSelector(roleName ? (state => selectUsersByRole(state, roleName)) : selectUsersList);
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
    const usersCountByStatus = useAppSelector(selectUsersCountByStatus);
    const isEmpty = useAppSelector(selectIsUsersEmpty);

    return {
        totalUsers,
        usernameAvailable,
        emailAvailable,
        usersCountByStatus,
        isEmpty
    };
};

// Hook for sorted user lists
export const useSortedUsers = (sortBy?: keyof UserResponse, sortOrder: 'asc' | 'desc' = 'asc') => {
    const sortedUsers = useAppSelector(
        sortBy ? (state => selectSortedUsers(state, sortBy, sortOrder)) : selectUsersList
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
        console.log(`[useCurrentUser] ccccc Fetching user by ID: ${id}`);
        try {
            await dispatch(fetchUserById(id)).unwrap();
            console.log(`[useCurrentUser]  cccc   Successfully fetched user with ID: ${id}`);
            return true;
        } catch (err) {
            console.error(`[useCurrentUser] Failed to fetch user with ID: ${id}`, err);
            return false;
        }
    }, [dispatch]);

    const handleClearCurrentUser = useCallback(() => {
        console.log("[useCurrentUser] Clearing current user");
        dispatch(clearCurrentUser());
    }, [dispatch]);

    const handleUpdateLastLogin = useCallback(async (userId: number) => {
        console.log(`[useCurrentUser] Updating last login for user ID: ${userId}`);
        try {
            await dispatch(updateLastLogin(userId)).unwrap();
            console.log(`[useCurrentUser] Successfully updated last login for user ID: ${userId}`);
            return true;
        } catch (err) {
            console.error(`[useCurrentUser] Failed to update last login for user ID: ${userId}`, err);
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
    const { isLoading, error } = useAppSelector(selectUserOperationStatus);
    const isEmpty = useAppSelector(selectIsUsersEmpty);

    return {
        filteredUsers,
        isLoading,
        error,
        isEmpty
    };
};

// Hook for username/email availability checking
export const useUserAvailability = () => {
    const dispatch = useAppDispatch();
    const userCheckStatus = useAppSelector(selectUserCheckStatus);
    const { isLoading, error } = useAppSelector(selectUserOperationStatus);
    const checkMessage = useAppSelector(selectUserCheckMessage);

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
        checkMessage,
        checkUsername: handleCheckUsername,
        checkEmail: handleCheckEmail,
        resetCheckStatus: handleResetCheckStatus
    };
};

// Hook for pagination
export const usePagination = () => {
    const isFirstPage = useAppSelector(selectIsFirstPage);
    const isLastPage = useAppSelector(selectIsLastPage);
    const currentPage = useAppSelector(selectCurrentPage);
    const pageSize = useAppSelector(selectPageSize);
    const totalPages = useAppSelector(selectTotalPages);
    const pageInfo = useAppSelector(selectPageInfo);

    return {
        isFirstPage,
        isLastPage,
        currentPage,
        pageSize,
        totalPages,
        pageInfo
    };
};

export const useUserRoleOperations = (userId?: number) => {
    const dispatch = useAppDispatch();
    const userRoles = useAppSelector(userId ? state => selectUserRoles(state, userId) : () => []);
    const roleIds = useAppSelector(userId ? state => selectUserRoleIds(state, userId) : () => new Set());
    const roleNames = useAppSelector(userId ? state => selectUserRoleNames(state, userId) : () => []);
    const { isLoading, error, isSuccess } = useAppSelector(selectRoleModificationStatus);

    const handleAddRole = useCallback(async (roleId: number) => {
        if (!userId) return false;
        try {
            await dispatch(addRoleToUser({ userId, roleId })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch, userId]);

    const handleRemoveRole = useCallback(async (roleId: number) => {
        if (!userId) return false;
        try {
            await dispatch(removeRoleFromUser({ userId, roleId })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch, userId]);

    const handleUpdateRoles = useCallback(async (roleIds: Set<number>) => {
        if (!userId) return false;
        try {
            await dispatch(updateUserRoles({ userId, roleIds })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch, userId]);

    const handleRemoveMultipleRoles = useCallback(async (roleIds: Set<number>) => {
        if (!userId) return false;
        try {
            await dispatch(removeMultipleRolesFromUser({ userId, roleIds })).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch, userId]);

    return {
        userRoles,
        roleIds,
        roleNames,
        isLoading,
        error,
        isSuccess,
        addRole: handleAddRole,
        removeRole: handleRemoveRole,
        updateRoles: handleUpdateRoles,
        removeMultipleRoles: handleRemoveMultipleRoles
    };
};

// Hook for role error handling
export const useRoleError = () => {
    const dispatch = useAppDispatch();
    const { error } = useAppSelector(selectRoleModificationStatus);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        error,
        clearError: handleClearError
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