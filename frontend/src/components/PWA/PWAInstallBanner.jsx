import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  X, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import './PWAInstallBanner.css';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // 1. Check if already installed & running in Standalone PWA mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone);
    if (checkStandalone) {
      return; // Already installed, do not show banner
    }

    // 2. Check if device is iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);

    // 3. Listen for Android/Chrome/Edge native beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!isDismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setInstalledSuccess(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      console.log('✅ Peace & Love PWA installed successfully!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // If iOS and not standalone, show banner unless dismissed
    if (isAppleDevice && !checkStandalone) {
      const isDismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!isDismissed) {
        // Small delay for smooth entry
        const timer = setTimeout(() => setShowBanner(true), 2500);
        return () => clearTimeout(timer);
      }
    }

    // 5. Listen for manual trigger from sidebar or navbar
    const handleManualTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowIOSModal(true);
      }
    };

    window.addEventListener('trigger-pwa-install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('trigger-pwa-install', handleManualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native Chromium / Android prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalledSuccess(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS Safari guide
      setShowIOSModal(true);
    } else {
      // Fallback guide
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (isStandalone || installedSuccess || !showBanner) {
    return (
      <>
        {/* iOS Modal if triggered from elsewhere */}
        {showIOSModal && (
          <IOSInstallModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="pwa-install-banner animate-slide-up">
        <div className="pwa-banner-content">
          <div className="pwa-app-badge">
            <div className="pwa-icon-box">
              <img 
                src="/icons/icon.svg" 
                alt="Peace & Love App Icon" 
                className="pwa-badge-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Sparkles size={16} className="pwa-sparkle-badge" />
            </div>
            <div className="pwa-banner-text">
              <div className="pwa-title-row">
                <span className="pwa-app-name">Peace & Love, Adroabaa</span>
                <span className="pwa-pill-tag">Mobile App</span>
              </div>
              <p className="pwa-desc">
                Add to your <strong>Home Screen</strong> for instant 1-tap access, offline receipts, and full-screen experience.
              </p>
            </div>
          </div>

          <div className="pwa-banner-actions">
            <button 
              type="button" 
              className="pwa-install-action-btn"
              onClick={handleInstallClick}
            >
              <Download size={16} />
              <span>Install App</span>
            </button>
            <button 
              type="button" 
              className="pwa-dismiss-btn"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {showIOSModal && (
        <IOSInstallModal onClose={() => setShowIOSModal(false)} />
      )}
    </>
  );
}

// iOS Safari Installation Walkthrough Modal
export function IOSInstallModal({ onClose }) {
  return (
    <div className="ios-pwa-backdrop" onClick={onClose}>
      <div className="ios-pwa-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="ios-pwa-header">
          <div className="ios-pwa-title-group">
            <div className="ios-icon-emblem">
              <img src="/icons/icon.svg" alt="App Logo" className="ios-emblem-img" />
            </div>
            <div>
              <h3>Install Peace & Love App</h3>
              <p>Add to your iPhone or iPad Home Screen in 3 steps</p>
            </div>
          </div>
          <button type="button" className="ios-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="ios-steps-container">
          <div className="ios-step-row">
            <div className="ios-step-badge">1</div>
            <div className="ios-step-text">
              <p>Tap the <strong>Share</strong> button at the bottom of Safari toolbar.</p>
              <div className="ios-step-icon-preview">
                <Share size={20} color="#0284c7" />
                <span>Share Icon (⎋)</span>
              </div>
            </div>
          </div>

          <div className="ios-step-row">
            <div className="ios-step-badge">2</div>
            <div className="ios-step-text">
              <p>Scroll down the options menu and select <strong>"Add to Home Screen"</strong>.</p>
              <div className="ios-step-icon-preview">
                <PlusSquare size={20} color="#059669" />
                <span>Add to Home Screen (➕)</span>
              </div>
            </div>
          </div>

          <div className="ios-step-row">
            <div className="ios-step-badge">3</div>
            <div className="ios-step-text">
              <p>Tap <strong>"Add"</strong> in the top right corner to place the app on your phone home screen.</p>
              <div className="ios-step-icon-preview highlight-done">
                <CheckCircle2 size={18} color="#10b981" />
                <span>Ready to Launch Anytime!</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ios-pwa-footer">
          <button type="button" className="ios-done-btn" onClick={onClose}>
            <span>Got It, Thanks!</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
