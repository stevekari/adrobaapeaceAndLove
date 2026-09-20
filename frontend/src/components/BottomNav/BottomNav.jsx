import React from 'react';
import { 
  Home, 
  MessageSquare, 
  CreditCard, 
  Receipt, 
  User, 
  Users, 
  KeyRound, 
  Menu,
  Sparkles,
  CalendarClock
} from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import './BottomNav.css';

export default function BottomNav({ 
  currentTab, 
  onNavigateTab, 
  userRole, 
  currentUser,
  onOpenPayModal,
  sidebarOpen,
  setSidebarOpen,
  unreadCount = 0
}) {
  const { t } = useTranslation();
  const isAdmin = userRole === 'ADMIN' || userRole === 'TREASURER';

  const memberTabs = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: Home,
      badge: null
    },
    {
      id: 'chat',
      label: t('nav.chat'),
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null,
      isDot: unreadCount === 0
    },
    {
      id: 'pay-dues',
      label: t('nav.pay_dues'),
      icon: CreditCard,
      isCenterAction: true
    },
    {
      id: 'history',
      label: t('nav.history'),
      icon: Receipt,
      badge: null
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      isMenu: true
    }
  ];

  const adminTabs = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: Home,
      badge: null
    },
    {
      id: 'members',
      label: t('nav.members'),
      icon: Users,
      badge: null
    },
    {
      id: 'pay-dues',
      label: t('nav.record_dues'),
      icon: CreditCard,
      isCenterAction: true
    },
    {
      id: 'codes',
      label: t('nav.codes'),
      icon: KeyRound,
      badge: null
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: Menu,
      isMenu: true
    }
  ];

  const tabs = isAdmin ? adminTabs : memberTabs;

  const handleTabClick = (tab) => {
    if (tab.isMenu) {
      setSidebarOpen(!sidebarOpen);
      return;
    }
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
    if (tab.isCenterAction && onOpenPayModal) {
      onOpenPayModal();
      return;
    }
    onNavigateTab(tab.id);
  };

  const getInitials = () => {
    if (!currentUser) return 'U';
    const f = currentUser.firstName ? currentUser.firstName[0] : '';
    const l = currentUser.lastName ? currentUser.lastName[0] : '';
    return `${f}${l}`.toUpperCase() || 'U';
  };

  return (
    <nav className="fb-bottom-nav" aria-label="Mobile Bottom Navigation">
      <div className="fb-bottom-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isMenu ? sidebarOpen : (currentTab === tab.id && !sidebarOpen);

          if (tab.isCenterAction) {
            return (
              <button
                key={tab.id}
                type="button"
                className={`fb-center-action-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
                aria-label={tab.label}
              >
                <div className="fb-center-icon-wrapper">
                  <CreditCard size={22} className="fb-center-icon" />
                  <Sparkles size={12} className="fb-center-sparkle" />
                </div>
                <span className="fb-nav-label fb-center-label">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              className={`fb-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
              aria-label={tab.label}
            >
              <div className="fb-icon-container">
                {tab.isMenu ? (
                  <div className="fb-menu-avatar-wrapper">
                    {currentUser?.profilePhoto ? (
                      <img 
                        src={currentUser.profilePhoto} 
                        alt="Menu" 
                        className={`fb-profile-avatar ${isActive ? 'active-border' : ''}`} 
                      />
                    ) : (
                      <div className={`fb-avatar-initials ${isActive ? 'active-border' : ''}`}>
                        {getInitials()}
                      </div>
                    )}
                    <div className="fb-menu-mini-badge">
                      <Menu size={10} />
                    </div>
                  </div>
                ) : (
                  <Icon size={22} className="fb-nav-icon" />
                )}

                {tab.badge && (
                  <span className="fb-badge-count">{tab.badge}</span>
                )}
                {tab.isDot && (
                  <span className="fb-badge-dot"></span>
                )}
              </div>
              <span className="fb-nav-label">{tab.label}</span>
              {isActive && <div className="fb-active-indicator" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

