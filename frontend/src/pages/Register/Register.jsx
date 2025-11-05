import { useState } from "react";
import { Eye, EyeOff, Lock, User, Mail } from "lucide-react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import Navbar from "../../components/Navbar/Navbar"

const registerSchema = z.object({
  firstname: z.string().min(1, "Tên bắt buộc phải có"),
  lastname: z.string().min(1, "Họ bắt buộc phải có"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

// type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {

  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const { firstname, lastname, username, email, password } = data;

    // gọi backend để register
    await signUp(username, password, email, firstname, lastname);

    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-25 relative overflow-hidden" style={{ backgroundColor: '#7159B6' }}>

      {/* <Navbar/> */}

      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>

      <form className="w-full max-w-lg relative z-10"
        onSubmit={handleSubmit(onSubmit)}>
        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 text-center">Đăng ký</h2>
          <p className="text-gray-600 text-center mb-8">Tạo tài khoản mới để bắt đầu học tiếng Anh</p>

          <div className="space-y-5">
            {/* Họ và Tên - cùng 1 hàng */}
            <div className="grid grid-cols-2 gap-4">
              {/* Họ */}
              <div>
                <label htmlFor="lastname" className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lastname"
                    // name="firstName"
                    // value={formData.firstName}
                    // onChange={handleInputChange}
                    placeholder="Nguyễn"
                    className="w-full pl-12 pr-4 py-1 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400"
                    {...register("lastname")}
                  />
                  

                </div>
                {errors.lastname && (
                    <p className="text-red-500 text-sm">
                      {errors.lastname.message}
                    </p>
                  )}
              </div>

              {/* Tên */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstname"
                    placeholder="Văn A"
                    className="w-full pl-12 pr-4 py-1 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400"
                    {...register("firstname")}
                  />
                </div>
                {errors.firstname && (
                    <p className="text-red-500 text-sm">
                      {errors.firstname.message}
                    </p>
                )}
              </div>
            </div>

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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="email@example.com"
                  className="w-full pl-12 pr-4 py-1 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-200 text-gray-800 placeholder:text-gray-400"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
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

            {/* Error Message */}
            {/* {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )} */}

            {/* Register Button */}
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
              Đăng ký 
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <a 
                href="/login"
                className="font-bold hover:underline transition-all"
                style={{ color: '#7159B6' }}
              >
                Đăng nhập 
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}