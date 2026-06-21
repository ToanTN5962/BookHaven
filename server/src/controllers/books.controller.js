const prisma = require("../prisma/client");
const redisClient = require("../utils/redisClient");

const getRandomBooks = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const maxResults = 10;
        const startIndex = (page - 1) * maxResults;
        // Use NYT Best Sellers overview to pick random best-seller books
        // Try Redis cache first to avoid hitting NYT repeatedly
        const cacheKey = 'nyt:overview';
        let nytData = null;
        try {
                const tStart = Date.now();
                const cached = await redisClient.get(cacheKey);
                const tGet = Date.now() - tStart;
                if (cached) {
                    console.log(`Redis GET hit (ms): ${tGet}`);
                    nytData = JSON.parse(cached);
                } else {
                    console.log(`Redis GET miss (ms): ${tGet}`);
                }
        } catch (err) {
            console.warn('Redis GET error', err && err.message ? err.message : err);
        }

        if (!nytData) {
                const tFetchStart = Date.now();
                const nytRes = await fetch(
                    `https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=${process.env.NYT_API_KEY}`
                );
                nytData = await nytRes.json();
                const tFetch = Date.now() - tFetchStart;
                console.log(`NYT fetch time (ms): ${tFetch}, status: ${nytRes.status}`);

            try {
                    await redisClient.setEx(cacheKey, 3600, JSON.stringify(nytData));
                    console.log('Cached NYT overview in Redis');
            } catch (err) {
                console.warn('Redis SET error', err && err.message ? err.message : err);
            }
        }

        const lists = nytData.results?.lists || [];
        // flatten all books from all lists
        const allBooks = lists.flatMap(list =>
            (list.books || []).map(book => ({ ...book, list_name: list.list_name }))
        );

        if (!allBooks.length) {
            return res.status(200).json({ books: [], totalPages: 0 });
        }

        // shuffle and take up to maxResults
        for (let i = allBooks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allBooks[i], allBooks[j]] = [allBooks[j], allBooks[i]];
        }

        // paginate the shuffled list using requested page
        const pageNum = Number(page) || 1;
        const selected = allBooks.slice((pageNum - 1) * maxResults, (pageNum - 1) * maxResults + maxResults);

        const books = (selected || []).map((book) => ({
            id: book.primary_isbn13 || book.primary_isbn10 || book.title,
            title: book.title || 'Unknown Title',
            author: book.author || 'Unknown Author',
            summary: book.description || book.contributor || 'No description available.',
            rating: 'N/A',
            thumbnail: book.book_image || null,
            tags: [book.list_name].filter(Boolean),
        }));

        const totalPages = Math.max(1, Math.ceil(allBooks.length / maxResults));

        // include counts for debugging/visibility
        return res.status(200).json({ books, totalPages, totalBooks: allBooks.length, listsCount: lists.length });
    } catch (error) {
        //console.error("Lỗi books controller:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// const getBookByName = async (req, res) => {
//     try {
//         const maxResults = 10;
//         const q = (req.query.q || req.query.name || '').trim();
//         if (!q) return res.status(400).json({ message: 'Search info is missing' });

//         const nytKey = process.env.NYT_API_KEY;
//         const googleKey = process.env.GOOGLE_BOOKS_API_KEY;

//         let nytBooks = [];
//         let nytSuccess = false;

//         if (nytKey) {
//             try {
//                 const nytUrl = `https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?title=${encodeURIComponent(q)}&api-key=${nytKey}`;
//                 const nytResp = await fetch(nytUrl);
                
//                 if (nytResp.ok) {
//                     const nytData = await nytResp.json();
//                     nytBooks = Array.isArray(nytData.results) ? nytData.results : [];
//                     nytSuccess = true;
//                 }
//             } catch (e) {
//                 console.error('NYT primary fetch error, moving to fallback...');
//             }
//         }

//         if (nytSuccess && nytBooks.length > 0) {
//             const mapped = await Promise.all(nytBooks.map(async (r, i) => {
//                 const isbn = r.primary_isbn13 || r.primary_isbn10 || '';
                
//                 let fallbackImage = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null;

//                 const result = {
//                     id: isbn || `nyt-id-${i}`,
//                     bookIsbn: isbn,
//                     title: r.title || '',
//                     author: r.author || '',
//                     description: r.description || r.notes || '',
//                     publisher: r.publisher || '',
//                     publishedDate: r.published_date || null,
//                     book_image: fallbackImage,
//                     rating: null, 
//                     isbns: r.isbns || [],
//                 };

//                 if (!result.book_image || !result.description) {
//                     try {
//                         const lookupQuery = isbn ? `isbn:${isbn}` : result.title;
//                         const gUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(lookupQuery)}&maxResults=1${googleKey ? `&key=${googleKey}` : ''}`;
//                         const gResp = await fetch(gUrl);
                        
//                         if (gResp.ok) {
//                             const gData = await gResp.json();
//                             const gItem = gData.items?.[0]?.volumeInfo;
//                             if (gItem) {
//                                 result.book_image = result.book_image || gItem.imageLinks?.thumbnail || gItem.imageLinks?.smallThumbnail || null;
//                                 result.description = result.description || gItem.description || '';
//                                 result.rating = gItem.averageRating || null;
//                             }
//                         }
//                     } catch (err) { /* Bỏ qua nếu việc supplement thất bại */ }
//                 }

//                 return result;
//             }));

//             // Character-level relevance scoring: per-character matches +
//             // longest-common-substring bonus so partial char sequences rank higher.
//             const normalize = (s) => (s || '').toLowerCase();
//             const compact = (s) => normalize(s).replace(/\s+/g, '');

//             const longestCommonSubstring = (a, b) => {
//                 if (!a || !b) return 0;
//                 const m = a.length, n = b.length;
//                 let max = 0;
//                 const dp = Array(n + 1).fill(0);
//                 for (let i = 1; i <= m; i++) {
//                     for (let j = n; j >= 1; j--) {
//                         if (a[i - 1] === b[j - 1]) {
//                             dp[j] = dp[j - 1] + 1;
//                             if (dp[j] > max) max = dp[j];
//                         } else {
//                             dp[j] = 0;
//                         }
//                     }
//                 }
//                 return max;
//             };

//             const qChars = compact(q);
//             const scored = mapped.map((b) => {
//                 const title = normalize(b.title || '');
//                 const author = normalize(b.author || '');
//                 const desc = normalize(b.description || '');
//                 let score = 0;

//                 // per-character presence
//                 for (const ch of qChars) {
//                     if (!ch) continue;
//                     if (title.includes(ch)) score += 3; // character in title
//                     if (author.includes(ch)) score += 2;
//                     if (desc.includes(ch)) score += 1;
//                 }

//                 // longest common substring bonus (favor consecutive matches)
//                 const lcsTitle = longestCommonSubstring(qChars, compact(title));
//                 const lcsAuthor = longestCommonSubstring(qChars, compact(author));
//                 const lcsDesc = longestCommonSubstring(qChars, compact(desc));
//                 score += lcsTitle * 5; // stronger bonus for consecutive title match
//                 score += lcsAuthor * 3;
//                 score += lcsDesc * 1;

//                 return { ...b, _score: score };
//             });

//             scored.sort((a, b) => b._score - a._score);

//             const totalPages = Math.max(1, Math.ceil(scored.length / maxResults));
//             return res.status(200).json({ books: scored.map(s => { delete s._score; return s; }), total: scored.length, totalPages, source: 'New York Times' });
//         }

//         try {
//             const gUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}${googleKey ? `&key=${googleKey}` : ''}`;
//             const gResp = await fetch(gUrl);
            
//             if (!gResp.ok) {
//                 return res.status(gResp.status).json({ message: 'Both NYT and Google Books requests failed' });
//             }

//             const gData = await gResp.json();
//             const items = Array.isArray(gData.items) ? gData.items : [];

//             const mapped = items.map((item) => {
//                 const info = item.volumeInfo || {};
//                 // Lấy ISBN ra để phục vụ việc lưu xuống DB ở FE khi cần
//                 const isbns = info.industryIdentifiers || [];
//                 const isbn13 = isbns.find(id => id.type === 'ISBN_13')?.identifier;
//                 const isbn10 = isbns.find(id => id.type === 'ISBN_10')?.identifier;
//                 const finalIsbn = isbn13 || isbn10 || '';

//                 return {
//                     id: item.id || finalIsbn,
//                     bookIsbn: finalIsbn,
//                     title: info.title || '',
//                     author: info.authors?.join(', ') || '',
//                     description: info.description || info.subtitle || 'No description available.',
//                     publisher: info.publisher || '',
//                     publishedDate: info.publishedDate || '',
//                     book_image: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
//                     rating: info.averageRating || null,
//                     isbns: isbns,
//                 };
//             });
//             // Character-level relevance scoring to support matching by each character
//             const normalize = (s) => (s || '').toLowerCase();
//             const compact = (s) => normalize(s).replace(/\s+/g, '');
//             const longestCommonSubstring = (a, b) => {
//                 if (!a || !b) return 0;
//                 const m = a.length, n = b.length;
//                 let max = 0;
//                 const dp = Array(n + 1).fill(0);
//                 for (let i = 1; i <= m; i++) {
//                     for (let j = n; j >= 1; j--) {
//                         if (a[i - 1] === b[j - 1]) {
//                             dp[j] = dp[j - 1] + 1;
//                             if (dp[j] > max) max = dp[j];
//                         } else {
//                             dp[j] = 0;
//                         }
//                     }
//                 }
//                 return max;
//             };

//             const qChars = compact(q);
//             const scored = mapped.map((b) => {
//                 const title = normalize(b.title || '');
//                 const author = normalize(b.author || '');
//                 const desc = normalize(b.description || '');
//                 let score = 0;

//                 for (const ch of qChars) {
//                     if (!ch) continue;
//                     if (title.includes(ch)) score += 3;
//                     if (author.includes(ch)) score += 2;
//                     if (desc.includes(ch)) score += 1;
//                 }

//                 const lcsTitle = longestCommonSubstring(qChars, compact(title));
//                 const lcsAuthor = longestCommonSubstring(qChars, compact(author));
//                 const lcsDesc = longestCommonSubstring(qChars, compact(desc));
//                 score += lcsTitle * 5;
//                 score += lcsAuthor * 3;
//                 score += lcsDesc * 1;

//                 return { ...b, _score: score };
//             });

//             scored.sort((a, b) => b._score - a._score);
//             const totalPages = Math.max(1, Math.ceil(scored.length / maxResults));
//             return res.status(200).json({ books: scored.map(s => { delete s._score; return s; }), total: scored.length, totalPages, source: 'Google Books' });

//         } catch (gError) {
//             return res.status(500).json({ message: 'Server error during fallback search', error: gError.message });
//         }

//     } catch (error) {
//         return res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

const getBookByName = async (req, res) => {
    try {
        const maxResults = 10;
        const q = (req.query.q || req.query.name || '').trim();
        if (!q) return res.status(400).json({ message: 'Search info is missing' });

        const nytKey = process.env.NYT_API_KEY;
        const googleKey = process.env.GOOGLE_BOOKS_API_KEY;

        let combinedBooks = [];
        let sourceUsed = [];

        // 1. Gọi song song cả 2 API để tối ưu tốc độ và lấy tối đa dữ liệu
        const apiPromises = [];

        // Luồng Google Books (Tìm kiếm từ khóa rất mạnh)
        const fetchGoogleBooks = async () => {
            try {
                const gUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20${googleKey ? `&key=${googleKey}` : ''}`;
                const gResp = await fetch(gUrl);
                if (gResp.ok) {
                    const gData = await gResp.json();
                    const items = Array.isArray(gData.items) ? gData.items : [];
                    sourceUsed.push('Google Books');
                    return items.map(item => {
                        const info = item.volumeInfo || {};
                        const isbns = info.industryIdentifiers || [];
                        const isbn13 = isbns.find(id => id.type === 'ISBN_13')?.identifier;
                        const isbn10 = isbns.find(id => id.type === 'ISBN_10')?.identifier;
                        const finalIsbn = isbn13 || isbn10 || '';
                        return {
                            id: item.id || finalIsbn,
                            bookIsbn: finalIsbn,
                            title: info.title || '',
                            author: info.authors?.join(', ') || '',
                            description: info.description || info.subtitle || 'No description available.',
                            publisher: info.publisher || '',
                            publishedDate: info.publishedDate || '',
                            book_image: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
                            rating: info.averageRating || null,
                            isbns: isbns
                        };
                    });
                }
            } catch (e) {
                console.error('Google Books fetch error:', e.message);
            }
            return [];
        };

        // Luồng NYT (Chỉ chính xác khi từ khóa dài/đầy đủ)
        const fetchNytBooks = async () => {
            if (!nytKey) return [];
            try {
                const nytUrl = `https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?title=${encodeURIComponent(q)}&api-key=${nytKey}`;
                const nytResp = await fetch(nytUrl);
                if (nytResp.ok) {
                    const nytData = await nytResp.json();
                    const nytResults = Array.isArray(nytData.results) ? nytData.results : [];
                    if (nytResults.length > 0) {
                        sourceUsed.push('New York Times');
                    }
                    return nytResults.map((r, i) => {
                        const isbn = r.primary_isbn13 || r.primary_isbn10 || '';
                        return {
                            id: isbn || `nyt-id-${i}`,
                            bookIsbn: isbn,
                            title: r.title || '',
                            author: r.author || '',
                            description: r.description || r.notes || '',
                            publisher: r.publisher || '',
                            publishedDate: r.published_date || null,
                            book_image: isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null,
                            rating: null,
                            isbns: r.isbns || []
                        };
                    });
                }
            } catch (e) {
                console.error('NYT fetch error:', e.message);
            }
            return [];
        };

        // Chạy song song cả 2 request
        const [googleResults, nytResults] = await Promise.all([
            fetchGoogleBooks(),
            fetchNytBooks()
        ]);

        // Gộp kết quả từ 2 nguồn (loại bỏ trùng lặp qua ISBN nếu có)
        const seenIsbns = new Set();
        const rawCombined = [...googleResults, ...nytResults];
        
        for (const book of rawCombined) {
            if (book.bookIsbn) {
                if (!seenIsbns.has(book.bookIsbn)) {
                    seenIsbns.add(book.bookIsbn);
                    combinedBooks.push(book);
                }
            } else {
                combinedBooks.push(book); // Giữ lại nếu không có ISBN để định danh
            }
        }

        if (combinedBooks.length === 0) {
            return res.status(200).json({ books: [], total: 0, totalPages: 0, source: 'None' });
        }

        // 2. Thuật toán lọc và chấm điểm thông minh (Word/Substring Relevance Scoring)
        const queryLower = q.toLowerCase();

        const scored = combinedBooks.map(book => {
            const titleLower = (book.title || '').toLowerCase();
            const authorLower = (book.author || '').toLowerCase();
            const descLower = (book.description || '').toLowerCase();
            
            let score = 0;

            // TRƯỜNG HỢP ƯU TIÊN 1: Khớp chính xác hoàn toàn cụm từ tìm kiếm
            if (titleLower === queryLower) {
                score += 200; // Khớp khít tên sách -> Đẩy lên đầu tiên
            } else if (titleLower.startsWith(queryLower)) {
                score += 100; // Tên sách bắt đầu bằng từ khóa
            } else if (titleLower.includes(queryLower)) {
                score += 50;  // Tên sách có chứa từ khóa
            }

            if (authorLower.includes(queryLower)) score += 30; // Tác giả chứa từ khóa
            if (descLower.includes(queryLower)) score += 5;    // Mô tả chứa từ khóa

            // TRƯỜNG HỢP ƯU TIÊN 2: Khớp từng từ đơn lẻ (Hỗ trợ viết đảo từ hoặc thiếu từ)
            const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
            let wordsMatched = 0;
            
            for (const word of queryWords) {
                if (titleLower.includes(word)) {
                    score += 15;
                    wordsMatched++;
                } else if (authorLower.includes(word)) {
                    score += 10;
                }
            }

            // Thưởng điểm nếu khớp càng nhiều từ trong cụm từ khóa
            if (wordsMatched === queryWords.length && queryWords.length > 1) {
                score += 40; 
            }

            return { ...book, _score: score };
        });

        // Lọc bỏ các kết quả có điểm số bằng 0 (hoàn toàn không liên quan đến từ khóa)
        const filteredAndScored = scored.filter(b => b._score > 0);

        // Sắp xếp giảm dần theo điểm số mức độ liên quan
        filteredAndScored.sort((a, b) => b._score - a._score);

        // Giới hạn số lượng kết quả trả về
        const finalBooks = filteredAndScored.slice(0, maxResults).map(b => {
            delete b._score;
            return b;
        });

        const totalPages = Math.max(1, Math.ceil(filteredAndScored.length / maxResults));

        return res.status(200).json({
            books: finalBooks,
            total: filteredAndScored.length,
            totalPages,
            source: sourceUsed.join(' + ')
        });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getBookByIsbn = async (req, res) => {
    try {
        const { bookIsbn } = req.params;
        const isIsbnLike = /^[0-9Xx-]+$/.test(bookIsbn);
        const mapGoogleItem = (item) => {
            const info = item.volumeInfo || {};
            return {
                id:            item.id || bookIsbn,
                title:         info.title || 'Unknown Title',
                author:        info.authors?.join(', ') || 'Unknown Author',
                description:   info.description || info.subtitle || '',
                rating:        info.averageRating || 'N/A',
                thumbnail:     info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null,
                tags:          info.categories || [],
                publishedDate: info.publishedDate || '',
                pageCount:     info.pageCount || null,
                publisher:     info.publisher || '',
                language:      info.language || '',
            };
        };

        if (!isIsbnLike) {
            try {
                const response = await fetch(
                    `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(bookIsbn)}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
                );
                const data = await response.json();
                if (data && !data.error && (data.id || data.volumeInfo)) {
                    return res.status(200).json(mapGoogleItem(data));
                }
            } catch (err) {

            }
        }

        const isbn = bookIsbn.replace(/-/g, '').trim();
        const searchRes = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );
        const searchData = await searchRes.json();
        const item = searchData.items?.[0];
        if (item) {
            return res.status(200).json(mapGoogleItem(item));
        }

        try {
            const nytRes = await fetch(
                `https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?isbn=${isbn}&api-key=${process.env.NYT_API_KEY}`
            );
            const nytData = await nytRes.json();
            const match = nytData.results?.[0];

            if (match) {
                return res.status(200).json({
                    id:            match.primary_isbn13 || match.primary_isbn10 || match.title,
                    title:         match.title || 'Unknown Title',
                    author:        match.author || 'Unknown Author',
                    description:   match.description || '',
                    rating:        'N/A',
                    thumbnail:     null, // history API không trả cover
                    tags:          match.ranks_history?.map(r => r.list_name).slice(0, 3) || [],
                    publishedDate: match.published_date || '',
                    pageCount:     null,
                    publisher:     match.publisher || '',
                    language:      '',
                });
            }
        } catch (nytErr) { }

        return res.status(404).json({ message: 'Book not found' });
    }
    catch(error){
        return res.status(500).json({message: "Server error", error: error.message});
    }
    
};

const getTopRated = async(req, res) => {
    //console.log("Running get top rated");
    try{
        // try use cached overview
        const cacheKey = 'nyt:overview';
        let nytData = null;
        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) nytData = JSON.parse(cached);
        } catch (e) {
            console.warn('Redis GET error', e && e.message ? e.message : e);
        }

        if (!nytData) {
            const nytRes = await fetch(
                `https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=${process.env.NYT_API_KEY}`
            );
            nytData = await nytRes.json();
            try { await redisClient.setEx(cacheKey, 3600, JSON.stringify(nytData)); } catch (e) { /* noop */ }
        }

        const { results } = nytData;

        //Lay cuốn sách hot nhất của mỗi thể loại
        const topBooks = results.lists.map(list => ({
            genre: list.list_name,
            book: list.books[0] 
        }));

        const topBooksDetails = await Promise.all(
            topBooks.map(async ({ genre, book }) => {
                const isbn13 = book.isbns[0]?.isbn13;

                const res = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
                );
                const data = await res.json();
                const googleBook = data.items?.[0]?.volumeInfo;

                return {
                    genre,
                    title: book.title,
                    author: book.author,
                    cover: book.book_image,
                    isbn13: book.primary_isbn13,
                    rating: googleBook?.averageRating,
                    ratingsCount: googleBook?.ratingsCount,
                    pageCount: googleBook?.pageCount,
                    publishedDate: googleBook?.publishedDate,
                    categories: googleBook?.categories,
                };
            })
        );  

        const uniqueBooks = topBooksDetails.filter(
            (book, index, self) =>
                index === self.findIndex(b => b.isbn13 === book.isbn13)
        );

        return res.status(200).json(uniqueBooks);
    }
    catch(error){
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { 
    getRandomBooks,
    getBookByIsbn,
    getTopRated,
    getBookByName
};