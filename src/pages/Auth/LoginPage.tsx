import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import FormInput from "../../components/auth/FormInput.tsx";


const LoginPage = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
    };

    return (
        <div className="card bg-white dark:bg-secondary shadow-xl">
            <div className="card-body">
                <div className="text-center mb-6" data-aos="fade-up">
                    <h2 className="text-3xl font-bold text-textDark dark:text-textLight">
                        Đăng nhập
                    </h2>
                    <p className="mt-2 text-secondary dark:text-highlight">
                        Chào mừng bạn trở lại!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-aos="fade-up" data-aos-delay="100">
                    <FormInput
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="Email của bạn"
                        icon={<Mail size={20} />}
                    />

                    <FormInput
                        label="Mật khẩu"
                        type="password"
                        name="password"
                        placeholder="Mật khẩu của bạn"
                    />

                    <div className="flex items-center justify-between">
                        <label className="cursor-pointer label">
                            <input type="checkbox" className="checkbox checkbox-primary" />
                            <span className="label-text ml-2 text-textDark dark:text-textLight">
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
                        className="btn btn-primary w-full gap-2"
                    >
                        Đăng nhập
                        <ArrowRight size={20} />
                    </button>
                </form>

                <div className="divider text-secondary dark:text-highlight">hoặc</div>

                <div className="grid grid-cols-2 gap-4" data-aos="fade-up" data-aos-delay="200">
                    <button className="btn btn-outline gap-2 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                        </svg>
                        Google
                    </button>
                    <button className="btn btn-outline gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"/>
                        </svg>
                        Facebook
                    </button>
                </div>

                <div className="text-center mt-6" data-aos="fade-up" data-aos-delay="300">
                    <div className="text-textDark dark:text-textLight">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/auth/register"
                            className="text-primary hover:text-accent font-medium transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;