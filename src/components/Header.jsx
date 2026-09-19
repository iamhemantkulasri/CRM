import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, X, Clock, Phone, Calculator, Menu, Copy, Moon, Sun } from 'lucide-react';
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
  const { leads, updateLead } = useLeadStore();
  const { getOverdueLeads } = useReminderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const [isEmiModalOpen, setIsEmiModalOpen] = useState(false);
  const bellRef = useRef(null);

  const overdueLeads = getOverdueLeads(leads);

  // Close popover on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  const handleCopyHelpline = () => {
    navigator.clipboard.writeText(HELPLINE_NUMBER);
    alert('Helpline number copied to clipboard');
  };

  return (
    <header className="app-header glass-surface">
      <div className="header-container">
        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-btn btn btn-icon btn-ghost" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="header-logo">
          <div className="logo-icon" style={{ background: 'var(--color-primary)', color: '#fff', fontWeight: 'bold' }}>T</div>
          <span className="logo-text">TGV Estates</span>
        </div>

        {/* Search Bar - Center Expanded (Top Tab Buttons Removed!) */}
        <div className="header-search" style={{ flex: 1, maxWidth: 540, margin: '0 20px' }}>
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

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Overdue Follow-up Bell */}
          <div style={{ position: 'relative' }} ref={bellRef}>
            <button
              className="btn btn-icon btn-ghost"
              onClick={() => setBellOpen(prev => !prev)}
              title={overdueLeads.length ? `${overdueLeads.length} overdue follow-ups` : 'No overdue follow-ups'}
              style={{ position: 'relative' }}
            >
              <Bell size={18} />
              {overdueLeads.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: 'var(--color-danger, #ef4444)',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  padding: '0 3px',
                  border: '2px solid var(--color-card)',
                  pointerEvents: 'none',
                }}>
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
            className="btn btn-icon btn-ghost"
            onClick={() => setIsEmiModalOpen(true)}
            title="Open EMI & Loan Calculator"
            style={{ color: 'var(--color-primary)' }}
          >
            <Calculator size={18} />
          </button>

          {/* Helpline Badge */}
          <div className="helpline-badge" onClick={handleCopyHelpline} title="Copy Helpline Number">
            <span className="helpline-icon">☎️</span>
            <span className="helpline-number">{HELPLINE_NUMBER}</span>
            <Copy size={12} className="copy-icon" />
          </div>

          {/* Theme Toggle */}
          <button className="btn btn-icon btn-ghost theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Agent Profile / Switcher */}
          {currentUser && (
            <div className="profile-dropdown">
              <AgentBadge employee={currentUser} size="md" />
              <div className="profile-info">
                <span className="profile-name">{currentUser.name}</span>
                <span className="profile-role">{currentUser.role === 'admin' ? 'Admin' : 'Agent'}</span>
              </div>
              <button className="btn btn-ghost btn-sm ml-2" onClick={logout}>Exit</button>
            </div>
          )}
        </div>
      </div>

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
