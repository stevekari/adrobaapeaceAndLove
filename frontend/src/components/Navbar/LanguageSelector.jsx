import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import './LanguageSelector.css';

export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage, languages, currentLanguageInfo } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`language-selector-wrapper ${compact ? 'compact' : ''}`} ref={dropdownRef}>
      <button 
        type="button" 
        className={`language-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Change Language / Sesamu Kasa"
        aria-label="Change Language"
      >
        <span className="lang-flag">{currentLanguageInfo?.flag}</span>
        {!compact && (
          <span className="lang-name">{currentLanguageInfo?.label}</span>
        )}
        <ChevronDown size={14} className={`lang-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown-menu animate-scale-up">
          <div className="language-dropdown-header">
            <Globe size={13} />
            <span>Select Language</span>
          </div>

          <div className="language-options-list">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`language-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectLanguage(lang.code)}
                >
                  <span className="option-flag">{lang.flag}</span>
                  <span className="option-label">{lang.label}</span>
                  {isSelected && <Check size={14} className="option-check" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

