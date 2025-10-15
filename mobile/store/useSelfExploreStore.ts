// stores/userSelftExploreStore.tsx
// -------------------------------------------------------------
// Tatasbox — Self-Explore Store (Zustand + AsyncStorage)
// All comments in English only.
// -------------------------------------------------------------

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ---------- Domain Types ----------

export type FocusArea = "work" | "study" | "health" | "relationship" | "other";

export type CheckIn = {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1..5
  focus: FocusArea;
  note?: string;
};

export type DialoguePath =
  | "values"
  | "strengths"
  | "blockers"
  | "lifeLine"
  | "mirrorDecision";

export type DialogueStep = {
  qid: string;
  question: string;
  answerText?: string;
  createdAt: string; // ISO
};

export type PrivacyLevel = "save" | "local" | "ephemeral"; // persisted, device-only, or not saved at all

export type DialogueSession = {
  id: string;
  path: DialoguePath;
  steps: DialogueStep[];
  status: "ongoing" | "done";
  startedAt: string; // ISO
  finishedAt?: string;
  privacy: PrivacyLevel;
};

export type ExperimentTick = { date: string; done: boolean; note?: string };

export type Experiment = {
  id: string;
  title: string;
  hypothesis: string; // If I ... then ...
  metric: string; // How I will know it works
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number; // 7..14 typical
  ticks: ExperimentTick[];
  status: "active" | "done" | "abandoned";
};

export type MonthlyReport = {
  month: string; // YYYY-MM
  highlights: string[];
  topValues: string[];
  topStrengths: string[];
  moodTrend: number[]; // (1..5) last 30 days in that month
  experimentsSummary: string[]; // "Title: 3/7" etc.
  giftUnlocked: number; // how many gifts opened in this month
};

// ---------- Helpers ----------

const ymStr = (d = new Date()) => d.toISOString().slice(0, 7);
const uuid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Inclusive dates array: [start, start+1, ...] with length = days */
function getDateRange(start: string, days: number) {
  const arr: string[] = [];
  const s = new Date(start + "T00:00:00");
  for (let i = 0; i < days; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

// ---------- Store Shape ----------

interface SelfExploreState {
  // data
  checkIns: CheckIn[];
  sessions: DialogueSession[];
  experiments: Experiment[];
  reports: MonthlyReport[]; // cached snapshots

  // settings
  settings: {
    language: "zh" | "en" | "es";
    privacyDefault: PrivacyLevel;
  };

  // derived
  streak: number; // consecutive check-in days ending today

  // actions — check-ins
  addCheckIn: (payload: Omit<CheckIn, "id">) => void;

  // actions — dialogue sessions
  startSession: (path: DialoguePath, privacy?: PrivacyLevel) => string; // returns sessionId
  pushStep: (sessionId: string, step: Omit<DialogueStep, "createdAt">) => void;
  endSession: (sessionId: string) => void;

  // actions — experiments
  createExperiment: (
    payload: Omit<Experiment, "id" | "ticks" | "status">
  ) => string;
  toggleTick: (expId: string, date: string, note?: string) => void;
  completeExperiment: (expId: string) => void;
  abandonExperiment: (expId: string) => void;

  // actions — reports / gifts
  computeMonthlyReport: (month?: string) => MonthlyReport;
  unlockGift: (month?: string) => void;

  // misc
  setPrivacyDefault: (p: PrivacyLevel) => void;
  resetEphemeralSessions: () => void;
}

// ---------- Store Implementation ----------

export const useSelfExploreStore = create<SelfExploreState>()(
  persist(
    (set, get) => ({
      // initial state
      checkIns: [],
      sessions: [],
      experiments: [],
      reports: [],
      settings: { language: "zh", privacyDefault: "save" },
      streak: 0,

      // ----- Check-ins -----
      addCheckIn: (payload) => {
        const id = uuid();
        set((s) => {
          // replace same-day entry if exists
          const next = [
            ...s.checkIns.filter((c) => c.date !== payload.date),
            { id, ...payload },
          ];

          // recompute streak (consecutive days ending today)
          const dates = new Set(next.map((x) => x.date));
          let streak = 0;
          const now = new Date();
          for (let i = 0; i < 365; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            if (dates.has(key)) streak += 1;
            else break;
          }

          return { checkIns: next, streak };
        });
      },

      // ----- Dialogue sessions -----
      startSession: (path, privacy = get().settings.privacyDefault) => {
        const id = uuid();
        const session: DialogueSession = {
          id,
          path,
          steps: [],
          status: "ongoing",
          startedAt: new Date().toISOString(),
          privacy,
        };
        set((s) => ({ sessions: [...s.sessions, session] }));
        return id;
      },

      pushStep: (sessionId, step) => {
        set((s) => ({
          sessions: s.sessions.map((ss) =>
            ss.id === sessionId
              ? {
                  ...ss,
                  steps: [
                    ...ss.steps,
                    { ...step, createdAt: new Date().toISOString() },
                  ],
                }
              : ss
          ),
        }));
      },

      endSession: (sessionId) => {
        set((s) => ({
          sessions: s.sessions.map((ss) =>
            ss.id === sessionId
              ? { ...ss, status: "done", finishedAt: new Date().toISOString() }
              : ss
          ),
        }));
      },

      // ----- Experiments -----
      createExperiment: (payload) => {
        const id = uuid();
        const dates = getDateRange(payload.startDate, payload.days);
        const ticks: ExperimentTick[] = dates.map((d) => ({
          date: d,
          done: false,
        }));
        const exp: Experiment = { id, ...payload, ticks, status: "active" };
        set((s) => ({ experiments: [exp, ...s.experiments] }));
        return id;
      },

      toggleTick: (expId, date, note) => {
        set((s) => ({
          experiments: s.experiments.map((e) => {
            if (e.id !== expId) return e;
            const ticks = e.ticks.map((t) =>
              t.date === date ? { ...t, done: !t.done, note } : t
            );
            return { ...e, ticks };
          }),
        }));
      },

      completeExperiment: (expId) => {
        set((s) => ({
          experiments: s.experiments.map((e) =>
            e.id === expId ? { ...e, status: "done" } : e
          ),
        }));
      },

      abandonExperiment: (expId) => {
        set((s) => ({
          experiments: s.experiments.map((e) =>
            e.id === expId ? { ...e, status: "abandoned" } : e
          ),
        }));
      },

      // ----- Reports / Gifts -----
      computeMonthlyReport: (month = ymStr()) => {
        const { checkIns, sessions, experiments } = get();

        // mood trend for this month
        const cins = checkIns.filter((c) => c.date.startsWith(month));
        const moodTrend = cins.map((c) => c.mood);

        // naive keyword extraction (replace with NLP later)
        const valueWords: Record<string, number> = {};
        const strengthWords: Record<string, number> = {};

        sessions
          .filter(
            (s) => s.status === "done" && s.startedAt.slice(0, 7) === month
          )
          .forEach((s) => {
            s.steps.forEach((st) => {
              const txt = (st.answerText || "").toLowerCase();
              ["growth", "integrity", "freedom", "impact", "stability"].forEach(
                (w) => {
                  if (txt.includes(w)) valueWords[w] = (valueWords[w] || 0) + 1;
                }
              );
              [
                "writing",
                "analysis",
                "design",
                "leadership",
                "learning",
              ].forEach((w) => {
                if (txt.includes(w))
                  strengthWords[w] = (strengthWords[w] || 0) + 1;
              });
            });
          });

        const topValues = Object.entries(valueWords)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([k]) => k);

        const topStrengths = Object.entries(strengthWords)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([k]) => k);

        const experimentsSummary = experiments
          .filter((e) => e.startDate.slice(0, 7) === month)
          .map((e) => {
            const done = e.ticks.filter((t) => t.done).length;
            return `${e.title}: ${done}/${e.ticks.length}`;
          });

        const report: MonthlyReport = {
          month,
          highlights: [],
          topValues,
          topStrengths,
          moodTrend,
          experimentsSummary,
          giftUnlocked: 0,
        };

        // cache or replace this month's snapshot
        set((s) => {
          const others = s.reports.filter((r) => r.month !== month);
          return { reports: [...others, report] };
        });

        return report;
      },

      unlockGift: (month = ymStr()) => {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.month === month
              ? { ...r, giftUnlocked: (r.giftUnlocked || 0) + 1 }
              : r
          ),
        }));
      },

      // ----- Misc -----
      setPrivacyDefault: (p) =>
        set((s) => ({ settings: { ...s.settings, privacyDefault: p } })),

      resetEphemeralSessions: () =>
        set((s) => ({
          sessions: s.sessions.filter((ss) => ss.privacy !== "ephemeral"),
        })),
    }),
    {
      name: "self-explore-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Do not persist ephemeral sessions; keep derived values minimal
      partialize: (s) => ({
        checkIns: s.checkIns,
        sessions: s.sessions.filter((ss) => ss.privacy !== "ephemeral"),
        experiments: s.experiments,
        reports: s.reports,
        settings: s.settings,
        streak: s.streak,
      }),
    }
  )
);

// Optional default export for convenience
export default useSelfExploreStore;
