const db = require("../config/db");

// GET ALL BILLS (Admin)
const getAllBills = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT b.bill_id, b.patient_id, b.appointment_id,
             b.consultation_charges, b.lab_charges, b.medicine_charges,
             b.total_amount, b.payment_status, b.issued_date,
             p.name AS patient_name
      FROM Billing b
      JOIN Patients p ON b.patient_id = p.patient_id
    `);
    res.json({ message: "Bills fetched successfully", data: rows });
  } catch (error) {
    console.error("Get Bills Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE BILL
const createBill = async (req, res) => {
  try {
    const {
      patient_id,
      appointment_id,
      consultation_charges,
      lab_charges,
      medicine_charges
    } = req.body;

    // Check appointment exists & get status
    const [appointment] = await db.execute(
      `SELECT status, patient_id FROM Appointments WHERE appointment_id = ?`,
      [appointment_id]
    );

    if (appointment.length === 0)
      return res.status(400).json({ message: "Appointment not found" });

    if (appointment[0].status !== "Completed")
      return res.status(400).json({ message: "Bill can only be generated for completed appointments" });

    if (appointment[0].patient_id !== patient_id)
      return res.status(400).json({ message: "Patient does not match appointment" });

    // Prevent duplicate bill
    const [existing] = await db.execute(
      "SELECT bill_id FROM Billing WHERE appointment_id = ?",
      [appointment_id]
    );
    if (existing.length > 0)
      return res.status(400).json({ message: "Bill already exists for this appointment" });

    // Insert bill (total auto-calculated by DB)
    const [result] = await db.execute(
      `INSERT INTO Billing (patient_id, appointment_id, consultation_charges, lab_charges, medicine_charges)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, appointment_id, consultation_charges || 0, lab_charges || 0, medicine_charges || 0]
    );

    res.status(201).json({ message: "Bill created successfully", bill_id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res.status(400).json({ message: "Bill already exists for this appointment" });

    console.error("Create Bill Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PAYMENT STATUS
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    await db.execute(
      "UPDATE Billing SET payment_status = ? WHERE bill_id = ?",
      [payment_status, id]
    );

    res.json({ message: "Payment status updated successfully" });
  } catch (error) {
    console.error("Update Payment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET MY BILLS (Patient)
// Previously: 2 serial queries (lookup patient_id, then fetch bills)
// Now: single JOIN — eliminates the extra round-trip
const getMyBills = async (req, res) => {
  try {
    const userId = req.user.id;

    const [bills] = await db.execute(
      `SELECT b.bill_id, b.patient_id, b.appointment_id,
              b.consultation_charges, b.lab_charges, b.medicine_charges,
              b.total_amount, b.payment_status, b.issued_date,
              a.appointment_date, a.appointment_time
       FROM Billing b
       JOIN Patients p  ON b.patient_id    = p.patient_id
       LEFT JOIN Appointments a ON b.appointment_id = a.appointment_id
       WHERE p.user_id = ?
       ORDER BY b.issued_date DESC`,
      [userId]
    );

    res.json({ message: "Your bills fetched successfully", data: bills });
  } catch (error) {
    console.error("Get My Bills Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllBills,
  createBill,
  updatePaymentStatus,
  getMyBills
};
