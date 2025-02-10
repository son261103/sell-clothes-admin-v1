// VerifyOTPPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import FormInput from "../../components/auth/FormInput";
import { useOtp } from '../../hooks/authHooks';
import { toast } from 'react-hot-toast';

const VerifyOTPPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const [otp, setOtp] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { verifyOtp, resendOtp, isLoading } = useOtp();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!otp.trim()) {
            setErrorMessage('Vui lòng nhập mã OTP');
            return;
        }

        try {
            const success = await verifyOtp({ email, otp });
            if (success) {
                toast.success('Xác thực OTP thành công!');
                navigate('/auth/login');
            }
        } catch {
            setErrorMessage('Mã OTP không hợp lệ');
            toast.error('Mã OTP không hợp lệ!');
        }
    };

    const handleResend = async () => {
        try {
            await resendOtp({ email });
            toast.success('Đã gửi lại mã OTP!');
            setOtp('');
        } catch {
            toast.error('Không thể gửi lại mã OTP!');
        }
    };

    if (!email) {
        navigate('/auth/register');
        return null;
    }

    return (
        <div className="card bg-white dark:bg-gray-800 shadow-xl w-full max-w-md transition-all duration-300 hover:shadow-2xl">
            <div className="card-body p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Xác thực OTP
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Vui lòng nhập mã OTP đã được gửi đến{' '}
                        <span className="font-medium text-primary">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <FormInput
                        label="Mã OTP"
                        type="text"
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Nhập mã OTP"
                        required
                        error={errorMessage}
                        pattern="[0-9]*"
                        maxLength={6}
                        autoComplete="one-time-code"
                        className="text-center text-2xl tracking-wide"
                    />

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full transform transition-all duration-300
                                hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin"/>
                            ) : (
                                'Xác nhận'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isLoading}
                            className="btn btn-outline w-full transform transition-all duration-300
                                hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Gửi lại mã
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTPPage;