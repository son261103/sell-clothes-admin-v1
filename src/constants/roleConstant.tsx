export const ROLE_ENDPOINTS = {
    LIST: '/roles/list',
    VIEW: (id: number) => `/roles/view/${id}`,
    CREATE: '/roles/create',
    EDIT: (id: number) => `/roles/edit/${id}`,
    DELETE: (id: number) => `/roles/delete/${id}`,
    CHECK_EXISTS: '/roles/check-exists',
    GET_BY_NAME: (name: string) => `/roles/name/${name}`,

    // Role permissions endpoints
    ADD_PERMISSION_TO_ROLE: (roleId: number, permissionId: number) => `/roles/${roleId}/permissions/${permissionId}`,
    REMOVE_PERMISSION_FROM_ROLE: (roleId: number, permissionId: number) => `/roles/${roleId}/permissions/${permissionId}`,
    UPDATE_ROLE_PERMISSIONS: (roleId: number) => `/roles/${roleId}/permissions`,
    REMOVE_MULTIPLE_PERMISSIONS: (roleId: number) => `/roles/${roleId}/permissions/bulk`,
    GET_ROLE_PERMISSIONS: (roleId: number) => `/roles/${roleId}/permissions`,
} as const;