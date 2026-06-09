const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu với Schema mới...");

  // ───────────────────────────────────────────
  // 1. USERS
  // ───────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bookhaven.com" },
    update: {},
    create: {
      fullName: "Admin BookHaven",
      email: "admin@bookhaven.com",
      password: hashedPassword,
      phoneNum: "0901234567",
      role: "ADMIN",
      sex: "MALE",
      dateOfBirth: new Date("1990-01-15"),
    },
  });

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "a@gmail.com" },
      update: {},
      create: {
        fullName: "Nguyễn Thị A",
        email: "a@gmail.com",
        password: hashedPassword,
        phoneNum: "0912345678",
        sex: "FEMALE",
        dateOfBirth: new Date("1995-03-22"),
      },
    }),
    prisma.user.upsert({
      where: { email: "b@gmail.com" },
      update: {},
      create: {
        fullName: "Trần Văn B",
        email: "b@gmail.com",
        password: hashedPassword,
        phoneNum: "0923456789",
        sex: "MALE",
        dateOfBirth: new Date("1998-07-10"),
      },
    }),
    prisma.user.upsert({
      where: { email: "c@gmail.com" },
      update: {},
      create: {
        fullName: "Lê Thị C",
        email: "c@gmail.com",
        password: hashedPassword,
        phoneNum: "0934567890",
        sex: "FEMALE",
        dateOfBirth: new Date("2000-11-05"),
      },
    }),
    prisma.user.upsert({
      where: { email: "d@gmail.com" },
      update: {},
      create: {
        fullName: "Phạm Văn D",
        email: "d@gmail.com",
        password: hashedPassword,
        phoneNum: "0945678901",
        sex: "MALE",
        dateOfBirth: new Date("1993-05-18"),
      },
    }),
    prisma.user.upsert({
      where: { email: "e@gmail.com" },
      update: {},
      create: {
        fullName: "Hoàng Thị E",
        email: "e@gmail.com",
        password: hashedPassword,
        phoneNum: "0956789012",
        sex: "FEMALE",
        dateOfBirth: new Date("1997-09-30"),
      },
    }),
  ]);

  console.log("✅ Đã tạo users");

  // ───────────────────────────────────────────
  // 2. AUTHORS
  // ───────────────────────────────────────────
  // Dùng upsert theo id cố định để tránh bị crash khi chạy lại seed
  const authorsData = [
    { id: 1, fullName: "Nguyễn Nhật Ánh", sex: "MALE", dateOfBirth: new Date("1955-05-07"), description: "Nhà văn nổi tiếng Việt Nam." },
    { id: 2, fullName: "Nam Quốc Chánh", sex: "MALE", dateOfBirth: new Date("1970-03-12"), description: "Tác giả chuyên viết về tâm lý." },
    { id: 3, fullName: "J.K. Rowling", sex: "FEMALE", dateOfBirth: new Date("1965-07-31"), description: "Tác giả người Anh nổi tiếng với Harry Potter." },
    { id: 4, fullName: "George Orwell", sex: "MALE", dateOfBirth: new Date("1903-06-25"), description: "Nhà văn và nhà báo người Anh phê phán chính trị." },
    { id: 5, fullName: "Paulo Coelho", sex: "MALE", dateOfBirth: new Date("1947-08-24"), description: "Nhà văn người Brazil, tác giả của Nhà Giả Kim." },
    { id: 6, fullName: "Haruki Murakami", sex: "MALE", dateOfBirth: new Date("1949-01-12"), description: "Nhà văn người Nhật nổi tiếng với phong cách huyền ảo." },
    { id: 7, fullName: "Tô Hoài", sex: "MALE", dateOfBirth: new Date("1920-09-27"), description: "Nhà văn Việt Nam nổi tiếng với Dế Mèn Phiêu Lưu Ký." },
  ];

  const authors = await Promise.all(
    authorsData.map((author) =>
      prisma.author.upsert({
        where: { id: author.id },
        update: {},
        create: author,
      })
    )
  );
  console.log("✅ Đã tạo authors");

  // ───────────────────────────────────────────
  // 3. GENRES
  // ───────────────────────────────────────────
  const genresData = [
    { id: 1, name: "Văn học Việt Nam" },
    { id: 2, name: "Tiểu thuyết" },
    { id: 3, name: "Phát triển bản thân" },
    { id: 4, name: "Khoa học viễn tưởng" },
    { id: 5, name: "Trinh thám" },
    { id: 6, name: "Lịch sử" },
    { id: 7, name: "Thiếu nhi" },
    { id: 8, name: "Tâm lý" },
  ];

  const genres = await Promise.all(
    genresData.map((genre) =>
      prisma.genre.upsert({
        where: { id: genre.id },
        update: {},
        create: genre,
      })
    )
  );
  console.log("✅ Đã tạo genres");

  // ───────────────────────────────────────────
  // 4. BOOKS (Đã bổ sung thuộc tính bookIsbn dạng String)
  // ───────────────────────────────────────────
  const booksData = [
    {
      bookIsbn: "9786041121300", // Thêm ISBN giả lập theo dạng Chuỗi
      title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
      publishedYear: 2010,
      publisher: "NXB Trẻ",
      description: "Câu chuyện tuổi thơ đẹp đẽ và trong sáng ở vùng quê Việt Nam.",
      language: "vi",
      imageUrl: "https://placehold.co/150x200?text=Hoa+Vang",
      authorIdx: 0,
      genreIdxs: [0, 1],
    },
    {
      bookIsbn: "9786041162716",
      title: "Mắt Biếc",
      publishedYear: 1990,
      publisher: "NXB Trẻ",
      description: "Câu chuyện tình yêu trong sáng và đầy tiếc nuối của tuổi học trò.",
      language: "vi",
      imageUrl: "https://via.placeholder.com/150x200?text=Mat+Biec",
      authorIdx: 0,
      genreIdxs: [0, 1],
    },
    {
      bookIsbn: "9786045814186",
      title: "Đắc Nhân Tâm",
      publishedYear: 2016,
      publisher: "NXB Tổng Hợp",
      description: "Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử.",
      language: "vi",
      imageUrl: "https://via.placeholder.com/150x200?text=Dac+Nhan+Tam",
      authorIdx: 1,
      genreIdxs: [2, 7],
    },
    {
      bookIsbn: "9780747532699",
      title: "Harry Potter và Hòn Đá Phù Thủy",
      publishedYear: 1997,
      publisher: "Bloomsbury",
      description: "Cuộc phiêu lưu của cậu bé phù thủy Harry Potter tại trường Hogwarts.",
      language: "en",
      imageUrl: "https://via.placeholder.com/150x200?text=Harry+Potter",
      authorIdx: 2,
      genreIdxs: [1, 6],
    },
    {
      bookIsbn: "9780451524935",
      title: "1984",
      publishedYear: 1949,
      publisher: "Secker & Warburg",
      description: "Tiểu thuyết dystopia về một xã hội toàn trị trong tương lai.",
      language: "en",
      imageUrl: "https://via.placeholder.com/150x200?text=1984",
      authorIdx: 3,
      genreIdxs: [1, 3],
    },
    {
      bookIsbn: "9780062315007",
      title: "Nhà Giả Kim",
      publishedYear: 1988,
      publisher: "HarperCollins",
      description: "Hành trình của chàng trai trẻ Santiago đi tìm kho báu và ý nghĩa cuộc sống.",
      language: "vi",
      imageUrl: "https://via.placeholder.com/150x200?text=Nha+Gia+Kim",
      authorIdx: 4,
      genreIdxs: [1, 2],
    },
    {
      bookIsbn: "9780375701900",
      title: "Rừng Na-Uy",
      publishedYear: 1987,
      publisher: "Kodansha",
      description: "Câu chuyện về tình yêu, mất mát và trưởng thành ở Nhật Bản thập niên 60.",
      language: "vi",
      imageUrl: "https://via.placeholder.com/150x200?text=Rung+Na+Uy",
      authorIdx: 5,
      genreIdxs: [1, 7],
    },
    {
      bookIsbn: "9786042185523",
      title: "Dế Mèn Phiêu Lưu Ký",
      publishedYear: 1941,
      publisher: "NXB Kim Đồng",
      description: "Cuộc phiêu lưu của chú Dế Mèn trong thế giới loài vật.",
      language: "vi",
      imageUrl: "https://via.placeholder.com/150x200?text=De+Men",
      authorIdx: 6,
      genreIdxs: [0, 6],
    },
    {
      bookIsbn: "9781400079278",
      title: "Kafka Bên Bờ Biển",
      publishedYear: 2002,
      publisher: "Shinchosha",
      description: "Câu chuyện huyền ảo về cậu bé 15 tuổi bỏ nhà ra đi tìm bản thân.",
      language: "vi",
      imageUrl: "https://via.placeholder.com/150x200?text=Kafka",
      authorIdx: 5,
      genreIdxs: [1, 3],
    },
    {
      bookIsbn: "9786041002364",
      title: "Cho Tôi Xin Một Vé Đi Tuổi Thơ",
      publishedYear: 2008,
      publisher: "NXB Trẻ",
      description: "Hành trình trở về tuổi thơ qua những kỷ niệm đẹp đẽ.",
      language: "vi",
      imageUrl: "https://via.placeholder.com/150x200?text=Ve+Di+Tuoi+Tho",
      authorIdx: 0,
      genreIdxs: [0, 7],
    },
  ];

  // Chuyển sang dùng upsert dựa theo trường duy nhất `bookIsbn`
  const books = await Promise.all(
    booksData.map((b) =>
      prisma.book.upsert({
        where: { bookIsbn: b.bookIsbn },
        update: {},
        create: {
          bookIsbn: b.bookIsbn,
          title: b.title,
          publishedYear: b.publishedYear,
          publisher: b.publisher,
          description: b.description,
          language: b.language,
          imageUrl: b.imageUrl,
          authors: {
            create: { authorId: authors[b.authorIdx].id },
          },
          genres: {
            create: b.genreIdxs.map((gIdx) => ({ genreId: genres[gIdx].id })),
          },
        },
      })
    )
  );

  console.log("✅ Đã tạo hoặc đồng bộ books kèm theo bookIsbn");

  // ───────────────────────────────────────────
  // 5. RATINGS
  // ───────────────────────────────────────────
  const ratingsData = [
    { userIdx: 0, bookIdx: 0, star: 5.0 },
    { userIdx: 0, bookIdx: 1, star: 4.5 },
    { userIdx: 0, bookIdx: 3, star: 5.0 },
    { userIdx: 1, bookIdx: 0, star: 4.0 },
    { userIdx: 1, bookIdx: 2, star: 4.5 },
    { userIdx: 1, bookIdx: 4, star: 5.0 },
    { userIdx: 2, bookIdx: 1, star: 3.5 },
    { userIdx: 2, bookIdx: 5, star: 4.5 },
    { userIdx: 2, bookIdx: 6, star: 4.0 },
    { userIdx: 3, bookIdx: 2, star: 5.0 },
    { userIdx: 3, bookIdx: 7, star: 4.0 },
    { userIdx: 3, bookIdx: 8, star: 4.5 },
    { userIdx: 4, bookIdx: 3, star: 4.5 },
    { userIdx: 4, bookIdx: 9, star: 5.0 },
    { userIdx: 4, bookIdx: 6, star: 3.5 },
  ];

  await Promise.all(
    ratingsData.map(({ userIdx, bookIdx, star }) =>
      prisma.rating.upsert({
        where: {
          userId_bookId: {
            userId: users[userIdx].id,
            bookId: books[bookIdx].id,
          },
        },
        update: { star },
        create: {
          userId: users[userIdx].id,
          bookId: books[bookIdx].id,
          bookIsbn: books[bookIdx].bookIsbn, // Gán kèm thông tin bookIsbn phụ
          star,
        },
      })
    )
  );

  console.log("✅ Đã tạo ratings");

  // ───────────────────────────────────────────
  // 6. REVIEWS
  // ───────────────────────────────────────────
  const reviewsData = [
    { userIdx: 0, bookIdx: 0, content: "Cuốn sách tuyệt vời! Gợi nhớ lại tuổi thơ đẹp đẽ. Rất nên đọc!" },
    { userIdx: 0, bookIdx: 3, content: "Harry Potter mãi là kinh điển. Đọc lần thứ 5 vẫn hay!" },
    { userIdx: 1, bookIdx: 2, content: "Đắc Nhân Tâm thay đổi cách tôi nhìn nhận các mối quan hệ." },
    { userIdx: 1, bookIdx: 4, content: "1984 là một tác phẩm đáng sợ nhưng cực kỳ sâu sắc." },
    { userIdx: 2, bookIdx: 5, content: "Nhà Giả Kim khiến tôi suy nghĩ lại về ước mơ của mình." },
    { userIdx: 2, bookIdx: 6, content: "Rừng Na-Uy buồn nhưng đẹp theo cách riêng của nó." },
    { userIdx: 3, bookIdx: 7, content: "Dế Mèn Phiêu Lưu Ký là cuốn sách gắn liền với tuổi thơ tôi." },
    { userIdx: 3, bookIdx: 1, content: "Mắt Biếc đọc xong mà lòng cứ vấn vương mãi." },
    { userIdx: 4, bookIdx: 9, content: "Cho Tôi Xin Một Vé Đi Tuổi Thơ - cái tên đã nói lên tất cả." },
    { userIdx: 4, bookIdx: 8, content: "Kafka Bên Bờ Biển là một trải nghiệm đọc sách kỳ lạ và tuyệt vời." },
  ];

  // Vì Review không có trường @@unique tổng hợp để làm điểm tựa cho upsert,
  // chúng ta xóa dữ liệu Review cũ local rồi chạy create để tránh bị nhân bản bản ghi rác khi seed lại.
  await prisma.reviewLike.deleteMany({});
  await prisma.review.deleteMany({});

  const reviews = await Promise.all(
    reviewsData.map(({ userIdx, bookIdx, content }) =>
      prisma.review.create({
        data: {
          userId: users[userIdx].id,
          bookId: books[bookIdx].id,
          bookIsbn: books[bookIdx].bookIsbn, // Đồng bộ trường bookIsbn
          content,
        },
      })
    )
  );

  console.log("✅ Đã tạo reviews");

  // ───────────────────────────────────────────
  // 7. REVIEW LIKES
  // ───────────────────────────────────────────
  const likesData = [
    { userIdx: 1, reviewIdx: 0 },
    { userIdx: 2, reviewIdx: 0 },
    { userIdx: 3, reviewIdx: 1 },
    { userIdx: 0, reviewIdx: 2 },
    { userIdx: 4, reviewIdx: 2 },
    { userIdx: 1, reviewIdx: 4 },
    { userIdx: 2, reviewIdx: 5 },
    { userIdx: 0, reviewIdx: 6 },
    { userIdx: 3, reviewIdx: 8 },
    { userIdx: 4, reviewIdx: 7 },
  ];

  await Promise.all(
    likesData.map(({ userIdx, reviewIdx }) =>
      prisma.reviewLike.upsert({
        where: {
          userId_reviewId: {
            userId: users[userIdx].id,
            reviewId: reviews[reviewIdx].id,
          },
        },
        update: {},
        create: {
          userId: users[userIdx].id,
          reviewId: reviews[reviewIdx].id,
        },
      })
    )
  );

  console.log("✅ Đã tạo review likes");

  // ───────────────────────────────────────────
  // 8. USER BOOKS (Wishlist / Reading / Read)
  // ───────────────────────────────────────────
  const userBooksData = [
    { userIdx: 0, bookIdx: 2, status: "WISHLIST" },
    { userIdx: 0, bookIdx: 4, status: "READING" },
    { userIdx: 0, bookIdx: 5, status: "READ" },
    { userIdx: 1, bookIdx: 1, status: "WISHLIST" },
    { userIdx: 1, bookIdx: 6, status: "READ" },
    { userIdx: 1, bookIdx: 7, status: "READING" },
    { userIdx: 2, bookIdx: 0, status: "READ" },
    { userIdx: 2, bookIdx: 3, status: "WISHLIST" },
    { userIdx: 2, bookIdx: 8, status: "DROP" },
    { userIdx: 3, bookIdx: 5, status: "READ" },
    { userIdx: 3, bookIdx: 9, status: "READING" },
    { userIdx: 4, bookIdx: 0, status: "WISHLIST" },
    { userIdx: 4, bookIdx: 4, status: "READ" },
    { userIdx: 4, bookIdx: 2, status: "DROP" },
  ];

  await Promise.all(
    userBooksData.map(({ userIdx, bookIdx, status }) =>
      prisma.userBook.upsert({
        where: {
          userId_bookId: {
            userId: users[userIdx].id,
            bookId: books[bookIdx].id,
          },
        },
        update: { status },
        create: {
          userId: users[userIdx].id,
          bookId: books[bookIdx].id,
          bookIsbn: books[bookIdx].bookIsbn, // Bổ sung thông tin bookIsbn
          status,
        },
      })
    )
  );

  console.log("✅ Đã tạo user books");

  // ───────────────────────────────────────────
  // 9. COMPLAINTS
  // ───────────────────────────────────────────
  // Clear dữ liệu rác cũ trước khi nạp mới để không lỗi trùng lặp khi chạy lại lệnh seed nhiều lần
  await prisma.complaint.deleteMany({});

  await Promise.all([
    prisma.complaint.create({
      data: {
        userId: users[0].id,
        description: "Thông tin năm xuất bản của sách Mắt Biếc bị sai.",
        type: "WRONG_INFO",
        solvingStatus: "SOLVING",
      },
    }),
    prisma.complaint.create({
      data: {
        userId: users[1].id,
        description: "Review của user chứa ngôn từ không phù hợp.",
        type: "INAPPROPRIATE_REVIEW",
        solvingStatus: "SOLVED",
        handledById: admin.id,
        handleAt: new Date(),
      },
    }),
    prisma.complaint.create({
      data: {
        userId: users[2].id,
        description: "Sách Dế Mèn Phiêu Lưu Ký bị thiếu mô tả.",
        type: "MISSING_CONTENT",
        solvingStatus: "SOLVING",
      },
    }),
    prisma.complaint.create({
      data: {
        userId: users[3].id,
        description: "Có 2 bản ghi trùng nhau cho cuốn Harry Potter.",
        type: "DUPLICATE_BOOK",
        solvingStatus: "REJECTED",
        handledById: admin.id,
        handleAt: new Date(),
      },
    }),
  ]);

  console.log("✅ Đã tạo complaints");
  console.log("\n🎉 Seed hoàn tất!");
  console.log("📧 Admin: admin@bookhaven.com | 🔑 password123");
  console.log("📧 User:  a@gmail.com, b@gmail.com... | 🔑 password123");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });