const db = require("../config/db");

// CREATE APPOINTMENT
const createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;

    // Check patient + doctor + double-booking in parallel to reduce round-trips
    const [
      [patient],
      [doctor],
      [existing]
    ] = await Promise.all([
      db.execute("SELECT patient_id FROM Patients WHERE patient_id = ?", [patient_id]),
      db.execute("SELECT doctor_id FROM Doctors WHERE doctor_id = ?", [doctor_id]),
      db.execute(
        `SELECT appointment_id FROM Appointments
         WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
         AND status != 'Cancelled'`,
        [doctor_id, appointment_date, appointment_time]
      ),
    ]);

    if (patient.length === 0)
      return res.status(400).json({ message: "Patient not found" });
    if (doctor.length === 0)
      return res.status(400).json({ message: "Doctor not found" });
    if (existing.length > 0)
      return res.status(400).json({ message: "Time slot already booked" });

    // Insert appointment
    const [result] = await db.execute(
      `INSERT INTO Appointments (patient_id, doctor_id, appointment_date, appointment_time)
       VALUES (?, ?, ?, ?)`,
      [patient_id, doctor_id, appointment_date, appointment_time]
    );

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment_id: result.insertId,
    });
  } catch (error) {
    console.error("Appointment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL APPOINTMENTS (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT a.appointment_id, a.patient_id, a.doctor_id,
             a.appointment_date, a.appointment_time, a.status,
             p.name AS patient_name,
             d.name AS doctor_name
      FROM Appointments a
      JOIN Patients p ON a.patient_id = p.patient_id
      JOIN Doctors  d ON a.doctor_id  = d.doctor_id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `);
    res.json({ message: "Appointments fetched successfully", data: rows });
  } catch (error) {
    console.error("Get Appointments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET MY APPOINTMENTS (Patient)
// Previously: 2 serial queries (lookup patient_id, then fetch appointments)
// Now: single JOIN — eliminates the extra round-trip
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id,
              a.appointment_date, a.appointment_time, a.status,
              d.name AS doctor_name, d.specialization
       FROM Appointments a
       JOIN Patients p ON a.patient_id = p.patient_id
       JOIN Doctors  d ON a.doctor_id  = d.doctor_id
       WHERE p.user_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [userId]
    );

    res.json({ message: "Your appointments fetched successfully", data: rows });
  } catch (error) {
    console.error("Get My Appointments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET DOCTOR APPOINTMENTS (Doctor)
// Previously: 2 serial queries (lookup doctor_id, then fetch appointments)
// Now: single JOIN — eliminates the extra round-trip
const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id,
              a.appointment_date, a.appointment_time, a.status,
              p.name AS patient_name, p.age, p.gender
       FROM Appointments a
       JOIN Doctors  d ON a.doctor_id  = d.doctor_id
       JOIN Patients p ON a.patient_id = p.patient_id
       WHERE d.user_id = ?
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [userId]
    );

    res.json({ message: "Doctor appointments fetched successfully", data: rows });
  } catch (error) {
    console.error("Get Doctor Appointments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE APPOINTMENT STATUS (Doctor confirms/cancels, Patient cancels)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["Pending", "Confirmed", "Cancelled", "Completed"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    await db.execute(
      "UPDATE Appointments SET status = ? WHERE appointment_id = ?",
      [status, id]
    );

    res.json({ message: "Appointment status updated successfully" });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};
