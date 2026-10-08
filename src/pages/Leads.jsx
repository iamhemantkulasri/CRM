import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, List, Search, Plus, Upload, Download, ChevronDown, FileSpreadsheet, FileCode, AlertTriangle } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { useLeadStore } from '../store/leadStore';
import { useReminderStore } from '../store/reminderStore';
import { useEmployeeStore } from '../store/employeeStore';
import { KanbanBoard } from './KanbanBoard';
import { TableView } from './TableView';
import { LeadDrawer } from '../components/LeadDrawer';
import { LeadModal } from '../components/LeadModal';
import { LeadImportModal } from '../components/LeadImportModal';
import { useAuthStore } from '../store/authStore';
import { exportLeadsToCSV, exportLeadsToJSON } from '../utils/exportLeads';

import { STAGES } from '../utils/constants';

export function Leads() {
  const { leadViewMode, setLeadViewMode, leadFilter, setLeadFilter } = useUiStore();
  const { getLeads, getLeadsByAgent, getUnassignedLeads, deleteLead } = useLeadStore();
  const { getOverdueLeads } = useReminderStore();
  const { employees } = useEmployeeStore();
  const { currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    }
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

  const allLeads = getLeads();

  // Apply filters
  let displayedLeads = [];
  if (leadFilter === 'my' && currentUser) {
    displayedLeads = getLeadsByAgent(currentUser.id);
  } else if (leadFilter === 'unassigned') {
    displayedLeads = getUnassignedLeads();
  } else if (leadFilter === 'overdue') {
    displayedLeads = getOverdueLeads(allLeads);
  } else {
    displayedLeads = allLeads;
  }

  // Apply stage dropdown filter
  if (stageFilter && stageFilter !== 'all') {
    if (stageFilter === 'site_visits') {
      displayedLeads = displayedLeads.filter(l => l.stage === 'visit_scheduled' || l.stage === 'visit_done');
    } else {
      displayedLeads = displayedLeads.filter(l => l.stage === stageFilter);
    }
  }

  // Apply search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayedLeads = displayedLeads.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.phone.includes(q)
    );
  }

  const overdueCount = getOverdueLeads(allLeads).length;

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
  };

  const handleEditLead = (lead) => {
    setLeadToEdit(lead);
    setIsAddModalOpen(true);
  };

  const handleDeleteLead = (lead) => {
    if (window.confirm(`Are you sure you want to permanently delete lead "${lead.name}"?`)) {
      deleteLead(lead.id);
      if (selectedLead?.id === lead.id) {
        setSelectedLead(null);
      }
    }
  };

  const handleCloseLeadModal = () => {
    setIsAddModalOpen(false);
    setLeadToEdit(null);
  };

  const handleExportCSV = () => {
    if (displayedLeads.length === 0) return;
    exportLeadsToCSV(displayedLeads, employees);
    setIsExportMenuOpen(false);
  };

  const handleExportJSON = () => {
    if (displayedLeads.length === 0) return;
    exportLeadsToJSON(displayedLeads, employees);
    setIsExportMenuOpen(false);
  };

  const filterTabs = [
    { id: 'all', label: 'All Leads' },
    { id: 'my', label: 'My Leads' },
    { id: 'unassigned', label: 'Unassigned' },
    { id: 'overdue', label: `⚠️ Overdue${overdueCount > 0 ? ` (${overdueCount})` : ''}`, warn: overdueCount > 0 },
  ];

  return (
    <div className="page leads-page">
      <div className="page-header leads-header">
        <div className="leads-title-wrap">
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Manage your sales pipeline</p>
        </div>
        
        <div className="page-actions leads-actions">
          {/* Search Bar */}
          <div className="search-bar leads-search">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="leads-actions-row">
            {/* View Toggle */}
            <div className="leads-view-toggle">
              <button 
                className="btn btn-sm leads-toggle-btn"
                data-active={leadViewMode === 'kanban'}
                onClick={() => setLeadViewMode('kanban')}
                title="Kanban View"
                aria-label="Kanban view"
                aria-pressed={leadViewMode === 'kanban'}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                className="btn btn-sm leads-toggle-btn"
                data-active={leadViewMode === 'table'}
                onClick={() => setLeadViewMode('table')}
                title="Table View"
                aria-label="Table view"
                aria-pressed={leadViewMode === 'table'}
              >
                <List size={16} />
              </button>
            </div>

            {/* Import Leads Button */}
            <button
              className="btn btn-outline leads-import-btn"
              onClick={() => setIsImportModalOpen(true)}
              title="Import leads from CSV or portal"
            >
              <Upload size={16} /> <span className="leads-btn-label">Import</span>
            </button>

            {/* Export Leads Dropdown */}
            <div className="leads-export-container" ref={exportMenuRef}>
              <button
                type="button"
                className="btn btn-outline leads-export-btn"
                onClick={() => setIsExportMenuOpen(prev => !prev)}
                disabled={displayedLeads.length === 0}
                title={displayedLeads.length === 0 ? "No leads matching criteria to export" : `Export ${displayedLeads.length} leads`}
                aria-haspopup="true"
                aria-expanded={isExportMenuOpen}
              >
                <Download size={16} />
                <span className="leads-btn-label">Export ({displayedLeads.length})</span>
                <ChevronDown size={13} className={`leads-export-chevron ${isExportMenuOpen ? 'open' : ''}`} />
              </button>

              {isExportMenuOpen && (
                <div className="leads-export-menu" role="menu">
                  <div className="leads-export-header">
                    <span>Export {displayedLeads.length} {displayedLeads.length === 1 ? 'Lead' : 'Leads'}</span>
                  </div>
                  <button
                    type="button"
                    className="leads-export-menu-item"
                    onClick={handleExportCSV}
                    role="menuitem"
                  >
                    <div className="leads-export-item-icon csv">
                      <FileSpreadsheet size={16} />
                    </div>
                    <div className="leads-export-menu-text">
                      <span className="leads-export-menu-title">Export as CSV</span>
                      <span className="leads-export-menu-desc">Excel & Google Sheets compatible</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className="leads-export-menu-item"
                    onClick={handleExportJSON}
                    role="menuitem"
                  >
                    <div className="leads-export-item-icon json">
                      <FileCode size={16} />
                    </div>
                    <div className="leads-export-menu-text">
                      <span className="leads-export-menu-title">Export as JSON</span>
                      <span className="leads-export-menu-desc">Structured backup with full objects</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
            
            <button 
              className="btn btn-primary leads-add-btn"
              onClick={() => {
                setLeadToEdit(null);
                setIsAddModalOpen(true);
              }}
            >
              <Plus size={18} /> <span className="leads-btn-label">Add Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Stage Selector Dropdown */}
      <div className="leads-filter-row">
        <div className="leads-filter-tabs">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setLeadFilter(tab.id)}
              className={`btn btn-sm ${leadFilter === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              style={tab.warn && leadFilter !== tab.id ? { color: '#ef4444', fontWeight: 600 } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stage Filter Dropdown */}
        <div className="leads-stage-filter">
          <label>Stage:</label>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="form-input leads-stage-select"
          >
            <option value="all">All Stages ({allLeads.length})</option>
            <option value="site_visits">Site Visits Scheduled/Done</option>
            {STAGES.map(s => {
              const count = allLeads.filter(l => l.stage === s.id).length;
              return (
                <option key={s.id} value={s.id}>
                  {s.label} ({count})
                </option>
              );
            })}
          </select>
          {stageFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setStageFilter('all')}
              className="btn btn-ghost"
              style={{ fontSize: 11, height: 28, padding: '0 6px', color: 'var(--color-muted-fg)' }}
              title="Clear stage filter"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      
      <div className="leads-content">
        {leadViewMode === 'kanban' ? (
          <KanbanBoard 
            leads={displayedLeads} 
            onLeadClick={handleLeadClick} 
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
          />
        ) : (
          <div className="leads-table-scroll custom-scrollbar">
            <TableView 
              leads={displayedLeads} 
              onLeadClick={handleLeadClick} 
              onEditLead={handleEditLead}
              onDeleteLead={handleDeleteLead}
            />
          </div>
        )}
      </div>

      <LeadDrawer 
        lead={selectedLead} 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
        onEditLead={handleEditLead}
        onDeleteLead={handleDeleteLead}
      />

      <LeadModal 
        isOpen={isAddModalOpen}
        onClose={handleCloseLeadModal}
        leadToEdit={leadToEdit}
      />

      <LeadImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
