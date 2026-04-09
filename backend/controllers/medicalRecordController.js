const db = require("../config/db");

// GET MY MEDICAL RECORDS (Patient)
const getMyMedicalRecords = async (req, res) => {
    try {
        const userId = req.user.id;

        const [patientRows] = await db.execute(
            "SELECT patient_id FROM Patients WHERE user_id = ?",
            [userId]
        );
        if (patientRows.length === 0)
            return res.status(404).json({ message: "Patient profile not found" });

        const patientId = patientRows[0].patient_id;

        const [rows] = await db.execute(
            `SELECT mr.*, d.name AS doctor_name
       FROM Medical_Records mr
       LEFT JOIN Doctors d ON mr.doctor_id = d.doctor_id
       WHERE mr.patient_id = ?
       ORDER BY mr.created_at DESC`,
            [patientId]
        );

        res.json({ message: "Medical records fetched successfully", data: rows });
    } catch (error) {
        console.error("Get My Medical Records Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET MEDICAL RECORDS BY PATIENT ID (Doctor)
const getMedicalRecordsByPatient = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `SELECT mr.*, d.name AS doctor_name
       FROM Medical_Records mr
       LEFT JOIN Doctors d ON mr.doctor_id = d.doctor_id
       WHERE mr.patient_id = ?
       ORDER BY mr.created_at DESC`,
            [id]
        );

        res.json({ message: "Patient records fetched successfully", data: rows });
    } catch (error) {
        console.error("Get Patient Records Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// CREATE MEDICAL RECORD (Doctor)
const createMedicalRecord = async (req, res) => {
    try {
        const userId = req.user.id;
        const { patient_id, appointment_id, diagnosis, prescription, test_reports } = req.body;

        if (!patient_id || !diagnosis || !prescription)
            return res.status(400).json({ message: "patient_id, diagnosis and prescription are required" });

        // Get doctor_id from user_id
        const [doctorRows] = await db.execute(
            "SELECT doctor_id FROM Doctors WHERE user_id = ?",
            [userId]
        );
        if (doctorRows.length === 0)
            return res.status(404).json({ message: "Doctor profile not found" });

        const doctorId = doctorRows[0].doctor_id;

        const [result] = await db.execute(
            `INSERT INTO Medical_Records (patient_id, doctor_id, appointment_id, diagnosis, prescription, test_reports)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [patient_id, doctorId, appointment_id || null, diagnosis, prescription, test_reports || null]
        );

        res.status(201).json({
            message: "Medical record created successfully",
            record_id: result.insertId,
        });
    } catch (error) {
        console.error("Create Medical Record Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getMyMedicalRecords,
    getMedicalRecordsByPatient,
    createMedicalRecord,
};
