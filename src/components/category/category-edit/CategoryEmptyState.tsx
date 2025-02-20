import {Folder} from 'lucide-react';

const CategoryEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <Folder className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"/>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Không tìm thấy thông tin
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center">
            Không thể tải thông tin danh mục. Vui lòng thử lại sau.
        </p>
    </div>
);

export {CategoryEmptyState};