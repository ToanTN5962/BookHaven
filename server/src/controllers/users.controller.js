const prisma = require("../prisma/client");

const getInfo = async (req, res) => {
    try{
        const userId = Number(req.user.sub);
        console.log("userId từ token:", userId);

        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {
                fullName: true,
                dateOfBirth: true,
                sex: true,
                phoneNum: true,
                email: true,
                role: true,
                createdAt: true,
              
            }
        })

        console.log("user từ DB:", user);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // const [reading, wishlist, read, drop] = await Promise.all([
        //   prisma.userBook.count({ where: { userId: Number(userId), status: 'READING' } }),
        //   prisma.userBook.count({ where: { userId: Number(userId), status: 'WISHLIST' } }),
        //   prisma.userBook.count({ where: { userId: Number(userId), status: 'READ' } }),
        //   prisma.userBook.count({ where: { userId: Number(userId), status: 'DROP' } }),
        // ]);

        return res.status(200).json({
          message: "Get user information successfully!",
          user
          // stats: { reading, wishlist, read, drop }
        });
    }
    catch(error){
        console.error("Lỗi getInfo:", error);
        return res.status(500).json({message: "Server error", error});
    }
};

const getBookshelfInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = Number(userId);

    // fetch lists per status in parallel
    const [readingList, wishlistList, readList, dropList] = await Promise.all([
      prisma.userBook.findMany({
        where: { userId: uid, status: "READING" },
        orderBy: { createdAt: "desc" },
        include: { book: { select: { id: true, title: true, imageUrl: true, authors: { include: { author: { select: { fullName: true } } } } } } }
      }),
      prisma.userBook.findMany({
        where: { userId: uid, status: "WISHLIST" },
        orderBy: { createdAt: "desc" },
        include: { book: { select: { id: true, title: true, imageUrl: true, authors: { include: { author: { select: { fullName: true } } } } } } }
      }),
      prisma.userBook.findMany({
        where: { userId: uid, status: "READ" },
        orderBy: { createdAt: "desc" },
        include: { book: { select: { id: true, title: true, imageUrl: true, authors: { include: { author: { select: { fullName: true } } } } } } }
      }),
      prisma.userBook.findMany({
        where: { userId: uid, status: "DROP" },
        orderBy: { createdAt: "desc" },
        include: { book: { select: { id: true, title: true, imageUrl: true, authors: { include: { author: { select: { fullName: true } } } } } } }
      }),
    ]);

    const mapBooks = (list) => list.map(ub => ({
      id: ub.book.id,
      title: ub.book.title,
      imageUrl: ub.book.imageUrl,
      author: (ub.book.authors || []).map(a => a.author.fullName).join(', '),
      addedAt: ub.createdAt
    }));

    return res.status(200).json({
      stats: {
        reading: readingList.length,
        wishlist: wishlistList.length,
        read: readList.length,
        drop: dropList.length
      },
      reading: mapBooks(readingList),
      wishlist: mapBooks(wishlistList),
      read: mapBooks(readList),
      drop: mapBooks(dropList)
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addToShelf = async (req, res) => {
  try {
    const userId = Number(req.user.sub);
    const { status, book } = req.body;

    if (!status || !book) return res.status(400).json({ message: 'Missing status or book' });

    // Determine or create Book record
    let bookId = null;

    if (book.id && Number.isInteger(book.id)) {
      const found = await prisma.book.findUnique({ where: { id: book.id } });
      if (found) bookId = found.id;
    }

    if (!bookId && book.title) {
      const found = await prisma.book.findFirst({ where: { title: book.title } });
      if (found) bookId = found.id;
    }

    if (!bookId) {
      const publishedYear = book.publishedDate ? parseInt((book.publishedDate + '').slice(0,4)) || 0 : 0;
      const created = await prisma.book.create({
        data: {
          title: book.title || 'Untitled',
          publishedYear,
          publisher: book.publisher || '',
          description: book.description || '',
          language: book.language || 'en',
          imageUrl: book.thumbnail || book.imageUrl || null,
        }
      });
      bookId = created.id;
    }

    // upsert userBook by compound unique (userId_bookId)
    const userBook = await prisma.userBook.upsert({
      where: { userId_bookId: { userId, bookId } },
      update: { status },
      create: { user: { connect: { id: userId } }, book: { connect: { id: bookId } }, status }
    });

    return res.status(200).json({ message: 'Shelf updated', userBook });
  } catch (error) {
    console.error('Error in addToShelf:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
    getInfo,
    getBookshelfInfo,
    addToShelf
};