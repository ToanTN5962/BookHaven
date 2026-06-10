import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

// 1. Định nghĩa bộ từ điển ngôn ngữ cho trang Login khớp với HomePage
const loginTranslations = {
  en: {
    title: "Welcome back!",
    subtitle: "Please log in to continue!",
    emailLabel: "Email",
    passwordLabel: "Password",
    forgotPass: "Forgot password?",
    loadingText: "Please wait...",
    loginBtn: "Log in",
    orText: "Or",
    noAccount: "Haven't had an account yet?",
    signUpNow: "Sign up",
    errEmail: "Invalid email address!",
    errPassword: "Password must be at least 6 characters long."
  },
  vi: {
    title: "Chào mừng trở lại!",
    subtitle: "Vui lòng đăng nhập để tiếp tục!",
    emailLabel: "Địa chỉ Email",
    passwordLabel: "Mật khẩu",
    forgotPass: "Quên mật khẩu?",
    loadingText: "Vui lòng đợi...",
    loginBtn: "Đăng nhập",
    orText: "Hoặc",
    noAccount: "Bạn chưa có tài khoản?",
    signUpNow: "Đăng ký ngay",
    errEmail: "Địa chỉ email không hợp lệ!",
    errPassword: "Mật khẩu phải chứa ít nhất 6 ký tự."
  }
};

const LoginPage = () => {
  // 2. Tự động lấy ngôn ngữ từ localStorage, mặc định là 'en'
  const [lang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = loginTranslations[lang];

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData, 
      [e.target.name]: e.target.value
    });
    if (error) setError(''); // Xóa thông báo lỗi khi người dùng bắt đầu gõ lại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // SỬA LỖI: Validate TRƯỚC khi bật setLoading(true) để tránh bị kẹt trạng thái Loading
    if (!formData.email.includes('@')) {
      setError(t.errEmail);
      return;
    }
    
    if (formData.password.length < 6) {
      setError(t.errPassword);
      return;
    }

    setLoading(true);

    try {
      console.log("Sending data: ", formData);

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email, 
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === "ADMIN") {
          navigate('/admin');
        } else {
          navigate('/afterlogin');
        }
      } else {
        setError(data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error: ", error);
      setError("Server connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
      
      {/* Container chính */}
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-8 pb-0">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            {t.title}
          </h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>

        <div className="p-8">
          {/* KHUNG HIỂN THỊ LỖI (Thay thế cho hàm alert thô sơ) */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium animate-fade-in text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">{t.emailLabel}</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  name="email"
                  type="email" 
                  required
                  onChange={handleChange}
                  value={formData.email}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-gray-700">{t.passwordLabel}</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:underline underline-offset-4">
                  {t.forgotPass}
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input 
                  name="password"
                  type="password" 
                  required
                  onChange={handleChange}
                  value={formData.password}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:transform-none text-gray-900 font-bold rounded-2xl shadow-lg shadow-yellow-100 hover:shadow-yellow-200 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? t.loadingText : t.loginBtn}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative px-4 bg-white text-gray-400 text-sm">{t.orText}</span>
          </div>
        </div>

        {/* Footer chuyển sang trang ký */}
        <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-gray-600 text-sm">
            {t.noAccount}{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline underline-offset-4 ml-1">
              {t.signUpNow}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;