// All comments in English only.

import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import TopBar from "@/components/ui/TopBar";

export default function MyDecisionPlaceholder() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <TopBar title={<Text style={styles.title}>我的决策</Text>} left="back" />
      <View style={styles.center}>
        <Text style={styles.h1}>Step 1 · 输入你的决策主题</Text>
        <Text style={styles.p}>
          下一步将接入：文本/语音输入 → 发送后端生成动态表单。
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
