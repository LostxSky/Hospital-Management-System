import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────
// Each page is split into its own chunk and only loaded when the route is visited
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment'));
const MyAppointments = lazy(() => import('./pages/patient/MyAppointments'));
const MedicalRecords = lazy(() => import('./pages/patient/MedicalRecords'));
const Prescriptions = lazy(() => import('./pages/patient/Prescriptions'));
const Billing = lazy(() => import('./pages/patient/Billing'));

const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const MyPatients = lazy(() => import('./pages/doctor/MyPatients'));
const PatientDetails = lazy(() => import('./pages/doctor/PatientDetails'));
const WritePrescription = lazy(() => import('./pages/doctor/WritePrescription'));
const UploadReports = lazy(() => import('./pages/doctor/UploadReports'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ─── Page Loader ──────────────────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div style={{ color: 'var(--brand-primary)', fontSize: '1rem' }}>Loading…</div>
  </div>
);

// ─── Layout ───────────────────────────────────────────────────────────────────
const DashboardLayout = () => (
  <div className="app-layout">
    <Navbar />
    <div className="main-content-wrapper">
      <Sidebar />
      <main className="main-content" style={{ padding: 0 }}>
        <Outlet />
      </main>
    </div>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient routes */}
            <Route element={<ProtectedRoute role="patient"><DashboardLayout /></ProtectedRoute>}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/book" element={<BookAppointment />} />
              <Route path="/patient/appointments" element={<MyAppointments />} />
              <Route path="/patient/records" element={<MedicalRecords />} />
              <Route path="/patient/prescriptions" element={<Prescriptions />} />
              <Route path="/patient/billing" element={<Billing />} />
            </Route>

            {/* Doctor routes */}
            <Route element={<ProtectedRoute role="doctor"><DashboardLayout /></ProtectedRoute>}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/patients" element={<MyPatients />} />
              <Route path="/doctor/patients/:id" element={<PatientDetails />} />
              <Route path="/doctor/prescribe" element={<WritePrescription />} />
              <Route path="/doctor/reports" element={<UploadReports />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
