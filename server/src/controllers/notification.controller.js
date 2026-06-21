const prisma = require("../prisma/client");

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.sub;

        const [notifications, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 30,
            }),
            prisma.notification.count({
                where: { userId, isRead: false },
            }),
        ]);

        return res.status(200).json({ notifications, unreadCount });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user.sub;
        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({ message: "Notification id is invalid" });
        }

        const notification = await prisma.notification.findFirst({
            where: { id, userId },
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.sub;

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        return res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = {
    getMyNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
};
