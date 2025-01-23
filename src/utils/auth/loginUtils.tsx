// src/utils/loginUtils.ts

export const validateLoginId = (loginId: string) => {
    if (!loginId) {
        return 'Vui lòng nhập Email hoặc tên đăng nhập.';
    }

    return '';
};

export const validatePassword = (password: string) => {
    if (!password) {
        return 'Vui lòng nhập mật khẩu.';
    }

    // Kiểm tra độ dài mật khẩu (ví dụ, tối thiểu 6 ký tự)
    if (password.length < 6) {
        return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    return '';
};

export const validateForm = (loginId: string, password: string) => {
    const loginIdError = validateLoginId(loginId);
    const passwordError = validatePassword(password);

    return {
        loginIdError,
        passwordError,
    };
};
