import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Calendar, MapPin, 
  BookOpen, Star, MessageSquare, AlertTriangle, 
  Settings, LogOut, ChevronRight, Edit3
} from 'lucide-react';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('bookshelf');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3000/api/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();
      setUser(data.user);
    };

    fetchProfile();
  }, []);

  if (!user) return <div>Loading...</div>;
  //return user;

  const userData = {
    fullName: user.fullName,
    email: user.email,
    phoneNum: user.phoneNum,
    dateOfBirth: user.dateOfBirth,
    sex: user.sex,
    role: user.role,
    createdAt: user.createdAt,
    stats: {
      wishlist: 12,
      reading: 3,
      read: 45,
      drop: 2
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR: THÔNG TIN CÁ NHÂN */}
        <aside className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 border-4 border-indigo-50">
                <User size={48} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{userData.fullName}</h2>
              <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full mt-2 uppercase tracking-wider">
                {userData.role}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-gray-400" />
                <span className="text-sm">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm">{userData.phoneNum}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-sm">Born: {userData.dateOfBirth}</span>
              </div>
            </div>

            <hr className="my-6 border-gray-50" />

            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors">
                <div className="flex items-center gap-3 font-medium">
                  <Settings size={18} /> Settings
                </div>
                <ChevronRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors">
                <div className="flex items-center gap-3 font-medium">
                  <LogOut size={18} /> Log out
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT: TÁC VỤ & LỊCH SỬ */}
        <main className="flex-1">
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(userData.stats).map(([key, value]) => (
              <div key={key} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm text-center">
                <p className="text-2xl font-black text-indigo-600">{value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase mt-1">{key}</p>
              </div>
            ))}
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex border-b border-gray-200 mb-6 gap-8">
            {[
              { id: 'bookshelf', label: 'Bookshelf', icon: <BookOpen size={18} /> },
              { id: 'reviews', label: 'My Reviews', icon: <MessageSquare size={18} /> },
              { id: 'complaints', label: 'Complaints', icon: <AlertTriangle size={18} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${
                  activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon} {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="space-y-4">
            {activeTab === 'bookshelf' && (
              <div className="grid grid-cols-1 gap-4">
                {/* Item mẫu dựa trên model UserBook */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                  <div className="w-12 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">The Radiant Dark</h4>
                    <p className="text-xs text-gray-500">Added on Jan 20, 2024</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase">
                    Reading
                  </span>
                  <button className="p-2 text-gray-400 hover:text-indigo-600">
                    <Edit3 size={16} />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Item mẫu dựa trên model Review */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100">
                  <div className="flex justify-between mb-3">
                    <h4 className="font-bold text-gray-800">Under Water</h4>
                    <div className="flex text-yellow-400"><Star size={14} fill="currentColor" /> 4.5</div>
                  </div>
                  <p className="text-gray-600 text-sm italic">"A very moving story about family and secrets..."</p>
                  <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase">
                    <span>24 Likes</span>
                    <span>Updated 2 days ago</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'complaints' && (
              <div className="space-y-4">
                {/* Item mẫu dựa trên model Complaint */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black bg-red-50 text-red-600 px-2 py-0.5 rounded">WRONG INFO</span>
                      <h4 className="font-bold text-gray-800">Title mismatch for Book ID #24</h4>
                    </div>
                    <p className="text-sm text-gray-500">The author name is incorrect in the description.</p>
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 bg-amber-50 text-amber-600 rounded-full uppercase">
                    Solving
                  </span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;