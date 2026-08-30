import React, { useState } from 'react';
import { 
  Building2, 
  Hash, 
  Copy, 
  CheckCircle2, 
  Printer, 
  Share2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import './MemberInviteModal.css';

export default function MemberInviteModal({ member, isOpen, onClose, onShowToast }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !member) return null;

  const inviteMessage = `🏛️ *Welcome to the Association Dues Portal!*
Hello ${member.firstName} ${member.lastName}, you have been enrolled in the Association Directory.

🔑 *Your Member Registration Code:* \`${member.memberCode}\`

*Steps to activate your portal account:*
1. Open the Dues Portal: ${window.location.origin}
2. Click the *"Register with Code"* tab
3. Enter your code *${member.memberCode}* and create your personal password.

You can then view your dues levies, pay with Mobile Money, and download official receipts!`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
    if (onShowToast) {
      onShowToast('Invite Copied!', 'Shareable activation message copied to clipboard.', 'success');
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invite-modal-backdrop animate-fade-in">
      <div className="invite-modal-container">
        {/* Top Header */}
        <div className="invite-modal-header">
          <div className="invite-header-title">
            <Sparkles size={20} className="sparkle-amber" />
            <h3>Member Enrolled Successfully!</h3>
          </div>
          <button className="invite-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Printable Pass Container */}
        <div className="invite-pass-card" id="printable-member-pass">
          <div className="pass-brand-banner">
            <div className="pass-brand-info">
              <Building2 size={24} className="pass-brand-icon" />
              <div>
                <h4 className="pass-brand-title">ASSOCIATION DUES PORTAL</h4>
                <span className="pass-brand-sub">Official Member Enrollment & Activation Pass</span>
              </div>
            </div>
            <div className="pass-verified-badge">
              <ShieldCheck size={16} />
              <span>Official</span>
            </div>
          </div>

          <div className="pass-member-profile">
            <div className="pass-avatar">
              {member.firstName ? member.firstName[0] : 'M'}
            </div>
            <div className="pass-name-details">
              <h2 className="pass-member-name">{member.firstName} {member.lastName}</h2>
              <span className="pass-member-meta">
                {member.email} • {member.phone || 'No phone'}
              </span>
              {member.city && (
                <span className="pass-member-location">
                  📍 {member.placeOfLiving ? `${member.placeOfLiving}, ` : ''}{member.city}
                </span>
              )}
            </div>
          </div>

          {/* Registration Code Showcase */}
          <div className="pass-code-showcase">
            <span className="code-label">MEMBER REGISTRATION CODE</span>
            <div className="code-display-box">
              <span className="code-value">{member.memberCode}</span>
            </div>
            <p className="code-instruction-hint">
              Give this code to the member so they can activate their account and create their password.
            </p>
          </div>

          {/* 3 Step Activation Guide */}
          <div className="pass-steps-box">
            <h5 className="steps-title">3 Simple Steps for the Member:</h5>
            <div className="steps-list">
              <div className="step-item">
                <span className="step-num">1</span>
                <span className="step-text">Go to the portal & click <strong>"Register with Code"</strong></span>
              </div>
              <div className="step-item">
                <span className="step-num">2</span>
                <span className="step-text">Type code <strong>{member.memberCode}</strong> to verify identity</span>
              </div>
              <div className="step-item">
                <span className="step-num">3</span>
                <span className="step-text">Create password to sign in & pay dues anytime!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="invite-modal-footer">
          <button className="invite-action-btn btn-share" onClick={handleCopyInvite}>
            {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy WhatsApp / SMS Invite'}</span>
          </button>

          <button className="invite-action-btn btn-print" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Pass</span>
          </button>

          <button className="invite-action-btn btn-done" onClick={onClose}>
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}

