import { create } from 'zustand';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import axios from 'axios';
import { refine } from 'zod';

export const useAuthStore = create((set, get) => ({
    accessToken: null,
    user: null, // Thông tin người dùng
    loading: false, // Theo dõi trạng thái khi gọi api

    setAccessToken: (accessToken) => {
        set({ accessToken });
    },

    clearState: () => {
        set({ accessToken: null, user: null, loading: false });
    },

    signUp: async (username, password, email, firstName, lastName) => {
        try {
            set({ loading: true });

            // Gọi API đăng ký
            await authService.register(username, password, email, firstName, lastName);

            toast.success("Đăng ký thành công");
        } catch (error) {
            console.error(error);
            let errorMessage = "Đã xảy ra lỗi không xác định.";

            // 1. Kiểm tra nếu lỗi đến từ Axios và có phản hồi từ Server
            if (axios.isAxiosError(error) && error.response) {
                const status = error.response.status;
                const data = error.response.data;

                if (status === 400 || status === 409) { 
                    // 400 (Bad Request) hoặc 409 (Conflict) thường dùng cho lỗi trùng lặp
                    
                    // Giả định Server trả về lỗi dưới dạng { message: "..." }
                    if (data && data.message) {
                        errorMessage = data.message;
                    } 
                    
                } 
                else if (status === 500) {
                    errorMessage = "Lỗi hệ thống Server. Vui lòng thử lại sau.";
                }
            } else if (error.message === 'Network Error') {
                errorMessage = "Lỗi kết nối mạng hoặc Server Backend chưa khởi động (localhost:5001).";
            }
            
            toast.error(errorMessage);
        } finally {
            set({ loading: false });
        }
    },

    signIn: async ( username, password) => {
        try {
            set({ loading: true });

            const { accessToken, user } = await authService.login(username, password);
            get().setAccessToken(accessToken);
            set({ user: user });

            if (user) {
                toast.success("Đăng nhập thành công");
                return user; // <-- QUAN TRỌNG: Trả về user object
            } else {
                // Trường hợp fetchMe thất bại (dù login thành công)
                // toast.error đã được gọi bên trong fetchMe
                return null;
            }

        } catch (error) {
            console.error(error);
            toast.error("Sai tên đăng nhập hoặc mật khẩu");
            return null; // <-- QUAN TRỌNG: Trả về null khi thất bại
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        try {
            get().clearState();
            await authService.logout();
            toast.success("Đăng xuất thành công");
        } catch (error) {
            console.error(error);
            toast.error("Đăng xuất thất bại");
        }
    },

    fetchMe: async () => {
        try {
            set({ loading: true });
            const user =  await authService.fetchMe();

            set({ user });
        } catch (error) {
            console.error(error);
            set({ user: null, accessToken: null });
            toast.error("Lỗi khi tải thông tin người dùng");
        } finally {
            set({ loading: false });
        }
    },

    refresh: async () => {
        try {
            set({ loading: true });
            const { user, fetchMe, setAccessToken } = get();
            const accessToken = await authService.refresh();
            
            setAccessToken(accessToken);
            
            if (!user) {
                await fetchMe();
            }

        } catch (error) {
            console.error(error);
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            get().clearState();
        } finally {
            set({ loading: false });
        }
    },

    // Cập nhật hồ sơ người dùng hiện tại
    updateProfile: async (formData) => {
        const userId = get().user?._id;
        if (!userId) {
            toast.error("Không tìm thấy ID người dùng để cập nhật.");
            return;
        }

        try {
            set({ loading: true });
            
            // Gọi service mới
            const response = await authService.updateMyProfile(userId, formData);

            if (response.user) {
                // Cập nhật lại thông tin user trong store
                set({ user: response.user }); 
                toast.success(response.message || "Cập nhật hồ sơ thành công!");
            } else {
                toast.error("Cập nhật thất bại. Không nhận được dữ liệu người dùng mới.");
            }
            return response.user; // Trả về user để Profile.jsx có thể sử dụng
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật hồ sơ.");
            throw error; // Ném lỗi để component có thể bắt
        } finally {
            set({ loading: false });
        }
    }
}));