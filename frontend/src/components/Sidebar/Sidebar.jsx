import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  CalendarClock, 
  Users, 
  Megaphone, 
  Sparkles, 
  ChevronRight, 
  LogOut, 
  User, 
  KeyRound, 
  Hash, 
  Smartphone,
  X,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import './Sidebar.css';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  sidebarOpen, 
  setSidebarOpen, 
  userRole, 
  currentUser, 
  onLogout, 
  stats 
}) {
  const { t } = useTranslation();
  const isAdmin = userRole === 'ADMIN' || userRole === 'TREASURER';

  const navItems = isAdmin ? [
    {
      id: 'dashboard',
      label: `${t('common.admin')} ${t('nav.dashboard')}`,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'codes',
      label: t('nav.codes'),
      icon: KeyRound,
      badge: 'Generator',
      badgeClass: 'badge-emerald',
    },
    {
      id: 'chat',
      label: t('nav.chat'),
      icon: Megaphone,
      badge: 'Live',
      badgeClass: 'badge-emerald',
    },
    {
      id: 'pay-dues',
      label: t('nav.record_dues'),
      icon: CreditCard,
      badge: 'Quick Pay',
      badgeClass: 'badge-emerald',
    },
    {
      id: 'history',
      label: t('nav.history'),
      icon: Receipt,
      badge: stats?.recentPayments?.length || null,
    },
    {
      id: 'schedules',
      label: t('nav.schedules'),
      icon: CalendarClock,
      badge: stats?.totalSchedulesCount || null,
    },
    {
      id: 'members',
      label: t('nav.members'),
      icon: Users,
      badge: stats?.totalMembersCount || null,
    },
    {
      id: 'announcements',
      label: t('nav.announcements'),
      icon: Megaphone,
      badge: stats?.recentAnnouncements?.length || null,
    },
    {
      id: 'profile',
      label: t('nav.profile'),
      icon: User,
      badge: null,
    },
  ] : [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'chat',
      label: t('nav.chat'),
      icon: Megaphone,
      badge: 'Live',
      badgeClass: 'badge-emerald',
    },
    {
      id: 'pay-dues',
      label: t('nav.pay_dues'),
      icon: CreditCard,
      badge: 'Online',
      badgeClass: 'badge-emerald',
    },
    {
      id: 'history',
      label: t('nav.history'),
      icon: Receipt,
      badge: null,
    },
    {
      id: 'announcements',
      label: t('nav.announcements'),
      icon: Megaphone,
      badge: stats?.recentAnnouncements?.length || null,
    },
    {
      id: 'profile',
      label: t('nav.profile'),
      icon: User,
      badge: null,
    },
  ];

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  const getInitials = () => {
    if (!currentUser) return 'U';
    const f = currentUser.firstName ? currentUser.firstName[0] : '';
    const l = currentUser.lastName ? currentUser.lastName[0] : '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Mobile Header Box */}
        <div className="sidebar-mobile-user-header">
          <div className="mobile-user-profile-row">
            {currentUser?.profilePhoto ? (
              <img src={currentUser.profilePhoto} alt="Avatar" className="mobile-drawer-avatar-img" />
            ) : (
              <div className={`mobile-drawer-avatar ${currentUser?.role?.toLowerCase() || 'member'}`}>
                {getInitials()}
              </div>
            )}
            <div className="mobile-drawer-info">
              <span className="mobile-drawer-name">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Peace & Love'}
              </span>
              <div className="mobile-drawer-meta">
                <span className={`mobile-drawer-role role-${currentUser?.role?.toLowerCase() || 'member'}`}>
                  {currentUser?.role || 'MEMBER'}
                </span>
                {currentUser?.memberCode && (
                  <span className="mobile-drawer-code">
                    <Hash size={11} />
                    {currentUser.memberCode}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className="sidebar-close-btn" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-section-title">
          {isAdmin ? 'Administration Suite' : 'Member Menu & Features'}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <div className="nav-btn-content">
                  <Icon size={19} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`nav-badge ${item.badgeClass || ''}`}>
                    {item.badge}
                  </span>
                )}

                {isActive && <ChevronRight size={15} className="active-arrow" />}
              </button>
            );
          })}
        </nav>

        {/* Association Mini Card & Logout */}
        <div className="sidebar-footer-card">
          <div className="footer-card-header">
            <Sparkles size={16} className="sparkle-icon" />
            <span>2026 Fiscal Cycle</span>
          </div>
          <div className="footer-card-body">
            <div className="footer-metric">
              <span className="metric-label">Collection Rate</span>
              <span className="metric-val">{stats?.collectionRate || 0}%</span>
            </div>
            <div className="footer-progress-bar">
              <div 
                className="footer-progress-fill" 
                style={{ width: `${Math.min(100, stats?.collectionRate || 0)}%` }} 
              />
            </div>
          </div>

          <button 
            type="button" 
            className="sidebar-install-app-btn" 
            onClick={() => {
              sessionStorage.removeItem('pwa_banner_dismissed');
              window.dispatchEvent(new CustomEvent('trigger-pwa-install'));
            }}
            title="Add to Home Screen"
          >
            <Smartphone size={16} />
            <span>Install App on Phone</span>
          </button>

          <button 
            type="button"
            className="sidebar-logout-btn" 
            onClick={() => {
              if (window.innerWidth <= 900) setSidebarOpen(false);
              onLogout();
            }} 
            title="Sign out of Peace & Love"
          >
            <LogOut size={16} />
            <span>Log Out of Account</span>
          </button>
        </div>
      </aside>
    </>
  );
}
