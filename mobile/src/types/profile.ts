// All code comments in English only.
export type Capability = "decision" | "expression" | "custom";

export interface UserProfile {
  id: string; // Google sub
  email: string;
  name: string; // required
  avatar?: string; // required (Google picture or user-picked)
  capability: Capability; // required
  customCapability?: string; // required if capability === "custom"
  job: string; // required
  interests: string[]; // required (>=1)
  birthday: string; // required, ISO date "YYYY-MM-DD"
  lang: "zh" | "en" | "es";
  createdAt: number;
  updatedAt: number;
}

export function isProfileComplete(p?: Partial<UserProfile> | null): boolean {
  if (!p) return false;
  const hasBase =
    !!p.name &&
    !!p.avatar &&
    !!p.capability &&
    !!p.job &&
    Array.isArray(p.interests) &&
    (p.interests?.length ?? 0) > 0 &&
    !!p.birthday;
  const customOk = p.capability !== "custom" || !!p.customCapability;
  return hasBase && customOk;
}
