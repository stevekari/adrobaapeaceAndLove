import React from 'react';
import { 
  CreditCard, 
  Receipt, 
  MessageSquare, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  Calendar,
  Building2,
  Phone,
  MapPin
} from 'lucide-react';
import './MemberDashboard.css';

export default function MemberDashboard({ 
  currentUser, 
  schedules = [], 
  recentPayments = [], 
  announcements = [], 
  onNavigateTab, 
  onOpenPayModal, 
  onViewReceipt 
}) {
  // Calculate Member's Personal Metrics
  const myPayments = recentPayments || [];
  const myTotalPaid = myPayments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

  const paidScheduleIds = new Set(
    myPayments.filter((p) => p.status === 'PAID').map((p) => p.schedule?.id)
  );

  const activeSchedules = schedules.filter((s) => s.active !== false);
  const fullyPaidCount = activeSchedules.filter((s) => paidScheduleIds.has(s.id)).length;
  const isUpToDate = activeSchedules.length > 0 && fullyPaidCount >= activeSchedules.length;

  const getInitials = () => {
    if (!currentUser) return 'U';
    const f = currentUser.firstName ? currentUser.firstName[0] : '';
    const l = currentUser.lastName ? currentUser.lastName[0] : '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  return (
    <div className="member-dashboard-view animate-fade-in">
      {/* Personalized Welcome Card */}
      <div className="member-welcome-card">
        <div className="member-welcome-content">
          <div className="member-avatar-box">
            {currentUser?.profilePhoto ? (
              <img src={currentUser.profilePhoto} alt="Profile" className="member-photo-img" />
            ) : (
              <div className="member-avatar-initials">
                {getInitials()}
              </div>
            )}
          </div>

          <div className="member-welcome-info">
            <div className="member-badge-row">
              <span className="member-tag">MEMBER PORTAL</span>
              <span className="member-code-pill">Code: {currentUser?.memberCode || 'MEM-1003'}</span>
              <span className={`compliance-tag ${isUpToDate ? 'tag-green' : 'tag-amber'}`}>
                {isUpToDate ? '✓ Good Standing' : 'Pending Levies'}
              </span>
            </div>

            <h1 className="member-welcome-name">
              Welcome, {currentUser?.firstName} {currentUser?.lastName}!
            </h1>

            <p className="member-welcome-sub">
              {currentUser?.city ? `📍 ${currentUser.city} • ` : ''}
              {currentUser?.occupation ? `${currentUser.occupation} • ` : ''}
              Enrolled: {currentUser?.joinDate || '2023'}
            </p>

            <div className="member-quick-ctas">
              <button className="member-cta-btn btn-pay" onClick={() => onOpenPayModal()}>
                <CreditCard size={17} />
                <span>Pay Dues Online</span>
              </button>

              <button className="member-cta-btn btn-chat" onClick={() => onNavigateTab('chat')}>
                <MessageSquare size={17} />
                <span>💬 Member Chat & Support</span>
              </button>

              <button className="member-cta-btn btn-profile" onClick={() => onNavigateTab('profile')}>
                <User size={16} />
                <span>My Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal KPI Cards */}
      <div className="member-stats-row">
        <div 
          className="member-stat-box green clickable" 
          onClick={() => onNavigateTab('history')}
          title="Click to view payment history"
        >
          <div className="stat-icon-wrapper">
            <DollarSign size={22} />
          </div>
          <div className="stat-text-group">
            <span className="stat-label">Total Contributions Paid</span>
            <h3 className="stat-value">${myTotalPaid.toFixed(2)}</h3>
            <span className="stat-sub">Lifetime verified payments →</span>
          </div>
        </div>

        <div 
          className="member-stat-box sky clickable" 
          onClick={() => onOpenPayModal()}
          title="Click to view dues schedules & pay"
        >
          <div className="stat-icon-wrapper">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-text-group">
            <span className="stat-label">Levies Contributed</span>
            <h3 className="stat-value">{fullyPaidCount} of {activeSchedules.length}</h3>
            <span className="stat-sub">Active association funds →</span>
          </div>
        </div>

        <div 
          className="member-stat-box purple clickable" 
          onClick={() => onNavigateTab('history')}
          title="Click to view official receipts"
        >
          <div className="stat-icon-wrapper">
            <Receipt size={22} />
          </div>
          <div className="stat-text-group">
            <span className="stat-label">Official Receipts</span>
            <h3 className="stat-value">{myPayments.length}</h3>
            <span className="stat-sub">Printable receipts available →</span>
          </div>
        </div>
      </div>

      {/* Main Grid: My Dues Status & Announcements */}
      <div className="member-main-grid">
        {/* Left: My Dues Levies Checklist */}
        <div className="member-section-card">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">My Dues Levies & Welfare Funds</h2>
              <p className="section-sub">Status of active association contributions</p>
            </div>
            <button className="section-link-btn" onClick={() => onOpenPayModal()}>
              <span>Pay Now</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="member-schedules-list">
            {activeSchedules.length === 0 ? (
              <div className="empty-message">No active dues schedules at this time.</div>
            ) : (
              activeSchedules.map((sch) => {
                const isPaid = paidScheduleIds.has(sch.id);
                return (
                  <div key={sch.id} className={`member-schedule-row ${isPaid ? 'is-paid' : 'is-pending'}`}>
                    <div className="sch-details">
                      <div className="sch-top-row">
                        <span className="sch-title">{sch.title}</span>
                        <span className="sch-badge">{sch.frequency}</span>
                      </div>
                      <p className="sch-desc">{sch.description}</p>
                      <div className="sch-meta">
                        <Calendar size={13} />
                        <span>Due Date: <strong>{sch.dueDate}</strong></span>
                      </div>
                    </div>

                    <div className="sch-action-side">
                      <div className="sch-amount-tag">
                        ${Number(sch.amount || 0).toFixed(2)}
                      </div>
                      {isPaid ? (
                        <div className="paid-status-pill">
                          <CheckCircle2 size={14} />
                          <span>Paid ✓</span>
                        </div>
                      ) : (
                        <button 
                          className="pay-levy-btn"
                          onClick={() => onOpenPayModal(sch.id)}
                        >
                          <CreditCard size={13} />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Recent Receipts & Bulletins */}
        <div className="member-side-cards">
          {/* Recent Receipts Card */}
          <div className="member-section-card">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">My Recent Receipts</h2>
                <p className="section-sub">Official verified transactions</p>
              </div>
              <button className="section-link-btn" onClick={() => onNavigateTab('history')}>
                <span>All Receipts</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="my-receipts-feed">
              {myPayments.length === 0 ? (
                <div className="empty-message">No receipts issued yet.</div>
              ) : (
                myPayments.slice(0, 3).map((pay) => (
                  <div key={pay.id} className="my-receipt-item">
                    <div className="receipt-left">
                      <Receipt size={16} className="receipt-icon" />
                      <div>
                        <span className="receipt-num">{pay.receiptNumber}</span>
                        <span className="receipt-sch">{pay.schedule?.title || 'Association Dues'}</span>
                      </div>
                    </div>
                    <div className="receipt-right">
                      <span className="receipt-amt">${Number(pay.amountPaid || 0).toFixed(2)}</span>
                      <button 
                        className="view-voucher-btn"
                        onClick={() => onViewReceipt(pay)}
                        title="View printable receipt"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Association Announcements Card */}
          <div className="member-section-card">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">Association Bulletins</h2>
                <p className="section-sub">Updates from Secretariat</p>
              </div>
              <button className="section-link-btn" onClick={() => onNavigateTab('announcements')}>
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="my-bulletins-feed">
              {announcements.slice(0, 2).map((a) => (
                <div key={a.id} className="my-bulletin-item">
                  <span className="bulletin-title">{a.title}</span>
                  <p className="bulletin-snippet">{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

