import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: window.innerWidth > 768,
      sidebarCollapsed: false,
      activeView: 'dashboard',
      theme: 'light',
      leadViewMode: 'kanban',
      leadFilter: 'my',

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setActiveView: (view) => set({ activeView: view }),
      
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
      }),
      
      setLeadViewMode: (mode) => set({ leadViewMode: mode }),
      setLeadFilter: (filter) => set({ leadFilter: filter })
    }),
    {
      name: 'propdesk-ui',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
        }
      }
    }
  )
);
