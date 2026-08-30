import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  DollarSign, 
  Calendar, 
  Users, 
  CheckCircle2, 
  CreditCard, 
  Edit3, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import ScheduleModal from '../ScheduleModal/ScheduleModal';
import './DuesSchedules.css';

export default function DuesSchedules({ 
  schedules = [], 
  progressList = [], 
  userRole, 
  onSaveSchedule, 
  onDeleteSchedule, 
  onSelectPaySchedule,
  onShowToast 
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState(null);

  const handleCreateNew = () => {
    setScheduleToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (sch) => {
    setScheduleToEdit(sch);
    setModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the schedule: "${title}"?`)) {
      try {
        await onDeleteSchedule(id);
        if (onShowToast) {
          onShowToast('Deleted', `Dues schedule "${title}" was removed`, 'info');
        }
      } catch (err) {
        if (onShowToast) {
          onShowToast('Error', err.message || 'Could not delete schedule', 'error');
        }
      }
    }
  };

  return (
    <div className="dues-schedules-view animate-fade-in">
      {/* Header Banner */}
      <div className="schedules-header-card">
        <div className="schedules-title-block">
          <div className="header-badge">
            <CalendarClock size={16} />
            <span>Association Dues Tariffs</span>
          </div>
          <h1 className="schedules-heading">Dues Schedules & Levies Portfolio</h1>
          <p className="schedules-sub">
            Establish periodic welfare contributions, annual membership fees, and special development levies.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button className="create-schedule-btn" onClick={handleCreateNew}>
            <Plus size={18} />
            <span>Create New Dues Schedule</span>
          </button>
        )}
      </div>

      {/* Grid of Schedules */}
      <div className="schedules-cards-grid">
        {schedules.length === 0 ? (
          <div className="empty-schedules-card">
            <AlertCircle size={40} />
            <h3>No Dues Schedules Available</h3>
            <p>Create your first dues schedule to start tracking member payments and welfare funds.</p>
            {userRole === 'ADMIN' && (
              <button className="create-schedule-btn" onClick={handleCreateNew}>
                <Plus size={16} />
                <span>Create First Schedule</span>
              </button>
            )}
          </div>
        ) : (
          schedules.map((sch) => {
            const prog = progressList.find((p) => p.id === sch.id) || {};
            const pct = prog.percentage || 0;
            const collected = prog.totalCollected || 0;
            const target = prog.targetAmount || 0;
            const paidMembers = prog.paidMembersCount || 0;
            const totalMembers = prog.totalMembersCount || 1;

            return (
              <div key={sch.id} className="schedule-detail-card">
                <div className="schedule-card-top">
                  <div className="schedule-meta-left">
                    <span className="freq-badge">{sch.frequency}</span>
                    <span className={`active-pill ${sch.active ? 'pill-active' : 'pill-inactive'}`}>
                      {sch.active ? 'Active' : 'Archived'}
                    </span>
                  </div>

                  {userRole === 'ADMIN' && (
                    <div className="schedule-admin-actions">
                      <button 
                        className="icon-action-btn edit-btn" 
                        onClick={() => handleEdit(sch)}
                        title="Edit Schedule"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        className="icon-action-btn delete-btn" 
                        onClick={() => handleDelete(sch.id, sch.title)}
                        title="Delete Schedule"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="schedule-info-main">
                  <h3 className="schedule-title-text">{sch.title}</h3>
                  <p className="schedule-description-text">
                    {sch.description || 'General operational dues for active association members.'}
                  </p>
                </div>

                <div className="schedule-financial-box">
                  <div className="fin-row">
                    <span className="fin-label">Levy Per Member:</span>
                    <span className="fin-amount">${Number(sch.amount).toFixed(2)}</span>
                  </div>
                  <div className="fin-row">
                    <span className="fin-label">Fulfillment Deadline:</span>
                    <span className="fin-date">{sch.dueDate}</span>
                  </div>
                </div>

                {/* Progress Towards Goal */}
                <div className="schedule-progress-container">
                  <div className="progress-label-row">
                    <span className="prog-title">Collected vs Target</span>
                    <span className="prog-numbers">
                      ${Number(collected).toLocaleString()} / ${Number(target).toLocaleString()}
                    </span>
                  </div>

                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(100, pct)}%` }} 
                    />
                  </div>

                  <div className="progress-sub-info">
                    <span className="members-paid-count">
                      <Users size={13} />
                      <span>{paidMembers} of {totalMembers} members contributed</span>
                    </span>
                    <span className="pct-text">{pct}%</span>
                  </div>
                </div>

                {/* Footer Pay Trigger */}
                <div className="schedule-card-footer">
                  <button 
                    className="pay-schedule-action-btn"
                    onClick={() => onSelectPaySchedule(sch.id)}
                  >
                    <CreditCard size={16} />
                    <span>{userRole === 'ADMIN' ? 'Record Dues for this Levy' : 'Pay This Levy Online'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <ScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveSchedule}
        scheduleToEdit={scheduleToEdit}
      />
    </div>
  );
}

