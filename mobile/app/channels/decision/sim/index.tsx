// All comments in English only.

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import TopBar from "@/components/ui/TopBar";

export default function DecisionSimPlaceholder() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <TopBar
        title={<Text style={styles.title}>真实场景决策训练</Text>}
        left="back"
      />
      <View style={styles.center}>
        <Text style={styles.h1}>Step 0 · 选择角色与训练场景</Text>
        <Text style={styles.p}>
          下一步将接入：场景选择 → 情境描述 → 作答 → 评分与建议 → 真实案例对照。
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "700" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 8,
  },
  h1: { fontSize: 16, fontWeight: "700" },
  p: { fontSize: 13, color: "#6B7280", textAlign: "center" },
});
