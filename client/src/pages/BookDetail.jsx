import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, BookOpen, Calendar, Hash,
  Globe, Building, Heart, BookMarked, CheckCircle,
  XCircle, Share2, ChevronDown
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STATUSES = [
  { value: 'READING',     label: 'Reading',      icon: <BookOpen size={14} />,    color: 'bg-blue-50 text-blue-600' },
  { value: 'WANT_TO_READ',label: 'Want to Read', icon: <BookMarked size={14} />,  color: 'bg-amber-50 text-amber-600' },
  { value: 'COMPLETED',   label: 'Completed',    icon: <CheckCircle size={14} />, color: 'bg-emerald-50 text-emerald-600' },
  { value: 'DROPPED',     label: 'Dropped',      icon: <XCircle size={14} />,     color: 'bg-red-50 text-red-500' },
];

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating);
    const half   = !filled && i - 0.5 <= rating;
    stars.push(
      <Star
        key={i}
        size={18}
        className={filled || half ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
      />
    );
  }
  return <div className="flex gap-0.5">{stars}</div>;
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function BookDetail() {
  const { bookId }    = useParams();       // Route: /books/:bookId
  const navigate      = useNavigate();
  const [book,        setBook]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [status,      setStatus]      = useState(null);
  const [showDropdown,setShowDropdown]= useState(false);
  const [wished,      setWished]      = useState(false);
  const [descExpanded,setDescExpanded]= useState(false);

  // ── Fetch book từ Google Books API qua backend ──────────────────────────
  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`http://localhost:3000/api/books/${bookId}`);
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error('Failed to fetch book:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading book details…</span>
      </div>
    </div>
  );

  if (!book) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-gray-400">
      Book not found.
    </div>
  );

  const currentStatus = STATUSES.find(s => s.value === status);
  const desc = book.description || 'No description available.';
  const shortDesc = desc.length > 400 ? desc.slice(0, 400) + '…' : desc;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">

      {/* ── Header ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1
          className="text-xl font-black text-indigo-600 tracking-tight cursor-pointer"
          onClick={() => navigate('/')}
        >
          BOOKHAVEN
        </h1>
        <button
          onClick={() => navigator.share?.({ title: book.title, url: window.location.href })}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <Share2 size={18} />
        </button>
      </nav>

      {/* ── Hero ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">

          {/* Cover */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-48 h-68 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-100 border border-gray-100">
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-300">
                  <BookOpen size={48} />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 w-full">
              {/* Add to shelf dropdown */}
              <div className="relative flex-1">
                <button
                  onClick={() => setShowDropdown(v => !v)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all border ${
                    status
                      ? `${currentStatus.color} border-transparent`
                      : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
                  }`}
                >
                  {status ? currentStatus.icon : <BookMarked size={14} />}
                  {status ? currentStatus.label : 'Add to Shelf'}
                  <ChevronDown size={14} />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10">
                    {STATUSES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => { setStatus(s.value); setShowDropdown(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${
                          status === s.value ? 'text-indigo-600 font-bold' : 'text-gray-700'
                        }`}
                      >
                        <span className={`p-1 rounded-lg ${s.color}`}>{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                    {status && (
                      <button
                        onClick={() => { setStatus(null); setShowDropdown(false); }}
                        className="w-full px-4 py-3 text-xs text-gray-400 hover:text-red-400 transition-colors border-t border-gray-50"
                      >
                        Remove from shelf
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => setWished(v => !v)}
                className={`p-2.5 rounded-xl border transition-all ${
                  wished
                    ? 'bg-red-50 border-red-100 text-red-500'
                    : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart size={18} className={wished ? 'fill-red-500' : ''} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-4">
              {book.tags?.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
              {book.title}
            </h1>
            <p className="text-lg text-indigo-600 font-semibold mb-6">{book.author}</p>

            {/* Rating */}
            {book.rating !== 'N/A' && (
              <div className="flex items-center gap-3 mb-8">
                <StarRating rating={parseFloat(book.rating)} />
                <span className="text-2xl font-black text-gray-800">{book.rating}</span>
                <span className="text-sm text-gray-400">/ 5</span>
              </div>
            )}

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {book.publishedDate && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Published</p>
                    <p className="font-semibold">{book.publishedDate}</p>
                  </div>
                </div>
              )}
              {book.pageCount && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <Hash size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Pages</p>
                    <p className="font-semibold">{book.pageCount}</p>
                  </div>
                </div>
              )}
              {book.publisher && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <Building size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Publisher</p>
                    <p className="font-semibold">{book.publisher}</p>
                  </div>
                </div>
              )}
              {book.language && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <Globe size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Language</p>
                    <p className="font-semibold uppercase">{book.language}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-3">About this book</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {descExpanded ? desc : shortDesc}
              </p>
              {desc.length > 400 && (
                <button
                  onClick={() => setDescExpanded(v => !v)}
                  className="mt-2 text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  {descExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}