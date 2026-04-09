const db = require("../config/db");

// GET all patients
const getAllPatients = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM Patients");
        res.json({ message: "Patients fetched successfully", data: rows });
    } catch (error) {
        console.error("Get Patients Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET patient by ID
const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(
            "SELECT * FROM Patients WHERE patient_id = ?",
            [id]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: "Patient not found" });
        res.json({ message: "Patient fetched successfully", data: rows[0] });
    } catch (error) {
        console.error("Get Patient By ID Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// GET logged-in patient's own profile
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.execute(
            "SELECT * FROM Patients WHERE user_id = ?",
            [userId]
        );
        if (rows.length === 0)
            return res.status(404).json({ message: "Patient profile not found" });
        res.json({ message: "Profile fetched successfully", data: rows[0] });
    } catch (error) {
        console.error("Get My Profile Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// POST create patient
const createPatient = async (req, res) => {
    try {
        const { user_id, name, age, gender, contact, address, blood_group, secondary_contact, medical_history } = req.body;

        if (!user_id || !name) {
            return res.status(400).json({ message: "user_id and name are required" });
        }

        const [result] = await db.execute(
            `INSERT INTO Patients (user_id, name, age, gender, contact, address, blood_group, secondary_contact, medical_history)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, name, age || null, gender || null, contact || null, address || null, blood_group || null, secondary_contact || null, medical_history || null]
        );

        res.status(201).json({ message: "Patient created successfully", patient_id: result.insertId });
    } catch (error) {
        console.error("Create Patient Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// PUT update patient
const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, gender, contact, address, blood_group, secondary_contact, medical_history } = req.body;

        await db.execute(
            `UPDATE Patients
       SET name = ?, age = ?, gender = ?, contact = ?, address = ?, blood_group = ?, secondary_contact = ?, medical_history = ?
       WHERE patient_id = ?`,
            [name, age, gender, contact, address, blood_group, secondary_contact, medical_history, id]
        );

        res.json({ message: "Patient updated successfully" });
    } catch (error) {
        console.error("Update Patient Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE patient
const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM Patients WHERE patient_id = ?", [id]);
        res.json({ message: "Patient deleted successfully" });
    } catch (error) {
        console.error("Delete Patient Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllPatients,
    getPatientById,
    getMyProfile,
    createPatient,
    updatePatient,
    deletePatient,
};
