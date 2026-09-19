/**
 * Generate a unique ID with a prefix
 * e.g., generateId('lead') → 'lead_a1b2c3d4'
 */
export function generateId(prefix = 'id') {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}_${id}`;
}
