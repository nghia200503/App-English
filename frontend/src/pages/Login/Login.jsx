import { useState } from "react";
import { Eye, EyeOff, Lock, User, Mail } from "lucide-react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import Navbar from "../../components/Navbar/Navbar"

const loginSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const { username, password } = data;

    // 1. Gọi hàm signIn và chờ kết quả (user object hoặc null)
    const user = await signIn(username, password);

    // 2. Kiểm tra kết quả trả về
    if (user) {
      // Đăng nhập thành công, 'user' chứa thông tin (bao gồm cả role)
      
      // 3. So sánh role và điều hướng
      if (user.role === 'admin') {
        navigate('/admin'); // Điều hướng đến trang admin
      } else {
        navigate('/learn'); // Điều hướng đến trang learn (cho 'user')
      }
    }
    
    // Nếu 'user' là null (đăng nhập thất bại),
    // không làm gì cả. toast.error đã được gọi từ
    // bên trong useAuthStore.
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#7159B6' }}>

      {/* <Navbar/> */}

      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>

      <form className="w-full max-w-lg relative z-10"
        onSubmit={handleSubmit(onSubmit)}>
        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 text-center">Đăng nhập</h2>
          <p className="text-gray-600 text-center mb-8">Chào mừng bạn quay lại</p>

          <div className="space-y-5">
            
            {/* Tên đăng nhập */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  // name="username"
                  // value={formData.username}
                  // onChange={handleInputChange}
                  placeholder="username123"
                  className="w-full pl-12 pr-4 py-1 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                    <p className="text-red-500 text-sm">
                      {errors.username.message}
                    </p>
                )}
            </div>

            {/* Mật khẩu */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Nhập mật khẩu của bạn"
                  className="w-full pl-12 pr-12 py-1 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors focus:outline-none"
                  style={{ color: showPassword ? '#7159B6' : undefined }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#7159B6'}
                  onMouseLeave={(e) => !showPassword && (e.currentTarget.style.color = '#9CA3AF')}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4"
              style={{ 
                backgroundColor: '#7159B6',
                '--tw-ring-color': '#7159B6'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5d4a9a'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7159B6'}
            >
              Đăng nhập
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <a 
                href="/register"
                className="font-bold hover:underline transition-all"
                style={{ color: '#7159B6' }}
              >
                Đăng ký
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}