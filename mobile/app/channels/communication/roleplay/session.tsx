import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import TopBar from "@/components/ui/TopBar";
import StartNowBar from "@/components/home/StartNowBar";

export default function RoleplaySessionPage() {
  const { colors, isDark } = useTheme();
  const {
    aiRole = "",
    meRole = "",
    situation = "",
  } = useLocalSearchParams<{
    aiRole?: string;
    meRole?: string;
    situation?: string;
  }>();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <TopBar title="角色扮演" />

      <View
        style={[
          styles.summary,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <Row
          icon="chatbubble-ellipses-outline"
          label="场景"
          value={String(situation)}
          color={colors.text}
          isDark={isDark}
        />
        <Row
          icon="sparkles-outline"
          label="AI 扮演"
          value={String(aiRole)}
          color={colors.text}
          isDark={isDark}
        />
        <Row
          icon="person-outline"
          label="我扮演"
          value={String(meRole)}
          color={colors.text}
          isDark={isDark}
        />
      </View>

      <View style={styles.stage}>
        <Text
          style={{
            color: isDark ? "#9CA3AF" : "#6B7280",
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          点击下方按钮开始，由 AI（{aiRole || "未设置"}）在「
          {situation || "未设置"}」场景中和你（{meRole || "未设置"}
          ）进行角色扮演。
        </Text>
      </View>

      <StartNowBar
        onPress={() => {
          // TODO: 这里接入你的聊天/开场逻辑（InputDock + ChatBubble）
          // 例如：让 AI 先打招呼并给出第一句情境引导
        }}
        bottomFraction={0.18}
      />
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  value,
  color,
  isDark,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  isDark: boolean;
}) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.left}>
        <Ionicons
          name={icon}
          size={18}
          color={isDark ? "#E5E7EB" : "#111827"}
        />
        <Text style={[rowStyles.label, { color }]}>{label}</Text>
      </View>
      <Text numberOfLines={1} style={[rowStyles.value, { color }]}>
        {value || "—"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  summary: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 10,
  },
  stage: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(125,125,125,0.18)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 13, fontWeight: "800" },
  value: { fontSize: 13, fontWeight: "700", maxWidth: "64%", opacity: 0.9 },
});
