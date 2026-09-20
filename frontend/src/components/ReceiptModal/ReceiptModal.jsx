import React from 'react';
import { 
  CheckCircle, 
  Printer, 
  Download, 
  X, 
  Building2, 
  QrCode, 
  ShieldCheck,
  Calendar,
  CreditCard,
  User,
  Share2,
  Clock,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';
import './ReceiptModal.css';

export default function ReceiptModal({ receipt, onClose, onShowToast }) {
  if (!receipt) return null;

  const member = receipt.member || {};
  const schedule = receipt.schedule || {};
  const isPending = receipt.status === 'PENDING';

  const formattedDate = receipt.paymentDate 
    ? new Date(receipt.paymentDate).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptNumber = () => {
    navigator.clipboard.writeText(receipt.receiptNumber);
    if (onShowToast) {
      onShowToast('Copied!', `Payment Code #${receipt.receiptNumber} copied to clipboard`, 'success');
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🇬🇭 *PEACE & LOVE, ADROABAA - PAYMENT VOUCHER*\n\n` +
      `👤 *Member:* ${member.firstName || ''} ${member.lastName || ''}\n` +
      `📌 *Levy:* ${schedule.title || receipt.duesPurpose || 'Dues Levy'}\n` +
      `💵 *Amount:* $${Number(receipt.amountPaid || 0).toFixed(2)}\n` +
      `🏷️ *Payment Reference Code:* *${receipt.receiptNumber}*\n` +
      `⏳ *Status:* ${receipt.status || 'PENDING'}\n\n` +
      `Official Voucher from Peace & Love, Adroabaa Portal.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div className="receipt-modal-wrapper animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Actions */}
        <div className="receipt-modal-actions no-print">
          <div className="receipt-action-group">
            <button className="receipt-btn btn-print" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print {isPending ? 'Payment Voucher' : 'Official Receipt'}</span>
            </button>
            <button className="receipt-btn btn-copy" onClick={handleCopyReceiptNumber}>
              <Share2 size={16} />
              <span>Copy Code</span>
            </button>
            <button className="receipt-btn btn-whatsapp-share" onClick={handleShareWhatsApp}>
              <MessageCircle size={16} />
              <span>Share WhatsApp</span>
            </button>
          </div>
          <button className="receipt-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Printable Official Receipt Body */}
        <div className="official-receipt-card" id="printable-receipt">
          {/* Header */}
          <div className="receipt-header">
            <div className="receipt-association-brand">
              <div className="receipt-logo">
                <Building2 size={28} />
              </div>
              <div className="receipt-title-block">
                <h2>PEACE & LOVE, ADROABAA</h2>
                <p className="receipt-subtitle">Official Dues & Contribution Electronic {isPending ? 'Payment Voucher' : 'Receipt'}</p>
                <p className="receipt-secretariat">Secretariat • Adroabaa</p>
              </div>
            </div>

            <div className="receipt-number-badge">
              <span className="badge-tag">{isPending ? 'PAYMENT CODE' : 'RECEIPT VOUCHER'}</span>
              <span className="badge-number">{receipt.receiptNumber}</span>
              <span className="badge-date">{formattedDate}</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          {/* Verification Watermark Banner */}
          <div className={`receipt-status-banner ${isPending ? 'banner-pending' : 'banner-paid'}`}>
            <div className="status-indicator">
              {isPending ? (
                <Clock size={22} className="status-icon-pending" />
              ) : (
                <CheckCircle size={22} className="status-icon-paid" />
              )}
              <div>
                <span className="status-text">
                  PAYMENT STATUS: <strong>{receipt.status || 'PAID'}</strong>
                </span>
                <span className="status-subtext">
                  {isPending 
                    ? 'Awaiting Administrator confirmation. Share reference code with Admin for verification.'
                    : 'Transaction successfully verified & cleared in Association General Ledger.'}
                </span>
              </div>
            </div>
            <div className="receipt-stamp">
              <ShieldCheck size={28} />
              <span>{isPending ? 'SUBMITTED VOUCHER' : 'OFFICIAL RECEIPT'}</span>
            </div>
          </div>

          {/* Member & Payment Metadata Grid */}
          <div className="receipt-details-grid">
            <div className="receipt-section-block">
              <div className="section-head">
                <User size={15} />
                <span>Payer (Member Information)</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Full Name:</span>
                <span className="detail-value highlight">{member.firstName} {member.lastName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Member Email:</span>
                <span className="detail-value">{member.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Contact Phone:</span>
                <span className="detail-value">{member.phone || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Member Role:</span>
                <span className="detail-value role-tag">{member.role || 'MEMBER'}</span>
              </div>
            </div>

            <div className="receipt-section-block">
              <div className="section-head">
                <CreditCard size={15} />
                <span>Payment & Schedule Details</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Dues Purpose:</span>
                <span className="detail-value highlight">{schedule.title || 'General Association Dues'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Dues Frequency:</span>
                <span className="detail-value">{schedule.frequency || 'Annual'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Payment Method:</span>
                <span className="detail-value method-pill">{receipt.paymentMethod || 'Mobile Money'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Transaction Date:</span>
                <span className="detail-value">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary Breakdown Table */}
          <div className="receipt-breakdown-table">
            <div className="breakdown-header">
              <span>Contribution Item & Description</span>
              <span>Billing Cycle</span>
              <span className="text-right">Total Paid</span>
            </div>
            <div className="breakdown-row">
              <div className="item-details">
                <div className="item-name">{schedule.title || 'Membership Contribution'}</div>
                <div className="item-notes">{receipt.notes || 'Full dues fulfillment confirmed'}</div>
              </div>
              <div className="item-cycle">{schedule.frequency || 'Period'}</div>
              <div className="item-amount text-right">${Number(receipt.amountPaid || 0).toFixed(2)}</div>
            </div>
          </div>

          {/* Grand Total Amount Banner */}
          <div className="receipt-total-banner">
            <div className="total-label-box">
              <span className="total-title">TOTAL AMOUNT RECEIVED</span>
              <span className="total-in-words">
                Official electronic clearance voucher
              </span>
            </div>
            <div className="total-amount-display">
              ${Number(receipt.amountPaid || 0).toFixed(2)}
            </div>
          </div>

          {/* Footer QR & Verification Signature */}
          <div className="receipt-footer">
            <div className="receipt-qr-block">
              <div className="mock-qr-code">
                <QrCode size={56} />
              </div>
              <div className="qr-caption">
                <span>Scan to verify receipt authenticity</span>
                <span className="qr-hash">Ref: {receipt.receiptNumber}</span>
              </div>
            </div>

            <div className="receipt-signature-block">
              <div className="signature-line">
                <div className="signature-stamp">Peace & Love Verified</div>
              </div>
              <span className="signatory-name">Office of the Treasurer</span>
              <span className="signatory-title">Peace & Love, Adroabaa Committee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

