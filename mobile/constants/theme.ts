// theme/palette.ts
export const palette = {
  // Brand
  primary: "#C8DBD2",
  primary600: "#A6C2B4",
  primary700: "#7FA392",

  secondary: "#B8CFC4",
  secondary600: "#96B6A9",
  secondary700: "#6F9686",

  // UI Neutrals
  bg: "#F9FAFB",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",

  // Accents (示例：金币色)
  coin: "#B45309",
  cta_btn: "#FF6B6B",
} as const;

export type Palette = typeof palette;
