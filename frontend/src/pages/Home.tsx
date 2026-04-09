import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import hospitalImg from '../assets/hospital.jpg';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useScrollReveal(); // Initialize reveal animations on scroll

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", color: 'var(--text-primary)' }}>

      {/* ── NAVBAR ── */}
      <nav className="landing-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--brand-primary)', fontSize: '1.3rem' }}>♥</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.3px' }}>SmartCare</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Features</a>
          <a href="#about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>About</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <button onClick={() => navigate(`/${user.role}/dashboard`)} className="btn-primary" style={{ padding: '0.55rem 1.2rem' }}>
                Dashboard →
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn-text">Sign In</button>
                <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '0.55rem 1.2rem' }}>
                  Join Now
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="reveal delay-1" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(45, 184, 122, 0.08)',
            border: '1px solid var(--brand-primary-faded)', borderRadius: '99px',
            padding: '0.4rem 1.25rem', marginBottom: '1.5rem',
            color: 'var(--brand-primary)', fontSize: '0.85rem', fontWeight: 600,
          }}>
            <span>🛡️</span> Trusted by 500+ clinics worldwide
          </div>

          <h1 className="reveal delay-2" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1.25rem', color: 'var(--text-primary)' }}>
            Smart Hospital<br />
            <span style={{ color: 'var(--brand-primary)' }}>Management</span><br />
            Reimagined
          </h1>

          <p className="reveal delay-3" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '440px', marginBottom: '2.5rem' }}>
            Digitize your hospital operations. Manage appointments, medical records,
            billing, and prescriptions — all in one secure, unified platform.
          </p>

          <div className="reveal delay-4" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {user ? (
              <button onClick={() => navigate(`/${user.role}/dashboard`)} className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '0.85rem 2.25rem', fontSize: '1rem' }}>
                  Register Now
                </button>
                <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '0.85rem 2.25rem', fontSize: '1rem' }}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>

        <div className="landing-hero-image-wrapper">
          <img
            src={hospitalImg}
            alt="Healthcare professionals in a modern facility"
            className="landing-hero-image"
          />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="landing-features-section">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 1rem', color: 'var(--text-primary)' }}>Everything You Need</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto' }}>
            A comprehensive, automated platform for patients and doctors to manage healthcare with precision.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {[
            { icon: '📅', title: 'Smart Appointments', desc: 'Book, reschedule, or cancel appointments with ease. Intelligent scheduling with real-time availability.' },
            { icon: '🛡️', title: 'Universal Health Records', desc: 'Securely access and share your medical history, digital prescriptions, and test results.' },
            { icon: '💳', title: 'Seamless Payments', desc: 'Unified billing and payment tracking. Handle consultation fees and hospital dues effortlessly.' },
          ].map((f, i) => (
            <div key={f.title} className={`landing-feature-card reveal delay-${i + 1}`}>
              <div style={{
                width: '56px', height: '56px', background: 'rgba(45, 184, 122, 0.1)',
                border: '1px solid var(--brand-primary-faded)',
                borderRadius: '14px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', margin: '0 0 0.85rem', color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="about" className="landing-cta-section" style={{ padding: '8rem 2rem' }}>
        <h2 className="reveal" style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 1.5rem', color: 'var(--text-primary)' }}>
          Empowering Healthcare teams <br /> & Patients Everywhere
        </h2>
        <p className="reveal delay-1" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
          SmartCare provides role-based access so patients can manage their health journey while
          doctors can efficiently handle diagnoses, prescriptions, and patient records.
        </p>
        <button onClick={() => user ? navigate(`/${user.role}/dashboard`) : navigate('/register')} className="reveal delay-2 btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
          {user ? 'Jump to Dashboard' : 'Get Started Now'}
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <span style={{ color: 'var(--brand-primary)', fontSize: '1.2rem' }}>♥</span> SmartCare HMS
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <span style={{ opacity: 0.8 }}>© 2026 SmartCare. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
};

export default Home;
