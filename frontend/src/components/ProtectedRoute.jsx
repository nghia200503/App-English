// import { Navigate, Outlet } from "react-router-dom";
// import { useAuthStore } from "../stores/useAuthStore.js";
// import { useEffect, useState } from "react";

// export default function ProtectedRoute({ children }) {
//   const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
//   const [ starting, setStarting ] = useState(true);

//   const init = async () => {
//     // Có thể xảy ra khi refresh trang
//     if (!accessToken) {
//       await refresh();
//     }

//     if (accessToken && !user) {
//       await fetchMe();
//     }

//     setStarting(false);
//   }

//   useEffect(() => {
//     init();
//   }, []);

//   if (starting || loading) {
//     return <div className="flex h-screen items-center justify-center">Đang tải trang...</div>;
//   }

//   if (!accessToken) {
//     return (<Navigate to="/login" replace />);
//   }

//   return (<Outlet></Outlet>);
// }
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore.js";
import { useEffect, useState } from "react";

/**
 * Prop `allowedRoles` là một mảng các role được phép (ví dụ: ['admin', 'moderator'])
 * Nếu không truyền `allowedRoles`, component sẽ chỉ kiểm tra xem người dùng đã đăng nhập hay chưa.
 */
export default function ProtectedRoute({ allowedRoles }) {
  // Lấy trạng thái xác thực từ store
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  // Trạng thái khởi động (đang kiểm tra token và fetch user)
  const [ starting, setStarting ] = useState(true);

  const init = async () => {
    // Cố gắng refresh token nếu không có (ví dụ: khi F5 trang)
    if (!accessToken) {
      try {
        await refresh();
      } catch (error) {
        // Refresh thất bại, không sao, cứ tiếp tục
      }
    }
    
    // Nếu có token (sau khi refresh) mà chưa có info user -> fetch user
    // `useAuthStore` sẽ tự cập nhật `accessToken` sau khi `refresh()` thành công
    // nên ta đọc lại `accessToken` từ store
    const currentAccessToken = useAuthStore.getState().accessToken;
    if (currentAccessToken && !user) {
      try {
        await fetchMe();
      } catch (error) {
         // fetchMe thất bại (token hết hạn, user bị xoá...), không sao
      }
    }

    setStarting(false);
  }

  useEffect(() => {
    init();
  }, []);

  // Hiển thị loading trong khi kiểm tra token và fetch user
  if (starting || loading) {
    return <div className="flex h-screen items-center justify-center">Đang tải trang...</div>;
  }

  // --- Logic bảo vệ ---

  // 1. Không có token -> Về trang Login
  if (!accessToken) {
    return (<Navigate to="/login" replace />);
  }

  // 2. Có token, nhưng không có thông tin user (có thể fetchMe bị lỗi)
  // -> Về trang Login (an toàn nhất là bắt đăng nhập lại)
  if (!user) {
     return (<Navigate to="/login" replace />);
  }

  // 3. (QUAN TRỌNG) Kiểm tra Role
  // Nếu route này yêu cầu role (đã truyền prop allowedRoles)
  // VÀ role của user không nằm trong danh sách được phép
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // -> Về trang chủ (hoặc trang /unauthorized nếu bạn có)
    // Người dùng đã đăng nhập, nhưng không có quyền
    return (<Navigate to="/learn" replace />);
  }

  // Nếu vượt qua tất cả kiểm tra -> Hiển thị trang con
  return (<Outlet />);
}