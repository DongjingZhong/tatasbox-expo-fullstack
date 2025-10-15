import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance } from "react-native";

type ThemeMode = "light" | "dark";

type Colors = {
  background: string;
  card: string;
  text: string;
  mutedText: string;
  border: string;
  primary: string; // brand accent (kept same across modes)
};

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  colors: Colors;
  isDark: boolean;
};

const STORAGE_KEY = "tatasbox.theme";

const lightColors: Colors = {
  background: "#FFFFFF",
  card: "#F7F7F7",
  text: "#0F172A", // slate-900
  mutedText: "#475569", // slate-600
  border: "#E5E7EB",
  primary: "#FACC15", // yellow-400
};

const darkColors: Colors = {
  background: "#0B0F14", // near-black
  card: "#111827", // gray-900
  text: "#F8FAFC", // slate-50
  mutedText: "#CBD5E1", // slate-300
  border: "#1F2937", // gray-800
  primary: "#FACC15",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Default to system scheme on first run; persist afterwards
  const system = Appearance.getColorScheme() === "dark" ? "dark" : "light";
  const [mode, setModeState] = useState<ThemeMode>(system);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") setModeState(saved);
      } catch {}
    })();
  }, []);

  // Explicit setter for external calls
  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  }, []);

  // FIX: use the state setter's functional form here
  const toggle = useCallback(() => {
    setModeState((prev: ThemeMode) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = mode === "dark" ? darkColors : lightColors;

  const value = useMemo(
    () => ({ mode, setMode, toggle, colors, isDark: mode === "dark" }),
    [mode, setMode, toggle, colors]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
