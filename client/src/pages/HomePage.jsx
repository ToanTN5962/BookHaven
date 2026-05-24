import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import { Search, ShoppingCart, ChevronDown, ChevronLeft, ChevronRight, Star, Plus } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return(
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center gap-8">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">BOOKHAVEN</h1>
        <div className="hidden md:flex gap-6 text-gray-600 font-medium">
          <a href="#" className="flex items-center gap-1 hover:text-indigo-600">Home <ChevronDown size={16} /></a>
          <a href="#" className="flex items-center gap-1 hover:text-indigo-600">Pages <ChevronDown size={16} /></a>
          <a href="#" className="flex items-center gap-1 hover:text-indigo-600">Shop <ChevronDown size={16} /></a>
          <a href="#" className="hover:text-indigo-600">Contact</a>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search your favorite book..." 
            className="w-full pl-4 pr-10 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors" onClick={() => navigate("/login")}>
          Log In
        </button>
      </div>
    </nav>
  );
};

const Hero = ({ books }) => (
  <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 py-16 px-8">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
      <div className="md:w-1/2 z-10">
        <p className="italic text-gray-500 mb-4">"Today a reader, tomorrow a leader"</p>
        <h2 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Every book tells a story. <br/>
          <span className="text-indigo-600">What's yours?</span>
        </h2>
        <button className="flex items-center gap-2 px-8 py-4 bg-yellow-400 text-gray-900 font-bold rounded-full hover:bg-yellow-500 transition-all transform hover:scale-105 shadow-lg">
          Discover now <span>→</span>
        </button>
      </div>

      {/* 3 cuốn sách hot nhất */}
      <div className="md:w-1/2 flex gap-4 mt-12 md:mt-0">
        {books.slice(0, 3).map((book, idx) => {
          const rotations = ["-rotate-12 translate-y-4", "rotate-6 -translate-y-4", "-rotate-6"];
          return (
            <div
              key={idx}
              className={`w-32 h-48 rounded shadow-2xl transform ${rotations[idx]} overflow-hidden`}
            >
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150x200?text=No+Cover";
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const BookCard = ({ title, author, rating, cover }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
  <div className={`group p-4 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-2xl hover:scale-105`}>
    <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded-lg shadow-md"> 
      {!imgLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img 
        src={cover} 
        alt={title}
        className="w-full h-full object-cover"
        onLoad={() => setImgLoaded(true)}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/150x200?text=No+Cover";
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
      <button className = "bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg">
          + Add to wishlist
      </button>
    </div>
  </div>
)};

const Highlights = ({ books }) => {  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const maxIndex = books.length - 5;

  const slideTo = (newIndex) => {
    setIsTransitioning(true); 
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false); 
    }, 150); 
  };

  // Auto slide sau mỗi 3 giây
  useEffect(() => {
    if (books.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (books.length - 5));
    }, 3000);
    return () => clearInterval(timer); 
  }, [books.length, currentIndex]);

  const handlePrev = () => slideTo(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  const handleNext = () => slideTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);

  // Lấy 5 cuốn từ currentIndex
  const visibleBooks = books.slice(currentIndex, currentIndex + 5);

  return (
    <section className="max-w-7xl mx-auto px-8 py-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 underline decoration-yellow-400 decoration-4 underline-offset-8">
        This week's highlights
      </h2>

      <div className="relative flex items-center gap-4">
        {/* Mũi tên trái */}
        <button
          onClick={handlePrev}
          className="p-4 rounded-full bg-gray-300 hover:bg-yellow-400 shadow-md hover:shadow-lg transition text-2xl font-bold text-gray-800"
        >
          ‹
        </button>

        {/* 5 cuốn sách */}
        <div 
          className="grid grid-cols-5 gap-8 flex-1 transition-opacity duration-300"
          style={{ opacity: isTransitioning ? 0 : 1 }}
        >
          {visibleBooks.map((book, idx) => (
            <BookCard
              key={currentIndex + idx}
              title={book.title}
              author={book.author}
              rating={book.rating}
              cover={book.cover}
            />
          ))}
        </div>

        {/* Mũi tên phải */}
        <button
          onClick={handleNext}
          className="p-4 rounded-full bg-gray-300 hover:bg-yellow-400 shadow-md hover:shadow-lg transition text-2xl font-bold text-gray-800"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default function HomePage() {
  const [books, setBooks] = useState([]);

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
      <Navbar />
      <Hero books={books} />       
      <Highlights books={books} />
    </div>
  );
}