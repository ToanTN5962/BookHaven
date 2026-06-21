import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Search, User, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchHeader = () => {
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
        <NotificationBell />
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

export default function SearchResults() {
  const query = useQuery();
  const q = query.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [q]);

  useEffect(() => {
    if (!q) return setBooks([]), setLoading(false);
    let ac = new AbortController();
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/books/search?q=${encodeURIComponent(q)}&page=${currentPage}`, { signal: ac.signal });
        if (!res.ok) return setBooks([]);
        const data = await res.json();
        const normalize = (b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          rating: b.rating ?? b.averageRating ?? b.ratingsCount ?? 'N/A',
          thumbnail: b.thumbnail || b.book_image || b.cover || b.imageUrl || null,
          summary: b.summary || b.description || b.subtitle || '',
          tags: b.tags || b.categories || b.genres || [],
        });

        setBooks((data.books || []).map(normalize));
        setTotalPages(data && data.totalPages ? Number(data.totalPages) : 1);
      } catch (e) {
        console.error('Search error', e);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
    return () => ac.abort();
  }, [q, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

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
      <SearchHeader />
      <section className="flex-1">
        <div className="max-w-6xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Search results for "{q}"
            </h2>
          </div>

          {/* Book cards */}
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : books.length === 0 ? (
            <div className="text-gray-500">No results found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {books.map((book) => (
                <DetailedBookCard key={book.id} book={book} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-10 mb-10 flex flex-col items-center gap-3">
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
            <div className="text-sm text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
