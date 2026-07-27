import { create } from 'zustand';

export const useRefreshStore = create((set) => ({
    lastUpdate: Date.now(),
    triggerRefresh: () => set({ lastUpdate: Date.now() }),
}));
