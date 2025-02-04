import React, {useState, useCallback} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Mail, User, ArrowRight, Loader2} from 'lucide-react';
import {useRegistration, useOtp} from '../../hooks/authHooks';
import FormInput from "../../components/auth/FormInput";
import {toast} from 'react-hot-toast';
import {validateForm, ValidationErrors, RegisterFormData, parseOtpError} from '../../utils/auth/registerUtils';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const {register, isLoading, error} = useRegistration();
    const {sendOtp} = useOtp();
    const [isResendCooldown, setIsResendCooldown] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);

    const [formData, setFormData] = useState<RegisterFormData & { acceptTerms: boolean }>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        acceptTerms: false
    });
    const [isOtpLimitExceeded, setIsOtpLimitExceeded] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name as keyof ValidationErrors]) {
            setErrors((prev) => ({...prev, [name]: ''}));
        }
    }, [errors]);

    const startCooldownTimer = useCallback((seconds: number) => {
        setIsResendCooldown(true);
        setCooldownTime(seconds);
        const timer = setInterval(() => {
            setCooldownTime((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    setIsResendCooldown(false);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    }, []);

    const parseErrorMessage = (error: string): string => {
        if (error.includes("wait")) {
            const seconds = parseInt(error.match(/\d+/)?.[0] || "0");
            if (seconds > 0) {
                startCooldownTimer(seconds);
                return `Vui lòng đợi ${seconds} giây trước khi gửi lại OTP`;
            }
        }
        if (error.includes("inactive") || error.includes("not been activated")) {
            return "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản.";
        }
        return error;
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        const {acceptTerms, ...registerData} = formData;
        const validationErrors = validateForm(registerData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (!acceptTerms) {
            toast.error('Vui lòng đồng ý với điều khoản sử dụng');
            return;
        }

        const loadingToast = toast.loading('Đang xử lý...');

        try {
            const success = await register(registerData);

            // Đợi animation loading hoàn thành
            await new Promise(resolve => setTimeout(resolve, 500));

            if (success) {
                try {
                    await sendOtp({email: formData.email});
                    toast.success('Đăng ký thành công! Vui lòng nhập mã OTP để kích hoạt tài khoản');
                    await new Promise(resolve => setTimeout(resolve, 500)); // Đợi toast hiển thị
                    navigate('/auth/verify-otp', {state: {email: formData.email}});
                } catch (otpError) {
                    if (otpError instanceof Error) {
                        const { message, isLimitExceeded } = parseOtpError(otpError.message);
                        if (isLimitExceeded) {
                            setIsOtpLimitExceeded(true);
                        }
                        toast.error(message);
                    }
                }
            } else {
                const errorMessage = parseErrorMessage(error || 'Đăng ký thất bại');
                toast.error(errorMessage);
            }
        } catch (err) {
            if (err instanceof Error) {
                const errorMessage = parseErrorMessage(err.message);
                toast.error(errorMessage);
            }
        } finally {
            toast.dismiss(loadingToast);
        }
    }, [formData, register, sendOtp, error, navigate, startCooldownTimer]);

    return (
        <div className="card bg-white dark:bg-gray-800 shadow-xl w-full max-w-md">
            <div className="card-body">
                <div className="text-center mb-8" data-aos="fade-up">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Đăng ký
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Tạo tài khoản mới
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-aos="fade-up" data-aos-delay="100">
                    <FormInput
                        label="Họ và tên"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Họ và tên của bạn"
                        icon={<User className="h-5 w-5"/>}
                        required
                        error={errors.fullName}
                    />

                    <FormInput
                        label="Tên đăng nhập"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Tên đăng nhập của bạn"
                        icon={<User className="h-5 w-5"/>}
                        required
                        error={errors.username}
                    />

                    <FormInput
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email của bạn"
                        icon={<Mail className="h-5 w-5"/>}
                        required
                        error={errors.email}
                    />

                    <FormInput
                        label="Mật khẩu"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Mật khẩu của bạn"
                        required
                        error={errors.password}
                    />

                    <FormInput
                        label="Xác nhận mật khẩu"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Nhập lại mật khẩu"
                        required
                        error={errors.confirmPassword}
                    />

                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleInputChange}
                            className="checkbox checkbox-primary mt-1"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Tôi đồng ý với{' '}
                            <Link to="/terms" className="text-primary hover:text-accent transition-colors">
                                Điều khoản sử dụng
                            </Link>
                            {' '}và{' '}
                            <Link to="/privacy" className="text-primary hover:text-accent transition-colors">
                                Chính sách bảo mật
                            </Link>
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isResendCooldown}
                        className="btn btn-primary w-full gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin"/>
                        ) : (
                            <>
                                Đăng ký ngay
                                <ArrowRight className="h-5 w-5"/>
                            </>
                        )}
                    </button>

                    {isResendCooldown && (
                        <p className="text-sm text-center text-gray-500">
                            Vui lòng đợi {cooldownTime} giây trước khi thử lại
                        </p>
                    )}

                    {isOtpLimitExceeded && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400 text-center">
                                Bạn đã vượt quá giới hạn gửi OTP trong ngày.
                                <br/>
                                Vui lòng thử lại vào ngày mai.
                            </p>
                        </div>
                    )}
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            hoặc
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="200">
                    <button
                        type="button"
                        onClick={() => toast.error('Đăng ký bằng Google chưa được hỗ trợ')}
                        className="btn btn-outline gap-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                        </svg>
                        Google
                    </button>
                    <button
                        type="button"
                        onClick={() => toast.error('Đăng ký bằng Facebook chưa được hỗ trợ')}
                        className="btn btn-outline gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/>
                        </svg>
                        Facebook
                    </button>
                </div>

                <div className="text-center mt-6" data-aos="fade-up">
                    <p className="text-gray-700 dark:text-gray-300">
                        Đã có tài khoản?{' '}
                        <Link
                            to="/auth/login"
                            className="text-primary hover:text-accent font-medium transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;