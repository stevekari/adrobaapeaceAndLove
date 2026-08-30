import React, { useState } from 'react';
import { 
  Building2, 
  KeyRound, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus,
  Phone,
  User,
  Shield,
  HelpCircle,
  Hash,
  MapPin,
  Building,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import './AuthPage.css';

export default function AuthPage({ onLoginSuccess, showToast }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'code-register' | 'admin-register'
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Member Code Registration State
  const [codeQuery, setCodeQuery] = useState('');
  const [verifiedCodeData, setVerifiedCodeData] = useState(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  
  // Member Registration Fields
  const [memberFirstName, setMemberFirstName] = useState('');
  const [memberLastName, setMemberLastName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberCity, setMemberCity] = useState('');
  const [memberPlaceOfLiving, setMemberPlaceOfLiving] = useState('');
  const [memberOccupation, setMemberOccupation] = useState('');
  const [memberNewPassword, setMemberNewPassword] = useState('');
  const [memberConfirmPassword, setMemberConfirmPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [registeringMember, setRegisteringMember] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Admin Register Form State
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminRole, setAdminRole] = useState('ADMIN');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // 1. Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your email or member code.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setLoginLoading(true);
    try {
      const authData = await api.login({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      });
      showToast('Welcome Back!', `Signed in as ${authData.firstName} ${authData.lastName} (${authData.role})`, 'success');
      onLoginSuccess(authData);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick Demo Login Helper
  const handleQuickLogin = async (identifier, password) => {
    setLoginIdentifier(identifier);
    setLoginPassword(password);
    setLoginError('');
    setLoginLoading(true);
    try {
      const authData = await api.login({ identifier, password });
      showToast('Quick Sign-In', `Logged in as ${authData.firstName} (${authData.role})`, 'success');
      onLoginSuccess(authData);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // 2. Handle Member Code Verification
  const handleVerifyCode = async (codeToVerify) => {
    const code = (codeToVerify || codeQuery).trim();
    if (!code) {
      setCodeError('Please enter an official Association Registration Code.');
      return;
    }
    setVerifyingCode(true);
    setCodeError('');
    setVerifiedCodeData(null);

    try {
      const result = await api.verifyRegistrationCode(code);
      setVerifiedCodeData(result);
      if (result.preAssignedMemberName) {
        // Pre-assigned member
        setMemberPhone(result.preAssignedMemberPhone || '');
        setMemberCity(result.preAssignedMemberCity || '');
      } else {
        // Open association code
        setMemberFirstName('');
        setMemberLastName('');
        setMemberEmail('');
        setMemberPhone('');
        setMemberCity('');
        setMemberPlaceOfLiving('');
        setMemberOccupation('');
      }
    } catch (err) {
      setCodeError(err.message || 'Failed to verify association registration code.');
    } finally {
      setVerifyingCode(false);
    }
  };

  // 3. Handle Member Registration / Code Redemption
  const handleMemberCodeSubmit = async (e) => {
    e.preventDefault();
    if (!verifiedCodeData) {
      setCodeError('Please verify your association registration code first.');
      return;
    }
    if (memberNewPassword.length < 6) {
      setCodeError('Password must be at least 6 characters long.');
      return;
    }
    if (memberNewPassword !== memberConfirmPassword) {
      setCodeError('Passwords do not match. Please re-enter.');
      return;
    }

    const isPreAssigned = Boolean(verifiedCodeData.preAssignedMemberName);
    if (!isPreAssigned) {
      if (!memberFirstName.trim() || !memberLastName.trim()) {
        setCodeError('First name and last name are required.');
        return;
      }
      if (!memberEmail.trim() || !/\S+@\S+\.\S+/.test(memberEmail)) {
        setCodeError('A valid email address is required.');
        return;
      }
    }

    setRegisteringMember(true);
    setCodeError('');
    try {
      const payload = {
        code: verifiedCodeData.code,
        firstName: memberFirstName.trim(),
        lastName: memberLastName.trim(),
        email: memberEmail.trim(),
        phone: memberPhone.trim(),
        city: memberCity.trim(),
        placeOfLiving: memberPlaceOfLiving.trim(),
        occupation: memberOccupation.trim(),
        password: memberNewPassword,
      };

      const authData = await api.redeemRegistrationCode(payload);
      setRegisterSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast('Account Activated!', `Welcome, ${authData.firstName}! Your association membership is now active.`, 'success');
      
      setTimeout(() => {
        onLoginSuccess(authData);
      }, 1200);
    } catch (err) {
      setCodeError(err.message || 'Registration failed.');
    } finally {
      setRegisteringMember(false);
    }
  };

  // 4. Handle Admin Registration
  const handleAdminRegisterSubmit = async (e) => {
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
        role: adminRole,
        password: adminPassword,
      });

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      showToast('Admin Registered!', `New ${adminRole} account created. Member Code: ${authData.memberCode}`, 'success');
      onLoginSuccess(authData);
    } catch (err) {
      setAdminError(err.message || 'Admin registration failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background ambient lighting */}
      <div className="auth-bg-ambient">
        <div className="ambient-circle circle-1"></div>
        <div className="ambient-circle circle-2"></div>
      </div>

      <div className="auth-wrapper animate-fade-in">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-logo">
            <Building2 size={32} />
          </div>
          <h1 className="auth-portal-title">Peace & Love, Adroabaa</h1>
          <p className="auth-portal-subtitle">Association Dues & Member Management Portal</p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="auth-tabs-nav">
          <button 
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setLoginError(''); }}
          >
            <KeyRound size={16} />
            <span>Sign In</span>
          </button>
          
          <button 
            className={`auth-tab-btn ${activeTab === 'code-register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('code-register'); setCodeError(''); }}
          >
            <UserCheck size={16} />
            <span>Register with Code</span>
          </button>

          <button 
            className={`auth-tab-btn ${activeTab === 'admin-register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('admin-register'); setAdminError(''); }}
          >
            <ShieldCheck size={16} />
            <span>Admin Sign Up</span>
          </button>
        </div>

        {/* Auth Content Cards */}
        <div className="auth-card">
          {/* ================= 1. LOGIN TAB ================= */}
          {activeTab === 'login' && (
            <div className="auth-tab-pane animate-fade-in">
              <div className="auth-card-title-box">
                <h2>Welcome Back</h2>
                <p>Sign in with your Email Address or Member Code.</p>
              </div>

              {loginError && (
                <div className="auth-alert alert-danger animate-shake">
                  <AlertCircle size={17} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>Email or Member Code</label>
                  <div className="auth-input-wrapper">
                    <Mail size={17} className="input-icon" />
                    <input 
                      type="text"
                      placeholder="e.g. stephen.karikari@association.org or MEM-1003"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={17} className="input-icon" />
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <span className="btn-spinner-text">Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* Helper Links */}

              {/* Helper Links */}
              <div className="auth-footer-links">
                <p>
                  Have an Association Code from leadership?{' '}
                  <button 
                    type="button" 
                    className="auth-link-text"
                    onClick={() => setActiveTab('code-register')}
                  >
                    Register & Activate Account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ================= 2. ASSOCIATION CODE REGISTRATION TAB ================= */}
          {activeTab === 'code-register' && (
            <div className="auth-tab-pane animate-fade-in">
              <div className="auth-card-title-box">
                <div className="code-flow-badge">
                  <Sparkles size={14} />
                  <span>Association Members Only</span>
                </div>
                <h2>Register with Association Code</h2>
                <p>Enter the official registration code generated for you by association leadership.</p>
              </div>

              {codeError && (
                <div className="auth-alert alert-danger animate-shake">
                  <AlertCircle size={17} />
                  <span>{codeError}</span>
                </div>
              )}

              {/* Step 1: Code Lookup */}
              <div className="code-verify-card">
                <label className="code-input-label">
                  <Hash size={16} />
                  <span>Official Registration Code</span>
                </label>
                <div className="code-search-box">
                  <input 
                    type="text"
                    placeholder="e.g. MEM-1004 or ASSOC-2026-8812"
                    value={codeQuery}
                    onChange={(e) => setCodeQuery(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyCode();
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="code-verify-btn"
                    onClick={() => handleVerifyCode()}
                    disabled={verifyingCode}
                  >
                    {verifyingCode ? 'Verifying...' : 'Verify Code'}
                  </button>
                </div>

                {/* Quick seed test helpers */}
                <div className="seed-code-hints">
                  <span className="seed-label">Test Association Codes:</span>
                  <button 
                    type="button" 
                    className="seed-chip"
                    onClick={() => {
                      setCodeQuery('ASSOC-2026-8812');
                      handleVerifyCode('ASSOC-2026-8812');
                    }}
                  >
                    ASSOC-2026-8812 (Open Pass)
                  </button>
                  <button 
                    type="button" 
                    className="seed-chip"
                    onClick={() => {
                      setCodeQuery('MEM-1004');
                      handleVerifyCode('MEM-1004');
                    }}
                  >
                    MEM-1004 (Abena Osei)
                  </button>
                  <button 
                    type="button" 
                    className="seed-chip"
                    onClick={() => {
                      setCodeQuery('MEM-1005');
                      handleVerifyCode('MEM-1005');
                    }}
                  >
                    MEM-1005 (Kofi Appiah)
                  </button>
                </div>
              </div>

              {/* Step 2: Code Verified Details & Registration Form */}
              {verifiedCodeData && (
                <div className="verified-member-box animate-scale-up">
                  {verifiedCodeData.preAssignedMemberName ? (
                    /* Pre-Enrolled Member Card */
                    <div className="member-summary-header">
                      <div className="member-avatar-badge">
                        {verifiedCodeData.preAssignedMemberName[0]}
                      </div>
                      <div className="member-summary-info">
                        <div className="member-name-row">
                          <h3>{verifiedCodeData.preAssignedMemberName}</h3>
                          <span className="member-code-tag">{verifiedCodeData.code}</span>
                        </div>
                        <p className="member-email-text">{verifiedCodeData.preAssignedMemberEmail}</p>
                      </div>
                    </div>
                  ) : (
                    /* Open Association Code Verified Card */
                    <div className="open-code-verified-banner">
                      <CheckCircle2 size={20} className="text-emerald" />
                      <div>
                        <strong>Official Association Code Verified: {verifiedCodeData.code}</strong>
                        <p>Authorized Role: {verifiedCodeData.role} • {verifiedCodeData.notes || 'Association Membership Drive'}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleMemberCodeSubmit} className="member-password-form">
                    <div className="form-instruction-banner">
                      <CheckCircle2 size={16} />
                      <span>{verifiedCodeData.preAssignedMemberName ? 'Pre-assigned identity verified! Confirm your residence and set password:' : 'Please enter your biographical details and create your password:'}</span>
                    </div>

                    {/* Open code fields if not pre-assigned */}
                    {!verifiedCodeData.preAssignedMemberName && (
                      <>
                        <div className="auth-row-2">
                          <div className="auth-input-group">
                            <label>First Name <span className="req">*</span></label>
                            <div className="auth-input-wrapper">
                              <User size={17} className="input-icon" />
                              <input 
                                type="text"
                                placeholder="e.g. Kwabena"
                                value={memberFirstName}
                                onChange={(e) => setMemberFirstName(e.target.value)}
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
                                placeholder="e.g. Darko"
                                value={memberLastName}
                                onChange={(e) => setMemberLastName(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="auth-input-group">
                          <label>Email Address <span className="req">*</span></label>
                          <div className="auth-input-wrapper">
                            <Mail size={17} className="input-icon" />
                            <input 
                              type="email"
                              placeholder="kwabena.darko@association.org"
                              value={memberEmail}
                              onChange={(e) => setMemberEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="auth-row-2">
                      <div className="auth-input-group">
                        <label>Phone Number</label>
                        <div className="auth-input-wrapper">
                          <Phone size={17} className="input-icon" />
                          <input 
                            type="tel"
                            placeholder="+233 24 123 4567"
                            value={memberPhone}
                            onChange={(e) => setMemberPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label>City of Residence</label>
                        <div className="auth-input-wrapper">
                          <Building size={17} className="input-icon" />
                          <input 
                            type="text"
                            placeholder="e.g. Accra, Kumasi"
                            value={memberCity}
                            onChange={(e) => setMemberCity(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="auth-row-2">
                      <div className="auth-input-group">
                        <label>Place of Living (Address)</label>
                        <div className="auth-input-wrapper">
                          <MapPin size={17} className="input-icon" />
                          <input 
                            type="text"
                            placeholder="e.g. Airport Residential"
                            value={memberPlaceOfLiving}
                            onChange={(e) => setMemberPlaceOfLiving(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label>Profession / Occupation</label>
                        <div className="auth-input-wrapper">
                          <Briefcase size={17} className="input-icon" />
                          <input 
                            type="text"
                            placeholder="e.g. Civil Engineer"
                            value={memberOccupation}
                            onChange={(e) => setMemberOccupation(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="auth-row-2">
                      <div className="auth-input-group">
                        <label>Create Password <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <Lock size={17} className="input-icon" />
                          <input 
                            type={showMemberPassword ? 'text' : 'password'}
                            placeholder="At least 6 chars"
                            value={memberNewPassword}
                            onChange={(e) => setMemberNewPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                          <button 
                            type="button" 
                            className="password-toggle-btn"
                            onClick={() => setShowMemberPassword(!showMemberPassword)}
                          >
                            {showMemberPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label>Confirm Password <span className="req">*</span></label>
                        <div className="auth-input-wrapper">
                          <Lock size={17} className="input-icon" />
                          <input 
                            type={showMemberPassword ? 'text' : 'password'}
                            placeholder="Re-enter password"
                            value={memberConfirmPassword}
                            onChange={(e) => setMemberConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="auth-submit-btn success-btn"
                      disabled={registeringMember || registerSuccess}
                    >
                      {registeringMember ? (
                        <span>Activating Membership...</span>
                      ) : registerSuccess ? (
                        <>
                          <CheckCircle2 size={18} />
                          <span>Membership Activated! Redirecting...</span>
                        </>
                      ) : (
                        <>
                          <span>Activate Account & Enter Portal</span>
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ================= 3. ADMIN REGISTRATION TAB ================= */}
          {activeTab === 'admin-register' && (
            <div className="auth-tab-pane animate-fade-in">
              <div className="auth-card-title-box">
                <div className="admin-badge-pill">
                  <ShieldCheck size={14} />
                  <span>Executive & Secretariat Registration</span>
                </div>
                <h2>Register Association Admin</h2>
                <p>Create an administrator account to manage member rolls, dues schedules, and financials.</p>
              </div>

              {adminError && (
                <div className="auth-alert alert-danger animate-shake">
                  <AlertCircle size={17} />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminRegisterSubmit} className="auth-form">
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

                <div className="auth-input-group">
                  <label>Administrative Role <span className="req">*</span></label>
                  <div className="auth-input-wrapper">
                    <Shield size={17} className="input-icon" />
                    <select 
                      className="auth-select"
                      value={adminRole}
                      onChange={(e) => setAdminRole(e.target.value)}
                    >
                      <option value="ADMIN">ADMIN — Full Executive & Portal Access</option>
                      <option value="TREASURER">TREASURER — Financial Ledger & Dues Officer</option>
                    </select>
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
                    <span>Registering Admin...</span>
                  ) : (
                    <>
                      <span>Complete Admin Registration</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
