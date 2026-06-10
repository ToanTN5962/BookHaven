import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Search, Bell, User, ChevronDown } from 'lucide-react';

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
  const navigate = useNavigate();

  useEffect(() => {
    if (!q) return setBooks([]), setLoading(false);
    let ac = new AbortController();
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/books/search?q=${encodeURIComponent(q)}`, { signal: ac.signal });
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
      } catch (e) {
        console.error('Search error', e);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSearch();
    return () => ac.abort();
  }, [q]);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
      <SearchHeader />
      <div className="max-w-6xl mx-auto px-8 py-8">
        <h2 className="text-2xl font-bold mb-4">Search results for "{q}"</h2>
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
      </div>
    </div>
  );
}
