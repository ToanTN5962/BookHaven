import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown, ChevronLeft, ChevronRight, Star, Plus, Globe, User } from 'lucide-react';

// 1. Kho dữ liệu ngôn ngữ (Dictionary) cho các phần text tĩnh trên giao diện
const translations = {
  en: {
    home: "Home",
    pages: "Pages",
    shop: "Shop",
    contact: "Contact",
    searchPlaceholder: "Search your favorite book...",
    login: "Log In",
    quote: '"Today a reader, tomorrow a leader"',
    heroTitle1: "Every book tells a story.",
    heroTitle2: "What's yours?",
    discover: "Discover now",
    highlights: "This week's highlights",
    noCover: "No Cover",
    modalNoLoginTitle: "You haven't logged in yet",
    modalNoLoginDesc: 'Log in to add "{title}" to your wishlist.',
    modalSuccessTitle: "Added to wishlist",
    modalSuccessDesc: '"{title}" has been added to your wishlist.',
    cancel: "Cancel",
    close: "Close",
    goProfile: "Go to Profile"
  },
  vi: {
    home: "Trang chủ",
    pages: "Trang",
    shop: "Cửa hàng",
    contact: "Liên hệ",
    searchPlaceholder: "Tìm kiếm cuốn sách yêu thích...",
    login: "Đăng nhập",
    quote: '"Hôm nay là người đọc, ngày mai là nhà lãnh đạo"',
    heroTitle1: "Mỗi cuốn sách một câu chuyện.",
    heroTitle2: "Câu chuyện của bạn là gì?",
    discover: "Khám phá ngay",
    highlights: "Sách nổi bật tuần này",
    noCover: "Không có ảnh bìa",
    modalNoLoginTitle: "Bạn chưa đăng nhập",
    modalNoLoginDesc: 'Vui lòng đăng nhập để thêm "{title}" vào danh sách yêu thích.',
    modalSuccessTitle: "Đã thêm vào yêu thích",
    modalSuccessDesc: '"{title}" đã được thêm vào danh sách yêu thích thành công.',
    cancel: "Hủy bỏ",
    close: "Đóng",
    goProfile: "Đến Trang cá nhân"
  }
};

// 2. Component Navbar nhận vào 2 props lang và setLang để xử lý nút gạt
const Navbar = ({ lang, setLang }) => {
  const navigate = useNavigate();
  const t = translations[lang]; // Lấy bộ từ điển hiện tại

  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("user"); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (!e || !e.key) return;
      if (e.key === 'user' || e.key === 'token') {
        try { const s = localStorage.getItem('user'); setUser(s ? JSON.parse(s) : null); } catch (err) { setUser(null); }
      }
    };

    const onUserChanged = () => {
      try { const s = localStorage.getItem('user'); setUser(s ? JSON.parse(s) : null); } catch (err) { setUser(null); }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('userChanged', onUserChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('userChanged', onUserChanged);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">

      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight cursor-pointer" onClick={() => navigate("/")}>
          BOOKHAVEN
        </h1>
        <div className="hidden md:flex gap-6 text-gray-600 font-medium">
          <a href="#" className="flex items-center gap-1 hover:text-indigo-600" onClick = {user !== null ? () => navigate("/afterlogin") : null}>{t.home} <ChevronDown size={16} /></a>
          <a href="#" className="flex items-center gap-1 hover:text-indigo-600">{t.pages} <ChevronDown size={16} /></a>
          <a href="#" className="flex items-center gap-1 hover:text-indigo-600">{t.shop} <ChevronDown size={16} /></a>
          <a href="#" className="hover:text-indigo-600">{t.contact}</a>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            className="w-full pl-4 pr-10 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* NÚT GẠT NGÔN NGỮ (TOGGLE SWITCH) */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full border border-gray-200">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'}`} onClick={() => setLang('en')}>
            EN
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all ${lang === 'vi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'}`} onClick={() => setLang('vi')}>
            VI
          </span>
        </div>

        {user ? (
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
        ) : (
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors" onClick={() => navigate("/login")}>
          {t.login}
        </button>
        )}
      </div>
    </nav>
  );
};

const Hero = ({ books, lang }) => {
  const t = translations[lang];
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 py-16 px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 z-10">
          <p className="italic text-gray-500 mb-4">{t.quote}</p>
          <h2 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {t.heroTitle1} <br/>
            <span className="text-indigo-600">{t.heroTitle2}</span>
          </h2>
          <button className="flex items-center gap-2 px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-full hover:bg-yellow-500 transition-all transform hover:scale-105 shadow-lg">
            {t.discover} <span>→</span>
          </button>
        </div>

        <div className="md:w-1/2 flex gap-4 mt-12 md:mt-0 justify-end">
          {books.slice(0, 3).map((book, idx) => {
            const rotations = ["-rotate-12 translate-y-4", "rotate-6 -translate-y-4", "-rotate-6"];
            return (
              <div key={idx} className={`w-32 h-48 rounded shadow-2xl transform ${rotations[idx]} overflow-hidden`}>
                <img
                  src={book.cover || book.thumbnail || book.book_image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/150x200?text=${encodeURIComponent(t.noCover)}`;
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const BookCard = ({ id, title, author, rating, cover, onAddToWishlist, onHoverStart, onHoverEnd, lang }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const t = translations[lang];

  const handleCardClick = () => {
    try {
      const token = localStorage.getItem('token');
      if (token && id) {
        navigate(`/books/${id}`);
      } else {
        navigate('/login');
      }
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd} className="group p-4 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-2xl hover:scale-105 cursor-pointer">
      <div onClick={handleCardClick} className="relative aspect-[2/3] mb-4 overflow-hidden rounded-lg shadow-md"> 
        {!imgLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
        <img 
          src={cover} 
          alt={title}
          className="w-full h-full object-cover"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://via.placeholder.com/150x200?text=${encodeURIComponent(t.noCover)}`;
          }}
        />
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
          ))}
        </div>
        <h3 className="font-bold text-gray-800 line-clamp-1">{title}</h3>
        <p className="text-xs text-gray-500 mb-4">{author}</p>
      </div>
      <div className="relative text-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
          onClick={(e) => { e.stopPropagation(); onAddToWishlist && onAddToWishlist({ title, author, cover }); }}
        >
          + Wishlist
        </button>
      </div>
    </div>
  );
};

const Highlights = ({ books, onAddToWishlist, lang }) => {  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const t = translations[lang];

  const maxIndex = Math.max(0, books.length - 5);

  const slideTo = (newIndex) => {
    setIsTransitioning(true); 
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false); 
    }, 150); 
  };

  useEffect(() => {
    if (books.length === 0 || paused) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (Math.max(1, books.length - 4)));
    }, 3000);
    return () => clearInterval(timer); 
  }, [books.length, paused]);

  const handlePrev = () => slideTo(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  const handleNext = () => slideTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);

  const visibleBooks = books.slice(currentIndex, currentIndex + 5);

  return (
    <section className="max-w-7xl mx-auto px-8 py-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 underline decoration-yellow-400 decoration-4 underline-offset-8">
        {t.highlights}
      </h2>

      <div className="relative flex items-center gap-4">
        <button onClick={handlePrev} className="p-2 w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 hover:bg-yellow-400 shadow transition text-xl font-bold text-gray-800">‹</button>

        <div className="grid grid-cols-5 gap-8 flex-1 transition-opacity duration-300" style={{ opacity: isTransitioning ? 0 : 1 }}>
          {visibleBooks.map((book, idx) => (
            <BookCard
              key={currentIndex + idx}
              id={book.id || book.isbn13 || book.bookIsbn}
              title={book.title}
              author={book.author}
              rating={book.rating}
              cover={book.cover || book.thumbnail || book.book_image}
              onAddToWishlist={onAddToWishlist}
              onHoverStart={() => setPaused(true)}
              onHoverEnd={() => setPaused(false)}
              lang={lang}
            />
          ))}
        </div>

        <button onClick={handleNext} className="p-2 w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 hover:bg-yellow-400 shadow transition text-xl font-bold text-gray-800">›</button>
      </div>
    </section>
  );
};

export default function HomePage() {
  const [books, setBooks] = useState([]);
  // 3. Khởi tạo state quản lý ngôn ngữ (mặc định ưu tiên lưu ở localStorage để F5 không mất trạng thái)
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [wishlistPayload, setWishlistPayload] = useState(null);
  const [wishlistNeedsLogin, setWishlistNeedsLogin] = useState(false);
  const navigate = useNavigate();
  const t = translations[lang];

  // Lưu tùy chọn ngôn ngữ của người dùng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    const fetchHotBooks = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/books/toprate`);
        const data = await response.json();
        setBooks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchHotBooks();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
      {/* Truyền lang và setLang xuống Navbar */}
      <Navbar lang={lang} setLang={setLang} />
      <Hero books={books} lang={lang} />      
      <Highlights books={books} lang={lang} onAddToWishlist={(payload) => {
        const token = localStorage.getItem('token');
        setWishlistPayload(payload);
        setWishlistNeedsLogin(!token);
        setShowWishlistModal(true);
      }} />

      {/* Global wishlist modal */}
      {showWishlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg text-center shadow-2xl mx-4">
            {wishlistNeedsLogin ? (
              <>
                <h3 className="text-lg font-bold mb-2">{t.modalNoLoginTitle}</h3>
                <p className="text-sm text-gray-500 mb-6">{t.modalNoLoginDesc.replace("{title}", wishlistPayload?.title)}</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setShowWishlistModal(false)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors font-medium">{t.cancel}</button>
                  <button onClick={() => { setShowWishlistModal(false); navigate('/login'); }} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium">{t.login}</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2">{t.modalSuccessTitle}</h3>
                <p className="text-sm text-gray-500 mb-6">{t.modalSuccessDesc.replace("{title}", wishlistPayload?.title)}</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setShowWishlistModal(false)} className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors font-medium">{t.close}</button>
                  <button onClick={() => { setShowWishlistModal(false); navigate('/profile'); }} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium">{t.goProfile}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}