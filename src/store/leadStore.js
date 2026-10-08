import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../api/supabase';

// Helper to normalize Supabase lead row
export function normalizeCrmLead(raw) {
  // Parse website visit_preference if available (e.g. "₹3 - ₹5 Cr | DLF Camellias | Direct WhatsApp Lead")
  let websiteNotes = [];
  let budgetText = '';
  if (raw.visit_preference) {
    websiteNotes.push({
      id: `pref-${raw.id || Date.now()}`,
      author: 'Website Inquiry',
      timestamp: raw.created_at || new Date().toISOString(),
      text: `Website Form: ${raw.visit_preference}`
    });
    const parts = raw.visit_preference.split('|').map(s => s.trim());
    if (parts[0]) budgetText = parts[0];
  }

  const existingNotes = Array.isArray(raw.notes) ? raw.notes : [];

  return {
    id: raw.id,
    name: raw.name || 'Unnamed Lead',
    phone: raw.phone || '',
    email: raw.email || '',
    source: raw.source || (raw.visit_preference ? 'website' : 'direct'),
    assignedTo: raw.assigned_to || raw.assignedTo || null,
    stage: raw.status || raw.stage || 'new',
    priority: raw.priority || 'warm',
    visit_preference: raw.visit_preference || '',
    requirements: raw.requirements || {
      propertyType: 'apartment',
      bhk: budgetText || '',
      budgetMinLakhs: 0,
      budgetMaxLakhs: 0,
      preferredLocalities: [],
      possessionStatus: ''
    },
    notes: existingNotes.length > 0 ? existingNotes : websiteNotes,
    nextFollowUp: raw.next_follow_up || raw.nextFollowUp || null,
    propertyId: raw.property_id || raw.propertyId || null,
    source_partner_id: raw.source_partner_id || null,
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.created_at || new Date().toISOString()
  };
}

export const useLeadStore = create(
  persist(
    (set, get) => ({
      leads: [],
      isLoading: false,
      error: null,

      // Live fetch from Supabase
      fetchLeads: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching leads from Supabase:', error);
            set({ error: error.message, isLoading: false });
            return;
          }

          if (data) {
            // Filter out any lingering mock leads
            const bannedNames = ['Test Lead UUID', 'Updated Name', 'Full Lead Test', 'Verification User'];
            const normalizedRemote = data
              .map(normalizeCrmLead)
              .filter(l => !bannedNames.includes(l.name));
            
            // Supabase is the single source of truth
            set({ leads: normalizedRemote, isLoading: false });
          }
        } catch (err) {
          console.error('Exception fetching leads:', err);
          set({ error: err.message, isLoading: false });
        }
      },

      // Subscribe to real-time incoming leads from website
      subscribeToLeads: () => {
        const channel = supabase
          .channel('public:leads')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'leads' },
            (payload) => {
              const incoming = normalizeCrmLead(payload.new);
              set(state => {
                const exists = state.leads.some(l => l.id === incoming.id);
                if (exists) return state;
                return { leads: [incoming, ...state.leads] };
              });
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'leads' },
            (payload) => {
              const updated = normalizeCrmLead(payload.new);
              set(state => ({
                leads: state.leads.map(l => l.id === updated.id ? updated : l)
              }));
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },

      getLeads: () => {
        return get().leads;
      },
      
      getLead: (id) => {
        return get().leads.find(l => l.id === id) || null;
      },
      
      getLeadsByAgent: (agentId) => {
        return get().leads.filter(l => l.assignedTo === agentId);
      },

      getLeadsByStage: (stageId) => {
        return get().leads.filter(l => l.stage === stageId);
      },

      getUnassignedLeads: () => {
        return get().leads.filter(l => l.assignedTo === null);
      },

      addLead: async (leadData) => {
        // Task 6: partner-stock leads attribute to admin but tag the source partner.
        if (leadData.source_partner_id) {
          leadData = { ...leadData, assignedTo: 'emp_admin', stage: 'new' };
        }
        // Validate or generate valid UUID for Postgres UUID column
        const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
        const leadId = (leadData.id && isUuid(leadData.id)) 
          ? leadData.id 
          : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : null);

        const newLead = normalizeCrmLead({
          ...leadData,
          id: leadId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'temp-' + Date.now()),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // 1. Optimistic local state update
        set((state) => ({ leads: [newLead, ...state.leads] }));

        // 2. Persist live to Supabase
        try {
          const insertPayload = {
            name: newLead.name,
            phone: newLead.phone,
            email: newLead.email || null,
            source: newLead.source || 'direct',
            assigned_to: newLead.assignedTo || null,
            status: newLead.stage || 'new',
            priority: newLead.priority || 'warm',
            visit_preference: newLead.visit_preference || null,
            requirements: newLead.requirements || {},
            notes: Array.isArray(newLead.notes) ? newLead.notes : [],
            next_follow_up: newLead.nextFollowUp || null,
            property_id: newLead.propertyId || null,
            source_partner_id: newLead.source_partner_id || null
          };

          // Include valid UUID if present
          if (newLead.id && isUuid(newLead.id)) {
            insertPayload.id = newLead.id;
          }

          const { data, error } = await supabase
            .from('leads')
            .insert(insertPayload)
            .select()
            .single();

          if (error) {
            console.error('Failed to sync lead to Supabase:', error);
          } else if (data) {
            const savedLead = normalizeCrmLead(data);
            // Preserve local partner tag if server row lacks it (don't overwrite with null)
            if (!savedLead.source_partner_id && newLead.source_partner_id) {
              savedLead.source_partner_id = newLead.source_partner_id;
            }
            set((state) => ({
              leads: state.leads.map(l => l.id === newLead.id ? savedLead : l)
            }));
            return savedLead;
          }
        } catch (err) {
          console.error('Failed to sync lead to Supabase:', err);
        }
        return newLead;
      },

      updateLead: async (id, updates) => {
        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === id 
              ? { ...lead, ...updates, updatedAt: new Date().toISOString() } 
              : lead
          )
        }));

        try {
          const payload = { updated_at: new Date().toISOString() };
          if (updates.name !== undefined) payload.name = updates.name;
          if (updates.phone !== undefined) payload.phone = updates.phone;
          if (updates.email !== undefined) payload.email = updates.email;
          if (updates.source !== undefined) payload.source = updates.source;
          if (updates.stage !== undefined) payload.status = updates.stage;
          if (updates.priority !== undefined) payload.priority = updates.priority;
          if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
          if (updates.requirements !== undefined) payload.requirements = updates.requirements;
          if (updates.notes !== undefined) payload.notes = updates.notes;
          if (updates.nextFollowUp !== undefined) payload.next_follow_up = updates.nextFollowUp;
          if (updates.propertyId !== undefined) payload.property_id = updates.propertyId;

          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
          if (isUuid && Object.keys(payload).length > 0) {
            await supabase.from('leads').update(payload).eq('id', id);
          }
        } catch (err) {
          console.error('Failed to sync lead update to Supabase:', err);
        }
      },

      updateLeadStage: async (id, newStage) => {
        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === id 
              ? { ...lead, stage: newStage, updatedAt: new Date().toISOString() } 
              : lead
          )
        }));

        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
          if (isUuid) {
            await supabase.from('leads').update({ 
              status: newStage,
              updated_at: new Date().toISOString()
            }).eq('id', id);
          }
        } catch (err) {
          console.error('Failed to sync lead stage to Supabase:', err);
        }
      },

      assignLead: async (id, agentId) => {
        set((state) => ({
          leads: state.leads.map(lead => 
            lead.id === id 
              ? { ...lead, assignedTo: agentId, updatedAt: new Date().toISOString() } 
              : lead
          )
        }));

        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
          if (isUuid) {
            await supabase.from('leads').update({
              assigned_to: agentId,
              updated_at: new Date().toISOString()
            }).eq('id', id);
          }
        } catch (err) {
          console.error('Failed to sync lead assignment to Supabase:', err);
        }
      },

      addNote: async (id, noteText, agentId) => {
        const newNote = {
          id: `note_${Date.now()}`,
          text: noteText,
          addedBy: agentId,
          timestamp: new Date().toISOString()
        };

        let updatedNotes = [];
        set((state) => ({
          leads: state.leads.map(lead => {
            if (lead.id === id) {
              updatedNotes = [newNote, ...(lead.notes || [])];
              return {
                ...lead,
                notes: updatedNotes,
                updatedAt: new Date().toISOString()
              };
            }
            return lead;
          })
        }));

        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
          if (isUuid && updatedNotes.length > 0) {
            await supabase.from('leads').update({
              notes: updatedNotes,
              updated_at: new Date().toISOString()
            }).eq('id', id);
          }
        } catch (err) {
          console.error('Failed to sync lead note to Supabase:', err);
        }
      },

      deleteLead: async (id) => {
        set((state) => ({
          leads: state.leads.filter(lead => lead.id !== id)
        }));

        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
          if (isUuid) {
            await supabase.from('leads').delete().eq('id', id);
          }
        } catch (err) {
          console.error('Failed to delete lead from Supabase:', err);
        }
      }
    }),
    {
      name: 'tgv-live-leads-v6',
    }
  )
);
