import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  QrCode, 
  Printer, 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ShieldCheck, 
  Share2, 
  Building2, 
  FileText,
  Hash,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import MemberInviteModal from '../Members/MemberInviteModal';
import './CodeGeneratorHub.css';

export default function CodeGeneratorHub({ currentUser, members = [], onShowToast }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedPassCode, setSelectedPassCode] = useState(null);

  // Generator Form State
  const [prefix, setPrefix] = useState('MEM');
  const [customPrefix, setCustomPrefix] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [preAssignedMemberId, setPreAssignedMemberId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedBatch, setLastGeneratedBatch] = useState(null);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await api.getRegistrationCodes(statusFilter);
      setCodes(res || []);
    } catch (err) {
      if (onShowToast) {
        onShowToast('Error', err.message || 'Could not load registration codes', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, [statusFilter]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const activePrefix = prefix === 'CUSTOM' ? (customPrefix.trim().toUpperCase() || 'ASSOC') : prefix;
      const payload = {
        prefix: activePrefix,
        role,
        quantity: parseInt(quantity, 10) || 1,
        notes: notes.trim() || 'Association Membership Registration Code',
        preAssignedMemberId: preAssignedMemberId ? parseInt(preAssignedMemberId, 10) : null,
      };

      const res = await api.generateRegistrationCodes(payload);
      setLastGeneratedBatch(res);
      if (onShowToast) {
        onShowToast(
          'Codes Generated Successfully!',
          `Created ${res.length} official ${role} registration code(s).`,
          'success'
        );
      }
      setNotes('');
      setPreAssignedMemberId('');
      await fetchCodes();
    } catch (err) {
      if (onShowToast) {
        onShowToast('Generation Failed', err.message || 'Could not generate codes', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = (code, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (onShowToast) {
      onShowToast('Code Copied', `Registration code ${code} copied to clipboard!`, 'success');
    }
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyInviteText = (item, e) => {
    if (e) e.stopPropagation();
    const portalUrl = window.location.origin;
    const text = `🏛️ *Official Association Registration Invitation*\n\nHello! You have been granted official membership authorization to join our association portal.\n\n🔑 *Your Official Registration Code:* \`${item.code}\`\n👤 *Authorized Role:* ${item.role}\n📌 *Portal Link:* ${portalUrl}\n\n*How to Activate Your Account:*\n1. Visit the link above and tap *"Register with Code"*.\n2. Enter your code: \`${item.code}\`\n3. Set your secure password and complete your profile!`;
    navigator.clipboard.writeText(text);
    if (onShowToast) {
      onShowToast('Invite Message Copied', 'WhatsApp/SMS invitation text copied to clipboard!', 'success');
    }
  };

  const handleRevoke = async (id, code, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Are you sure you want to revoke code ${code}? This code will no longer be valid for registration.`)) {
      try {
        await api.revokeRegistrationCode(id);
        if (onShowToast) {
          onShowToast('Code Revoked', `Registration code ${code} has been revoked.`, 'info');
        }
        await fetchCodes();
      } catch (err) {
        if (onShowToast) {
          onShowToast('Error', err.message || 'Could not revoke code', 'error');
        }
      }
    }
  };

  const handlePrintBatch = () => {
    window.print();
  };

  const filteredCodes = codes.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery = 
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q)) ||
      (c.preAssignedMemberName && c.preAssignedMemberName.toLowerCase().includes(q)) ||
      (c.redeemedByMemberName && c.redeemedByMemberName.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalCodesCount = codes.length;
  const availableCount = codes.filter((c) => c.status === 'AVAILABLE').length;
  const redeemedCount = codes.filter((c) => c.status === 'REDEEMED').length;

  return (
    <div className="code-hub-layout animate-fade-in">
      {/* Header Banner */}
      <div className="code-hub-header-card">
        <div className="header-left-col">
          <div className="header-badge">
            <KeyRound size={16} />
            <span>Association Exclusivity Gateway</span>
          </div>
          <h1 className="code-hub-title">Official Registration Code Generator</h1>
          <p className="code-hub-sub">
            Generate and manage single or bulk authorized association registration codes. Only individuals possessing an official code generated by association leadership can register.
          </p>
        </div>

        <div className="header-metrics-row">
          <div className="stat-metric-badge">
            <span className="metric-label">Total Generated</span>
            <span className="metric-number">{totalCodesCount}</span>
          </div>
          <div className="stat-metric-badge available">
            <span className="metric-label">Available (Unused)</span>
            <span className="metric-number">{availableCount}</span>
          </div>
          <div className="stat-metric-badge redeemed">
            <span className="metric-label">Redeemed (Active)</span>
            <span className="metric-number">{redeemedCount}</span>
          </div>
        </div>
      </div>

      {/* Generator Form & Last Batch Row */}
      <div className="code-gen-split-grid">
        {/* Generator Form */}
        <div className="generator-card">
          <div className="card-section-title">
            <Sparkles size={18} className="sparkle-icon" />
            <span>Generate New Association Codes</span>
          </div>
          <p className="section-description">
            Create single or batch pre-approved activation codes for general meetings, membership drives, or specific individuals.
          </p>

          <form onSubmit={handleGenerate} className="gen-form">
            <div className="gen-form-row">
              <div className="gen-field-group">
                <label className="field-label">Code Prefix</label>
                <select 
                  className="field-select"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                >
                  <option value="MEM">MEM (Standard Member)</option>
                  <option value="ASSOC-2026">ASSOC-2026 (2026 Batch)</option>
                  <option value="DIASPORA">DIASPORA (Overseas Chapter)</option>
                  <option value="TRS">TRS (Treasurer Pass)</option>
                  <option value="ADM">ADM (Admin Pass)</option>
                  <option value="CUSTOM">Custom Prefix...</option>
                </select>
              </div>

              {prefix === 'CUSTOM' && (
                <div className="gen-field-group">
                  <label className="field-label">Custom Prefix Text</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. VIP, COUNCIL"
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="gen-field-group">
                <label className="field-label">Account Role</label>
                <select 
                  className="field-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="MEMBER">General Member</option>
                  <option value="TREASURER">Treasurer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div className="gen-field-group">
                <label className="field-label">Quantity</label>
                <select 
                  className="field-select"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                >
                  <option value={1}>1 Code</option>
                  <option value={3}>3 Codes</option>
                  <option value={5}>5 Codes</option>
                  <option value={10}>10 Codes (Bulk Batch)</option>
                  <option value={20}>20 Codes (Membership Drive)</option>
                </select>
              </div>
            </div>

            <div className="gen-form-row">
              <div className="gen-field-group flex-2">
                <label className="field-label">Purpose / Meeting / Campaign Note</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. 2026 Q3 General Assembly Membership Drive"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="gen-field-group flex-2">
                <label className="field-label">Optional: Pre-Assign to Member</label>
                <select 
                  className="field-select"
                  value={preAssignedMemberId}
                  onChange={(e) => setPreAssignedMemberId(e.target.value)}
                >
                  <option value="">-- Open Association Code (Anyone with code) --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.email}) {m.isPasswordSet ? '✓ Active' : '⏳ Pending'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="gen-btn-row">
              <button 
                type="submit" 
                className="btn-generate-primary"
                disabled={isGenerating}
              >
                <Plus size={16} />
                <span>{isGenerating ? 'Generating Official Codes...' : `Generate ${quantity} Association Code${quantity > 1 ? 's' : ''}`}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Last Generated Batch Preview / Printable Quick Box */}
        {lastGeneratedBatch && lastGeneratedBatch.length > 0 && (
          <div className="last-batch-card animate-scale-up">
            <div className="batch-header">
              <div className="batch-title-group">
                <CheckCircle2 size={18} className="text-emerald" />
                <span>Newly Created Batch ({lastGeneratedBatch.length} Codes)</span>
              </div>
              <button className="btn-print-slip" onClick={handlePrintBatch}>
                <Printer size={14} />
                <span>Print Slips</span>
              </button>
            </div>
            <div className="batch-chips-list">
              {lastGeneratedBatch.map((b) => (
                <div key={b.id} className="batch-code-chip">
                  <span className="chip-code">{b.code}</span>
                  <div className="chip-actions">
                    <button 
                      className="chip-btn" 
                      onClick={(e) => handleCopyCode(b.code, e)}
                      title="Copy code"
                    >
                      {copiedCode === b.code ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                    </button>
                    <button 
                      className="chip-btn" 
                      onClick={(e) => handleCopyInviteText(b, e)}
                      title="Copy WhatsApp Invite"
                    >
                      <Share2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="batch-footer-hint">
              💡 Share these registration codes with new members to let them activate their accounts online.
            </div>
          </div>
        )}
      </div>

      {/* Code Ledger Table */}
      <div className="code-ledger-card">
        <div className="ledger-header-row">
          <div>
            <h2 className="ledger-title">Association Registration Code Ledger</h2>
            <p className="ledger-sub">Live audit trail of all official registration codes, redemption status, and activated member profiles.</p>
          </div>

          <div className="ledger-controls">
            <div className="ledger-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search codes, members, or purpose notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select 
              className="ledger-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses ({totalCodesCount})</option>
              <option value="AVAILABLE">Available Only ({availableCount})</option>
              <option value="REDEEMED">Redeemed Only ({redeemedCount})</option>
            </select>

            <button className="btn-print-ledger" onClick={handlePrintBatch} title="Print printable voucher sheet">
              <Printer size={16} />
              <span>Print Vouchers</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="table-responsive">
          <table className="codes-table">
            <thead>
              <tr>
                <th>Registration Code</th>
                <th>Role</th>
                <th>Status</th>
                <th>Assigned / Redeemed By</th>
                <th>Purpose / Campaign</th>
                <th>Created Date</th>
                <th className="text-right">Actions & Share</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table-cell">
                    <KeyRound size={32} />
                    <p>No registration codes match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredCodes.map((item) => (
                  <tr key={item.id} className="code-table-row">
                    <td>
                      <div className="code-cell">
                        <span className="code-bold-pill">{item.code}</span>
                        <button 
                          className="btn-copy-icon"
                          onClick={(e) => handleCopyCode(item.code, e)}
                          title="Copy Code"
                        >
                          {copiedCode === item.code ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${item.role?.toLowerCase() || 'member'}`}>
                        {item.role}
                      </span>
                    </td>
                    <td>
                      {item.status === 'AVAILABLE' ? (
                        <span className="status-tag available">
                          <Clock size={12} />
                          Available
                        </span>
                      ) : item.status === 'REDEEMED' ? (
                        <span className="status-tag redeemed">
                          <CheckCircle2 size={12} />
                          Redeemed
                        </span>
                      ) : (
                        <span className="status-tag revoked">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td>
                      {item.redeemedByMemberName ? (
                        <div className="member-cell">
                          <span className="member-name-bold">✓ {item.redeemedByMemberName}</span>
                          <span className="member-meta-sub">Activated: {item.redeemedAt?.split('T')[0] || 'Recently'}</span>
                        </div>
                      ) : item.preAssignedMemberName ? (
                        <div className="member-cell">
                          <span className="member-name-pre">⏳ {item.preAssignedMemberName}</span>
                          <span className="member-meta-sub">{item.preAssignedMemberEmail}</span>
                        </div>
                      ) : (
                        <span className="open-code-badge">🌐 Open Association Code</span>
                      )}
                    </td>
                    <td>
                      <span className="notes-text">{item.notes || 'Official Association Pass'}</span>
                    </td>
                    <td>
                      <span className="date-text">{item.createdAt?.split('T')[0] || '2026-08-30'}</span>
                    </td>
                    <td className="text-right">
                      <div className="row-actions">
                        <button 
                          className="btn-action-share"
                          onClick={(e) => handleCopyInviteText(item, e)}
                          title="Copy WhatsApp / SMS Invite Text"
                        >
                          <Share2 size={13} />
                          <span>Invite</span>
                        </button>

                        <button 
                          className="btn-action-pass"
                          onClick={() => setSelectedPassCode(item)}
                          title="View Printable Pass"
                        >
                          <QrCode size={13} />
                          <span>Pass</span>
                        </button>

                        {item.status === 'AVAILABLE' && (
                          <button 
                            className="btn-action-revoke"
                            onClick={(e) => handleRevoke(item.id, item.code, e)}
                            title="Revoke Code"
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* Printable Vouchers Grid (Visible in Print View) */}
      <div className="printable-vouchers-container print-only">
        <div className="print-header">
          <h2>🕊️ Peace & Love, Adroabaa Registration Passes</h2>
          <p>Hand out these official registration passes to members to join the Association Portal.</p>
        </div>
        <div className="vouchers-grid">
          {filteredCodes.filter(c => c.status === 'AVAILABLE').map((v) => (
            <div key={v.id} className="voucher-card">
              <div className="voucher-top">
                <span className="voucher-brand">Peace & Love, Adroabaa</span>
                <span className="voucher-role">{v.role}</span>
              </div>
              <div className="voucher-code-box">
                <span className="v-label">OFFICIAL REGISTRATION CODE</span>
                <span className="v-code">{v.code}</span>
              </div>
              <p className="voucher-inst">
                Visit our portal, tap <strong>"Register with Code"</strong>, and enter this code to activate your account.
              </p>
              <div className="voucher-footer">
                <span>Pass: {v.notes || 'Official Invitation'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Single Code Invite Modal Popup */}
      {selectedPassCode && (
        <MemberInviteModal
          isOpen={Boolean(selectedPassCode)}
          onClose={() => setSelectedPassCode(null)}
          member={{
            firstName: selectedPassCode.preAssignedMemberName || selectedPassCode.redeemedByMemberName || 'Association',
            lastName: selectedPassCode.preAssignedMemberName ? '' : 'Member',
            memberCode: selectedPassCode.code,
            email: selectedPassCode.preAssignedMemberEmail || 'Member Registration',
            role: selectedPassCode.role,
            city: 'Ghana / International',
          }}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
}

