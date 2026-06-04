const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

router.get("/statinfo", adminController.getStatInfo);

module.exports = router;