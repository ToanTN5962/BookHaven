const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const verifyToken = require("../middleware/auth");

router.get("/statinfo", adminController.getStatInfo);
router.patch("/complaints/:id/status", verifyToken, adminController.updateComplaintStatus);

module.exports = router;
