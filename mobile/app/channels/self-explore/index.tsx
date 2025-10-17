// app/self-explore/index.tsx
// All code comments in English only.

import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import TopBar from "@/components/ui/TopBar";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuthProfile } from "@/src/store/useAuthProfile"; // your store file

export default function SelfExploreHome() {
  const router = useRouter();
  const { isDark } = useTheme();

  // Select only the fields we need to avoid unnecessary rerenders
  const profile = useAuthProfile((s) => s.profile);
  const hydrated = useAuthProfile((s) => s.hydrated);
  const hydrate = useAuthProfile((s) => s.hydrate);

  // Hydrate profile once when the screen mounts
  useEffect(() => {
    if (!hydrated) {
      // Load from AsyncStorage into Zustand store
      void hydrate();
    }
  }, [hydrated, hydrate]);

  // Simple theme tokens
  const pageBg = isDark ? "#0F172A" : "#F8FAFC";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const cardBorder = isDark ? "#1F2937" : "#E5E7EB";
  const title = isDark ? "#F8FAFC" : "#0F172A";
  const sub = isDark ? "#94A3B8" : "#6B7280";
  const value = isDark ? "#E5E7EB" : "#111827";
  const accent = "#FACC15";

  // Derived UI helpers
  const jobText = useMemo(() => {
    if (!profile) return "";
    // Prefer customJob if present, otherwise fallback to job
    // Adjust to your schema if needed
    // @ts-ignore - tolerate unknown keys
    return profile.customJob?.trim?.() || profile.job || "";
  }, [profile]);

  // Render loading state while hydrating
  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: pageBg }]}>
        <TopBar
          title={<Text style={{ color: title, fontSize: 18 }}>自我探索</Text>}
        />
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: sub }}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const Header = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerTitle, { color: title }]}>自我探索</Text>
      <View style={styles.headerActions}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.push("/profile")}
          android_ripple={{ color: "#00000020", borderless: true }}
        >
          <Ionicons name="create-outline" size={20} color={accent} />
          <Text style={[styles.iconBtnText, { color: accent }]}>编辑资料</Text>
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          onPress={() => void hydrate()}
          android_ripple={{ color: "#00000020", borderless: true }}
        >
          <Ionicons name="refresh-outline" size={20} color={accent} />
          <Text style={[styles.iconBtnText, { color: accent }]}>重新加载</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: pageBg }]}>
      <TopBar
        title={<Text style={{ color: title, fontSize: 18 }}>自我探索</Text>}
      />
      <ScrollView contentContainerStyle={styles.scrollBody} bounces>
        <Header />

        {/* Profile Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          {profile ? (
            <>
              {/* Avatar row */}
              <View style={styles.avatarRow}>
                <View style={styles.avatarWrap}>
                  {profile.avatar ? (
                    <Image
                      source={{ uri: profile.avatar }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Ionicons name="person-outline" size={32} color={sub} />
                    </View>
                  )}
                </View>
                <View style={styles.nameWrap}>
                  <Text style={[styles.name, { color: value }]}>
                    {profile.name || "未命名用户"}
                  </Text>
                  <Text style={{ color: sub, marginTop: 4 }}>
                    {profile.email || "暂无邮箱"}
                  </Text>
                </View>
              </View>

              {/* Fields */}
              <View style={styles.divider} />
              <Field
                label="语言"
                value={profile.language || "未设置"}
                valueColor={value}
                labelColor={sub}
              />
              <Field
                label="生日"
                value={profile.birthday || "未设置"}
                valueColor={value}
                labelColor={sub}
              />
              <Field
                label="职业"
                value={jobText || "未设置"}
                valueColor={value}
                labelColor={sub}
              />
              <Field
                label="兴趣"
                value={
                  Array.isArray(profile.interests) &&
                  profile.interests.length > 0
                    ? profile.interests.join(", ")
                    : "未设置"
                }
                valueColor={value}
                labelColor={sub}
              />
              {profile.quote ? (
                <>
                  <View style={styles.divider} />
                  <Text style={{ color: sub, marginBottom: 6 }}>
                    座右铭 / 名言
                  </Text>
                  <Text style={{ color: value, lineHeight: 22 }}>
                    {profile.quote}
                  </Text>
                </>
              ) : null}
            </>
          ) : (
            // Empty state
            <View style={styles.emptyWrap}>
              <Ionicons
                name="information-circle-outline"
                size={28}
                color={sub}
              />
              <Text style={{ color: sub, marginTop: 8 }}>
                当前设备没有找到用户资料。
              </Text>
              <Pressable
                style={[styles.ctaBtn, { backgroundColor: accent }]}
                onPress={() => router.push("/profile")}
              >
                <Text style={styles.ctaBtnText}>去填写资料</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Explore tip */}
        <View
          style={[
            styles.tipCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Ionicons name="bulb-outline" size={18} color={accent} />
          <Text
            style={{ marginLeft: 8, color: value, flex: 1, lineHeight: 20 }}
          >
            你的“自我探索”问题将参考以上资料进行个性化提问。完善资料可获得更贴合你的探索路径。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  labelColor,
  valueColor,
}: {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.fieldLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  iconBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    marginRight: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000010",
  },
  nameWrap: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    opacity: 0.12,
    backgroundColor: "#94A3B8",
    marginVertical: 12,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginVertical: 6,
    gap: 12,
  },
  fieldLabel: {
    width: 72,
    fontSize: 14,
  },
  fieldValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  ctaBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  ctaBtnText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },
  tipCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
});
