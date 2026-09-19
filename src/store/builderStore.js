import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../api/supabase';

export const useBuilderStore = create(
  persist(
    (set, get) => ({
      builders: [],
      isLoading: false,
      error: null,

      // Fetch all builders & sellers from Supabase
      fetchBuilders: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('builders_sellers')
            .select('*')
            .order('name', { ascending: true });

          if (error) {
            console.error('Error fetching builders/sellers:', error);
            set({ error: error.message, isLoading: false });
            return;
          }

          if (data) {
            set({ builders: data, isLoading: false });
          }
        } catch (err) {
          console.error('Exception fetching builders/sellers:', err);
          set({ error: err.message, isLoading: false });
        }
      },

      // Add a new builder or seller
      addBuilder: async (data) => {
        const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
        const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : null;

        const payload = {
          name: data.name.trim(),
          type: data.type || 'builder',
          contact_person: data.contact_person?.trim() || null,
          phone: data.phone.trim(),
          email: data.email?.trim() || null,
          city: data.city || 'Delhi NCR',
          locality: data.locality?.trim() || null,
          office_address: data.office_address?.trim() || null,
          rera_reg_no: data.rera_reg_no?.trim() || null,
          status: data.status || 'active',
          notes: data.notes?.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (newId) payload.id = newId;

        // Optimistic add
        const optimisticRecord = { ...payload, id: newId || 'temp-' + Date.now() };
        set(state => ({ builders: [optimisticRecord, ...state.builders] }));

        try {
          const { data: saved, error } = await supabase
            .from('builders_sellers')
            .insert(payload)
            .select()
            .single();

          if (error) {
            console.error('Error adding builder/seller:', error);
          } else if (saved) {
            set(state => ({
              builders: state.builders.map(b => b.id === optimisticRecord.id ? saved : b)
            }));
            return saved;
          }
        } catch (err) {
          console.error('Exception syncing builder/seller:', err);
        }
        return optimisticRecord;
      },

      // Update an existing builder or seller
      updateBuilder: async (id, updates) => {
        set(state => ({
          builders: state.builders.map(b => 
            b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
          )
        }));

        try {
          const payload = { updated_at: new Date().toISOString() };
          if (updates.name !== undefined) payload.name = updates.name.trim();
          if (updates.type !== undefined) payload.type = updates.type;
          if (updates.contact_person !== undefined) payload.contact_person = updates.contact_person?.trim() || null;
          if (updates.phone !== undefined) payload.phone = updates.phone.trim();
          if (updates.email !== undefined) payload.email = updates.email?.trim() || null;
          if (updates.city !== undefined) payload.city = updates.city;
          if (updates.locality !== undefined) payload.locality = updates.locality?.trim() || null;
          if (updates.office_address !== undefined) payload.office_address = updates.office_address?.trim() || null;
          if (updates.rera_reg_no !== undefined) payload.rera_reg_no = updates.rera_reg_no?.trim() || null;
          if (updates.status !== undefined) payload.status = updates.status;
          if (updates.notes !== undefined) payload.notes = updates.notes?.trim() || null;

          await supabase.from('builders_sellers').update(payload).eq('id', id);
        } catch (err) {
          console.error('Exception updating builder/seller:', err);
        }
      },

      // Delete a builder or seller
      deleteBuilder: async (id) => {
        set(state => ({
          builders: state.builders.filter(b => b.id !== id)
        }));

        try {
          await supabase.from('builders_sellers').delete().eq('id', id);
        } catch (err) {
          console.error('Exception deleting builder/seller:', err);
        }
      }
    }),
    {
      name: 'tgv-live-builders-v1'
    }
  )
);
