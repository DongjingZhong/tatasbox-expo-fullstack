// app/(drawer)/pricing.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Pricing() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.body}>
        <Text style={styles.title}>Pricing</Text>
        <Text style={styles.desc}>
          Plan A / Plan B ... (fill your pricing content here)
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  body: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: "800" },
  desc: { fontSize: 14, color: "#4B5563" },
});
