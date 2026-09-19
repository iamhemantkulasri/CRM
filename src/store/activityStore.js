import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/idGenerator';

// Seed initial activities based on our seed leads
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const seedActivities = [
  {
    id: 'act_1',
    leadId: 'lead_1',
    performedBy: 'emp_rohan',
    action: 'LEAD_CREATED',
    details: 'Lead created via 99acres',
    timestamp: twoDaysAgo.toISOString()
  },
  {
    id: 'act_2',
    leadId: 'lead_1',
    performedBy: 'emp_rohan',
    action: 'STAGE_CHANGED',
    details: 'Changed stage to Visit Scheduled',
    timestamp: yesterday.toISOString()
  },
  {
    id: 'act_3',
    leadId: 'lead_1',
    performedBy: 'emp_rohan',
    action: 'SITE_VISIT_SCHEDULED',
    details: 'Site visit scheduled at Prestige Lake View for tomorrow 11 AM.',
    timestamp: yesterday.toISOString()
  },
  {
    id: 'act_4',
    leadId: 'lead_4',
    performedBy: 'emp_amit',
    action: 'NOTE_ADDED',
    details: 'Client is aggressive on price. Needs a 20L discount.',
    timestamp: yesterday.toISOString()
  }
];

export const useActivityStore = create(
  persist(
    (set, get) => ({
      activities: seedActivities,

      logActivity: (leadId, agentId, action, details) => set((state) => {
        const newActivity = {
          id: generateId('act'),
          leadId,
          performedBy: agentId,
          action,
          details,
          timestamp: new Date().toISOString()
        };
        return { activities: [newActivity, ...state.activities] };
      }),

      getActivitiesForLead: (leadId) => {
        return get().activities
          .filter(a => a.leadId === leadId)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
    }),
    {
      name: 'propdesk-activities',
    }
  )
);
