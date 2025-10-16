// app/channels/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "../../components/ui/AppText"; // ← adjust path if needed
import { useTheme } from "../../providers/ThemeProvider"; // ← adjust path if needed

type Item = {
  key: string;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  href: Href;
  group: "self-improve" | "self-heal" | "fun";
};

const DATA: Item[] = [
  /** -------- Self-Improve -------- */
  {
    key: "communication",
    title: "沟通训练",
    desc: "表达更清晰，回应更有分寸。",
    icon: "chatbubbles-outline",
    tint: "#6366F1",
    href: "/channels/communication" as Href,
    group: "self-improve",
  },
  {
    key: "decision-practice",
    title: "决策练习",
    desc: "找模型、理思路，做更稳的决定。",
    icon: "analytics-outline", // safe & widely available icon
    tint: "#8B5CF6",
    href: "/channels/decision" as Href, // ← new route
    group: "self-improve",
  },

  /** -------- Self-Heal -------- */
  {
    key: "self-explore",
    title: "自我探索",
    desc: "与自己对话，梳理情绪与目标。",
    icon: "sparkles-outline",
    tint: "#10B981",
    href: "/channels/self-explore" as Href,
    group: "self-heal",
  },
  {
    key: "daily-stories",
    title: "每日励志故事",
    desc: "真实案例，点亮当下的你。",
    icon: "book-outline",
    tint: "#06B6D4",
    href: "/channels/stories" as Href,
    group: "self-heal",
  },

  /** -------- Fun -------- */
  {
    key: "decision",
    title: "决策选择",
    desc: "小转盘，减少纠结日常小事。",
    icon: "aperture-outline",
    tint: "#F59E0B",
    href: "/channels/tools/decision" as Href,
    group: "fun",
  },
];

const GroupTitle: Record<Item["group"], string> = {
  "self-improve": "自我提升",
  "self-heal": "自我疗愈",
  fun: "趣味工具",
};

export default function ChannelsHome() {
  const { colors, isDark } = useTheme();

  const groups = useMemo(
    () => ({
      "self-improve": DATA.filter((x) => x.group === "self-improve"),
      "self-heal": DATA.filter((x) => x.group === "self-heal"),
      fun: DATA.filter((x) => x.group === "fun"),
    }),
    []
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.container]}>
        {(["self-improve", "self-heal", "fun"] as const).map((g) => (
          <View key={g} style={styles.section}>
            <AppText
              variant="headline"
              weight="800"
              style={{ color: colors.text, marginBottom: 10 }}
            >
              {GroupTitle[g]}
            </AppText>

            <View style={styles.list}>
              {groups[g].map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => router.push(item.href)}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.92 : 1,
                      // Light theme: soft shadow; Dark theme: rely on border/contrast
                      shadowColor: isDark ? "transparent" : "#000",
                      shadowOpacity: isDark ? 0 : 0.06,
                      shadowRadius: isDark ? 0 : 8,
                      shadowOffset: isDark
                        ? undefined
                        : { width: 0, height: 2 },
                      elevation: isDark ? 0 : 2,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: `${item.tint}22` }, // translucent background
                    ]}
                  >
                    <Ionicons name={item.icon} size={22} color={item.tint} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <AppText
                      variant="body"
                      weight="700"
                      style={{ color: colors.text }}
                    >
                      {item.title}
                    </AppText>
                    <AppText variant="caption" muted style={{ marginTop: 2 }}>
                      {item.desc}
                    </AppText>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.mutedText}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  section: { marginBottom: 18 },
  list: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
