import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  MessageSquare, 
  CreditCard, 
  Megaphone, 
  Users, 
  Info, 
  X, 
  ExternalLink,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import './NotificationDrawer.css';

export default function NotificationDrawer({ 
  isOpen, 
  onClose, 
  currentUser, 
  onNavigateTab 
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const drawerRef = useRef(null);

  const loadNotifications = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await api.getNotifications(currentUser.id);
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, currentUser]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleNotificationClick = async (n) => {
    try {
      if (!n.isRead) {
        await api.markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }

    // Target tab: default to 'chat' (message place) unless specific linkTab is provided
    const targetTab = (n.linkTab && n.linkTab.trim()) ? n.linkTab.trim().toLowerCase() : 'chat';
    if (onNavigateTab) {
      onNavigateTab(targetTab);
      onClose();
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      await api.markAllNotificationsRead(currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'CHAT': return <MessageSquare size={17} color="#0284c7" />;
      case 'PAYMENT': return <CreditCard size={17} color="#10b981" />;
      case 'ANNOUNCEMENT': return <Megaphone size={17} color="#f59e0b" />;
      case 'MEMBER': return <Users size={17} color="#8b5cf6" />;
      default: return <Info size={17} color="#64748b" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notification-drawer-overlay animate-fade-in" ref={drawerRef}>
      <div className="notification-drawer-card">
        {/* Header - Clicking Association Activity Alerts navigates to Messages/Chat */}
        <div className="drawer-header">
          <div 
            className="drawer-title-group clickable" 
            onClick={() => {
              if (onNavigateTab) onNavigateTab('chat');
              onClose();
            }}
            title="Open Community Messages & Chat"
          >
            <div className="bell-badge-icon">
              <Bell size={18} />
            </div>
            <div>
              <div className="drawer-heading-row">
                <h3 className="drawer-heading">Association Activity Alerts</h3>
                <ArrowRight size={13} className="heading-arrow" />
              </div>
              <span className="drawer-subtitle">
                {unreadCount > 0 ? `${unreadCount} unread · Tap to view messages` : 'Tap to open messages'}
              </span>
            </div>
          </div>

          <div className="drawer-actions-top">
            {unreadCount > 0 && (
              <button 
                className="mark-all-btn" 
                onClick={handleMarkAllRead}
                title="Mark all notifications as read"
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>
            )}
            <button className="drawer-close-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-stream">
          {loading ? (
            <div className="drawer-empty-state">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="drawer-empty-state">
              <Bell size={36} color="#cbd5e1" />
              <p>No new notifications right now.</p>
              <button 
                type="button" 
                className="open-chat-empty-btn"
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('chat');
                  onClose();
                }}
              >
                <MessageSquare size={14} />
                <span>Open Community Chat Room</span>
              </button>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`notification-item-row ${!n.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(n)}
                title="Click to view message and discussion"
              >
                <div className="notification-icon-box">
                  {getIcon(n.type)}
                </div>

                <div className="notification-details">
                  <div className="notification-title-bar">
                    <span className="notif-title">{n.title}</span>
                    {!n.isRead && <span className="unread-dot"></span>}
                  </div>
                  <p className="notif-body">{n.message}</p>
                  
                  <div className="notif-meta">
                    <span className="notif-time">
                      <Clock size={11} />
                      {formatTime(n.createdAt)}
                    </span>
                    <span className="notif-link-badge">
                      <span>View Message</span>
                      <ExternalLink size={11} />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Quick Action Footer */}
        <div className="drawer-footer">
          <button 
            type="button" 
            className="drawer-footer-chat-btn"
            onClick={() => {
              if (onNavigateTab) onNavigateTab('chat');
              onClose();
            }}
          >
            <MessageSquare size={15} />
            <span>Open Community Chat & Support</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
