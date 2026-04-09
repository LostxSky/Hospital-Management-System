const express = require("express");
const router = express.Router();

const {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require("../controllers/doctorController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// View doctors (any logged-in user)
router.get("/", protect, getAllDoctors);

// Only Admin can create doctor
router.post("/", protect, authorizeRoles("Admin"), createDoctor);

// Only Admin can update
router.put("/:id", protect, authorizeRoles("Admin"), updateDoctor);

// Only Admin can delete
router.delete("/:id", protect, authorizeRoles("Admin"), deleteDoctor);

module.exports = router;