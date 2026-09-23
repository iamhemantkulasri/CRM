import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, X, Calculator, Menu, Copy, Moon, Sun, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { useLeadStore } from '../store/leadStore';
import { useReminderStore } from '../store/reminderStore';
import { HELPLINE_NUMBER } from '../utils/constants';
import { AgentBadge } from './AgentBadge';
import { Notifications } from './Notifications';
import { EmiCalculatorModal } from './EmiCalculatorModal';
import './Header.css';

export function Header() {
  const { currentUser, logout } = useAuthStore();
  const { theme, toggleTheme, toggleSidebar } = useUiStore();
  const { leads } = useLeadStore();
  const { getOverdueLeads } = useReminderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const [isEmiModalOpen, setIsEmiModalOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [copiedHelpline, setCopiedHelpline] = useState(false);

  const bellRef = useRef(null);
  const profileRef = useRef(null);

  const overdueLeads = getOverdueLeads(leads);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellOpen && bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen, profileOpen]);

  const handleCopyHelpline = () => {
    navigator.clipboard.writeText(HELPLINE_NUMBER);
    setCopiedHelpline(true);
    setTimeout(() => setCopiedHelpline(false), 2000);
  };

  return (
    <header className="app-header glass-surface">
      <div className="header-container">
        {/* Left Side: Mobile Menu Button + Logo Group */}
        <div className="header-left">
          <button 
            type="button"
            className="mobile-menu-btn" 
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} strokeWidth={2.2} />
          </button>

          <div 
            className="header-logo" 
            onClick={() => window.location.href = '/app/dashboard'}
            role="button"
            tabIndex={0}
          >
            <div className="logo-icon">T</div>
            <div className="logo-text">
              <span className="logo-brand">TGV</span>
              <span className="logo-sub">Estates</span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Search Bar */}
        <div className="header-search desktop-search">
          <div className="search-input-wrapper" style={{ width: '100%' }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              className="form-input" 
              placeholder="Search leads, tasks, properties, phone numbers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', height: 38, fontSize: 13 }}
            />
            {searchQuery && (
              <div style={{ position: 'absolute', top: 44, left: 0, right: 0, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-md)', padding: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100 }}>
                <div style={{ fontSize: 13, color: 'var(--color-muted-fg)', fontStyle: 'italic' }}>Live searching...</div>
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 500 }}>No exact matches for "{searchQuery}"</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Header Actions */}
        <div className="header-actions">
          {/* Mobile Search Icon Toggle */}
          <button
            type="button"
            className="header-action-btn mobile-search-btn"
            onClick={() => setShowMobileSearch(prev => !prev)}
            title="Search CRM"
            aria-label="Toggle search"
          >
            <Search size={18} />
          </button>

          {/* Overdue Follow-up Bell */}
          <div className="header-bell-wrapper" ref={bellRef}>
            <button
              type="button"
              className="header-action-btn"
              onClick={() => setBellOpen(prev => !prev)}
              title={overdueLeads.length ? `${overdueLeads.length} overdue follow-ups` : 'No overdue follow-ups'}
              aria-label="Notifications"
            >
              <Bell size={18} />
              {overdueLeads.length > 0 && (
                <span className="header-notification-badge">
                  {overdueLeads.length}
                </span>
              )}
            </button>

            <Notifications 
              isOpen={bellOpen} 
              onClose={() => setBellOpen(false)} 
            />
          </div>

          {/* Quick EMI Calculator Button */}
          <button
            type="button"
            className="header-action-btn header-calc-btn"
            onClick={() => setIsEmiModalOpen(true)}
            title="Open EMI & Loan Calculator"
            aria-label="Open EMI calculator"
            style={{ color: 'var(--color-primary)' }}
          >
            <Calculator size={18} />
          </button>

          {/* Helpline Badge (Desktop) */}
          <div className="helpline-badge" onClick={handleCopyHelpline} title="Copy Helpline Number">
            <span className="helpline-icon">☎️</span>
            <span className="helpline-number">{HELPLINE_NUMBER}</span>
            {copiedHelpline ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} className="copy-icon" />}
          </div>

          {/* Theme Toggle */}
          <button 
            type="button"
            className="header-action-btn header-theme-btn" 
            onClick={toggleTheme} 
            title="Toggle Light/Dark Theme"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Agent Profile */}
          {currentUser && (
            <>
              {/* Desktop Profile Display */}
              <div className="profile-dropdown desktop-profile-only">
                <AgentBadge employee={currentUser} size="md" />
                <div className="profile-info">
                  <span className="profile-name">{currentUser.name}</span>
                  <span className="profile-role">{currentUser.role === 'admin' ? 'Admin' : 'Agent'}</span>
                </div>
                <button className="btn btn-ghost btn-sm ml-2" onClick={logout}>Exit</button>
              </div>

              {/* Mobile Profile Trigger & Popover */}
              <div className="mobile-profile-wrapper" ref={profileRef}>
                <button
                  type="button"
                  className="mobile-avatar-btn"
                  onClick={() => setProfileOpen(prev => !prev)}
                  aria-label="User Profile Menu"
                >
                  <AgentBadge employee={currentUser} size="sm" />
                </button>

                {profileOpen && (
                  <>
                    <div className="mobile-profile-backdrop" onClick={() => setProfileOpen(false)} />
                    <div className="mobile-profile-sheet glass-surface">
                      <div className="mobile-profile-header">
                        <AgentBadge employee={currentUser} size="lg" />
                        <div className="mobile-profile-details">
                          <div className="mobile-profile-name">{currentUser.name}</div>
                          <div className="mobile-profile-role-badge">
                            {currentUser.role === 'admin' ? 'Administrator' : 'Sales Agent'}
                          </div>
                          <div className="mobile-profile-email">{currentUser.email || 'agent@tgvestates.com'}</div>
                        </div>
                      </div>

                      <div className="mobile-profile-actions">
                        <button
                          type="button"
                          className="mobile-profile-row"
                          onClick={() => { toggleTheme(); }}
                        >
                          <span className="row-icon">
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                          </span>
                          <span className="row-label">Interface Theme</span>
                          <span className="row-value">{theme === 'light' ? 'Light' : 'Dark'}</span>
                        </button>

                        <button
                          type="button"
                          className="mobile-profile-row"
                          onClick={() => { setIsEmiModalOpen(true); setProfileOpen(false); }}
                        >
                          <span className="row-icon" style={{ color: 'var(--color-primary)' }}>
                            <Calculator size={16} />
                          </span>
                          <span className="row-label">EMI & Loan Calculator</span>
                          <span className="row-badge">Open</span>
                        </button>

                        <button
                          type="button"
                          className="mobile-profile-row"
                          onClick={handleCopyHelpline}
                        >
                          <span className="row-icon">☎️</span>
                          <span className="row-label">Support Helpline</span>
                          <span className="row-value">
                            {copiedHelpline ? 'Copied!' : HELPLINE_NUMBER}
                          </span>
                        </button>
                      </div>

                      <div className="mobile-profile-footer">
                        <button
                          type="button"
                          className="btn btn-outline w-full mobile-signout-btn"
                          onClick={logout}
                        >
                          Sign Out of CRM
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {showMobileSearch && (
        <div className="mobile-search-bar glass-surface">
          <div className="search-input-wrapper" style={{ width: '100%', position: 'relative' }}>
            <Search size={16} className="search-icon" />
            <input 
              type="text"
              className="form-input" 
              placeholder="Search leads, tasks, properties..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', height: 38, fontSize: 13, paddingLeft: 34, paddingRight: 32 }}
              autoFocus
            />
            <button 
              type="button" 
              className="btn btn-icon btn-ghost btn-sm"
              onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }}
              style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
              aria-label="Close search"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Global EMI Calculator Modal */}
      <EmiCalculatorModal
        isOpen={isEmiModalOpen}
        onClose={() => setIsEmiModalOpen(false)}
        initialPriceLakhs={85}
      />
    </header>
  );
}

export default Header;
