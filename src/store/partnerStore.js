// CRM/src/store/partnerStore.js
// Partners inbox is now backed by `builders_sellers` (login-enabled rows).
// `pages/Partners.jsx` is orphaned (route removed); Builders & Sellers
// hosts the approvals queue instead. This store remains for the owner
// dropdown in Properties.jsx (login-enabled partner list).
import { create } from 'zustand';
import { supabase } from '../api/supabase';
export const usePartnerStore = create((set) => ({
  partners: [], queue: [],
  fetchPartners: async () => {
    const { data } = await supabase.from('builders_sellers').select('*').not('auth_user_id', 'is', null).order('name');
    set({ partners: data || [] });
  },
  fetchQueue: async () => {
    const { data } = await supabase.from('properties').select('*').eq('approval_status','pending').order('created_at', { ascending: false });
    set({ queue: data || [] });
  },
  setSuspended: async (id, suspended) => {
    await supabase.from('builders_sellers').update({ status: suspended ? 'suspended' : 'active' }).eq('id', id);
    if (suspended) await supabase.from('properties').update({ show_on_website: false }).eq('builder_id', id);
  },
}));
