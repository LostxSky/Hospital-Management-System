/**
 * seed.js — Drop + recreate all tables, then insert 20+ Indianized demo rows
 *
 * Usage:  node seed.js          (or: npm run seed)
 *
 * Demo credentials printed at the end.
 */

require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// ─── Config ───────────────────────────────────────────────────────────────────
const DB_CONFIG = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
};

const DEMO_PASSWORD = "Demo@123";

// ─── Table DDL ────────────────────────────────────────────────────────────────
const DROP_TABLES = `
  SET FOREIGN_KEY_CHECKS = 0;
  DROP TABLE IF EXISTS Medical_Records;
  DROP TABLE IF EXISTS Billing;
  DROP TABLE IF EXISTS Appointments;
  DROP TABLE IF EXISTS Doctors;
  DROP TABLE IF EXISTS Patients;
  DROP TABLE IF EXISTS Departments;
  DROP TABLE IF EXISTS Users;
  SET FOREIGN_KEY_CHECKS = 1;
`;

const CREATE_USERS = `
  CREATE TABLE Users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('Patient','Doctor','Admin') NOT NULL DEFAULT 'Patient',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const CREATE_DEPARTMENTS = `
  CREATE TABLE Departments (
    department_id   INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
  );
`;

const CREATE_PATIENTS = `
  CREATE TABLE Patients (
    patient_id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL UNIQUE,
    name              VARCHAR(255) NOT NULL,
    age               INT,
    gender            ENUM('Male','Female','Other'),
    contact           VARCHAR(20),
    address           TEXT,
    blood_group       VARCHAR(5),
    secondary_contact VARCHAR(20),
    medical_history   TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
  );
`;

const CREATE_DOCTORS = `
  CREATE TABLE Doctors (
    doctor_id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL UNIQUE,
    department_id    INT,
    name             VARCHAR(255) NOT NULL,
    specialization   VARCHAR(255),
    contact_details  VARCHAR(255),
    FOREIGN KEY (user_id)       REFERENCES Users(user_id)       ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES Departments(department_id) ON DELETE SET NULL
  );
`;

const CREATE_APPOINTMENTS = `
  CREATE TABLE Appointments (
    appointment_id   INT AUTO_INCREMENT PRIMARY KEY,
    patient_id       INT NOT NULL,
    doctor_id        INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status           ENUM('Pending','Confirmed','Cancelled','Completed') DEFAULT 'Pending',
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)  REFERENCES Doctors(doctor_id)   ON DELETE CASCADE
  );
`;

const CREATE_BILLING = `
  CREATE TABLE Billing (
    bill_id               INT AUTO_INCREMENT PRIMARY KEY,
    patient_id            INT NOT NULL,
    appointment_id        INT UNIQUE,
    consultation_charges  DECIMAL(10,2) DEFAULT 0,
    lab_charges           DECIMAL(10,2) DEFAULT 0,
    medicine_charges      DECIMAL(10,2) DEFAULT 0,
    total_amount          DECIMAL(10,2) GENERATED ALWAYS AS (consultation_charges + lab_charges + medicine_charges) STORED,
    payment_status        ENUM('Pending','Paid','Partially Paid') DEFAULT 'Pending',
    issued_date           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id)    REFERENCES Patients(patient_id)       ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id) ON DELETE SET NULL
  );
`;

const CREATE_MEDICAL_RECORDS = `
  CREATE TABLE Medical_Records (
    record_id      INT AUTO_INCREMENT PRIMARY KEY,
    patient_id     INT NOT NULL,
    doctor_id      INT NOT NULL,
    appointment_id INT,
    diagnosis      TEXT NOT NULL,
    prescription   TEXT NOT NULL,
    test_reports   TEXT,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id)    REFERENCES Patients(patient_id)       ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)     REFERENCES Doctors(doctor_id)         ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id) ON DELETE SET NULL
  );
`;

// ─── Demo Data ────────────────────────────────────────────────────────────────
const departments = [
    "Cardiology",
    "Orthopaedics",
    "Dermatology",
    "Neurology",
    "Paediatrics",
    "Gynaecology",
    "General Medicine",
    "ENT",
    "Ophthalmology",
    "Ayurveda & Wellness",
];

// 20 patients + 20 doctors + 2 demo accounts = 42 users
// Indices 1-20 → patients, 21-40 → doctors, 41 → demo patient, 42 → demo doctor
const patientUsers = [
    { email: "aarav.mehta@email.com", role: "Patient" },
    { email: "priya.sharma@email.com", role: "Patient" },
    { email: "rohit.verma@email.com", role: "Patient" },
    { email: "ananya.nair@email.com", role: "Patient" },
    { email: "vikram.singh@email.com", role: "Patient" },
    { email: "sneha.reddy@email.com", role: "Patient" },
    { email: "arjun.patel@email.com", role: "Patient" },
    { email: "kavya.iyer@email.com", role: "Patient" },
    { email: "manish.gupta@email.com", role: "Patient" },
    { email: "neha.joshi@email.com", role: "Patient" },
    { email: "suresh.yadav@email.com", role: "Patient" },
    { email: "divya.menon@email.com", role: "Patient" },
    { email: "rajesh.kumar@email.com", role: "Patient" },
    { email: "pooja.mishra@email.com", role: "Patient" },
    { email: "amit.choudhary@email.com", role: "Patient" },
    { email: "swati.deshmukh@email.com", role: "Patient" },
    { email: "harsh.agarwal@email.com", role: "Patient" },
    { email: "meera.rajan@email.com", role: "Patient" },
    { email: "nikhil.tiwari@email.com", role: "Patient" },
    { email: "rashmi.chauhan@email.com", role: "Patient" },
];

const doctorUsers = [
    { email: "dr.anil.kapoor@email.com", role: "Doctor" },
    { email: "dr.sunita.rao@email.com", role: "Doctor" },
    { email: "dr.ravi.shankar@email.com", role: "Doctor" },
    { email: "dr.meenakshi.pillai@email.com", role: "Doctor" },
    { email: "dr.sanjay.gupta@email.com", role: "Doctor" },
    { email: "dr.lakshmi.narayan@email.com", role: "Doctor" },
    { email: "dr.prakash.jha@email.com", role: "Doctor" },
    { email: "dr.anjali.desai@email.com", role: "Doctor" },
    { email: "dr.vivek.murthy@email.com", role: "Doctor" },
    { email: "dr.deepa.krishnan@email.com", role: "Doctor" },
    { email: "dr.manoj.tiwari@email.com", role: "Doctor" },
    { email: "dr.nandini.bose@email.com", role: "Doctor" },
    { email: "dr.ashok.rajput@email.com", role: "Doctor" },
    { email: "dr.kavitha.suresh@email.com", role: "Doctor" },
    { email: "dr.ramesh.iyer@email.com", role: "Doctor" },
    { email: "dr.priyanka.saxena@email.com", role: "Doctor" },
    { email: "dr.sunil.patil@email.com", role: "Doctor" },
    { email: "dr.bhavana.reddy@email.com", role: "Doctor" },
    { email: "dr.gaurav.malhotra@email.com", role: "Doctor" },
    { email: "dr.rekha.menon@email.com", role: "Doctor" },
];

const demoUsers = [
    { email: "patient@demo.com", role: "Patient" },
    { email: "doctor@demo.com", role: "Doctor" },
];

const patients = [
    { name: "Aarav Mehta", age: 28, gender: "Male", contact: "9876543210", address: "12, MG Road, Pune, Maharashtra", blood_group: "B+", secondary_contact: "9876543211", medical_history: "Seasonal allergies" },
    { name: "Priya Sharma", age: 34, gender: "Female", contact: "9123456780", address: "45, Lajpat Nagar, New Delhi", blood_group: "A+", secondary_contact: "9123456781", medical_history: "Hypothyroidism — on Eltroxin 50 mcg" },
    { name: "Rohit Verma", age: 45, gender: "Male", contact: "9988776655", address: "78, Civil Lines, Jaipur, Rajasthan", blood_group: "O+", secondary_contact: "9988776656", medical_history: "Type 2 Diabetes — Metformin 500 mg BD" },
    { name: "Ananya Nair", age: 22, gender: "Female", contact: "8899001122", address: "23, MG Road, Kochi, Kerala", blood_group: "AB+", secondary_contact: "8899001123", medical_history: "No significant history" },
    { name: "Vikram Singh", age: 55, gender: "Male", contact: "7766554433", address: "9, Sector 15, Chandigarh", blood_group: "A-", secondary_contact: "7766554434", medical_history: "Hypertension — Amlodipine 5 mg OD, past CABG (2022)" },
    { name: "Sneha Reddy", age: 30, gender: "Female", contact: "9654321876", address: "56, Jubilee Hills, Hyderabad, Telangana", blood_group: "B+", secondary_contact: "9654321877", medical_history: "PCOD, Iron deficiency anaemia" },
    { name: "Arjun Patel", age: 38, gender: "Male", contact: "8765432109", address: "101, SG Highway, Ahmedabad, Gujarat", blood_group: "O-", secondary_contact: "8765432110", medical_history: "Asthma — Deriphyllin PRN" },
    { name: "Kavya Iyer", age: 26, gender: "Female", contact: "9012345678", address: "34, Anna Nagar, Chennai, Tamil Nadu", blood_group: "A+", secondary_contact: "9012345679", medical_history: "Migraine" },
    { name: "Manish Gupta", age: 50, gender: "Male", contact: "9345678901", address: "67, Gomti Nagar, Lucknow, Uttar Pradesh", blood_group: "B-", secondary_contact: "9345678902", medical_history: "Chronic lower back pain, Vitamin D deficiency" },
    { name: "Neha Joshi", age: 29, gender: "Female", contact: "8456789012", address: "12, FC Road, Pune, Maharashtra", blood_group: "AB-", secondary_contact: "8456789013", medical_history: "No significant history" },
    { name: "Suresh Yadav", age: 62, gender: "Male", contact: "9567890123", address: "88, Vaishali Nagar, Jaipur, Rajasthan", blood_group: "O+", secondary_contact: "9567890124", medical_history: "Ischaemic heart disease, on Ecosprin & Atorvastatin" },
    { name: "Divya Menon", age: 33, gender: "Female", contact: "8678901234", address: "5, Indiranagar, Bengaluru, Karnataka", blood_group: "A+", secondary_contact: "8678901235", medical_history: "Gestational diabetes (resolved)" },
    { name: "Rajesh Kumar", age: 47, gender: "Male", contact: "9789012345", address: "19, Salt Lake, Kolkata, West Bengal", blood_group: "B+", secondary_contact: "9789012346", medical_history: "Fatty liver, elevated triglycerides" },
    { name: "Pooja Mishra", age: 24, gender: "Female", contact: "8890123456", address: "36, Arera Colony, Bhopal, Madhya Pradesh", blood_group: "O+", secondary_contact: "8890123457", medical_history: "Thalassemia minor" },
    { name: "Amit Choudhary", age: 40, gender: "Male", contact: "9901234567", address: "72, Ashram Road, Ahmedabad, Gujarat", blood_group: "A-", secondary_contact: "9901234568", medical_history: "Kidney stones (left, 2024)" },
    { name: "Swati Deshmukh", age: 37, gender: "Female", contact: "8012345678", address: "14, Kothrud, Pune, Maharashtra", blood_group: "AB+", secondary_contact: "8012345679", medical_history: "Cervical spondylosis" },
    { name: "Harsh Agarwal", age: 31, gender: "Male", contact: "9112233445", address: "41, Hazratganj, Lucknow, Uttar Pradesh", blood_group: "B-", secondary_contact: "9112233446", medical_history: "No significant history" },
    { name: "Meera Rajan", age: 58, gender: "Female", contact: "8223344556", address: "7, Panampilly Nagar, Kochi, Kerala", blood_group: "O-", secondary_contact: "8223344557", medical_history: "Osteoarthritis both knees, Rheumatoid factor +" },
    { name: "Nikhil Tiwari", age: 35, gender: "Male", contact: "9334455667", address: "53, Boring Road, Patna, Bihar", blood_group: "A+", secondary_contact: "9334455668", medical_history: "Peptic ulcer disease" },
    { name: "Rashmi Chauhan", age: 42, gender: "Female", contact: "8445566778", address: "28, Malviya Nagar, Jaipur, Rajasthan", blood_group: "B+", secondary_contact: "8445566779", medical_history: "Bronchial asthma, allergic rhinitis" },
    // Demo patient (user_id = 41, patient index 20)
    { name: "Demo Patient", age: 30, gender: "Male", contact: "9000000001", address: "1, Connaught Place, New Delhi", blood_group: "O+", secondary_contact: "9000000002", medical_history: "No significant history" },
];

const doctors = [
    { name: "Dr. Anil Kapoor", dept: 1, specialization: "Interventional Cardiology", contact: "+91-9800010001" },
    { name: "Dr. Sunita Rao", dept: 1, specialization: "Clinical Cardiology", contact: "+91-9800010002" },
    { name: "Dr. Ravi Shankar", dept: 2, specialization: "Joint Replacement Surgery", contact: "+91-9800010003" },
    { name: "Dr. Meenakshi Pillai", dept: 2, specialization: "Spine Surgery", contact: "+91-9800010004" },
    { name: "Dr. Sanjay Gupta", dept: 3, specialization: "Cosmetic Dermatology", contact: "+91-9800010005" },
    { name: "Dr. Lakshmi Narayan", dept: 4, specialization: "Neurosurgery", contact: "+91-9800010006" },
    { name: "Dr. Prakash Jha", dept: 4, specialization: "Clinical Neurology", contact: "+91-9800010007" },
    { name: "Dr. Anjali Desai", dept: 5, specialization: "Neonatology", contact: "+91-9800010008" },
    { name: "Dr. Vivek Murthy", dept: 5, specialization: "Paediatric Surgery", contact: "+91-9800010009" },
    { name: "Dr. Deepa Krishnan", dept: 6, specialization: "Obstetrics & Gynaecology", contact: "+91-9800010010" },
    { name: "Dr. Manoj Tiwari", dept: 7, specialization: "Internal Medicine", contact: "+91-9800010011" },
    { name: "Dr. Nandini Bose", dept: 7, specialization: "Diabetology", contact: "+91-9800010012" },
    { name: "Dr. Ashok Rajput", dept: 8, specialization: "ENT Surgery", contact: "+91-9800010013" },
    { name: "Dr. Kavitha Suresh", dept: 8, specialization: "Audiology", contact: "+91-9800010014" },
    { name: "Dr. Ramesh Iyer", dept: 9, specialization: "Cataract & Refractive", contact: "+91-9800010015" },
    { name: "Dr. Priyanka Saxena", dept: 9, specialization: "Retina Specialist", contact: "+91-9800010016" },
    { name: "Dr. Sunil Patil", dept: 10, specialization: "Panchakarma Therapy", contact: "+91-9800010017" },
    { name: "Dr. Bhavana Reddy", dept: 10, specialization: "Ayurvedic Medicine", contact: "+91-9800010018" },
    { name: "Dr. Gaurav Malhotra", dept: 3, specialization: "Hair Transplant", contact: "+91-9800010019" },
    { name: "Dr. Rekha Menon", dept: 6, specialization: "Reproductive Medicine", contact: "+91-9800010020" },
    // Demo doctor (user_id = 42, doctor index 20)
    { name: "Dr. Demo Physician", dept: 7, specialization: "General Medicine", contact: "+91-9000000003" },
];

// Appointments: mix of statuses — some Completed (so we can bill them)
const appointments = [
    { patient: 1, doctor: 1, date: "2026-02-01", time: "09:00:00", status: "Completed" },
    { patient: 2, doctor: 2, date: "2026-02-02", time: "10:00:00", status: "Completed" },
    { patient: 3, doctor: 11, date: "2026-02-03", time: "11:00:00", status: "Completed" },
    { patient: 4, doctor: 5, date: "2026-02-04", time: "09:30:00", status: "Completed" },
    { patient: 5, doctor: 1, date: "2026-02-05", time: "14:00:00", status: "Completed" },
    { patient: 6, doctor: 10, date: "2026-02-06", time: "10:30:00", status: "Completed" },
    { patient: 7, doctor: 3, date: "2026-02-07", time: "11:30:00", status: "Completed" },
    { patient: 8, doctor: 4, date: "2026-02-08", time: "15:00:00", status: "Completed" },
    { patient: 9, doctor: 6, date: "2026-02-10", time: "09:00:00", status: "Completed" },
    { patient: 10, doctor: 7, date: "2026-02-11", time: "10:00:00", status: "Completed" },
    { patient: 11, doctor: 1, date: "2026-02-12", time: "11:00:00", status: "Completed" },
    { patient: 12, doctor: 12, date: "2026-02-13", time: "14:00:00", status: "Completed" },
    { patient: 13, doctor: 11, date: "2026-02-14", time: "09:30:00", status: "Completed" },
    { patient: 14, doctor: 8, date: "2026-02-15", time: "10:30:00", status: "Completed" },
    { patient: 15, doctor: 15, date: "2026-02-16", time: "11:30:00", status: "Completed" },
    { patient: 16, doctor: 4, date: "2026-02-17", time: "15:00:00", status: "Completed" },
    { patient: 17, doctor: 13, date: "2026-02-18", time: "09:00:00", status: "Completed" },
    { patient: 18, doctor: 3, date: "2026-02-19", time: "10:00:00", status: "Completed" },
    { patient: 19, doctor: 11, date: "2026-02-20", time: "11:00:00", status: "Completed" },
    { patient: 20, doctor: 14, date: "2026-02-21", time: "14:00:00", status: "Completed" },
    // Upcoming / mixed statuses
    { patient: 21, doctor: 21, date: "2026-03-10", time: "09:00:00", status: "Confirmed" },
    { patient: 1, doctor: 11, date: "2026-03-12", time: "10:00:00", status: "Pending" },
    { patient: 3, doctor: 6, date: "2026-03-14", time: "14:30:00", status: "Pending" },
    { patient: 21, doctor: 11, date: "2026-03-15", time: "11:00:00", status: "Pending" },
    { patient: 5, doctor: 1, date: "2026-03-16", time: "09:30:00", status: "Cancelled" },
];

const billingRecords = [
    { patient: 1, appointment: 1, consultation: 800, lab: 1500, medicine: 450, payment: "Paid" },
    { patient: 2, appointment: 2, consultation: 700, lab: 0, medicine: 320, payment: "Paid" },
    { patient: 3, appointment: 3, consultation: 500, lab: 2200, medicine: 680, payment: "Pending" },
    { patient: 4, appointment: 4, consultation: 600, lab: 800, medicine: 250, payment: "Paid" },
    { patient: 5, appointment: 5, consultation: 1000, lab: 3500, medicine: 900, payment: "Partially Paid" },
    { patient: 6, appointment: 6, consultation: 900, lab: 1200, medicine: 500, payment: "Paid" },
    { patient: 7, appointment: 7, consultation: 1200, lab: 0, medicine: 350, payment: "Paid" },
    { patient: 8, appointment: 8, consultation: 1500, lab: 2000, medicine: 750, payment: "Pending" },
    { patient: 9, appointment: 9, consultation: 1800, lab: 4000, medicine: 1200, payment: "Partially Paid" },
    { patient: 10, appointment: 10, consultation: 600, lab: 500, medicine: 280, payment: "Paid" },
    { patient: 11, appointment: 11, consultation: 1000, lab: 3000, medicine: 850, payment: "Paid" },
    { patient: 12, appointment: 12, consultation: 500, lab: 1800, medicine: 420, payment: "Pending" },
    { patient: 13, appointment: 13, consultation: 500, lab: 600, medicine: 200, payment: "Paid" },
    { patient: 14, appointment: 14, consultation: 700, lab: 0, medicine: 150, payment: "Paid" },
    { patient: 15, appointment: 15, consultation: 800, lab: 1000, medicine: 300, payment: "Pending" },
    { patient: 16, appointment: 16, consultation: 1500, lab: 2500, medicine: 600, payment: "Paid" },
    { patient: 17, appointment: 17, consultation: 600, lab: 0, medicine: 180, payment: "Paid" },
    { patient: 18, appointment: 18, consultation: 1200, lab: 0, medicine: 400, payment: "Pending" },
    { patient: 19, appointment: 19, consultation: 500, lab: 900, medicine: 350, payment: "Paid" },
    { patient: 20, appointment: 20, consultation: 700, lab: 500, medicine: 220, payment: "Paid" },
];

const medicalRecords = [
    { patient: 1, doctor: 1, appt: 1, diagnosis: "Mild mitral valve prolapse", prescription: "Tab Metoprolol 25 mg OD, Echocardiogram follow-up in 6 months", tests: "2D Echo, ECG, Lipid profile" },
    { patient: 2, doctor: 2, appt: 2, diagnosis: "Hypertensive urgency, BP 180/110 mmHg", prescription: "Tab Amlodipine 5 mg OD, Tab Telmisartan 40 mg OD, low-salt diet", tests: "ECG, Serum creatinine, Urine ACR" },
    { patient: 3, doctor: 11, appt: 3, diagnosis: "Uncontrolled Type 2 DM, HbA1c 9.2%", prescription: "Tab Metformin 1 g BD, Tab Glimepiride 2 mg OD, Insulin Glargine 10 U HS", tests: "HbA1c, FBS, PPBS, KFT, Lipid profile" },
    { patient: 4, doctor: 5, appt: 4, diagnosis: "Acne vulgaris — Grade II", prescription: "Cap Doxycycline 100 mg OD x 6 wks, Adapalene gel 0.1% HS, Cetaphil cleanser", tests: null },
    { patient: 5, doctor: 1, appt: 5, diagnosis: "Stable angina, post-CABG follow-up", prescription: "Tab Ecosprin 75 mg OD, Tab Atorvastatin 40 mg HS, Tab Clopidogrel 75 mg OD", tests: "TMT, Coronary CT angiography, Lipid profile" },
    { patient: 6, doctor: 10, appt: 6, diagnosis: "PCOD with oligomenorrhoea", prescription: "Tab OC Pills (Femilon) x 3 months, Tab Metformin 500 mg OD, weight management", tests: "USG pelvis, LH/FSH ratio, Free testosterone, Thyroid profile" },
    { patient: 7, doctor: 3, appt: 7, diagnosis: "ACL tear — right knee", prescription: "Knee immobiliser, physiotherapy, plan for arthroscopic ACL reconstruction", tests: "MRI right knee, X-ray AP/Lateral" },
    { patient: 8, doctor: 4, appt: 8, diagnosis: "L4-L5 disc prolapse with radiculopathy", prescription: "Tab Pregabalin 75 mg BD, Tab Etoricoxib 90 mg OD, physiotherapy, strict bed rest", tests: "MRI lumbosacral spine, NCV bilateral lower limbs" },
    { patient: 9, doctor: 6, appt: 9, diagnosis: "Trigeminal neuralgia — right V2 distribution", prescription: "Tab Carbamazepine 200 mg BD, Tab Gabapentin 300 mg TDS", tests: "MRI brain with contrast, NCV facial nerve" },
    { patient: 10, doctor: 7, appt: 10, diagnosis: "Migraine without aura", prescription: "Tab Sumatriptan 50 mg SOS, Tab Flunarizine 10 mg HS x 3 months", tests: null },
    { patient: 11, doctor: 1, appt: 11, diagnosis: "Atrial fibrillation, rate-controlled", prescription: "Tab Warfarin 5 mg OD, Tab Digoxin 0.25 mg OD, weekly INR monitoring", tests: "ECG, 2D Echo, INR, TSH" },
    { patient: 12, doctor: 12, appt: 12, diagnosis: "Type 2 DM — well controlled", prescription: "Tab Metformin 500 mg BD, annual eye & foot check", tests: "HbA1c 6.8%, FBS, KFT" },
    { patient: 13, doctor: 11, appt: 13, diagnosis: "Acute viral gastroenteritis", prescription: "ORS sachets TDS, Tab Ondansetron 4 mg SOS, bland diet x 3 days", tests: "Stool routine, CBC" },
    { patient: 14, doctor: 8, appt: 14, diagnosis: "Febrile seizures — 3 yr old", prescription: "Syr Paracetamol 5 mL SOS, tepid sponging, fever precautions counselling", tests: "CBC, CRP, Blood culture" },
    { patient: 15, doctor: 15, appt: 15, diagnosis: "Immature cataract — bilateral", prescription: "Plan for phacoemulsification right eye first, protective sunglasses", tests: "Slit lamp exam, IOL biometry, B-scan USG" },
    { patient: 16, doctor: 4, appt: 16, diagnosis: "Cervical spondylotic myelopathy", prescription: "Cervical collar, Tab Pregabalin 75 mg BD, plan for anterior cervical discectomy", tests: "MRI cervical spine, X-ray cervical spine dynamic views" },
    { patient: 17, doctor: 13, appt: 17, diagnosis: "Chronic suppurative otitis media — right ear", prescription: "Ear drops Ciprofloxacin + Dexamethasone, dry ear precautions", tests: "PTA, Tympanometry" },
    { patient: 18, doctor: 3, appt: 18, diagnosis: "Osteoarthritis — bilateral knees, KL Grade III", prescription: "Tab Diacerein 50 mg BD, physiotherapy, intra-articular Hyaluronic acid injection", tests: "X-ray both knees standing AP, ESR, CRP" },
    { patient: 19, doctor: 11, appt: 19, diagnosis: "Peptic ulcer disease with H. pylori +", prescription: "Tab Pantoprazole 40 mg BD, Tab Amoxicillin 1 g BD, Tab Clarithromycin 500 mg BD x 14 days", tests: "UGI endoscopy, CLO test, H. pylori serology" },
    { patient: 20, doctor: 14, appt: 20, diagnosis: "Bilateral sensorineural hearing loss — moderate", prescription: "Digital hearing aid fitting, audiological rehabilitation", tests: "PTA, BERA, Impedance audiometry" },
];


// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
    let conn;
    try {
        conn = await mysql.createConnection(DB_CONFIG);
        console.log("✅ Connected to MySQL\n");

        // 1 ─ Drop old tables
        console.log("🗑️  Dropping existing tables…");
        await conn.query(DROP_TABLES);

        // 2 ─ Create tables
        console.log("🏗️  Creating tables…");
        await conn.query(CREATE_USERS);
        await conn.query(CREATE_DEPARTMENTS);
        await conn.query(CREATE_PATIENTS);
        await conn.query(CREATE_DOCTORS);
        await conn.query(CREATE_APPOINTMENTS);
        await conn.query(CREATE_BILLING);
        await conn.query(CREATE_MEDICAL_RECORDS);

        // 3 ─ Hash a single password for all demo users
        const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
        console.log("🔑 Password hashed\n");

        // 4 ─ Insert Users
        console.log("👤 Inserting Users…");
        const allUsers = [...patientUsers, ...doctorUsers, ...demoUsers];
        for (const u of allUsers) {
            await conn.execute(
                "INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)",
                [u.email, hash, u.role]
            );
        }

        // 5 ─ Insert Departments
        console.log("🏥 Inserting Departments…");
        for (const d of departments) {
            await conn.execute(
                "INSERT INTO Departments (department_name) VALUES (?)",
                [d]
            );
        }

        // 6 ─ Insert Patients (user_id 1-20 for regular, 41 for demo)
        console.log("🧑‍🤝‍🧑 Inserting Patients…");
        for (let i = 0; i < patients.length; i++) {
            const p = patients[i];
            const userId = i < 20 ? i + 1 : 41; // first 20 map 1:1, last one is demo (user 41)
            await conn.execute(
                `INSERT INTO Patients
           (user_id, name, age, gender, contact, address, blood_group, secondary_contact, medical_history)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, p.name, p.age, p.gender, p.contact, p.address, p.blood_group, p.secondary_contact, p.medical_history]
            );
        }

        // 7 ─ Insert Doctors (user_id 21-40 for regular, 42 for demo)
        console.log("🩺 Inserting Doctors…");
        for (let i = 0; i < doctors.length; i++) {
            const d = doctors[i];
            const userId = i < 20 ? 21 + i : 42; // first 20 map to user 21-40, last one is demo (user 42)
            await conn.execute(
                `INSERT INTO Doctors
           (user_id, department_id, name, specialization, contact_details)
         VALUES (?, ?, ?, ?, ?)`,
                [userId, d.dept, d.name, d.specialization, d.contact]
            );
        }

        // 8 ─ Insert Appointments
        console.log("📅 Inserting Appointments…");
        for (const a of appointments) {
            await conn.execute(
                `INSERT INTO Appointments
           (patient_id, doctor_id, appointment_date, appointment_time, status)
         VALUES (?, ?, ?, ?, ?)`,
                [a.patient, a.doctor, a.date, a.time, a.status]
            );
        }

        // 9 ─ Insert Billing
        console.log("💰 Inserting Billing…");
        for (const b of billingRecords) {
            await conn.execute(
                `INSERT INTO Billing
           (patient_id, appointment_id, consultation_charges, lab_charges, medicine_charges, payment_status)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [b.patient, b.appointment, b.consultation, b.lab, b.medicine, b.payment]
            );
        }

        // 10 ─ Insert Medical Records
        console.log("📋 Inserting Medical Records…");
        for (const r of medicalRecords) {
            await conn.execute(
                `INSERT INTO Medical_Records
           (patient_id, doctor_id, appointment_id, diagnosis, prescription, test_reports)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [r.patient, r.doctor, r.appt, r.diagnosis, r.prescription, r.tests]
            );
        }

        // 11 ─ Summary
        const tables = ["Users", "Departments", "Patients", "Doctors", "Appointments", "Billing", "Medical_Records"];
        console.log("\n╔══════════════════════════════════════╗");
        console.log("║       🌱 SEED COMPLETE — SUMMARY     ║");
        console.log("╠══════════════════════════════════════╣");
        for (const t of tables) {
            const [[{ cnt }]] = await conn.execute(`SELECT COUNT(*) AS cnt FROM ${t}`);
            console.log(`║  ${t.padEnd(20)} ${String(cnt).padStart(5)} rows  ║`);
        }
        console.log("╠══════════════════════════════════════╣");
        console.log("║  DEMO CREDENTIALS                    ║");
        console.log("║  ──────────────────────────────────── ║");
        console.log("║  Patient:  patient@demo.com           ║");
        console.log("║  Doctor:   doctor@demo.com            ║");
        console.log("║  Password: Demo@123                   ║");
        console.log("╚══════════════════════════════════════╝\n");

    } catch (err) {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
        process.exit(0);
    }
}

seed();
