// All code comments in English only.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { UserProfile, isProfileComplete } from "@/src/types/profile";

const KEY = "tbx_profile_v1";

type State = {
  profile: UserProfile | null;
  signedIn: boolean;
  hydrated: boolean; // ← NEW: mark when hydration is finished
  hydrate: () => Promise<void>;
  setProfile: (partial: Partial<UserProfile>) => Promise<void>;
  overwriteProfile: (p: UserProfile) => Promise<void>;
  clear: () => Promise<void>;
  isComplete: () => boolean;
};

export const useAuthProfile = create<State>((set, get) => ({
  profile: null,
  signedIn: false,
  hydrated: false,

  // Load profile from device storage once at app start
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        try {
          const p = JSON.parse(raw) as UserProfile;
          set({ profile: p, signedIn: true });
        } catch {
          // Corrupted JSON fallback: wipe and reset
          await AsyncStorage.removeItem(KEY);
          set({ profile: null, signedIn: false });
        }
      }
    } finally {
      // Always mark hydrated to unblock UI
      set({ hydrated: true });
    }
  },

  // Merge partial profile and persist
  setProfile: async (partial) => {
    const cur = get().profile ?? ({} as UserProfile);
    const next = { ...cur, ...partial, updatedAt: Date.now() } as UserProfile;
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    set({ profile: next, signedIn: true });
  },

  // Replace entire profile and persist
  overwriteProfile: async (p) => {
    const next = { ...p, updatedAt: Date.now() };
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    set({ profile: next, signedIn: true });
  },

  // Clear local profile
  clear: async () => {
    await AsyncStorage.removeItem(KEY);
    set({ profile: null, signedIn: false });
  },

  // Convenience validator
  isComplete: () => isProfileComplete(get().profile),
}));
