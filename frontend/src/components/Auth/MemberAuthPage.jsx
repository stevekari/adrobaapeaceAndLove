import React, { useState } from 'react';
import { 
  Building2, 
  KeyRound, 
  UserCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone, 
  MapPin, 
  Briefcase, 
  ShieldCheck,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { signInWithGoogle } from '../../services/firebase';
import './AuthPage.css';

export default function MemberAuthPage({ onLoginSuccess, onSwitchToAdmin, showToast }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'code-register'
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState('');

  // Member Code Registration State
  const [codeQuery, setCodeQuery] = useState('');
  const [verifiedCodeData, setVerifiedCodeData] = useState(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  // Handle Google Sign-In & Redirect if not registered
  const handleGoogleAuth = async () => {
    setLoginError('');
    setCodeError('');
    setGoogleNotice('');
    setGoogleLoading(true);

    try {
      const googleUser = await signInWithGoogle();
      
      try {
        const authData = await api.googleLogin({
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          photoUrl: googleUser.photoUrl,
          googleUid: googleUser.uid,
        });

        showToast('Welcome!', `Signed in with Google as ${authData.firstName} ${authData.lastName}`, 'success');
        onLoginSuccess(authData);
      } catch (apiErr) {
        // If account does not exist, redirect directly to registration tab!
        setActiveTab('code-register');
        setMemberEmail(googleUser.email || '');
        setMemberFirstName(googleUser.firstName || '');
        setMemberLastName(googleUser.lastName || '');
        setGoogleNotice(`Google Verified (${googleUser.email})! Please enter your Member Registration Code below to finish activating your account.`);
        showToast('Google Verified', 'Please enter your Member Code to complete activation.', 'info');
      }
    } catch (err) {
      setLoginError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setGoogleLoading(false);
    }
  };
  
  // Registration Fields
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

  // 1. Handle Member Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your Member Code or Email Address.');
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
      showToast('Welcome Back!', `Signed in as ${authData.firstName} ${authData.lastName}`, 'success');
      onLoginSuccess(authData);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your member code or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 2. Handle Member Code Verification
  const handleVerifyCode = async (codeToVerify) => {
    const code = (codeToVerify || codeQuery).trim();
    if (!code) {
      setCodeError('Please enter your official Member Code.');
      return;
    }
    setVerifyingCode(true);
    setCodeError('');
    setVerifiedCodeData(null);

    try {
      const result = await api.verifyRegistrationCode(code);
      setVerifiedCodeData(result);
      if (result.preAssignedMemberName) {
        setMemberPhone(result.preAssignedMemberPhone || '');
        setMemberCity(result.preAssignedMemberCity || '');
        setMemberPlaceOfLiving(result.preAssignedMemberAddress || '');
        setMemberOccupation(result.preAssignedMemberProfession || '');
      }
    } catch (err) {
      setCodeError(err.message || 'Could not verify code.');
    } finally {
      setVerifyingCode(false);
    }
  };

  // 3. Handle Member Account Activation
  const handleRegisterMember = async (e) => {
    e.preventDefault();
    setCodeError('');

    if (!verifiedCodeData) {
      setCodeError('Please verify your member registration code first.');
      return;
    }

    if (memberNewPassword.length < 6) {
      setCodeError('Password must be at least 6 characters.');
      return;
    }
    if (memberNewPassword !== memberConfirmPassword) {
      setCodeError('Passwords do not match. Please re-enter.');
      return;
    }

    setRegisteringMember(true);
    try {
      const payload = {
        code: verifiedCodeData.code,
        password: memberNewPassword,
        firstName: verifiedCodeData.preAssignedMemberName ? undefined : memberFirstName.trim(),
        lastName: verifiedCodeData.preAssignedMemberName ? undefined : memberLastName.trim(),
        email: verifiedCodeData.preAssignedMemberName ? undefined : memberEmail.trim(),
        phone: memberPhone.trim(),
        city: memberCity.trim(),
        placeOfLiving: memberPlaceOfLiving.trim(),
        occupation: memberOccupation.trim()
      };

      const authData = await api.redeemRegistrationCode(payload);
      setRegisterSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast('Membership Activated!', `Welcome, ${authData.firstName}! Your account is now active.`, 'success');
      
      setTimeout(() => {
        onLoginSuccess(authData);
      }, 1200);
    } catch (err) {
      setCodeError(err.message || 'Registration failed.');
    } finally {
      setRegisteringMember(false);
    }
  };

  return (
    <div className="auth-page-container member-portal-theme">
      {/* Background ambient lighting */}
      <div className="auth-bg-ambient">
        <div className="ambient-circle circle-1"></div>
        <div className="ambient-circle circle-2"></div>
      </div>

      <div className="auth-wrapper animate-fade-in">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-logo member-logo-gradient">
            <Building2 size={32} />
          </div>
          <h1 className="auth-portal-title">Peace & Love, Adroabaa</h1>
          <p className="auth-portal-subtitle">Member Portal & Dues Services</p>
        </div>

        {/* Member Mode Tabs */}
        <div className="auth-tabs-nav member-nav">
          <button 
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setLoginError(''); }}
          >
            <KeyRound size={17} />
            <span>Member Sign In</span>
          </button>
          
          <button 
            className={`auth-tab-btn ${activeTab === 'code-register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('code-register'); setCodeError(''); }}
          >
            <UserCheck size={17} />
            <span>Activate Account</span>
          </button>
        </div>

        {/* Auth Content Card */}
        <div className="auth-card">
          {/* ================= 1. MEMBER LOGIN TAB ================= */}
          {activeTab === 'login' && (
            <div className="auth-tab-pane animate-fade-in">
              <div className="auth-card-title-box">
                <h2>Member Sign In</h2>
                <p>Enter your <strong>Member Code</strong> or Email Address to access your dues and receipts.</p>
              </div>

              {loginError && (
                <div className="auth-alert alert-danger animate-shake">
                  <AlertCircle size={17} />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Firebase Google Sign In Button */}
              <div className="social-auth-box">
                <button 
                  type="button" 
                  className="google-auth-btn"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading}
                >
                  <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>

                <div className="auth-separator">
                  <span>OR SIGN IN WITH MEMBER CODE</span>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>Member Code or Email</label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text"
                      placeholder="e.g. MEM-1004 or your email"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="input-icon" />
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
                  className="auth-submit-btn member-submit-btn"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <span className="btn-spinner-text">Authenticating...</span>
                  ) : (
                    <>
                      <span>Enter Member Portal</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer-links">
                <p>
                  New Member with an Association Code?{' '}
                  <button 
                    type="button" 
                    className="auth-link-text"
                    onClick={() => setActiveTab('code-register')}
                  >
                    Activate Account Here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ================= 2. MEMBER CODE ACTIVATION TAB ================= */}
          {activeTab === 'code-register' && (
            <div className="auth-tab-pane animate-fade-in">
              <div className="auth-card-title-box">
                <div className="code-flow-badge">
                  <Sparkles size={14} />
                  <span>Member Account Activation</span>
                </div>
                <h2>Activate Account with Code</h2>
                <p>Enter the Member Registration Code issued to you by leadership.</p>
              </div>

              {googleNotice && (
                <div className="auth-alert alert-info animate-fade-in">
                  <Sparkles size={17} />
                  <span>{googleNotice}</span>
                </div>
              )}

              {codeError && (
                <div className="auth-alert alert-danger animate-shake">
                  <AlertCircle size={17} />
                  <span>{codeError}</span>
                </div>
              )}

              {/* Code Verification Input */}
              <div className="code-verify-card">
                <label className="code-input-label">
                  <UserCheck size={16} />
                  <span>Your Member Registration Code</span>
                </label>
                <div className="code-search-box">
                  <input 
                    type="text" 
                    placeholder="e.g. MEM-1004 or ASSOC-2026-XXXX"
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
                    {verifyingCode ? 'Checking...' : 'Verify Code'}
                  </button>
                </div>
              </div>

              {/* Verified Member Display & Password Setup */}
              {verifiedCodeData && (
                <div className="verified-member-box animate-scale-up">
                  {verifiedCodeData.preAssignedMemberName ? (
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
                    <div className="open-code-verified-banner">
                      <CheckCircle2 size={20} className="text-emerald" />
                      <div>
                        <strong>Registration Code Verified: {verifiedCodeData.code}</strong>
                        <p>Role: {verifiedCodeData.role} • Welcome to Peace & Love, Adroabaa</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleRegisterMember} className="member-password-form">
                    <div className="form-instruction-banner">
                      <CheckCircle2 size={16} />
                      <span>
                        {verifiedCodeData.preAssignedMemberName 
                          ? 'Pre-assigned record verified! Please set your private password:' 
                          : 'Please enter your member details and create your password:'}
                      </span>
                    </div>

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
                          <MapPin size={17} className="input-icon" />
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
                          <Building size={17} className="input-icon" />
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
                          <span>Membership Activated! Entering Portal...</span>
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
        </div>

        {/* Distinct Secretariat Admin Secluded Portal Link */}
        <div className="admin-portal-secluded-link">
          <button 
            type="button" 
            className="secluded-admin-btn"
            onClick={onSwitchToAdmin}
          >
            <ShieldCheck size={15} />
            <span>Secretariat & Administrator Portal Access →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

