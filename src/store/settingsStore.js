import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      agencyName: 'TGV Estates',
      helplineNumber: '+91 85868 28107',
      introTemplate: 'Hi [Name], this is [Agent] from [Agency]. I saw your enquiry for [BHK] in [Locality]. When can we discuss your requirements?',
      visitTemplate: "Hi [Name], your site visit is confirmed for [Date] at [Time]. Location: [Google Maps Link]. I'll meet you there. – [Agent]",

      updateSettings: (newSettings) => set((state) => ({
        ...state,
        ...newSettings
      })),

      resetDefaults: () => set({
        agencyName: 'TGV Estates',
        helplineNumber: '+91 85868 28107',
        introTemplate: 'Hi [Name], this is [Agent] from [Agency]. I saw your enquiry for [BHK] in [Locality]. When can we discuss your requirements?',
        visitTemplate: "Hi [Name], your site visit is confirmed for [Date] at [Time]. Location: [Google Maps Link]. I'll meet you there. – [Agent]",
      })
    }),
    {
      name: 'tgv-crm-settings'
    }
  )
);
