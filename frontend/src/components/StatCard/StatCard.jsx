import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import './StatCard.css';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = 'primary',
  trend,
  trendPositive,
  onClick,
  actionHint
}) {
  const isClickable = Boolean(onClick);

  return (
    <div 
      className={`stat-card stat-card-${variant} ${isClickable ? 'clickable' : ''}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      title={isClickable ? actionHint || `Click to view ${title}` : undefined}
    >
      <div className="stat-card-header">
        <div className="stat-card-info">
          <div className="stat-title-row">
            <span className="stat-card-title">{title}</span>
            {isClickable && (
              <span className="stat-click-indicator">
                <ArrowUpRight size={14} />
              </span>
            )}
          </div>
          <div className="stat-card-value">{value}</div>
        </div>
        <div className={`stat-icon-badge badge-bg-${variant}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>

      <div className="stat-card-footer">
        {trend && (
          <span className={`stat-trend ${trendPositive ? 'trend-up' : 'trend-neutral'}`}>
            {trend}
          </span>
        )}
        <span className="stat-subtitle">{subtitle}</span>
        {isClickable && (
          <span className="stat-view-link">
            {actionHint || 'View Details →'}
          </span>
        )}
      </div>
    </div>
  );
}
