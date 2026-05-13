const express = require("express");
const router = express.Router();
const { getRandomBooks } = require("../controllers/books.controller");

router.get("/random", getRandomBooks);

module.exports = router;