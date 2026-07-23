import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      activeWorkspace: 'GLOBAL', // 'GLOBAL' or specific Mandi ID
      
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      
      setActiveWorkspace: (workspaceId) => set({ activeWorkspace: workspaceId }),
    }),
    {
      name: 'krishipath-ui',
    }
  )
);

export default useUIStore;
