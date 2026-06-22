import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, BookOpen, Calendar, Hash,
  Globe, Building, Heart, BookMarked, CheckCircle,
  XCircle, Share2, ChevronDown, ThumbsUp, Send, MessageSquare
  , Flag
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Từ điển đa ngôn ngữ (Dictionary)
// ---------------------------------------------------------------------------
const translations = {
  en: {
    back: "Back",
    loading: "Loading book details…",
    notFound: "Book not found.",
    addToShelf: "Add to Shelf",
    removeFromShelf: "Remove from shelf",
    report: "Report",
    published: "Published",
    pages: "Pages",
    publisher: "Publisher",
    language: "Language",
    aboutBook: "About this book",
    showLess: "Show less",
    readMore: "Read more",
    communityReviews: "Community Reviews",
    reviewsCount: "reviews",
    noReviews: "No reviews yet. Be the first!",
    writeReview: "Write a review…",
    yourReview: "Your Review",
    cancel: "Cancel",
    yourRating: "Your Rating",
    yourThoughts: "Your Thoughts",
    placeholderThoughts: "What did you think of this book? Share your thoughts with the community…",
    postReview: "Post Review",
    posting: "Posting…",
    alertRating: "Please select a star rating.",
    alertThoughts: "Please write your review.",
    alertShelfError: "Could not update shelf",
    alertShelfCatch: "Error updating shelf",
    like: "like",
    likes: "likes",
    ratingLabels: ['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing']
  },
  vi: {
    back: "Quay lại",
    loading: "Đang tải thông tin sách…",
    notFound: "Không tìm thấy sách.",
    addToShelf: "Thêm vào kệ",
    removeFromShelf: "Xóa khỏi kệ",
    report: "Báo cáo",
    published: "Xuất bản",
    pages: "Số trang",
    publisher: "Nhà xuất bản",
    language: "Ngôn ngữ",
    aboutBook: "Giới thiệu nội dung",
    showLess: "Thu gọn",
    readMore: "Xem thêm",
    communityReviews: "Đánh giá từ cộng đồng",
    reviewsCount: "đánh giá",
    noReviews: "Chưa có đánh giá nào. Hãy là người đầu tiên!",
    writeReview: "Viết đánh giá của bạn…",
    yourReview: "Đánh giá của bạn",
    cancel: "Hủy",
    yourRating: "Điểm đánh giá",
    yourThoughts: "Cảm nghĩ của bạn",
    placeholderThoughts: "Bạn nghĩ gì về cuốn sách này? Hãy chia sẻ cảm nhận với cộng đồng…",
    postReview: "Gửi đánh giá",
    posting: "Đang gửi…",
    alertRating: "Vui lòng chọn số sao đánh giá.",
    alertThoughts: "Vui lòng nhập nội dung đánh giá.",
    alertShelfError: "Không thể cập nhật kệ sách",
    alertShelfCatch: "Lỗi khi cập nhật kệ sách",
    like: "lượt thích",
    likes: "lượt thích",
    ratingLabels: ['', 'Kém', 'Tạm được', 'Hay', 'Tuyệt vời', 'Quá xuất sắc']
  }
};

const getStatuses = (lang) => [
  { value: 'READING',  label: lang === 'vi' ? 'Đang đọc' : 'Reading',      icon: <BookOpen size={14} />,    color: 'bg-blue-50 text-blue-600' },
  { value: 'WISHLIST', label: lang === 'vi' ? 'Muốn đọc' : 'Want to Read', icon: <BookMarked size={14} />,  color: 'bg-amber-50 text-amber-600' },
  { value: 'READ',     label: lang === 'vi' ? 'Đã hoàn thành' : 'Completed',  icon: <CheckCircle size={14} />, color: 'bg-emerald-50 text-emerald-600' },
  { value: 'DROP',     label: lang === 'vi' ? 'Tạm ngưng' : 'Dropped',      icon: <XCircle size={14} />,     color: 'bg-red-50 text-red-500' },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    user: { name: 'Sarah M.' },
    rating: 5,
    content: 'An absolute masterpiece. The world-building is unlike anything I have read before — every page pulls you deeper into a universe that feels both alien and intimately human.',
    likes: 24,
    liked: false,
    createdAt: '2 days ago',
  },
  {
    id: 2,
    user: { name: 'James K.' },
    rating: 4,
    content: 'Beautifully written with complex characters. The pacing slows in the middle third but the payoff is absolutely worth it. A must-read for any sci-fi fan.',
    likes: 11,
    liked: false,
    createdAt: '5 days ago',
  },
  {
    id: 3,
    user: { name: 'Linh N.' },
    rating: 3,
    content: 'Interesting premise but I felt the ending was rushed. Still, the prose is gorgeous and the themes around identity are handled with real nuance.',
    likes: 6,
    liked: false,
    createdAt: '1 week ago',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
const StarRating = ({ rating, size = 18 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={size}
        className={i <= Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
      />
    ))}
  </div>
);

const InteractiveStars = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <button key={i} type="button" onClick={() => onChange(i)} className="transition-transform hover:scale-110">
        <Star
          size={28}
          className={i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}
        />
      </button>
    ))}
  </div>
);

const UserAvatar = ({ name }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = [
    'bg-indigo-100 text-indigo-600',
    'bg-purple-100 text-purple-600',
    'bg-rose-100 text-rose-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
  ];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0`}>
      {initials}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Review Card
// ---------------------------------------------------------------------------
const ReviewCard = ({ review, onLike, lang }) => {
  const navigate = useNavigate();
  const t = translations[lang];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={review.user.name} />
          <div>
            <p className="font-bold text-sm text-gray-800">{review.user.name}</p>
            <p className="text-xs text-gray-400">{review.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StarRating rating={review.rating} size={14} />
          <button onClick={() => navigate('/complaint')} className="p-1 rounded-md hover:bg-gray-50 text-gray-400" title={t.report}>
            <Flag size={14} />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">{review.content}</p>

      <button
        onClick={() => onLike(review.id)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          review.liked
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-400 hover:bg-gray-50 hover:text-indigo-500'
        }`}
      >
        <ThumbsUp size={13} className={review.liked ? 'fill-indigo-500' : ''} />
        {review.likes} {review.likes === 1 ? t.like : t.likes}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Write Review Panel
// ---------------------------------------------------------------------------
const WriteReview = ({ onSubmit, lang }) => {
  const [open,    setOpen]    = useState(false);
  const [rating,  setRating]  = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  const handleSubmit = async () => {
    if (!rating)         { alert(t.alertRating); return; }
    if (!content.trim()) { alert(t.alertThoughts); return; }
    setLoading(true);
    await onSubmit({ rating, content });
    setRating(0);
    setContent('');
    setOpen(false);
    setLoading(false);
  };

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all font-medium text-sm"
        >
          <MessageSquare size={18} />
          {t.writeReview}
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-800">{t.yourReview}</h3>
            <button onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">
              {t.cancel}
            </button>
          </div>

          {/* Star rating */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.yourRating}</p>
            <div className="flex items-center gap-4">
              <InteractiveStars value={rating} onChange={setRating} />
              {rating > 0 && (
                <span className="text-sm font-bold text-indigo-600">{t.ratingLabels[rating]}</span>
              )}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.yourThoughts}</p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={1000}
              placeholder={t.placeholderThoughts}
              rows={4}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 leading-relaxed outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white transition-all resize-none"
            />
            <p className="text-right text-xs text-gray-300 mt-1">{content.length} / 1000</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !rating || !content.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            <Send size={15} />
            {loading ? t.posting : t.postReview}
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Reviews Section
// ---------------------------------------------------------------------------
const ReviewsSection = ({ bookIsbn, bookId, book, lang }) => {
  const [reviews, setReviews] = useState([]);
  const t = translations[lang];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token');

        // Prefer a real ISBN when available. Only send numeric bookId.
        let q = '';
        const isbnFromBook = book && (book.bookIsbn || book.isbn13 || book.isbn);
        if (isbnFromBook) {
          q = `bookIsbn=${encodeURIComponent(isbnFromBook)}`;
        } else if (bookIsbn && /^\d{9,13}$/.test(String(bookIsbn))) {
          q = `bookIsbn=${encodeURIComponent(bookIsbn)}`;
        } else if (typeof bookId === 'number') {
          q = `bookId=${encodeURIComponent(bookId)}`;
        } else {
          // Fallback: try bookIsbn param if present, otherwise avoid sending an invalid bookId
          q = `bookIsbn=${encodeURIComponent(bookIsbn || '')}`;
        }

        const res = await fetch(`http://localhost:3000/api/review?${q}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) return;
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error('Failed to load reviews', err);
      }
    };
    fetchReviews();
  }, [bookId, bookIsbn, book]);

  const handleLike = (reviewId) => {
    setReviews(prev => prev.map(r =>
      r.id === reviewId
        ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
        : r
    ));
  };

  const handleSubmitReview = async ({ rating, content }) => {
    const token = localStorage.getItem('token');
    const payload = {
      rating,
      content,
      bookIsbn: bookIsbn ? String(bookIsbn).trim() : undefined,
    };

    if (bookId && typeof bookId === 'number') payload.bookId = bookId;

    if (book) {
      payload.title = book.title || book.name || undefined;
      payload.author = book.author || (book.authors ? book.authors.join(', ') : undefined);
      payload.publisher = book.publisher || undefined;
      let py = undefined;
      if (book.publishedYear) {
        const n = Number(book.publishedYear);
        if (!Number.isNaN(n)) py = Math.trunc(n);
      }
      if (py === undefined && book.publishedDate) {
        const m = String(book.publishedDate).match(/(\d{4})/);
        if (m) py = Number(m[1]);
      }
      if (py !== undefined) {
        payload.publishedYear = py;
        payload.publishedYearFromClient = py;
      }
      payload.imageUrl = book.thumbnail || book.imageUrl || undefined;
      payload.language = book.language || undefined;
      payload.description = book.description || undefined;
    }

    try {
      const res = await fetch('http://localhost:3000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Handle expired JWT specifically
        if (res.status === 403 && data && (data.error || '').toLowerCase().includes('expired')) {
          localStorage.removeItem('token');
          alert(lang === 'vi' ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : 'Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        // Handle duplicate review
        if (res.status === 409) {
          alert(lang === 'vi' ? 'Bạn đã đánh giá cuốn sách này rồi.' : 'You have already reviewed this book.');
          return;
        }
        console.error('Failed to post review', data);
        alert((data && data.message) || 'Failed to post review');
        return;
      }
      const created = data.review;
      const mapped = {
        id: created.id,
        user: { name: created.user?.fullName || created.user?.username || (lang === 'vi' ? 'Bạn' : 'You') },
        rating: rating,
        content: created.content,
        likes: 0,
        liked: false,
        createdAt: lang === 'vi' ? 'Vừa xong' : 'Just now',
      };
      setReviews(prev => [mapped, ...prev]);
    } catch (err) {
      console.error('Error posting review', err);
    }
  };

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900"> {t.communityReviews}</h2>
          {avg && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={parseFloat(avg)} size={15} />
              <span className="text-sm font-bold text-gray-700">{avg}</span>
              <span className="text-sm text-gray-400">· {reviews.length} {t.reviewsCount}</span>
            </div>
          )}
        </div>
      </div>

      <WriteReview onSubmit={handleSubmitReview} lang={lang} />

      {reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t.noReviews}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} onLike={handleLike} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function BookDetail() {
  const { bookIsbn }     = useParams();
  const navigate       = useNavigate();
  const [book,         setBook]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [status,       setStatus]       = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [wished,       setWished]       = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  // Đồng bộ hóa State ngôn ngữ hệ thống qua Local Storage
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = translations[lang];
  const STATUSES = getStatuses(lang);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const handleSetStatus = async (value) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const payload = {
        status: value,
        book: {
          id: typeof book.id === 'number' ? book.id : undefined,
          title: book.title,
          author: book.author,
          thumbnail: book.thumbnail || book.imageUrl || null,
          publisher: book.publisher || '',
          publishedDate: book.publishedDate || '',
          pageCount: book.pageCount || null,
          language: book.language || ''
        }
      };

      const res = await fetch('http://localhost:3000/api/users/shelf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to update shelf', err);
        alert(t.alertShelfError);
        return;
      }

      setStatus(value);
      setShowDropdown(false);
    } catch (err) {
      console.error('Error updating shelf:', err);
      alert(t.alertShelfCatch);
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`http://localhost:3000/api/books/${bookIsbn}`);
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          console.error('Failed to load book detail', res.status, data);
          setBook(null);
        } else {
          setBook(data);
        }
      } catch (err) {
        console.error('Failed to fetch book:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookIsbn]);

  if (loading) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-sm font-medium">{t.loading}</span>
      </div>
    </div>
  );

  if (!book) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-gray-400">
      {t.notFound}
    </div>
  );

  const currentStatus = STATUSES.find(s => s.value === status);
  const desc      = book.description || 'No description available.';
  const shortDesc = desc.length > 400 ? desc.slice(0, 400) + '…' : desc;

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={18} /> {t.back}
        </button>
        <h1
          className="text-xl font-black text-indigo-600 tracking-tight cursor-pointer"
          onClick={() => navigate('/afterlogin')}
        >
          BOOKHAVEN
        </h1>
        <div className="flex items-center gap-4">
          {/* NÚT GẠT ĐỔI NGÔN NGỮ (TOGGLE SWITCH) */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button 
              onClick={() => setLang('en')}
              className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('vi')}
              className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-all ${lang === 'vi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              VI
            </button>
          </div>

          <button
            onClick={() => navigator.share?.({ title: book.title, url: window.location.href })}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Share2 size={18} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-10">

          {/* Cover + actions */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="w-48 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-100 border border-gray-100">
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-300">
                  <BookOpen size={48} />
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full">
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
                  {status ? currentStatus.label : t.addToShelf}
                  <ChevronDown size={14} />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-10">
                        {STATUSES.map(s => (
                          <button
                            key={s.value}
                            onClick={() => handleSetStatus(s.value)}
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
                        {t.removeFromShelf}
                      </button>
                    )}
                  </div>
                )}
              </div>

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

          {/* Book info */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <button onClick={() => navigate('/complaint')} className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded-full font-bold inline-flex items-center gap-2 mb-3">
                <Flag size={14} /> {t.report}
              </button>
              <div className="flex flex-wrap gap-2">
                {book.tags?.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">{book.title}</h1>
            <p className="text-lg text-indigo-600 font-semibold mb-6">{book.author}</p>

            {book.rating !== 'N/A' && (
              <div className="flex items-center gap-3 mb-8">
                <StarRating rating={parseFloat(book.rating)} />
                <span className="text-2xl font-black text-gray-800">{book.rating}</span>
                <span className="text-sm text-gray-400">/ 5</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: <Calendar size={15} />, label: t.published, value: book.publishedDate },
                { icon: <Hash size={15} />,     label: t.pages,     value: book.pageCount },
                { icon: <Building size={15} />, label: t.publisher, value: book.publisher },
                { icon: <Globe size={15} />,    label: t.language,  value: book.language?.toUpperCase() },
              ].filter(m => m.value).map((meta, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    {meta.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{meta.label}</p>
                    <p className="font-semibold">{meta.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-3">{t.aboutBook}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {descExpanded ? desc : shortDesc}
              </p>
              {desc.length > 400 && (
                <button
                  onClick={() => setDescExpanded(v => !v)}
                  className="mt-2 text-sm font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  {descExpanded ? t.showLess : t.readMore}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection bookIsbn={bookIsbn} bookId={book.id} book={book} lang={lang} />
    </div>
  );
}