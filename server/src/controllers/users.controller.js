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

module.exports = {
    getInfo,
    getBookshelfInfo
};