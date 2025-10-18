// All comments in English only.
import { create } from "zustand";

export type RoleplaySetup = {
  scenario: string;
  aiRole: string;
  myRole: string;
  lang: "zh" | "en" | "es";
  details: string;
};

type State = {
  temp: Partial<RoleplaySetup> | null;
  setTemp: (v: Partial<RoleplaySetup>) => void;
  clear: () => void;
};

export const useRoleplay = create<State>((set) => ({
  temp: null,
  setTemp: (v) => set({ temp: v }),
  clear: () => set({ temp: null }),
}));
