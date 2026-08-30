import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  DollarSign, 
  Receipt, 
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import './MemberDetailModal.css';

export default function MemberDetailModal({ 
  memberId, 
  onClose, 
  onViewReceipt, 
  onPayForMember,
  userRole 
}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!memberId) return;

    let mounted = true;
    setLoading(true);

    api.getMemberSummary(memberId)
      .then((data) => {
        if (mounted) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [memberId]);

  if (!memberId) return null;

  const member = summary?.member || {};
  const history = summary?.paymentHistory || [];
  const totalPaid = summary?.totalPaid || 0;
  const duesStatus = summary?.duesStatus || 'PENDING_DUES';

  return (
    <div className="member-detail-backdrop" onClick={onClose}>
      <div className="member-detail-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-modal-header">
          <div className="detail-user-banner">
            <div className="detail-avatar">
              {member.firstName ? `${member.firstName[0]}${member.lastName ? member.lastName[0] : ''}` : 'U'}
            </div>
            <div className="detail-user-meta">
              <div className="detail-name-row">
                <h2 className="detail-name">{member.firstName} {member.lastName}</h2>
                <span className={`status-pill pill-${member.status?.toLowerCase() || 'active'}`}>
                  {member.status || 'ACTIVE'}
                </span>
                <span className="role-pill">{member.role || 'MEMBER'}</span>
              </div>
              <div className="detail-contact-row">
                <span><Mail size={13} /> {member.email}</span>
                {member.phone && <span><Phone size={13} /> {member.phone}</span>}
                <span><Calendar size={13} /> Member since {member.joinDate}</span>
              </div>
            </div>
          </div>

          <button className="detail-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Financial Stat Pills */}
        <div className="detail-fin-summary-grid">
          <div className="fin-summary-box">
            <span className="fin-box-label">Lifetime Contributions</span>
            <span className="fin-box-amount">${Number(totalPaid).toFixed(2)}</span>
          </div>

          <div className="fin-summary-box">
            <span className="fin-box-label">Transactions Logged</span>
            <span className="fin-box-amount">{summary?.totalTransactions || 0}</span>
          </div>

          <div className="fin-summary-box">
            <span className="fin-box-label">Standing</span>
            <span className={`standing-badge standing-${duesStatus.toLowerCase()}`}>
              {duesStatus === 'UP_TO_DATE' ? '✓ In Good Standing' : '⚠️ Outstanding Dues'}
            </span>
          </div>
        </div>

        {/* History Table */}
        <div className="detail-history-section">
          <div className="history-section-header">
            <h3 className="section-title">Payment Ledger & Receipts</h3>
            <button 
              className="pay-for-member-btn"
              onClick={() => {
                onClose();
                onPayForMember(member.id);
              }}
            >
              <CreditCard size={15} />
              <span>Record New Payment for {member.firstName}</span>
            </button>
          </div>

          <div className="detail-table-wrap">
            {loading ? (
              <div className="detail-loading">Loading transaction records...</div>
            ) : history.length === 0 ? (
              <div className="detail-empty">
                <AlertCircle size={28} />
                <p>No dues transactions recorded yet for this member.</p>
              </div>
            ) : (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Dues Schedule</th>
                    <th>Amount</th>
                    <th>Channel</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((p) => {
                    const s = p.schedule || {};
                    return (
                      <tr key={p.id}>
                        <td>
                          <span className="receipt-mono-tag">{p.receiptNumber}</span>
                        </td>
                        <td>
                          <span className="table-sch-name">{s.title || 'Association Levy'}</span>
                        </td>
                        <td>
                          <span className="table-amount">${Number(p.amountPaid || 0).toFixed(2)}</span>
                        </td>
                        <td>
                          <span className="table-channel">{p.paymentMethod}</span>
                        </td>
                        <td>
                          <span className="table-date">
                            {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill pill-${p.status?.toLowerCase() || 'paid'}`}>
                            {p.status || 'PAID'}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            className="table-action-btn"
                            onClick={() => {
                              onClose();
                              onViewReceipt(p);
                            }}
                          >
                            <Receipt size={14} />
                            <span>Voucher</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

