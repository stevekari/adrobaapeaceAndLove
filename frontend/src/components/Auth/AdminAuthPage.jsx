import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User, 
  Phone, 
  Shield, 
  AlertCircle, 
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import './AuthPage.css';

export default function AdminAuthPage({ onLoginSuccess, onSwitchToMember, showToast }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [hasAdminAccount, setHasAdminAccount] = useState(false);

  // Admin Login State
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [showAdminLoginPassword, setShowAdminLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin Register Form State (Only if no admin exists yet)
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Check whether an Admin account is already registered
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.getAdminStatus();
        if (res && typeof res.hasAdmin === 'boolean') {
          setHasAdminAccount(res.hasAdmin);
          if (!res.hasAdmin) {
            setActiveTab('register'); // Automatically open register if no admin exists!
          }
        }
      } catch {
        // Fallback safe default
      }
    };
    checkAdmin();
  }, []);

  // 1. Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!adminIdentifier.trim()) {
      setLoginError('Please enter your Administrator Email or Code.');
      return;
    }
    if (!adminLoginPassword) {
      setLoginError('Please enter your administrator password.');
      return;
    }

    setLoginLoading(true);
    try {
      const authData = await api.login({
        identifier: adminIdentifier.trim(),
        password: adminLoginPassword,
      });

      if (authData.role !== 'ADMIN' && authData.role !== 'TREASURER') {
        setLoginError('Access denied: This login portal is strictly reserved for Association Administrators.');
        return;
      }

      showToast('Admin Access Granted', `Welcome, Administrator ${authData.firstName}!`, 'success');
      onLoginSuccess(authData);
    } catch (err) {
      setLoginError(err.message || 'Administrator authentication failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 2. Handle Primary Admin Initial Registration (Only allowed if no admin exists)
  const handleAdminRegister = async (e) => {
    e.preventDefault();
    setAdminError('');

    if (!adminFirstName.trim() || !adminLastName.trim()) {
      setAdminError('First and last name are required.');
      return;
    }
    if (!adminEmail.trim() || !/\S+@\S+\.\S+/.test(adminEmail)) {
      setAdminError('A valid email address is required.');
      return;
    }
    if (adminPassword.length < 6) {
      setAdminError('Password must be at least 6 characters.');
      return;
    }
    if (adminPassword !== adminConfirmPassword) {
      setAdminError('Passwords do not match.');
      return;
    }

    setAdminLoading(true);
    try {
      const authData = await api.registerAdmin({
        firstName: adminFirstName.trim(),
        lastName: adminLastName.trim(),
        email: adminEmail.trim(),
        phone: adminPhone.trim(),
        role: 'ADMIN',
        password: adminPassword,
      });

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      showToast('Administrator Registered!', `Admin account created. Member Code: ${authData.memberCode}`, 'success');
      onLoginSuccess(authData);
    } catch (err) {
      setAdminError(err.message || 'Admin registration failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="auth-page-container admin-portal-theme">
      {/* Background ambient lighting */}
      <div className="auth-bg-ambient">
        <div className="ambient-circle circle-admin-1"></div>
        <div className="ambient-circle circle-admin-2"></div>
      </div>

      <div className="auth-wrapper animate-fade-in">
        {/* Navigation to Member Portal */}
        <div className="admin-return-bar">
          <button 
            type="button" 
            className="return-member-btn"
            onClick={onSwitchToMember}
          >
            <ArrowLeft size={16} />
            <span>Switch to Member Portal</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-logo admin-logo-gradient">
            <ShieldCheck size={34} />
          </div>
          <h1 className="auth-portal-title">Peace & Love, Adroabaa</h1>
          <p className="auth-portal-subtitle">Secretariat & Executive Administration</p>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="auth-tabs-nav admin-nav">
          <button 
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setLoginError(''); }}
          >
            <KeyRound size={17} />
            <span>Admin Sign In</span>
          </button>

          <button 
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setAdminError(''); }}
          >
            <Shield size={17} />
            <span>Register Admin</span>
          </button>
        </div>

        {/* Auth Content Card */}
        <div className="auth-card admin-card-border">
          {/* ================= 1. ADMIN SIGN IN ================= */}
          {activeTab === 'login' && (
            <div className="auth-tab-pane animate-fade-in">
              <div className="auth-card-title-box">
                <div className="admin-badge-pill">
                  <ShieldCheck size={14} />
                  <span>Executive & Leadership Portal</span>
                </div>
                <h2>Administrator Sign In</h2>
                <p>Enter your administrator credentials to access association controls, finances, and member rosters.</p>
              </div>

              {loginError && (
                <div className="auth-alert alert-danger animate-shake">
                  <AlertCircle size={17} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="auth-form">
                <div className="auth-input-group">
                  <label>Administrator Email or Code</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="text"
                      placeholder="admin@association.org or ADM-1001"
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Administrator Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type={showAdminLoginPassword ? 'text' : 'password'}
                      placeholder="Enter administrator password"
                      value={adminLoginPassword}
                      onChange={(e) => setAdminLoginPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowAdminLoginPassword(!showAdminLoginPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showAdminLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="auth-submit-btn admin-submit-btn"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <span className="btn-spinner-text">Verifying Admin Access...</span>
                  ) : (
                    <>
                      <span>Sign In to Admin Dashboard</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer-links">
                <p>
                  Not an administrator?{' '}
                  <button 
                    type="button" 
                    className="auth-link-text"
                    onClick={onSwitchToMember}
                  >
                    Go to Member Portal
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ================= 2. INITIAL ADMIN SETUP (ONLY IF NO ADMIN EXISTS) ================= */}
          {activeTab === 'register' && (
            <div className="auth-tab-pane animate-fade-in">
              {hasAdminAccount ? (
                <div className="admin-locked-card">
                  <div className="admin-locked-icon">
                    <ShieldAlert size={36} color="#dc2626" />
                  </div>
                  <h3>Admin Account Already Registered</h3>
                  <p className="admin-locked-desc">
                    An administrator account is already registered and active for <strong>Peace & Love, Adroabaa</strong>.
                  </p>
                  <div className="admin-locked-notice">
                    <Lock size={16} />
                    <span>Only one primary Admin is permitted. Please sign in with your credentials.</span>
                  </div>
                  <button 
                    type="button" 
                    className="auth-submit-btn"
                    onClick={() => setActiveTab('login')}
                  >
                    <span>Sign In as Admin</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="auth-card-title-box">
                    <div className="admin-badge-pill">
                      <ShieldCheck size={14} />
                      <span>System Initial Setup</span>
                    </div>
                    <h2>Setup Primary Administrator</h2>
                    <p>Register the association's primary executive administrator account.</p>
                  </div>

                  {adminError && (
                    <div className="auth-alert alert-danger animate-shake">
                      <AlertCircle size={17} />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminRegister} className="auth-form">
                    <div className="auth-row-2">
                      <div className="auth-input-group">
                        <label>First Name <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <User size={17} className="input-icon" />
                          <input 
                            type="text"
                            placeholder="e.g. Stephen"
                            value={adminFirstName}
                            onChange={(e) => setAdminFirstName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label>Last Name <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <User size={17} className="input-icon" />
                          <input 
                            type="text"
                            placeholder="e.g. Karikari"
                            value={adminLastName}
                            onChange={(e) => setAdminLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="auth-row-2">
                      <div className="auth-input-group">
                        <label>Email Address <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <Mail size={17} className="input-icon" />
                          <input 
                            type="email"
                            placeholder="admin@association.org"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label>Phone Number</label>
                        <div className="auth-input-wrapper">
                          <Phone size={17} className="input-icon" />
                          <input 
                            type="tel"
                            placeholder="+233 24 123 4567"
                            value={adminPhone}
                            onChange={(e) => setAdminPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="auth-row-2">
                      <div className="auth-input-group">
                        <label>Password <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <Lock size={17} className="input-icon" />
                          <input 
                            type={showAdminPassword ? 'text' : 'password'}
                            placeholder="At least 6 characters"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                          <button 
                            type="button" 
                            className="password-toggle-btn"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                          >
                            {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label>Confirm Password <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <Lock size={17} className="input-icon" />
                          <input 
                            type={showAdminPassword ? 'text' : 'password'}
                            placeholder="Re-enter password"
                            value={adminConfirmPassword}
                            onChange={(e) => setAdminConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="auth-submit-btn admin-submit-btn"
                      disabled={adminLoading}
                    >
                      {adminLoading ? (
                        <span>Setting up Admin...</span>
                      ) : (
                        <>
                          <span>Complete Initial Setup</span>
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

