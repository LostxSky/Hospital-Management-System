const express = require("express");
const router = express.Router();

const {
    getMyMedicalRecords,
    getMedicalRecordsByPatient,
    createMedicalRecord,
} = require("../controllers/medicalRecordController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Patient: get own records
router.get("/my", protect, authorizeRoles("Patient"), getMyMedicalRecords);

// Doctor: get records for a specific patient
router.get("/patient/:id", protect, authorizeRoles("Doctor"), getMedicalRecordsByPatient);

// Doctor: create a medical record
router.post("/", protect, authorizeRoles("Doctor"), createMedicalRecord);

module.exports = router;
