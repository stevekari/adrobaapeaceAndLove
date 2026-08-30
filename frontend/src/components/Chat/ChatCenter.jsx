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
  X
} from 'lucide-react';
import { api } from '../../services/api';
import './ChatCenter.css';

export default function ChatCenter({ currentUser, userRole, onShowToast }) {
  const [activeChannel, setActiveChannel] = useState('GENERAL'); // 'GENERAL' | 'SUPPORT' | 'WELFARE'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Send Standard Text / Quick Phrase Message
  const handleSendMessage = async (customContent = null, messageType = 'TEXT', customAttachment = null) => {
    const textToSend = customContent !== null ? customContent : inputText;
    const attachmentToSend = customAttachment !== null ? customAttachment : (audioBase64 || imagePreview);

    if (!textToSend.trim() && !attachmentToSend) {
      return;
    }

    setIsSending(true);
    try {
      await api.sendChatMessage({
        senderId: currentUser?.id,
        channel: activeChannel,
        content: textToSend.trim(),
        messageType: messageType,
        attachmentData: attachmentToSend
      });

      setInputText('');
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

  // Delete Message (Admin/Treasurer Moderation)
  const handleDeleteMessage = async (msgId) => {
    if (window.confirm('Are you sure you want to delete this message from the channel?')) {
      try {
        await api.deleteChatMessage(msgId);
        await loadMessages(false);
        if (onShowToast) {
          onShowToast('Message Removed', 'Message was deleted from the community channel.', 'info');
        }
      } catch (err) {
        if (onShowToast) onShowToast('Error', err.message || 'Could not delete message', 'error');
      }
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
              <h1 className="chat-main-heading">Association Community Chat & Support</h1>
              <p className="chat-sub-heading">
                Friendly communication hub for all members. Send messages, voice notes, or tap quick 1-click phrases!
              </p>
            </div>
          </div>

          <button 
            className="chat-refresh-btn" 
            onClick={() => { setIsRefreshing(true); loadMessages(true); }}
            title="Refresh messages"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin-animation' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {/* Channel Switcher Buttons */}
        <div className="chat-channels-bar">
          <button 
            className={`channel-pill-btn general ${activeChannel === 'GENERAL' ? 'active' : ''}`}
            onClick={() => setActiveChannel('GENERAL')}
          >
            <Users size={16} />
            <span>📢 General Community Chat</span>
          </button>

          <button 
            className={`channel-pill-btn support ${activeChannel === 'SUPPORT' ? 'active' : ''}`}
            onClick={() => setActiveChannel('SUPPORT')}
          >
            <HelpCircle size={16} />
            <span>💳 Dues & Payments Help</span>
          </button>

          <button 
            className={`channel-pill-btn welfare ${activeChannel === 'WELFARE' ? 'active' : ''}`}
            onClick={() => setActiveChannel('WELFARE')}
          >
            <Sparkles size={16} />
            <span>🤝 Welfare & Social Corner</span>
          </button>
        </div>
      </div>

      {/* Main Chat Stream Card */}
      <div className="chat-stream-card">
        <div className="chat-channel-banner">
          <div className="channel-info-pill">
            <span className="live-dot"></span>
            <strong>
              {activeChannel === 'GENERAL' && '📢 General Member Room'}
              {activeChannel === 'SUPPORT' && '💳 Dues, Receipts & Payment Inquiries'}
              {activeChannel === 'WELFARE' && '🤝 Welfare Support & Fellowship'}
            </strong>
          </div>
          <span className="channel-member-count">
            {messages.length} messages logged
          </span>
        </div>

        {/* Messages Stream */}
        <div className="chat-messages-scroll-area">
          {isLoading ? (
            <div className="chat-loading-state">
              <RefreshCw size={28} className="spin-animation" />
              <p>Loading channel conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <MessageSquare size={44} />
              <h3>No Messages Yet in This Room</h3>
              <p>Be the first to say hello or tap one of the quick phrase buttons below!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = currentUser && msg.senderId === currentUser.id;
              const isOfficer = msg.senderRole === 'ADMIN' || msg.senderRole === 'TREASURER';

              return (
                <div 
                  key={msg.id} 
                  className={`chat-bubble-row ${isOwnMessage ? 'own-message' : 'other-message'}`}
                >
                  {/* Sender Avatar for other messages */}
                  {!isOwnMessage && (
                    <div className={`chat-avatar-circle ${msg.senderRole?.toLowerCase() || 'member'}`}>
                      {msg.senderName ? msg.senderName[0] : 'U'}
                    </div>
                  )}

                  <div className="chat-bubble-wrapper">
                    {/* Header with Name & Role Badge */}
                    <div className="chat-bubble-header">
                      <span className="chat-sender-name">
                        {isOwnMessage ? 'You' : msg.senderName}
                      </span>
                      
                      <span className={`chat-role-tag role-${msg.senderRole?.toLowerCase() || 'member'}`}>
                        {msg.senderRole === 'ADMIN' && 'Admin 🛡️'}
                        {msg.senderRole === 'TREASURER' && 'Treasurer 💳'}
                        {msg.senderRole === 'MEMBER' && 'Member 👤'}
                      </span>

                      {msg.senderMemberCode && (
                        <span className="chat-code-pill">{msg.senderMemberCode}</span>
                      )}

                      <span className="chat-timestamp">
                        <Clock size={11} />
                        {formatTime(msg.createdAt)}
                      </span>

                      {/* Admin Delete Action */}
                      {(userRole === 'ADMIN' || isOwnMessage) && (
                        <button 
                          className="msg-delete-btn"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className={`chat-bubble-content ${msg.messageType === 'QUICK_PHRASE' ? 'quick-phrase-bubble' : ''}`}>
                      {msg.content && <p className="msg-text">{msg.content}</p>}

                      {/* Voice Note Player */}
                      {msg.messageType === 'VOICE' && msg.attachmentData && (
                        <div className="voice-note-player-box">
                          <button 
                            className="voice-play-btn"
                            onClick={() => handlePlayAudio(msg.id, msg.attachmentData)}
                            aria-label="Play Voice Note"
                          >
                            {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} />}
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
                              {playingAudioId === msg.id ? 'Playing Voice Clip...' : 'Voice Note Message'}
                            </span>
                          </div>
                          <Volume2 size={16} className="voice-icon" />
                        </div>
                      )}

                      {/* Image Attachment Preview */}
                      {msg.attachmentData && msg.messageType === 'IMAGE' && (
                        <div className="attached-image-container">
                          <img src={msg.attachmentData} alt="Shared Attachment" className="chat-attached-image" />
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

        {/* Input Bar & Actions */}
        <div className="chat-input-toolbar">
          {/* Active Audio Recording Indicator */}
          {isRecording ? (
            <div className="recording-active-bar animate-pulse">
              <div className="recording-wave-dot"></div>
              <span className="recording-timer">Recording Voice Note ({recordingSeconds}s)...</span>
              <button className="recording-btn stop" onClick={stopRecording} title="Finish recording">
                <Check size={16} />
                <span>Done</span>
              </button>
              <button className="recording-btn cancel" onClick={cancelRecording} title="Cancel recording">
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          ) : audioBase64 ? (
            <div className="recorded-preview-bar">
              <Volume2 size={18} color="#10b981" />
              <span className="preview-text">Voice note ready ({recordingSeconds}s)</span>
              <button className="send-voice-btn" onClick={() => handleSendMessage("🎙️ Voice Note", "VOICE", audioBase64)}>
                <Send size={15} />
                <span>Send Voice Note</span>
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
              >
                <ImageIcon size={19} />
              </button>

              {/* Voice Record button */}
              <button 
                type="button" 
                className="toolbar-action-btn mic-btn"
                onClick={startRecording}
                title="Record voice note"
              >
                <Mic size={19} />
              </button>

              {/* Text Input */}
              <input 
                type="text"
                className="chat-text-input"
                placeholder="Type your message here, or tap any quick phrase above..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
              />

              {/* Send Button */}
              <button 
                type="submit" 
                className="chat-send-btn"
                disabled={isSending || (!inputText.trim() && !imagePreview)}
              >
                <Send size={17} />
                <span className="send-label">Send</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

