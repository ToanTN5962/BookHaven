import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, User, ChevronDown, BookOpen, 
  CheckCircle, Bookmark, XCircle, ChevronLeft, ChevronRight, Star 
} from 'lucide-react';

const AfterLoginHeader = () => {
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const q = (query || '').trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight cursor-pointer" onClick={() => navigate("/")}>
          BOOKHAVEN
        </h1>
        <div className="hidden lg:flex gap-6 text-gray-600 font-medium">
          <a href="#" className="hover:text-indigo-600" onClick={(e) => { e.preventDefault(); navigate('/mylibrary'); }}>My Library</a>
          <a href="#" className="hover:text-indigo-600">Community</a>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-1 max-w-xl mx-8">
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
            placeholder="Search for your next adventure..."
            className="w-full pl-4 pr-10 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
          />
          <button type="button" onClick={handleSearch} className="absolute right-3 top-2.5 text-gray-400">
            <Search size={18} />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button 
          className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-100 rounded-full transition-all border border-gray-100"
          onClick={() => navigate("/profile")}
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <User size={20} />
          </div>
          <span className="font-semibold text-sm text-gray-700">{user?.fullName || 'Profile'}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </nav>
  );
};

const SidebarBookshelf = () => {
  const [bookshelf, setBookshelf] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookshelf = async () => {
      const user = JSON.parse(localStorage.getItem("user")); 
      console.log("user từ localStorage:", user);
      if (!user) return setLoading(false);

      try {
        const res = await fetch(`http://localhost:3000/api/users/getbookshelfinfo/${user.id}`);
        console.log("response status:", res.status);
        const data = await res.json();
        console.log("data từ API:", data);
        setBookshelf(data);
      } catch (error) {
        console.error("Error fetching bookshelf:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookshelf();
  }, []);

  const hasStats = bookshelf && bookshelf.stats;
  const stats = hasStats
    ? [
        { label: "Reading",      count: bookshelf.stats.reading,  icon: <BookOpen size={18} />,   color: "text-blue-500" },
        { label: "Want to Read", count: bookshelf.stats.wishlist,  icon: <Bookmark size={18} />,   color: "text-amber-500" },
        { label: "Completed",    count: bookshelf.stats.read,      icon: <CheckCircle size={18} />, color: "text-emerald-500" },
        { label: "Dropped",      count: bookshelf.stats.drop,      icon: <XCircle size={18} />,    color: "text-red-400" },
      ]
    : [
      { label: "Reading",      count: 0, icon: <BookOpen size={18} />,    color: "text-blue-500" },
      { label: "Want to Read", count: 0, icon: <Bookmark size={18} />,    color: "text-amber-500" },
      { label: "Completed",    count: 0, icon: <CheckCircle size={18} />, color: "text-emerald-500" },
      { label: "Dropped",      count: 0, icon: <XCircle size={18} />,     color: "text-red-400" },
    ];

  return (
    <aside className="w-full lg:w-72 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          Your Bookshelf
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

        <div className="mt-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Recently Added
          </p>
          <div className="flex -space-x-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="w-12 h-16 bg-gray-100 rounded-md animate-pulse border-2 border-white" />
              ))
            ) : (
              <>
                {(bookshelf?.recentBooks || []).map((book) => (
                  <div
                    key={book.id}
                    className="w-12 h-16 rounded-md border-2 border-white shadow-lg transform hover:-translate-y-2 transition-transform cursor-pointer overflow-hidden"
                  >
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        onError={(e) => {
                          e.target.src = "https://placehold.co/150x200?text=No+Cover";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-200 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                        No Cover
                      </div>
                    )}
                  </div>
                ))}
                <div className="w-12 h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-lg">+</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

const DetailedBookCard = ({ book }) => {
  const navigate = useNavigate();
  return (
  <div className="flex gap-6 bg-white p-5 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group cursor-pointer" onClick={() => navigate(`/books/${book.id}`)}>
    <div className="w-32 h-44 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
      {book.thumbnail ? (
        <img
          src={book.thumbnail}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
          No Cover
        </div>
      )}
    </div>
    <div onClick={() => navigate(`/books/${book.id}`)} className="flex flex-col flex-1">
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
      
      {/* Cố định độ dài nội dung tóm tắt để card đồng đều */}
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
        <button onClick={() => navigate(`/books/${book.id}`)} className="text-sm font-bold text-indigo-600 hover:underline">
          View Detail
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

  useEffect(() => {
    let ac = new AbortController();
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/books/random?page=${currentPage}`, { signal: ac.signal });
        console.log('fetch random books status', response.status);
        if (!response.ok) {
          console.warn('Books API returned non-OK status');
          setBooks([]);
          return;
        }
        const data = await response.json();
        console.log('books api data', data);
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
  }, [currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

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

    // middle
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
      <AfterLoginHeader />
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Sidebar */}
          <SidebarBookshelf />

          {/* Right: Hot Content */}
          <section className="flex-1">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">Explore new books</h2>
                <p className="text-gray-500">Discover interesting books recently</p>
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

            <div className="grid grid-cols-1 gap-6">
              {loading ? (
                <div className="text-center text-gray-400 py-20">Loading...</div>
              ) : (
                books.map((book) => (
                  <DetailedBookCard key={book.id} book={book} />
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

                    // ellipsis
                    return (
                      <button
                        key={`e-${idx}`}
                        onClick={() => {
                          if (it.direction === 'right') setCurrentPage(p => Math.min(totalPages, p + 2));
                          else setCurrentPage(p => Math.max(1, p - 2));
                        }}
                        className="w-10 h-10 rounded-xl font-bold transition-all bg-white text-gray-400 hover:bg-gray-50"
                        title={it.direction === 'right' ? 'Jump forward 2 pages' : 'Jump back 2 pages'}
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
              <div className="text-sm text-gray-500 font-medium">Page {currentPage} of {totalPages}</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}