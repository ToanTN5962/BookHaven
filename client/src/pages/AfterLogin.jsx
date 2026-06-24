import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHotBooksSessionId } from '../utils/hotBooksSession';
import NotificationBell from '../components/NotificationBell';
import { 
  Search, User, ChevronDown, BookOpen, 
  CheckCircle, Bookmark, XCircle, ChevronLeft, ChevronRight, Star,
  ShieldCheck,
  Flame, Calendar, Award, Check
} from 'lucide-react';

// 1. Kho dữ liệu ngôn ngữ
const translations = {
  en: {
    myLibrary: "My Library",
    community: "Community",
    searchPlaceholder: "Search for your next adventure...",
    profile: "Profile",
    yourBookshelf: "Your Bookshelf",
    reading: "Reading",
    wantToRead: "Want to Read",
    completed: "Completed",
    dropped: "Dropped",
    recentlyAdded: "Recently Added",
    noCover: "No Cover",
    exploreTitle: "Explore new books",
    exploreSubtitle: "Discover interesting books recently",
    viewDetail: "View Detail",
    loading: "Loading...",
    pageOf: "Page {current} of {total}",
    bookFilter: "Book Filter",
    noBooksFound: "No books found for this filter.",
    streakTitle: "Daily Reading Streak",
    streakActive: "{count} Days Streak!",
    streakInactive: "Start reading today!",
    streakOnsiteProgress: "Onsite: {current}/{target} min",
    challengeTitle: "Reading Challenge {year}",
    challengeProgress: "{completed}/12 Months completed",
    challengeMonthLabel: "Month {month}",
    filters: {
      all: "All Books",
      hot: "Hot Books",
      technology: "Technology",
      science: "Science",
      literature: "Literature",
      business: "Business",
      fantasy: "Fantasy",
      romance: "Romance",
      mystery: "Mystery",
      history: "History",
      selfHelp: "Self Help",
      youngAdult: "Young Adult",
      children: "Children"
    }
  },
  vi: {
    myLibrary: "Thư viện của tôi",
    community: "Cộng đồng",
    searchPlaceholder: "Tìm kiếm cuộc phiêu lưu tiếp theo...",
    profile: "Hồ sơ",
    yourBookshelf: "Kệ sách của bạn",
    reading: "Đang đọc",
    wantToRead: "Muốn đọc",
    completed: "Đã hoàn thành",
    dropped: "Tạm ngưng",
    recentlyAdded: "Vừa thêm gần đây",
    noCover: "Không có ảnh bìa",
    exploreTitle: "Khám phá sách mới",
    exploreSubtitle: "Tìm kiếm những cuốn sách thú vị gần đây",
    viewDetail: "Xem chi tiết",
    loading: "Đang tải...",
    pageOf: "Trang {current} trên {total}",
    bookFilter: "Bộ lọc sách",
    noBooksFound: "Không tìm thấy sách cho bộ lọc này.",
    streakTitle: "Chuỗi đọc sách ngày",
    streakActive: "Chuỗi {count} ngày liên tiếp!",
    streakInactive: "Đọc sách giữ chuỗi ngay!",
    streakOnsiteProgress: "Duyệt web: {current}/{target} phút",
    challengeTitle: "Thử thách năm {year}",
    challengeProgress: "Đã đạt {completed}/12 tháng",
    challengeMonthLabel: "Tháng {month}",
    filters: {
      all: "Tất cả sách",
      hot: "Sách hot",
      technology: "Công nghệ",
      science: "Khoa học",
      literature: "Văn học",
      business: "Kinh doanh",
      fantasy: "Kỳ ảo",
      romance: "Lãng mạn",
      mystery: "Bí ẩn",
      history: "Lịch sử",
      selfHelp: "Tự lực",
      youngAdult: "Thanh thiếu niên",
      children: "Thiếu nhi"
    }
  }
};

const bookFilterOptions = [
  { value: 'all', labelKey: 'all' },
  { value: 'hot', labelKey: 'hot' },
  { value: 'technology', labelKey: 'technology' },
  { value: 'science', labelKey: 'science' },
  { value: 'literature', labelKey: 'literature' },
  { value: 'business', labelKey: 'business' },
  { value: 'fantasy', labelKey: 'fantasy' },
  { value: 'romance', labelKey: 'romance' },
  { value: 'mystery', labelKey: 'mystery' },
  { value: 'history', labelKey: 'history' },
  { value: 'self-help', labelKey: 'selfHelp' },
  { value: 'young-adult', labelKey: 'youngAdult' },
  { value: 'children', labelKey: 'children' },
];

const AfterLoginHeader = ({ lang, setLang }) => {
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const t = translations[lang];

  const handleSearch = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const q = (query || '').trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight cursor-pointer" onClick={() => navigate("/")}>
          BOOKHAVEN
        </h1>
        <div className="hidden lg:flex gap-6 text-gray-600 font-medium">
          <a href="#" className="hover:text-indigo-600" onClick={(e) => { e.preventDefault(); navigate('/mylibrary'); }}>{t.myLibrary}</a>
          <a href="#" className="hover:text-indigo-600">{t.community}</a>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-1 max-w-xl mx-8">
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-4 pr-10 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
          />
          <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
            <Search size={18} />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200">
          <span 
            className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'}`} 
            onClick={() => setLang('en')}
          >
            EN
          </span>
          <span 
            className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${lang === 'vi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'}`} 
            onClick={() => setLang('vi')}
          >
            VI
          </span>
        </div>

        <NotificationBell />
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => navigate('/admin')}
            title="Admin dashboard"
            className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            <ShieldCheck size={16} className="text-indigo-600" />
            <span className="hidden sm:inline text-sm font-medium text-gray-700">Admin</span>
          </button>
        )}
        <button 
          className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-100 rounded-full transition-all border border-gray-100"
          onClick={() => navigate("/profile")}
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <User size={20} />
          </div>
          <span className="font-semibold text-sm text-gray-700">{user?.fullName || t.profile}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </nav>
  );
};

// 3. Component Sidebar nhận dữ liệu thuần túy qua props, không tự ý quản lý đếm giây nữa
const SidebarBookshelf = ({ lang, bookshelf, gamification, loading }) => {
  const t = translations[lang];

  const count = bookshelf?.stats;
  const stats = [
    { label: t.reading,    count: count?.reading || 0,  icon: <BookOpen size={18} />,   color: "text-blue-500" },
    { label: t.wantToRead, count: count?.wishlist || 0, icon: <Bookmark size={18} />,   color: "text-amber-500" },
    { label: t.completed,  count: count?.read || 0,     icon: <CheckCircle size={18} />, color: "text-emerald-500" },
    { label: t.dropped,    count: count?.drop || 0,     icon: <XCircle size={18} />,    color: "text-red-400" },
  ];

  // Tránh lỗi crash giao diện khi gamification đang null lúc đợi API nạp lần đầu
  const currentStreak = gamification?.streak?.currentStreak || 0;
  const todaySecondsSpent = gamification?.streak?.todaySecondsSpent || 0;
  const isCompletedToday = gamification?.streak?.isCompletedToday || false;
  
  const challengeYear = gamification?.challenge?.year || new Date().getFullYear();
  const completedMonthsCount = gamification?.challenge?.completedMonthsCount || 0;
  const currentMonthPassed = gamification?.challenge?.currentMonthPassed || false;

  const onsiteMinutes = Math.floor(todaySecondsSpent / 60);
  const streakPercent = Math.min(100, (todaySecondsSpent / 300) * 100);
  const challengePercent = Math.min(100, (completedMonthsCount / 12) * 100);

  return (
    <aside className="w-full lg:w-72 space-y-6">
      {/* BOX 1: KỆ SÁCH */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          {t.yourBookshelf}
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3 text-gray-600 group-hover:text-indigo-600 transition-colors">
                  <span className={stat.color}>{stat.icon}</span>
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold text-gray-500 leading-none">
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOX 2: READING STREAK WIDGET */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Flame size={18} className={currentStreak > 0 ? "text-orange-500 fill-orange-500 animate-pulse" : "text-gray-400"} />
            {t.streakTitle}
          </h3>
          {isCompletedToday && (
            <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Done 🎉
            </span>
          )}
        </div>

        <p className="text-sm font-semibold text-gray-700 mb-4">
          {currentStreak > 0 
            ? t.streakActive.replace("{count}", currentStreak)
            : t.streakInactive
          }
        </p>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400 font-medium">
            <span>{t.streakOnsiteProgress.replace("{current}", onsiteMinutes).replace("{target}", 5)}</span>
            <span>{Math.round(streakPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${streakPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* BOX 3: YEARLY READING CHALLENGE WIDGET */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Award size={18} className="text-indigo-600" />
          <h3 className="font-bold text-gray-800">
            {t.challengeTitle.replace("{year}", challengeYear)}
          </h3>
        </div>

        <p className="text-xs text-gray-500 font-medium mb-3">
          {t.challengeProgress.replace("{completed}", completedMonthsCount)}
        </p>

        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
            style={{ width: `${challengePercent}%` }}
          />
        </div>

        <div className="bg-indigo-50/50 p-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-indigo-900">
              {t.challengeMonthLabel.replace("{month}", new Date().getMonth() + 1)}
            </span>
          </div>
          {currentMonthPassed ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
              <Check size={12} strokeWidth={3} />
            </div>
          ) : (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">In Progress</span>
          )}
        </div>
      </div>
    </aside>
  );
};

const DetailedBookCard = ({ book, lang }) => {
  const navigate = useNavigate();
  const t = translations[lang];

  return (
    <div onClick={() => navigate(`/books/${book.id}`)} className="flex gap-6 bg-white p-5 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group cursor-pointer">
      <div className="w-32 h-44 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200 text-xs text-center font-medium">
            {t.noCover}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl text-gray-800 line-clamp-1 mb-1">{book.title}</h3>
            <p className="text-indigo-600 text-sm font-medium mb-2">{book.author}</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-700">{book.rating}</span>
          </div>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
          {book.summary}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex gap-2">
            {(book.tags || []).map((tag, i) => (
              <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase font-bold">
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={() => navigate(`/books/${book.id}`)}
            className="text-sm font-bold text-indigo-600 hover:underline"
          >
            {t.viewDetail}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AfterLoginPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [bookshelf, setBookshelf] = useState(null);
  // Khởi tạo state gamification ban đầu là null để đợi nạp dữ liệu sạch từ DB
  const [gamification, setGamification] = useState(null);

  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  // 1. useEffect: Tải toàn bộ dữ liệu Sidebar (Kệ sách + Trạng thái Gamification gốc từ DB)
  useEffect(() => {
    const fetchSidebarData = async () => {
      const user = JSON.parse(localStorage.getItem("user")); 
      if (!user) return setSidebarLoading(false);

      try {
        const token = localStorage.getItem('token');
        const [bookshelfRes, gamificationRes] = await Promise.all([
          fetch(`http://localhost:3000/api/users/getbookshelfinfo/${user.id}`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          }),
          fetch(`http://localhost:3000/api/gamification/status/${user.id}`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          }).catch(() => null)
        ]);

        const bookshelfData = await bookshelfRes.json();
        setBookshelf(bookshelfData);

        if (gamificationRes && gamificationRes.ok) {
          const gamificationJson = await gamificationRes.json();
          const gd = gamificationJson?.data;
          if (gd) {
            setGamification({
              streak: {
                currentStreak: gd.streak?.currentStreak || 0,
                todaySecondsSpent: gd.streak?.todaySecondsSpent || 0,
                isCompletedToday: gd.streak?.todaySecondsSpent >= 300
              },
              challenge: {
                year: gd.challenge?.year || new Date().getFullYear(),
                completedMonthsCount: (gd.challenge?.allMonthsProgress || []).filter(m => m.isMonthPassed).length,
                currentMonthPassed: gd.challenge?.currentMonthProgress?.isMonthPassed || false
              }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      } finally {
        setSidebarLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  // 2. useEffect: Bộ đếm thời gian chạy ngầm 30s ping lên server một lần
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem('token');
    if (!user || !token) return;

    const PING_INTERVAL = 30000; 

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/gamification/track-time`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ secondsSpent: PING_INTERVAL / 1000 })
        });

        if (response.ok) {
          const resJson = await response.json();
          // Cập nhật state an toàn nhờ Guard Clause chặn giá trị null
          setGamification(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              streak: {
                currentStreak: resJson.data.currentStreak,
                todaySecondsSpent: resJson.data.todaySecondsSpent,
                isCompletedToday: resJson.data.todaySecondsSpent >= 300
              }
            };
          });
        }
      } catch (error) {
        console.error("Không thể cập nhật thời gian hoạt động:", error);
      }
    }, PING_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  // 3. useEffect: Tải danh sách sách khám phá (Giữ nguyên logic của bạn)
  useEffect(() => {
    let ac = new AbortController();
    const fetchBooks = async () => {
      setLoading(true);
      try {
        if (selectedFilter && selectedFilter !== 'all' && selectedFilter !== 'hot') {
          const genre = encodeURIComponent(selectedFilter);
          const response = await fetch(`http://localhost:3000/api/books/toprate?genre=${genre}`, { signal: ac.signal });
          if (!response.ok) {
            setBooks([]);
            setTotalPages(1);
            return;
          }
          const data = await response.json();
          const mapped = (Array.isArray(data) ? data : []).map(item => ({
            id: item.isbn13 || item.isbn || item.title,
            title: item.title,
            author: item.author,
            thumbnail: item.cover || item.book_image || null,
            summary: item.description || '',
            rating: item.rating || 'N/A',
            tags: item.categories || (item.genre ? [item.genre] : []),
          }));
          setBooks(mapped);
          setTotalPages(1);
          return;
        }

        const sessionId = encodeURIComponent(getHotBooksSessionId());
        const filter = encodeURIComponent(selectedFilter);
        const response = await fetch(`http://localhost:3000/api/books/random?page=${currentPage}&sessionId=${sessionId}&category=${filter}`, { signal: ac.signal });
        if (!response.ok) {
          setBooks([]);
          return;
        }
        const data = await response.json();
        setBooks((data && data.books) || []);
        setTotalPages(data && data.totalPages ? Number(data.totalPages) : 1);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error("Error fetching books:", error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    return () => ac.abort();
  }, [currentPage, selectedFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
    setCurrentPage(1);
  };

  const buildPagination = () => {
    const tp = Number(totalPages) || 1;
    const cp = Number(currentPage) || 1;
    const items = [];
    if (tp <= 6) {
      for (let i = 1; i <= tp; i++) items.push({ type: 'page', page: i });
      return items;
    }

    if (cp <= 3) {
      items.push({ type: 'page', page: 1 });
      items.push({ type: 'page', page: 2 });
      items.push({ type: 'page', page: 3 });
      items.push({ type: 'ellipsis', direction: 'right' });
      items.push({ type: 'page', page: tp });
      return items;
    }

    if (cp >= tp - 2) {
      items.push({ type: 'page', page: 1 });
      items.push({ type: 'ellipsis', direction: 'left' });
      items.push({ type: 'page', page: tp - 2 });
      items.push({ type: 'page', page: tp - 1 });
      items.push({ type: 'page', page: tp });
      return items;
    }

    items.push({ type: 'page', page: 1 });
    items.push({ type: 'ellipsis', direction: 'left' });
    items.push({ type: 'page', page: cp - 1 });
    items.push({ type: 'page', page: cp });
    items.push({ type: 'page', page: cp + 1 });
    items.push({ type: 'ellipsis', direction: 'right' });
    items.push({ type: 'page', page: tp });
    return items;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
      <AfterLoginHeader lang={lang} setLang={setLang} />
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Sidebar nhận State dữ liệu từ cha đưa xuống */}
          <SidebarBookshelf 
            lang={lang} 
            bookshelf={bookshelf} 
            gamification={gamification} 
            loading={sidebarLoading} 
          />

          {/* Right: Hot Content */}
          <section className="flex-1">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">{t.exploreTitle}</h2>
                <p className="text-gray-500">{t.exploreSubtitle}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-colors disabled:opacity-50" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={20} />
                </button>
                <button className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-colors"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label htmlFor="book-filter" className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                {t.bookFilter}
              </label>
              <div className="relative w-full sm:w-64">
                <select
                  id="book-filter"
                  value={selectedFilter}
                  onChange={handleFilterChange}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-gray-700 shadow-sm outline-none transition-all focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                >
                  {bookFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t.filters[option.labelKey]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {loading ? (
                <div className="text-center text-gray-400 py-20 font-medium">{t.loading}</div>
              ) : books.length === 0 ? (
                <div className="text-center text-gray-400 py-20 font-medium">{t.noBooksFound}</div>
              ) : (
                books.map((book) => (
                  <DetailedBookCard key={book.id} book={book} lang={lang} />
                ))
              )}
            </div>

            {/* Pagination Controls */}
            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <button
                  className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-1 items-center">
                  {buildPagination().map((it, idx) => {
                    if (it.type === 'page') {
                      return (
                        <button
                          key={`p-${it.page}-${idx}`}
                          onClick={() => setCurrentPage(it.page)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all ${
                            currentPage === it.page
                              ? "bg-indigo-600 text-white shadow-lg"
                              : "bg-white text-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          {it.page}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={`e-${idx}`}
                        onClick={() => {
                          if (it.direction === 'right') setCurrentPage(p => Math.min(totalPages, p + 2));
                          else setCurrentPage(p => Math.max(1, p - 2));
                        }}
                        className="w-10 h-10 rounded-xl font-bold transition-all bg-white text-gray-400 hover:bg-gray-50"
                      >
                        ...
                      </button>
                    );
                  })}
                </div>

                <button
                  className="p-2 border border-gray-200 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {t.pageOf.replace("{current}", currentPage).replace("{total}", totalPages)}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}