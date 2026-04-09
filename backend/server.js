require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

const app = express();

// ─── Security & Compression Middleware ────────────────────────────────────────
// helmet sets secure HTTP headers (X-Frame-Options, X-XSS-Protection, etc.)
app.use(helmet());
// compression gzips all responses, reducing payload size significantly
app.use(compression());

app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
const patientRoutes = require("./routes/patientRoutes");
app.use("/api/patients", patientRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const doctorRoutes = require("./routes/doctorRoutes");
app.use("/api/doctors", doctorRoutes);

const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);

const billingRoutes = require("./routes/billingRoutes");
app.use("/api/billing", billingRoutes);

const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
app.use("/api/medical-records", medicalRecordRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("Backend is running ✅");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
