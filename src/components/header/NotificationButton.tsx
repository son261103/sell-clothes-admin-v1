import { useState } from 'react';
import { Bell } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

const NotificationButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications] = useState<Notification[]>([
        {
            id: 1,
            title: 'Thông báo mới',
            message: 'Bạn có đơn hàng mới #123',
            time: '5 phút trước',
            isRead: false
        },
        // Thêm các thông báo mẫu khác
    ]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                title="Thông báo"
            >
                <Bell className="w-5 h-5 text-primary dark:text-primary" />
                {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-secondary rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-primary dark:text-primary">Thông báo</h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                          ${notification.isRead ? 'opacity-70' : ''}`}
                            >
                                <h4 className="text-sm font-medium text-textDark dark:text-textLight">
                                    {notification.title}
                                </h4>
                                <p className="text-xs text-secondary dark:text-highlight mt-1">
                                    {notification.message}
                                </p>
                                <span className="text-xs text-secondary dark:text-highlight mt-1">
                  {notification.time}
                </span>
                            </div>
                        ))}
                    </div>

                    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                        <button className="text-sm text-primary hover:text-accent w-full text-center">
                            Xem tất cả thông báo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationButton;