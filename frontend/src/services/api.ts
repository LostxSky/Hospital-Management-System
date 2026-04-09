import type {
    Doctor, Patient, Appointment, Bill, MedicalRecord, ApiResponse
} from '../types';

const BASE_URL = 'http://localhost:5000/api';

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
// Returns { data: parsedBody } to match the Axios response shape callers expect.
// Handles auth header injection and global 401 redirect automatically.
async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<{ data: T }> {
    const token = localStorage.getItem('shms_token');

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    // Global 401 handler — clears credentials and redirects to login
    if (res.status === 401) {
        localStorage.removeItem('shms_token');
        localStorage.removeItem('shms_user');
        if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }

    const body = await res.json();

    if (!res.ok) {
        throw Object.assign(new Error(body?.message ?? 'Request failed'), { response: { data: body, status: res.status } });
    }

    return { data: body };
}

// Convenience helpers
const get = <T>(path: string) => apiFetch<T>(path);
const post = <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) });

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    role: 'Patient' | 'Doctor';
    name?: string;
    age?: number;
    gender?: string;
    contact?: string;
    address?: string;
    blood_group?: string;
    specialization?: string;
}

export const authAPI = {
  login: (data: LoginPayload) => 
    post<{ token: string; message: string; role: string }>('/auth/login', data),
  register: (data: RegisterPayload) => 
    post<{ message: string; user_id: number }>('/auth/register', data),
};

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
export const patientAPI = {
    getMyProfile: () => get<ApiResponse<Patient>>('/patients/me'),
    getAll: () => get<ApiResponse<Patient[]>>('/patients'),
    getById: (id: number) => get<ApiResponse<Patient>>(`/patients/${id}`),
    update: (id: number, data: Partial<Patient>) =>
        put<ApiResponse<null>>(`/patients/${id}`, data),
};

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
export const doctorAPI = {
    getAll: () => get<ApiResponse<Doctor[]>>('/doctors'),
};

// ─── APPOINTMENTS ──────────────────────────────────────────────────────────────
export const appointmentAPI = {
    getMy: () => get<ApiResponse<Appointment[]>>('/appointments/my'),
    getDoctor: () => get<ApiResponse<Appointment[]>>('/appointments/doctor'),
    getAll: () => get<ApiResponse<Appointment[]>>('/appointments'),
    book: (data: {
        patient_id: number;
        doctor_id: number;
        appointment_date: string;
        appointment_time: string;
    }) => post<ApiResponse<null>>('/appointments', data),
    updateStatus: (id: number, status: string) =>
        put<ApiResponse<null>>(`/appointments/${id}/status`, { status }),
};

// ─── BILLING ──────────────────────────────────────────────────────────────────
export const billingAPI = {
    getMy: () => get<ApiResponse<Bill[]>>('/billing/my'),
    getAll: () => get<ApiResponse<Bill[]>>('/billing'),
    updatePaymentStatus: (id: number, payment_status: string) =>
        put<ApiResponse<null>>(`/billing/${id}/status`, { payment_status }),
};

// ─── MEDICAL RECORDS ──────────────────────────────────────────────────────────
export const medicalRecordAPI = {
    getMy: () => get<ApiResponse<MedicalRecord[]>>('/medical-records/my'),
    getByPatient: (patientId: number) =>
        get<ApiResponse<MedicalRecord[]>>(`/medical-records/patient/${patientId}`),
    create: (data: {
        patient_id: number;
        appointment_id?: number;
        diagnosis: string;
        prescription: string;
        test_reports?: string;
    }) => post<ApiResponse<null>>('/medical-records', data),
};
