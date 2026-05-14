const express = require("express");
const router = express.Router();
const { getRandomBooks, getBookById } = require("../controllers/books.controller");

router.get("/random", getRandomBooks);
router.get("/:bookId", getBookById);

module.exports = router;