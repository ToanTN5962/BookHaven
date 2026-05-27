const getRandomBooks = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const maxResults = 10;
        const startIndex = (page - 1) * maxResults;
        // Use NYT Best Sellers overview to pick random best-seller books
        const nytRes = await fetch(
            `https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=${process.env.NYT_API_KEY}`
        );
        const nytData = await nytRes.json();

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

        const selected = allBooks.slice(0, maxResults);

        const books = selected.map((book) => ({
            id: book.primary_isbn13 || book.primary_isbn10 || book.title,
            title: book.title || 'Unknown Title',
            author: book.author || 'Unknown Author',
            summary: book.description || book.contributor || 'No description available.',
            rating: 'N/A',
            thumbnail: book.book_image || null,
            tags: [book.list_name].filter(Boolean),
        }));

        return res.status(200).json({ books, totalPages: 1 });
    } catch (error) {
        //console.error("Lỗi books controller:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getBookById = async (req, res) => {
    try {
        const { bookId } = req.params;
        //console.log(bookId);

        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );
        const data = await response.json();
        //console.log(data)

        const book = {
            id:            data.id,
            title:         data.volumeInfo.title || 'Unknown Title',
            author:        data.volumeInfo.authors?.join(', ') || 'Unknown Author',
            description:   data.volumeInfo.description || '',
            rating:        data.volumeInfo.averageRating || 'N/A',
            thumbnail:     data.volumeInfo.imageLinks?.thumbnail || null,
            tags:          data.volumeInfo.categories || [],
            publishedDate: data.volumeInfo.publishedDate || '',
            pageCount:     data.volumeInfo.pageCount || null,
            publisher:     data.volumeInfo.publisher || '',
            language:      data.volumeInfo.language || '',
        };

        //console.log(book);
        return res.status(200).json(book);
    }
    catch(error){
        return res.status(500).json({message: "Server error"}, error);
    }
    
};

const getTopRated = async(req, res) => {
    //console.log("Running get top rated");
    try{
        const nytRes = await fetch(
            `https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=${process.env.NYT_API_KEY}`
        );
        const { results } = await nytRes.json();

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
    getBookById,
    getTopRated
};