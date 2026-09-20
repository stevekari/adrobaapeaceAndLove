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
  KeyRound,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { signInWithGoogle } from '../../services/firebase';
import { useTranslation } from '../../i18n/LanguageContext';
import LanguageSelector from '../Navbar/LanguageSelector';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './AuthPage.css';

export default function AdminAuthPage({ onLoginSuccess, onSwitchToMember, showToast }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [hasAdminAccount, setHasAdminAccount] = useState(false);

  // Admin Login State
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [showAdminLoginPassword, setShowAdminLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Admin / Company Register Form State
  const [adminCompanyName, setAdminCompanyName] = useState('Peace & Love, Adroabaa');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Forgot Password State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotResetCode, setForgotResetCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [receivedOtpCode, setReceivedOtpCode] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Request Password Reset Code for Admin
  const handleAdminRequestResetCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your administrator email address or admin code.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.forgotPassword({ email: forgotIdentifier.trim() });
      setMaskedEmail(res.maskedEmail || forgotIdentifier);
      setReceivedOtpCode(res.resetCode || '');
      setForgotSuccess(res.message || 'A 6-digit password reset code has been sent to your email.');
      setForgotStep(2);
      showToast('Code Sent', `Password reset code sent to ${res.maskedEmail || forgotIdentifier}`, 'info');
    } catch (err) {
      setForgotError(err.message || 'Could not send reset code. Please check your admin credentials.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Submit Password Reset for Admin
  const handleAdminResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotResetCode.trim() || forgotResetCode.trim().length !== 6) {
      setForgotError('Please enter the 6-digit reset code sent to your email.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    try {
      const authData = await api.resetPassword({
        email: forgotIdentifier.trim(),
        resetCode: forgotResetCode.trim(),
        newPassword: forgotNewPassword
      });

      if (authData.role !== 'ADMIN' && authData.role !== 'TREASURER') {
        setForgotError('Access denied: This portal is reserved for administrators.');
        return;
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#4f46e5', '#10b981']
      });

      showToast('Admin Password Reset Successfully!', `Welcome back, Administrator ${authData.firstName}!`, 'success');
      onLoginSuccess(authData);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password. Please check your reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCopyOtp = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  // Handle Admin Google Sign-In
  const handleAdminGoogleAuth = async () => {
    setLoginError('');
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      const authData = await api.googleLogin({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        photoUrl: googleUser.photoUrl,
        googleUid: googleUser.uid,
      });

      if (authData.role !== 'ADMIN' && authData.role !== 'TREASURER') {
        setLoginError('Access denied: Your Google account is registered as a regular Member. Please sign in via the Member Portal.');
        return;
      }

      showToast('Admin Access Granted', `Welcome, Administrator ${authData.firstName}!`, 'success');
      onLoginSuccess(authData);
    } catch (err) {
      setLoginError(err.message || 'Google Administrator authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

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
        companyName: adminCompanyName.trim() || 'Peace & Love, Adroabaa',
        role: 'ADMIN',
        password: adminPassword,
      });

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      showToast('Administrator Registered!', `Admin account created for ${adminCompanyName.trim() || 'Peace & Love, Adroabaa'}. Member Code: ${authData.memberCode}`, 'success');
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
        {/* Navigation & Language Actions */}
        <div className="auth-top-bar">
          <button 
            type="button" 
            className="return-member-btn"
            onClick={onSwitchToMember}
          >
            <ArrowLeft size={16} />
            <span>Switch to Member Portal</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle />
            <LanguageSelector />
          </div>
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
            <Building2 size={17} />
            <span>Register Admin / Company</span>
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

              {/* Admin Firebase Google Sign In Button */}
              <div className="social-auth-box">
                <button 
                  type="button" 
                  className="google-auth-btn admin-google-btn"
                  onClick={handleAdminGoogleAuth}
                  disabled={googleLoading}
                >
                  <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{googleLoading ? 'Verifying Admin Google...' : 'Sign In with Admin Google Account'}</span>
                </button>

                <div className="auth-separator">
                  <span>OR WITH ADMIN CREDENTIALS</span>
                </div>
              </div>

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
                  <div className="auth-label-row">
                    <label>Administrator Password</label>
                    <button 
                      type="button" 
                      className="auth-link-btn-subtle"
                      onClick={() => {
                        setForgotIdentifier(adminIdentifier || '');
                        setActiveTab('forgot-password');
                        setForgotStep(1);
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
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

          {/* ================= 1B. ADMIN FORGOT & RESET PASSWORD TAB ================= */}
          {activeTab === 'forgot-password' && (
            <div className="auth-tab-pane animate-fade-in">
              <div className="auth-card-title-box">
                <div className="admin-badge-pill">
                  <Shield size={14} />
                  <span>Executive Security</span>
                </div>
                <h2>Reset Admin Password</h2>
                <p>
                  {forgotStep === 1 
                    ? 'Enter your registered Administrator Email Address or Admin Code to receive a 6-digit OTP reset code.' 
                    : `Enter the 6-digit reset code sent to ${maskedEmail || 'your email'} and create your new password.`}
                </p>
              </div>

              {forgotError && (
                <div className="auth-alert alert-danger animate-shake">
                  <AlertCircle size={17} />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="auth-alert alert-info animate-fade-in">
                  <CheckCircle2 size={17} />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {/* Step 1: Request OTP Code */}
              {forgotStep === 1 && (
                <form onSubmit={handleAdminRequestResetCode} className="auth-form">
                  <div className="auth-input-group">
                    <label>Administrator Email or Admin Code <span className="req">*</span></label>
                    <div className="auth-input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input 
                        type="text"
                        placeholder="e.g. admin@association.org or ADM-1001"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <span className="input-hint">A secure 6-digit OTP code will be sent to the administrator email on record.</span>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn admin-submit-btn"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <span className="btn-spinner-text">Sending Admin Reset Code...</span>
                    ) : (
                      <>
                        <span>Send 6-Digit Reset Code</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>

                  <div className="auth-footer-links">
                    <button 
                      type="button" 
                      className="auth-link-text"
                      onClick={() => { setActiveTab('login'); setForgotError(''); }}
                    >
                      ← Back to Admin Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Enter OTP Code & Set New Password */}
              {forgotStep === 2 && (
                <form onSubmit={handleAdminResetPasswordSubmit} className="auth-form">
                  {receivedOtpCode && (
                    <div className="otp-badge-box">
                      <div className="otp-badge-header">
                        <Sparkles size={15} color="#10b981" />
                        <span>Admin Reset Code Generated:</span>
                      </div>
                      <div className="otp-badge-content">
                        <span className="otp-digit-display">{receivedOtpCode}</span>
                        <button 
                          type="button" 
                          className="otp-copy-btn"
                          onClick={() => handleCopyOtp(receivedOtpCode)}
                        >
                          {copiedOtp ? '✓ Copied' : 'Copy Code'}
                        </button>
                      </div>
                      <p className="otp-badge-hint">Simulated dispatch logged. Enter the 6-digit code below.</p>
                    </div>
                  )}

                  <div className="auth-input-group">
                    <label>6-Digit Reset Code <span className="req">*</span></label>
                    <div className="auth-input-wrapper">
                      <KeyRound size={18} className="input-icon" />
                      <input 
                        type="text"
                        placeholder="e.g. 849201"
                        maxLength={6}
                        value={forgotResetCode}
                        onChange={(e) => setForgotResetCode(e.target.value.replace(/\D/g, ''))}
                        className="otp-code-input"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>New Password <span className="req">*</span></label>
                    <div className="auth-input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input 
                        type={showForgotNewPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      >
                        {showForgotNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Confirm New Password <span className="req">*</span></label>
                    <div className="auth-input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input 
                        type={showForgotNewPassword ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn success-btn"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <span className="btn-spinner-text">Resetting Password...</span>
                    ) : (
                      <>
                        <span>Update Password & Enter Admin Portal</span>
                        <CheckCircle2 size={17} />
                      </>
                    )}
                  </button>

                  <div className="auth-footer-links auth-dual-links">
                    <button 
                      type="button" 
                      className="auth-link-text-subtle"
                      onClick={() => setForgotStep(1)}
                    >
                      Resend Code / Change Identifier
                    </button>
                    <button 
                      type="button" 
                      className="auth-link-text"
                      onClick={() => { setActiveTab('login'); setForgotError(''); }}
                    >
                      ← Back to Admin Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= 2. ADMIN & COMPANY REGISTRATION TAB ================= */}
          {activeTab === 'register' && (
            <div className="auth-tab-pane animate-fade-in">
              <div className="auth-card-title-box">
                <div className="admin-badge-pill">
                  <ShieldCheck size={14} />
                  <span>Executive Administration & Company Setup</span>
                </div>
                <h2>Register Company & Administrator</h2>
                <p>Register your company or association. The registering person is automatically granted default <strong>Administrator (ADMIN)</strong> privileges.</p>
              </div>

              {adminError && (
                <div className="auth-alert alert-danger animate-shake">
                  <AlertCircle size={17} />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminRegister} className="auth-form">
                <div className="auth-input-group">
                  <label>Company / Association Name <span className="req">*</span></label>
                  <div className="auth-input-wrapper">
                    <Building2 size={17} className="input-icon" />
                    <input 
                      type="text"
                      placeholder="e.g. Peace & Love, Adroabaa"
                      value={adminCompanyName}
                      onChange={(e) => setAdminCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-row-2">
                  <div className="auth-input-group">
                    <label>Admin First Name <span className="req">*</span></label>
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
                    <span>Registering Admin...</span>
                  ) : (
                    <>
                      <span>Register Administrator</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer-links">
                <p>
                  Already registered as an Administrator?{' '}
                  <button 
                    type="button" 
                    className="auth-link-text"
                    onClick={() => setActiveTab('login')}
                  >
                    Sign In Here
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

