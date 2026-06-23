const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu nạp dữ liệu thử nghiệm Gamification chuẩn Schema...");

  const userEmails = ["a@gmail.com", "b@gmail.com", "c@gmail.com", "d@gmail.com", "e@gmail.com"];

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Dữ liệu Mock mô phỏng thực tế đầy đủ 3 bảng: Streak, Challenge năm, và Tiến độ tháng (Tháng 6/2026)
  const gamificationDataMock = [
    {
      // User A: Streak 7 ngày, hôm nay cày 6 phút (đạt mục tiêu), Thử thách 2026 đã đọc sách & review tháng này
      streak: { currentStreak: 7, longestStreak: 10, lastActiveDate: today, todaySecondsSpent: 360 },
      challenge: { year: 2026, isCompleted: false },
      monthly: { month: 6, hasReadBook: true, hasValidReview: true, isMonthPassed: true }
    },
    {
      // User B: Streak 3 ngày, hôm nay mới vào 2 phút (chưa đạt mục tiêu), tháng này mới chỉ đọc sách chứ chưa review
      streak: { currentStreak: 3, longestStreak: 5, lastActiveDate: yesterday, todaySecondsSpent: 120 },
      challenge: { year: 2026, isCompleted: false },
      monthly: { month: 6, hasReadBook: true, hasValidReview: false, isMonthPassed: false }
    },
    {
      // User C: Chuỗi lớn 15 ngày, hôm nay ĐÃ đạt mục tiêu đọc sách, tháng này đã đạt yêu cầu vượt qua
      streak: { currentStreak: 15, longestStreak: 15, lastActiveDate: today, todaySecondsSpent: 450 },
      challenge: { year: 2026, isCompleted: false },
      monthly: { month: 6, hasReadBook: true, hasValidReview: true, isMonthPassed: true }
    },
    {
      // User D: Đứt chuỗi, hôm nay cày bù hẳn 10 phút, tháng này chưa làm gì cả
      streak: { currentStreak: 1, longestStreak: 12, lastActiveDate: today, todaySecondsSpent: 600 },
      challenge: { year: 2026, isCompleted: false },
      monthly: { month: 6, hasReadBook: false, hasValidReview: false, isMonthPassed: false }
    },
    {
      // User E: Người mới, lướt qua ứng dụng 15 giây, tháng này chưa làm gì
      streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: null, todaySecondsSpent: 15 },
      challenge: { year: 2026, isCompleted: false },
      monthly: { month: 6, hasReadBook: false, hasValidReview: false, isMonthPassed: false }
    }
  ];

  for (let i = 0; i < userEmails.length; i++) {
    const email = userEmails[i];
    const mock = gamificationDataMock[i];

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log(`⚠️ Không tìm thấy người dùng: ${email}, bỏ qua.`);
      continue;
    }

    console.log(`🔄 Đang cập nhật Gamification cho: ${email} (ID: ${user.id})`);

    // ───────────────────────────────────────────
    // 1. Đồng bộ bảng UserStreak (Quan hệ 1-1 qua userId)
    // ───────────────────────────────────────────
    await prisma.userStreak.upsert({
      where: { userId: user.id },
      update: {
        currentStreak: mock.streak.currentStreak,
        longestStreak: mock.streak.longestStreak,
        lastActiveDate: mock.streak.lastActiveDate,
        todaySecondsSpent: mock.streak.todaySecondsSpent,
      },
      create: {
        userId: user.id,
        currentStreak: mock.streak.currentStreak,
        longestStreak: mock.streak.longestStreak,
        lastActiveDate: mock.streak.lastActiveDate,
        todaySecondsSpent: mock.streak.todaySecondsSpent,
      },
    });

    // ───────────────────────────────────────────
    // 2. Đồng bộ bảng YearlyChallenge (Quan hệ 1-N, Unique kết hợp [userId, year])
    // ───────────────────────────────────────────
    const challenge = await prisma.yearlyChallenge.upsert({
      where: {
        userId_year: {
          userId: user.id,
          year: mock.challenge.year,
        },
      },
      update: {
        isCompleted: mock.challenge.isCompleted,
      },
      create: {
        userId: user.id,
        year: mock.challenge.year,
        isCompleted: mock.challenge.isCompleted,
      },
    });

    // ───────────────────────────────────────────
    // 3. Đồng bộ bảng MonthlyProgress (Liên kết với Challenge vừa tạo/cập nhật)
    // ───────────────────────────────────────────
    await prisma.monthlyProgress.upsert({
      where: {
        challengeId_month: {
          challengeId: challenge.id,
          month: mock.monthly.month,
        },
      },
      update: {
        hasReadBook: mock.monthly.hasReadBook,
        hasValidReview: mock.monthly.hasValidReview,
        isMonthPassed: mock.monthly.isMonthPassed,
      },
      create: {
        challengeId: challenge.id,
        month: mock.monthly.month,
        hasReadBook: mock.monthly.hasReadBook,
        hasValidReview: mock.monthly.hasValidReview,
        isMonthPassed: mock.monthly.isMonthPassed,
      },
    });
  }

  console.log("\n🎉 Đã nạp thành công dữ liệu Streak, YearlyChallenge và MonthlyProgress!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi hệ thống khi seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });