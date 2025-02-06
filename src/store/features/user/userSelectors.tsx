import {createSelector} from 'reselect';
import type {RootState} from '../../store';
import type {UserResponse, UserStatus} from '../../../types';

// Basic selectors
export const selectUserState = (state: RootState) => state.user;

export const selectUsers = createSelector(
    selectUserState,
    (state) => state.users
);

export const selectCurrentUser = createSelector(
    selectUserState,
    (state) => state.currentUser
);

export const selectSearchedUser = createSelector(
    selectUserState,
    (state) => state.searchedUser
);

export const selectIsLoading = createSelector(
    selectUserState,
    (state) => state.isLoading
);

export const selectError = createSelector(
    selectUserState,
    (state) => state.error
);

export const selectUserCheckStatus = createSelector(
    selectUserState,
    (state) => state.userCheckStatus
);

// User information selectors
export const selectUserById = createSelector(
    [selectUsers, (_, userId: number) => userId],
    (users, userId) => users.find(user => user.userId === userId) || null
);

export const selectUserByUsername = createSelector(
    [selectUsers, (_, username: string) => username],
    (users, username) => users.find(user => user.username === username) || null
);

export const selectUserByEmail = createSelector(
    [selectUsers, (_, email: string) => email],
    (users, email) => users.find(user => user.email === email) || null
);

// Status-based selectors
export const selectUsersByStatus = createSelector(
    [selectUsers, (_, status: UserStatus) => status],
    (users, status) => users.filter(user => user.status === status)
);

export const selectActiveUsers = createSelector(
    selectUsers,
    (users) => users.filter(user => user.status === 'ACTIVE' as UserStatus)
);

export const selectInactiveUsers = createSelector(
    selectUsers,
    (users) => users.filter(user => user.status === 'INACTIVE' as UserStatus)
);

export const selectPendingUsers = createSelector(
    selectUsers,
    (users) => users.filter(user => user.status === 'PENDING' as UserStatus)
);

export const selectBlockedUsers = createSelector(
    selectUsers,
    (users) => users.filter(user => user.status === 'BLOCKED' as UserStatus)
);

// Role-based selectors
export const selectUsersByRole = createSelector(
    [selectUsers, (_, roleName: string) => roleName],
    (users, roleName) => users.filter(user =>
        user.roles.some(role => role.name === roleName)
    )
);

export const selectCurrentUserRoles = createSelector(
    selectCurrentUser,
    (user) => user?.roles || []
);

// Search and filter selectors
interface UserFilters {
    status?: UserStatus;
    role?: string;
    searchTerm?: string;
}

export const selectFilteredUsers = createSelector(
    [selectUsers, (_, filters: UserFilters) => filters],
    (users, filters) => users.filter(user => {
        const matchesStatus = !filters.status || user.status === filters.status;
        const matchesRole = !filters.role ||
            user.roles.some(role => role.name === filters.role);
        const matchesSearch = !filters.searchTerm ||
            user.username.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            user.fullName.toLowerCase().includes(filters.searchTerm.toLowerCase());

        return matchesStatus && matchesRole && matchesSearch;
    })
);

// Count selectors
interface StatusCount {
    ACTIVE: number;
    INACTIVE: number;
    PENDING: number;
    BLOCKED: number;
}

export const selectUsersCount = createSelector(
    selectUsers,
    (users) => users.length
);

export const selectUsersCountByStatus = createSelector(
    selectUsers,
    (users): StatusCount => ({
        ACTIVE: users.filter(user => user.status === 'ACTIVE').length,
        INACTIVE: users.filter(user => user.status === 'LOCKED').length,
        PENDING: users.filter(user => user.status === 'PENDING').length,
        BLOCKED: users.filter(user => user.status === 'BANNER').length
    })
);

// Availability check selectors
export const selectUsernameAvailability = createSelector(
    selectUserCheckStatus,
    (status) => status.usernameAvailable
);

export const selectEmailAvailability = createSelector(
    selectUserCheckStatus,
    (status) => status.emailAvailable
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
}

export const selectUserOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error
    })
);

// Sort selectors
type SortOrder = 'asc' | 'desc';

export const selectSortedUsers = createSelector(
    [
        selectUsers,
        (_, sortBy: keyof UserResponse) => sortBy,
        (_, __, sortOrder: SortOrder = 'asc') => sortOrder
    ],
    (users, sortBy, sortOrder) => {
        return [...users].sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];

            if (aVal === bVal) return 0;
            if (aVal === undefined || aVal === null) return 1;
            if (bVal === undefined || bVal === null) return -1;

            const comparison = String(aVal).localeCompare(String(bVal));
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }
);

// Last login selectors
export const selectRecentlyActiveUsers = createSelector(
    selectUsers,
    (users) => [...users]
        .filter(user => user.lastLoginAt)
        .sort((a, b) => {
            const dateA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
            const dateB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
            return dateB - dateA;
        })
);