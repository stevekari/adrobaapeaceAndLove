import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Pin, 
  Calendar, 
  User, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Sparkles,
  Info
} from 'lucide-react';
import AnnouncementModal from './AnnouncementModal';
import './AnnouncementBoard.css';

export default function AnnouncementBoard({ 
  announcements = [], 
  members = [], 
  userRole, 
  onSaveAnnouncement, 
  onDeleteAnnouncement,
  onShowToast 
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');

  const filteredAnnouncements = announcements.filter((a) => {
    if (filterPriority === 'ALL') return true;
    return a.priority === filterPriority;
  });

  const handleCreateNew = () => {
    setAnnouncementToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (a) => {
    setAnnouncementToEdit(a);
    setModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete the notice "${title}"?`)) {
      try {
        await onDeleteAnnouncement(id);
        if (onShowToast) {
          onShowToast('Removed', 'Announcement deleted successfully', 'info');
        }
      } catch (err) {
        if (onShowToast) {
          onShowToast('Error', err.message || 'Could not delete notice', 'error');
        }
      }
    }
  };

  return (
    <div className="announcements-view animate-fade-in">
      {/* Top Header Card */}
      <div className="announcements-header-card">
        <div className="announcements-title-row">
          <div>
            <div className="header-badge">
              <Megaphone size={16} />
              <span>Official Notice Board</span>
            </div>
            <h1 className="announcements-page-title">Association Bulletins & Notices</h1>
            <p className="announcements-page-sub">
              Stay updated on upcoming general meetings, dues deadlines, project milestones, and welfare communications.
            </p>
          </div>

          {userRole === 'ADMIN' && (
            <button className="create-notice-btn" onClick={handleCreateNew}>
              <Plus size={18} />
              <span>Post New Notice</span>
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="announcement-filter-row">
          <div className="filter-pill-group">
            <button 
              className={`filter-pill-btn ${filterPriority === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterPriority('ALL')}
            >
              All Bulletins ({announcements.length})
            </button>
            <button 
              className={`filter-pill-btn ${filterPriority === 'HIGH' ? 'active' : ''}`}
              onClick={() => setFilterPriority('HIGH')}
            >
              🔥 Urgent & High Priority
            </button>
            <button 
              className={`filter-pill-btn ${filterPriority === 'NORMAL' ? 'active' : ''}`}
              onClick={() => setFilterPriority('NORMAL')}
            >
              Standard Notices
            </button>
          </div>
        </div>
      </div>

      {/* Bulletins Feed */}
      <div className="announcements-feed">
        {filteredAnnouncements.length === 0 ? (
          <div className="empty-announcements-card">
            <Info size={36} />
            <h3>No Announcements Posted</h3>
            <p>No notices currently match your filter.</p>
          </div>
        ) : (
          filteredAnnouncements.map((a) => {
            const author = a.author || {};
            const isHigh = a.priority === 'HIGH';

            return (
              <div 
                key={a.id} 
                className={`announcement-full-card ${a.pinned ? 'card-pinned' : ''} ${isHigh ? 'priority-urgent' : ''}`}
              >
                <div className="card-top-tags">
                  <div className="tags-left">
                    {a.pinned && (
                      <span className="pinned-badge">
                        <Pin size={12} />
                        <span>Pinned Notice</span>
                      </span>
                    )}
                    <span className={`priority-tag tag-${a.priority?.toLowerCase() || 'normal'}`}>
                      {a.priority === 'HIGH' && '🔥 Urgent'}
                      {a.priority === 'NORMAL' && 'Standard Bulletin'}
                      {a.priority === 'LOW' && 'Informational'}
                    </span>
                  </div>

                  {userRole === 'ADMIN' && (
                    <div className="card-admin-actions">
                      <button 
                        className="admin-mini-btn"
                        onClick={() => handleEdit(a)}
                        title="Edit notice"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        className="admin-mini-btn delete-btn"
                        onClick={() => handleDelete(a.id, a.title)}
                        title="Delete notice"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <h2 className="announcement-title">{a.title}</h2>

                <div className="announcement-body-text">
                  {a.content}
                </div>

                <div className="announcement-footer-meta">
                  <div className="author-info-chip">
                    <div className="author-avatar-mini">
                      {author.firstName ? author.firstName[0] : 'S'}
                    </div>
                    <span>
                      Posted by <strong>{author.firstName ? `${author.firstName} ${author.lastName}` : 'Secretariat'}</strong> {author.role ? `(${author.role})` : ''}
                    </span>
                  </div>

                  <div className="publish-date-chip">
                    <Calendar size={13} />
                    <span>
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <AnnouncementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSaveAnnouncement}
        announcementToEdit={announcementToEdit}
        members={members}
      />
    </div>
  );
}

