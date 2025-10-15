import React, { useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

const calcAge = (iso: string) => {
  try {
    const [y, m, d] = iso.split("-").map((v) => parseInt(v, 10));
    const birth = new Date(y, m - 1, d);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const md =
      now.getMonth() - birth.getMonth() || now.getDate() - birth.getDate();
    if (md < 0) age -= 1;
    return age;
  } catch {
    return null;
  }
};

export default function SelfExploreHome() {
  const { name, birthday, job, interests } = useLocalSearchParams<{
    name?: string;
    birthday?: string;
    job?: string;
    interests?: string;
  }>();

  const age = useMemo(
    () => (birthday ? calcAge(String(birthday)) : null),
    [birthday]
  );

  const interestList = String(interests || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>嗨，{name || "朋友"} 👋</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>你的资料</Text>
          <Text style={styles.row}>生日：{birthday || "—"}</Text>
          <Text style={styles.row}>年龄：{age !== null ? `${age}` : "—"}</Text>
          <Text style={styles.row}>职业：{job || "—"}</Text>
          <Text style={[styles.row, { marginBottom: 8 }]}>兴趣：</Text>
          <View style={styles.tagsWrap}>
            {interestList.length ? (
              interestList.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.row, { opacity: 0.6 }]}>—</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>准备好开始自我探索了吗？</Text>
          <Text style={[styles.row, { marginTop: 8, opacity: 0.9 }]}>
            接下来我会用一些轻量的问题和小练习，帮你更清晰地看见当下的目标、阻碍与动力。
          </Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              // TODO: navigate to your first exploration flow/page
              // e.g. router.push("/channels/self-explore/flow");
            }}
          >
            <Text style={styles.primaryBtnText}>开始第一轮练习</Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
            <Text style={styles.secondaryBtnText}>返回修改资料</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0F13" },
  container: { padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sectionTitle: { color: "#E5E7EB", fontSize: 16, fontWeight: "700" },
  row: { color: "#D1D5DB", fontSize: 14, marginTop: 6 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  tagText: { color: "#F3F4F6", fontSize: 13 },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: "#FACC15",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#111827", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    marginTop: 10,
    borderColor: "#FACC15",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#FACC15", fontSize: 15, fontWeight: "600" },
});
