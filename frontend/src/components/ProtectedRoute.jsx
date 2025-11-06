import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore.js";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ allowedRoles }) {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  
  // --- THAY ĐỔI 1 ---
  // Kiểm tra xem session đã được tải từ trước chưa.
  // Nếu user đã tồn tại trong store, chúng ta không cần "starting"
  const isSessionLoaded = !!useAuthStore.getState().user;
  const [ starting, setStarting ] = useState(!isSessionLoaded);
  // --------------------

  const init = async () => {
    if (!accessToken) {
      try {
        await refresh();
      } catch (error) {
        // Refresh thất bại, không sao
      }
    }
    
    const currentAccessToken = useAuthStore.getState().accessToken;
    if (currentAccessToken && !user) {
      try {
        await fetchMe();
      } catch (error) {
         // fetchMe thất bại
      }
    }

    setStarting(false);
  }

  useEffect(() => {
    // --- THAY ĐỔI 2 ---
    // Chỉ chạy init() nếu session chưa được tải (ví dụ: khi F5)
    if (!isSessionLoaded) {
      init();
    }
    // --------------------
  }, []); // Vẫn chỉ chạy 1 lần khi mount

  // Hiển thị loading CHỈ KHI đang "starting"
  // (Lưu ý: Bỏ 'loading' khỏi điều kiện này có thể giúp
  // loại bỏ các chớp loading nhỏ, nhưng 'starting' là chính)
  if (starting) {
    return <div className="flex h-screen items-center justify-center">Đang tải trang...</div>;
  }

  // --- Logic bảo vệ (giữ nguyên) ---

  // 1. Không có token -> Về trang Login
  // Đọc accessToken MỚI NHẤT từ state sau khi 'starting' hoàn tất
  if (!useAuthStore.getState().accessToken) {
    return (<Navigate to="/login" replace />);
  }

  // 2. Có token, nhưng không có thông tin user
  if (!user) {
     return (<Navigate to="/login" replace />);
  }

  // 3. Kiểm tra Role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (<Navigate to="/learn" replace />);
  }

  return (<Outlet />);
}