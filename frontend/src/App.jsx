import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import MemberDashboard from './components/Dashboard/MemberDashboard';
import ProfilePage from './components/Profile/ProfilePage';
import CodeGeneratorHub from './components/Codes/CodeGeneratorHub';
import DuesForm from './components/DuesForm/DuesForm';
import PaymentHistory from './components/PaymentHistory/PaymentHistory';
import DuesSchedules from './components/DuesSchedules/DuesSchedules';
import ScheduleModal from './components/ScheduleModal/ScheduleModal';
import MemberList from './components/Members/MemberList';
import MemberModal from './components/Members/MemberModal';
import AnnouncementBoard from './components/Announcements/AnnouncementBoard';
import AnnouncementModal from './components/Announcements/AnnouncementModal';
import ReceiptModal from './components/ReceiptModal/ReceiptModal';
import ChatCenter from './components/Chat/ChatCenter';
import AuthPage from './components/Auth/AuthPage';
import BottomNav from './components/BottomNav/BottomNav';
import PWAInstallBanner from './components/PWA/PWAInstallBanner';
import Toast from './components/Toast/Toast';
import { api } from './services/api';
import './App.css';

export default function App() {
  // Authentication State with localStorage persistence
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('duesportal_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Navigation & Role State (derived from authenticated currentUser)
  const [currentTab, setCurrentTab] = useState('dashboard');
  const userRole = currentUser ? currentUser.role : 'MEMBER';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data State
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [scheduleProgress, setScheduleProgress] = useState([]);
  const [payments, setPayments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Flow State
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [payPreselectedSchedule, setPayPreselectedSchedule] = useState(null);
  const [payPreselectedMember, setPayPreselectedMember] = useState(null);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load all data from Spring Boot REST backend
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [statsData, membersData, schedulesData, progressData, paymentsData, announcementsData] = 
        await Promise.all([
          api.getDashboardStats().catch(() => null),
          api.getMembers().catch(() => []),
          api.getSchedules().catch(() => []),
          api.getScheduleProgress().catch(() => []),
          api.getPayments().catch(() => []),
          api.getAnnouncements().catch(() => []),
        ]);

      if (statsData) setStats(statsData);
      if (membersData) setMembers(membersData);
      
      if (schedulesData && schedulesData.length > 0) {
        setSchedules(schedulesData);
      } else {
        // Auto-seed the 3 standard schedules into database if empty
        try {
          const s1 = await api.createSchedule({
            title: 'Monthly Dues Levy',
            amount: 50.00,
            frequency: 'Monthly',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Standard monthly member welfare contributions, emergency support pool, and operational fund.',
            active: true
          });
          const s2 = await api.createSchedule({
            title: 'Annual Dues Levy',
            amount: 200.00,
            frequency: 'Annual',
            dueDate: `${new Date().getFullYear()}-12-31`,
            description: 'Mandatory annual association membership levy supporting administration and governance.',
            active: true
          });
          const s3 = await api.createSchedule({
            title: 'Donation Levy',
            amount: 100.00,
            frequency: 'One-Time',
            dueDate: `${new Date().getFullYear()}-12-31`,
            description: 'Voluntary community support, project developments, emergency funds, and member donations.',
            active: true
          });
          const seeded = [s1, s2, s3].filter(Boolean);
          if (seeded.length > 0) setSchedules(seeded);
        } catch (e) {
          console.warn('Could not auto-seed default schedules:', e);
        }
      }

      if (progressData) setScheduleProgress(progressData);
      if (paymentsData) setPayments(paymentsData);
      if (announcementsData) setAnnouncements(announcementsData);
    } catch (err) {
      console.error('Failed loading portal data:', err);
      showToast('Connection Notice', 'Connecting to Association backend database...', 'info');
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  // Auth Handlers
  const handleLoginSuccess = (authData) => {
    localStorage.setItem('duesportal_user', JSON.stringify(authData));
    setCurrentUser(authData);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('duesportal_user');
    setCurrentUser(null);
    showToast('Signed Out', 'You have been successfully logged out of Peace & Love, Adroabaa.', 'info');
  };

  // Payment Recording / Submission
  const handleRecordPayment = async (payload) => {
    try {
      let finalPayload = { ...payload };

      let currentSchedules = schedules;
      if (!currentSchedules || currentSchedules.length === 0) {
        currentSchedules = await api.getSchedules().catch(() => []);
      }

      // Find best matching real schedule in database
      let match = null;
      if (finalPayload.scheduleId) {
        match = currentSchedules.find(s => s.id?.toString() === finalPayload.scheduleId?.toString());
      }
      if (!match && finalPayload.duesPurpose) {
        match = currentSchedules.find(s => s.title?.toLowerCase() === finalPayload.duesPurpose?.toLowerCase());
      }
      if (!match && currentSchedules.length > 0) {
        match = currentSchedules[0];
      }

      if (!match) {
        // Auto-create standard schedule in DB to obtain real DB ID
        const purpose = finalPayload.duesPurpose || 'Monthly Dues Levy';
        const created = await api.createSchedule({
          title: purpose,
          amount: Number(finalPayload.amountPaid) || 50.00,
          frequency: purpose.toLowerCase().includes('annual') ? 'Annual' : purpose.toLowerCase().includes('donation') ? 'One-Time' : 'Monthly',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: `Standard ${purpose} schedule`,
          active: true
        }).catch(() => null);

        if (created && created.id) {
          match = created;
        }
      }

      if (match && match.id) {
        finalPayload.scheduleId = Number(match.id);
      }

      const createdPayment = await api.recordPayment(finalPayload);
      showToast(
        'Payment Verified & Recorded!',
        `Receipt #${createdPayment.receiptNumber} successfully logged in General Ledger.`,
        'success'
      );
      await loadData();
      return createdPayment;
    } catch (err) {
      showToast('Payment Failed', err.message || 'Could not record transaction', 'error');
      throw err;
    }
  };

  // Member CRUD
  const handleSaveMember = async (memberData) => {
    try {
      if (memberData.id) {
        const updated = await api.updateMember(memberData.id, memberData);
        showToast('Member Updated', `Profile for ${memberData.firstName} ${memberData.lastName} was saved.`, 'success');
        await loadData();
        return updated;
      } else {
        const created = await api.createMember(memberData);
        showToast('Member Registered', `Successfully registered ${created.firstName} ${created.lastName} (Code: ${created.memberCode}).`, 'success');
        await loadData();
        return created;
      }
    } catch (err) {
      showToast('Error', err.message || 'Could not save member', 'error');
      throw err;
    }
  };

  const handleDeleteMember = async (id) => {
    await api.deleteMember(id);
    await loadData();
  };

  const handleCleanSlate = async () => {
    try {
      await api.cleanSlateMembers(currentUser?.id);
      showToast('Clean Slate Applied', 'Sample demo members cleared. Only your active admin and real members remain.', 'success');
      await loadData();
    } catch (err) {
      showToast('Error', err.message || 'Could not clear demo records', 'error');
    }
  };

  // Schedule CRUD
  const handleSaveSchedule = async (scheduleData) => {
    try {
      if (scheduleData.id) {
        await api.updateSchedule(scheduleData.id, scheduleData);
        showToast('Schedule Updated', `Dues levy "${scheduleData.title}" was updated.`, 'success');
      } else {
        await api.createSchedule(scheduleData);
        showToast('Schedule Created', `New dues schedule "${scheduleData.title}" is now active.`, 'success');
      }
      await loadData();
    } catch (err) {
      showToast('Error', err.message || 'Could not save dues schedule', 'error');
    }
  };

  const handleDeleteSchedule = async (id) => {
    await api.deleteSchedule(id);
    await loadData();
  };

  // Announcement CRUD
  const handleSaveAnnouncement = async (data) => {
    try {
      if (data.id) {
        await api.updateAnnouncement(data.id, data);
        showToast('Notice Updated', 'Announcement was successfully updated.', 'success');
      } else {
        const authorId = currentUser?.id || data.authorId;
        await api.createAnnouncement(data, authorId);
        showToast('Notice Published', 'New bulletin broadcasted to association members.', 'success');
      }
      await loadData();
    } catch (err) {
      showToast('Error', err.message || 'Could not post notice', 'error');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    await api.deleteAnnouncement(id);
    await loadData();
  };

  // Payment Status Update
  const handleUpdatePaymentStatus = async (id, status) => {
    try {
      await api.updatePaymentStatus(id, status);
      showToast('Status Updated', `Transaction status changed to ${status}.`, 'success');
      await loadData();
    } catch (err) {
      showToast('Error', err.message || 'Could not update status', 'error');
    }
  };

  // Quick Action Navigation Helpers
  const handleOpenPayModal = (scheduleId = null, memberId = null) => {
    setPayPreselectedSchedule(scheduleId);
    setPayPreselectedMember(memberId || (userRole === 'MEMBER' && currentUser ? currentUser.id : null));
    setCurrentTab('pay-dues');
  };

  // If user is not authenticated, show modern AuthPage
  if (!currentUser) {
    return (
      <div className="portal-root-layout">
        <Toast toasts={toasts} onDismiss={dismissToast} />
        <AuthPage onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        <PWAInstallBanner />
      </div>
    );
  }

  // Filter payments for member view if logged in as regular member
  const visiblePayments = userRole === 'MEMBER' && currentUser
    ? payments.filter((p) => p.member?.id === currentUser.id)
    : payments;

  return (
    <div className="portal-root-layout">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigateTab={setCurrentTab}
        userRole={userRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenPayModal={() => handleOpenPayModal()}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        announcementsCount={announcements.length}
      />

      <div className="portal-main-body">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userRole={userRole}
          currentUser={currentUser}
          onLogout={handleLogout}
          stats={stats}
        />

        {/* Dynamic Center Content View */}
        <main className="portal-content-view">
          {currentTab === 'dashboard' && (
            userRole === 'MEMBER' ? (
              <MemberDashboard
                currentUser={currentUser}
                schedules={schedules}
                recentPayments={visiblePayments}
                announcements={announcements}
                onNavigateTab={setCurrentTab}
                onOpenPayModal={handleOpenPayModal}
                onViewReceipt={(receipt) => setActiveReceipt(receipt)}
              />
            ) : (
              <Dashboard
                stats={stats}
                schedules={schedules}
                recentPayments={visiblePayments}
                announcements={announcements}
                onNavigateTab={setCurrentTab}
                onOpenPayModal={() => handleOpenPayModal()}
                onOpenMemberModal={() => setMemberModalOpen(true)}
                onOpenScheduleModal={() => setScheduleModalOpen(true)}
                onOpenAnnouncementModal={() => setAnnouncementModalOpen(true)}
                onCleanSlate={handleCleanSlate}
                onViewReceipt={(receipt) => setActiveReceipt(receipt)}
                userRole={userRole}
                currentUser={currentUser}
              />
            )
          )}

          {currentTab === 'codes' && (
            <CodeGeneratorHub
              currentUser={currentUser}
              members={members}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'chat' && (
            <ChatCenter
              currentUser={currentUser}
              userRole={userRole}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'pay-dues' && (
            <DuesForm
              members={members}
              schedules={schedules}
              onSubmitPayment={handleRecordPayment}
              userRole={userRole}
              currentMemberId={payPreselectedMember || (userRole === 'MEMBER' && currentUser ? currentUser.id : null)}
              preselectedScheduleId={payPreselectedSchedule}
              onSuccessReceipt={(receipt) => setActiveReceipt(receipt)}
            />
          )}

          {currentTab === 'history' && (
            <PaymentHistory
              payments={visiblePayments}
              onViewReceipt={(receipt) => setActiveReceipt(receipt)}
              onOpenPayModal={() => handleOpenPayModal()}
              userRole={userRole}
              onUpdateStatus={handleUpdatePaymentStatus}
            />
          )}

          {currentTab === 'schedules' && (
            <DuesSchedules
              schedules={schedules}
              progressList={scheduleProgress}
              userRole={userRole}
              onSaveSchedule={handleSaveSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              onSelectPaySchedule={(schId) => handleOpenPayModal(schId, null)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'members' && (
            <MemberList
              members={members}
              userRole={userRole}
              currentUser={currentUser}
              onSaveMember={handleSaveMember}
              onDeleteMember={handleDeleteMember}
              onCleanSlate={handleCleanSlate}
              onSelectPayMember={(mId) => handleOpenPayModal(null, mId)}
              onViewReceipt={(receipt) => setActiveReceipt(receipt)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'announcements' && (
            <AnnouncementBoard
              announcements={announcements}
              members={members}
              userRole={userRole}
              onSaveAnnouncement={handleSaveAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          onShowToast={showToast}
        />
      )}

      {/* Quick Action Modals from Dashboard */}
      <MemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onSave={handleSaveMember}
        memberToEdit={null}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
        scheduleToEdit={null}
      />

      <AnnouncementModal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        onSave={handleSaveAnnouncement}
        announcementToEdit={null}
        members={members}
      />

      {/* Facebook-Style Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onNavigateTab={setCurrentTab}
        userRole={userRole}
        currentUser={currentUser}
        onOpenPayModal={() => handleOpenPayModal()}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        unreadCount={announcements.length}
      />

      {/* Global PWA Install on Home Screen Assistant */}
      <PWAInstallBanner />
    </div>
  );
}
