const express = require("express");
const router = express.Router();

const {
  getAllBills,
  createBill,
  updatePaymentStatus,
  getMyBills
} = require("../controllers/billingController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Admin routes
router.get("/", protect, authorizeRoles("Admin"), getAllBills);
router.post("/", protect, authorizeRoles("Admin"), createBill);
router.put("/:id/status", protect, authorizeRoles("Admin"), updatePaymentStatus);

// Patient route
router.get("/my", protect, authorizeRoles("Patient"), getMyBills);

module.exports = router;