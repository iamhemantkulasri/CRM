/* Indian-specific formatters for PropDesk CRM */

/**
 * Format price in Lakhs to display as ₹45 L or ₹1.25 Cr
 */
export function formatINR(lakhs) {
  if (lakhs == null || isNaN(lakhs)) return '—';
  if (lakhs >= 100) {
    const crores = lakhs / 100;
    const formatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Cr`;
  }
  return `₹${lakhs} L`;
}

/**
 * Format budget range: ₹80 L – ₹1.2 Cr
 */
export function formatBudgetRange(minLakhs, maxLakhs) {
  if (minLakhs == null && maxLakhs == null) return '—';
  if (minLakhs == null) return `Up to ${formatINR(maxLakhs)}`;
  if (maxLakhs == null) return `${formatINR(minLakhs)}+`;
  return `${formatINR(minLakhs)} – ${formatINR(maxLakhs)}`;
}

/**
 * Format phone number: +91 98765 43210
 */
export function formatPhone(phone) {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    const num = digits.slice(2);
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Format date: 05 Sep 2026, 11:30 AM
 */
export function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date only: 05 Sep 2026
 */
export function formatDateShort(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Relative date: "2 hours ago", "Tomorrow", "Yesterday"
 */
export function formatRelativeDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins === 0) return 'Just now';

  // Past
  if (diffMins < 0) {
    const absMins = Math.abs(diffMins);
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    if (absMins < 60) return `${absMins}m ago`;
    if (absHours < 24) return `${absHours}h ago`;
    if (absDays === 1) return 'Yesterday';
    if (absDays < 7) return `${absDays}d ago`;
    return formatDateShort(date);
  }

  // Future
  if (diffMins < 60) return `In ${diffMins}m`;
  if (diffHours < 24) return `In ${diffHours}h`;
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return formatDateShort(date);
}

/**
 * Format area: 1,250 sq. ft.
 */
export function formatArea(sqft) {
  if (!sqft) return '—';
  return `${sqft.toLocaleString('en-IN')} sq. ft.`;
}

/**
 * Format call duration: 2m 45s
 */
export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

/**
 * Get initials from a name: "Rohan Verma" → "RV"
 */
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
