export const PERMISSION_ENDPOINTS = {
    LIST: '/permissions/list',
    VIEW: (id: number) => `/permissions/view/${id}`,
    CREATE: '/permissions/create',
    EDIT: (id: number) => `/permissions/edit/${id}`,
    DELETE: (id: number) => `/permissions/delete/${id}`,
    CHECK_EXISTS: '/permissions/check-exists',
    GET_BY_GROUP: (groupName: string) => `/permissions/group/${groupName}`,

    // Role-Permission relationship endpoints
    ADD_PERMISSION_TO_ROLE: (roleId: number, permissionId: number) =>
        `/permissions/${roleId}/permissions/${permissionId}`,
    REMOVE_PERMISSION_FROM_ROLE: (roleId: number, permissionId: number) =>
        `/permissions/${roleId}/permissions/${permissionId}`,
    UPDATE_ROLE_PERMISSIONS: (roleId: number) =>
        `/permissions/${roleId}/permissions`,
} as const;