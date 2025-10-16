// All comments in English only.
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

import TopBar from "@/components/ui/TopBar";
import { useTheme } from "@/providers/ThemeProvider";

export default function DecisionHome() {
  const { isDark } = useTheme();

  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const cardBorder = isDark ? "#1F2937" : "#F1F5F9";
  const subText = isDark ? "#94A3B8" : "#64748B";
  const pageBg = isDark ? "#0F172A" : "#F8FAFC";
  const titleColor = isDark ? "#F1F5F9" : "#0F172A";

  // routes
  const TO_MY: Href = "/channels/decision/my" as Href;
  const TO_SIM: Href = "/channels/decision/sim" as Href;
  const TO_HISTORY: Href = "/channels/decision/my?view=history" as Href;

  // --- Lightened gradients that STILL match card icon hues ---
  type GradientTuple = readonly [string, string];

  // Orange (custom decision): lighter -> base
  const ORANGE_GRAD: GradientTuple = ["#FCD34D", "#F59E0B"]; // amber-300 -> amber-500
  const ORANGE_GLOW = "rgba(245,158,11,0.28)";

  // Green (simulation): lighter -> base
  const GREEN_GRAD: GradientTuple = ["#A7F3D0", "#34D399"]; // emerald-200 -> emerald-400
  const GREEN_GLOW = "rgba(16,185,129,0.26)";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: pageBg }]}>
      <TopBar left="back" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Access - History Card */}
        <View style={styles.historySection}>
          <Link href={TO_HISTORY} asChild>
            <Pressable
              style={[
                styles.historyCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: isDark ? "#000000" : "#1F2937",
                },
              ]}
              android_ripple={{
                color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
              }}
            >
              <View style={styles.historyContent}>
                <View
                  style={[
                    styles.historyIcon,
                    { backgroundColor: isDark ? "#1E40AF20" : "#DBEAFE" },
                  ]}
                >
                  <Ionicons
                    name="time"
                    size={20}
                    color={isDark ? "#60A5FA" : "#2563EB"}
                  />
                </View>
                <View style={styles.historyText}>
                  <Text
                    style={[
                      styles.historyTitle,
                      { color: isDark ? "#F9FAFB" : "#111827" },
                    ]}
                  >
                    我的决策记录
                  </Text>
                </View>
                <View style={styles.chevronContainer}>
                  <Ionicons name="chevron-forward" size={20} color={subText} />
                </View>
              </View>
            </Pressable>
          </Link>
        </View>

        {/* Training Cards Section */}
        <View style={styles.cardsSection}>
          <Text style={[styles.sectionTitle, { color: titleColor }]}>
            开始决策练习
          </Text>

          <View style={styles.cardsGrid}>
            {/* Custom Decision Card */}
            <View
              style={[
                styles.decisionCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: isDark ? "#000000" : "#1F2937",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIcon,
                    { backgroundColor: isDark ? "#F59E0B20" : "#FEF3C7" },
                  ]}
                >
                  <Ionicons
                    name="create"
                    size={24}
                    color={isDark ? "#F59E0B" : "#D97706"}
                  />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: isDark ? "#F9FAFB" : "#111827" },
                    ]}
                  >
                    自定义决策练习
                  </Text>
                  <Text style={[styles.cardDescription, { color: subText }]}>
                    使用自身的例子来练习。例：去 A 公司还是 B 公司？
                  </Text>
                </View>
              </View>

              <View style={styles.cardButtonContainer}>
                <GlowPillButton
                  href={TO_MY}
                  label="马上开始 "
                  gradientColors={ORANGE_GRAD}
                  glowColor={ORANGE_GLOW}
                />
              </View>
            </View>

            {/* Simulation Card */}
            <View
              style={[
                styles.decisionCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  shadowColor: isDark ? "#000000" : "#1F2937",
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.cardIcon,
                    { backgroundColor: isDark ? "#10B98120" : "#D1FAE5" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="bookshelf"
                    size={24}
                    color={isDark ? "#34D399" : "#059669"}
                  />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: isDark ? "#F9FAFB" : "#111827" },
                    ]}
                  >
                    模拟场景训练
                  </Text>
                  <Text style={[styles.cardDescription, { color: subText }]}>
                    利用真实场景改编，代入主人翁视角做决策体验。
                  </Text>
                </View>
              </View>

              <View style={styles.cardButtonContainer}>
                <GlowPillButton
                  href={TO_SIM}
                  label="马上开始"
                  gradientColors={GREEN_GRAD}
                  glowColor={GREEN_GLOW}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Neon/Glow pill button – lighter scheme */
function GlowPillButton({
  href,
  label,
  gradientColors,
  glowColor,
}: {
  href: Href;
  label: string;
  gradientColors: readonly [string, string];
  glowColor: string;
}) {
  const haloPair = [glowColor, "transparent"] as const;

  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <View style={styles.glowWrap}>
            {/* Softer, tighter halo */}
            <LinearGradient
              colors={haloPair}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0 }}
              style={[
                styles.halo,
                {
                  opacity: pressed ? 0.7 : 0.9,
                  transform: [{ scale: pressed ? 0.99 : 1 }],
                },
              ]}
            />

            {/* Lighter filled surface */}
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.pill,
                Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOpacity: pressed ? 0.12 : 0.18,
                    shadowRadius: pressed ? 8 : 12,
                    shadowOffset: { width: 0, height: pressed ? 2 : 6 },
                  },
                  android: { elevation: pressed ? 2 : 4 },
                }) as any,
                { transform: [{ scale: pressed ? 0.985 : 1 }] },
              ]}
            >
              {/* Brighter top highlight for airy feel */}
              <LinearGradient
                colors={
                  [
                    "rgba(255,255,255,0.55)",
                    "rgba(255,255,255,0.15)",
                    "transparent",
                  ] as const
                }
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.pillHighlight}
              />
              <View style={styles.pillStroke} />
              <Text style={styles.pillText}>{label}</Text>
            </LinearGradient>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const PILL_HEIGHT = 56;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 24, gap: 32 },

  // History
  historySection: { gap: 12 },
  historyCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  historyContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  historyText: { flex: 1, gap: 4 },
  historyTitle: { fontSize: 17, fontWeight: "700" as const },
  chevronContainer: { padding: 4 },

  // Cards
  cardsSection: { gap: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
  },
  cardsGrid: { gap: 20 },
  decisionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleContainer: { flex: 1, gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: "700" as const, lineHeight: 24 },
  cardDescription: { fontSize: 15, fontWeight: "500" as const, lineHeight: 22 },
  cardButtonContainer: { marginTop: 4, alignItems: "stretch" },

  /* Glow pill button */
  glowWrap: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  halo: {
    position: "absolute",
    width: "100%",
    height: PILL_HEIGHT + 10,
    borderRadius: 999,
  },
  pill: {
    minHeight: PILL_HEIGHT,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  pillHighlight: {
    position: "absolute",
    top: 0,
    left: 2,
    right: 2,
    height: "50%",
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  pillStroke: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  pillText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
