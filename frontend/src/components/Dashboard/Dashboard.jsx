import React from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CreditCard, 
  UserPlus, 
  CalendarPlus, 
  Megaphone,
  ArrowRight,
  Receipt,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Eraser,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import StatCard from '../StatCard/StatCard';
import { useTranslation } from '../../i18n/LanguageContext';
import './Dashboard.css';

export default function Dashboard({ 
  stats, 
  schedules = [], 
  recentPayments = [], 
  announcements = [], 
  onNavigateTab, 
  onOpenPayModal, 
  onOpenMemberModal, 
  onOpenScheduleModal, 
  onOpenAnnouncementModal,
  onCleanSlate,
  onViewReceipt,
  onUpdateStatus,
  userRole 
}) {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopyCode = (code, id) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleConfirmYes = async (paymentId) => {
    if (onUpdateStatus) {
      await onUpdateStatus(paymentId, 'PAID');
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#3b82f6']
      });
    }
  };

  const pendingPayments = recentPayments.filter((p) => p.status === 'PENDING');
  const totalCollected = stats?.totalCollected 
    ? Number(stats.totalCollected).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

  const collectionRate = stats?.collectionRate || 0;
  const activeMembers = stats?.activeMembersCount || 0;
  const pendingCount = stats?.pendingPaymentsCount || pendingPayments.length || 0;

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Welcome Banner */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <div className="banner-badge">
            <Sparkles size={15} />
            <span>Peace & Love, Adroabaa Suite</span>
          </div>
          <h1 className="banner-title">
            Welcome to Peace & Love, Adroabaa
          </h1>
          <p className="banner-desc">
            Track member financial contributions, manage active levies and welfare campaigns, verify transactions, and issue official receipts.
          </p>

          <div className="banner-actions">
            <button className="banner-btn btn-primary" onClick={onOpenPayModal}>
              <CreditCard size={17} />
              <span>{userRole === 'ADMIN' ? (t('nav.record_dues') || 'Record Dues Payment') : (t('nav.pay_dues') || 'Pay My Dues Online')}</span>
            </button>
            <button className="banner-btn btn-outline" onClick={() => onNavigateTab('chat')}>
              <Megaphone size={16} />
              <span>💬 {t('nav.chat') || 'Member Chat & Support'}</span>
            </button>
            {userRole === 'ADMIN' && (
              <>
                <button className="banner-btn btn-outline" onClick={onOpenMemberModal}>
                  <UserPlus size={16} />
                  <span>Register Member</span>
                </button>
                <button className="banner-btn btn-outline" onClick={onOpenAnnouncementModal}>
                  <Megaphone size={16} />
                  <span>Post Notice</span>
                </button>
                {onCleanSlate && stats?.totalMembersCount > 1 && (
                  <button className="banner-btn btn-outline btn-clear-demo-banner" onClick={onCleanSlate}>
                    <Eraser size={16} />
                    <span>Clear Demo Records</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="stat-cards-grid">
        <StatCard
          title={t('dashboard.total_collected') || 'Total Dues Collected'}
          value={`$${totalCollected}`}
          subtitle="Lifetime verified contributions"
          icon={DollarSign}
          variant="emerald"
          trend="+18.4%"
          trendPositive={true}
          onClick={() => onNavigateTab('history')}
          actionHint="View Payment Ledger →"
        />
        <StatCard
          title={t('dashboard.active_members') || 'Active Members'}
          value={activeMembers.toString()}
          subtitle={`Out of ${stats?.totalMembersCount || activeMembers} registered`}
          icon={Users}
          variant="primary"
          trend="92% Active"
          trendPositive={true}
          onClick={() => onNavigateTab('members')}
          actionHint="View Member Directory →"
        />
        <StatCard
          title={t('dashboard.collection_rate') || 'Overall Compliance'}
          value={`${collectionRate}%`}
          subtitle="Target levy fulfillment"
          icon={TrendingUp}
          variant={collectionRate >= 70 ? 'emerald' : 'amber'}
          trend="Current Cycle"
          trendPositive={collectionRate >= 70}
          onClick={() => onNavigateTab('schedules')}
          actionHint="View Dues Schedules →"
        />
        <StatCard
          title="Pending Transactions"
          value={pendingCount.toString()}
          subtitle="Awaiting treasurer clearance"
          icon={AlertTriangle}
          variant={pendingCount > 0 ? 'amber' : 'primary'}
          trend={pendingCount > 0 ? 'Action required' : 'All clear'}
          trendPositive={pendingCount === 0}
          onClick={() => onNavigateTab('history')}
          actionHint="Review Transactions →"
        />
      </div>

      {/* Main Grid: Dues Schedules Progress & Recent Activity */}
      <div className="dashboard-main-grid">
        {/* Left Column: Active Schedules Progress */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Dues Schedules & Campaign Goals</h2>
              <p className="section-card-subtitle">Performance breakdown of active association funds</p>
            </div>
            <button 
              className="view-all-link"
              onClick={() => onNavigateTab('schedules')}
            >
              <span>Manage Schedules</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="schedules-progress-list">
            {(stats?.schedules || []).length === 0 ? (
              <div className="empty-state-box">No active dues schedules found.</div>
            ) : (
              (stats?.schedules || []).map((sch) => {
                const pct = sch.percentage || 0;
                const isCompleted = pct >= 100;

                return (
                  <div key={sch.id} className="schedule-progress-item">
                    <div className="progress-item-top">
                      <div className="item-title-group">
                        <span className="item-title">{sch.title}</span>
                        <span className="item-frequency-pill">{sch.frequency}</span>
                      </div>
                      <div className="item-amount-badge">
                        ${Number(sch.totalCollected || 0).toLocaleString()} <span className="item-target">/ ${Number(sch.targetAmount || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="progress-bar-track">
                      <div 
                        className={`progress-bar-fill ${isCompleted ? 'fill-completed' : ''}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="progress-item-bottom">
                      <span className="meta-text">
                        Due: <strong>{sch.dueDate}</strong> • <strong>{sch.paidMembersCount || 0}</strong> of {sch.totalMembersCount || 0} members contributed
                      </span>
                      <span className={`percentage-badge ${isCompleted ? 'pct-green' : ''}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Announcements Notice Board Preview */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <div>
              <h2 className="section-card-title">Association Bulletins</h2>
              <p className="section-card-subtitle">Official announcements & upcoming assemblies</p>
            </div>
            <button 
              className="view-all-link"
              onClick={() => onNavigateTab('announcements')}
            >
              <span>View All</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="announcements-mini-feed">
            {announcements.length === 0 ? (
              <div className="empty-state-box">No announcements posted yet.</div>
            ) : (
              announcements.slice(0, 3).map((a) => (
                <div key={a.id} className={`mini-announcement-card priority-${a.priority?.toLowerCase() || 'normal'}`}>
                  <div className="mini-announcement-header">
                    <span className="mini-title">{a.title}</span>
                    {a.pinned && <span className="pinned-pill">📌 Pinned</span>}
                  </div>
                  <p className="mini-content">{a.content}</p>
                  <div className="mini-footer">
                    <span className="mini-author">
                      By {a.author ? `${a.author.firstName} ${a.author.lastName}` : 'Secretariat'}
                    </span>
                    <span className="mini-date">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin Spotlight: Pending Payments Requiring Confirmation */}
      {userRole === 'ADMIN' && pendingPayments.length > 0 && (
        <div className="dashboard-section-card pending-spotlight-card">
          <div className="section-card-header">
            <div>
              <div className="pending-badge-header">
                <Clock size={16} />
                <span>Action Required ({pendingPayments.length})</span>
              </div>
              <h2 className="section-card-title">Pending Member Payments Awaiting Confirmation</h2>
              <p className="section-card-subtitle">
                Members have submitted dues payment codes. Once you verify the transfer, click "Confirm Payment (Yes)" to instantly credit their account and unlock their verified receipt.
              </p>
            </div>
            <button 
              className="view-all-link"
              onClick={() => onNavigateTab('history')}
            >
              <span>View in Ledger</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="pending-spotlight-list">
            {pendingPayments.map((p) => {
              const m = p.member || {};
              const s = p.schedule || {};
              const isCopied = copiedId === p.id;

              return (
                <div key={p.id} className="pending-spotlight-row">
                  <div className="spotlight-left">
                    <div className="spotlight-avatar">
                      {m.firstName ? `${m.firstName[0]}${m.lastName ? m.lastName[0] : ''}` : 'M'}
                    </div>
                    <div className="spotlight-details">
                      <div className="spotlight-member-row">
                        <span className="spotlight-name">{m.firstName} {m.lastName}</span>
                        <span className="spotlight-code-badge">
                          Code: <strong>{p.receiptNumber}</strong>
                        </span>
                        <button 
                          type="button" 
                          className="spotlight-copy-btn"
                          onClick={() => handleCopyCode(p.receiptNumber, p.id)}
                          title="Copy reference code"
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <span className="spotlight-purpose">
                        {s.title || p.duesPurpose || 'Dues Levy'} • {p.paymentMethod} • {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                  </div>

                  <div className="spotlight-right">
                    <span className="spotlight-amount">${Number(p.amountPaid || 0).toFixed(2)}</span>
                    <button
                      type="button"
                      className="spotlight-confirm-yes-btn"
                      onClick={() => handleConfirmYes(p.id)}
                    >
                      <CheckCircle2 size={16} />
                      <span>Confirm Payment (Yes)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions Table Card */}
      <div className="dashboard-section-card">
        <div className="section-card-header">
          <div>
            <h2 className="section-card-title">Recent Dues Transactions</h2>
            <p className="section-card-subtitle">Live ledger of latest dues receipts and clearances</p>
          </div>
          <button 
            className="view-all-link"
            onClick={() => onNavigateTab('history')}
          >
            <span>All Transactions</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="dues-table">
            <thead>
              <tr>
                <th>Receipt / Code</th>
                <th>Member</th>
                <th>Dues Purpose</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Date</th>
                {userRole === 'ADMIN' && <th>Admin Action</th>}
                <th className="text-right">Voucher</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'ADMIN' ? 9 : 8} className="empty-table-cell">
                    No dues transactions recorded yet. Click "Record Dues Payment" to get started.
                  </td>
                </tr>
              ) : (
                recentPayments.slice(0, 6).map((pay) => {
                  const m = pay.member || {};
                  const s = pay.schedule || {};

                  return (
                    <tr key={pay.id} className="table-row-hover">
                      <td>
                        <span className="receipt-mono-tag">{pay.receiptNumber}</span>
                      </td>
                      <td>
                        <div className="table-member-info">
                          <span className="member-name-text">{m.firstName} {m.lastName}</span>
                          <span className="member-email-sub">{m.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="table-schedule-title">{s.title || pay.duesPurpose || 'Association Dues'}</span>
                      </td>
                      <td>
                        <span className="table-amount-cell">${Number(pay.amountPaid || 0).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className="channel-badge">{pay.paymentMethod}</span>
                      </td>
                      <td>
                        <span className={`status-pill pill-${pay.status?.toLowerCase() || 'paid'}`}>
                          {pay.status === 'PAID' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          <span>{pay.status === 'PAID' ? 'PAID (Verified)' : 'PENDING'}</span>
                        </span>
                      </td>
                      <td>
                        <span className="table-date-cell">
                          {pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : 'Today'}
                        </span>
                      </td>

                      {userRole === 'ADMIN' && (
                        <td>
                          {pay.status === 'PENDING' ? (
                            <button
                              type="button"
                              className="dash-confirm-yes-btn"
                              onClick={() => handleConfirmYes(pay.id)}
                              title="Confirm received payment"
                            >
                              <CheckCircle2 size={13} />
                              <span>Confirm (Yes)</span>
                            </button>
                          ) : (
                            <span className="verified-check">✓ Cleared</span>
                          )}
                        </td>
                      )}

                      <td className="text-right">
                        <button 
                          className="table-action-btn"
                          onClick={() => onViewReceipt(pay)}
                          title="View & Print Official Receipt"
                        >
                          <Receipt size={15} />
                          <span>{pay.status === 'PAID' ? 'Receipt' : 'Voucher'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

