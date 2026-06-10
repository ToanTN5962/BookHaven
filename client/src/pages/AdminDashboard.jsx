import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, AlertTriangle, Star,
  Search, Plus, ChevronRight, LogOut,
  CheckCircle, XCircle, Clock,
  Edit3, Trash2, Eye, Bell,
  BarChart3, ShieldCheck, BookMarked,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Từ điển đa ngôn ngữ (Dictionary)
// ---------------------------------------------------------------------------
const translations = {
  en: {
    adminConsole: "Admin Console",
    overview: "Overview",
    books: "Books",
    complaints: "Complaints",
    users: "Users",
    settings: "Settings",
    logout: "Log out",
    searchPlaceholder: "Search books…",
    addBook: "Add Book",
    addNewBook: "Add New Book",
    title: "Title",
    author: "Author",
    genre: "Genre",
    publisher: "Publisher",
    year: "Year",
    language: "Language",
    description: "Description",
    cancel: "Cancel",
    totalBooks: "Total Books",
    registeredUsers: "Registered Users",
    pendingComplaints: "Pending Complaints",
    requiresAttention: "Requires attention",
    averageRating: "Average Rating",
    recentComplaints: "Recent Complaints",
    recentBooks: "Recent Books",
    newUsers: "New Users",
    viewAll: "View all",
    allBooks: "All Books",
    noBooks: "No books found.",
    all: "All",
    noComplaints: "No complaints found.",
    resolve: "Resolve",
    reject: "Reject",
    fullManagement: "Full Management",
    view: "View",
    edit: "Edit",
    delete: "Delete"
  },
  vi: {
    adminConsole: "Bảng điều khiển Admin",
    overview: "Tổng quan",
    books: "Sách",
    complaints: "Khiếu nại",
    users: "Người dùng",
    settings: "Cài đặt",
    logout: "Đăng xuất",
    searchPlaceholder: "Tìm kiếm sách…",
    addBook: "Thêm sách",
    addNewBook: "Thêm sách mới",
    title: "Tiêu đề",
    author: "Tác giả",
    genre: "Thể loại",
    publisher: "Nhà xuất bản",
    year: "Năm xuất bản",
    language: "Ngôn ngữ",
    description: "Mô tả",
    cancel: "Hủy",
    totalBooks: "Tổng số sách",
    registeredUsers: "Người dùng đăng ký",
    pendingComplaints: "Khiếu nại chưa xử lý",
    requiresAttention: "Cần chú ý",
    averageRating: "Đánh giá trung bình",
    recentComplaints: "Khiếu nại gần đây",
    recentBooks: "Sách mới thêm gần đây",
    newUsers: "Thành viên mới",
    viewAll: "Xem tất cả",
    allBooks: "Tất cả sách",
    noBooks: "Không tìm thấy cuốn sách nào.",
    all: "Tất cả",
    noComplaints: "Không có khiếu nại nào.",
    resolve: "Giải quyết",
    reject: "Từ chối",
    fullManagement: "Quản lý toàn diện",
    view: "Xem",
    edit: "Sửa",
    delete: "Xóa"
  }
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getStatusConfig = (t) => ({
  SOLVING:  { label: t === 'vi' ? 'Đang xử lý' : 'Solving',  color: 'bg-amber-50 text-amber-600 border border-amber-200',     icon: <Clock size={11} /> },
  SOLVED:   { label: t === 'vi' ? 'Đã giải quyết' : 'Solved',   color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', icon: <CheckCircle size={11} /> },
  REJECTED: { label: t === 'vi' ? 'Đã từ chối' : 'Rejected', color: 'bg-red-50 text-red-500 border border-red-200',           icon: <XCircle size={11} /> },
});

const TYPE_LABEL = {
  WRONG_INFO:           'Wrong Info',
  INAPPROPRIATE_REVIEW: 'Bad Review',
  COPYRIGHT_VIOLATION:  'Copyright',
  MISSING_CONTENT:      'Missing Content',
  DUPLICATE_BOOK:       'Duplicate',
  TECHNICAL_ISSUE:      'Technical',
  USER_CONDUCT:         'User Conduct',
  OTHER:                'Other',
};

const userLabel = (u) => {
  if (!u) return 'Unknown';
  if (typeof u === 'string') return u;
  return u.fullName || u.email || String(u.id || 'Unknown');
};

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
const StatCard = ({ icon, label, value, sub, iconBg, iconColor, onClick }) => (
  <button
    onClick={onClick}
    className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all text-left overflow-hidden w-full"
  >
    <div className={`inline-flex p-3 rounded-xl mb-4 ${iconBg}`}>
      <span className={iconColor}>{icon}</span>
    </div>
    <p className="text-3xl font-black text-gray-900 mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="text-sm font-semibold text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    <ChevronRight size={15} className="absolute bottom-5 right-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
  </button>
);

// ---------------------------------------------------------------------------
// Add Book Modal
// ---------------------------------------------------------------------------
const AddBookModal = ({ onClose, onSave, lang }) => {
  const [form, setForm] = useState({ title: '', author: '', genre: '', year: '', publisher: '', language: 'en', description: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const t = translations[lang];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900">{t.addNewBook}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><XCircle size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: t.title,     key: 'title',     placeholder: 'Book title' },
            { label: t.author,    key: 'author',    placeholder: 'Author name' },
            { label: t.genre,     key: 'genre',     placeholder: 'e.g. Fiction, Sci-Fi' },
            { label: t.publisher, key: 'publisher', placeholder: 'Publisher name' },
            { label: t.year,      key: 'year',      placeholder: 'Published year' },
            { label: t.language,  key: 'language',  placeholder: 'e.g. en, vi' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">{f.label}</label>
              <input
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">{t.description}</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief description of the book…"
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">{t.cancel}</button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex-[2] py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Plus size={15} /> {t.addBook}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [search,      setSearch]      = useState('');
  const [complaints,  setComplaints]  = useState([]);
  const [books,       setBooks]       = useState([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [activeTab,   setActiveTab]   = useState('overview');
  const [stats,       setStats]       = useState({ totalBooks: 0, totalUsers: 0, pendingComplaints: 0, avgRating: 0 });
  const [filterStatus, setFilterStatus] = useState('All');

  // Đồng bộ hóa State ngôn ngữ thông qua Local Storage
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang];
  const statusConfig = getStatusConfig(lang);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const filteredComplaints = filterStatus === 'All'
    ? complaints
    : complaints.filter(c => c.status === filterStatus);

  const pendingCount = complaints.filter(c => c.status === 'SOLVING').length;
  const complaintCounts = {
    SOLVING: complaints.filter(c => c.status === 'SOLVING').length,
    SOLVED: complaints.filter(c => c.status === 'SOLVED').length,
    REJECTED: complaints.filter(c => c.status === 'REJECTED').length,
  };

  const handleResolve = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'SOLVED' } : c));
    setStats(s => ({ ...s, pendingComplaints: Math.max(0, s.pendingComplaints - 1) }));
  };

  const handleReject = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED' } : c));
    setStats(s => ({ ...s, pendingComplaints: Math.max(0, s.pendingComplaints - 1) }));
  };

  const handleAddBook = (form) => {
    const newBook = { id: Date.now(), title: form.title, author: form.author, genre: form.genre, year: parseInt(form.year) || 2024, rating: 0 };
    setBooks(prev => [newBook, ...prev]);
    setStats(s => ({ ...s, totalBooks: s.totalBooks + 1 }));
  };

  useEffect(() => {
    const ac = new AbortController();

    const fetchAdmin = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/admin/statinfo', { signal: ac.signal });
        if (!res.ok) return;
        const data = await res.json();
        const complaintsFromServer = (data.complaints || []).map(c => ({ ...c, status: c.solvingStatus || c.status }));
        setComplaints(complaintsFromServer);
        setStats(s => ({
          totalBooks: data.nyt?.count ?? s.totalBooks,
          totalUsers: data.user?.userCount ?? s.totalUsers,
          pendingComplaints: (data.complaintCount && (data.complaintCount.SOLVING || data.complaintCount.SOLVING === 0)) ? (data.complaintCount.SOLVING || 0) : complaintsFromServer.filter(c => c.status === 'SOLVING').length,
          avgRating: s.avgRating,
        }));
      } catch (e) {
        // ignore
      }
    };

    const fetchTopRated = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/books/toprate');
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map((b, i) => ({
          id: b.isbn13 || b.isbn || `${b.title}-${i}`,
          title: b.title || '',
          author: b.author || '',
          year: b.publishedDate ? (('' + b.publishedDate).slice(0,4)) : '',
          rating: typeof b.rating === 'number' ? b.rating : (b.rating || 'N/A'),
        }));
        if (mapped.length) setBooks(mapped);

        const nums = mapped.map(x => Number(x.rating)).filter(n => !isNaN(n));
        if (nums.length) {
          const avg = (nums.reduce((a,b) => a+b, 0) / nums.length).toFixed(1);
          setStats(s => ({ ...s, avgRating: avg }));
        }
      } catch (e) {
        // ignore
      }
    };

    fetchAdmin();
    fetchTopRated();

    return () => ac.abort();
  }, []);

  const TABS = [
    { id: 'overview',   label: t.overview,   icon: <BarChart3 size={16} /> },
    { id: 'books',      label: t.books,      icon: <BookMarked size={16} /> },
    { id: 'complaints', label: t.complaints, icon: <AlertTriangle size={16} />, badge: pendingCount },
    { id: 'users',      label: t.users,      icon: <Users size={16} /> },
  ];

  // Mock dữ liệu người dùng mới mẫu (ở bài toán thực tế sẽ fetch từ API)
  const MOCK_RECENT_USERS = [
    { id: 1, fullName: 'Nguyen Van A', email: 'vana@mail.com',  role: 'USER',  createdAt: '1h ago' },
    { id: 2, fullName: 'Tran Thi B',   email: 'thib@mail.com',  role: 'USER',  createdAt: '3h ago' },
    { id: 3, fullName: 'Le Minh C',    email: 'minhc@mail.com', role: 'ADMIN', createdAt: '1d ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      {showAddBook && <AddBookModal onClose={() => setShowAddBook(false)} onSave={handleAddBook} lang={lang} />}

      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200 flex flex-col z-40 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-black text-gray-900 tracking-tight">
            BOOK<span className="text-indigo-600">HAVEN</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">{t.adminConsole}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">{tab.icon} {tab.label}</div>
              {tab.badge > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-red-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
          <button
            onClick={() => navigate('/admin/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all"
          >
            <ShieldCheck size={16} /> {t.settings}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ml-60 min-h-screen">

        {/* Top bar với bộ chuyển đổi ngôn ngữ */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-lg font-black text-gray-900 capitalize">
              {TABS.find(x => x.id === activeTab)?.label || activeTab}
            </h2>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            
            {/* NÚT GẠT ĐỔI NGÔN NGỮ (TOGGLE SWITCH) */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 mr-2">
              <button 
                onClick={() => setLang('en')}
                className={`text-xs font-black px-2.5 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('vi')}
                className={`text-xs font-black px-2.5 py-1 rounded-lg transition-all ${lang === 'vi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                VI
              </button>
            </div>

            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white w-56 transition-all"
              />
            </div>
            <button
              onClick={() => setShowAddBook(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200"
            >
              <Plus size={15} /> {t.addBook}
            </button>
            <button className="relative p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="p-8">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard icon={<BookOpen size={20} />}      label={t.totalBooks}         value={stats.totalBooks}          iconBg="bg-indigo-50"  iconColor="text-indigo-600" onClick={() => setActiveTab('books')} />
                <StatCard icon={<Users size={20} />}         label={t.registeredUsers}    value={stats.totalUsers}          iconBg="bg-violet-50"  iconColor="text-violet-600" onClick={() => setActiveTab('users')} />
                <StatCard icon={<AlertTriangle size={20} />} label={t.pendingComplaints}   value={stats.pendingComplaints}   iconBg="bg-rose-50"    iconColor="text-rose-500"   onClick={() => setActiveTab('complaints')} sub={t.requiresAttention} />
                <StatCard icon={<Star size={20} />}          label={t.averageRating}      value={`${stats.avgRating} / 5`} iconBg="bg-amber-50"   iconColor="text-amber-500"  onClick={() => {}} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent complaints */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 flex items-center gap-2">
                      <AlertTriangle size={15} className="text-rose-400" /> {t.recentComplaints}
                    </h3>
                    <button onClick={() => { setFilterStatus('All'); setActiveTab('complaints'); }} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                      {t.viewAll} <ChevronRight size={13} />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {complaints.slice(0, 3).map(c => (
                      <div key={c.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            {TYPE_LABEL[c.type]}
                          </span>
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${statusConfig[c.status].color}`}>
                            {statusConfig[c.status].icon} {statusConfig[c.status].label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 font-medium truncate">{c.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{userLabel(c.user)} · {c.createdAt}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent books */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 flex items-center gap-2">
                      <BookOpen size={15} className="text-indigo-500" /> {t.recentBooks}
                    </h3>
                    <button onClick={() => setActiveTab('books')} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                      {t.viewAll} <ChevronRight size={13} />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {books.slice(0, 4).map(b => (
                      <div key={b.id} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen size={13} className="text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{b.title}</p>
                          <p className="text-xs text-gray-400">{b.author} · {b.year}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star size={11} className="fill-amber-400" /> {b.rating}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent users */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <Users size={15} className="text-violet-500" /> {t.newUsers}
                  </h3>
                  <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                    {t.viewAll} <ChevronRight size={13} />
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {MOCK_RECENT_USERS.map(u => (
                    <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-black text-sm flex-shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.role}
                      </span>
                      <span className="text-xs text-gray-400">{u.createdAt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BOOKS TAB ── */}
          {activeTab === 'books' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-black text-gray-900">
                  {t.allBooks} <span className="text-gray-400 font-normal text-sm">({filteredBooks.length})</span>
                </h3>
                <button
                  onClick={() => setShowAddBook(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={13} /> {t.addBook}
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {filteredBooks.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">{t.noBooks}</p>
                  </div>
                ) : filteredBooks.map(b => (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-12 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen size={15} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{b.title}</p>
                      <p className="text-xs text-gray-400">{b.author} · {b.genre} · {b.year}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mr-4">
                      <Star size={12} className="fill-amber-400" /> {b.rating}
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/books/${b.id}`)}            title={t.view}   className="p-1.5 bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-colors"><Eye size={14} /></button>
                      <button onClick={() => navigate(`/admin/books/${b.id}/edit`)} title={t.edit}   className="p-1.5 bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-600 rounded-lg transition-colors"><Edit3 size={14} /></button>
                      <button onClick={() => setBooks(prev => prev.filter(x => x.id !== b.id))} title={t.delete} className="p-1.5 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── COMPLAINTS TAB ── */}
          {activeTab === 'complaints' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {['SOLVING', 'SOLVED', 'REJECTED'].map(k => (
                  <div key={k} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold">{statusConfig[k].label}</p>
                      <p className="text-2xl font-black text-gray-900">{complaintCounts[k]}</p>
                    </div>
                    <div className="ml-4">
                      <span className={`${statusConfig[k].color} px-3 py-1 rounded-full text-xs font-black`}>{statusConfig[k].icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {['All', 'SOLVING', 'SOLVED', 'REJECTED'].map(f => {
                  const count = f === 'All' ? complaints.length : complaints.filter(c => c.status === f).length;
                  const labelDisplay = f === 'All' ? t.all : statusConfig[f]?.label || f;
                  return (
                    <button
                      key={f}
                      onClick={() => setFilterStatus(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        filterStatus === f
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-500'
                      }`}
                    >
                      {labelDisplay} <span className={`ml-1 ${filterStatus === f ? 'text-white/70' : 'text-gray-400'}`}>({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm divide-y divide-gray-50">
                {filteredComplaints.length === 0 ? (
                  <div className="py-16 text-center text-gray-400">
                    <AlertTriangle size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">{t.noComplaints}</p>
                  </div>
                ) : filteredComplaints.map(c => (
                  <div key={c.id} className="flex items-start gap-4 px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle size={14} className="text-rose-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {TYPE_LABEL[c.type]}
                        </span>
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${statusConfig[c.status].color}`}>
                          {statusConfig[c.status].icon} {statusConfig[c.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">{c.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{userLabel(c.user)} · {c.createdAt}</p>
                    </div>
                    {c.status === 'SOLVING' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleResolve(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-200"
                        >
                          <CheckCircle size={13} /> {t.resolve}
                        </button>
                        <button
                          onClick={() => handleReject(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-red-200"
                        >
                          <XCircle size={13} /> {t.reject}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-black text-gray-900">{t.newUsers}</h3>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                >
                  {t.fullManagement} <ChevronRight size={13} />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {MOCK_RECENT_USERS.map(u => (
                  <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600 font-black text-sm flex-shrink-0">
                      {u.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{u.fullName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                      u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.role}
                    </span>
                    <span className="text-xs text-gray-400">{u.createdAt}</span>
                    <button
                      onClick={() => navigate(`/admin/users/${u.id}`)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-all"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}