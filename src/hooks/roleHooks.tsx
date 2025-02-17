import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {
    fetchAllRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    clearError,
    clearCurrentRole
} from '../store/features/role/roleSlice';

import {
    selectRolesPage,
    selectRolesList,
    selectCurrentRole,
    selectError,
    selectRoleOperationStatus,
    selectFilteredRoles,
    selectRoleById,
    selectRoleByName,
    selectRolesCount,
    selectSortedRoles,
    selectPageInfo,
    selectIsFirstPage,
    selectIsLastPage,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectIsRolesEmpty,
    selectRecentlyCreatedRoles,
    selectRolePermissionsList,
    selectIsRolePermissionsEmpty
} from '../store/features/role/roleSelectors';

import {
    RoleCreateRequest,
    RoleUpdateRequest,
    RoleResponse,
} from '../types';

import { RoleFilters } from '../types';

import { PageRequest } from '../types';


// Main role management hook
export const useRoles = () => {
    const dispatch = useAppDispatch();
    const rolesPage = useAppSelector(selectRolesPage);
    const rolesList = useAppSelector(selectRolesList);
    const {isLoading, error} = useAppSelector(selectRoleOperationStatus);
    const pageInfo = useAppSelector(selectPageInfo);

    const handleFetchAllRoles = useCallback(async (
        pageRequest: PageRequest = {page: 0, size: 10, sort: 'roleId'},
        filters: RoleFilters = {}
    ) => {
        try {
            await dispatch(fetchAllRoles({pageRequest, filters})).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleCreateRole = useCallback(async (
        roleData: RoleCreateRequest
    ) => {
        try {
            const result = await dispatch(createRole(roleData)).unwrap();
            return result;
        } catch {
            return null;
        }
    }, [dispatch]);

    const handleUpdateRole = useCallback(async (
        id: number,
        roleData: RoleUpdateRequest
    ) => {
        try {
            await dispatch(updateRole({id, roleData})).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleDeleteRole = useCallback(async (id: number) => {
        try {
            await dispatch(deleteRole(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        rolesPage,
        rolesList,
        isLoading,
        error,
        pageInfo,
        fetchAllRoles: handleFetchAllRoles,
        createRole: handleCreateRole,
        updateRole: handleUpdateRole,
        deleteRole: handleDeleteRole
    };
};

// Hook for finding specific roles
export const useRoleFinder = (roleId?: number, name?: string) => {
    const dispatch = useAppDispatch();
    const {isLoading, error} = useAppSelector(selectRoleOperationStatus);
    const foundById = useAppSelector(
        roleId ? (state => selectRoleById(state, roleId)) : () => null
    );
    const foundByName = useAppSelector(
        name ? (state => selectRoleByName(state, name)) : () => null
    );

    const handleFetchRoleById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchRoleById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    return {
        isLoading,
        error,
        foundById,
        foundByName,
        fetchRoleById: handleFetchRoleById
    };
};

// Hook for role statistics
export const useRoleStats = () => {
    const totalRoles = useAppSelector(selectRolesCount);
    const isEmpty = useAppSelector(selectIsRolesEmpty);

    return {
        totalRoles,
        isEmpty
    };
};

// Hook for sorted role lists
export const useSortedRoles = (
    sortBy?: keyof RoleResponse,
    sortOrder: 'asc' | 'desc' = 'asc'
) => {
    const sortedRoles = useAppSelector(
        sortBy ? (state => selectSortedRoles(state, sortBy, sortOrder)) : selectRolesList
    );
    const recentlyCreated = useAppSelector(selectRecentlyCreatedRoles);

    return {
        sortedRoles,
        recentlyCreated
    };
};

// Hook for current role management
export const useCurrentRole = () => {
    const dispatch = useAppDispatch();
    const currentRole = useAppSelector(selectCurrentRole);
    const {isLoading, error} = useAppSelector(selectRoleOperationStatus);

    const handleFetchRoleById = useCallback(async (id: number) => {
        try {
            await dispatch(fetchRoleById(id)).unwrap();
            return true;
        } catch {
            return false;
        }
    }, [dispatch]);

    const handleClearCurrentRole = useCallback(() => {
        dispatch(clearCurrentRole());
    }, [dispatch]);

    return {
        currentRole,
        isLoading,
        error,
        fetchRoleById: handleFetchRoleById,
        clearCurrentRole: handleClearCurrentRole
    };
};

// Hook for role filtering
export const useRoleFilters = (filters: RoleFilters = {}) => {
    const filteredRoles = useAppSelector(state => selectFilteredRoles(state, filters));
    const {isLoading, error} = useAppSelector(selectRoleOperationStatus);
    const isEmpty = useAppSelector(selectIsRolesEmpty);

    return {
        filteredRoles,
        isLoading,
        error,
        isEmpty
    };
};

// Hook for pagination
export const useRolePagination = () => {
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

// Hook for role permissions
export const useRolePermissions = () => {
    const rolePermissionsList = useAppSelector(selectRolePermissionsList);
    const isPermissionsEmpty = useAppSelector(selectIsRolePermissionsEmpty);
    const {isLoading, error} = useAppSelector(selectRoleOperationStatus);

    return {
        rolePermissionsList,
        isPermissionsEmpty,
        isLoading,
        error
    };
};

// Hook for error handling
export const useRoleError = () => {
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