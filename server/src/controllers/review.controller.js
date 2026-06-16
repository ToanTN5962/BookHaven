const prisma = require("../prisma/client");

const createReview = async (req, res) => {
    try {
        const { bookId, bookIsbn, rating, content, title, author, publisher, publishedYear, imageUrl, language, description } = req.body;

        const uid = req.user && (req.user.sub || req.user.id) ? Number(req.user.sub || req.user.id) : (req.body.userId ? Number(req.body.userId) : null);
        if (!uid) return res.status(401).json({ message: 'Unauthorized: user not found in token or body' });

        if (!bookIsbn || String(bookIsbn).trim() === '') {
            return res.status(400).json({ message: 'Missing bookIsbn' });
        }

        const isbnStr = String(bookIsbn).trim();

        const user = await prisma.user.findUnique({ where: { id: uid } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // ĐẢM BẢO SÁCH PHẢI TỒN TẠI (Có thì lấy id, chưa có thì tự tạo mới từ thông tin FE gửi)
        // normalize publishedYear: accept numeric or parseable string, fallback to current year
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

        const book = await prisma.book.upsert({
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
                // TODO: connect authors/genres if provided
            }
        });

        const bid = book.id; 

        const created = await prisma.review.create({
            data: {
                content: content || '',
                userId: uid,
                bookId: bid,
                bookIsbn: isbnStr
            },
            include: { user: true }
        });

        if (rating !== undefined && rating !== null && rating !== '') {
            const star = parseFloat(rating);
            if (!Number.isNaN(star) && star >= 0 && star <= 5) {
                await prisma.rating.upsert({
                    where: { userId_bookId: { userId: uid, bookId: bid } },
                    update: { star },
                    create: { star, userId: uid, bookId: bid, bookIsbn: isbnStr }
                });
            }
        }

        return res.status(201).json({ review: created });
    } catch (error) {
        console.error('createReview error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createReview
};