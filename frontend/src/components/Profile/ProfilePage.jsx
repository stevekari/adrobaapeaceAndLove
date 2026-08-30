import React, { useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  Hash, 
  Calendar, 
  Shield, 
  Lock, 
  Save, 
  CheckCircle2, 
  Copy, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';
import './ProfilePage.css';

export default function ProfilePage({ currentUser, onUpdateCurrentUser, onShowToast }) {
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    placeOfLiving: currentUser?.placeOfLiving || '',
    city: currentUser?.city || '',
    occupation: currentUser?.occupation || '',
    profilePhoto: currentUser?.profilePhoto || null,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Photo Upload Handler (converts to Base64)
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        if (onShowToast) onShowToast('File Notice', 'Photo size must be under 3MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePhoto: null }));
  };

  const handleCopyCode = () => {
    if (currentUser?.memberCode) {
      navigator.clipboard.writeText(currentUser.memberCode);
      setIsCopied(true);
      if (onShowToast) onShowToast('Code Copied!', `${currentUser.memberCode} copied to clipboard`, 'success');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      if (onShowToast) onShowToast('Missing Fields', 'First name, last name, and email are required.', 'error');
      return;
    }

    if (passwordData.newPassword) {
      if (passwordData.newPassword.length < 6) {
        if (onShowToast) onShowToast('Security Notice', 'New password must be at least 6 characters.', 'error');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        if (onShowToast) onShowToast('Password Mismatch', 'New passwords do not match.', 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        ...(passwordData.newPassword ? { password: passwordData.newPassword } : {})
      };

      const updated = await api.updateProfile(currentUser.id, payload);
      
      // Update local storage and app state
      const updatedUser = {
        ...currentUser,
        ...updated,
      };
      localStorage.setItem('duesportal_user', JSON.stringify(updatedUser));
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedUser);
      }

      setPasswordData({ newPassword: '', confirmPassword: '' });
      if (onShowToast) {
        onShowToast('Profile Updated', 'Your profile details and preferences have been saved successfully!', 'success');
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast('Update Failed', err.message || 'Could not update profile', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    const f = formData.firstName ? formData.firstName[0] : '';
    const l = formData.lastName ? formData.lastName[0] : '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  return (
    <div className="profile-page-container animate-fade-in">
      {/* Top Banner Card */}
      <div className="profile-header-card">
        <div className="profile-hero">
          {/* Avatar Upload Area */}
          <div className="avatar-upload-box">
            {formData.profilePhoto ? (
              <img src={formData.profilePhoto} alt="Profile" className="profile-photo-img" />
            ) : (
              <div className={`profile-avatar-fallback ${currentUser?.role?.toLowerCase() || 'member'}`}>
                {getInitials()}
              </div>
            )}

            <button 
              type="button" 
              className="photo-edit-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Upload profile photo"
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handlePhotoSelect}
            />

            {formData.profilePhoto && (
              <button 
                type="button" 
                className="photo-remove-btn" 
                onClick={handleRemovePhoto}
                title="Remove photo"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <div className="profile-hero-info">
            <div className="hero-name-row">
              <h1 className="hero-fullname">{formData.firstName} {formData.lastName}</h1>
              <span className={`hero-role-badge role-${currentUser?.role?.toLowerCase() || 'member'}`}>
                {currentUser?.role === 'ADMIN' ? 'Administrator 🛡️' : 
                 currentUser?.role === 'TREASURER' ? 'Treasurer 💳' : 'Association Member 👤'}
              </span>
            </div>

            <div className="hero-meta-row">
              <div className="meta-chip">
                <Hash size={13} />
                <span>Code: <strong>{currentUser?.memberCode || 'N/A'}</strong></span>
                <button type="button" className="copy-code-btn" onClick={handleCopyCode}>
                  {isCopied ? <CheckCircle2 size={13} color="#10b981" /> : <Copy size={13} />}
                </button>
              </div>

              {formData.city && (
                <div className="meta-chip">
                  <MapPin size={13} />
                  <span>{formData.city}</span>
                </div>
              )}

              {formData.occupation && (
                <div className="meta-chip">
                  <Briefcase size={13} />
                  <span>{formData.occupation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="profile-form-grid">
        {/* Left Card: Personal & Living Information */}
        <div className="profile-section-card">
          <div className="section-card-title">
            <User size={18} className="icon-emerald" />
            <h3>Personal & Contact Information</h3>
          </div>

          <div className="form-two-col">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                name="email"
                className="form-input with-icon"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Mobile Money)</label>
            <div className="input-with-icon">
              <Phone size={16} className="input-icon" />
              <input
                type="tel"
                name="phone"
                placeholder="+233 24 123 4567"
                className="form-input with-icon"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-two-col">
            <div className="form-group">
              <label className="form-label">City / Town of Residence</label>
              <div className="input-with-icon">
                <Building size={16} className="input-icon" />
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Accra, Kumasi, London"
                  className="form-input with-icon"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Profession / Occupation</label>
              <div className="input-with-icon">
                <Briefcase size={16} className="input-icon" />
                <input
                  type="text"
                  name="occupation"
                  placeholder="e.g. Civil Engineer, Accountant"
                  className="form-input with-icon"
                  value={formData.occupation}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Place of Living / Residence Address</label>
            <div className="input-with-icon">
              <MapPin size={16} className="input-icon" />
              <input
                type="text"
                name="placeOfLiving"
                placeholder="House No. 14, Airport Residential / Ahodwo Road"
                className="form-input with-icon"
                value={formData.placeOfLiving}
                onChange={handleInputChange}
              />
            </div>
            <span className="field-hint">Your physical residence helps the association send correspondence and welfare aid.</span>
          </div>
        </div>

        {/* Right Card: Security & Membership Settings */}
        <div className="profile-section-card">
          <div className="section-card-title">
            <Shield size={18} className="icon-sky" />
            <h3>Membership & Security</h3>
          </div>

          <div className="membership-info-box">
            <div className="info-row">
              <span className="info-label">Member Registration Code</span>
              <span className="info-code">{currentUser?.memberCode || 'MEM-1001'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Join Date</span>
              <span className="info-val">{currentUser?.joinDate || 'Jan 15, 2023'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Membership Status</span>
              <span className="status-badge-active">Active Member</span>
            </div>
          </div>

          <div className="password-update-section">
            <div className="password-heading">
              <Lock size={15} />
              <span>Change Account Password (Optional)</span>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password (min. 6 chars)"
                className="form-input"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat new password"
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          <div className="profile-save-action">
            <button 
              type="submit" 
              className="save-profile-btn"
              disabled={isSaving}
            >
              <Save size={17} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

