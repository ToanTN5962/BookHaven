const express = require("express");
const router = express.Router();
const { getRandomBooks, getBookById, getTopRated } = require("../controllers/books.controller");

router.get("/random", getRandomBooks);
router.get("/:bookId", getBookById);
router.get("/toprate", getTopRated);

module.exports = router;