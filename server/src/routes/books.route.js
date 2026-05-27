const express = require("express");
const router = express.Router();
const { getRandomBooks, getBookByIsbn, getTopRated } = require("../controllers/books.controller");

router.get("/random", getRandomBooks);
router.get("/toprate", getTopRated);
router.get("/:bookIsbn", getBookByIsbn);

module.exports = router;