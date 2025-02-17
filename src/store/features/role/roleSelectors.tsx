import {createSelector} from 'reselect';
import type {RootState} from '../../store';
import type {RoleResponse} from '../../../types';

// Basic selectors
export const selectRoleState = (state: RootState) => state.role;

export const selectRolesPage = createSelector(
    [selectRoleState],
    (state) => ({
        content: state.roles.content,
        totalPages: state.roles.totalPages,
        totalElements: state.roles.totalElements,
        size: state.roles.size,
        number: state.roles.number,
        first: state.roles.first,
        last: state.roles.last,
        empty: state.roles.empty
    })
);

export const selectRolesList = createSelector(
    [selectRolesPage],
    (roles) => roles.content.map(role => ({
        ...role,
        displayName: role.name,
        formattedId: `ROLE-${role.roleId}`
    }))
);

export const selectCurrentRole = createSelector(
    [selectRoleState],
    (state) => state.currentRole ? {
        ...state.currentRole,
        displayName: state.currentRole.name,
        formattedId: `ROLE-${state.currentRole.roleId}`
    } : null
);

export const selectRolePermissions = createSelector(
    [selectRoleState],
    (state) => state.rolePermissions.map(permission => ({
        ...permission,
        displayName: `${permission.groupName} - ${permission.name}`
    }))
);

export const selectIsLoading = createSelector(
    [selectRoleState],
    (state) => state.isLoading
);

export const selectError = createSelector(
    [selectRoleState],
    (state) => state.error
);

// Pagination selectors
export const selectPageInfo = createSelector(
    [selectRolesPage],
    (roles) => ({
        totalPages: roles.totalPages,
        totalElements: roles.totalElements,
        size: roles.size,
        number: roles.number,
        first: roles.first,
        last: roles.last,
        empty: roles.empty,
        hasNext: !roles.last,
        hasPrevious: !roles.first
    })
);

// Role information selectors
export const selectRoleById = createSelector(
    [selectRolesList, (_: RootState, roleId: number) => roleId],
    (roles, roleId) => {
        const found = roles.find(r => r.roleId === roleId);
        return found ? {
            ...found,
            formattedId: `ROLE-${roleId}`
        } : null;
    }
);

export const selectRoleByName = createSelector(
    [selectRolesList, (_: RootState, name: string) => name],
    (roles, name) => {
        const found = roles.find(r => r.name.toLowerCase() === name.toLowerCase());
        return found ? {
            ...found,
            formattedName: name.toUpperCase()
        } : null;
    }
);

// Search and filter selectors
interface RoleFilters {
    searchTerm?: string;
    isActive?: boolean;
}

export const selectFilteredRoles = createSelector(
    [selectRolesList, (_: RootState, filters: RoleFilters) => filters],
    (roles, filters) => {
        if (!filters) {
            return roles.map(r => ({...r, matchScore: 0}));
        }

        return roles.filter(role => {
            const searchTerm = filters.searchTerm?.toLowerCase();
            const matchesSearch = !searchTerm ||
                role.name.toLowerCase().includes(searchTerm) ||
                role.description?.toLowerCase().includes(searchTerm);

            // Remove the isActive check since it's not part of our role structure
            return matchesSearch;
        }).map(role => {
            let matchScore = 0;
            if (filters.searchTerm) {
                const searchTerm = filters.searchTerm.toLowerCase();
                if (role.name.toLowerCase().includes(searchTerm)) matchScore += 3;
                if (role.description?.toLowerCase().includes(searchTerm)) matchScore += 1;
            }
            return {...role, matchScore};
        });
    }
);

// Count selectors
export const selectRolesCount = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalElements,
        displayText: `Total: ${pageInfo.totalElements} roles`
    })
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    statusText: string;
}

export const selectRoleOperationStatus = createSelector(
    [selectIsLoading, selectError],
    (isLoading, error): OperationStatus => ({
        isLoading,
        error,
        isSuccess: !isLoading && !error,
        statusText: isLoading ? 'Loading...' : error ? 'Error occurred' : 'Success'
    })
);

// Sort selectors
type SortOrder = 'asc' | 'desc';

export const selectSortedRoles = createSelector(
    [
        selectRolesList,
        (_: RootState, sortBy: keyof RoleResponse) => sortBy,
        (_: RootState, __: keyof RoleResponse, sortOrder: SortOrder = 'asc') => sortOrder
    ],
    (roles, sortBy, sortOrder) => {
        return [...roles]
            .sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];

                if (aVal === bVal) return 0;
                if (aVal === undefined || aVal === null) return 1;
                if (bVal === undefined || bVal === null) return -1;

                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                }

                const comparison = String(aVal).localeCompare(String(bVal));
                return sortOrder === 'asc' ? comparison : -comparison;
            })
            .map((r, index) => ({
                ...r,
                sortIndex: index + 1,
                sortedBy: sortBy
            }));
    }
);

// Empty state selector
export const selectIsRolesEmpty = createSelector(
    [selectPageInfo, selectRolesList],
    (pageInfo, roles) => ({
        isEmpty: pageInfo.empty || roles.length === 0,
        message: pageInfo.empty ? 'No roles found' : 'Roles available'
    })
);

// Pagination status selectors
export const selectIsFirstPage = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        isFirst: pageInfo.first,
        canNavigatePrevious: !pageInfo.first
    })
);

export const selectIsLastPage = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        isLast: pageInfo.last,
        canNavigateNext: !pageInfo.last
    })
);

export const selectCurrentPage = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        current: pageInfo.number,
        displayText: `Page ${pageInfo.number + 1} of ${pageInfo.totalPages}`
    })
);

export const selectPageSize = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        size: pageInfo.size,
        displayText: `Showing ${pageInfo.size} items per page`
    })
);

export const selectTotalPages = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalPages,
        displayText: `Total pages: ${pageInfo.totalPages}`
    })
);

// Creation date selectors
export const selectRecentlyCreatedRoles = createSelector(
    [selectRolesList],
    (roles) => [...roles]
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        })
        .slice(0, 5)
        .map(r => ({
            ...r,
            formattedCreatedAt: new Date(r.createdAt).toLocaleDateString(),
            isRecent: new Date().getTime() - new Date(r.createdAt).getTime() < 24 * 60 * 60 * 1000
        }))
);

// Role permissions selectors
export const selectRolePermissionsList = createSelector(
    [selectRolePermissions],
    (permissions) => permissions.map(permission => ({
        ...permission,
        displayName: `${permission.groupName} - ${permission.name}`,
        formattedCreatedAt: new Date(permission.createdAt).toLocaleDateString()
    }))
);

export const selectIsRolePermissionsEmpty = createSelector(
    [selectRolePermissions],
    (permissions) => ({
        isEmpty: permissions.length === 0,
        message: permissions.length === 0 ? 'No role permissions found' : 'Role permissions available'
    })
);