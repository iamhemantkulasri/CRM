import { useLeadStore } from '../store/leadStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useActivityStore } from '../store/activityStore';

/**
 * Webhook Ingestion Engine for Real Estate Lead Portals
 * Formats incoming payloads from 99acres, Magicbricks, Housing.com, Meta Ads, and custom Webhooks.
 */

export const PORTAL_WEBHOOK_SCHEMAS = {
  '99acres': {
    name: '99acres Webhook',
    samplePayload: {
      lead_id: '99A-981240',
      client_name: 'Anand Vardhan',
      client_mobile: '+919876543210',
      client_email: 'anand.vardhan@gmail.com',
      project_name: 'Sobha Dream Acres',
      property_type: 'Apartment',
      bhk: '3 BHK',
      budget_min: 90,
      budget_max: 130,
      locality: 'Panathur, Outer Ring Road',
      source: '99acres',
      query_time: new Date().toISOString()
    }
  },
  'magicbricks': {
    name: 'Magicbricks Webhook',
    samplePayload: {
      EnquiryID: 'MB-448102',
      Name: 'Shalini Murthy',
      Mobile: '+919988776655',
      Email: 'shalini.m@techcorp.com',
      RequirementType: 'Buy',
      PropertyType: 'Villa',
      Bedrooms: '4 BHK',
      BudgetRange: '2.5 Cr - 3.5 Cr',
      City: 'Bengaluru',
      PreferredLocations: 'Sarjapur Road, Harlur',
      Campaign: 'Magicbricks Premium'
    }
  },
  'meta_ads': {
    name: 'Meta Ads Webhook (Facebook / Instagram)',
    samplePayload: {
      ad_id: 'ad_fb_884920',
      campaign_name: 'Prestige Waterfront Launch',
      full_name: 'Rohan Deshmukh',
      phone_number: '+919765432109',
      email: 'rohan.deshmukh@yahoo.co.in',
      configured_bhk: '2 BHK',
      budget_in_lakhs: '75',
      location_preference: 'Whitefield',
      created_time: new Date().toISOString()
    }
  },
  'custom': {
    name: 'Custom / Website Inbound API',
    samplePayload: {
      name: 'Aditi Saxena',
      phone: '+919811223344',
      email: 'aditi@outlook.com',
      propertyType: 'apartment',
      bhk: '3 BHK',
      budgetMinLakhs: 80,
      budgetMaxLakhs: 120,
      preferredLocalities: ['Bellandur', 'HSR Layout'],
      notes: 'Looking for prompt possession'
    }
  }
};

/**
 * Normalizes any external portal webhook payload into PropDesk Lead Schema
 */
export function normalizeWebhookPayload(portal, payload) {
  let name = 'Inbound Lead';
  let phone = '';
  let email = '';
  let source = portal || 'portal_webhook';
  let propertyType = 'apartment';
  let bhk = '';
  let budgetMinLakhs = 0;
  let budgetMaxLakhs = 0;
  let localities = [];
  let noteText = '';

  switch (portal) {
    case '99acres':
      name = payload.client_name || payload.name || name;
      phone = payload.client_mobile || payload.mobile || payload.phone || '';
      email = payload.client_email || payload.email || '';
      propertyType = (payload.property_type || 'apartment').toLowerCase();
      bhk = payload.bhk || '';
      budgetMinLakhs = Number(payload.budget_min) || 0;
      budgetMaxLakhs = Number(payload.budget_max) || 0;
      localities = payload.locality ? payload.locality.split(',').map(s => s.trim()) : [];
      noteText = `Auto-captured via 99acres Webhook for project "${payload.project_name || 'General'}"`;
      break;

    case 'magicbricks':
      name = payload.Name || payload.client_name || name;
      phone = payload.Mobile || payload.mobile || '';
      email = payload.Email || payload.email || '';
      source = 'magicbricks';
      propertyType = (payload.PropertyType || 'apartment').toLowerCase();
      bhk = payload.Bedrooms || '';
      // Parse budget range if string (e.g. '2.5 Cr - 3.5 Cr')
      if (payload.BudgetRange) {
        const nums = payload.BudgetRange.match(/[\d.]+/g);
        if (nums && nums.length > 0) {
          const isCr = payload.BudgetRange.toLowerCase().includes('cr');
          const mult = isCr ? 100 : 1;
          budgetMinLakhs = Math.round(parseFloat(nums[0]) * mult);
          budgetMaxLakhs = nums[1] ? Math.round(parseFloat(nums[1]) * mult) : budgetMinLakhs;
        }
      }
      localities = payload.PreferredLocations ? payload.PreferredLocations.split(',').map(s => s.trim()) : [];
      noteText = `Auto-captured via Magicbricks Enquiry ID ${payload.EnquiryID || ''}`;
      break;

    case 'meta_ads':
      name = payload.full_name || payload.name || name;
      phone = payload.phone_number || payload.phone || '';
      email = payload.email || '';
      source = 'meta_ads';
      bhk = payload.configured_bhk || '';
      budgetMaxLakhs = Number(payload.budget_in_lakhs) || 80;
      budgetMinLakhs = Math.round(budgetMaxLakhs * 0.8);
      localities = payload.location_preference ? [payload.location_preference] : [];
      noteText = `Auto-captured via Meta Ads Campaign: "${payload.campaign_name || 'Lead Gen'}"`;
      break;

    default:
      name = payload.name || name;
      phone = payload.phone || payload.mobile || '';
      email = payload.email || '';
      propertyType = payload.propertyType || 'apartment';
      bhk = payload.bhk || '';
      budgetMinLakhs = Number(payload.budgetMinLakhs) || 0;
      budgetMaxLakhs = Number(payload.budgetMaxLakhs) || 0;
      localities = Array.isArray(payload.preferredLocalities)
        ? payload.preferredLocalities
        : (payload.locality ? [payload.locality] : []);
      noteText = payload.notes || 'Auto-captured via Custom Webhook API';
      break;
  }

  // Ensure clean phone format
  phone = phone.replace(/[^\d+]/g, '');
  if (phone.length === 10 && !phone.startsWith('+')) {
    phone = `+91${phone}`;
  }

  return {
    name,
    phone,
    email,
    source,
    stage: 'new',
    priority: 'hot',
    requirements: {
      propertyType,
      bhk,
      budgetMinLakhs,
      budgetMaxLakhs,
      preferredLocalities: localities,
      possessionStatus: 'Any'
    },
    notes: noteText ? [{
      id: `note_${Date.now()}`,
      text: noteText,
      addedBy: 'System Auto-Capture',
      timestamp: new Date().toISOString()
    }] : []
  };
}

/**
 * Auto-assigns a lead using a Round-Robin queue across active sales agents
 */
export function getNextRoundRobinAgent(employees) {
  const activeAgents = (employees || []).filter(e => e.role === 'agent' && e.status !== 'inactive');
  if (activeAgents.length === 0) return null;

  // Track round-robin index in localStorage
  const LAST_ASSIGNED_KEY = 'propdesk_last_assigned_agent_idx';
  let lastIdx = parseInt(localStorage.getItem(LAST_ASSIGNED_KEY) || '-1', 10);
  const nextIdx = (lastIdx + 1) % activeAgents.length;
  localStorage.setItem(LAST_ASSIGNED_KEY, nextIdx.toString());

  return activeAgents[nextIdx];
}

/**
 * Main Webhook Receiver Pipeline
 * Receives raw portal payload, parses, auto-assigns via round-robin, saves lead, and logs activity.
 */
export function receiveWebhook(portal, payload, options = { autoAssign: true }) {
  const normalized = normalizeWebhookPayload(portal, payload);
  const employees = useEmployeeStore.getState().employees || [];

  let assignedAgent = null;
  if (options.autoAssign) {
    assignedAgent = getNextRoundRobinAgent(employees);
    if (assignedAgent) {
      normalized.assignedTo = assignedAgent.id;
    }
  }

  // Add lead to Zustand store (persisted to localStorage and Supabase)
  const newLeadId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
    ? crypto.randomUUID() 
    : `lead_${Date.now()}`;
  const fullLead = {
    ...normalized,
    id: newLeadId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  useLeadStore.getState().addLead(fullLead);

  // Log system activity
  useActivityStore.getState().logActivity(
    newLeadId,
    'LEAD_CREATED',
    `Lead auto-captured from ${portal.toUpperCase()} webhook${assignedAgent ? ` and auto-assigned to ${assignedAgent.name} (Round-Robin)` : ''}`,
    assignedAgent?.id || 'system'
  );

  return {
    success: true,
    leadId: newLeadId,
    lead: fullLead,
    assignedAgent
  };
}
