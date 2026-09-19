import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/idGenerator';
import { useActivityStore } from './activityStore';

export const useVisitStore = create(
  persist(
    (set, get) => ({
      visits: [],
      
      scheduleVisit: (leadId, propertyId, agentId, scheduledDate) => set((state) => {
        const newVisit = {
          id: generateId('visit'),
          leadId,
          propertyId,
          agentId,
          scheduledDate,
          status: 'scheduled',
          feedback: null,
          feedbackNotes: ''
        };
        
        useActivityStore.getState().logActivity(
          leadId, 
          agentId, 
          'SITE_VISIT_SCHEDULED', 
          `Site visit scheduled for ${new Date(scheduledDate).toLocaleString()}`
        );
        
        return { visits: [newVisit, ...state.visits] };
      }),
      
      updateFeedback: (id, feedback, feedbackNotes, agentId) => set((state) => {
        const visit = state.visits.find(v => v.id === id);
        if (visit) {
          useActivityStore.getState().logActivity(
            visit.leadId,
            agentId,
            'SITE_VISIT_FEEDBACK',
            `Visit Feedback: ${feedback}. ${feedbackNotes}`
          );
        }
        return {
          visits: state.visits.map(v => v.id === id ? { ...v, status: 'completed', feedback, feedbackNotes } : v)
        };
      })
    }),
    { name: 'propdesk-visits' }
  )
);
