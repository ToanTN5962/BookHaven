const express = require("express");
const router = express.Router();
const { getRandomBooks, getBookById, getTopRated } = require("../controllers/books.controller");

router.get("/random", getRandomBooks);
router.get("/toprate", getTopRated);
router.get("/:bookId", getBookById);

module.exports = router;