import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Receipt, 
  Edit3, 
  Trash2, 
  CreditCard,
  LayoutGrid,
  List,
  Copy,
  Check,
  Hash,
  KeyRound,
  ShieldCheck,
  Clock,
  MapPin,
  Sparkles,
  QrCode,
  Eraser,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import MemberModal from './MemberModal';
import MemberDetailModal from './MemberDetailModal';
import MemberInviteModal from './MemberInviteModal';
import './MemberList.css';

export default function MemberList({ 
  members = [], 
  userRole, 
  currentUser,
  onSaveMember, 
  onDeleteMember, 
  onCleanSlate,
  onSelectPayMember,
  onViewReceipt,
  onShowToast 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [copiedCode, setCopiedCode] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  
  // Modals
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [selectedDetailMemberId, setSelectedDetailMemberId] = useState(null);
  const [inviteModalMember, setInviteModalMember] = useState(null);

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
    const email = (m.email || '').toLowerCase();
    const phone = (m.phone || '').toLowerCase();
    const city = (m.city || '').toLowerCase();
    const code = (m.memberCode || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query) || phone.includes(query) || code.includes(query) || city.includes(query);
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateNew = () => {
    setMemberToEdit(null);
    setMemberModalOpen(true);
  };

  const handleEdit = (m) => {
    setMemberToEdit(m);
    setMemberModalOpen(true);
  };

  const handleSaveWrapper = async (memberData) => {
    const isNew = !memberData.id;
    const res = await onSaveMember(memberData);
    if (isNew && res) {
      setInviteModalMember(res);
    }
    return res;
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove member "${name}"?`)) {
      try {
        await onDeleteMember(id);
        if (onShowToast) {
          onShowToast('Removed', `Member "${name}" has been removed`, 'info');
        }
      } catch (err) {
        if (onShowToast) {
          onShowToast('Error', err.message || 'Could not delete member', 'error');
        }
      }
    }
  };

  const handleCleanSlateClick = async () => {
    if (window.confirm('Do you want to clear the sample demo members and start fresh with your real association records?\n\n(Your active administrator account will be preserved).')) {
      setIsClearing(true);
      try {
        if (onCleanSlate) {
          await onCleanSlate();
        }
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleCopyCode = (code, memberName, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onShowToast) {
      onShowToast('Code Copied', `Registration code ${code} for ${memberName} copied to clipboard!`, 'success');
    }
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="member-list-view animate-fade-in">
      {/* Top Header Card */}
      <div className="members-header-card">
        <div className="members-title-row">
          <div>
            <div className="header-badge">
              <Users size={16} />
              <span>Peace & Love, Adroabaa Registry</span>
            </div>
            <h1 className="members-page-title">Peace & Love, Adroabaa Member Directory</h1>
            <p className="members-page-sub">
              Manage authentic member records, locations, registration codes, photo profiles, and dues ledgers.
            </p>
          </div>

          {userRole === 'ADMIN' && (
            <div className="header-actions-right">
              {members.length > 1 && (
                <button 
                  className="btn-clean-slate" 
                  onClick={handleCleanSlateClick} 
                  disabled={isClearing}
                  title="Purge demo placeholder records to start a 100% clean real registry"
                >
                  <Eraser size={16} />
                  <span>{isClearing ? 'Clearing...' : 'Clear Demo Records'}</span>
                </button>
              )}
              <button className="create-member-btn" onClick={handleCreateNew}>
                <UserPlus size={18} />
                <span>Register Real Member</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="members-controls-row">
          <div className="member-search-box">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search by real name, email, city, code (MEM-...), or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="member-filter-group">
            <select
              className="member-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="TREASURER">Treasurer</option>
              <option value="MEMBER">General Member</option>
            </select>

            <select
              className="member-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>

            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="members-count-pill">
          Showing <strong>{filteredMembers.length}</strong> of {members.length} registered members
        </div>
      </div>

      {/* Grid Mode */}
      {viewMode === 'grid' ? (
        <div className="members-grid-layout">
          {filteredMembers.length === 0 ? (
            <div className="empty-members-box">
              <Users size={44} />
              <h3>No Members Found</h3>
              <p>You can create authentic member records using the button above.</p>
              {userRole === 'ADMIN' && (
                <button className="btn-add-empty-state" onClick={handleCreateNew}>
                  <UserPlus size={16} />
                  <span>Register First Member</span>
                </button>
              )}
            </div>
          ) : (
            filteredMembers.map((m) => (
              <div key={m.id} className="member-profile-card">
                <div className="card-top-action-row">
                  <div className="card-badges-left">
                    <span className={`status-pill pill-${m.status?.toLowerCase() || 'active'}`}>
                      {m.status || 'ACTIVE'}
                    </span>
                    {m.isPasswordSet ? (
                      <span className="auth-status-tag set" title="Member has created password">
                        <KeyRound size={11} />
                        Password Set
                      </span>
                    ) : (
                      <span className="auth-status-tag pending" title="Pending registration with code">
                        <Clock size={11} />
                        Pending Reg
                      </span>
                    )}
                  </div>

                  <div className="card-action-icons">
                    <button
                      className="member-icon-btn pass-btn"
                      onClick={() => setInviteModalMember(m)}
                      title="View Member Activation Pass & Invite Slip"
                    >
                      <QrCode size={14} />
                    </button>
                    {userRole === 'ADMIN' && (
                      <>
                        <button
                          className="member-icon-btn"
                          onClick={() => handleEdit(m)}
                          title="Edit member profile"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="member-icon-btn delete"
                          onClick={() => handleDelete(m.id, `${m.firstName} ${m.lastName}`)}
                          title="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="member-card-main-info">
                  {m.profilePhoto ? (
                    <img src={m.profilePhoto} alt={m.firstName} className="card-avatar-photo" />
                  ) : (
                    <div className="card-avatar-circle">
                      {m.firstName ? `${m.firstName[0]}${m.lastName ? m.lastName[0] : ''}` : 'U'}
                    </div>
                  )}
                  <h3 className="card-member-name">{m.firstName} {m.lastName}</h3>
                  <div className="card-meta-line">
                    <span className="card-member-role">{m.role}</span>
                    {m.occupation && <span className="card-member-occ">• {m.occupation}</span>}
                  </div>
                  {m.city && (
                    <span className="card-member-city">📍 {m.city}</span>
                  )}
                </div>

                {/* Member Registration Code Box */}
                {m.memberCode && (
                  <div className="card-code-banner">
                    <div className="code-text-group">
                      <span className="code-label">Registration Code:</span>
                      <span className="code-value">{m.memberCode}</span>
                    </div>
                    <button 
                      className="copy-code-btn"
                      onClick={(e) => handleCopyCode(m.memberCode, `${m.firstName} ${m.lastName}`, e)}
                      title="Copy registration code to send to member"
                    >
                      {copiedCode === m.memberCode ? (
                        <>
                          <Check size={13} className="check-icon" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="card-contact-box">
                  <div className="contact-item">
                    <Mail size={14} />
                    <span className="truncate">{m.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={14} />
                    <span>{m.phone || 'No phone recorded'}</span>
                  </div>
                  {m.placeOfLiving && (
                    <div className="contact-item">
                      <MapPin size={14} />
                      <span className="truncate">{m.placeOfLiving}</span>
                    </div>
                  )}
                  <div className="contact-item">
                    <Calendar size={14} />
                    <span>Joined: {m.joinDate || '2024'}</span>
                  </div>
                </div>

                <div className="card-button-row">
                  <button
                    className="card-btn btn-view-ledger"
                    onClick={() => setSelectedDetailMemberId(m.id)}
                  >
                    <Receipt size={14} />
                    <span>Ledger</span>
                  </button>

                  <button
                    className="card-btn btn-record-pay"
                    onClick={() => onSelectPayMember(m.id)}
                  >
                    <CreditCard size={14} />
                    <span>{userRole === 'ADMIN' ? 'Record Dues' : 'Pay Dues'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table Mode */
        <div className="members-table-card">
          <div className="table-responsive">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Location</th>
                  <th>Member Code</th>
                  <th>Contact Email</th>
                  <th>Phone Number</th>
                  <th>Account Status</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-table-cell">No members found.</td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="member-table-row">
                      <td>
                        <div className="table-user-cell">
                          {m.profilePhoto ? (
                            <img src={m.profilePhoto} alt="User" className="mini-user-photo" />
                          ) : (
                            <div className="mini-user-circle">
                              {m.firstName ? `${m.firstName[0]}${m.lastName ? m.lastName[0] : ''}` : 'U'}
                            </div>
                          )}
                          <div>
                            <span className="user-bold-name">{m.firstName} {m.lastName}</span>
                            {m.occupation && <span className="user-occ-sub">{m.occupation}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-city-text">{m.city || '—'}</span>
                      </td>
                      <td>
                        {m.memberCode ? (
                          <div className="table-code-cell">
                            <span className="table-code-pill">{m.memberCode}</span>
                            <button
                              className="table-copy-icon-btn"
                              onClick={(e) => handleCopyCode(m.memberCode, `${m.firstName} ${m.lastName}`, e)}
                              title="Copy code"
                            >
                              {copiedCode === m.memberCode ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                            </button>
                          </div>
                        ) : '—'}
                      </td>
                      <td>{m.email}</td>
                      <td>{m.phone || '—'}</td>
                      <td>
                        {m.isPasswordSet ? (
                          <span className="auth-status-tag set">
                            <KeyRound size={11} />
                            Password Set
                          </span>
                        ) : (
                          <span className="auth-status-tag pending">
                            <Clock size={11} />
                            Pending Reg
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="role-pill">{m.role}</span>
                      </td>
                      <td className="text-right">
                        <div className="table-actions-group">
                          <button
                            className="table-mini-btn"
                            onClick={() => setInviteModalMember(m)}
                            title="View Activation Pass & Code"
                          >
                            <QrCode size={13} />
                            <span>Pass</span>
                          </button>
                          <button
                            className="table-mini-btn"
                            onClick={() => setSelectedDetailMemberId(m.id)}
                            title="View Dues Ledger"
                          >
                            <Receipt size={14} />
                            <span>Ledger</span>
                          </button>
                          <button
                            className="table-mini-btn btn-pay-color"
                            onClick={() => onSelectPayMember(m.id)}
                            title="Record / Pay Dues"
                          >
                            <CreditCard size={14} />
                            <span>Pay</span>
                          </button>
                          {userRole === 'ADMIN' && (
                            <>
                              <button
                                className="table-mini-icon-btn"
                                onClick={() => handleEdit(m)}
                                title="Edit"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                className="table-mini-icon-btn delete-icon"
                                onClick={() => handleDelete(m.id, `${m.firstName} ${m.lastName}`)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Modal (Create/Edit) */}
      <MemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onSave={handleSaveWrapper}
        memberToEdit={memberToEdit}
      />

      {/* Member Detail & Dues History Modal */}
      {selectedDetailMemberId && (
        <MemberDetailModal
          memberId={selectedDetailMemberId}
          onClose={() => setSelectedDetailMemberId(null)}
          onViewReceipt={onViewReceipt}
          onPayForMember={onSelectPayMember}
          userRole={userRole}
        />
      )}

      {/* Member Invite & Activation Pass Modal */}
      {inviteModalMember && (
        <MemberInviteModal
          member={inviteModalMember}
          isOpen={Boolean(inviteModalMember)}
          onClose={() => setInviteModalMember(null)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
}
