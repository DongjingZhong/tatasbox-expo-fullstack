// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { View } from "react-native";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../providers/ThemeProvider";

function ThemedRoot() {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Follow theme: light text on dark bg, dark text on light bg */}
      <StatusBar
        style={isDark ? "light" : "dark"}
        translucent
        backgroundColor="transparent"
      />

      <Stack
        screenOptions={{
          headerShown: false,
          // Keep screens consistent with theme background
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      {/* Provide global theme (light/dark) */}
      <ThemeProvider>
        <ThemedRoot />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
