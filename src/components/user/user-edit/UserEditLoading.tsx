import {RefreshCw} from 'lucide-react';

const UserEditLoading = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-8 h-8 text-primary animate-spin"/>
            <div className="text-sm text-secondary dark:text-highlight">
                Đang tải...
            </div>
        </div>
    </div>
);

export default UserEditLoading;