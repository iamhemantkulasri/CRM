import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday } from 'date-fns';
import { MapPin } from 'lucide-react';

export function CalendarMonthView({ currentDate, visits, getProperty }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="calendar-grid-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 500, padding: '0 16px 16px' }}>
      
      {/* Weekday Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--color-border)', marginBottom: 8, paddingBottom: 8 }}>
        {weekDays.map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--color-muted-fg)' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, 1fr)', gap: 8, flex: 1 }}>
        {calendarDays.map(day => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dayVisits = visits.filter(v => isSameDay(new Date(v.scheduledDate), day));
          
          return (
            <div 
              key={day.toISOString()} 
              className={`calendar-cell ${isCurrentMonth ? '' : 'out-of-month'}`}
              style={{ 
                background: 'var(--color-card)', 
                borderRadius: 'var(--border-radius-md)', 
                padding: 8,
                border: isToday(day) ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                opacity: isCurrentMonth ? 1 : 0.4,
                overflowY: 'auto'
              }}
            >
              <div style={{ fontSize: 14, fontWeight: isToday(day) ? 700 : 500, color: isToday(day) ? 'var(--color-primary)' : 'inherit', marginBottom: 8 }}>
                {format(day, 'd')}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dayVisits.map(visit => {
                  const property = getProperty(visit.propertyId);
                  const vDate = new Date(visit.scheduledDate);
                  return (
                    <div 
                      key={visit.id} 
                      style={{ 
                        background: visit.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)', 
                        color: '#000',
                        fontSize: 11, 
                        padding: '4px 6px', 
                        borderRadius: 'var(--border-radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{format(vDate, 'h:mm a')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <MapPin size={10} style={{ flexShrink: 0 }} /> {property?.name || 'Property'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
