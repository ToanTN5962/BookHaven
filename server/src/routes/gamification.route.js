const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const gamificationController = require("../controllers/gamification.controller");

router.get("/status/:userId", verifyToken, gamificationController.getGamificationStatus);
router.post("/track-time", verifyToken, gamificationController.trackUserActiveTime);

module.exports = router;