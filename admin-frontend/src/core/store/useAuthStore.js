import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      permissions: [],

      login: (data) => set({
        user: data.user,
        token: data.token,
        role: data.role,
        permissions: data.permissions || [],
      }),

      logout: () => set({
        user: null,
        token: null,
        role: null,
        permissions: [],
      }),

      hasPermission: (permission) => {
        const { permissions, role } = get();
        if (role === 'SUPER_ADMIN') return true; // Super admins can do everything
        return permissions.includes(permission);
      },
      
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'krishipath-auth', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
