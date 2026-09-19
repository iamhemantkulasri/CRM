import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      currentUser: null,
      isAdmin: false,

      login: (employee) => set({
        currentUser: employee,
        isAdmin: employee.role === 'admin'
      }),

      logout: () => set({
        currentUser: null,
        isAdmin: false
      })
    }),
    {
      name: 'propdesk-auth',
    }
  )
);
