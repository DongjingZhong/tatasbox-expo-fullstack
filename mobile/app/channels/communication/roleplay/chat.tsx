// All comments in English only.
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import TopBar from "@/components/ui/TopBar";
import { useTheme } from "@/providers/ThemeProvider";
import { useRoleplay } from "@/src/store/useRoleplay";

type Params = {
  scenario?: string;
  aiRole?: string;
  myRole?: string;
  lang?: "zh" | "en" | "es";
};

export default function RoleplayChatScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams<Params>();
  const temp = useRoleplay((s) => s.temp);

  // Merge URL params with temp store (for long details)
  const scenario = params.scenario ?? temp?.scenario ?? "";
  const aiRole = params.aiRole ?? temp?.aiRole ?? "";
  const myRole = params.myRole ?? temp?.myRole ?? "";
  const lang = (params.lang ?? (temp?.lang as any)) || "zh";
  const details = temp?.details ?? "";

  const subText = isDark ? "#94A3B8" : "#64748B";
  const border = colors.border;
  const cardBg = colors.card;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <TopBar
        left="back"
        title={
          <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>
            角色扮演
          </Text>
        }
      />

      {/* Header summary card */}
      <View
        style={[
          styles.headerCard,
          { backgroundColor: cardBg, borderColor: border },
        ]}
      >
        <Row label="场景" value={scenario} />
        <Row label="AI 角色" value={aiRole} />
        <Row label="我的角色" value={myRole} />
        <Row label="语言" value={langLabel(lang)} />
        {!!details && (
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.label, { color: subText }]}>详细场景</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {details}
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => router.back()}
          style={[styles.editBtn, { borderColor: border }]}
        >
          <Ionicons name="pencil" size={14} color={subText} />
          <Text style={{ color: subText, fontWeight: "700" }}>返回修改</Text>
        </Pressable>
      </View>

      {/* Chat placeholder area */}
      <View style={{ padding: 16, gap: 12 }}>
        <Bubble
          who="system"
          text={buildSystemPrompt({ aiRole, myRole, scenario, lang, details })}
          tint={isDark ? "#1F2937" : "#EEF2FF"}
          textColor={isDark ? "#E5E7EB" : "#1F2937"}
        />
        <Bubble
          who="ai"
          text="你好，我已经准备好开始角色扮演。请先由你开场吧。"
        />
      </View>

      {/* Input area - stub only (hook up your chat later) */}
      <View
        style={[
          styles.inputBar,
          { borderTopColor: border, backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: subText }}>
          （这里接入你的聊天输入框与发送逻辑）
        </Text>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={[styles.label]}>{label}</Text>
      <Text style={[styles.value]}>{value || "-"}</Text>
    </View>
  );
}

function Bubble({
  who,
  text,
  tint,
  textColor,
}: {
  who?: "ai" | "me" | "system";
  text: string;
  tint?: string;
  textColor?: string;
}) {
  return (
    <View
      style={[
        styles.bubble,
        {
          backgroundColor: tint || "#F1F5F9",
          alignSelf: who === "me" ? "flex-end" : "flex-start",
        },
      ]}
    >
      <Text style={{ color: textColor || "#0F172A" }}>{text}</Text>
    </View>
  );
}

function langLabel(l: "zh" | "en" | "es") {
  if (l === "zh") return "中文";
  if (l === "en") return "English";
  return "Español";
}

function buildSystemPrompt(p: {
  aiRole: string;
  myRole: string;
  scenario: string;
  lang: "zh" | "en" | "es";
  details?: string;
}) {
  const langName = langLabel(p.lang);
  return `系统提示：本次对话的场景是「${p.scenario}」。AI 扮演「${
    p.aiRole
  }」，用户扮演「${p.myRole}」。对话语言为 ${langName}。${
    p.details ? "补充信息：" + p.details : ""
  }`;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerCard: {
    margin: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
  },
  label: { fontSize: 12, fontWeight: "700" },
  value: { fontSize: 14, fontWeight: "500", marginTop: 2 },
  editBtn: {
    marginTop: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  bubble: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: "86%",
  },
  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
});
