export interface ValidationErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
    phone?: string;
}

export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
}

export const validateForm = (formData: RegisterFormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Full name validation
    if (!formData.fullName.trim()) {
        errors.fullName = 'Vui lòng nhập họ và tên';
    } else if (formData.fullName.length < 2) {
        errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    // Username validation
    if (!formData.username.trim()) {
        errors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.length < 3) {
        errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(formData.email)) {
        errors.email = 'Email không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
        errors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái in hoa';
    } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái thường';
    } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất 1 số';
    } else if (!/[!@#$%^&*(),.?":{}|<>~`[\]/;'=_+-]/.test(formData.password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt';
    }



    // Confirm password validation
    if (!formData.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.confirmPassword !== formData.password) {
        errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    return errors;
};

export const parseOtpError = (error: string): { message: string; isLimitExceeded?: boolean } => {
    if (error.includes("limit exceeded") || error.includes("try again tomorrow")) {
        return {
            message: 'Bạn đã vượt quá giới hạn gửi OTP trong ngày. Vui lòng thử lại vào ngày mai.',
            isLimitExceeded: true
        };
    }
    if (error.includes("wait")) {
        const seconds = parseInt(error.match(/\d+/)?.[0] || "60");
        return {
            message: `Vui lòng đợi ${seconds} giây trước khi gửi lại OTP`
        };
    }
    return { message: 'Không thể gửi OTP. Vui lòng thử lại sau.' };
};