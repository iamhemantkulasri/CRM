import { STAGES, SOURCES, PRIORITIES, PROPERTY_TYPES } from './constants';

function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getAgentName(assignedTo, employees = []) {
  if (!assignedTo) return 'Unassigned';
  const emp = employees.find(e => e.id === assignedTo);
  return emp ? emp.name : assignedTo;
}

function getStageLabel(stageId) {
  const stage = STAGES.find(s => s.id === stageId);
  return stage ? stage.label : (stageId || '');
}

function getPriorityLabel(priorityId) {
  const priority = PRIORITIES.find(p => p.id === priorityId);
  return priority ? priority.label : (priorityId || '');
}

function getSourceLabel(sourceId) {
  const source = SOURCES.find(s => s.id === sourceId);
  return source ? source.label : (sourceId || '');
}

function getPropertyTypeLabel(typeId) {
  const pt = PROPERTY_TYPES.find(p => p.id === typeId);
  return pt ? pt.label : (typeId || '');
}

function getDateSuffix() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports leads array to a UTF-8 CSV with Excel-compatible BOM.
 * @param {Array} leads - Filtered or full list of leads
 * @param {Array} employees - Employee list for resolving agent names
 * @param {string} filenamePrefix - Prefix for downloaded file
 */
export function exportLeadsToCSV(leads, employees = [], filenamePrefix = 'tgv-leads') {
  if (!leads || leads.length === 0) return false;

  const headers = [
    'Lead ID',
    'Name',
    'Phone',
    'Email',
    'Stage',
    'Priority',
    'Source',
    'Property Type',
    'BHK / Configuration',
    'Budget Min (Lakhs)',
    'Budget Max (Lakhs)',
    'Preferred Localities',
    'Possession Status',
    'Assigned Agent',
    'Next Follow-Up',
    'Created At',
    'Latest Note'
  ];

  const rows = leads.map(lead => {
    const req = lead.requirements || {};
    const localities = Array.isArray(req.preferredLocalities) 
      ? req.preferredLocalities.join(', ') 
      : (req.preferredLocalities || '');
    const latestNote = Array.isArray(lead.notes) && lead.notes.length > 0 
      ? lead.notes[0]?.text || '' 
      : '';

    return [
      escapeCsvField(lead.id),
      escapeCsvField(lead.name),
      escapeCsvField(lead.phone),
      escapeCsvField(lead.email || ''),
      escapeCsvField(getStageLabel(lead.stage)),
      escapeCsvField(getPriorityLabel(lead.priority)),
      escapeCsvField(getSourceLabel(lead.source)),
      escapeCsvField(getPropertyTypeLabel(req.propertyType)),
      escapeCsvField(req.bhk || ''),
      escapeCsvField(req.budgetMinLakhs != null ? req.budgetMinLakhs : ''),
      escapeCsvField(req.budgetMaxLakhs != null ? req.budgetMaxLakhs : ''),
      escapeCsvField(localities),
      escapeCsvField(req.possessionStatus || ''),
      escapeCsvField(getAgentName(lead.assignedTo, employees)),
      escapeCsvField(lead.nextFollowUp || ''),
      escapeCsvField(lead.createdAt || ''),
      escapeCsvField(latestNote)
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filenamePrefix}-${getDateSuffix()}.csv`);
  return true;
}

/**
 * Exports leads array to structured JSON format.
 * @param {Array} leads - Filtered or full list of leads
 * @param {Array} employees - Employee list for resolving agent names
 * @param {string} filenamePrefix - Prefix for downloaded file
 */
export function exportLeadsToJSON(leads, employees = [], filenamePrefix = 'tgv-leads') {
  if (!leads || leads.length === 0) return false;

  const enrichedLeads = leads.map(lead => {
    const req = lead.requirements || {};
    return {
      ...lead,
      stageLabel: getStageLabel(lead.stage),
      priorityLabel: getPriorityLabel(lead.priority),
      sourceLabel: getSourceLabel(lead.source),
      assignedAgentName: getAgentName(lead.assignedTo, employees),
      propertyTypeLabel: getPropertyTypeLabel(req.propertyType),
    };
  });

  const jsonContent = JSON.stringify(enrichedLeads, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  triggerDownload(blob, `${filenamePrefix}-${getDateSuffix()}.json`);
  return true;
}
