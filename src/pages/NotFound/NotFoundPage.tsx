import {Link} from 'react-router-dom';
import {Home, ArrowLeft} from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-lightBackground dark:bg-darkBackground flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center" data-aos="fade-up">
                <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-textDark dark:text-textLight mb-4">
                    Trang không tồn tại
                </h2>
                <p className="text-secondary dark:text-highlight mb-8">
                    Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        to="/"
                        className="btn btn-primary gap-2"
                    >
                        <Home size={20}/>
                        Trang chủ
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="btn btn-outline gap-2"
                    >
                        <ArrowLeft size={20}/>
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;