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
                createdAt: true
            }
        })

        console.log("user từ DB:", user);

        const {password: pass, ...userWithoutPassword} = user;

        return res.status(200).json({message: "Get user information successfully!", user});
    }
    catch(error){
        console.error("Lỗi getInfo:", error);
        return res.status(500).json({message: "Server error", error});
    }
};

const getBookshelfInfo = async (req, res) => {
    try {
    const { userId } = req.params;

    const [reading, wishlist, read, drop] = await Promise.all([
      prisma.userBook.count({ where: { userId: Number(userId), status: "READING" } }),
      prisma.userBook.count({ where: { userId: Number(userId), status: "WISHLIST" } }),
      prisma.userBook.count({ where: { userId: Number(userId), status: "READ" } }),
      prisma.userBook.count({ where: { userId: Number(userId), status: "DROP" } }),
    ]);

    // Lấy 3 cuốn thêm gần nhất
    const recentBooks = await prisma.userBook.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        book: {
          select: { id: true, title: true, imageUrl: true }
        }
      }
    });

    return res.status(200).json({
      stats: { reading, wishlist, read, drop },
      recentBooks: recentBooks.map(ub => ({
        id: ub.book.id,
        title: ub.book.title,
        imageUrl: ub.book.imageUrl,
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
    getInfo,
    getBookshelfInfo
};