const prisma = require("../prisma/client");

const createReview = async (req, res) => {
    try {
        console.log('createReview called with body:', { body: req.body, user: req.user && (req.user.sub || req.user.id) });
        const { bookId, bookIsbn, rating, content, title, author, publisher, publishedYear, imageUrl, language, description } = req.body;

        const uid = req.user && (req.user.sub || req.user.id) ? Number(req.user.sub || req.user.id) : (req.body.userId ? Number(req.body.userId) : null);
        if (!uid) return res.status(401).json({ message: 'Unauthorized: user not found in token or body' });

        const isbnStrFromBody = bookIsbn ? String(bookIsbn).trim() : null;

        const user = await prisma.user.findUnique({ where: { id: uid } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Determine book: prefer bookId, otherwise upsert by ISBN provided
        let book = null;
        let bid = null;
        let isbnStr = isbnStrFromBody;

        if (bookId) {
            const maybeId = Number(bookId);
            if (!Number.isNaN(maybeId)) {
                book = await prisma.book.findUnique({ where: { id: maybeId } });
                if (book) {
                    bid = book.id;
                    if (!isbnStr && book.bookIsbn) isbnStr = book.bookIsbn;
                }
            }
        }

        // If we still don't have a book record, try to create one.
        if (!book) {
            let py = undefined;
            if (publishedYear !== undefined && publishedYear !== null) {
                const n = Number(publishedYear);
                py = Number.isFinite(n) && !Number.isNaN(n) ? Math.trunc(n) : undefined;
            }
            if (py === undefined && req.body.publishedYearFromClient !== undefined) {
                const n = Number(req.body.publishedYearFromClient);
                py = Number.isFinite(n) && !Number.isNaN(n) ? Math.trunc(n) : undefined;
            }
            if (py === undefined) py = new Date().getFullYear();
            if (isbnStr) {
                book = await prisma.book.upsert({
                    where: { bookIsbn: isbnStr },
                    update: {},
                    create: {
                        bookIsbn: isbnStr,
                        title: title || 'Unknown Title',
                        publisher: publisher || 'Unknown Publisher',
                        publishedYear: py,
                        description: description || req.body.description || '',
                        language: language || 'en',
                        imageUrl: imageUrl || null,
                    }
                });
            } else {
                // Fallback: create a local book record without ISBN when client provided title
                book = await prisma.book.create({
                    data: {
                        bookIsbn: null,
                        title: title || 'Unknown Title',
                        publisher: publisher || 'Unknown Publisher',
                        publishedYear: py,
                        description: description || req.body.description || '',
                        language: language || 'en',
                        imageUrl: imageUrl || null,
                    }
                });
            }

            bid = book.id;
        }

        // Prevent duplicate reviews: one review per user per book (match by bookId and/or bookIsbn)
        const orConditions = [];
        if (typeof bid === 'number' && !Number.isNaN(bid)) orConditions.push({ bookId: bid });
        if (isbnStr) orConditions.push({ bookIsbn: isbnStr });

        if (orConditions.length > 0) {
            console.log('Checking existing reviews with conditions:', orConditions);
            const existingReview = await prisma.review.findFirst({
                where: {
                    userId: uid,
                    OR: orConditions
                }
            });

            if (existingReview) {
                console.log('Duplicate review detected, userId, reviewId:', uid, existingReview.id);
                return res.status(409).json({ message: 'User has already reviewed this book' });
            }
        }

        const created = await prisma.review.create({
            data: {
                content: content || '',
                userId: uid,
                bookId: bid,
                bookIsbn: isbnStr || null
            },
            include: { user: true }
        });

        if (rating !== undefined && rating !== null && rating !== '') {
            const star = parseFloat(rating);
            if (!Number.isNaN(star) && star >= 0 && star <= 5) {
                await prisma.rating.upsert({
                    where: { userId_bookId: { userId: uid, bookId: bid } },
                    update: { star },
                    create: { star, userId: uid, bookId: bid, bookIsbn: isbnStr || null }
                });
            }
        }

        console.log('Review created id:', created.id, 'for bookId:', bid, 'isbn:', isbnStr || null);

        return res.status(201).json({ review: created });
    } catch (error) {
        console.error('createReview error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMyReviews = async (req, res) => {
    try {
        const userId = Number(req.user.sub);
        const reviews = await prisma.review.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { book: { select: { id: true, title: true, imageUrl: true, authors: { include: { author: { select: { fullName: true } } } } } } }
        });

        const mapped = reviews.map(r => ({
            id: r.id,
            content: r.content,
            createdAt: r.createdAt,
            book: r.book ? { id: r.book.id, title: r.book.title, imageUrl: r.book.imageUrl, author: (r.book.authors || []).map(a => a.author.fullName).join(', ') } : null
        }));

        return res.status(200).json({ reviews: mapped });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getReviewsForBook = async (req, res) => {
    try {
        const { bookId, bookIsbn } = req.query;
        console.log('getReviewsForBook called with query:', req.query);
        if (!bookId && !bookIsbn) return res.status(400).json({ message: 'Missing bookId or bookIsbn' });

        // Determine correct where clause: prefer numeric bookId, else use ISBN. If bookId is non-numeric, try to find a Book by that value as ISBN.
        let where = {};
        if (bookId) {
            const parsed = Number(bookId);
            if (!Number.isNaN(parsed)) {
                where.bookId = parsed;
            } else {
                // try to find a book with bookIsbn equal to the provided bookId string
                const mapped = await prisma.book.findFirst({ where: { bookIsbn: String(bookId) } });
                if (mapped) where.bookId = mapped.id;
                else if (bookIsbn) where.bookIsbn = String(bookIsbn);
                else where.bookIsbn = String(bookId);
            }
        } else if (bookIsbn) {
            // Try to resolve the provided bookIsbn string to a local book first
            const normalized = String(bookIsbn || '').replace(/-/g, '').trim();
            let resolvedBook = null;
            try {
                // try matching by exact bookIsbn or normalized isbn
                resolvedBook = await prisma.book.findFirst({
                    where: {
                        OR: [
                            { bookIsbn: String(bookIsbn) },
                            { bookIsbn: normalized }
                        ]
                    }
                });
            } catch (e) {
                // ignore resolution errors
            }

            if (resolvedBook) {
                where.bookId = resolvedBook.id;
            } else {
                // fallback to matching by the provided bookIsbn string
                where.bookIsbn = String(bookIsbn);
            }
        }

        // include likes and user
        const reviews = await prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { user: true, likes: true }
        });

        const currentUserId = req.user && (req.user.sub || req.user.id) ? Number(req.user.sub || req.user.id) : null;

        // map reviews to client-friendly shape
        const mapped = reviews.map(r => ({
            id: r.id,
            content: r.content,
            createdAt: r.createdAt,
            user: { name: r.user?.fullName || r.user?.username || 'Anonymous' },
            likes: Array.isArray(r.likes) ? r.likes.length : 0,
            liked: currentUserId ? (r.likes || []).some(l => l.userId === currentUserId) : false,
        }));

        return res.status(200).json({ reviews: mapped });
    } catch (error) {
        console.error('getReviewsForBook error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createReview,
    getMyReviews,
    getReviewsForBook
};
