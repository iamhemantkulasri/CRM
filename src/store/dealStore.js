import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Seed Deals
const seedDeals = [
  {
    id: 'deal_1',
    leadId: 'lead_5',
    propertyId: 'prop_1',
    agentId: 'emp_rohan',
    totalDealValueLakhs: 140,
    brokeragePercentage: 2,
    brokerageAmount: 2.8,
    agentSplitPercentage: 50,
    status: 'invoiced',
    closedAt: new Date().toISOString()
  }
];

export const useDealStore = create(
  persist(
    (set, get) => ({
      deals: seedDeals,
      
      addDeal: (dealData) => set(state => ({
        deals: [{ ...dealData, id: `deal_${Date.now()}`, closedAt: new Date().toISOString() }, ...state.deals]
      })),
      
      updateDealStatus: (id, status) => set(state => ({
        deals: state.deals.map(d => d.id === id ? { ...d, status } : d)
      }))
    }),
    { name: 'propdesk-deals' }
  )
);
