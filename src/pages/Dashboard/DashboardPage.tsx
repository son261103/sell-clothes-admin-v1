import {
    Users, ShoppingBag, DollarSign, TrendingUp,
    ArrowUpRight, ArrowDownRight, Download
} from 'lucide-react';

const DashboardPage = () => {
    // Example data
    const stats = [
        {
            title: 'Tổng doanh thu',
            value: '120.5M',
            trend: '+12.5%',
            isIncrease: true,
            icon: <DollarSign className="w-6 h-6"/>,
            color: 'text-green-500'
        },
        {
            title: 'Người dùng mới',
            value: '2,450',
            trend: '+18.7%',
            isIncrease: true,
            icon: <Users className="w-6 h-6"/>,
            color: 'text-blue-500'
        },
        {
            title: 'Đơn hàng',
            value: '1,210',
            trend: '-3.2%',
            isIncrease: false,
            icon: <ShoppingBag className="w-6 h-6"/>,
            color: 'text-purple-500'
        },
        {
            title: 'Tỷ lệ chuyển đổi',
            value: '3.2%',
            trend: '+2.4%',
            isIncrease: true,
            icon: <TrendingUp className="w-6 h-6"/>,
            color: 'text-orange-500'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center p-1 border-b">
                <div>
                    <h1 className="text-xl font-semibold text-textDark dark:text-textLight">
                        Dashboard
                    </h1>
                    <p className="text-sm text-secondary dark:text-highlight">
                        Tổng quan về hoạt động của hệ thống
                    </p>
                </div>
                <button
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-textDark dark:text-textLight hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5"
                >
                    <Download className="h-3.5 w-3.5"/>
                    Export
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                                {stat.icon}
                            </div>
                            <div className="flex items-center space-x-1">
                <span className={`text-sm ${stat.isIncrease ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
                                {stat.isIncrease ? (
                                    <ArrowUpRight className="w-4 h-4 text-green-500"/>
                                ) : (
                                    <ArrowDownRight className="w-4 h-4 text-red-500"/>
                                )}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm text-secondary dark:text-highlight">
                                {stat.title}
                            </h3>
                            <p className="text-2xl font-bold text-textDark dark:text-textLight mt-1">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6"
                    data-aos="fade-up"
                    data-aos-delay="400"
                >
                    <h2 className="text-lg font-semibold text-textDark dark:text-textLight mb-4">
                        Đơn hàng gần đây
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="text-left">
                                <th className="pb-4 text-secondary dark:text-highlight font-medium">ID</th>
                                <th className="pb-4 text-secondary dark:text-highlight font-medium">Khách hàng</th>
                                <th className="pb-4 text-secondary dark:text-highlight font-medium">Trạng thái</th>
                                <th className="pb-4 text-secondary dark:text-highlight font-medium">Giá trị</th>
                            </tr>
                            </thead>
                            <tbody className="text-textDark dark:text-textLight">
                            {[1, 2, 3, 4].map((item) => (
                                <tr key={item} className="border-t border-gray-100 dark:border-gray-700">
                                    <td className="py-4">#ORD-{item}234</td>
                                    <td className="py-4">Khách hàng {item}</td>
                                    <td className="py-4">
                      <span
                          className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                        Hoàn thành
                      </span>
                                    </td>
                                    <td className="py-4">{item}50.000đ</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Users */}
                <div
                    className="bg-white dark:bg-secondary rounded-xl shadow-sm p-6"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <h2 className="text-lg font-semibold text-textDark dark:text-textLight mb-4">
                        Người dùng mới
                    </h2>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-primary"/>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-textDark dark:text-textLight">
                                            Người dùng {item}
                                        </h3>
                                        <p className="text-xs text-secondary dark:text-highlight">
                                            user{item}@example.com
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-secondary dark:text-highlight">
                  2 phút trước
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;