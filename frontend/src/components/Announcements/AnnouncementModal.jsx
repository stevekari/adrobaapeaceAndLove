import React, { useState, useEffect } from 'react';
import { X, Megaphone, FileText, AlertCircle, Pin, User, CheckCircle2 } from 'lucide-react';
import './AnnouncementModal.css';

export default function AnnouncementModal({ 
  isOpen, 
  onClose, 
  onSave, 
  announcementToEdit, 
  members = [] 
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [pinned, setPinned] = useState(false);
  const [authorId, setAuthorId] = useState('');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (announcementToEdit) {
      setTitle(announcementToEdit.title || '');
      setContent(announcementToEdit.content || '');
      setPriority(announcementToEdit.priority || 'NORMAL');
      setPinned(Boolean(announcementToEdit.pinned));
      setAuthorId(announcementToEdit.author?.id ? announcementToEdit.author.id.toString() : '');
    } else {
      setTitle('');
      setContent('');
      setPriority('NORMAL');
      setPinned(false);
      const adminMember = members.find(m => m.role === 'ADMIN') || members[0];
      setAuthorId(adminMember?.id ? adminMember.id.toString() : '');
    }
    setErrors({});
  }, [announcementToEdit, isOpen, members]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!content.trim()) errs.content = 'Content is required';
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
        ...(announcementToEdit?.id ? { id: announcementToEdit.id } : {}),
        title: title.trim(),
        content: content.trim(),
        priority,
        pinned,
        authorId: authorId ? Number(authorId) : null
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="announcement-modal-backdrop" onClick={onClose}>
      <div className="announcement-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="modal-heading">
                {announcementToEdit ? 'Edit Notice' : 'Post Association Announcement'}
              </h2>
              <p className="modal-sub">Broadcast official updates, dues deadlines, and assembly notices.</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <label className="form-label">
              <FileText size={15} />
              <span>Announcement Title <strong className="required-star">*</strong></span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. 📢 Q3 General Assembly & Dues Clearance Update"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="modal-row-3">
            <div className="modal-form-group">
              <label className="form-label">
                <AlertCircle size={15} />
                <span>Priority</span>
              </label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority (Urgent)</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <User size={15} />
                <span>Publishing Author</span>
              </label>
              <select
                className="form-select"
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
              >
                <option value="">Secretariat</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-form-group">
              <label className="form-label">
                <Pin size={15} />
                <span>Pin to Top</span>
              </label>
              <select
                className="form-select"
                value={pinned ? 'true' : 'false'}
                onChange={(e) => setPinned(e.target.value === 'true')}
              >
                <option value="false">Standard Bulletin</option>
                <option value="true">📌 Pinned to Top</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label className="form-label">
              <FileText size={15} />
              <span>Notice Body & Instructions <strong className="required-star">*</strong></span>
            </label>
            <textarea
              className={`form-textarea ${errors.content ? 'input-error' : ''}`}
              rows="5"
              placeholder="Write the full announcement text, event details, or financial directives here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && <span className="field-error">{errors.content}</span>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={isSaving}>
              {isSaving ? 'Publishing...' : announcementToEdit ? 'Update Notice' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

