import React from 'react';
import { Search, ShoppingCart, ChevronDown, Star, Plus } from 'lucide-react';

const Navbar = () => (
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
      <button className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors">
        Sign In
      </button>
    </div>
  </nav>
);

const Hero = () => (
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
      
      <div className="md:w-1/2 flex gap-4 mt-12 md:mt-0 perspective-1000">
        {/* Giả lập các bìa sách đang bay nhẹ */}
        <div className="w-32 h-48 bg-blue-400 rounded shadow-2xl transform -rotate-12 translate-y-4"></div>
        <div className="w-32 h-48 bg-indigo-400 rounded shadow-2xl transform rotate-6 -translate-y-4"></div>
        <div className="w-32 h-48 bg-emerald-400 rounded shadow-2xl transform -rotate-6"></div>
      </div>
    </div>
  </div>
);

const BookCard = ({ title, author, rating }) => (
  <div className={`group p-4 rounded-2xl transition-all duration-300 `}>
    <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded-lg shadow-md">
      <div className="w-full h-full bg-gray-200 animate-pulse group-hover:scale-110 transition-transform duration-500">
        {/* Placeholder cho ảnh sách */}
        <div className="flex items-center justify-center h-full text-gray-400">Cover</div>
      </div>
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
);

const Highlights = () => {
  const books = [
    { title: "You did nothing wrong", author: "C. G. Drews", rating: 4 },
    { title: "Everyone in this bank...", author: "Benjamin Stevenson", rating: 4 },
    { title: "Innamorata", author: "Ava Reid", rating: 5 },
    { title: "Under Water", author: "Tara Menon", rating: 4 },
    { title: "The Plans I Have For You", author: "Lai Sanders", rating: 4 },
    { title: "Call Me By Your Name", author: "Lai Sanders", rating: 4 },
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 underline decoration-yellow-400 decoration-4 underline-offset-8">
        This week's highlights
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {books.map((book, idx) => (
          <BookCard 
            key={idx} 
            title={book.title} 
            author={book.author} 
            rating={book.rating}
          />
        ))}
      </div>
    </section>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
      <Navbar />
      <Hero />
      <Highlights />
    </div>
  );
}