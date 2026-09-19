import React, { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { CalendarDays, MapPin, User, LayoutList, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVisitStore } from '../store/visitStore';
import { usePropertyStore } from '../store/propertyStore';
import { useLeadStore } from '../store/leadStore';
import { useEmployeeStore } from '../store/employeeStore';
import { CalendarMonthView } from '../components/CalendarMonthView';
import { addMonths, subMonths, format } from 'date-fns';

export function Calendar() {
  const { visits } = useVisitStore();
  const { getProperty } = usePropertyStore();
  const { getLead } = useLeadStore();
  const { getEmployee } = useEmployeeStore();
  
  const [viewMode, setViewMode] = useState('agenda'); // 'agenda' | 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  const sortedVisits = [...visits].sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="page h-full" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Site Visits</h1>
          <p className="page-subtitle">Schedule and track property tours</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {viewMode === 'month' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-card)', padding: '4px 8px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)' }}>
              <button className="btn-icon" onClick={handlePrevMonth}><ChevronLeft size={18} /></button>
              <div style={{ fontWeight: 600, minWidth: 120, textAlign: 'center' }}>{format(currentDate, 'MMMM yyyy')}</div>
              <button className="btn-icon" onClick={handleNextMonth}><ChevronRight size={18} /></button>
              <button className="btn btn-ghost" style={{ padding: '4px 8px', height: 'auto', fontSize: 12 }} onClick={handleToday}>Today</button>
            </div>
          )}
          
          <div style={{ display: 'flex', background: 'var(--color-muted)', padding: 4, borderRadius: 'var(--border-radius-md)' }}>
            <button 
              className={`btn ${viewMode === 'agenda' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ padding: '6px 12px', height: 'auto' }}
              onClick={() => setViewMode('agenda')}
            >
              <LayoutList size={16} style={{ marginRight: 6 }} /> Agenda
            </button>
            <button 
              className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-ghost'}`} 
              style={{ padding: '6px 12px', height: 'auto' }}
              onClick={() => setViewMode('month')}
            >
              <CalendarIcon size={16} style={{ marginRight: 6 }} /> Month
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'agenda' ? (
        sortedVisits.length === 0 ? (
          <div className="card" style={{ flex: 1, display: 'flex' }}>
            <EmptyState 
              icon={CalendarDays}
              title="No Scheduled Visits"
              description="When you schedule a site visit from a Lead's drawer, it will appear here."
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', padding: '0 4px 16px', flex: 1 }}>
            {sortedVisits.map(visit => {
              const property = getProperty(visit.propertyId);
              const lead = getLead(visit.leadId);
              const agent = getEmployee(visit.agentId);
              const date = new Date(visit.scheduledDate);
              
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
                    <h3 className="text-h3" style={{ margin: '0 0 4px 0' }}>{lead?.name}</h3>
                    <div style={{ display: 'flex', gap: 12, color: 'var(--color-muted-fg)', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={14} /> {property?.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={14} /> {agent?.name}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="badge" style={{ backgroundColor: visit.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)', color: '#000', border: 'none' }}>
                      {visit.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <CalendarMonthView currentDate={currentDate} visits={visits} getProperty={getProperty} />
      )}
    </div>
  );
}
