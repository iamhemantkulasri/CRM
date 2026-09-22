import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  X, Phone, MessageCircle, MapPin, Building, Calendar, 
  Edit2, Trash2, Copy, Sparkles, Printer, ExternalLink, 
  Send, Calculator, FileText 
} from 'lucide-react';
import { AgentBadge } from './AgentBadge';
import { PriorityBadge } from './PriorityBadge';
import { SourceBadge } from './SourceBadge';
import { useEmployeeStore } from '../store/employeeStore';
import { STAGES } from '../utils/constants';
import { useActivityStore } from '../store/activityStore';
import { useAuthStore } from '../store/authStore';
import { useLeadStore } from '../store/leadStore';
import { CallModal } from './CallModal';
import { SiteVisitModal } from './SiteVisitModal';
import { EmiCalculatorModal } from './EmiCalculatorModal';
import { usePropertyStore } from '../store/propertyStore';
import { formatINR, formatRelativeDate } from '../utils/formatters';
import { addDaysISO, FOLLOW_UP_PRESETS, formatFollowUp, toDateTimeLocalValue } from '../utils/followUp';
import { WhatsAppButton } from './WhatsAppButton';
import { findMatchingProperties } from '../utils/matchingEngine';
import { printSingleProperty } from '../utils/propertyPdf';

export function LeadDrawer({ lead, isOpen, onClose, onEditLead, onDeleteLead }) {
  const { getEmployee, employees } = useEmployeeStore();
  const { getActivitiesForLead } = useActivityStore();
  const { addNote, updateLead, deleteLead } = useLeadStore();
  const { currentUser } = useAuthStore();
  const { properties } = usePropertyStore();
  
  const [noteText, setNoteText] = React.useState('');
  const [isAddingNote, setIsAddingNote] = React.useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = React.useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = React.useState(false);
  const [isEmiModalOpen, setIsEmiModalOpen] = React.useState(false);
  const [selectedEmiProperty, setSelectedEmiProperty] = React.useState(null);
  
  if (!lead) return null;

  // Real-time calculated matching properties using matching engine
  const matchedList = findMatchingProperties(lead.requirements, properties);

  const agent = getEmployee(lead.assignedTo);
  const stage = STAGES.find(s => s.id === lead.stage);
  const activities = getActivitiesForLead(lead.id);

  const handleSendPropertyToLead = (prop) => {
    const mapUrl = prop.locationLink || `https://maps.google.com/?q=${encodeURIComponent(prop.locality + ', ' + (prop.city || 'India'))}`;
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `Hi ${lead.name}, this is ${agent?.name || 'PropDesk Team'} from PropDesk Realty.\n\n` +
      `Here is a property specially matching your requirements:\n` +
      `🏡 *${prop.name}* (${prop.configuration || prop.bhk})\n` +
      `📍 ${prop.locality}, ${prop.city || 'India'}\n` +
      `💰 Budget: ${formatINR(prop.priceLakhs)} | ${prop.areaSqFt ? prop.areaSqFt + ' sq.ft' : ''}\n` +
      `🗺️ Location: ${mapUrl}\n\n` +
      `Would you like to schedule a site visit this week?`;

    // Log to activity timeline
    useActivityStore.getState().logActivity(
      lead.id,
      currentUser?.id,
      'WHATSAPP_SENT',
      `Shared property "${prop.name}" via WhatsApp`
    );

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddNote = () => {
    if (!noteText.trim() || !currentUser) return;
    addNote(lead.id, noteText, currentUser.id);
    useActivityStore.getState().logActivity(
      lead.id,
      'NOTE_ADDED',
      `Note added: "${noteText.trim().slice(0, 60)}${noteText.length > 60 ? '...' : ''}"`,
      currentUser.id
    );
    setNoteText('');
    setIsAddingNote(false);
  };

  const handleDeleteSelf = () => {
    if (onDeleteLead) {
      onDeleteLead(lead);
    } else {
      if (window.confirm(`Are you sure you want to delete lead "${lead.name}" permanently?`)) {
        deleteLead(lead.id);
        onClose();
      }
    }
  };

  const handleSetFollowUp = (isoOrNull, label) => {
    updateLead(lead.id, { nextFollowUp: isoOrNull });
    try {
      useActivityStore.getState().logActivity(
        lead.id,
        currentUser?.id,
        'FOLLOW_UP_SET',
        isoOrNull
          ? `Follow-up scheduled${label ? ` (${label})` : ''}: ${formatFollowUp(isoOrNull)}`
          : 'Follow-up cleared'
      );
    } catch {}
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-backdrop" />
        <Dialog.Content className="drawer-content outline-none">
          
          {/* Header */}
          <div className="drawer-header glass-surface">
            <div className="drawer-header-top">
              <div className="drawer-title-group">
                <Dialog.Title className="drawer-title">
                  {lead.name}
                </Dialog.Title>
                <div className="drawer-subtitle">
                  {lead.phone}
                  <button 
                    className="btn-icon" 
                    style={{ padding: 4 }} 
                    aria-label="Copy phone"
                    onClick={() => navigator.clipboard?.writeText(lead.phone)}
                    title="Copy phone number"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button 
                  className="btn btn-outline btn-sm" 
                  style={{ height: 30, padding: '0 8px', fontSize: 12, gap: 4 }}
                  onClick={() => onEditLead && onEditLead(lead)}
                  title="Edit lead details"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button 
                  className="btn btn-ghost btn-sm" 
                  style={{ height: 30, padding: '0 8px', fontSize: 12, color: 'var(--color-danger, #ef4444)', gap: 4 }}
                  onClick={handleDeleteSelf}
                  title="Delete lead"
                >
                  <Trash2 size={13} /> Delete
                </button>
                <Dialog.Close asChild>
                  <button className="btn btn-ghost btn-icon" aria-label="Close">
                    <X size={20} />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="drawer-badges" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <PriorityBadge priorityId={lead.priority} />
              <div 
                className="badge"
                style={{ backgroundColor: `var(--stage-${lead.stage})`, color: '#fff', border: 'none' }}
              >
                {stage?.label}
              </div>

              <SourceBadge sourceId={lead.source} />

              {/* Agent Assignment Dropdown */}
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <select
                  value={lead.assignedTo || ''}
                  onChange={(e) => {
                    const newAgentId = e.target.value || null;
                    updateLead(lead.id, { assignedTo: newAgentId });
                    useActivityStore.getState().logActivity(
                      lead.id,
                      currentUser?.id,
                      'AGENT_REASSIGNED',
                      `Lead assigned to ${employees.find(emp => emp.id === newAgentId)?.name || 'Unassigned'}`
                    );
                  }}
                  className="form-input"
                  style={{
                    height: 26,
                    fontSize: 11.5,
                    padding: '1px 6px',
                    borderRadius: 14,
                    background: lead.assignedTo ? 'var(--color-muted)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: lead.assignedTo ? 'var(--color-border)' : '#fca5a5',
                    color: lead.assignedTo ? 'var(--color-fg)' : '#dc2626',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Assign lead to an advisor or agent"
                >
                  <option value="">⚠️ Unassigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      👤 {emp.name} {emp.role === 'admin' ? '(Admin)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="drawer-actions">
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setIsCallModalOpen(true)}>
              <Phone size={16} /> Call
            </button>
            <WhatsAppButton lead={lead} />
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsVisitModalOpen(true)}>
              <Calendar size={16} /> Visit
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: '0 10px', color: 'var(--color-primary)' }}
              title="Calculate EMI for buyer"
              onClick={() => {
                setSelectedEmiProperty(null);
                setIsEmiModalOpen(true);
              }}
            >
              <Calculator size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="drawer-body custom-scrollbar">
            {/* Next Follow-up scheduler */}
            <div className="drawer-card" style={{ marginBottom: 16, borderLeft: lead.nextFollowUp ? '3px solid var(--color-primary)' : '3px solid #fca5a5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div className="drawer-card-label" style={{ margin: 0 }}>Next Follow-up</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: lead.nextFollowUp ? 'var(--color-primary)' : 'var(--color-muted-fg)' }}>
                  {formatFollowUp(lead.nextFollowUp)}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {FOLLOW_UP_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ height: 28, fontSize: 11, padding: '0 10px' }}
                    onClick={() => handleSetFollowUp(addDaysISO(p.days), p.label)}
                  >
                    {p.label}
                  </button>
                ))}
                {lead.nextFollowUp && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ height: 28, fontSize: 11, padding: '0 10px', color: 'var(--color-danger, #ef4444)' }}
                    onClick={() => handleSetFollowUp(null)}
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="datetime-local"
                className="form-input"
                style={{ height: 32, fontSize: 12 }}
                value={toDateTimeLocalValue(lead.nextFollowUp)}
                onChange={(e) => {
                  const v = e.target.value;
                  handleSetFollowUp(v ? new Date(v).toISOString() : null, v ? 'custom' : undefined);
                }}
              />
            </div>

            {/* Note & Context Banner if available */}
            {Array.isArray(lead.notes) && lead.notes.length > 0 && (
              <div style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(37,99,235,0.06)',
                border: '1px solid rgba(37,99,235,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FileText size={12} /> Lead Note & Address Context
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-fg)', lineHeight: 1.4 }}>
                  {lead.notes[0]?.text}
                </div>
              </div>
            )}

            <h3 className="section-title">Requirements</h3>
            <div className="drawer-cards-grid">
              <div className="drawer-card">
                <div className="drawer-card-label">Property Type</div>
                <div className="drawer-card-value capitalize">
                  <Building size={14} className="text-muted-fg" />
                  {lead.requirements?.propertyType || 'Apartment'}
                </div>
              </div>
              <div className="drawer-card">
                <div className="drawer-card-label">BHK</div>
                <div className="drawer-card-value">{lead.requirements?.bhk || 'Any'}</div>
              </div>
              <div className="drawer-card">
                <div className="drawer-card-label">Budget</div>
                <div className="drawer-card-value" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                  {lead.requirements?.budgetMinLakhs ? `₹${lead.requirements.budgetMinLakhs}L - ₹${lead.requirements.budgetMaxLakhs}L` : 'TBD'}
                </div>
              </div>
              <div className="drawer-card">
                <div className="drawer-card-label">Status</div>
                <div className="drawer-card-value">{lead.requirements?.possessionStatus || 'Any'}</div>
              </div>
              {lead.requirements?.preferredLocalities && lead.requirements.preferredLocalities.length > 0 && (
                <div className="drawer-card full-width">
                  <div className="drawer-card-label">Preferred Localities</div>
                  <div className="drawer-card-value">
                    <MapPin size={14} className="text-muted-fg shrink-0" />
                    {lead.requirements.preferredLocalities.join(', ')}
                  </div>
                </div>
              )}
            </div>
            
            {/* Automated Matching Properties Engine */}
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>Matching Properties ({matchedList.length})</span>
                </h3>
                <span style={{ fontSize: 11, color: 'var(--color-muted-fg)' }}>Auto-matched by Budget, Locality & BHK</span>
              </div>

              {matchedList.length === 0 ? (
                <div style={{ padding: 14, borderRadius: 8, background: 'var(--color-muted)', fontSize: 12, color: 'var(--color-muted-fg)', textAlign: 'center' }}>
                  No properties currently match this lead's requirements. Try broadening budget or localities.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {matchedList.slice(0, 4).map(({ property: prop, matchScore }) => (
                    <div
                      key={prop.id}
                      className="drawer-card"
                      style={{
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        borderLeft: matchScore >= 80 ? '3px solid var(--color-success)' : '3px solid var(--color-primary)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <img
                          src={prop.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60'}
                          alt={prop.name}
                          style={{ width: 64, height: 64, borderRadius: 6, objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }} className="truncate">{prop.name}</div>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 10,
                              background: matchScore >= 80 ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.1)',
                              color: matchScore >= 80 ? 'var(--color-success)' : 'var(--color-primary)',
                              whiteSpace: 'nowrap'
                            }}>
                              {matchScore}% Match
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 2 }}>
                            {prop.locality}, {prop.city} · {prop.bhk || prop.configuration}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                            {formatINR(prop.priceLakhs)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 4, borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleSendPropertyToLead(prop)}
                          style={{ flex: 1, height: 30, fontSize: 11, gap: 4 }}
                          title="Send property brochure and details via WhatsApp"
                        >
                          <Send size={12} />
                          <span>Share via WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => {
                            setSelectedEmiProperty(prop);
                            setIsEmiModalOpen(true);
                          }}
                          style={{ height: 30, fontSize: 11, padding: '0 8px', gap: 4 }}
                          title="Open EMI loan calculator for this property"
                        >
                          <Calculator size={12} />
                          <span>EMI</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => printSingleProperty(prop)}
                          style={{ height: 30, fontSize: 11, padding: '0 8px', gap: 4 }}
                          title="Print or download PDF brochure"
                        >
                          <Printer size={12} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="timeline-header">
              <h3 className="section-title" style={{ marginBottom: 0 }}>Activity Timeline</h3>
              <button 
                className="btn btn-ghost"
                style={{ color: 'var(--color-primary)', padding: '4px 8px', height: 'auto', fontSize: 13 }}
                onClick={() => setIsAddingNote(!isAddingNote)}
              >
                <Edit2 size={12} /> {isAddingNote ? 'Cancel' : 'Add Note'}
              </button>
            </div>

            {isAddingNote && (
              <div className="drawer-card" style={{ marginBottom: '24px', background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <textarea
                  className="form-input"
                  style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0, marginBottom: 12, resize: 'none' }}
                  placeholder="Type your note here (e.g. Discussed budget, requested visit on Saturday)..."
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', height: 'auto', fontSize: 12 }}
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}
            
            <div className="timeline">
              {activities.length === 0 ? (
                <div style={{ fontSize: 14, color: 'var(--color-muted-fg)', fontStyle: 'italic' }}>No activity recorded yet.</div>
              ) : (
                activities.map(activity => {
                  const actor = getEmployee(activity.performedBy);
                  let dotClass = 'default';
                  if (activity.action === 'STAGE_CHANGED') dotClass = 'stage';
                  if (activity.action === 'NOTE_ADDED') dotClass = 'note';
                  if (activity.action === 'LEAD_CREATED') dotClass = 'create';

                  return (
                    <div key={activity.id} className="timeline-item">
                      <div className={`timeline-dot ${dotClass}`}></div>
                      <div className="timeline-content">{activity.details}</div>
                      <div className="timeline-meta">
                        {formatRelativeDate(activity.timestamp)} • by {actor?.name || 'System'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
      
      <CallModal 
        lead={lead} 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
      />
      <SiteVisitModal 
        lead={lead} 
        isOpen={isVisitModalOpen} 
        onClose={() => setIsVisitModalOpen(false)} 
      />

      <EmiCalculatorModal
        isOpen={isEmiModalOpen}
        onClose={() => {
          setIsEmiModalOpen(false);
          setSelectedEmiProperty(null);
        }}
        initialPriceLakhs={selectedEmiProperty?.priceLakhs || lead.requirements?.budgetMaxLakhs || lead.requirements?.budgetMinLakhs || 80}
        propertyName={selectedEmiProperty?.name || ''}
        clientName={lead.name}
        clientPhone={lead.phone}
        leadId={lead.id}
      />
    </Dialog.Root>
  );
}
