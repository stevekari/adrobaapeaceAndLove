import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Landmark, 
  Banknote, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  Calendar,
  DollarSign,
  User,
  FileText,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './DuesForm.css';

export default function DuesForm({ 
  members = [], 
  schedules = [], 
  onSubmitPayment, 
  userRole, 
  currentMemberId, 
  onSuccessReceipt,
  preselectedScheduleId
}) {
  const [memberId, setMemberId] = useState(currentMemberId || '');
  const [scheduleId, setScheduleId] = useState(preselectedScheduleId || '');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('PAID');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Auto-sync currentMemberId
  useEffect(() => {
    if (currentMemberId) {
      setMemberId(currentMemberId.toString());
    } else if (userRole === 'MEMBER' && members.length > 0) {
      const defaultMember = members.find(m => m.role === 'MEMBER') || members[0];
      if (defaultMember) {
        setMemberId(defaultMember.id.toString());
      }
    }
  }, [currentMemberId, userRole, members]);

  // When schedule changes, autofill the amount
  useEffect(() => {
    if (scheduleId && schedules.length > 0) {
      const selected = schedules.find(s => s.id.toString() === scheduleId.toString());
      if (selected && selected.amount) {
        setAmountPaid(selected.amount.toString());
      }
    }
  }, [scheduleId, schedules]);

  // If preselected schedule changes
  useEffect(() => {
    if (preselectedScheduleId) {
      setScheduleId(preselectedScheduleId.toString());
    }
  }, [preselectedScheduleId]);

  const standardLevies = [
    { id: 1, title: 'Monthly Dues Levy', amount: 50.00, frequency: 'Monthly' },
    { id: 2, title: 'Annual Dues Levy', amount: 200.00, frequency: 'Annual' },
    { id: 3, title: 'Donation Levy', amount: 100.00, frequency: 'One-Time' }
  ];

  const availableSchedules = schedules && schedules.length > 0 ? schedules : standardLevies;
  const selectedSchedule = availableSchedules.find(s => s.id.toString() === scheduleId.toString());
  const selectedMember = members.find(m => m.id.toString() === memberId.toString());

  const paymentMethods = [
    { id: 'Mobile Money', label: 'Mobile Money', icon: Smartphone, desc: 'MTN MoMo, Telecel Cash, AT' },
    { id: 'Credit Card', label: 'Card Payment', icon: CreditCard, desc: 'Visa, Mastercard, Verve' },
    { id: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark, desc: 'Direct wire / ACH / EFT' },
    { id: 'Cash', label: 'Cash at Office', icon: Banknote, desc: 'Handed to Secretariat' },
  ];

  const validate = () => {
    const errors = {};
    if (!memberId) errors.memberId = 'Please select a member';
    if (!scheduleId) errors.scheduleId = 'Please select a dues purpose';
    if (!amountPaid || Number(amountPaid) <= 0) errors.amountPaid = 'Please enter a valid amount greater than 0';
    if (!paymentMethod) errors.paymentMethod = 'Please select a payment method';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    try {
      const numScheduleId = (scheduleId && !isNaN(Number(scheduleId))) ? Number(scheduleId) : null;
      const purposeTitle = selectedSchedule?.title || 'Monthly Dues Levy';
      const payload = {
        memberId: Number(memberId),
        scheduleId: numScheduleId,
        duesPurpose: purposeTitle,
        amountPaid: Number(amountPaid),
        paymentMethod,
        paymentDate: paymentDate ? `${paymentDate}T12:00:00` : new Date().toISOString(),
        notes: notes.trim(),
        status
      };

      const result = await onSubmitPayment(payload);

      // Trigger Confetti Celebration Animation!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#3b82f6']
      });

      // Reset form
      setNotes('');
      if (userRole === 'ADMIN') {
        setMemberId('');
      }

      if (onSuccessReceipt && result) {
        onSuccessReceipt(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dues-form-container animate-fade-in">
      <div className="dues-form-grid">
        {/* Left Form Column */}
        <div className="dues-form-card">
          <div className="form-card-header">
            <div className="form-badge">
              <Sparkles size={16} />
              <span>Dues Collection Portal</span>
            </div>
            <h2 className="form-title">
              {userRole === 'ADMIN' ? 'Record Association Dues Payment' : 'Pay Your Association Dues'}
            </h2>
            <p className="form-subtitle">
              {userRole === 'ADMIN' 
                ? 'Log member contributions, allocate to specific funds, and issue instant verified receipts.'
                : 'Fulfill your membership obligations securely and receive an official electronic receipt.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="dues-actual-form">
            {/* Member Selection */}
            <div className="form-group">
              <label className="form-label">
                <User size={15} />
                <span>Association Member <strong className="required-star">*</strong></span>
              </label>
              {userRole === 'ADMIN' ? (
                <div className="select-wrapper">
                  <select
                    className={`form-select ${formErrors.memberId ? 'input-error' : ''}`}
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                  >
                    <option value="">-- Choose Member from Directory --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.email}) • {m.role}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="member-self-display">
                  <div className="self-avatar">
                    {selectedMember ? `${selectedMember.firstName[0]}${selectedMember.lastName[0]}` : 'ME'}
                  </div>
                  <div className="self-details">
                    <span className="self-name">
                      {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : 'Current Member'}
                    </span>
                    <span className="self-email">{selectedMember?.email}</span>
                  </div>
                </div>
              )}
              {formErrors.memberId && <span className="field-error">{formErrors.memberId}</span>}
            </div>

            {/* Dues Schedule & Purpose Selection */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">
                  <Calendar size={15} />
                  <span>Dues Purpose & Schedule <strong className="required-star">*</strong></span>
                </label>
              </div>

              {/* Quick Purpose Selection Chips */}
              <div className="dues-purpose-quick-pills">
                <button
                  type="button"
                  className={`purpose-pill ${selectedSchedule?.title?.toLowerCase().includes('monthly') ? 'active' : ''}`}
                  onClick={() => {
                    const found = availableSchedules.find(s => s.title.toLowerCase().includes('monthly'));
                    if (found) {
                      setScheduleId(found.id.toString());
                      setAmountPaid(found.amount.toString());
                    }
                  }}
                >
                  <span className="pill-emoji">💳</span>
                  <span className="pill-text">Monthly Dues Levy</span>
                </button>

                <button
                  type="button"
                  className={`purpose-pill ${selectedSchedule?.title?.toLowerCase().includes('annual') ? 'active' : ''}`}
                  onClick={() => {
                    const found = availableSchedules.find(s => s.title.toLowerCase().includes('annual'));
                    if (found) {
                      setScheduleId(found.id.toString());
                      setAmountPaid(found.amount.toString());
                    }
                  }}
                >
                  <span className="pill-emoji">🏛️</span>
                  <span className="pill-text">Annual Dues Levy</span>
                </button>

                <button
                  type="button"
                  className={`purpose-pill ${selectedSchedule?.title?.toLowerCase().includes('donation') ? 'active' : ''}`}
                  onClick={() => {
                    const found = availableSchedules.find(s => s.title.toLowerCase().includes('donation'));
                    if (found) {
                      setScheduleId(found.id.toString());
                      setAmountPaid(found.amount.toString());
                    }
                  }}
                >
                  <span className="pill-emoji">🎁</span>
                  <span className="pill-text">Donation Levy</span>
                </button>
              </div>

              <div className="select-wrapper">
                <select
                  className={`form-select ${formErrors.scheduleId ? 'input-error' : ''}`}
                  value={scheduleId}
                  onChange={(e) => setScheduleId(e.target.value)}
                >
                  <option value="">-- Select Dues Purpose / Levy --</option>
                  {availableSchedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title.includes('Monthly') ? '💳 ' : s.title.includes('Annual') ? '🏛️ ' : s.title.includes('Donation') ? '🎁 ' : '📌 '}
                      {s.title} — ${Number(s.amount).toFixed(2)} ({s.frequency})
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.scheduleId && <span className="field-error">{formErrors.scheduleId}</span>}
            </div>

            {/* Amount Field with Quick Selection */}
            <div className="form-group">
              <label className="form-label">
                <DollarSign size={15} />
                <span>Amount to Pay ($ USD) <strong className="required-star">*</strong></span>
              </label>
              <div className="amount-input-wrapper">
                <span className="currency-prefix">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input amount-input ${formErrors.amountPaid ? 'input-error' : ''}`}
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              {selectedSchedule && (
                <div className="amount-quick-tags">
                  <button 
                    type="button" 
                    className="quick-tag active"
                    onClick={() => setAmountPaid(selectedSchedule.amount.toString())}
                  >
                    Full Due: ${Number(selectedSchedule.amount).toFixed(2)}
                  </button>
                  <button 
                    type="button" 
                    className="quick-tag"
                    onClick={() => setAmountPaid((Number(selectedSchedule.amount) * 2).toFixed(2))}
                  >
                    2x Periods: ${(Number(selectedSchedule.amount) * 2).toFixed(2)}
                  </button>
                </div>
              )}
              {formErrors.amountPaid && <span className="field-error">{formErrors.amountPaid}</span>}
            </div>

            {/* Payment Method Cards */}
            <div className="form-group">
              <label className="form-label">
                <CreditCard size={15} />
                <span>Payment Channel <strong className="required-star">*</strong></span>
              </label>
              <div className="payment-methods-grid">
                {paymentMethods.map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <div
                      key={m.id}
                      className={`method-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(m.id)}
                    >
                      <div className="method-header">
                        <div className="method-icon-box">
                          <Icon size={18} />
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="method-check" />}
                      </div>
                      <span className="method-name">{m.label}</span>
                      <span className="method-desc">{m.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Date & Notes */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  <Clock size={15} />
                  <span>Payment Date</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              {userRole === 'ADMIN' && (
                <div className="form-group">
                  <label className="form-label">
                    <CheckCircle2 size={15} />
                    <span>Transaction Status</span>
                  </label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="PAID">PAID (Clearance Issued)</option>
                    <option value="PENDING">PENDING (Verification Required)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={15} />
                <span>Transaction Reference / Notes</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., MoMo Trans ID 01928381 or Secretariat Receipt Book #4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-payment-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading-spinner">Processing transaction...</span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>{userRole === 'ADMIN' ? 'Record Dues & Generate Official Receipt' : 'Submit Dues Payment'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Dynamic Summary & Verification Card */}
        <div className="dues-preview-card">
          <div className="preview-header">
            <h3 className="preview-title">Real-Time Dues Summary</h3>
            <span className="live-pill">Live Preview</span>
          </div>

          <div className="preview-schedule-box">
            {selectedSchedule ? (
              <>
                <div className="preview-schedule-title">{selectedSchedule.title}</div>
                <div className="preview-schedule-desc">{selectedSchedule.description}</div>
                <div className="preview-schedule-meta">
                  <div className="meta-item">
                    <span className="meta-k">Billing Frequency</span>
                    <span className="meta-v">{selectedSchedule.frequency}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-k">Due Date</span>
                    <span className="meta-v">{selectedSchedule.dueDate}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="preview-empty">
                <AlertCircle size={32} />
                <p>Select a dues schedule on the left to inspect levy terms and target dues.</p>
              </div>
            )}
          </div>

          <div className="preview-calculation">
            <div className="calc-row">
              <span>Standard Contribution Rate</span>
              <span>${selectedSchedule ? Number(selectedSchedule.amount).toFixed(2) : '0.00'}</span>
            </div>
            <div className="calc-row">
              <span>Payer Name</span>
              <span>{selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : 'Not Selected'}</span>
            </div>
            <div className="calc-row">
              <span>Channel</span>
              <span>{paymentMethod}</span>
            </div>
            <div className="calc-divider"></div>
            <div className="calc-row calc-total">
              <span>Payable Amount</span>
              <span className="total-amount-green">${Number(amountPaid || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="preview-security-note">
            <Sparkles size={16} />
            <span>Every logged transaction automatically produces a tamper-proof receipt with unique tracking ID.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

