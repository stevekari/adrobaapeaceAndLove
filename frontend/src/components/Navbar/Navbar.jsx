import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Bell, 
  CreditCard,
  Menu,
  LogOut,
  Hash,
  MessageSquare,
  User
} from 'lucide-react';
import NotificationDrawer from './NotificationDrawer';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useTranslation } from '../../i18n/LanguageContext';
import { api } from '../../services/api';
import './Navbar.css';

export default function Navbar({ 
  currentTab, 
  onNavigateTab,
  userRole, 
  currentUser,
  onLogout,
  onOpenPayModal, 
  sidebarOpen, 
  setSidebarOpen,
  announcementsCount 
}) {
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for real unread notification count
  useEffect(() => {
    if (!currentUser) return;
    const fetchUnread = async () => {
      try {
        const res = await api.getUnreadNotificationCount(currentUser.id);
        if (res && typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        }
      } catch {
        // Silently handle
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return userRole === 'ADMIN' ? `${t('common.admin')} ${t('nav.dashboard')}` : `${t('common.member')} ${t('nav.dashboard')}`;
      case 'codes': return t('nav.codes');
      case 'chat': return t('nav.chat');
      case 'profile': return t('nav.profile');
      case 'pay-dues': return userRole === 'ADMIN' ? t('nav.record_dues') : t('nav.pay_dues');
      case 'history': return t('nav.history');
      case 'schedules': return t('nav.schedules');
      case 'members': return t('nav.members');
      case 'announcements': return t('nav.announcements');
      default: return 'Portal';
    }
  };

  const getInitials = () => {
    if (!currentUser) return 'U';
    const f = currentUser.firstName ? currentUser.firstName[0] : '';
    const l = currentUser.lastName ? currentUser.lastName[0] : '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  const getCompanyDisplay = () => {
    const full = currentUser?.companyName || 'Peace & Love';
    const sub = currentUser?.companyName ? '' : 'Adroabaa';
    
    // Short company name for mobile devices (e.g. P & L or short name)
    let short = 'P & L';
    if (currentUser?.companyName) {
      const words = currentUser.companyName.trim().split(/\s+/);
      if (words.length > 1) {
        short = words.map(w => w[0]).join('').toUpperCase();
        if (short.length > 4) short = words[0];
      } else {
        short = words[0].substring(0, 6);
      }
    }
    return { full, sub, short };
  };

  const companyInfo = getCompanyDisplay();

  return (
    <header className="portal-navbar">
      <div className="navbar-left">
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-branding">
          <div className="brand-icon-wrapper">
            <Building2 size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title brand-title-full">{companyInfo.full}</span>
            <span className="brand-title brand-title-short">{companyInfo.short}</span>
            {companyInfo.sub && (
              <span className="brand-subtitle">{companyInfo.sub}</span>
            )}
          </div>
        </div>

        <div className="navbar-divider"></div>

        <div className="current-view-badge">
          <span className="breadcrumb-pill">{getTabTitle()}</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Dark / Light Mode Switch */}
        <ThemeToggle />

        {/* Multi-Language Selector Dropdown */}
        <LanguageSelector />

        {/* Quick Community Chat Button */}
        <button 
          className={`navbar-chat-btn ${currentTab === 'chat' ? 'active' : ''}`}
          onClick={() => onNavigateTab && onNavigateTab('chat')}
          title="Open Community Chat & Support"
        >
          <MessageSquare size={16} />
          <span>{t('nav.chat')}</span>
        </button>

        {/* Quick Pay CTA */}
        <button className="navbar-pay-cta" onClick={onOpenPayModal}>
          <CreditCard size={17} />
          <span>{userRole === 'ADMIN' ? t('nav.record_dues') : t('nav.pay_dues')}</span>
        </button>

        {/* Interactive Real Notification Bell */}
        <div className="navbar-bell-wrapper" style={{ position: 'relative' }}>
          <button 
            className={`navbar-icon-btn ${showNotifications ? 'active' : ''}`} 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            title="Real-time activity alerts"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="bell-badge">{unreadCount}</span>
            )}
          </button>

          <NotificationDrawer 
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            currentUser={currentUser}
            onNavigateTab={onNavigateTab}
          />
        </div>

        {/* User Profile & Logout */}
        <div className="navbar-user-box">
          <div 
            className="navbar-user-profile clickable"
            onClick={() => onNavigateTab && onNavigateTab('profile')}
            title="Click to view/edit My Profile"
          >
            {currentUser?.profilePhoto ? (
              <img src={currentUser.profilePhoto} alt="Avatar" className="user-photo-img" />
            ) : (
              <div className={`user-avatar-circle ${currentUser?.role?.toLowerCase() || 'member'}`}>
                {getInitials()}
              </div>
            )}
            <div className="user-profile-info">
              <div className="user-name-line">
                <span className="user-name">
                  {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest User'}
                </span>
                <span className={`navbar-role-pill pill-${currentUser?.role?.toLowerCase() || 'member'}`}>
                  {currentUser?.role || 'MEMBER'}
                </span>
              </div>
              <div className="user-meta-line">
                {currentUser?.memberCode && (
                  <span className="user-code-badge">
                    <Hash size={11} />
                    {currentUser.memberCode}
                  </span>
                )}
                <span className="user-status-dot">
                  <span className="dot-pulse"></span>
                  {currentUser?.city || 'Online'}
                </span>
              </div>
            </div>
          </div>

          <button 
            className="navbar-logout-btn" 
            onClick={onLogout} 
            title="Sign out of Peace & Love, Adroabaa"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span className="logout-btn-text">{t('nav.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
