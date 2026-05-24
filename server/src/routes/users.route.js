const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const userController = require("../controllers/users.controller");

router.get("/me", verifyToken, userController.getInfo);
router.get("/getbookshelfinfo/:userId", userController.getBookshelfInfo);

module.exports = router;