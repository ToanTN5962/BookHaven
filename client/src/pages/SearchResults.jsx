import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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
        setBooks(data.books || []);
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
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h2 className="text-2xl font-bold mb-4">Search results for "{q}"</h2>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : books.length === 0 ? (
        <div className="text-gray-500">No results found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {books.map(b => (
            <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-md cursor-pointer" onClick={() => navigate(`/books/${b.id}`)}>
              <div>
                <h3 className="font-bold text-lg">{b.title}</h3>
                <p className="text-sm text-gray-500">{(b.authors || []).join(', ')}{b.publishedYear ? ` · ${b.publishedYear}` : ''}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{b.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-amber-500 flex items-center font-bold"><Star size={14} className="fill-amber-400" /> <span className="ml-1">{b.avgRating ?? 'N/A'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
