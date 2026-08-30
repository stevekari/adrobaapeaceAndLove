import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  CheckCircle2, 
  Hash, 
  KeyRound, 
  Info, 
  MapPin, 
  Building, 
  Briefcase,
  Camera,
  Trash2
} from 'lucide-react';
import './MemberModal.css';

export default function MemberModal({ isOpen, onClose, onSave, memberToEdit }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [placeOfLiving, setPlaceOfLiving] = useState('');
  const [city, setCity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [memberCode, setMemberCode] = useState('');
  const [password, setPassword] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [role, setRole] = useState('MEMBER');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (memberToEdit) {
      setFirstName(memberToEdit.firstName || '');
      setLastName(memberToEdit.lastName || '');
      setEmail(memberToEdit.email || '');
      setPhone(memberToEdit.phone || '');
      setPlaceOfLiving(memberToEdit.placeOfLiving || '');
      setCity(memberToEdit.city || '');
      setOccupation(memberToEdit.occupation || '');
      setProfilePhoto(memberToEdit.profilePhoto || '');
      setMemberCode(memberToEdit.memberCode || '');
      setPassword('');
      setJoinDate(memberToEdit.joinDate || '');
      setStatus(memberToEdit.status || 'ACTIVE');
      setRole(memberToEdit.role || 'MEMBER');
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPlaceOfLiving('');
      setCity('');
      setOccupation('');
      setProfilePhoto('');
      setMemberCode('');
      setPassword('');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setStatus('ACTIVE');
      setRole('MEMBER');
    }
    setErrors({});
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSaving(true);
    try {
      const saved = await onSave({
        ...(memberToEdit?.id ? { id: memberToEdit.id } : {}),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        placeOfLiving: placeOfLiving.trim(),
        city: city.trim(),
        occupation: occupation.trim(),
        profilePhoto: profilePhoto || null,
        ...(memberCode.trim() ? { memberCode: memberCode.trim().toUpperCase() } : {}),
        ...(password.trim() ? { password: password.trim() } : {}),
        joinDate: joinDate || new Date().toISOString().split('T')[0],
        status,
        role
      });
      onClose(saved);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="member-modal-backdrop" onClick={() => onClose()}>
      <div className="member-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <User size={20} />
            </div>
            <div>
              <h2 className="modal-heading">
                {memberToEdit ? 'Edit Member Profile' : 'Register Real Association Member'}
              </h2>
              <p className="modal-sub">Create authentic association members, attach profile photo, and generate registration passes.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={() => onClose()} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Photo Upload Row */}
          <div className="modal-photo-upload-row">
            <div className="photo-preview-circle">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Preview" className="photo-preview-img" />
              ) : (
                <div className="photo-placeholder">
                  <User size={30} />
                </div>
              )}
            </div>

            <div className="photo-upload-actions">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              <button 
                type="button" 
                className="btn-upload-photo" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={14} />
                <span>{profilePhoto ? 'Change Photo' : 'Upload Member Photo'}</span>
              </button>
              {profilePhoto && (
                <button 
                  type="button" 
                  className="btn-remove-photo" 
                  onClick={() => setProfilePhoto('')}
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              )}
              <span className="photo-hint">JPG, PNG up to 5MB</span>
            </div>
          </div>

          <div className="modal-row-2">
            <div className="modal-form-group">
              <label className="form-label">
                <User size={15} />
                <span>First Name <strong className="required-star">*</strong></span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.firstName ? 'input-error' : ''}`}
                placeholder="e.g. Kwame"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <User size={15} />
                <span>Last Name <strong className="required-star">*</strong></span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.lastName ? 'input-error' : ''}`}
                placeholder="e.g. Mensah"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="modal-row-2">
            <div className="modal-form-group">
              <label className="form-label">
                <Mail size={15} />
                <span>Email Address <strong className="required-star">*</strong></span>
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="kwame.mensah@association.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <Phone size={15} />
                <span>Phone Contact</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="+233 24 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-row-3">
            <div className="modal-form-group">
              <label className="form-label">
                <Building size={15} />
                <span>City / Town</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Kumasi, Accra"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <MapPin size={15} />
                <span>Place of Living (Address)</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ahodwo Residential"
                value={placeOfLiving}
                onChange={(e) => setPlaceOfLiving(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <Briefcase size={15} />
                <span>Profession / Occupation</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Civil Engineer"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-row-2">
            <div className="modal-form-group">
              <label className="form-label">
                <Hash size={15} />
                <span>Member Registration Code</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Auto-generated (e.g. MEM-1008)"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <KeyRound size={15} />
                <span>{memberToEdit ? 'Reset Password (Optional)' : 'Set Password (Optional)'}</span>
              </label>
              <input
                type="password"
                className="form-input"
                placeholder={memberToEdit ? 'Leave blank to keep existing' : 'Leave blank for member self-activation'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-row-3">
            <div className="modal-form-group">
              <label className="form-label">
                <Calendar size={15} />
                <span>Join Date</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <CheckCircle2 size={15} />
                <span>Status</span>
              </label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <Shield size={15} />
                <span>Role</span>
              </label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="MEMBER">MEMBER</option>
                <option value="TREASURER">TREASURER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="modal-info-hint">
            <Info size={15} />
            <span>Once registered, an official registration code pass is generated that you can print or send to the member via WhatsApp/SMS.</span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={() => onClose()}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isSaving}>
              {isSaving ? 'Saving...' : memberToEdit ? 'Update Member Profile' : 'Save Member & Generate Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
