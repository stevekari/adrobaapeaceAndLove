import React, { useState, useEffect } from 'react';
import MemberAuthPage from './MemberAuthPage';
import AdminAuthPage from './AdminAuthPage';

export default function AuthPage({ onLoginSuccess, showToast }) {
  // Determine initial portal based on current URL
  const [portalMode, setPortalMode] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('admin') || hash.includes('admin')) {
      return 'ADMIN';
    }
    return 'MEMBER';
  });

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('admin') || hash.includes('admin')) {
        setPortalMode('ADMIN');
      } else {
        setPortalMode('MEMBER');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleSwitchToAdmin = () => {
    window.history.pushState(null, '', '/admin-login');
    setPortalMode('ADMIN');
  };

  const handleSwitchToMember = () => {
    window.history.pushState(null, '', '/');
    setPortalMode('MEMBER');
  };

  if (portalMode === 'ADMIN') {
    return (
      <AdminAuthPage 
        onLoginSuccess={onLoginSuccess}
        onSwitchToMember={handleSwitchToMember}
        showToast={showToast}
      />
    );
  }

  return (
    <MemberAuthPage 
      onLoginSuccess={onLoginSuccess}
      onSwitchToAdmin={handleSwitchToAdmin}
      showToast={showToast}
    />
  );
}
