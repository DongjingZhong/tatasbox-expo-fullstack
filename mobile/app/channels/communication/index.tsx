import TopBar from "@/components/ui/TopBar";
import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function CommunicationHome() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();

  // responsive square tile size (max 180, fits 2 per row with 16px side padding & 14px gap)
  const GAP = 14;
  const HPAD = 16;
  const tileSize = Math.floor(Math.min((width - HPAD * 2 - GAP) / 2, 180));

  // theme helpers

  const rippleColor = isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB";
  const cardShadow = isDark
    ? { shadowColor: "transparent", shadowOpacity: 0, elevation: 0 }
    : {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
      };

  const GREEN = "#059669";
  const AMBER = "#F59E0B";

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <TopBar left="back" />

      {/* 居中网格 */}
      <View
        style={[
          styles.grid,
          { paddingBottom: insets.bottom + 12, paddingHorizontal: HPAD },
        ]}
      >
        {/* 随机主题（淡灰底） */}
        <Pressable
          onPress={() => router.push("/channels/communication/random")}
          android_ripple={{ color: rippleColor }}
          style={({ pressed }) => [
            styles.tile,
            {
              width: tileSize,
              height: tileSize,
              backgroundColor: colors.card, // ← 白天/夜间都用主题的淡灰/深灰
              borderColor: colors.border,
              opacity: pressed ? 0.96 : 1,
            },
            cardShadow,
          ]}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="gift-outline" size={56} color={AMBER} />
            <View style={[styles.badge, { backgroundColor: AMBER }]}>
              <Text style={styles.badgeText}>?</Text>
            </View>
          </View>
          <Text style={[styles.tileTitle, { color: colors.text }]}>
            随机主题
          </Text>
        </Pressable>

        {/* 角色扮演（淡灰底） */}
        <Pressable
          onPress={() => router.push("/channels/communication/roleplay")}
          android_ripple={{ color: rippleColor }}
          style={({ pressed }) => [
            styles.tile,
            {
              width: tileSize,
              height: tileSize,
              backgroundColor: colors.card, // ← 白天/夜间都用主题的淡灰/深灰
              borderColor: colors.border,
              opacity: pressed ? 0.96 : 1,
            },
            cardShadow,
          ]}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="people-outline" size={56} color={GREEN} />
          </View>
          <Text style={[styles.tileTitle, { color: colors.text }]}>
            角色扮演
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // 居中容器（两张卡片）
  grid: {
    flex: 1,
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  tile: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconWrap: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: -4,
    top: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  tileTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "800",
  },
});
