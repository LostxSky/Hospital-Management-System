const express = require("express");
const router = express.Router();

const {
  getAllPatients,
  getPatientById,
  getMyProfile,
  createPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Patient: get own profile
router.get("/me", protect, authorizeRoles("Patient"), getMyProfile);

// Any logged-in user can view all patients
router.get("/", protect, getAllPatients);

// Get patient by ID
router.get("/:id", protect, getPatientById);

// Only Admin can create patient
router.post("/", protect, authorizeRoles("Admin"), createPatient);

// Only Admin can update
router.put("/:id", protect, authorizeRoles("Admin"), updatePatient);

// Only Admin can delete
router.delete("/:id", protect, authorizeRoles("Admin"), deletePatient);

module.exports = router;
