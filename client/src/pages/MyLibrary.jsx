import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Bell, User, ChevronDown,
  BookOpen, Bookmark, CheckCircle, XCircle,
  Star, ChevronRight, BookX, BookMarked, Smile
} from 'lucide-react';

const AfterLoginHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <h1
          className="text-2xl font-bold text-indigo-600 tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          BOOKHAVEN
        </h1>
        <div className="hidden lg:flex gap-6 text-gray-600 font-medium">
          <span
            className="text-indigo-600 border-b-2 border-indigo-600 pb-0.5 cursor-pointer"
          >
            My Library
          </span>
          <a href="#" className="hover:text-indigo-600">Community</a>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-1 max-w-xl mx-8">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search for your next adventure..."
            className="w-full pl-4 pr-10 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button
          className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-100 rounded-full transition-all border border-gray-100"
          onClick={() => navigate("/profile")}
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <User size={20} />
          </div>
          <span className="font-semibold text-sm text-gray-700">{user?.fullName}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </nav>
  );
};

// Book Card 
const BookCard = ({ book, type }) => {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col cursor-pointer group"
      onClick={() => navigate(`/books/${book.id}`)}
    >
      {/* Cover */}
      <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
        {book.cover && !imgError ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2 leading-snug">
            {book.title}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {book.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>

        {/* Reading progress */}
        {type === 'reading' && book.progress != null && (
          <div className="mt-1.5">
            <div className="w-full h-1 bg-gray-200 rounded-full">
              <div
                className="h-1 bg-indigo-500 rounded-full"
                style={{ width: `${book.progress}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5 block">{book.progress}%</span>
          </div>
        )}

        {/* Star rating */}
        {type === 'read' && book.rating != null && (
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                size={10}
                className={s <= book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Section Config 
const SECTION_CONFIG = {
  reading: {
    label: 'Đang đọc',
    icon: <BookOpen size={18} />,
    colorIcon: 'text-blue-500',
    colorBadge: 'bg-blue-50 text-blue-700',
    emptyIcon: <BookX size={36} />,
    emptyText: 'Bạn chưa đang đọc cuốn sách nào',
    emptySubtext: 'Thêm sách vào danh sách đang đọc để bắt đầu',
  },
  wishlist: {
    label: 'Muốn đọc',
    icon: <Bookmark size={18} />,
    colorIcon: 'text-amber-500',
    colorBadge: 'bg-amber-50 text-amber-700',
    emptyIcon: <BookMarked size={36} />,
    emptyText: 'Chưa có sách nào trong danh sách muốn đọc',
    emptySubtext: 'Khám phá sách và thêm vào wishlist của bạn',
  },
  read: {
    label: 'Đã đọc',
    icon: <CheckCircle size={18} />,
    colorIcon: 'text-emerald-500',
    colorBadge: 'bg-emerald-50 text-emerald-700',
    emptyIcon: <CheckCircle size={36} />,
    emptyText: 'Bạn chưa hoàn thành cuốn sách nào',
    emptySubtext: 'Đánh dấu hoàn thành những cuốn bạn đã đọc xong',
  },
  drop: {
    label: 'Đã bỏ',
    icon: <XCircle size={18} />,
    colorIcon: 'text-red-400',
    colorBadge: 'bg-red-50 text-red-600',
    emptyIcon: <Smile size={36} />,
    emptyText: 'Bạn chưa bỏ sách nào',
    emptySubtext: 'Tốt lắm! Hãy tiếp tục duy trì thói quen đọc sách',
  },
};

// Library Section 
const LibrarySection = ({ type, books, loading }) => {
  const navigate = useNavigate();
  const cfg = SECTION_CONFIG[type];
  const shown = books.slice(0, 5);
  const hasMore = books.length > 5;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className={cfg.colorIcon}>{cfg.icon}</span>
          <h2 className="font-bold text-gray-800 text-lg">{cfg.label}</h2>
          {!loading && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.colorBadge}`}>
              {books.length}
            </span>
          )}
        </div>
        {hasMore && (
          <button
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
            onClick={() => navigate(`/library/${type}`)}
          >
            Xem thêm <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-full aspect-[2/3] bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-3 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-gray-400">
          <span className="opacity-40 mb-3">{cfg.emptyIcon}</span>
          <p className="text-sm font-medium text-gray-500">{cfg.emptyText}</p>
          <p className="text-xs text-gray-400 mt-1">{cfg.emptySubtext}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shown.map(book => (
            <BookCard key={book.id} book={book} type={type} />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Page 
export default function MyLibraryPage() {
  const [library, setLibrary] = useState({
    reading: [],
    wishlist: [],
    read: [],
    drop: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return setLoading(false);

      try {
        const res = await fetch(`http://localhost:3000/api/users/getbookshelfinfo/${user.id}`);
        const data = await res.json();
        setLibrary({
          reading: data.stats.reading || [],
          wishlist: data.stats.wishlist || [],
          read: data.stats.read || [],
          drop: data.stats.drop || [],
        });
      } catch (err) {
        console.error("Error fetching library:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  const totalBooks = Object.values(library).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
      <AfterLoginHeader />

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Library</h1>
          <p className="text-gray-500 mt-1">
            {loading ? 'Đang tải...' : `${totalBooks} cuốn sách trong thư viện của bạn`}
          </p>
        </div>

        {/* Stats summary */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {Object.entries(SECTION_CONFIG).map(([key, cfg]) => (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                <span className={cfg.colorIcon}>{cfg.icon}</span>
                <div>
                  <p className="text-xs text-gray-500">{cfg.label}</p>
                  <p className="text-xl font-bold text-gray-800">{library[key].length}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sections */}
        <div className="space-y-6">
          {['reading', 'wishlist', 'read', 'drop'].map(type => (
            <LibrarySection
              key={type}
              type={type}
              books={library[type]}
              loading={loading}
            />
          ))}
        </div>
      </main>
    </div>
  );
}