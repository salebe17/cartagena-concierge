import { create } from "zustand";

interface AppState {
  activeRole: "client" | "technician" | null;
  isRealtimeConnected: boolean;
  setActiveRole: (role: "client" | "technician") => void;
  setRealtimeStatus: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeRole: null,
  isRealtimeConnected: false,
  setActiveRole: (role) => set({ activeRole: role }),
  setRealtimeStatus: (status) => set({ isRealtimeConnected: status }),
}));
