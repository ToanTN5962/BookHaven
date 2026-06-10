import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../components/SimpleHeader';
import { AlertCircle, Send, FileText, ChevronDown, HelpCircle } from 'lucide-react';

const translations = {
  en: {
    formHeader: "Your report will help BookHaven cleaner and more accurate.",
    probQues: "What's your problem?",
    probLists: ['The book information is incorrect', 'Violation/Offensive reviews', 'Copyright infringement', 'Content is missing', 'Duplicate book', 'Technical/System error', 'Report user', 'Other'],
    des: "Description",
    placeholder: "Provide additional information for faster processing...",
    back: "Back",
    send: "Send",
    sending: "Sending..."
  },
  vi: {
    formHeader: "Báo cáo của bạn sẽ giúp BookHaven chính xác hơn",
    probQues: "Vấn đề bạn gặp phải?",
    probLists: ['Sai thông tin sách', 'Nhận xét mang ngôn từ thù ghét, không chuẩn mực', 'Vi phạm bản quyền', 'Chưa có nội dung', 'Sách bị lặp', 'Lỗi hệ thống', 'Báo cáo người dùng', 'Khác'],
    des: "Mô tả",
    placeholder: "Cung cấp thêm thông tin để quá trình xử lý nhanh hơn...",
    back: "Quay lại",
    send: "Gửi",
    sending: "Đang gửi..."
  }
};

const ComplaintPage = () => {
  const [lang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang];
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'WRONG_INFO', 
    description: '',
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.description.trim()) {
      alert("Please type in your complaint!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData), 
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert("Your complaint has been submitted!");
      navigate(-1);
    } catch (error) {
      alert(error.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const complaintTypes = [
    { value: 'WRONG_INFO', label: t.probLists[0] },
    { value: 'INAPPROPRIATE_REVIEW', label: t.probLists[1] },
    { value: 'COPYRIGHT_VIOLATION', label: t.probLists[2] },
    { value: 'MISSING_CONTENT', label: t.probLists[3] },
    { value: 'DUPLICATE_BOOK', label: t.probLists[4] },
    { value: 'TECHNICAL_ISSUE', label: t.probLists[5] },
    { value: 'USER_CONDUCT', label: t.probLists[6] },
    { value: 'OTHER', label: t.probLists[7] },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SimpleHeader />
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-indigo-600 p-4 flex items-center gap-3 text-white">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{t.formHeader}</span>
          </div>

          <form className="p-8 space-y-8" onSubmit={handleSubmit}>
            {/* DROP DOWN LIST */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                <HelpCircle size={16} className="text-indigo-500" />
                {t.probQues}
              </label>
              <div className="relative group">
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full appearance-none pl-4 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all text-gray-700 font-medium cursor-pointer"
                >
                  {complaintTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* TEXTAREA CHI TIẾT */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                <FileText size={16} className="text-indigo-500" />
                {t.des}
              </label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t.placeholder}
                className="w-full min-h-[180px] p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all text-gray-700 leading-relaxed"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                {t.back}
              </button>
              <button 
                type="submit"
                disabled={loading} 
                className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                {loading ? t.sending : t.send} <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintPage;