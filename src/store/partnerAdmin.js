// CRM/src/store/partnerAdmin.js
export function toApprovalUpdate({ decision = 'approved', commission_pct = null, commission_fixed_lakhs = null, show_on_website = false, reason = '' } = {}) {
  if (decision === 'rejected') {
    if (!String(reason).trim()) throw new Error('rejection reason required');
    return { approval_status: 'rejected', rejection_reason: String(reason), show_on_website: false };
  }
  return { approval_status: 'approved', commission_pct: commission_pct != null ? Number(commission_pct) : null, commission_fixed_lakhs: commission_fixed_lakhs != null ? Number(commission_fixed_lakhs) : null, show_on_website: Boolean(show_on_website), rejection_reason: null };
}
