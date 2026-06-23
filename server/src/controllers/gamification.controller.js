const prisma = require("../prisma/client");

const getGamificationStatus = async (req, res) => {
  try {
    // 1. Lấy userId từ middleware xác thực (Auth Middleware)
    // Giả định bạn đã lưu thông tin sau khi verify JWT vào req.user hoặc req.userId
    const userId = Number(req.user.sub); 

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Người dùng chưa đăng nhập hoặc token không hợp lệ.",
      });
    }

    // 2. Lấy thời gian hiện tại ở phía Server để tính toán năm / tháng
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() trả về 0-11, cộng 1 để ra 1-12

    // 3. Truy vấn dữ liệu tổng hợp của User
    const userGamification = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        // Lấy thông tin Streak (Quan hệ 1-1)
        streak: {
          select: {
            currentStreak: true,
            longestStreak: true,
            lastActiveDate: true,
            todaySecondsSpent: true,
            updatedAt: true,
          }
        },
        // Lấy thông tin thử thách của NĂM HIỆN TẠI kèm TIẾN ĐỘ CÁC THÁNG (Quan hệ 1-N)
        yearlyChallenges: {
          where: { year: currentYear },
          select: {
            id: true,
            year: true,
            isCompleted: true,
            monthlyProgress: {
              orderBy: { month: "asc" },
              select: {
                month: true,
                hasReadBook: true,
                hasValidReview: true,
                isMonthPassed: true,
              }
            }
          }
        }
      }
    });

    if (!userGamification) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng.",
      });
    }

    // 4. Chuẩn hóa dữ liệu Streak (Trả về mặc định 0 nếu bản ghi chưa từng được tạo)
    const streakData = userGamification.streak || {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      todaySecondsSpent: 0,
    };

    // Logic kiểm tra xem hôm nay user ĐÃ hoàn thành mục tiêu (ví dụ lướt đủ 5 phút / 300 giây) chưa
    // Bạn có thể tùy biến điều kiện `isCompletedToday` này dựa trên logic dự án của bạn
    const isCompletedToday = streakData.todaySecondsSpent >= 300; 

    // 5. Chuẩn hóa dữ liệu Thử thách năm & tháng
    let challengeData = userGamification.yearlyChallenges[0] || null;
    let currentMonthProgress = null;

    if (challengeData) {
      // Tìm tiến độ của riêng tháng hiện tại trong mảng monthlyProgress
      currentMonthProgress = challengeData.monthlyProgress.find(
        (m) => m.month === currentMonth
      ) || null;
    }

    // Nếu trong DB chưa có bản ghi tiến độ tháng này, trả về object mặc định cho Frontend hiển thị
    if (!currentMonthProgress) {
      currentMonthProgress = {
        month: currentMonth,
        hasReadBook: false,
        hasValidReview: false,
        isMonthPassed: false,
      };
    }

    // 6. Trả kết quả về cho Frontend cấu trúc sạch đẹp
    return res.status(200).json({
      success: true,
      data: {
        userId: userGamification.id,
        email: userGamification.email,
        streak: {
          ...streakData,
          isCompletedToday, // Tiện ích bổ sung cho Frontend dễ ẩn/hiện icon/nút bấm
        },
        challenge: {
          year: currentYear,
          isChallengeCreated: !!challengeData, // Trả về true nếu user đã nhấn tham gia thử thách năm
          isCompleted: challengeData ? challengeData.isCompleted : false,
          currentMonthProgress, // Tiến độ chi tiết của riêng tháng này
          allMonthsProgress: challengeData ? challengeData.monthlyProgress : [], // Toàn bộ lịch sử các tháng để vẽ bản đồ/biểu đồ tiến độ
        }
      }
    });

  } catch (error) {
    console.error("❌ Lỗi tại getGamificationStatus Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Đã có lỗi xảy ra tại hệ thống. Vui lòng thử lại sau.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getGamificationStatus,
};