import { Navigate } from "react-router-dom";

const isAuthenticated = () => !!sessionStorage.getItem("accessToken");

const AuthGuard = ({ children }: { children: React.ReactNode }) => {

    if (isAuthenticated()) {
        // Kiểm tra có thể quay lại trang trước không
        const canGoBack = window.history.length > 1;
        const previousUrl = document.referrer;

        // Nếu trang trước là auth hoặc không có trang trước hợp lệ, chuyển đến dashboard
        if (!canGoBack || previousUrl.includes("/auth")) {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            window.history.back();
            return null;
        }
    }

    return children;
};

export default AuthGuard;
