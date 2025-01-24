import React, {useState, useCallback} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {User, ArrowRight, Loader2} from 'lucide-react';
import {useAuth, useOtp} from '../../hooks/authHooks';
import FormInput from "../../components/auth/FormInput";
import {toast} from 'react-hot-toast';
import {jwtDecode} from 'jwt-decode';
import {validateForm} from '../../utils/auth/loginUtils';

interface DecodedToken {
    roles: string[];
    status: string;
    email: string;
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const {login, isLoading, error} = useAuth();
    const {sendOtp} = useOtp();
    const [isResendCooldown, setIsResendCooldown] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);

    const [formData, setFormData] = useState({
        loginId: '',
        password: '',
        rememberMe: false,
    });

    const [errors, setErrors] = useState({
        loginId: '',
        password: '',
    });

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

    const handleActivateAccount = useCallback(async (email: string) => {
        try {
            await sendOtp({email});
            navigate('/auth/verify-otp', {state: {email}});
            toast.success('Mã OTP đã được gửi đến email của bạn');
        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = error.message;
                if (errorMessage.includes("wait")) {
                    const seconds = parseInt(errorMessage.match(/\d+/)?.[0] || "0");
                    if (seconds > 0) {
                        startCooldownTimer(seconds);
                        toast.error(`Vui lòng đợi ${seconds} giây trước khi gửi lại OTP`);
                        return;
                    }
                }
                toast.error(errorMessage);
            }
        }
    }, [sendOtp, navigate, startCooldownTimer]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        const {loginIdError, passwordError} = validateForm(formData.loginId, formData.password);

        if (loginIdError || passwordError) {
            setErrors({
                loginId: loginIdError,
                password: passwordError,
            });
            return;
        }

        const loadingToast = toast.loading('Đang đăng nhập...');

        try {
            const success = await login({
                loginId: formData.loginId,
                password: formData.password,
            });

            if (success) {
                const token = localStorage.getItem('accessToken');

                if (token) {
                    const decoded = jwtDecode<DecodedToken>(token);
                    const {roles, status, email} = decoded;

                    if (status === 'PENDING') {
                        toast.success('Tài khoản chưa được kích hoạt');
                        if (window.confirm('Bạn có muốn kích hoạt tài khoản ngay bây giờ?')) {
                            await handleActivateAccount(email);
                            return;
                        }
                        return;
                    }

                    if (roles.includes('ROLE_CUSTOMER')) {
                        window.location.href = 'http://localhost:3001/';
                    } else if (!roles.includes('ROLE_CUSTOMER')) {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/unauthorized');
                    }

                    if (formData.rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }

                    toast.success('Đăng nhập thành công!');
                }
            } else {
                if (error?.includes('incorrect password')) {
                    toast.error('Mật khẩu không chính xác');
                    setErrors(prev => ({...prev, password: 'Mật khẩu không chính xác'}));
                } else if (error?.includes('not found')) {
                    toast.error('Tài khoản không tồn tại');
                    setErrors(prev => ({...prev, loginId: 'Tài khoản không tồn tại'}));
                } else {
                    toast.error(error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
                }
            }
        } catch {
            toast.error('Đăng nhập thất bại. Vui lòng thử lại sau.');
        } finally {
            toast.dismiss(loadingToast);
        }
    }, [formData, login, navigate, error, handleActivateAccount]);

    const handleSocialLogin = useCallback((provider: 'Google' | 'Facebook') => {
        toast.error(`Đăng nhập bằng ${provider} chưa được hỗ trợ`);
    }, []);

    return (
        <div className="card bg-white dark:bg-gray-800 shadow-xl w-full max-w-md">
            <div className="card-body">
                <div className="text-center mb-8" data-aos="fade-up">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Đăng nhập
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Chào mừng bạn trở lại!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-aos="fade-up" data-aos-delay="100">
                    <FormInput
                        label="Email hoặc tên đăng nhập"
                        type="text"
                        name="loginId"
                        value={formData.loginId}
                        onChange={handleInputChange}
                        placeholder="Email hoặc tên đăng nhập của bạn"
                        icon={<User className="h-5 w-5"/>}
                        required
                        error={errors.loginId}
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

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleInputChange}
                                className="checkbox checkbox-primary"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Ghi nhớ đăng nhập
                            </span>
                        </label>
                        <Link
                            to="/auth/forgot-password"
                            className="text-sm text-primary hover:text-accent transition-colors"
                        >
                            Quên mật khẩu?
                        </Link>
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
                                Đăng nhập
                                <ArrowRight className="h-5 w-5"/>
                            </>
                        )}
                    </button>

                    {isResendCooldown && (
                        <p className="text-sm text-center text-gray-500">
                            Vui lòng đợi {cooldownTime} giây trước khi thử lại
                        </p>
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
                        onClick={() => handleSocialLogin('Google')}
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
                        onClick={() => handleSocialLogin('Facebook')}
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
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/auth/register"
                            className="text-primary hover:text-accent font-medium transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;