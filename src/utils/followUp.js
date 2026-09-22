// Shared follow-up scheduling helpers (lead.nextFollowUp <-> ISO datetime)

export const FOLLOW_UP_PRESETS = [
  { id: 'tomorrow', label: 'Tomorrow', days: 1 },
  { id: '3days', label: '+3 days', days: 3 },
  { id: 'week', label: 'Next week', days: 7 },
];

export function addDaysISO(days, fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function formatFollowUp(iso) {
  if (!iso) return 'Not set';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Not set';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Convert an ISO datetime to the value format expected by <input type="datetime-local">
export function toDateTimeLocalValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
