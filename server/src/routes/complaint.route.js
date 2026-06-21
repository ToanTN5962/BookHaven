const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const complaintController = require("../controllers/complaint.controller");

router.post("/", verifyToken, complaintController.createComplaint);
router.get("/me", verifyToken, complaintController.getMyComplaints);

module.exports = router;