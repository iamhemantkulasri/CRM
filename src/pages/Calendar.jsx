import React, { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { CalendarDays, MapPin, User, LayoutList, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, CheckCircle, MessageSquare } from 'lucide-react';
import { useVisitStore } from '../store/visitStore';
import { usePropertyStore } from '../store/propertyStore';
import { useLeadStore } from '../store/leadStore';
import { useEmployeeStore } from '../store/employeeStore';
import { CalendarMonthView } from '../components/CalendarMonthView';
import { SiteVisitModal } from '../components/SiteVisitModal';
import { VisitFeedbackModal } from '../components/VisitFeedbackModal';
import { addMonths, subMonths, format } from 'date-fns';

export function Calendar() {
  const { visits } = useVisitStore();
  const { getProperty } = usePropertyStore();
  const { getLead } = useLeadStore();
  const { getEmployee } = useEmployeeStore();
  
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [feedbackVisit, setFeedbackVisit] = useState(null);

  const sortedVisits = [...visits].sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const activeFeedbackLead = feedbackVisit ? getLead(feedbackVisit.leadId) : null;
  const activeFeedbackProperty = feedbackVisit ? getProperty(feedbackVisit.propertyId) : null;

  return (
    <div className="page h-full" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Site Visits</h1>
          <p className="page-subtitle">Schedule, track, and log feedback for property tours</p>
        </div>
        
        <div className="calendar-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {viewMode === 'month' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-card)', padding: '4px 8px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <button className="btn-icon" onClick={handlePrevMonth} aria-label="Previous month"><ChevronLeft size={18} /></button>
              <div style={{ fontWeight: 600, minWidth: 110, textAlign: 'center', fontSize: 13 }}>{format(currentDate, 'MMMM yyyy')}</div>
              <button className="btn-icon" onClick={handleNextMonth} aria-label="Next month"><ChevronRight size={18} /></button>
              <button className="btn btn-ghost" style={{ padding: '4px 8px', height: 'auto', fontSize: 12 }} onClick={handleToday}>Today</button>
            </div>
          )}
          
          <div style={{ display: 'flex', background: 'var(--color-muted)', padding: 3, borderRadius: 'var(--border-radius-md)' }}>
            <button 
              className={`btn ${viewMode === 'agenda' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ padding: '6px 12px', height: 'auto', fontSize: 13 }}
              onClick={() => setViewMode('agenda')}
            >
              <LayoutList size={15} style={{ marginRight: 6 }} /> Agenda
            </button>
            <button 
              className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ padding: '6px 12px', height: 'auto', fontSize: 13 }}
              onClick={() => setViewMode('month')}
            >
              <CalendarIcon size={15} style={{ marginRight: 6 }} /> Month
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => setIsScheduleModalOpen(true)} style={{ gap: 6 }}>
            <Plus size={16} /> Schedule Visit
          </button>
        </div>
      </div>
      
      {viewMode === 'agenda' ? (
        sortedVisits.length === 0 ? (
          <div className="card" style={{ flex: 1, display: 'flex' }}>
            <EmptyState 
              icon={CalendarDays}
              title="No Scheduled Visits"
              description="Click '+ Schedule Visit' above or schedule a site visit from a Lead's profile."
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', padding: '0 4px 16px', flex: 1 }}>
            {sortedVisits.map(visit => {
              const property = getProperty(visit.propertyId);
              const lead = getLead(visit.leadId);
              const agent = getEmployee(visit.agentId);
              const date = new Date(visit.scheduledDate);
              const isCompleted = visit.status === 'completed';
              
              return (
                <div key={visit.id} className="card" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ minWidth: 80, textAlign: 'center', borderRight: '1px solid var(--color-border)', paddingRight: 16 }}>
                    <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                      {date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 className="text-h3" style={{ margin: 0 }}>{lead?.name || 'Unknown Lead'}</h3>
                      <span className="badge" style={{ 
                        backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: isCompleted ? 'var(--color-success)' : '#d97706',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: 11
                      }}>
                        {visit.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12, color: 'var(--color-muted-fg)', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} /> {property?.name || 'Property'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={14} /> {agent?.name || 'Agent'}
                      </div>
                    </div>

                    {visit.feedbackNotes && (
                      <div style={{ fontSize: 12, color: 'var(--color-muted-fg)', marginTop: 6, fontStyle: 'italic', background: 'var(--color-muted)', padding: '4px 8px', borderRadius: 4, display: 'inline-block' }}>
                        Feedback: "{visit.feedbackNotes}"
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {!isCompleted ? (
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ gap: 6, borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
                        onClick={() => setFeedbackVisit(visit)}
                      >
                        <CheckCircle size={14} /> Log Outcome
                      </button>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ gap: 4, color: 'var(--color-muted-fg)' }}
                        onClick={() => setFeedbackVisit(visit)}
                        title="Update visit feedback"
                      >
                        <MessageSquare size={13} /> Edit Note
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <CalendarMonthView currentDate={currentDate} visits={visits} getProperty={getProperty} />
      )}

      {/* Standalone Schedule Visit Modal */}
      <SiteVisitModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        lead={null}
      />

      {/* Feedback & Disposition Modal */}
      {feedbackVisit && (
        <VisitFeedbackModal
          isOpen={Boolean(feedbackVisit)}
          onClose={() => setFeedbackVisit(null)}
          visit={feedbackVisit}
          lead={activeFeedbackLead}
          property={activeFeedbackProperty}
        />
      )}
    </div>
  );
}
