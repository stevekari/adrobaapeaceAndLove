import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Image as ImageIcon, 
  Trash2, 
  ShieldCheck, 
  User, 
  Sparkles, 
  HelpCircle, 
  Users, 
  CheckCircle2, 
  Volume2, 
  RefreshCw,
  PhoneCall,
  Clock,
  Check,
  X,
  CornerUpLeft,
  Edit3,
  Ban
} from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from '../../i18n/LanguageContext';

// Helper for distinct WhatsApp sender name colors in group chats
const SENDER_COLORS = [
  '#059669', // Emerald green
  '#0284c7', // Sky blue
  '#d97706', // Amber orange
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0d9488', // Teal
  '#ea580c', // Dark orange
  '#4f46e5', // Indigo
];

const getSenderColor = (str) => {
  if (!str) return '#059669';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
};

export default function ChatCenter({ currentUser, userRole, onShowToast }) {
  const { t } = useTranslation();
  const [activeChannel, setActiveChannel] = useState('GENERAL'); // 'GENERAL' | 'SUPPORT' | 'WELFARE'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WhatsApp Reply, Edit & Delete Modal States
  const [replyingTo, setReplyingTo] = useState(null); // { id, senderName, content, messageType, senderRole, senderColor }
  const [editingMessage, setEditingMessage] = useState(null); // { id, content }
  const [deleteTargetMsg, setDeleteTargetMsg] = useState(null); // { id, isOwn }

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioBase64, setAudioBase64] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Image Attachment State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioElementRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  // Preset Quick-Tap Phrases for Non-Typing / Low-Literacy Members
  const quickPhrasesByChannel = {
    GENERAL: [
      { text: "👋 Hello everyone!", emoji: "👋", label: "Say Hello" },
      { text: "🙏 God bless our association", emoji: "🙏", label: "Blessings" },
      { text: "🙌 Good day to all elders & members", emoji: "🙌", label: "Greetings" },
      { text: "👍 Thank you all very much", emoji: "👍", label: "Thank You" },
      { text: "📢 When is our next general meeting?", emoji: "📢", label: "Meeting Info" }
    ],
    SUPPORT: [
      { text: "💳 I just made my dues payment via Mobile Money", emoji: "💳", label: "Paid via MoMo" },
      { text: "❓ Please help check my dues balance", emoji: "❓", label: "Check Balance" },
      { text: "🧾 Can I get my official payment receipt?", emoji: "🧾", label: "Need Receipt" },
      { text: "📞 Please call me regarding my dues", emoji: "📞", label: "Request Call" },
      { text: "✅ Thank you Treasurer, payment is verified", emoji: "✅", label: "Payment Done" }
    ],
    WELFARE: [
      { text: "❤️ Wishing all members good health & peace", emoji: "❤️", label: "Well Wishes" },
      { text: "🎉 Congratulations to our members!", emoji: "🎉", label: "Congrats" },
      { text: "🤝 Let us continue to support our welfare pool", emoji: "🤝", label: "Support Welfare" },
      { text: "🙏 Praying for strength and prosperity for all", emoji: "🙏", label: "Prayers" }
    ]
  };

  // Load Messages from Backend
  const loadMessages = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    try {
      const data = await api.getChatMessages(activeChannel);
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      if (showSpinner) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeChannel]);

  useEffect(() => {
    loadMessages(true);
    // Poll for new messages every 3.5 seconds
    const interval = setInterval(() => {
      loadMessages(false);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeChannel, loadMessages]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get active user with safe localStorage fallback
  const activeUser = currentUser || (() => {
    try {
      const stored = localStorage.getItem('duesportal_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  // Trigger Reply to a message (WhatsApp Style)
  const handleStartReply = (msg) => {
    setEditingMessage(null);
    setReplyingTo({
      id: msg.id,
      senderName: msg.senderName || 'Member',
      content: msg.content,
      messageType: msg.messageType,
      senderRole: msg.senderRole,
      senderColor: getSenderColor(msg.senderName || msg.senderEmail || String(msg.senderId))
    });
    setTimeout(() => textInputRef.current?.focus(), 60);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Trigger Edit of a message (WhatsApp Style)
  const handleStartEdit = (msg) => {
    setReplyingTo(null);
    setEditingMessage({
      id: msg.id,
      content: msg.content
    });
    setInputText(msg.content || '');
    setTimeout(() => textInputRef.current?.focus(), 60);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputText('');
  };

  // Send or Edit Message Handler
  const handleSendMessage = async (customContent = null, messageType = 'TEXT', customAttachment = null) => {
    // If in Edit Mode:
    if (editingMessage) {
      const textToUpdate = customContent !== null ? customContent : inputText;
      if (!textToUpdate.trim()) return;

      setIsSending(true);
      try {
        await api.editChatMessage(editingMessage.id, {
          content: textToUpdate.trim(),
          senderId: activeUser?.id ? Number(activeUser.id) : null,
          senderEmail: activeUser?.email || '',
          userRole: activeUser?.role || userRole
        });

        setEditingMessage(null);
        setInputText('');
        await loadMessages(false);
        if (onShowToast) {
          onShowToast('Message Edited', 'Your message has been updated.', 'info');
        }
      } catch (err) {
        if (onShowToast) onShowToast('Error', err.message || 'Could not edit message', 'error');
      } finally {
        setIsSending(false);
      }
      return;
    }

    // Normal Send / Reply Mode
    const textToSend = customContent !== null ? customContent : inputText;
    const attachmentToSend = customAttachment !== null ? customAttachment : (audioBase64 || imagePreview);

    if (!textToSend.trim() && !attachmentToSend) {
      return;
    }

    setIsSending(true);
    try {
      await api.sendChatMessage({
        senderId: activeUser?.id ? Number(activeUser.id) : null,
        senderEmail: activeUser?.email || '',
        memberCode: activeUser?.memberCode || '',
        channel: activeChannel,
        content: textToSend.trim(),
        messageType: messageType,
        attachmentData: attachmentToSend,
        replyToId: replyingTo ? replyingTo.id : null,
        replyToSenderName: replyingTo ? replyingTo.senderName : null,
        replyToContent: replyingTo ? (replyingTo.content || (replyingTo.messageType === 'VOICE' ? '🎙️ Voice Note' : replyingTo.messageType === 'IMAGE' ? '📸 Photo' : 'Message')) : null,
        replyToMessageType: replyingTo ? replyingTo.messageType : null
      });

      setInputText('');
      setReplyingTo(null);
      setAudioBlob(null);
      setAudioBase64(null);
      setSelectedImage(null);
      setImagePreview(null);
      await loadMessages(false);
      scrollToBottom();
    } catch (err) {
      if (onShowToast) {
        onShowToast('Error', err.message || 'Could not send message', 'error');
      }
    } finally {
      setIsSending(false);
    }
  };

  // Quick-Tap Send Handler
  const handleQuickPhraseClick = (phraseText) => {
    handleSendMessage(phraseText, 'QUICK_PHRASE', null);
    if (onShowToast) {
      onShowToast('Message Sent', `Sent: "${phraseText}"`, 'info');
    }
  };

  // Image Upload Handling
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        if (onShowToast) onShowToast('File Notice', 'Please choose an image under 2MB', 'error');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Audio Voice Note Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);

        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio recording failed:', err);
      if (onShowToast) {
        onShowToast('Microphone Notice', 'Please allow microphone access to record voice notes.', 'error');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioBase64(null);
    setRecordingSeconds(0);
  };

  // Play Audio Note
  const handlePlayAudio = (msgId, base64Audio) => {
    if (playingAudioId === msgId) {
      audioElementRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    const audio = new Audio(base64Audio);
    audioElementRef.current = audio;
    setPlayingAudioId(msgId);

    audio.onended = () => {
      setPlayingAudioId(null);
    };

    audio.play().catch(() => {
      setPlayingAudioId(null);
    });
  };

  // WhatsApp Single Message Delete Confirmation Handler
  const handleOpenDeleteModal = (msg, isOwn) => {
    setDeleteTargetMsg({
      id: msg.id,
      isOwn: isOwn
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetMsg) return;

    try {
      await api.deleteChatMessage(
        deleteTargetMsg.id,
        activeUser?.id ? Number(activeUser.id) : null,
        activeUser?.email || '',
        activeUser?.role || userRole || ''
      );

      setDeleteTargetMsg(null);
      await loadMessages(false);
      if (onShowToast) {
        onShowToast('Message Deleted', 'The message was deleted from the room.', 'info');
      }
    } catch (err) {
      if (onShowToast) onShowToast('Error', err.message || 'Could not delete message', 'error');
      setDeleteTargetMsg(null);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="chat-center-container animate-fade-in">
      {/* Top Channels Header */}
      <div className="chat-header-card">
        <div className="chat-header-main">
          <div className="chat-title-group">
            <div className="chat-icon-badge">
              <MessageSquare size={22} />
            </div>
            <div>
              <h1 className="chat-main-heading">{t('chat.title')}</h1>
              <p className="chat-sub-heading">{t('chat.subtitle')}</p>
            </div>
          </div>

          <button 
            className="chat-refresh-btn" 
            onClick={() => { setIsRefreshing(true); loadMessages(true); }}
            title="Refresh messages"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin-animation' : ''} />
            <span>{t('chat.sync')}</span>
          </button>
        </div>

        {/* Channel Switcher Buttons */}
        <div className="chat-channels-bar">
          <button 
            className={`channel-pill-btn general ${activeChannel === 'GENERAL' ? 'active' : ''}`}
            onClick={() => setActiveChannel('GENERAL')}
          >
            <Users size={16} />
            <span>📢 {t('chat.general_room')}</span>
          </button>

          <button 
            className={`channel-pill-btn support ${activeChannel === 'SUPPORT' ? 'active' : ''}`}
            onClick={() => setActiveChannel('SUPPORT')}
          >
            <HelpCircle size={16} />
            <span>💳 {t('chat.support_room')}</span>
          </button>

          <button 
            className={`channel-pill-btn welfare ${activeChannel === 'WELFARE' ? 'active' : ''}`}
            onClick={() => setActiveChannel('WELFARE')}
          >
            <Sparkles size={16} />
            <span>🤝 {t('chat.welfare_room')}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Stream Card */}
      <div className="chat-stream-card">
        <div className="chat-channel-banner">
          <div className="channel-info-pill">
            <span className="live-dot"></span>
            <strong>
              {activeChannel === 'GENERAL' && t('chat.general_room_title')}
              {activeChannel === 'SUPPORT' && t('chat.support_room_title')}
              {activeChannel === 'WELFARE' && t('chat.welfare_room_title')}
            </strong>
          </div>
          <span className="channel-member-count">
            {messages.length} {t('chat.messages_logged')}
          </span>
        </div>

        {/* Messages Stream */}
        <div className="chat-messages-scroll-area">
          {isLoading ? (
            <div className="chat-loading-state">
              <RefreshCw size={28} className="spin-animation" />
              <p>{t('common.loading')}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <MessageSquare size={44} />
              <h3>{t('chat.no_messages')}</h3>
              <p>{t('chat.no_messages_sub')}</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = currentUser && (msg.senderId === currentUser.id || (currentUser.email && msg.senderEmail === currentUser.email));
              const senderColor = getSenderColor(msg.senderName || msg.senderEmail || String(msg.senderId));
              const isDeleted = Boolean(msg.isDeleted);

              return (
                <div 
                  key={msg.id} 
                  className={`chat-bubble-row ${isOwnMessage ? 'own-message' : 'other-message'} ${isDeleted ? 'is-deleted-row' : ''}`}
                >
                  {/* Sender Avatar for other messages */}
                  {!isOwnMessage && (
                    <div 
                      className={`chat-avatar-circle ${msg.senderRole?.toLowerCase() || 'member'}`}
                      style={{ background: `linear-gradient(135deg, ${senderColor}, #1e293b)` }}
                    >
                      {msg.senderName ? msg.senderName[0].toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="chat-bubble-wrapper">
                    {/* WhatsApp Style Message Bubble */}
                    <div className={`chat-bubble-content ${msg.messageType === 'QUICK_PHRASE' ? 'quick-phrase-bubble' : ''} ${isDeleted ? 'deleted-bubble' : ''}`}>
                      
                      {/* WhatsApp Quoted Reply Header (if this message is replying to another) */}
                      {msg.replyToContent && !isDeleted && (
                        <div 
                          className="whatsapp-quoted-preview"
                          style={{ borderLeftColor: getSenderColor(msg.replyToSenderName) }}
                        >
                          <div className="quote-sender-title" style={{ color: getSenderColor(msg.replyToSenderName) }}>
                            <CornerUpLeft size={11} />
                            <span>{msg.replyToSenderName || t('common.member')}</span>
                          </div>
                          <p className="quote-snippet-text">{msg.replyToContent}</p>
                        </div>
                      )}

                      {/* WhatsApp Group Sender Header (Only for incoming messages) */}
                      {!isOwnMessage && !isDeleted && (
                        <div className="whatsapp-sender-header">
                          <span className="whatsapp-sender-name" style={{ color: senderColor }}>
                            {msg.senderName || t('common.member')}
                          </span>
                          
                          {msg.senderRole && (
                            <span className={`chat-role-tag role-${msg.senderRole.toLowerCase()}`}>
                              {msg.senderRole === 'ADMIN' && 'Admin 🛡️'}
                              {msg.senderRole === 'TREASURER' && 'Treasurer 💳'}
                              {msg.senderRole === 'MEMBER' && 'Member 👤'}
                            </span>
                          )}

                          {msg.senderMemberCode && (
                            <span className="chat-code-pill">{msg.senderMemberCode}</span>
                          )}
                        </div>
                      )}

                      {/* WhatsApp Deleted Message State */}
                      {isDeleted ? (
                        <div className="msg-deleted-box">
                          <Ban size={14} className="deleted-icon" />
                          <span className="deleted-text">
                            {isOwnMessage ? t('chat.you_deleted') : t('chat.this_deleted')}
                          </span>
                        </div>
                      ) : (
                        <>
                          {/* Text Content */}
                          {msg.content && <p className="msg-text">{msg.content}</p>}

                          {/* Voice Note Player */}
                          {msg.messageType === 'VOICE' && msg.attachmentData && (
                            <div className="voice-note-player-box">
                              <button 
                                className="voice-play-btn"
                                onClick={() => handlePlayAudio(msg.id, msg.attachmentData)}
                                aria-label="Play Voice Note"
                              >
                                {playingAudioId === msg.id ? <Pause size={15} /> : <Play size={15} />}
                              </button>
                              <div className="voice-track-bar">
                                <div className="voice-wave-bars">
                                  <span className={`bar ${playingAudioId === msg.id ? 'active' : ''}`}></span>
                                  <span className={`bar ${playingAudioId === msg.id ? 'active' : ''}`}></span>
                                  <span className={`bar ${playingAudioId === msg.id ? 'active' : ''}`}></span>
                                  <span className={`bar ${playingAudioId === msg.id ? 'active' : ''}`}></span>
                                  <span className={`bar ${playingAudioId === msg.id ? 'active' : ''}`}></span>
                                </div>
                                <span className="voice-label">
                                  {playingAudioId === msg.id ? 'Playing Voice Note...' : 'Voice Note'}
                                </span>
                              </div>
                              <Volume2 size={15} className="voice-icon" />
                            </div>
                          )}

                          {/* Image Attachment Preview */}
                          {msg.attachmentData && msg.messageType === 'IMAGE' && (
                            <div className="attached-image-container">
                              <img src={msg.attachmentData} alt="Shared Attachment" className="chat-attached-image" />
                            </div>
                          )}
                        </>
                      )}

                      {/* WhatsApp Bubble Bottom Metadata: Time + Edited + Checkmark */}
                      <div className="whatsapp-bubble-meta">
                        <span className="chat-timestamp">
                          {formatTime(msg.createdAt)}
                        </span>

                        {/* WhatsApp "edited" indicator */}
                        {msg.isEdited && !isDeleted && (
                          <span className="whatsapp-edited-label">edited</span>
                        )}
                        
                        {isOwnMessage && !isDeleted && (
                          <span className="whatsapp-checks" title="Delivered">
                            ✓✓
                          </span>
                        )}
                      </div>

                      {/* WhatsApp Message Action Toolbar (Reply, Edit, Delete) */}
                      {!isDeleted && (
                        <div className="whatsapp-bubble-actions">
                          {/* ↩️ Reply */}
                          <button 
                            type="button"
                            className="action-icon-btn reply-btn"
                            onClick={() => handleStartReply(msg)}
                            title="Reply to message"
                          >
                            <CornerUpLeft size={13} />
                          </button>

                          {/* ✏️ Edit (Owner only on non-voice text) */}
                          {isOwnMessage && msg.messageType !== 'VOICE' && !msg.attachmentData && (
                            <button 
                              type="button"
                              className="action-icon-btn edit-btn"
                              onClick={() => handleStartEdit(msg)}
                              title="Edit message"
                            >
                              <Edit3 size={13} />
                            </button>
                          )}

                          {/* 🗑️ Delete (Only the member who posted it, or Admin/Treasurer for moderation) */}
                          {(isOwnMessage || userRole === 'ADMIN' || userRole === 'TREASURER') && (
                            <button 
                              type="button"
                              className="action-icon-btn delete-btn"
                              onClick={() => handleOpenDeleteModal(msg, isOwnMessage)}
                              title={isOwnMessage ? "Delete your message" : "Delete message as admin"}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ================= ⚡ ACCESSIBLE QUICK-TAP PHRASE TRAY ================= */}
        <div className="quick-tap-section">
          <div className="quick-tap-title">
            <Sparkles size={14} className="sparkle-icon" />
            <span>⚡ 1-Tap Quick Messages (Tap to send instantly):</span>
          </div>
          <div className="quick-phrases-scroll">
            {quickPhrasesByChannel[activeChannel]?.map((phrase, idx) => (
              <button
                key={idx}
                className="quick-phrase-chip"
                onClick={() => handleQuickPhraseClick(phrase.text)}
                disabled={isSending}
                title={`Send "${phrase.text}"`}
              >
                <span className="phrase-emoji">{phrase.emoji}</span>
                <span className="phrase-label">{phrase.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ================= 💬 WHATSAPP REPLY / EDIT BANNER ================= */}
        {replyingTo && (
          <div className="whatsapp-context-banner reply-context animate-slide-down">
            <div className="context-indicator-bar" style={{ backgroundColor: replyingTo.senderColor || '#059669' }}></div>
            <div className="context-content">
              <div className="context-header">
                <CornerUpLeft size={13} style={{ color: replyingTo.senderColor || '#059669' }} />
                <span className="context-title" style={{ color: replyingTo.senderColor || '#059669' }}>
                  {t('chat.replying_to')} {replyingTo.senderName}
                </span>
                {replyingTo.senderRole && (
                  <span className="context-role">({replyingTo.senderRole})</span>
                )}
              </div>
              <p className="context-snippet">
                {replyingTo.messageType === 'VOICE' ? `🎙️ ${t('chat.voice_note')}` : replyingTo.messageType === 'IMAGE' ? '📸 Photo' : replyingTo.content}
              </p>
            </div>
            <button type="button" className="context-cancel-btn" onClick={handleCancelReply} title="Cancel reply">
              <X size={16} />
            </button>
          </div>
        )}

        {editingMessage && (
          <div className="whatsapp-context-banner edit-context animate-slide-down">
            <div className="context-indicator-bar edit-accent"></div>
            <div className="context-content">
              <div className="context-header">
                <Edit3 size={13} color="#0284c7" />
                <span className="context-title edit-title">
                  {t('chat.editing_message')}
                </span>
              </div>
              <p className="context-snippet">{t('chat.editing_sub')}</p>
            </div>
            <button type="button" className="context-cancel-btn" onClick={handleCancelEdit} title="Cancel edit">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input Bar & Actions */}
        <div className="chat-input-toolbar">
          {/* Active Audio Recording Indicator */}
          {isRecording ? (
            <div className="recording-active-bar animate-pulse">
              <div className="recording-wave-dot"></div>
              <span className="recording-timer">{t('chat.recording_voice')} ({recordingSeconds}s)...</span>
              <button className="recording-btn stop" onClick={stopRecording} title="Finish recording">
                <Check size={16} />
                <span>{t('common.done')}</span>
              </button>
              <button className="recording-btn cancel" onClick={cancelRecording} title="Cancel recording">
                <X size={16} />
                <span>{t('common.cancel')}</span>
              </button>
            </div>
          ) : audioBase64 ? (
            <div className="recorded-preview-bar">
              <Volume2 size={18} color="#10b981" />
              <span className="preview-text">{t('chat.voice_note')} ({recordingSeconds}s)</span>
              <button className="send-voice-btn" onClick={() => handleSendMessage(`🎙️ ${t('chat.voice_note')}`, "VOICE", audioBase64)}>
                <Send size={15} />
                <span>{t('common.send')}</span>
              </button>
              <button className="cancel-voice-btn" onClick={() => { setAudioBase64(null); setAudioBlob(null); }}>
                <X size={15} />
              </button>
            </div>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
              className="chat-compose-form"
            >
              {/* Image attachment preview if selected */}
              {imagePreview && (
                <div className="image-preview-thumbnail">
                  <img src={imagePreview} alt="To send" />
                  <button type="button" className="remove-img-btn" onClick={() => { setSelectedImage(null); setImagePreview(null); }}>
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Photo upload button */}
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageSelect}
              />
              <button 
                type="button" 
                className="toolbar-action-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach photo or payment slip"
                disabled={Boolean(editingMessage)}
              >
                <ImageIcon size={19} />
              </button>

              {/* Voice Record button */}
              <button 
                type="button" 
                className="toolbar-action-btn mic-btn"
                onClick={startRecording}
                title="Record voice note"
                disabled={Boolean(editingMessage)}
              >
                <Mic size={19} />
              </button>

              {/* Text Input */}
              <input 
                ref={textInputRef}
                type="text"
                className="chat-text-input"
                placeholder={
                  editingMessage 
                    ? `${t('chat.editing_message')}...` 
                    : replyingTo 
                    ? `${t('chat.replying_to')} ${replyingTo.senderName}...` 
                    : t('chat.type_message')
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
              />

              {/* Send Button */}
              <button 
                type="submit" 
                className={`chat-send-btn ${editingMessage ? 'edit-mode-btn' : ''}`}
                disabled={isSending || (!inputText.trim() && !imagePreview)}
                title={editingMessage ? t('common.save') : t('common.send')}
              >
                {editingMessage ? <Check size={18} /> : <Send size={17} />}
                <span className="send-label">{editingMessage ? t('common.save') : t('common.send')}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ================= 🗑️ WHATSAPP DELETE CONFIRMATION MODAL ================= */}
      {deleteTargetMsg && (
        <div className="whatsapp-modal-overlay animate-fade-in" onClick={() => setDeleteTargetMsg(null)}>
          <div className="whatsapp-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="whatsapp-modal-header">
              <div className="modal-icon-badge">
                <Trash2 size={20} color="#dc2626" />
              </div>
              <div>
                <h3 className="modal-title">{t('chat.delete_title')}</h3>
                <p className="modal-subtitle">{t('chat.delete_subtitle')}</p>
              </div>
            </div>

            <p className="whatsapp-modal-text">
              {deleteTargetMsg.isOwn 
                ? t('chat.delete_own_prompt')
                : t('chat.delete_admin_prompt')}
            </p>

            <div className="whatsapp-modal-actions">
              <button 
                type="button" 
                className="modal-btn delete-for-everyone-btn"
                onClick={handleConfirmDelete}
              >
                <Trash2 size={16} />
                <span>{t('chat.delete_for_everyone')}</span>
              </button>
              
              <button 
                type="button" 
                className="modal-btn cancel-btn"
                onClick={() => setDeleteTargetMsg(null)}
              >
                <span>{t('common.cancel')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
