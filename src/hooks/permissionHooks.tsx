import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
    fetchAllPermissions,
    fetchPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
    getPermissionsByGroup,
    clearError,
    clearCurrentPermission,
    addPermissionToRole,
    updateRolePermissions, clearGroupPermissions
} from '../store/features/permission/permissionSlice';

import {
    selectPermissionsPage,
    selectPermissionsList,
    selectCurrentPermission,
    selectError,
    selectPermissionOperationStatus,
    selectFilteredPermissions,
    selectPermissionsCountByGroup,
    selectPermissionById,
    selectPermissionByCodeName,
    selectPermissionsByGroupName,
    selectUniqueGroupNames,
    selectPermissionsCount,
    selectSortedPermissions,
    selectPageInfo,
    selectIsFirstPage,
    selectIsLastPage,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectIsPermissionsEmpty,
    selectRecentlyCreatedPermissions, selectGroupPermissionsList, selectIsGroupPermissionsEmpty
} from '../store/features/permission/permissionSelectors';

import type {
    PermissionCreateRequest,
    PermissionUpdateRequest,
    PermissionResponse,
    PageRequest,
    PermissionFilters
} from '../types';

// Main permission management hook
export const usePermissions = () => {
    const dispatch = useAppDispatch();
    const permissionsPage = useAppSelector(selectPermissionsPage);
    const permissionsList = useAppSelector(selectPermissionsList);
    const {isLoading, error} = useAppSelector(selectPermissionOperationStatus);
    const permissionsCountByGroup = useAppSelector(selectPermissionsCountByGroup);
    const pageInfo = useAppSelector(selectPageInfo);

    const handleFetchAllPermissions = useCallback(async (
        pageRequest: PageRequest = {page: 0, size: 10, sort: 'permissionId'},
        filters: PermissionFilters = {}
    ) => {
        try {
            await dispatch(fetchAllPermissions({pageRequest, filters})).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreatePermission = useCallback(async (
        permissionData: PermissionCreateRequest
    ) => {
        try {
            const result = await dispatch(createPermission(permissionData)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdatePermission = useCallback(async (
        id: number,
        permissionData: PermissionUpdateRequest
    ) => {
        try {
            await dispatch(updatePermission({id, permissionData})).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeletePermission = useCallback(async (id: number) => {
        try {
            await dispatch(deletePermission(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        permissionsPage,
        permissionsList,
        isLoading,
        error,
        permissionsCountByGroup,
        pageInfo,
        fetchAllPermissions: handleFetchAllPermissions,
        createPermission: handleCreatePermission,
        updatePermission: handleUpdatePermission,
        deletePermission: handleDeletePermission
    };
};

// Hook for finding specific permissions
export const usePermissionFinder = (permissionId?: number, codeName?: string) => {
    const dispatch = useAppDispatch();
    const {isLoading, error} = useAppSelector(selectPermissionOperationStatus);
    const foundById = useAppSelector(
        permissionId ? (state => selectPermissionById(state, permissionId)) : () => null
    );
    const foundByCodeName = useAppSelector(
        codeName ? (state => selectPermissionByCodeName(state, codeName)) : () => null
    );

    const handleFetchPermissionById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchPermissionById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        foundById,
        foundByCodeName,
        fetchPermissionById: handleFetchPermissionById
    };
};

// Hook for group-based operations
export const usePermissionGroups = (groupName?: string) => {
    const dispatch = useAppDispatch();
    const permissionsByGroup = useAppSelector(
        groupName ? (state => selectPermissionsByGroupName(state, groupName)) : selectPermissionsList
    );
    const uniqueGroupNames = useAppSelector(selectUniqueGroupNames);
    const {isLoading, error} = useAppSelector(selectPermissionOperationStatus);

    const handleGetPermissionsByGroup = useCallback(async (groupName: string) => {
        try {
            await dispatch(getPermissionsByGroup(groupName)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        permissionsByGroup,
        uniqueGroupNames,
        isLoading,
        error,
        getPermissionsByGroup: handleGetPermissionsByGroup
    };
};

// Hook for permission statistics
export const usePermissionStats = () => {
    const totalPermissions = useAppSelector(selectPermissionsCount);
    const permissionsCountByGroup = useAppSelector(selectPermissionsCountByGroup);
    const isEmpty = useAppSelector(selectIsPermissionsEmpty);

    return {
        totalPermissions,
        permissionsCountByGroup,
        isEmpty
    };
};

// Hook for sorted permission lists
export const useSortedPermissions = (
    sortBy?: keyof PermissionResponse,
    sortOrder: 'asc' | 'desc' = 'asc'
) => {
    const sortedPermissions = useAppSelector(
        sortBy ? (state => selectSortedPermissions(state, sortBy, sortOrder)) : selectPermissionsList
    );
    const recentlyCreated = useAppSelector(selectRecentlyCreatedPermissions);

    return {
        sortedPermissions,
        recentlyCreated
    };
};

// Hook for current permission management
export const useCurrentPermission = () => {
    const dispatch = useAppDispatch();
    const currentPermission = useAppSelector(selectCurrentPermission);
    const {isLoading, error} = useAppSelector(selectPermissionOperationStatus);

    const handleFetchPermissionById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchPermissionById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleClearCurrentPermission = useCallback(() => {
        dispatch(clearCurrentPermission());
    }, [dispatch]);

    return {
        currentPermission,
        isLoading,
        error,
        fetchPermissionById: handleFetchPermissionById,
        clearCurrentPermission: handleClearCurrentPermission
    };
};

// Hook for permission filtering
export const usePermissionFilters = (filters: PermissionFilters = {}) => {
    const filteredPermissions = useAppSelector(state => selectFilteredPermissions(state, filters));
    const {isLoading, error} = useAppSelector(selectPermissionOperationStatus);
    const isEmpty = useAppSelector(selectIsPermissionsEmpty);

    return {
        filteredPermissions,
        isLoading,
        error,
        isEmpty
    };
};

// Hook for pagination
export const usePermissionPagination = () => {
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

export const useGroupPermissions = () => {
    const dispatch = useAppDispatch();
    const groupPermissionsList = useAppSelector(selectGroupPermissionsList);
    const isGroupEmpty = useAppSelector(selectIsGroupPermissionsEmpty);
    const {isLoading, error} = useAppSelector(selectPermissionOperationStatus);

    const handleGetPermissionsByGroup = useCallback(async (groupName: string) => {
        try {
            await dispatch(getPermissionsByGroup(groupName)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleClearGroupPermissions = useCallback(() => {
        dispatch(clearGroupPermissions());
    }, [dispatch]);

    return {
        groupPermissionsList,
        isGroupEmpty,
        isLoading,
        error,
        getPermissionsByGroup: handleGetPermissionsByGroup,
        clearGroupPermissions: handleClearGroupPermissions
    };
};


// Hook for role-permission operations
export const useRolePermissionOperations = () => {
    const dispatch = useAppDispatch();
    const {isLoading, error} = useAppSelector(selectPermissionOperationStatus);

    const handleAddPermissionToRole = useCallback(async (
        roleId: number,
        permissionId: number
    ) => {
        try {
            await dispatch(addPermissionToRole({roleId, permissionId})).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleUpdateRolePermissions = useCallback(async (
        roleId: number,
        permissionIds: Set<number>
    ) => {
        try {
            await dispatch(updateRolePermissions({roleId, permissionIds})).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        addPermissionToRole: handleAddPermissionToRole,
        updateRolePermissions: handleUpdateRolePermissions
    };
};


// Hook for error handling
export const usePermissionError = () => {
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