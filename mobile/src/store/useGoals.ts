// All code comments in English only.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const KEY = "tbx_goals_v1";

export type Goal = {
  id: string;
  text: string;
  image?: string;
  pinned: boolean;
  done: boolean;
  createdAt: number;
};

type State = {
  hydrated: boolean;
  identity: string;
  goals: Goal[];

  hydrate: () => Promise<void>;
  setIdentity: (s: string) => Promise<void>;
  addGoal: (text: string, image?: string) => Promise<void>;
  setImage: (id: string, uri?: string) => Promise<void>;
  updateText: (id: string, text: string) => Promise<void>; // NEW
  toggleDone: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
};

type PersistShape = {
  identity: string;
  goals: Goal[];
};

async function readPersist(): Promise<PersistShape | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
}

async function writePersist(data: PersistShape) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export const useGoals = create<State>((set, get) => ({
  hydrated: false,
  identity: "",
  goals: [],

  hydrate: async () => {
    const data = await readPersist();
    if (data) set({ identity: data.identity || "", goals: data.goals || [] });
    set({ hydrated: true });
  },

  setIdentity: async (s) => {
    set({ identity: s });
    await writePersist({ identity: s, goals: get().goals });
  },

  addGoal: async (text, image) => {
    const t = text.trim();
    if (!t) return;
    const goal: Goal = {
      id: Date.now().toString(),
      text: t,
      image,
      pinned: false,
      done: false,
      createdAt: Date.now(),
    };
    const next = [...get().goals, goal];
    set({ goals: next });
    await writePersist({ identity: get().identity, goals: next });
  },

  setImage: async (id, uri) => {
    const next = get().goals.map((g) =>
      g.id === id ? { ...g, image: uri } : g
    );
    set({ goals: next });
    await writePersist({ identity: get().identity, goals: next });
  },

  updateText: async (id, text) => {
    const t = text.trim();
    const next = get().goals.map((g) => (g.id === id ? { ...g, text: t } : g));
    set({ goals: next });
    await writePersist({ identity: get().identity, goals: next });
  },

  toggleDone: async (id) => {
    const next = get().goals.map((g) =>
      g.id === id ? { ...g, done: !g.done } : g
    );
    set({ goals: next });
    await writePersist({ identity: get().identity, goals: next });
  },

  togglePin: async (id) => {
    const sorted = get()
      .goals.map((g) => (g.id === id ? { ...g, pinned: !g.pinned } : g))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
    set({ goals: sorted });
    await writePersist({ identity: get().identity, goals: sorted });
  },

  removeGoal: async (id) => {
    const next = get().goals.filter((g) => g.id !== id);
    set({ goals: next });
    await writePersist({ identity: get().identity, goals: next });
  },

  clearAll: async () => {
    set({ identity: "", goals: [] });
    await writePersist({ identity: "", goals: [] });
  },
}));
