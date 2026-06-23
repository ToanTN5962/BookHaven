const prisma = require("../prisma/client");
const redisClient = require("../utils/redisClient");

const hashStringToSeed = (value) => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
};

const createSeededRandom = (seed) => {
    let state = seed || 1;
    return () => {
        state = Math.imul(state ^ (state >>> 15), 1 | state);
        state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
        return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
    };
};

const normalizeImageUrl = (url) => {
    if (!url) return null;
    try {
        // trim
        let u = String(url).trim();
        if (!u) return null;
        // protocol-relative -> https
        if (u.startsWith('//')) u = 'https:' + u;
        // force https where possible
        if (u.startsWith('http://')) u = u.replace('http://', 'https://');
        return u;
    } catch (e) {
        return null;
    }
};

const bookCategoryKeywords = {
    technology: ['technology', 'computer', 'software', 'programming', 'coding', 'data', 'ai', 'artificial intelligence', 'internet', 'digital', 'startup'],
    science: ['science', 'scientific', 'physics', 'biology', 'chemistry', 'space', 'nature', 'climate', 'medicine', 'health'],
    literature: ['fiction', 'literature', 'literary', 'novel', 'paperback', 'hardcover', 'e-book', 'combined print'],
    business: ['business', 'finance', 'economics', 'management', 'leadership', 'money', 'investing', 'career'],
};

const matchesBookCategory = (book, category) => {
    const normalizedCategory = (category || 'all').toLowerCase();
    if (normalizedCategory === 'all') return true;
    if (normalizedCategory === 'hot') return !book.rank || Number(book.rank) <= 5;

    const searchableText = [
        book.list_name,
        book.title,
        book.description,
        book.contributor,
    ].filter(Boolean).join(' ').toLowerCase();

    return (bookCategoryKeywords[normalizedCategory] || []).some((keyword) =>
        searchableText.includes(keyword)
    );
};

const normalizeSearchText = (value = '') =>
    String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const getSearchTokens = (value = '') =>
    normalizeSearchText(value)
        .split(' ')
        .filter((word) => word.length >= 2);

const scoreSearchBook = (book, query) => {
    const normalizedQuery = normalizeSearchText(query);
    const queryTokens = getSearchTokens(query);
    if (!normalizedQuery || !queryTokens.length) return 0;

    const title = normalizeSearchText(book.title);
    const author = normalizeSearchText(book.author);
    const description = normalizeSearchText(book.description || book.summary);
    const categories = normalizeSearchText([...(book.categories || []), ...(book.tags || [])].join(' '));
    const fullText = [title, author, description, categories].join(' ');

    let score = 0;

    if (title === normalizedQuery) score += 300;
    if (title.startsWith(normalizedQuery)) score += 180;
    if (title.includes(normalizedQuery)) score += 140;
    if (author.includes(normalizedQuery)) score += 80;
    if (description.includes(normalizedQuery)) score += 25;
    if (categories.includes(normalizedQuery)) score += 20;

    let titleMatches = 0;
    let fullTextMatches = 0;

    for (const token of queryTokens) {
        if (title.split(' ').includes(token)) {
            score += 70;
            titleMatches++;
            fullTextMatches++;
        } else if (title.includes(token)) {
            score += 45;
            titleMatches++;
            fullTextMatches++;
        } else if (author.includes(token)) {
            score += 30;
            fullTextMatches++;
        } else if (categories.includes(token)) {
            score += 18;
            fullTextMatches++;
        } else if (description.includes(token)) {
            score += 8;
            fullTextMatches++;
        }
    }

    if (queryTokens.length > 1 && titleMatches === queryTokens.length) score += 90;
    if (fullTextMatches === queryTokens.length) score += 35;

    return score;
};

const getRandomBooks = async (req, res) => {
    try {
        const { page = 1, sessionId, category = 'all' } = req.query;
        const maxResults = 10;
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

        const filteredBooks = allBooks.filter((book) => matchesBookCategory(book, category));

        const random = sessionId
            ? createSeededRandom(hashStringToSeed(String(sessionId)))
            : Math.random;

        // shuffle and take up to maxResults
        for (let i = filteredBooks.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [filteredBooks[i], filteredBooks[j]] = [filteredBooks[j], filteredBooks[i]];
        }

        // paginate the shuffled list using requested page
        const pageNum = Number(page) || 1;
        const selected = filteredBooks.slice((pageNum - 1) * maxResults, (pageNum - 1) * maxResults + maxResults);

        const books = (selected || []).map((book) => ({
            id: book.primary_isbn13 || book.primary_isbn10 || book.title,
            title: book.title || 'Unknown Title',
            author: book.author || 'Unknown Author',
            summary: book.description || book.contributor || 'No description available.',
            rating: 'N/A',
            thumbnail: normalizeImageUrl(book.book_image || null),
            tags: [book.list_name].filter(Boolean),
        }));

        const totalPages = Math.max(1, Math.ceil(filteredBooks.length / maxResults));

        // include counts for debugging/visibility
        return res.status(200).json({ books, totalPages, totalBooks: filteredBooks.length, listsCount: lists.length });
    } catch (error) {
        //console.error("Lỗi books controller:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getBookByName = async (req, res) => {
    try {
        const maxResults = 10;
        const pageNum = Math.max(1, Number(req.query.page) || 1);
        const q = (req.query.q || req.query.name || '').trim();
        if (!q) return res.status(400).json({ message: 'Search info is missing' });

        const nytKey = process.env.NYT_API_KEY;
        const googleKey = process.env.GOOGLE_BOOKS_API_KEY;

        // Try Redis cache for search results to reduce external API calls
        const searchCacheKey = `search:books:${normalizeSearchText(q)}:page:${pageNum}`;
        try {
            const cached = await redisClient.get(searchCacheKey);
            if (cached) {
                console.log('Search cache hit for', searchCacheKey);
                return res.status(200).json(JSON.parse(cached));
            }
        } catch (e) {
            console.warn('Redis GET error for search cache', e && e.message ? e.message : e);
        }

        let combinedBooks = [];
        let sourceUsed = [];

        const fetchLocalBooks = async () => {
            try {
                const books = await prisma.book.findMany({
                    include: {
                        authors: { include: { author: true } },
                        genres: { include: { genre: true } },
                        rating: true,
                    },
                    take: 100,
                });

                const scoredLocalBooks = books
                    .map((book) => {
                        const ratings = book.rating || [];
                        const averageRating = ratings.length
                            ? ratings.reduce((sum, rating) => sum + Number(rating.star), 0) / ratings.length
                            : null;

                        return {
                            id: book.bookIsbn || book.id,
                            bookIsbn: book.bookIsbn || '',
                            title: book.title || '',
                            author: (book.authors || []).map((item) => item.author?.fullName).filter(Boolean).join(', '),
                            description: book.description || '',
                            publisher: book.publisher || '',
                            publishedDate: book.publishedYear ? String(book.publishedYear) : '',
                            book_image: normalizeImageUrl(book.imageUrl || null),
                            rating: averageRating ? Number(averageRating.toFixed(1)) : null,
                            categories: (book.genres || []).map((item) => item.genre?.name).filter(Boolean),
                            source: 'BookHaven',
                        };
                    })
                    .map((book) => ({ ...book, _score: scoreSearchBook(book, q) }))
                    .filter((book) => book._score > 0);

                if (scoredLocalBooks.length) sourceUsed.push('BookHaven');
                return scoredLocalBooks;
            } catch (e) {
                console.error('Local books search error:', e.message);
                return [];
            }
        };

        // Luồng Google Books (Tìm kiếm từ khóa rất mạnh)
        const fetchGoogleBooks = async () => {
            try {
                const queryVariants = [
                    q,
                    `intitle:${q}`,
                    q.split(/\s+/).filter(Boolean).map((word) => `intitle:${word}`).join(' '),
                ].filter(Boolean);

                const responses = await Promise.all(queryVariants.map(async (queryValue) => {
                    const gUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryValue)}&maxResults=20${googleKey ? `&key=${googleKey}` : ''}`;
                    const gResp = await fetch(gUrl);
                    if (!gResp.ok) return [];
                    const gData = await gResp.json();
                    return Array.isArray(gData.items) ? gData.items : [];
                }));

                const items = responses.flat();
                if (items.length) {
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
                            book_image: normalizeImageUrl(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null),
                            rating: info.averageRating || null,
                            categories: info.categories || [],
                            isbns: isbns,
                            source: 'Google Books',
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
                            book_image: normalizeImageUrl(isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null),
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

        // Chạy song song các nguồn dữ liệu
        const [localResults, googleResults, nytResults] = await Promise.all([
            fetchLocalBooks(),
            fetchGoogleBooks(),
            fetchNytBooks()
        ]);

        // Gộp kết quả từ 2 nguồn (loại bỏ trùng lặp qua ISBN nếu có)
        const seenIsbns = new Set();
        const seenTitles = new Set();
        const rawCombined = [...localResults, ...googleResults, ...nytResults];
        
        for (const book of rawCombined) {
            if (book.bookIsbn) {
                if (!seenIsbns.has(book.bookIsbn)) {
                    seenIsbns.add(book.bookIsbn);
                    combinedBooks.push(book);
                }
            } else {
                const titleKey = `${normalizeSearchText(book.title)}|${normalizeSearchText(book.author)}`;
                if (!seenTitles.has(titleKey)) {
                    seenTitles.add(titleKey);
                    combinedBooks.push(book);
                }
            }
        }

        if (combinedBooks.length === 0) {
            return res.status(200).json({ books: [], total: 0, totalPages: 0, source: 'None' });
        }

        const scored = combinedBooks.map(book => ({
            ...book,
            _score: Math.max(book._score || 0, scoreSearchBook(book, q)),
        }));

        // Lọc bỏ các kết quả có điểm số bằng 0 (hoàn toàn không liên quan đến từ khóa)
        const filteredAndScored = scored.filter(b => b._score > 0);

        // Sắp xếp giảm dần theo điểm số mức độ liên quan
        filteredAndScored.sort((a, b) => b._score - a._score);

        const startIndex = (pageNum - 1) * maxResults;
        const finalBooks = filteredAndScored.slice(startIndex, startIndex + maxResults).map(b => {
            delete b._score;
            return b;
        });

        const totalPages = Math.max(1, Math.ceil(filteredAndScored.length / maxResults));

        const responsePayload = {
            books: finalBooks,
            total: filteredAndScored.length,
            totalPages,
            source: sourceUsed.join(' + ')
        };

        // Cache search results for a short time
        try {
            await redisClient.setEx(searchCacheKey, 300, JSON.stringify(responsePayload));
        } catch (e) {
            console.warn('Redis SET error for search cache', e && e.message ? e.message : e);
        }

        return res.status(200).json(responsePayload);

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getBookByIsbn = async (req, res) => {
    try {
        const { bookIsbn } = req.params;
        console.log('getBookByIsbn called with:', bookIsbn);
        const bookCacheKey = `book:detail:${String(bookIsbn || '').replace(/-/g, '').trim()}`;
        try {
            const cached = await redisClient.get(bookCacheKey);
            if (cached) {
                console.log('Book detail cache hit for', bookCacheKey);
                return res.status(200).json(JSON.parse(cached));
            }
        } catch (e) {
            console.warn('Redis GET error for book detail', e && e.message ? e.message : e);
        }

        const isIsbnLike = /^[0-9Xx-]+$/.test(bookIsbn);

        // Distinguish between internal numeric IDs and numeric ISBNs (ISBN-10 or ISBN-13)
        const isPureDigits = /^\d+$/.test(bookIsbn);
        const looksLikeIsbnNumeric = isPureDigits && (bookIsbn.length === 10 || bookIsbn.length === 13);

        // If the param looks like a pure integer ID (not an ISBN-10/13), try to load from local DB first
        if (isPureDigits && !looksLikeIsbnNumeric) {
            try {
                const bid = Number(bookIsbn);
                const local = await prisma.book.findUnique({ where: { id: bid }, include: { authors: { include: { author: true } } }, rating: true });
                if (local) {
                    console.log('Found local book by id:', bid);
                    // If local record lacks rich metadata, try to supplement from Google Books using stored ISBN
                    let supplemental = {};
                    try {
                        const isbn = local.bookIsbn || null;
                        if (( !local.description || !local.imageUrl ) && isbn) {
                            const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`);
                            if (gRes.ok) {
                                const gData = await gRes.json();
                                const gItem = gData.items?.[0];
                                const info = gItem?.volumeInfo || {};
                                supplemental.description = info.description || info.subtitle || '';
                                supplemental.thumbnail = normalizeImageUrl(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null);
                                supplemental.publishedDate = info.publishedDate || '';
                                supplemental.pageCount = info.pageCount || null;
                                supplemental.publisher = info.publisher || '';
                                supplemental.language = info.language || '';
                            }
                        }
                    } catch (e) {
                        // ignore supplemental failures
                    }

                    return res.status(200).json({
                        id: local.id,
                        title: local.title,
                        author: (local.authors || []).map(a => a.author.fullName).join(', '),
                        description: local.description || supplemental.description || '',
                        rating: local.rating || 'N/A',
                        thumbnail: normalizeImageUrl(local.imageUrl || supplemental.thumbnail || null),
                        tags: [],
                        publishedDate: local.publishedYear ? String(local.publishedYear) : (supplemental.publishedDate || ''),
                        pageCount: local.pageCount || supplemental.pageCount || null,
                        publisher: local.publisher || supplemental.publisher || '',
                        language: local.language || supplemental.language || '',
                    });
                }
            } catch (e) {
                console.warn('Local DB lookup failed for book id', bookIsbn, e && e.message ? e.message : e);
            }
        }
        const mapGoogleItem = (item) => {
            const info = item.volumeInfo || {};
            return {
                id:            item.id || bookIsbn,
                title:         info.title || 'Unknown Title',
                author:        info.authors?.join(', ') || 'Unknown Author',
                description:   info.description || info.subtitle || '',
                rating:        info.averageRating || 'N/A',
                thumbnail:     normalizeImageUrl(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null),
                tags:          info.categories || [],
                publishedDate: info.publishedDate || '',
                pageCount:     info.pageCount || null,
                publisher:     info.publisher || '',
                language:      info.language || '',
            };
        };

        console.log('isIsbnLike:', isIsbnLike, 'isPureDigits:', isPureDigits, 'looksLikeIsbnNumeric:', looksLikeIsbnNumeric);
        if (!isIsbnLike) {
            try {
                const response = await fetch(
                    `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(bookIsbn)}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
                );
                const data = await response.json();
                console.log('Google volume fetch status:', response.status, 'items:', Array.isArray(data.items) ? data.items.length : (data.id ? 1 : 0));
                if (data && !data.error && (data.id || data.volumeInfo)) {
                    console.log('Resolved via Google volume id');
                    const out = mapGoogleItem(data);
                    try { await redisClient.setEx(bookCacheKey, 86400, JSON.stringify(out)); } catch (e) { /* noop */ }
                    return res.status(200).json(out);
                }
            } catch (err) {
                console.warn('Google volume fetch failed', err && err.message ? err.message : err);

            }
        }

        // Normalize ISBN (remove hyphens) and try local DB first before external APIs
        const isbn = String(bookIsbn).replace(/-/g, '').trim();
        try {
            const localBook = await prisma.book.findFirst({
                where: {
                    OR: [
                        { bookIsbn: bookIsbn },
                        { bookIsbn: isbn }
                    ]
                },
                include: { authors: { include: { author: true } }, rating: true }
            });

            if (localBook) {
                console.log('Found local book by ISBN:', localBook.id || localBook.bookIsbn);
                // supplement with Google only if more metadata is desired, but return local data immediately
                const ratings = localBook.rating || [];
                const averageRating = ratings.length ? ratings.reduce((sum, r) => sum + Number(r.star), 0) / ratings.length : null;

                const out = {
                    id: localBook.id,
                    title: localBook.title || 'Unknown Title',
                    author: (localBook.authors || []).map(a => a.author?.fullName).filter(Boolean).join(', ') || 'Unknown Author',
                    description: localBook.description || '',
                    rating: averageRating ? Number(averageRating.toFixed(1)) : (localBook.rating || 'N/A'),
                    thumbnail: normalizeImageUrl(localBook.imageUrl || null),
                    tags: [],
                    publishedDate: localBook.publishedYear ? String(localBook.publishedYear) : '',
                    pageCount: localBook.pageCount || null,
                    publisher: localBook.publisher || '',
                    language: localBook.language || '',
                };
                try { await redisClient.setEx(bookCacheKey, 86400, JSON.stringify(out)); } catch (e) { /* noop */ }
                return res.status(200).json(out);
            }
        } catch (e) {
            console.warn('Local DB lookup by ISBN failed', e && e.message ? e.message : e);
        }

        console.log('Searching Google by ISBN:', isbn);
        const searchRes = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );
        // Handle rate limits (429) gracefully
        if (searchRes.status === 429) {
            console.warn('Google Books API rate limited (429) for ISBN:', isbn);
        } else {
            const searchData = await searchRes.json();
            console.log('Google ISBN search status:', searchRes.status, 'items:', Array.isArray(searchData.items) ? searchData.items.length : 0);
            const item = searchData.items?.[0];
            if (item) {
                console.log('Resolved via Google ISBN search');
                const out = mapGoogleItem(item);
                try { await redisClient.setEx(bookCacheKey, 86400, JSON.stringify(out)); } catch (e) { /* noop */ }
                return res.status(200).json(out);
            }
        }

        try {
            const nytRes = await fetch(
                `https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?isbn=${isbn}&api-key=${process.env.NYT_API_KEY}`
            );
            const nytData = await nytRes.json();
            const match = nytData.results?.[0];

            if (match) {
                const out = {
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
                };
                try { await redisClient.setEx(bookCacheKey, 86400, JSON.stringify(out)); } catch (e) { /* noop */ }
                return res.status(200).json(out);
            }
        } catch (nytErr) { }

        console.log('No match found for ISBN/ID:', bookIsbn);
        return res.status(404).json({ message: 'Book not found' });
    }
    catch(error){
        return res.status(500).json({message: "Server error", error: error.message});
    }
    
};

const getTopRated = async(req, res) => {
    //console.log("Running get top rated");
    try{
        const requestedGenre = (req.query.genre || '').toString().trim().toLowerCase();
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

        // If a specific genre is requested, find matching list and return its top book only
        if (requestedGenre) {
            const matchedList = (results.lists || []).find(list => {
                const name = (list.list_name || '').toString().toLowerCase();
                return name === requestedGenre || name.includes(requestedGenre) || requestedGenre.includes(name);
            });

            if (!matchedList) {
                return res.status(404).json({ message: 'Genre not found' });
            }

            const book = matchedList.books[0];
            const isbn13 = book?.primary_isbn13 || book?.isbns?.[0]?.isbn13;

            let googleBook = null;
            try {
                if (isbn13) {
                    const gRes = await fetch(
                        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
                    );
                    const gData = await gRes.json();
                    googleBook = gData.items?.[0]?.volumeInfo;
                }
            } catch (e) { /* ignore google lookup failures */ }

            const detail = {
                genre: matchedList.list_name,
                title: book.title,
                author: book.author,
                cover: normalizeImageUrl(book.book_image),
                isbn13: book.primary_isbn13,
                rating: googleBook?.averageRating,
                ratingsCount: googleBook?.ratingsCount,
                pageCount: googleBook?.pageCount,
                publishedDate: googleBook?.publishedDate,
                categories: googleBook?.categories,
            };

            return res.status(200).json([detail]);
        }

        //Lay cuốn sách hot nhất của mỗi thể loại (default behavior)
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
                    cover: normalizeImageUrl(book.book_image),
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
