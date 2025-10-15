// app/settings.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.wrap}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.sub}>This is a placeholder page.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, gap: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  sub: { color: "#6B7280" },
});
