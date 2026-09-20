import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { useTranslation } from '../../i18n/LanguageContext';
import './ThemeToggle.css';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useTranslation();

  const labelText = isDark 
    ? (t('common.light_mode') || 'Light Mode') 
    : (t('common.dark_mode') || 'Dark Mode');

  const tooltipText = isDark 
    ? (t('common.switch_to_light') || 'Switch to Light Mode') 
    : (t('common.switch_to_dark') || 'Switch to Dark Mode');

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${isDark ? 'dark' : 'light'} ${className}`}
      onClick={toggleTheme}
      title={tooltipText}
      aria-label={tooltipText}
      aria-pressed={isDark}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          {isDark ? (
            <Moon size={15} className="theme-icon moon-icon" />
          ) : (
            <Sun size={15} className="theme-icon sun-icon" />
          )}
        </div>
      </div>
      {showLabel && <span className="theme-toggle-label">{labelText}</span>}
    </button>
  );
}

