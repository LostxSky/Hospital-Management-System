const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { normalizeRole } = require("../utils/roles");

const ALLOWED_GENDERS = new Set(["Male", "Female", "Other"]);

// ================= REGISTER =================
const registerUser = async (req, res) => {
  let connection;

  try {
    const {
      email,
      password,
      role,
      name,
      age,
      gender,
      contact,
      address,
      blood_group,
      specialization
    } = req.body;
    const normalizedRole = normalizeRole(role);
    const normalizedGender = gender ? String(gender).trim() : null;
    const parsedAge = age === undefined || age === null || age === ""
      ? null
      : Number(age);

    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!normalizedRole) {
      return res.status(400).json({
        message: "Invalid role. Allowed roles are Patient, Doctor, or Admin"
      });
    }

    if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 0)) {
      return res.status(400).json({ message: "Age must be a valid non-negative number" });
    }

    if (normalizedGender && !ALLOWED_GENDERS.has(normalizedGender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    // Check if user already exists
    const [existing] = await db.execute(
      "SELECT user_id FROM Users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Insert into Users table
    const [result] = await connection.execute(
      "INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)",
      [email, hashedPassword, normalizedRole]
    );

    if (normalizedRole === "Patient") {
      await connection.execute(
        `INSERT INTO Patients (user_id, name, age, gender, contact, address, blood_group)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          result.insertId,
          name,
          parsedAge,
          normalizedGender,
          contact || null,
          address || null,
          blood_group || null
        ]
      );
    }

    if (normalizedRole === "Doctor") {
      await connection.execute(
        `INSERT INTO Doctors (user_id, name, specialization, contact_details)
         VALUES (?, ?, ?, ?)`,
        [
          result.insertId,
          name,
          specialization || "General",
          contact || null
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "User registered successfully",
      user_id: result.insertId
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedRole = role ? normalizeRole(role) : null;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (role && !normalizedRole) {
      return res.status(400).json({
        message: "Invalid role. Allowed roles are Patient, Doctor, or Admin"
      });
    }

    const [rows] = await db.execute(
      "SELECT * FROM Users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    if (normalizedRole && user.role !== normalizedRole) {
      return res.status(400).json({ message: "Invalid credentials for selected role" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = {
  registerUser,
  loginUser
};
