const express = require("express");
const router = express.Router();

const {
    createAppointment,
    getAllAppointments,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
} = require("../controllers/appointmentController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Patient: get own appointments
router.get("/my", protect, authorizeRoles("Patient"), getMyAppointments);

// Doctor: get own appointments
router.get("/doctor", protect, authorizeRoles("Doctor"), getDoctorAppointments);

// Admin: view all appointments
router.get("/", protect, authorizeRoles("Admin", "Doctor"), getAllAppointments);

// Any logged-in user can book
router.post("/", protect, createAppointment);

// Update appointment status (Doctor confirms/cancels, Patient cancels)
router.put("/:id/status", protect, updateAppointmentStatus);

module.exports = router;
