import React, { useState } from 'react';
import ProviderLogin from './components/ProviderLogin';
import ProviderRegistration from './components/ProviderRegistration';
import PatientLogin from './components/PatientLogin';
import PatientRegistration from './components/PatientRegistration';
import ProviderAvailability from './components/ProviderAvailability';
import PatientAppointmentSearch from './components/PatientAppointmentSearch';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login-selector'); // 'login-selector', 'provider-login', 'provider-registration', 'patient-login', 'patient-registration', 'provider-dashboard', 'provider-availability', 'patient-appointment-search'
  const [userData, setUserData] = useState({ name: 'John Doe', email: 'john.doe@example.com' });

  const renderView = () => {
    switch (currentView) {
      case 'provider-login':
        return (
          <ProviderLogin 
            onSwitchToRegistration={() => setCurrentView('provider-registration')}
            onSwitchToPatient={() => setCurrentView('patient-login')}
            onBackToSelector={() => setCurrentView('login-selector')}
            onLoginSuccess={(user) => {
              setUserData(user);
              setCurrentView('provider-dashboard');
            }}
          />
        );
      case 'provider-registration':
        return (
          <ProviderRegistration 
            onSwitchToLogin={() => setCurrentView('provider-login')}
            onBackToSelector={() => setCurrentView('login-selector')}
            onRegistrationSuccess={(user) => {
              setUserData(user);
              setCurrentView('provider-dashboard');
            }}
          />
        );
      case 'patient-login':
        return (
          <PatientLogin 
            onSwitchToRegistration={() => setCurrentView('patient-registration')}
            onBackToSelector={() => setCurrentView('login-selector')}
            onLoginSuccess={(user) => {
              setUserData(user);
              setCurrentView('patient-dashboard');
            }}
          />
        );
      case 'patient-registration':
        return (
          <PatientRegistration 
            onSwitchToLogin={() => setCurrentView('patient-login')}
            onBackToSelector={() => setCurrentView('login-selector')}
            onRegistrationSuccess={(user) => {
              setUserData(user);
              setCurrentView('patient-dashboard');
            }}
          />
        );
      case 'provider-dashboard':
        return (
          <ProviderDashboard 
            user={userData}
            onNavigate={(view) => setCurrentView(view)}
            onLogout={() => {
              setUserData(null);
              setCurrentView('login-selector');
            }}
          />
        );
      case 'provider-availability':
        return (
          <ProviderAvailability 
            user={userData}
            onBackToDashboard={() => setCurrentView('provider-dashboard')}
          />
        );
      case 'patient-dashboard':
        return (
          <PatientDashboard 
            user={userData}
            onLogout={() => {
              setUserData(null);
              setCurrentView('login-selector');
            }}
            onNavigate={(view) => setCurrentView(view)}
          />
        );
      case 'patient-appointment-search':
        return (
          <PatientAppointmentSearch 
            user={userData}
            onBackToDashboard={() => setCurrentView('patient-dashboard')}
          />
        );
      default:
        return <LoginSelector onSelectView={setCurrentView} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

// Provider Dashboard Component
const ProviderDashboard = ({ user, onNavigate, onLogout }) => {
  return (
    <div className="provider-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Provider Dashboard</h1>
          <p>Welcome back, {user?.name || 'Provider'}</p>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => onNavigate('provider-availability')}>
            <div className="card-icon">
              <span style={{ fontSize: '32px' }}>📅</span>
            </div>
            <h3>Availability Management</h3>
            <p>Manage your appointment schedule and availability</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <span style={{ fontSize: '32px' }}>👥</span>
            </div>
            <h3>Patient Management</h3>
            <p>View and manage patient records and appointments</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <span style={{ fontSize: '32px' }}>📊</span>
            </div>
            <h3>Reports & Analytics</h3>
            <p>View practice analytics and performance reports</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <span style={{ fontSize: '32px' }}>⚙️</span>
            </div>
            <h3>Settings</h3>
            <p>Configure your account and practice settings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Patient Dashboard Component
const PatientDashboard = ({ user, onLogout, onNavigate }) => {
  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Patient Dashboard</h1>
          <p>Welcome back, {user?.name || 'Patient'}</p>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card" onClick={() => onNavigate('patient-appointment-search')}>
            <div className="card-icon">
              <span style={{ fontSize: '32px' }}>🔍</span>
            </div>
            <h3>Find Appointments</h3>
            <p>Search for available appointments with healthcare providers</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <span style={{ fontSize: '32px' }}>📅</span>
            </div>
            <h3>My Appointments</h3>
            <p>View and manage your upcoming appointments</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <span style={{ fontSize: '32px' }}>📋</span>
            </div>
            <h3>Health Records</h3>
            <p>Access your medical records and test results</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <span style={{ fontSize: '32px' }}>💊</span>
            </div>
            <h3>Medications</h3>
            <p>View your current medications and prescriptions</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <span style={{ fontSize: '32px' }}>📞</span>
            </div>
            <h3>Contact Provider</h3>
            <p>Send messages to your healthcare providers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Selector Component
const LoginSelector = ({ onSelectView }) => {
  return (
    <div className="login-selector">
      <div className="selector-container">
        <div className="selector-header">
          <div className="logo-section">
            <div className="logo-icon">
              <span style={{ fontSize: '32px', color: '#3b82f6' }}>🏥</span>
            </div>
            <h1 className="logo-text">Health First</h1>
          </div>
          <h2 className="selector-title">Welcome to Health First</h2>
          <p className="selector-subtitle">
            Choose how you'd like to access your account
          </p>
        </div>

        <div className="selector-options">
          <button 
            className="selector-option patient-option"
            onClick={() => onSelectView('patient-login')}
          >
            <div className="option-icon">
              <span style={{ fontSize: '24px' }}>👤</span>
            </div>
            <div className="option-content">
              <h3>Patient Login</h3>
              <p>Access your health records, appointments, and care information</p>
            </div>
          </button>

          <button 
            className="selector-option provider-option"
            onClick={() => onSelectView('provider-login')}
          >
            <div className="option-icon">
              <span style={{ fontSize: '24px' }}>👨‍⚕️</span>
            </div>
            <div className="option-content">
              <h3>Provider Login</h3>
              <p>Healthcare professionals - manage patients and clinical workflows</p>
            </div>
          </button>
        </div>

        <div className="selector-footer">
          <p>New to Health First? <button 
            type="button" 
            className="footer-link"
            onClick={() => onSelectView('patient-registration')}
          >
            Create a patient account
          </button></p>
          <p>Need help? Contact support at <a href="mailto:support@healthfirst.com">support@healthfirst.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default App; 