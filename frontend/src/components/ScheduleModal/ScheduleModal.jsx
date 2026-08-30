import React, { useState, useEffect } from 'react';
import { X, CalendarClock, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import './ScheduleModal.css';

export default function ScheduleModal({ isOpen, onClose, onSave, scheduleToEdit }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (scheduleToEdit) {
      setTitle(scheduleToEdit.title || '');
      setAmount(scheduleToEdit.amount ? scheduleToEdit.amount.toString() : '');
      setFrequency(scheduleToEdit.frequency || 'Monthly');
      setDueDate(scheduleToEdit.dueDate || '');
      setDescription(scheduleToEdit.description || '');
      setActive(scheduleToEdit.active !== undefined ? scheduleToEdit.active : true);
    } else {
      setTitle('');
      setAmount('');
      setFrequency('Monthly');
      setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setDescription('');
      setActive(true);
    }
    setErrors({});
  }, [scheduleToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!amount || Number(amount) <= 0) errs.amount = 'Amount must be greater than 0';
    if (!dueDate) errs.dueDate = 'Due date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSaving(true);
    try {
      await onSave({
        ...(scheduleToEdit?.id ? { id: scheduleToEdit.id } : {}),
        title: title.trim(),
        amount: Number(amount),
        frequency,
        dueDate,
        description: description.trim(),
        active
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="schedule-modal-backdrop" onClick={onClose}>
      <div className="schedule-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <CalendarClock size={20} />
            </div>
            <div>
              <h2 className="modal-heading">
                {scheduleToEdit ? 'Edit Dues Schedule' : 'Create New Dues Schedule / Levy'}
              </h2>
              <p className="modal-sub">Define contribution parameters, periodic frequency, and deadline.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Quick Category Templates */}
          {!scheduleToEdit && (
            <div className="schedule-template-presets">
              <span className="preset-label">Quick Templates:</span>
              <div className="preset-chips">
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => {
                    setTitle('Monthly Dues Levy');
                    setAmount('50.00');
                    setFrequency('Monthly');
                    setDescription('Standard monthly member welfare contributions, emergency support pool, and operational fund.');
                  }}
                >
                  💳 Monthly Dues Levy
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => {
                    setTitle('Annual Dues Levy');
                    setAmount('200.00');
                    setFrequency('Annual');
                    setDescription('Mandatory annual association membership levy supporting administration, governance, and annual conventions.');
                  }}
                >
                  🏛️ Annual Dues Levy
                </button>
                <button
                  type="button"
                  className="preset-chip"
                  onClick={() => {
                    setTitle('Donation Levy');
                    setAmount('100.00');
                    setFrequency('One-Time');
                    setDescription('Voluntary community support, project developments, emergency funds, and member donations.');
                  }}
                >
                  🎁 Donation Levy
                </button>
              </div>
            </div>
          )}

          <div className="modal-form-group">
            <label className="form-label">
              <FileText size={15} />
              <span>Schedule Title <strong className="required-star">*</strong></span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g., Monthly Dues Levy, Annual Dues Levy, Donation Levy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="modal-row-2">
            <div className="modal-form-group">
              <label className="form-label">
                <DollarSign size={15} />
                <span>Amount Per Member ($) <strong className="required-star">*</strong></span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className={`form-input ${errors.amount ? 'input-error' : ''}`}
                placeholder="50.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {errors.amount && <span className="field-error">{errors.amount}</span>}
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <CalendarClock size={15} />
                <span>Frequency</span>
              </label>
              <select
                className="form-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
                <option value="One-Time">One-Time Special Levy</option>
              </select>
            </div>
          </div>

          <div className="modal-row-2">
            <div className="modal-form-group">
              <label className="form-label">
                <Calendar size={15} />
                <span>Due Date <strong className="required-star">*</strong></span>
              </label>
              <input
                type="date"
                className={`form-input ${errors.dueDate ? 'input-error' : ''}`}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <CheckCircle2 size={15} />
                <span>Status</span>
              </label>
              <select
                className="form-select"
                value={active ? 'true' : 'false'}
                onChange={(e) => setActive(e.target.value === 'true')}
              >
                <option value="true">Active (Open for payments)</option>
                <option value="false">Inactive / Archived</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label className="form-label">
              <FileText size={15} />
              <span>Purpose & Details Description</span>
            </label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Outline what this levy funds and any special instructions for members..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isSaving}>
              {isSaving ? 'Saving...' : scheduleToEdit ? 'Update Schedule' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

