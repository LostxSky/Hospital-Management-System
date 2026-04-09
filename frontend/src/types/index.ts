// ─── AUTH ───────────────────────────────────────────────
export type UserRole = 'patient' | 'doctor';

export interface AuthUser {
  user_id: number;
  role: UserRole;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  age?: number;
  gender?: string;
  contact?: string;
  address?: string;
  blood_group?: string;
  specialization?: string;
  department_id?: number;
}

// ─── PATIENT ────────────────────────────────────────────
export interface Patient {
  patient_id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address: string;
  blood_group: string;
  secondary_contact?: string;
  medical_history?: string;
}

// ─── DOCTOR ─────────────────────────────────────────────
export interface Doctor {
  doctor_id: number;
  name: string;
  specialization: string;
  department_id: number;
  department_name?: string;
  contact: string;
  availability?: string;
}

// ─── DEPARTMENT ─────────────────────────────────────────
export interface Department {
  department_id: number;
  department_name: string;
  description?: string;
}

// ─── APPOINTMENT ────────────────────────────────────────
export interface Appointment {
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  patient_name?: string;
  doctor_name?: string;
}

export interface CreateAppointmentRequest {
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
}

// ─── MEDICAL RECORDS ────────────────────────────────────
export interface MedicalRecord {
  record_id: number;
  patient_id: number;
  diagnosis: string;
  prescription: string;
  test_reports?: string;
  created_at?: string;
  doctor_name?: string;
}

// ─── BILLING ────────────────────────────────────────────
export interface Bill {
  bill_id: number;
  patient_id: number;
  appointment_id: number;    // ← add this
  consultation_charges: number;
  lab_charges: number;
  medicine_charges: number;
  total_amount: number;
  payment_status: 'Paid' | 'Unpaid' | 'Pending';
  issued_date?: string;      // ← backend uses issued_date not created_at
  appointment_date?: string; // ← comes from the JOIN in getMyBills
  appointment_time?: string; // ← comes from the JOIN in getMyBills
}

// ─── API RESPONSE ────────────────────────────────────────
export interface ApiResponse<T> {
  message: string;
  data?: T;
  appointment_id?: number;
}