export const USER_ENDPOINTS = {
    LIST: '/users/list',
    VIEW: (id: number) => `/users/view/${id}`,
    CREATE: '/users/create',
    EDIT: (id: number) => `/users/edit/${id}`,
    DELETE: (id: number) => `/users/delete/${id}`,
    UPDATE_STATUS: (id: number) => `/users/${id}/status`,
    GET_BY_USERNAME: (username: string) => `/users/username/${username}`,
    GET_BY_EMAIL: (email: string) => `/users/email/${email}`,
    UPDATE_LAST_LOGIN: (userId: number) => `/users/${userId}/last-login`,
    CHECK_USERNAME: '/users/check-username',
    CHECK_EMAIL: '/users/check-email',

    // avatar
    UPLOAD_AVATAR: (userId: number) => `/users/avatar/${userId}`,
    UPDATE_AVATAR: (userId: number) => `/users/avatar/${userId}`,
    DELETE_AVATAR: (userId: number) => `/users/avatar/${userId}`,

} as const;
