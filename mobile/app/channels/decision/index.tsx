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

import TopBar from "@/components/ui/TopBar";
import { useTheme } from "@/providers/ThemeProvider";

export default function DecisionHome() {
  const { isDark } = useTheme();

  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const cardBorder = isDark ? "#1F2937" : "#F1F5F9";
  const subText = isDark ? "#94A3B8" : "#64748B";
  const pageBg = isDark ? "#0F172A" : "#F8FAFC";
  const titleColor = isDark ? "#F1F5F9" : "#0F172A";

  // Enhanced color palette with better contrast
  const primary = isDark ? "#3B82F6" : "#2563EB";
  const primaryEdge = isDark ? "#1E40AF" : "#1E3A8A";
  const accent = isDark ? "#10B981" : "#059669";
  const accentEdge = isDark ? "#047857" : "#065F46";

  // Typed routes as constants
  const TO_MY: Href = "/channels/decision/my" as Href;
  const TO_SIM: Href = "/channels/decision/sim" as Href;
  const TO_HISTORY: Href = "/channels/decision/my?view=history" as Href;

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
                    {
                      backgroundColor: isDark ? "#F59E0B20" : "#FEF3C7",
                    },
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

              <Play3DButton
                href={TO_MY}
                label="开始练习 "
                topColor={primary}
                edgeColor={primaryEdge}
                lightText
              />
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
                    {
                      backgroundColor: isDark ? "#10B98120" : "#D1FAE5",
                    },
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

              <Play3DButton
                href={TO_SIM}
                label="探索场景"
                topColor={accent}
                edgeColor={accentEdge}
                lightText
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Enhanced 3D Button Component with better visual feedback */
function Play3DButton({
  href,
  label,
  topColor,
  edgeColor,
  lightText,
}: {
  href: Href;
  label: string;
  topColor: string;
  edgeColor: string;
  lightText?: boolean;
}) {
  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <View
            style={[
              styles.btn3DWrap,
              Platform.select({
                android: {
                  elevation: pressed ? 2 : 6,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                ios: {
                  shadowColor: "#000",
                  shadowOpacity: pressed ? 0.1 : 0.15,
                  shadowRadius: pressed ? 8 : 12,
                  shadowOffset: { width: 0, height: pressed ? 2 : 6 },
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                default: {},
              }) as any,
            ]}
          >
            {/* Edge layer for 3D effect */}
            <View
              style={[
                styles.btn3DEdge,
                {
                  backgroundColor: edgeColor,
                  top: pressed ? 3 : 6,
                  height: pressed ? 8 : 12,
                },
              ]}
            />

            {/* Top surface */}
            <View
              style={[
                styles.btn3DTop,
                {
                  backgroundColor: topColor,
                  transform: [{ translateY: pressed ? 3 : 0 }],
                },
              ]}
            >
              <Text
                style={[
                  styles.btn3DText,
                  { color: lightText ? "#FFFFFF" : "#FFFFFF" },
                ]}
              >
                {label}
              </Text>
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 32,
  },

  // Header Section
  headerSection: {
    gap: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },

  // History Section
  historySection: {
    gap: 12,
  },
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
  historyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  historyText: {
    flex: 1,
    gap: 4,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  historySubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  chevronContainer: {
    padding: 4,
  },

  // Cards Section
  cardsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  cardsGrid: {
    gap: 20,
  },
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleContainer: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },

  // Card Features
  cardFeatures: {
    flexDirection: "row",
    gap: 12,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  featureText: {
    fontSize: 13,
    fontWeight: "600",
  },

  /* Enhanced 3D Button */
  btn3DWrap: {
    position: "relative",
    borderRadius: 16,
  },
  btn3DEdge: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: 16,
  },
  btn3DTop: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btn3DText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.25,
  },
});
