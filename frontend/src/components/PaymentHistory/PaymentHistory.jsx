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
  Plus
} from 'lucide-react';
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

        {/* Filter Bar */}
        <div className="history-filter-bar">
          <div className="search-input-box">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search by receipt #, member name, purpose..."
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
              <option value="PAID">PAID (Clearance Issued)</option>
              <option value="PENDING">PENDING (Unverified)</option>
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
                <th>Receipt Voucher</th>
                <th>Member</th>
                <th>Dues Purpose</th>
                <th>Amount</th>
                <th>Payment Channel</th>
                <th>Date Logged</th>
                <th>Status</th>
                {userRole === 'ADMIN' && <th>Quick Action</th>}
                <th className="text-right">Action</th>
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

                  return (
                    <tr key={p.id} className="history-row">
                      <td>
                        <button 
                          className="receipt-link-btn"
                          onClick={() => onViewReceipt(p)}
                          title="Click to view full voucher"
                        >
                          <Receipt size={14} />
                          <span>{p.receiptNumber}</span>
                        </button>
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
                          <span className="d-title">{s.title || 'Membership Contribution'}</span>
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
                          <span>{p.status || 'PAID'}</span>
                        </span>
                      </td>
                      {userRole === 'ADMIN' && (
                        <td>
                          {p.status === 'PENDING' ? (
                            <button
                              className="quick-verify-btn"
                              onClick={() => onUpdateStatus(p.id, 'PAID')}
                              title="Mark as verified & generate clear receipt"
                            >
                              <CheckCircle2 size={13} />
                              <span>Verify</span>
                            </button>
                          ) : (
                            <span className="verified-check">✓ Cleared</span>
                          )}
                        </td>
                      )}
                      <td className="text-right">
                        <button
                          className="view-receipt-btn"
                          onClick={() => onViewReceipt(p)}
                          title="Open official printable receipt"
                        >
                          <Receipt size={15} />
                          <span>View Receipt</span>
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

