const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const notificationController = require("../controllers/notification.controller");

router.get("/", verifyToken, notificationController.getMyNotifications);
router.patch("/read-all", verifyToken, notificationController.markAllNotificationsAsRead);
router.patch("/:id/read", verifyToken, notificationController.markNotificationAsRead);

module.exports = router;
