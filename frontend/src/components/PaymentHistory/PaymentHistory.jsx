import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Download, 
  ArrowUpDown, 
  DollarSign,
  Plus,
  Copy,
  Check,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './PaymentHistory.css';

export default function PaymentHistory({ 
  payments = [], 
  onViewReceipt, 
  onOpenPayModal, 
  userRole, 
  onUpdateStatus 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const pendingPaymentsCount = payments.filter(p => p.status === 'PENDING').length;
  const paidPaymentsCount = payments.filter(p => p.status === 'PAID').length;

  const filteredPayments = payments.filter((p) => {
    const m = p.member || {};
    const s = p.schedule || {};
    const matchesSearch = 
      (p.receiptNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (`${m.firstName || ''} ${m.lastName || ''}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalFilteredAmount = filteredPayments.reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0);

  const handleCopyCode = (code, id) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareWhatsApp = (p) => {
    const m = p.member || {};
    const s = p.schedule || {};
    const text = encodeURIComponent(
      `🇬🇭 *PEACE & LOVE, ADROABAA - PAYMENT VOUCHER*\n\n` +
      `👤 *Member:* ${m.firstName || ''} ${m.lastName || ''}\n` +
      `📌 *Levy:* ${s.title || p.duesPurpose || 'Dues'}\n` +
      `💵 *Amount:* $${Number(p.amountPaid || 0).toFixed(2)}\n` +
      `🏷️ *Payment Reference Code:* *${p.receiptNumber}*\n` +
      `⏳ *Status:* ${p.status}\n\n` +
      `Please verify and confirm in portal.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleConfirmYes = async (paymentId) => {
    if (onUpdateStatus) {
      await onUpdateStatus(paymentId, 'PAID');
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#059669']
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Receipt Number,Member Name,Member Email,Dues Schedule,Amount Paid,Payment Method,Payment Date,Status,Notes'];
    const rows = filteredPayments.map(p => {
      const m = p.member || {};
      const s = p.schedule || {};
      return `"${p.receiptNumber}","${m.firstName || ''} ${m.lastName || ''}","${m.email || ''}","${s.title || ''}","${p.amountPaid}","${p.paymentMethod}","${p.paymentDate}","${p.status}","${(p.notes || '').replace(/"/g, '""')}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dues_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="payment-history-view animate-fade-in">
      {/* Top Controls Card */}
      <div className="history-header-card">
        <div className="history-title-row">
          <div>
            <h1 className="history-page-title">Association Payment Ledger & Receipts</h1>
            <p className="history-page-subtitle">
              Comprehensive audit trail of member dues collections, verification statuses, and electronic vouchers.
            </p>
          </div>

          <div className="history-header-actions">
            <button className="history-btn btn-export" onClick={handleExportCSV}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>
            <button className="history-btn btn-primary-pay" onClick={onOpenPayModal}>
              <Plus size={16} />
              <span>{userRole === 'ADMIN' ? 'Record Payment' : 'Pay Dues'}</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs for Approvals */}
        <div className="approval-filter-tabs">
          <button 
            type="button" 
            className={`tab-filter-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            <span>All Payments</span>
            <span className="count-pill">{payments.length}</span>
          </button>

          <button 
            type="button" 
            className={`tab-filter-btn pending-tab ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            <Clock size={14} />
            <span>Pending Approvals</span>
            {pendingPaymentsCount > 0 ? (
              <span className="count-pill badge-amber">{pendingPaymentsCount} Awaiting</span>
            ) : (
              <span className="count-pill">0</span>
            )}
          </button>

          <button 
            type="button" 
            className={`tab-filter-btn ${statusFilter === 'PAID' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PAID')}
          >
            <CheckCircle2 size={14} />
            <span>Confirmed (Paid)</span>
            <span className="count-pill badge-green">{paidPaymentsCount}</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="history-filter-bar">
          <div className="search-input-box">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search by receipt code, member name, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-dropdowns">
            <select
              className="filter-select"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="ALL">All Payment Channels</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash at Secretariat</option>
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING (Awaiting Admin Confirmation)</option>
              <option value="PAID">PAID (Clearance Issued)</option>
              <option value="REVERSED">REVERSED</option>
            </select>
          </div>
        </div>

        {/* Total stats pill */}
        <div className="filter-summary-pill">
          <span>Showing <strong>{filteredPayments.length}</strong> transactions</span>
          <span className="summary-amount-badge">
            Filtered Total: <strong>${totalFilteredAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </span>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="history-table-card">
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Payment Code / Voucher</th>
                <th>Member</th>
                <th>Dues Purpose</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Date Logged</th>
                <th>Status</th>
                {userRole === 'ADMIN' && <th>Admin Confirmation</th>}
                <th className="text-right">Voucher / Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'ADMIN' ? 9 : 8} className="history-empty-cell">
                    No payment records match your current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const m = p.member || {};
                  const s = p.schedule || {};
                  const isPending = p.status === 'PENDING';
                  const isCopied = copiedId === p.id;

                  return (
                    <tr key={p.id} className={`history-row ${isPending ? 'row-pending-highlight' : ''}`}>
                      <td>
                        <div className="receipt-code-group">
                          <button 
                            type="button"
                            className="receipt-link-btn"
                            onClick={() => onViewReceipt(p)}
                            title="Click to view full voucher"
                          >
                            <Receipt size={14} />
                            <span className="code-text-mono">{p.receiptNumber}</span>
                          </button>
                          <button
                            type="button"
                            className={`mini-copy-btn ${isCopied ? 'copied' : ''}`}
                            onClick={() => handleCopyCode(p.receiptNumber, p.id)}
                            title="Copy payment code to clipboard"
                          >
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="member-cell">
                          <div className="member-avatar-mini">
                            {m.firstName ? `${m.firstName[0]}${m.lastName ? m.lastName[0] : ''}` : 'M'}
                          </div>
                          <div className="member-text-group">
                            <span className="m-name">{m.firstName} {m.lastName}</span>
                            <span className="m-sub">{m.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="dues-purpose-cell">
                          <span className="d-title">{s.title || p.duesPurpose || 'Membership Contribution'}</span>
                          <span className="d-freq">{s.frequency || 'Annual'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="amount-highlight">
                          ${Number(p.amountPaid || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span className="channel-tag">{p.paymentMethod}</span>
                      </td>
                      <td>
                        <span className="date-tag">
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill pill-${p.status?.toLowerCase() || 'paid'}`}>
                          {p.status === 'PAID' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          <span>{p.status === 'PAID' ? 'PAID (Verified)' : 'PENDING'}</span>
                        </span>
                      </td>

                      {userRole === 'ADMIN' && (
                        <td>
                          {p.status === 'PENDING' ? (
                            <button
                              type="button"
                              className="confirm-yes-btn"
                              onClick={() => handleConfirmYes(p.id)}
                              title="Confirm received payment and issue official verified receipt"
                            >
                              <CheckCircle2 size={15} />
                              <span>Confirm Payment (Yes)</span>
                            </button>
                          ) : (
                            <span className="verified-check">✓ Confirmed</span>
                          )}
                        </td>
                      )}

                      <td className="text-right">
                        <div className="action-btns-group">
                          {isPending && userRole === 'MEMBER' && (
                            <button
                              type="button"
                              className="share-whatsapp-mini-btn"
                              onClick={() => handleShareWhatsApp(p)}
                              title="Share payment voucher via WhatsApp to Admin"
                            >
                              <MessageCircle size={14} />
                              <span>WhatsApp Admin</span>
                            </button>
                          )}

                          <button
                            type="button"
                            className="view-receipt-btn"
                            onClick={() => onViewReceipt(p)}
                            title="Open official printable receipt"
                          >
                            <Receipt size={14} />
                            <span>{p.status === 'PAID' ? 'Receipt' : 'Voucher'}</span>
                          </button>
                        </div>
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

