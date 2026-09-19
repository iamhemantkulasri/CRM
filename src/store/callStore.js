import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/idGenerator';
import { useActivityStore } from './activityStore';

export const useCallStore = create(
  persist(
    (set, get) => ({
      calls: [],
      
      logCall: (leadId, agentId, duration, status, notes = '') => set((state) => {
        const newCall = {
          id: generateId('call'),
          leadId,
          agentId,
          duration,
          status,
          notes,
          timestamp: new Date().toISOString()
        };
        
        // Ponytail: Auto log to timeline in one go
        useActivityStore.getState().logActivity(
          leadId, 
          agentId, 
          'CALL_LOGGED', 
          `Call ${status} (${duration}s). ${notes}`
        );
        
        return { calls: [newCall, ...state.calls] };
      })
    }),
    { name: 'propdesk-calls' }
  )
);
