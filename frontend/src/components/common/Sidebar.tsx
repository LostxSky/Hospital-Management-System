import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const patientLinks = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/patient/appointments', label: 'Appointments', icon: '📅' },
  { to: '/patient/book', label: 'Book Appointment', icon: '＋' },
  { to: '/patient/records', label: 'Medical Records', icon: '📋' },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: '💊' },
  { to: '/patient/billing', label: 'Billing', icon: '💳' },
];

const doctorLinks = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/doctor/appointments', label: 'Appointments', icon: '📅' },
  { to: '/doctor/patients', label: 'My Patients', icon: '👥' },
  { to: '/doctor/prescribe', label: 'Prescribe', icon: '💊' },
  { to: '/doctor/reports', label: 'Upload Reports', icon: '📁' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className="sidebar">
      <p className="sidebar-heading">
        Menu
      </p>
      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
