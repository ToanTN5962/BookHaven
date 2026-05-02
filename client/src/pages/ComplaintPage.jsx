import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Send, FileText, ChevronDown, HelpCircle } from 'lucide-react';

const ComplaintPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'WRONG_INFO', 
    description: '',
  });

  const complaintTypes = [
    { value: 'WRONG_INFO', label: 'The book information is incorrect' },
    { value: 'INAPPROPRIATE_REVIEW', label: 'Violation/Offensive reviews' },
    { value: 'COPYRIGHT_VIOLATION', label: 'Copyright infringement' },
    { value: 'MISSING_CONTENT', label: 'Content is missing' },
    { value: 'DUPLICATE_BOOK', label: 'Duplicate book' },
    { value: 'TECHNICAL_ISSUE', label: 'Technical/System error' },
    { value: 'USER_CONDUCT', label: 'Report user' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-indigo-600 p-4 flex items-center gap-3 text-white">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">Your report will help BookHaven cleaner and more accurate.</span>
          </div>

          <form className="p-8 space-y-8">
            {/* DROP DOWN LIST */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                <HelpCircle size={16} className="text-indigo-500" />
                What's your problem?
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
                Description
              </label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Provide additional information for faster processing..."
                className="w-full min-h-[180px] p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all text-gray-700 leading-relaxed"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                Back
              </button>
              <button 
                type="submit" 
                className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Send <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintPage;