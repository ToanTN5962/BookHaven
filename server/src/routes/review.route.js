const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const reviewController = require("../controllers/review.controller");

// Require authentication to create reviews so backend can use token user
router.post("/", verifyToken, reviewController.createReview);
router.get("/", reviewController.getReviewsForBook);
router.get("/me", verifyToken, reviewController.getMyReviews);

module.exports = router;