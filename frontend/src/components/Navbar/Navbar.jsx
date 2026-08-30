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
      case 'dashboard': return userRole === 'ADMIN' ? 'Admin Executive Dashboard' : 'Member Portal Dashboard';
      case 'codes': return 'Official Registration Code Generator';
      case 'chat': return 'Member Community Chat & Support';
      case 'profile': return 'My Profile & Preferences';
      case 'pay-dues': return userRole === 'ADMIN' ? 'Record Dues Payment' : 'Pay My Dues';
      case 'history': return userRole === 'ADMIN' ? 'Payment Transactions & Receipts' : 'My Payment History & Receipts';
      case 'schedules': return 'Dues Schedules & Levies';
      case 'members': return 'Association Member Directory';
      case 'announcements': return 'Notice Board & Bulletins';
      default: return 'Portal';
    }
  };

  const getInitials = () => {
    if (!currentUser) return 'U';
    const f = currentUser.firstName ? currentUser.firstName[0] : '';
    const l = currentUser.lastName ? currentUser.lastName[0] : '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

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
            <span className="brand-title">Peace & Love</span>
            <span className="brand-subtitle">Adroabaa</span>
          </div>
        </div>

        <div className="navbar-divider"></div>

        <div className="current-view-badge">
          <span className="breadcrumb-pill">{getTabTitle()}</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Community Chat Button */}
        <button 
          className={`navbar-chat-btn ${currentTab === 'chat' ? 'active' : ''}`}
          onClick={() => onNavigateTab && onNavigateTab('chat')}
          title="Open Community Chat & Support"
        >
          <MessageSquare size={16} />
          <span>Member Chat</span>
        </button>

        {/* Quick Pay CTA */}
        <button className="navbar-pay-cta" onClick={onOpenPayModal}>
          <CreditCard size={17} />
          <span>{userRole === 'ADMIN' ? 'Record Dues' : 'Pay Dues'}</span>
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
            <span className="logout-btn-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
