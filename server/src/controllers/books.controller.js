const getRandomBooks = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const maxResults = 10;
        const startIndex = (page - 1) * maxResults;

        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults=${maxResults}&startIndex=${startIndex}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
        );

        const data = await response.json();
        //console.log("Google API response:", data.items.volumeInfo);

        if (!data.items) {
            return res.status(200).json({ books: [], totalPages: 0 });
        }

        const books = data.items.map((item) => ({
            id: item.id,
            title: item.volumeInfo.title || "Unknown Title",
            author: item.volumeInfo.authors?.join(", ") || "Unknown Author",
            summary: item.volumeInfo.description || "No description available.",
            rating: item.volumeInfo.averageRating || "N/A",
            thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
            tags: item.volumeInfo.categories || [],
        }));
        //console.log(books[0].id);
        return res.status(200).json({ books, totalPages: 10 });
    } catch (error) {
        //console.error("Lỗi books controller:", error);
        return res.status(500).json({ message: "Lỗi server", error: error.message });
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

module.exports = { 
    getRandomBooks,
    getBookById
};