import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { splitCommission } from './commission.js';

// Seed Deals
const seedDeals = [
  {
    id: 'deal_1',
    leadId: 'lead_5',
    propertyId: 'prop_1',
    agentId: 'emp_admin',
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
      
      addDeal: (dealData) => set(state => {
        const { property, commission_pct, commission_fixed_lakhs, partnerCutPct, ...rest } = dealData;
        const dealValueLakhs = Number(rest.totalDealValueLakhs ?? 0);
        const partnerId = rest.partner_id ?? property?.builder_id ?? property?.owner_partner_id ?? null;
        let extra;
        if (partnerId) {
          const s = splitCommission({
            dealValueLakhs,
            commission_pct: commission_pct ?? property?.commission_pct ?? rest.brokeragePercentage ?? null,
            commission_fixed_lakhs: commission_fixed_lakhs ?? property?.commission_fixed_lakhs ?? null,
            partnerCutPct: partnerCutPct ?? 50,
          });
          extra = {
            partner_id: partnerId,
            brokerageAmount: s.gross,
            gross_brokerage_lakhs: s.gross,
            partner_share_lakhs: s.partner_share_lakhs,
            tgv_share_lakhs: s.tgv_share_lakhs,
            status: rest.status ?? 'pending_invoice',
          };
        } else {
          const gross = rest.brokerageAmount ?? (rest.brokeragePercentage != null
            ? splitCommission({ dealValueLakhs, commission_pct: rest.brokeragePercentage }).gross
            : null);
          extra = {
            partner_id: null,
            gross_brokerage_lakhs: gross,
            partner_share_lakhs: null,
            tgv_share_lakhs: null,
          };
        }
        return {
          deals: [{ ...rest, ...extra, id: `deal_${Date.now()}`, closedAt: new Date().toISOString() }, ...state.deals]
        };
      }),
      
      updateDealStatus: (id, status) => set(state => ({
        deals: state.deals.map(d => d.id === id ? { ...d, status } : d)
      }))
    }),
    { name: 'propdesk-deals' }
  )
);
