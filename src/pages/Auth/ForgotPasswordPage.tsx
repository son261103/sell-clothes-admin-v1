import React from 'react';
import {Link} from 'react-router-dom';
import {Mail, ArrowRight} from 'lucide-react';
import FormInput from "../../components/auth/FormInput.tsx";


const ForgotPasswordPage = () => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle forgot password logic here
    };

    return (
        <div className="card bg-white dark:bg-secondary shadow-xl">
            <div className="card-body">
                <div className="text-center mb-6" data-aos="fade-up">
                    <h2 className="text-3xl font-bold text-textDark dark:text-textLight">
                        Quên mật khẩu
                    </h2>
                    <p className="mt-2 text-secondary dark:text-highlight">
                        Đừng lo lắng! Chúng tôi sẽ giúp bạn khôi phục mật khẩu
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-aos="fade-up" data-aos-delay="100">
                    <FormInput
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="Nhập email của bạn"
                        icon={<Mail size={20}/>}
                    />

                    <button
                        type="submit"
                        className="btn btn-primary w-full gap-2 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                        Gửi yêu cầu
                        <ArrowRight className="w-5 h-5"/>
                    </button>
                </form>

                <div className="text-center mt-6 space-y-4" data-aos="fade-up" data-aos-delay="200">
                    <div className="text-textDark dark:text-textLight">
                        Nhớ ra mật khẩu?{' '}
                        <Link
                            to="/auth/login"
                            className="text-primary hover:text-accent font-medium transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    </div>

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

export default ForgotPasswordPage;