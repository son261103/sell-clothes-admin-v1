import { createSelector } from 'reselect';
import type { RootState } from '../../store';
import type { PermissionResponse } from '../../../types';

// Basic selectors
export const selectPermissionState = (state: RootState) => state.permission;

export const selectPermissionsPage = createSelector(
    [selectPermissionState],
    (state) => ({
        content: state.permissions.content,
        totalPages: state.permissions.totalPages,
        totalElements: state.permissions.totalElements,
        size: state.permissions.size,
        number: state.permissions.number,
        first: state.permissions.first,
        last: state.permissions.last,
        empty: state.permissions.empty
    })
);

export const selectPermissionsList = createSelector(
    [selectPermissionsPage],
    (permissions) => permissions.content.map(permission => ({
        ...permission,
        displayName: `${permission.groupName} - ${permission.name}`
    }))
);

export const selectCurrentPermission = createSelector(
    [selectPermissionState],
    (state) => state.currentPermission ? {
        ...state.currentPermission,
        displayName: `${state.currentPermission.groupName} - ${state.currentPermission.name}`
    } : null
);

export const selectGroupPermissions = createSelector(
    [selectPermissionState],
    (state) => state.groupPermissions.map(permission => ({
        ...permission,
        displayName: `${permission.groupName} - ${permission.name}`
    }))
);

export const selectIsLoading = createSelector(
    [selectPermissionState],
    (state) => state.isLoading
);

export const selectError = createSelector(
    [selectPermissionState],
    (state) => state.error
);

// Pagination selectors
export const selectPageInfo = createSelector(
    [selectPermissionsPage],
    (permissions) => ({
        totalPages: permissions.totalPages,
        totalElements: permissions.totalElements,
        size: permissions.size,
        number: permissions.number,
        first: permissions.first,
        last: permissions.last,
        empty: permissions.empty,
        hasNext: !permissions.last,
        hasPrevious: !permissions.first
    })
);

// Permission information selectors
export const selectPermissionById = createSelector(
    [selectPermissionsList, (_: RootState, permissionId: number) => permissionId],
    (permissions, permissionId) => {
        const found = permissions.find(p => p.permissionId === permissionId);
        return found ? {
            ...found,
            formattedId: `PERM-${permissionId}`
        } : null;
    }
);

export const selectPermissionByCodeName = createSelector(
    [selectPermissionsList, (_: RootState, codeName: string) => codeName],
    (permissions, codeName) => {
        const found = permissions.find(p => p.codeName === codeName);
        return found ? {
            ...found,
            formattedCodeName: codeName.toUpperCase()
        } : null;
    }
);

// Group-based selectors
export const selectPermissionsByGroupName = createSelector(
    [selectPermissionsList, (_: RootState, groupName: string) => groupName],
    (permissions, groupName) => permissions
        .filter(p => p.groupName === groupName)
        .map(p => ({
            ...p,
            groupDisplayName: `Group: ${groupName}`,
            permissionCount: permissions.filter(op => op.groupName === groupName).length
        }))
);

export const selectUniqueGroupNames = createSelector(
    [selectPermissionsList],
    (permissions) => {
        const uniqueGroups = Array.from(new Set(permissions.map(p => p.groupName)));
        return uniqueGroups.map(group => ({
            name: group,
            count: permissions.filter(p => p.groupName === group).length
        }));
    }
);

// Search and filter selectors
interface PermissionFilters {
    groupName?: string;
    searchTerm?: string;
}

export const selectFilteredPermissions = createSelector(
    [selectPermissionsList, (_: RootState, filters: PermissionFilters) => filters],
    (permissions, filters) => {
        if (!filters) {
            return permissions.map(p => ({ ...p, matchScore: 0 }));
        }

        return permissions.filter(permission => {
            const matchesGroup = !filters.groupName ||
                permission.groupName.toLowerCase() === filters.groupName.toLowerCase();

            const searchTerm = filters.searchTerm?.toLowerCase();
            const matchesSearch = !searchTerm ||
                permission.name.toLowerCase().includes(searchTerm) ||
                permission.codeName.toLowerCase().includes(searchTerm) ||
                (permission.description?.toLowerCase().includes(searchTerm));

            return matchesGroup && matchesSearch;
        }).map(permission => {
            let matchScore = 0;
            if (filters.searchTerm) {
                const searchTerm = filters.searchTerm.toLowerCase();
                if (permission.name.toLowerCase().includes(searchTerm)) matchScore += 3;
                if (permission.codeName.toLowerCase().includes(searchTerm)) matchScore += 2;
                if (permission.description?.toLowerCase().includes(searchTerm)) matchScore += 1;
            }
            return { ...permission, matchScore };
        });
    }
);

// Count selectors
export const selectPermissionsCount = createSelector(
    [selectPageInfo],
    (pageInfo) => ({
        total: pageInfo.totalElements,
        displayText: `Total: ${pageInfo.totalElements} permissions`
    })
);

export const selectPermissionsCountByGroup = createSelector(
    [selectPermissionsList],
    (permissions = []) => {
        const counts: { [key: string]: number } = {};
        permissions.forEach(permission => {
            if (permission.groupName) {
                counts[permission.groupName] = (counts[permission.groupName] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([groupName, count]) => ({
            groupName,
            count,
            percentage: (count / permissions.length * 100).toFixed(1)
        }));
    }
);

// Operation status selectors
interface OperationStatus {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    statusText: string;
}

export const selectPermissionOperationStatus = createSelector(
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

export const selectSortedPermissions = createSelector(
    [
        selectPermissionsList,
        (_: RootState, sortBy: keyof PermissionResponse) => sortBy,
        (_: RootState, __: keyof PermissionResponse, sortOrder: SortOrder = 'asc') => sortOrder
    ],
    (permissions, sortBy, sortOrder) => {
        return [...permissions]
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
            .map((p, index) => ({
                ...p,
                sortIndex: index + 1,
                sortedBy: sortBy
            }));
    }
);

// Empty state selector
export const selectIsPermissionsEmpty = createSelector(
    [selectPageInfo, selectPermissionsList],
    (pageInfo, permissions) => ({
        isEmpty: pageInfo.empty || permissions.length === 0,
        message: pageInfo.empty ? 'No permissions found' : 'Permissions available'
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
export const selectRecentlyCreatedPermissions = createSelector(
    [selectPermissionsList],
    (permissions) => [...permissions]
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        })
        .slice(0, 5)
        .map(p => ({
            ...p,
            formattedCreatedAt: new Date(p.createdAt).toLocaleDateString(),
            isRecent: new Date().getTime() - new Date(p.createdAt).getTime() < 24 * 60 * 60 * 1000
        }))
);

// Group permissions selectors
export const selectGroupPermissionsList = createSelector(
    [selectGroupPermissions],
    (permissions) => permissions.map(permission => ({
        ...permission,
        displayName: `${permission.groupName} - ${permission.name}`,
        formattedCreatedAt: new Date(permission.createdAt).toLocaleDateString()
    }))
);

export const selectIsGroupPermissionsEmpty = createSelector(
    [selectGroupPermissions],
    (permissions) => ({
        isEmpty: permissions.length === 0,
        message: permissions.length === 0 ? 'No group permissions found' : 'Group permissions available'
    })
);