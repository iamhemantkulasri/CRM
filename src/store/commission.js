// CRM/src/store/commission.js
export function splitCommission({ dealValueLakhs, commission_pct = null, commission_fixed_lakhs = null, partnerCutPct = 50 }) {
  const gross = commission_fixed_lakhs != null ? Number(commission_fixed_lakhs) : (Number(dealValueLakhs) * Number(commission_pct || 0)) / 100;
  const partner_share_lakhs = Math.round((gross * Number(partnerCutPct)) / 100 * 100) / 100;
  return { gross, partner_share_lakhs, tgv_share_lakhs: Math.round((gross - partner_share_lakhs) * 100) / 100 };
}
