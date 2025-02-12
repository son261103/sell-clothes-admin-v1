import {createSelector} from 'reselect';
import type {RootState} from '../../store';
import type {UserResponse, UserStatus} from '../../../types';

// Basic selectors
export const selectUserState = (state: RootState) => state.user;

export const selectUsersPage = createSelector(
    selectUserState,
    (state) => state.users
);

export const selectUsersList = createSelector(
    selectUsersPage,
    (users) => users.content
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

// Pagination selectors
export const selectPageInfo = createSelector(
    selectUsersPage,
    (users) => ({
        totalPages: users.totalPages,
        totalElements: users.totalElements,
        size: users.size,
        number: users.number,
        first: users.first,
        last: users.last,
        empty: users.empty
    })
);

// User information selectors
export const selectUserById = createSelector(
    [selectUsersList, (_, userId: number) => userId],
    (users, userId) => users.find(user => user.userId === userId) || null
);

export const selectUserByUsername = createSelector(
    [selectUsersList, (_, username: string) => username],
    (users, username) => users.find(user => user.username === username) || null
);

export const selectUserByEmail = createSelector(
    [selectUsersList, (_, email: string) => email],
    (users, email) => users.find(user => user.email === email) || null
);

// Status-based selectors
export const selectUsersByStatus = createSelector(
    [selectUsersList, (_, status: UserStatus) => status],
    (users, status) => users.filter(user => user.status === status)
);

export const selectActiveUsers = createSelector(
    selectUsersList,
    (users) => users.filter(user => user.status === 'ACTIVE' as UserStatus)
);

export const selectLockedUsers = createSelector(
    selectUsersList,
    (users) => users.filter(user => user.status === 'LOCKED' as UserStatus)
);

export const selectBannedUsers = createSelector(
    selectUsersList,
    (users) => users.filter(user => user.status === 'BANNED' as UserStatus)
);

export const selectPendingUsers = createSelector(
    selectUsersList,
    (users) => users.filter(user => user.status === 'PENDING' as UserStatus)
);

// Role-based selectors
export const selectUsersByRole = createSelector(
    [selectUsersList, (_, roleName: string) => roleName],
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
    [selectUsersList, (_, filters: UserFilters) => filters],
    (users, filters) => {
        if (!filters) return users;

        return users.filter(user => {
            const matchesStatus = !filters.status || user.status === filters.status;
            const matchesRole = !filters.role ||
                user.roles.some(role => role.name === filters.role);
            const matchesSearch = !filters.searchTerm ||
                user.username.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                (user.fullName && user.fullName.toLowerCase().includes(filters.searchTerm.toLowerCase()));

            return matchesStatus && matchesRole && matchesSearch;
        });
    }
);

// Count selectors
export const selectUsersCount = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.totalElements
);

export const selectUsersCountByStatus = createSelector(
    selectUsersList,
    (users) => ({
        ACTIVE: users.filter(user => user.status === 'ACTIVE').length,
        LOCKED: users.filter(user => user.status === 'LOCKED').length,
        BANNER: users.filter(user => user.status === 'BANNER').length,
        PENDING: users.filter(user => user.status === 'PENDING').length
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
        selectUsersList,
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

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }

            if (aVal instanceof Date && bVal instanceof Date) {
                return sortOrder === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
            }

            const comparison = String(aVal).localeCompare(String(bVal));
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }
);

// Last login selectors
export const selectRecentlyActiveUsers = createSelector(
    selectUsersList,
    (users) => [...users]
        .filter(user => user.lastLoginAt)
        .sort((a, b) => {
            const dateA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
            const dateB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
            return dateB - dateA;
        })
);

// User check message selector
export const selectUserCheckMessage = createSelector(
    selectUserCheckStatus,
    (status) => status.message
);

// Empty state selector
export const selectIsUsersEmpty = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.empty
);

// Pagination status selectors
export const selectIsFirstPage = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.first
);

export const selectIsLastPage = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.last
);

export const selectCurrentPage = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.number
);

export const selectPageSize = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.size
);

export const selectTotalPages = createSelector(
    selectPageInfo,
    (pageInfo) => pageInfo.totalPages
);

// user role selectors
export const selectUserRoles = createSelector(
    [selectUsersList, (_, userId: number) => userId],
    (users, userId) => {
        const user = users.find(user => user.userId === userId);
        return user?.roles || [];
    }
);

export const selectUserRoleIds = createSelector(
    selectUserRoles,
    (roles) => new Set(roles.map(role => role.roleId))
);

export const selectUserRoleNames = createSelector(
    selectUserRoles,
    (roles) => roles.map(role => role.name)
);


// Role modification status selectors
export const selectRoleModificationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error) => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error
    })
);
