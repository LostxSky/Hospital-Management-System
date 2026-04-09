const db = require("../config/db");

// GET ALL DOCTORS
const getAllDoctors = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.*, dep.department_name 
      FROM Doctors d
      LEFT JOIN Departments dep 
      ON d.department_id = dep.department_id
    `);

    res.json({
      message: "Doctors fetched successfully",
      data: rows
    });

  } catch (error) {
    console.error("Get Doctors Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE DOCTOR
const createDoctor = async (req, res) => {
  try {
    const { user_id, department_id, name, specialization, contact_details } = req.body;

    // Check if user exists and role = Doctor
    const [users] = await db.execute(
      "SELECT role FROM Users WHERE user_id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    if (users[0].role !== "Doctor") {
      return res.status(400).json({ message: "User is not a Doctor" });
    }


    // Insert doctor
    const [result] = await db.execute(
      `INSERT INTO Doctors 
       (user_id, department_id, name, specialization, contact_details)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, department_id, name, specialization, contact_details]
    );

    res.status(201).json({
      message: "Doctor created successfully",
      doctor_id: result.insertId
    });

} catch (error) {

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(400).json({
      message: "Doctor already exists for this user"
    });
  }

  console.error("Create Doctor Error:", error);
  res.status(500).json({ message: "Server error" });
}
};

// UPDATE DOCTOR
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, name, specialization, contact_details } = req.body;

    await db.execute(
      `UPDATE Doctors 
       SET department_id = ?, name = ?, specialization = ?, contact_details = ?
       WHERE doctor_id = ?`,
      [department_id, name, specialization, contact_details, id]
    );

    res.json({ message: "Doctor updated successfully" });

  } catch (error) {
    console.error("Update Doctor Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE DOCTOR
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(
      "DELETE FROM Doctors WHERE doctor_id = ?",
      [id]
    );

    res.json({ message: "Doctor deleted successfully" });

  } catch (error) {
    console.error("Delete Doctor Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor
};