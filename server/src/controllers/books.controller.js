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
                // cache for 1 hour
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

const getBookByName = async (req, res) => {
    try {
        const q = (req.query.q || req.query.name || '').trim();
        if (!q) return res.status(400).json({ message: 'Search info is missing' });

        const apiKey = process.env.NYT_API_KEY;
        if (!apiKey) return res.status(503).json({ message: 'NYT API key not configured' });

        // The NYT 'best-sellers/history' endpoint accepts title param to search history
        const url = `https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json?title=${encodeURIComponent(q)}&api-key=${apiKey}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            return res.status(502).json({ message: 'NYT API error', status: resp.status, body: text });
        }

        const data = await resp.json();
        const results = Array.isArray(data.results) ? data.results : [];

        const mapped = results.map((r, i) => ({
            id: r.primary_isbn13 || r.primary_isbn10 || '',
            title: r.title || '',
            author: r.author || '',
            description: r.description || r.notes || '',
            publisher: r.publisher || '',
            publishedDate: r.published_date || null,
            book_image: r.book_image || null,
            isbns: r.isbns || [],
        }));

        return res.status(200).json({ books: mapped, total: mapped.length });
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