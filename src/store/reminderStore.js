import { create } from 'zustand';

export const useReminderStore = create((set, get) => ({
  // Check if a lead's follow up is overdue (scheduled in the past or > 48h untouched)
  isOverdue: (lead) => {
    if (!lead) return false;
    if (lead.stage === 'won' || lead.stage === 'lost') return false;

    if (lead.nextFollowUp) {
      const followUpDate = new Date(lead.nextFollowUp);
      return followUpDate.getTime() < Date.now();
    }

    // If no explicit follow-up set, check if created/updated > 48h ago
    const lastActivity = new Date(lead.updatedAt || lead.createdAt || 0);
    const hoursSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > 48;
  },

  // Check if follow up is due today
  isDueToday: (lead) => {
    if (!lead || !lead.nextFollowUp) return false;
    if (lead.stage === 'won' || lead.stage === 'lost') return false;

    const followUpDate = new Date(lead.nextFollowUp);
    const today = new Date();
    return (
      followUpDate.getDate() === today.getDate() &&
      followUpDate.getMonth() === today.getMonth() &&
      followUpDate.getFullYear() === today.getFullYear()
    );
  },

  // Filter list of overdue leads from any array of leads
  getOverdueLeads: (leads) => {
    const isOverdueFn = get().isOverdue;
    return (leads || []).filter(isOverdueFn);
  },

  // Filter list of leads due today
  getDueTodayLeads: (leads) => {
    const isDueTodayFn = get().isDueToday;
    return (leads || []).filter(isDueTodayFn);
  }
}));
