// CRM/src/store/pooledSearch.js
// Owner dimension is the builders_sellers FK `builder_id` (TGV own = null).
// Legacy `owner_partner_id` is honored as a read fallback only.
export function filterPooled(rows, { owner = 'all', city = '', search = '' } = {}) {
  return rows.filter((r) => {
    if (owner !== 'all' && ((r.builder_id ?? r.owner_partner_id) || 'tgv') !== owner) return false;
    if (city && (r.city || r.location_city) !== city) return false;
    if (search && !`${r.title || r.name} ${r.location_sector || r.locality}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}
export function toAdminLead(property, buyer) {
  return { ...buyer, propertyId: property.id, source_partner_id: property.builder_id ?? property.owner_partner_id ?? null, assignedTo: 'emp_admin', stage: 'new' };
}
